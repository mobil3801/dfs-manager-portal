import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  Server,
  Database,
  Clock,
  Trash2 } from
'lucide-react';
import LiveIDDocumentViewer from '@/components/LiveIDDocumentViewer';

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

interface LiveIDDocumentsDisplayProps {
  employee: Employee;
  isAdminUser: boolean;
  onRefresh?: () => void;
  allowDelete?: boolean;
  showPreview?: boolean;
  className?: string;
}

interface SystemStatus {
  api: 'checking' | 'connected' | 'error';
  database: 'checking' | 'connected' | 'error';
  storage: 'checking' | 'connected' | 'error';
}

const LiveIDDocumentsDisplay: React.FC<LiveIDDocumentsDisplayProps> = ({
  employee,
  isAdminUser,
  onRefresh,
  allowDelete = false,
  showPreview = true,
  className = ''
}) => {
  const [localEmployee, setLocalEmployee] = useState<Employee>(employee);
  const [refreshing, setRefreshing] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    api: 'checking',
    database: 'checking',
    storage: 'checking'
  });
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [successfulRetries, setSuccessfulRetries] = useState(0);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const { toast } = useToast();

  // Update local state when employee prop changes
  useEffect(() => {
    setLocalEmployee(employee);
  }, [employee]);

  // Check system status on mount and periodically
  useEffect(() => {
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 90000); // Check every 90 seconds
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = useCallback(async () => {
    console.log('[LiveIDDocumentsDisplay] Checking system status...');

    // Test API connectivity
    setSystemStatus((prev) => ({ ...prev, api: 'checking' }));
    try {
      const apiResponse = (await Promise.race([
      globalThis.ezsite.apis.tablePage('11727', {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'ID', op: 'Equal', value: employee.ID }]
      }),
      new Promise((_, reject) =>
      setTimeout(() => reject(new Error('API timeout')), 6000)
      )]
      )) as {error?: string;};

      setSystemStatus((prev) => ({
        ...prev,
        api: apiResponse.error ? 'error' : 'connected'
      }));
    } catch (error) {
      console.error('[LiveIDDocumentsDisplay] API test failed:', error);
      setSystemStatus((prev) => ({ ...prev, api: 'error' }));
    }

    // Test database connectivity
    setSystemStatus((prev) => ({ ...prev, database: 'checking' }));
    try {
      const dbResponse = (await Promise.race([
      globalThis.ezsite.apis.tablePage('26928', {
        PageNo: 1,
        PageSize: 1,
        Filters: []
      }),
      new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database timeout')), 6000)
      )]
      )) as {error?: string;};

      setSystemStatus((prev) => ({
        ...prev,
        database: dbResponse.error ? 'error' : 'connected'
      }));
    } catch (error) {
      console.error('[LiveIDDocumentsDisplay] Database test failed:', error);
      setSystemStatus((prev) => ({ ...prev, database: 'error' }));
    }

    // Test storage connectivity
    setSystemStatus((prev) => ({ ...prev, storage: 'checking' }));
    const fileIds = [
    employee.id_document_file_id,
    employee.id_document_2_file_id,
    employee.id_document_3_file_id,
    employee.id_document_4_file_id].
    filter((id) => id);

    if (fileIds.length > 0) {
      try {
        const testFileId = fileIds[0];
        const storageResponse = (await Promise.race([
        globalThis.ezsite.apis.getUploadUrl(testFileId!),
        new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Storage timeout')), 8000)
        )]
        )) as {error?: string;};

        setSystemStatus((prev) => ({
          ...prev,
          storage: storageResponse.error ? 'error' : 'connected'
        }));
      } catch (error) {
        console.error('[LiveIDDocumentsDisplay] Storage test failed:', error);
        setSystemStatus((prev) => ({ ...prev, storage: 'error' }));
      }
    } else {
      setSystemStatus((prev) => ({ ...prev, storage: 'connected' }));
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
  }].
  filter((doc) => doc.fileId);

  const handleRefresh = async () => {
    if (!onRefresh) return;

    setRefreshing(true);
    try {
      await onRefresh();
      await checkSystemStatus();
      setLastRefresh(new Date());
      toast({
        title: 'Refreshed Successfully',
        description: 'All ID documents have been refreshed with live data'
      });
    } catch (error) {
      console.error('[LiveIDDocumentsDisplay] Error refreshing:', error);
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

    setIsDeleting(fileId);

    try {
      console.log(`[LiveIDDocumentsDisplay] Deleting document: ${documentKey}, fileId: ${fileId}`);

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
            console.error('[LiveIDDocumentsDisplay] Error deleting file from storage:', deleteError);
          }
        }
      } catch (fileError) {
        console.error('[LiveIDDocumentsDisplay] Error cleaning up file storage:', fileError);
      }

      toast({
        title: 'Document Deleted',
        description: 'The document has been permanently deleted from the system',
        variant: 'destructive'
      });

      // Refresh parent component if callback provided
      if (onRefresh) {
        onRefresh();
      }

    } catch (error) {
      console.error('[LiveIDDocumentsDisplay] Error deleting document:', error);
      toast({
        title: 'Delete Error',
        description: 'Failed to delete document. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRetrySuccess = () => {
    setSuccessfulRetries((prev) => prev + 1);
    toast({
      title: 'Document Loaded',
      description: 'Document loaded successfully after retry'
    });
  };

  const getSystemStatusColor = (status: 'checking' | 'connected' | 'error') => {
    switch (status) {
      case 'connected':return 'text-green-600';
      case 'error':return 'text-red-600';
      case 'checking':return 'text-yellow-600';
      default:return 'text-gray-600';
    }
  };

  const getSystemStatusIcon = (status: 'checking' | 'connected' | 'error') => {
    switch (status) {
      case 'connected':return <CheckCircle className="w-4 h-4" />;
      case 'error':return <AlertTriangle className="w-4 h-4" />;
      case 'checking':return <Clock className="w-4 h-4 animate-pulse" />;
      default:return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const overallStatus = systemStatus.api === 'connected' &&
  systemStatus.database === 'connected' &&
  systemStatus.storage === 'connected' ?
  'connected' : 'error';

  if (documents.length === 0) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="text-center py-12">
          <FileText className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No ID Documents</h3>
          <p className="text-gray-500 mb-6">
            No ID documents have been uploaded for this employee yet.
          </p>
          
          {/* System Status for No Documents */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-4 mb-3">
              <div className={`flex items-center space-x-1 ${getSystemStatusColor(systemStatus.api)}`}>
                {getSystemStatusIcon(systemStatus.api)}
                <span className="text-sm">API</span>
              </div>
              <div className={`flex items-center space-x-1 ${getSystemStatusColor(systemStatus.database)}`}>
                <Database className="w-4 h-4" />
                <span className="text-sm">Database</span>
              </div>
              <div className={`flex items-center space-x-1 ${getSystemStatusColor(systemStatus.storage)}`}>
                <Server className="w-4 h-4" />
                <span className="text-sm">Storage</span>
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
      </Card>);

  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Enhanced Header Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Live ID Documents ({documents.length})
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {localEmployee.first_name} {localEmployee.last_name} • {localEmployee.employee_id}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-9">

                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh All
              </Button>
              
              {/* System Status Indicator */}
              <Badge
                variant={overallStatus === 'connected' ? 'default' : 'destructive'}
                className="text-sm px-3 py-1">

                {overallStatus === 'connected' ?
                <>
                    <Wifi className="w-4 h-4 mr-2" />
                    All Systems Online
                  </> :

                <>
                    <WifiOff className="w-4 h-4 mr-2" />
                    System Issues
                  </>
                }
              </Badge>
              
              {isAdminUser &&
              <Badge variant="secondary" className="text-sm bg-green-100 text-green-700 px-3 py-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Admin Access
                </Badge>
              }
            </div>
          </div>
          
          {/* Document Type Information */}
          {localEmployee.id_document_type &&
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-1">
                    Document Type: {localEmployee.id_document_type}
                  </Badge>
                  <span className="text-sm text-blue-600">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </span>
                </div>
                {successfulRetries > 0 &&
              <Badge variant="secondary" className="text-sm bg-green-100 text-green-700">
                    {successfulRetries} successful recoveries
                  </Badge>
              }
              </div>
            </div>
          }
          
          {/* System Status Details */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Live System Status</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={checkSystemStatus}
                className="h-7 px-3 text-xs">

                <RefreshCw className="w-3 h-3 mr-1" />
                Recheck
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className={`flex items-center space-x-2 ${getSystemStatusColor(systemStatus.api)}`}>
                <Server className="w-4 h-4" />
                <span className="text-sm font-medium">API: {systemStatus.api}</span>
              </div>
              <div className={`flex items-center space-x-2 ${getSystemStatusColor(systemStatus.database)}`}>
                <Database className="w-4 h-4" />
                <span className="text-sm font-medium">DB: {systemStatus.database}</span>
              </div>
              <div className={`flex items-center space-x-2 ${getSystemStatusColor(systemStatus.storage)}`}>
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Storage: {systemStatus.storage}</span>
              </div>
            </div>
          </div>
          
          {/* System Issues Warning */}
          {overallStatus === 'error' &&
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-700 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">System Issues Detected</span>
              </div>
              <p className="text-sm text-yellow-600 mb-3">
                Some system components are experiencing issues. Documents may load slowly or show errors.
                The live viewer will automatically retry failed requests.
              </p>
              <Button
              variant="outline"
              size="sm"
              onClick={checkSystemStatus}
              className="bg-white border-yellow-300 hover:bg-yellow-50">

                <RefreshCw className="w-4 h-4 mr-2" />
                Test All Systems
              </Button>
            </div>
          }
        </CardHeader>
      </Card>

      {/* Live Documents Grid */}
      {showPreview &&
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {documents.map((doc, index) =>
        <div key={`${doc.fileId}-${index}-${lastRefresh.getTime()}`} className="relative">
              <LiveIDDocumentViewer
            fileId={doc.fileId}
            label={doc.label}
            documentType={localEmployee.id_document_type || 'ID Document'}
            isAdminUser={isAdminUser}
            size="lg"
            className="border-2 border-gray-200 hover:border-blue-300 transition-colors"
            showDeleteButton={allowDelete && isAdminUser}
            onDelete={() => doc.fileId && handleDeleteDocument(doc.key, doc.fileId)}
            onRetrySuccess={handleRetrySuccess} />

              
              {/* Delete Overlay */}
              {isDeleting === doc.fileId &&
          <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <Trash2 className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm font-medium">Deleting...</p>
                  </div>
                </div>
          }
            </div>
        )}
        </div>
      }

      {/* Information Panel */}
      <Card>
        <CardContent className="p-6">
          <div className="text-sm text-gray-600 space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span><strong>Live ID Document Viewer</strong> with real-time connection monitoring</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Automatic retry with progressive backoff (up to 3 attempts per document)</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Real-time system health monitoring and connection validation</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Enhanced error recovery with detailed diagnostic information</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Click on any document to view in full screen with proper ID display</span>
            </div>
            {isAdminUser ?
            <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span><strong>Admin:</strong> Full download, delete, and management functionality available</span>
              </div> :

            <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span>Download and delete access restricted to administrators</span>
              </div>
            }
            {successfulRetries > 0 &&
            <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span><strong>Recovery Success:</strong> {successfulRetries} documents recovered through automatic retry</span>
              </div>
            }
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default LiveIDDocumentsDisplay;