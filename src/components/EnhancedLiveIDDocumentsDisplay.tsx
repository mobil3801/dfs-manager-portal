import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FileText, RefreshCw, AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import EnhancedLiveIDDocumentViewer from '@/components/EnhancedLiveIDDocumentViewer';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  ID: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  station: string;
  shift: string;
  hire_date: string;
  salary: number;
  is_active: boolean;
  employment_status: string;
  created_by: number;
  profile_image_id?: number | null;
  date_of_birth?: string;
  current_address?: string;
  mailing_address?: string;
  reference_name?: string;
  id_document_type?: string;
  id_document_file_id?: number | null;
  id_document_2_file_id?: number | null;
  id_document_3_file_id?: number | null;
  id_document_4_file_id?: number | null;
}

interface EnhancedLiveIDDocumentsDisplayProps {
  employee: Employee;
  isAdminUser: boolean;
  onRefresh?: () => void;
  allowDelete?: boolean;
  showPreview?: boolean;
}

const EnhancedLiveIDDocumentsDisplay: React.FC<EnhancedLiveIDDocumentsDisplayProps> = ({
  employee,
  isAdminUser,
  onRefresh,
  allowDelete = false,
  showPreview = true
}) => {
  const [localEmployee, setLocalEmployee] = useState<Employee>(employee);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { toast } = useToast();

  // Update local state when employee prop changes
  useEffect(() => {
    setLocalEmployee(employee);
  }, [employee]);

  // Check connection status on mount and periodically
  useEffect(() => {
    checkConnectionStatus();

    // Set up periodic connection checks
    const interval = setInterval(checkConnectionStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setConnectionStatus('checking');

      // Test connection with a simple API call
      const { error } = (await Promise.race([
      globalThis.ezsite.apis.tablePage('11727', {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'ID', op: 'Equal', value: employee.ID }]
      }),
      new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )]
      )) as {error: string;};

      if (error) {
        console.error('[EnhancedLiveIDDocumentsDisplay] Connection test failed:', error);
        setConnectionStatus('error');
      } else {
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error('[EnhancedLiveIDDocumentsDisplay] Connection test error:', error);
      setConnectionStatus('error');
    }
  };

  const documents = [
  {
    fileId: localEmployee.id_document_file_id,
    label: `${localEmployee.id_document_type || 'ID Document'} 1`,
    key: 'id_document_file_id',
    documentNumber: 1
  },
  {
    fileId: localEmployee.id_document_2_file_id,
    label: `${localEmployee.id_document_type || 'ID Document'} 2`,
    key: 'id_document_2_file_id',
    documentNumber: 2
  },
  {
    fileId: localEmployee.id_document_3_file_id,
    label: `${localEmployee.id_document_type || 'ID Document'} 3`,
    key: 'id_document_3_file_id',
    documentNumber: 3
  },
  {
    fileId: localEmployee.id_document_4_file_id,
    label: `${localEmployee.id_document_type || 'ID Document'} 4`,
    key: 'id_document_4_file_id',
    documentNumber: 4
  }].
  filter((doc) => doc.fileId);

  const handleRefresh = async () => {
    if (!onRefresh) return;

    setRefreshing(true);
    try {
      await onRefresh();
      await checkConnectionStatus();
      setLastRefresh(new Date());
      toast({
        title: "Refreshed",
        description: "Document display has been refreshed successfully"
      });
    } catch (error) {
      console.error('[EnhancedLiveIDDocumentsDisplay] Error refreshing:', error);
      toast({
        title: "Refresh Error",
        description: "Failed to refresh documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteDocument = async (documentKey: string, fileId: number) => {
    if (!allowDelete || !isAdminUser) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete documents",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log(`[EnhancedLiveIDDocumentsDisplay] Deleting document: ${documentKey}, fileId: ${fileId}`);

      // Update the employee record to remove the file reference
      const updateData = {
        ID: localEmployee.ID,
        [documentKey]: null
      };

      const { error } = await globalThis.ezsite.apis.tableUpdate('11727', updateData);
      if (error) throw new Error(error);

      // Update local state immediately
      setLocalEmployee((prev) => ({
        ...prev,
        [documentKey]: null
      }));

      // Clean up file storage
      try {
        const { data: fileData, error: fetchError } = await globalThis.ezsite.apis.tablePage('26928', {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'store_file_id', op: 'Equal', value: fileId }]
        });

        if (!fetchError && fileData && fileData.List && fileData.List.length > 0) {
          const { error: deleteError } = await globalThis.ezsite.apis.tableDelete('26928', {
            ID: fileData.List[0].id
          });
          if (deleteError) {
            console.error('[EnhancedLiveIDDocumentsDisplay] Error deleting file from storage:', deleteError);
          } else {
            console.log(`[EnhancedLiveIDDocumentsDisplay] Successfully deleted file ${fileId} from storage`);
          }
        }
      } catch (fileError) {
        console.error('[EnhancedLiveIDDocumentsDisplay] Error cleaning up file storage:', fileError);
      }

      toast({
        title: "Document Deleted",
        description: "The document has been permanently deleted",
        variant: "destructive"
      });

      // Refresh parent component if callback provided
      if (onRefresh) {
        onRefresh();
      }

    } catch (error) {
      console.error('[EnhancedLiveIDDocumentsDisplay] Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (documents.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-8">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ID Documents</h3>
          <p className="text-sm text-gray-500 mb-4">
            No ID documents have been uploaded for this employee yet.
          </p>
          
          {connectionStatus === 'error' &&
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-yellow-700 mb-2">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">Connection Issues</span>
              </div>
              <p className="text-xs text-yellow-600 mb-3">
                There may be connectivity issues. Documents might not load properly.
              </p>
              <Button
              variant="outline"
              size="sm"
              onClick={checkConnectionStatus}
              className="bg-white">
                <RefreshCw className="w-4 h-4 mr-1" />
                Test Connection
              </Button>
            </div>
          }
        </CardContent>
      </Card>);

  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  ID Documents ({documents.length})
                </h3>
                <p className="text-sm text-gray-500">
                  {localEmployee.first_name} {localEmployee.last_name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-8">
                <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              {/* Connection Status */}
              <Badge
                variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}
                className="text-xs">
                {connectionStatus === 'checking' &&
                <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Checking...
                  </>
                }
                {connectionStatus === 'connected' &&
                <>
                    <Wifi className="w-3 h-3 mr-1" />
                    Live Preview
                  </>
                }
                {connectionStatus === 'error' &&
                <>
                    <WifiOff className="w-3 h-3 mr-1" />
                    Connection Error
                  </>
                }
              </Badge>
              
              {isAdminUser &&
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Admin Access
                </Badge>
              }
            </div>
          </div>
          
          {/* Document Type Information */}
          {localEmployee.id_document_type &&
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  Document Type: {localEmployee.id_document_type}
                </Badge>
                <span className="text-xs text-blue-600">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
              </div>
            </div>
          }
          
          {/* Connection Warning */}
          {connectionStatus === 'error' &&
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-700 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Connection Issues Detected</span>
              </div>
              <p className="text-xs text-yellow-600 mb-2">
                There may be connectivity issues affecting document loading. Documents may take longer to load or show errors.
              </p>
              <Button
              variant="outline"
              size="sm"
              onClick={checkConnectionStatus}
              className="bg-white">
                <RefreshCw className="w-4 h-4 mr-1" />
                Test Connection
              </Button>
            </div>
          }
        </CardHeader>
      </Card>

      {/* Documents Grid */}
      {showPreview &&
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc, index) =>
        <EnhancedLiveIDDocumentViewer
          key={`${doc.fileId}-${index}-${lastRefresh.getTime()}`}
          fileId={doc.fileId}
          label={doc.label}
          documentType={localEmployee.id_document_type || 'Driving License'}
          isAdminUser={isAdminUser}
          size="lg"
          className="border-2 border-gray-200 hover:border-blue-300 transition-colors rounded-lg overflow-hidden"
          showDeleteButton={allowDelete && isAdminUser}
          onDelete={() => doc.fileId && handleDeleteDocument(doc.key, doc.fileId)} />

        )}
        </div>
      }

      {/* Information Panel */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Enhanced live preview with real-time ID display</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Improved error handling and automatic retry mechanisms</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Connection monitoring and status indicators</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Click on any document to view in full screen</span>
            </div>
            {isAdminUser ?
            <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span><strong>Admin:</strong> Download and delete functionality available</span>
              </div> :

            <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span>Download and delete access restricted to administrators</span>
              </div>
            }
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default EnhancedLiveIDDocumentsDisplay;