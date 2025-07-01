import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Folder,
  Clock,
  Download,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2
} from 'lucide-react';
import draftSavingService from '@/utils/draftSaving';

interface DraftManagementDialogProps {
  open: boolean;
  onClose: () => void;
  onLoadDraft: (draftData: any, station: string, reportDate: string) => void;
  currentStation: string;
  currentReportDate: string;
}

interface DraftItem {
  station: string;
  reportDate: string;
  draftInfo: {
    savedAt: Date;
    expiresAt: Date;
    timeRemainingHours: number;
  };
}

const DraftManagementDialog: React.FC<DraftManagementDialogProps> = ({
  open,
  onClose,
  onLoadDraft,
  currentStation,
  currentReportDate
}) => {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ count: 0, sizeInKB: 0 });

  const loadDrafts = async () => {
    setIsLoading(true);
    try {
      const allDrafts = draftSavingService.getAllDrafts();
      setDrafts(allDrafts);
      
      const usage = draftSavingService.getTotalDraftStorageUsage();
      setStorageInfo({ count: usage.count, sizeInKB: usage.sizeInKB });
    } catch (error) {
      console.error('Error loading drafts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load drafts',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadDrafts();
    }
  }, [open]);

  const handleLoadDraft = (draft: DraftItem) => {
    try {
      const draftData = draftSavingService.loadDraft(draft.station, draft.reportDate);
      if (draftData) {
        onLoadDraft(draftData, draft.station, draft.reportDate);
        onClose();
        toast({
          title: 'Draft Loaded',
          description: `Draft from ${draft.station} on ${draft.reportDate} has been loaded`
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load draft data',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to load draft',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteDraft = (draft: DraftItem) => {
    try {
      const success = draftSavingService.deleteDraft(draft.station, draft.reportDate);
      if (success) {
        loadDrafts(); // Refresh the list
        toast({
          title: 'Draft Deleted',
          description: `Draft from ${draft.station} on ${draft.reportDate} has been deleted`
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete draft',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete draft',
        variant: 'destructive'
      });
    }
  };

  const handleCleanupExpired = () => {
    try {
      const cleanedCount = draftSavingService.cleanupExpiredDrafts();
      loadDrafts(); // Refresh the list
      toast({
        title: 'Cleanup Complete',
        description: `${cleanedCount} expired drafts have been removed`
      });
    } catch (error) {
      console.error('Error cleaning up drafts:', error);
      toast({
        title: 'Error',
        description: 'Failed to cleanup expired drafts',
        variant: 'destructive'
      });
    }
  };

  const formatTimeRemaining = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.floor(hours * 60);
      return `${minutes}m`;
    }
    return `${Math.floor(hours)}h ${Math.floor((hours % 1) * 60)}m`;
  };

  const isCurrentDraft = (draft: DraftItem) => {
    return draft.station === currentStation && draft.reportDate === currentReportDate;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Draft Management
          </DialogTitle>
          <DialogDescription>
            Manage saved sales report drafts. Drafts expire after 12 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Storage Info */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{storageInfo.count}</span> drafts saved
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{storageInfo.sizeInKB} KB</span> used
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadDrafts}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCleanupExpired}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Cleanup Expired
              </Button>
            </div>
          </div>

          {/* Drafts List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading drafts...
            </div>
          ) : drafts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Folder className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Drafts Found</h3>
                <p className="text-gray-500">
                  You don't have any saved drafts. Drafts are automatically saved when you use the "Save as Draft" feature.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft, index) => (
                <Card key={index} className={`${isCurrentDraft(draft) ? 'border-blue-300 bg-blue-50' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-gray-600" />
                        <div>
                          <CardTitle className="text-base">{draft.station}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <CardDescription>{draft.reportDate}</CardDescription>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCurrentDraft(draft) && (
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            Current Form
                          </Badge>
                        )}
                        <Badge 
                          variant={draft.draftInfo.timeRemainingHours > 2 ? 'default' : 'destructive'}
                          className="flex items-center gap-1"
                        >
                          <Clock className="w-3 h-3" />
                          {formatTimeRemaining(draft.draftInfo.timeRemainingHours)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Saved: {draft.draftInfo.savedAt.toLocaleString()}</div>
                        <div>Expires: {draft.draftInfo.expiresAt.toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadDraft(draft)}
                          className="flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Load
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDraft(draft)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Warning for expiring drafts */}
          {drafts.some(draft => draft.draftInfo.timeRemainingHours < 2) && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Some drafts will expire soon. Load them now to preserve your work.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DraftManagementDialog;