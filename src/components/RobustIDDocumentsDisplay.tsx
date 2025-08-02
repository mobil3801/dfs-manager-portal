import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FileText, RefreshCw, AlertTriangle, CheckCircle, Wifi, WifiOff, Server, Database } from 'lucide-react';
import RobustIDDocumentViewer from '@/components/RobustIDDocumentViewer';
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

interface RobustIDDocumentsDisplayProps {
  employee: Employee;
  isAdminUser: boolean;
  onRefresh?: () => void;
  allowDelete?: boolean;
  showPreview?: boolean;
}

const RobustIDDocumentsDisplay: React.FC<RobustIDDocumentsDisplayProps> = ({
  employee,
  isAdminUser,
  onRefresh,
  allowDelete = false,
  showPreview = true
}) => {
  const [localEmployee, setLocalEmployee] = useState<Employee>(employee);
  const [refreshing, setRefreshing] = useState(false);
  const [systemStatus, setSystemStatus] = useState<{
    api: 'checking' | 'connected' | 'error';
    database: 'checking' | 'connected' | 'error';
    storage: 'checking' | 'connected' | 'error';
  }>({
    api: 'checking',
    database: 'checking',
    storage: 'checking'
  });
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [successfulRetries, setSuccessfulRetries] = useState(0);
  const { toast } = useToast();

  // Update local state when employee prop changes
  useEffect(() => {
    setLocalEmployee(employee);
  }, [employee]);

  // Check system status on mount and periodically
  useEffect(() => {
    checkSystemStatus();

    // Set up periodic system checks
    const interval = setInterval(checkSystemStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = useCallback(async () => {
    console.log('[RobustIDDocumentsDisplay] Checking system status...');

    // Test API connectivity
    setSystemStatus(prev => ({ ...prev, api: 'checking' }));
    try {
      const apiResponse = await Promise.race([
        window.ezsite.apis.tablePage('11727', {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'ID', op: 'Equal', value: employee.ID }]
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('API timeout')), 5000)
        )
      ]) as {error?: string};

      setSystemStatus(prev => ({ 
        ...prev, 
        api: apiResponse.error ? 'error' : 'connected' 
      }));
    } catch (error) {
      console.error('[RobustIDDocumentsDisplay] API test failed:', error);
      setSystemStatus(prev => ({ ...prev, api: 'error' }));
    }

    // Test database connectivity
    setSystemStatus(prev => ({ ...prev, database: 'checking' }));
    try {
      const dbResponse = await Promise.race([
        window.ezsite.apis.tablePage('26928', {
          PageNo: 1,
          PageSize: 1,
          Filters: []
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        )
      ]) as {error?: string};

      setSystemStatus(prev => ({ 
        ...prev, 
        database: dbResponse.error ? 'error' : 'connected' 
      }));
    } catch (error) {
      console.error('[RobustIDDocumentsDisplay] Database test failed:', error);
      setSystemStatus(prev => ({ ...prev, database: 'error' }));
    }

    // Test storage connectivity (if we have file IDs)
    setSystemStatus(prev => ({ ...prev, storage: 'checking' }));
    const hasFiles = [
      employee.id_document_file_id,
      employee.id_document_2_file_id,
      employee.id_document_3_file_id,
      employee.id_document_4_file_id
    ].some(id => id);

    if (hasFiles) {
      try {
        const testFileId = employee.id_document_file_id || 
                          employee.id_document_2_file_id || 
                          employee.id_document_3_file_id || 
                          employee.id_document_4_file_id;

        if (testFileId) {
          const storageResponse = await Promise.race([
            window.ezsite.apis.getUploadUrl(testFileId),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Storage timeout')), 8000)
            )
          ]) as {error?: string};

          setSystemStatus(prev => ({ 
            ...prev, 
            storage: storageResponse.error ? 'error' : 'connected' 
          }));
        } else {
          setSystemStatus(prev => ({ ...prev, storage: 'connected' }));
        }
      } catch (error) {
        console.error('[RobustIDDocumentsDisplay] Storage test failed:', error);
        setSystemStatus(prev => ({ ...prev, storage: 'error' }));
      }
    } else {
      setSystemStatus(prev => ({ ...prev, storage: 'connected' }));
    }
  }, [employee]);

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
    }
  ].filter((doc) => doc.fileId);

  const handleRefresh = async () => {
    if (!onRefresh) return;

    setRefreshing(true);
    try {
      await onRefresh();
      await checkSystemStatus();
      setLastRefresh(new Date());
      toast({
        title: 'Refreshed',
        description: 'Document display has been refreshed successfully'
      });
    } catch (error) {
      console.error('[RobustIDDocumentsDisplay] Error refreshing:', error);
      toast({
        title: 'Refresh Error',
        description: 'Failed to refresh documents. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteDocument = async (documentKey: string, fileId: number) => {
    if (!allowDelete || !isAdminUser) {
      toast({
        title: 'Access Denied',
        description: "You don't have permission to delete documents",
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log(`[RobustIDDocumentsDisplay] Deleting document: ${documentKey}, fileId: ${fileId}`);

      // Update the employee record to remove the file reference
      const updateData = {
        ID: localEmployee.ID,
        [documentKey]: null
      };

      const { error } = await window.ezsite.apis.tableUpdate('11727', updateData);
      if (error) throw new Error(error);

      // Update local state immediately
      setLocalEmployee((prev) => ({
        ...prev,
        [documentKey]: null
      }));

      // Clean up file storage
      try {
        const { data: fileData, error: fetchError } = await window.ezsite.apis.tablePage('26928', {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'store_file_id', op: 'Equal', value: fileId }]
        });

        if (!fetchError && fileData && fileData.List && fileData.List.length > 0) {
          const { error: deleteError } = await window.ezsite.apis.tableDelete('26928', {
            ID: fileData.List[0].id
          });
          if (deleteError) {
            console.error('[RobustIDDocumentsDisplay] Error deleting file from storage:', deleteError);
          } else {
            console.log(`[RobustIDDocumentsDisplay] Successfully deleted file ${fileId} from storage`);
          }
        }
      } catch (fileError) {
        console.error('[RobustIDDocumentsDisplay] Error cleaning up file storage:', fileError);
      }

      toast({
        title: 'Document Deleted',
        description: 'The document has been permanently deleted',
        variant: 'destructive'
      });

      // Refresh parent component if callback provided
      if (onRefresh) {
        onRefresh();
      }

    } catch (error) {
      console.error('[RobustIDDocumentsDisplay] Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleRetrySuccess = () => {
    setSuccessfulRetries(prev => prev + 1);
    toast({
      title: 'Document Loaded',
      description: 'Document loaded successfully after retry',
    });
  };

  const getSystemStatusColor = (status: 'checking' | 'connected' | 'error') => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'checking': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getSystemStatusIcon = (status: 'checking' | 'connected' | 'error') => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'checking': return <RefreshCw className="w-4 h-4 animate-spin" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const overallStatus = systemStatus.api === 'connected' && 
                       systemStatus.database === 'connected' && 
                       systemStatus.storage === 'connected' 
                       ? 'connected' : 'error';

  if (documents.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-8">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ID Documents</h3>
          <p className="text-sm text-gray-500 mb-4">
            No ID documents have been uploaded for this employee yet.
          </p>
          
          {/* System Status for No Documents */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center space-x-4 mb-3">
              <div className={`flex items-center space-x-1 ${getSystemStatusColor(systemStatus.api)}`}>
                {getSystemStatusIcon(systemStatus.api)}
                <span className="text-sm">API</span>
              </div>
              <div className={`flex items-center space-x-1 ${getSystemStatusColor(systemStatus.database)}`}>
                <Database className="w-4 h-4" />
                <span className="text-sm">Database</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkSystemStatus}
              className="bg-white">
              <RefreshCw className="w-4 h-4 mr-1" />
              Check System Status
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header Card */}
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
              
              {/* System Status Indicator */}
              <Badge
                variant={overallStatus === 'connected' ? 'default' : 'destructive'}
                className="text-xs">
                {overallStatus === 'connected' ? (
                  <>
                    <Wifi className="w-3 h-3 mr-1" />
                    All Systems Online
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 mr-1" />
                    System Issues
                  </>
                )}
              </Badge>
              
              {isAdminUser && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Admin Access
                </Badge>
              )}
            </div>
          </div>
          
          {/* Document Type Information */}
          {localEmployee.id_document_type && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    Document Type: {localEmployee.id_document_type}
                  </Badge>
                  <span className="text-xs text-blue-600">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </span>
                </div>
                {successfulRetries > 0 && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    {successfulRetries} successful retries
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* System Status Details */}
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">System Status</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={checkSystemStatus}
                className="h-6 px-2 text-xs">
                <RefreshCw className="w-3 h-3 mr-1" />
                Recheck
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className={`flex items-center space-x-2 ${getSystemStatusColor(systemStatus.api)}`}>
                <Server className="w-4 h-4" />
                <span className="text-sm">API: {systemStatus.api}</span>
              </div>
              <div className={`flex items-center space-x-2 ${getSystemStatusColor(systemStatus.database)}`}>
                <Database className="w-4 h-4" />
                <span className="text-sm">DB: {systemStatus.database}</span>
              </div>
              <div className={`flex items-center space-x-2 ${getSystemStatusColor(systemStatus.storage)}`}>
                <FileText className="w-4 h-4" />
                <span className="text-sm">Storage: {systemStatus.storage}</span>
              </div>
            </div>
          </div>
          
          {/* System Issues Warning */}
          {overallStatus === 'error' && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-700 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">System Issues Detected</span>
              </div>
              <p className="text-xs text-yellow-600 mb-2">
                Some system components are experiencing issues. Documents may load slowly or show errors.
                The robust viewer will automatically retry failed requests.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={checkSystemStatus}
                className="bg-white">
                <RefreshCw className="w-4 h-4 mr-1" />
                Test All Systems
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Documents Grid with Robust Viewers */}
      {showPreview && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc, index) => (
            <RobustIDDocumentViewer
              key={`${doc.fileId}-${index}-${lastRefresh.getTime()}`}
              fileId={doc.fileId}
              label={doc.label}
              documentType={localEmployee.id_document_type || 'Driving License'}
              isAdminUser={isAdminUser}
              size="lg"
              className="border-2 border-gray-200 hover:border-blue-300 transition-colors rounded-lg overflow-hidden"
              showDeleteButton={allowDelete && isAdminUser}
              onDelete={() => doc.fileId && handleDeleteDocument(doc.key, doc.fileId)}
              onRetrySuccess={handleRetrySuccess}
            />
          ))}
        </div>
      )}

      {/* Enhanced Information Panel */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span><strong>Robust ID Document Viewer</strong> with enhanced error recovery</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Automatic retry with exponential backoff (up to 3 attempts)</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Real-time system monitoring and connection testing</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Alternative URL fetching strategies for improved reliability</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Click on any document to view in full screen</span>
            </div>
            {isAdminUser ? (
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span><strong>Admin:</strong> Download and delete functionality available</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span>Download and delete access restricted to administrators</span>
              </div>
            )}
            {successfulRetries > 0 && (
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span><strong>Recovery Success:</strong> {successfulRetries} documents recovered through retry mechanism</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RobustIDDocumentsDisplay;