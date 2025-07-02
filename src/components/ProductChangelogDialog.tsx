import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { History, Clock, User, FileText, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChangelogEntry {
  ID: number;
  product_id: number;
  field_name: string;
  old_value: string;
  new_value: string;
  change_timestamp: string;
  changed_by: number;
  change_type: string;
  change_summary: string;
}

interface ProductChangelogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
}

const ProductChangelogDialog: React.FC<ProductChangelogDialogProps> = ({
  isOpen,
  onClose,
  productId,
  productName
}) => {
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen && productId) {
      fetchChangelog();
    }
  }, [isOpen, productId]);

  const fetchChangelog = async () => {
    setLoading(true);
    try {
      const { data, error } = await window.ezsite.apis.tablePage('24010', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'change_timestamp',
        IsAsc: false,
        Filters: [
        { name: 'product_id', op: 'Equal', value: productId }]

      });

      if (error) throw error;

      setChangelog(data?.List || []);
    } catch (error) {
      console.error('Error fetching changelog:', error);
      toast({
        title: "Error",
        description: "Failed to load product changelog",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshChangelog = async () => {
    setRefreshing(true);
    await fetchChangelog();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Changelog updated successfully"
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  const formatFieldName = (fieldName: string) => {
    return fieldName.
    replace(/_/g, ' ').
    replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType?.toLowerCase()) {
      case 'create':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getValueDisplay = (value: string, fieldName: string) => {
    if (!value || value.trim() === '') return '(empty)';

    // Format monetary values
    if (fieldName.includes('price') || fieldName.includes('amount')) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return `$${numValue.toFixed(2)}`;
      }
    }

    // Format percentages
    if (fieldName.includes('margin') || fieldName.includes('percentage')) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return `${numValue.toFixed(2)}%`;
      }
    }

    // Format dates
    if (fieldName.includes('date')) {
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return value;
      }
    }

    return value;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Product Changelog</span>
          </DialogTitle>
          <DialogDescription>
            Complete change history for "{productName}"
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <FileText className="w-3 h-3" />
              <span>{changelog.length} entries</span>
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshChangelog}
            disabled={refreshing}>

            {refreshing ?
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :

            <RefreshCw className="w-4 h-4 mr-2" />
            }
            Refresh
          </Button>
        </div>

        <ScrollArea className="flex-1 max-h-[60vh]">
          {loading ?
          <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading changelog...</span>
            </div> :
          changelog.length === 0 ?
          <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <History className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Changes Found</h3>
                <p className="text-gray-500 text-center">
                  This product has no recorded changes yet. Changes will appear here when the product is edited.
                </p>
              </CardContent>
            </Card> :

          <div className="space-y-4">
              {changelog.map((entry, index) =>
            <Card key={entry.ID} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getChangeTypeColor(entry.change_type)}>
                          {entry.change_type || 'Update'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatFieldName(entry.field_name)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(entry.change_timestamp)}</span>
                      </div>
                    </div>
                    {entry.change_summary &&
                <CardDescription className="mt-1">
                        {entry.change_summary}
                      </CardDescription>
                }
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 uppercase">Previous Value</p>
                        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                          {getValueDisplay(entry.old_value, entry.field_name)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 uppercase">New Value</p>
                        <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                          {getValueDisplay(entry.new_value, entry.field_name)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>Changed by User ID: {entry.changed_by}</span>
                    </div>
                  </CardContent>
                </Card>
            )}
            </div>
          }
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>);

};

export default ProductChangelogDialog;