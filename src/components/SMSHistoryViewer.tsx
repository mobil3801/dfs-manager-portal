import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { History, Search, Filter, Download, RefreshCw } from 'lucide-react';

interface SMSHistoryRecord {
  id: number;
  license_id: number;
  contact_id: number;
  mobile_number: string;
  message_content: string;
  sent_date: string;
  delivery_status: string;
  days_before_expiry: number;
  created_by: number;
}

const SMSHistoryViewer: React.FC = () => {
  const [history, setHistory] = useState<SMSHistoryRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<SMSHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [history, searchTerm, statusFilter, typeFilter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage('12613', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'sent_date',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;
      setHistory(data?.List || []);
    } catch (error) {
      console.error('Error loading SMS history:', error);
      toast({
        title: "Error",
        description: "Failed to load SMS history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = [...history];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.mobile_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.message_content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => 
        record.delivery_status.toLowerCase().includes(statusFilter.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      if (typeFilter === 'custom') {
        filtered = filtered.filter(record => record.license_id === 0);
      } else if (typeFilter === 'alerts') {
        filtered = filtered.filter(record => record.license_id > 0);
      } else if (typeFilter === 'test') {
        filtered = filtered.filter(record => 
          record.days_before_expiry === 0 && record.license_id === 0
        );
      }
    }

    setFilteredHistory(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('sent') || statusLower.includes('delivered')) {
      return <Badge variant="default">✅ {status}</Badge>;
    } else if (statusLower.includes('failed') || statusLower.includes('error')) {
      return <Badge variant="destructive">❌ {status}</Badge>;
    } else if (statusLower.includes('pending') || statusLower.includes('queued')) {
      return <Badge variant="secondary">⏳ {status}</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const getMessageType = (record: SMSHistoryRecord) => {
    if (record.license_id === 0 && record.days_before_expiry === 0) {
      return <Badge variant="outline" className="text-blue-600">📱 Custom SMS</Badge>;
    } else if (record.license_id === 0) {
      return <Badge variant="outline" className="text-green-600">🧪 Test SMS</Badge>;
    } else {
      return <Badge variant="outline" className="text-orange-600">⚠️ License Alert</Badge>;
    }
  };

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Phone Number', 'Message', 'Status', 'Type'].join(','),
      ...filteredHistory.map(record => [
        new Date(record.sent_date).toLocaleDateString(),
        record.mobile_number,
        `"${record.message_content.replace(/"/g, '""')}"`,
        record.delivery_status,
        record.license_id === 0 ? 'Custom/Test' : 'License Alert'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sms_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${filteredHistory.length} SMS records`
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <History className="w-5 h-5 mr-2" />
            SMS History ({filteredHistory.length})
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button onClick={loadHistory} size="sm" variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportHistory} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search phone numbers or messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="sent">Sent Successfully</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="custom">Custom SMS</SelectItem>
              <SelectItem value="alerts">License Alerts</SelectItem>
              <SelectItem value="test">Test Messages</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* History Table */}
        {filteredHistory.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(record.sent_date).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {new Date(record.sent_date).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {record.mobile_number}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="text-sm truncate" title={record.message_content}>
                          {record.message_content.length > 50 
                            ? `${record.message_content.substring(0, 50)}...`
                            : record.message_content
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {record.message_content.length} characters
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getMessageType(record)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record.delivery_status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No SMS History</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No messages match your current filters'
                : 'SMS delivery history will appear here once you start sending messages'
              }
            </p>
            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SMSHistoryViewer;