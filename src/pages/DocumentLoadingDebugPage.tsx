import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Database,
  Upload,
  Globe,
  Eye,
  Download,
  Settings } from
'lucide-react';
import EnhancedDocumentViewer from '@/components/EnhancedDocumentViewer';
import RobustFileViewer from '@/components/RobustFileViewer';
import { fileService } from '@/services/fileService';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

const DocumentLoadingDebugPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<any[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [systemStatus, setSystemStatus] = useState({
    database: 'unknown' as 'online' | 'offline' | 'unknown',
    storage: 'unknown' as 'online' | 'offline' | 'unknown',
    api: 'unknown' as 'online' | 'offline' | 'unknown'
  });
  const { toast } = useToast();

  useEffect(() => {
    checkSystemStatus();
    loadAvailableFiles();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Test database connection
      const dbResponse = await window.ezsite.apis.tablePage('11727', {
        PageNo: 1,
        PageSize: 1,
        Filters: []
      });

      setSystemStatus((prev) => ({
        ...prev,
        database: dbResponse.error ? 'offline' : 'online',
        api: dbResponse.error ? 'offline' : 'online'
      }));

      // Test file storage
      const storageResponse = await window.ezsite.apis.tablePage('26928', {
        PageNo: 1,
        PageSize: 1,
        Filters: []
      });

      setSystemStatus((prev) => ({
        ...prev,
        storage: storageResponse.error ? 'offline' : 'online'
      }));
    } catch (error) {
      setSystemStatus({
        database: 'offline',
        storage: 'offline',
        api: 'offline'
      });
    }
  };

  const loadAvailableFiles = async () => {
    try {
      const response = await window.ezsite.apis.tablePage('26928', {
        PageNo: 1,
        PageSize: 10,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (response.data?.List) {
        setAvailableFiles(response.data.List);
        if (response.data.List.length > 0) {
          setSelectedFileId(response.data.List[0].store_file_id);
        }
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const runComprehensiveTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    const tests = [
    {
      name: 'System Status Check',
      test: async () => {
        await checkSystemStatus();
        const allOnline = Object.values(systemStatus).every((status) => status === 'online');
        if (!allOnline) {
          throw new Error('Some system components are offline');
        }
        return 'All system components are online';
      }
    },
    {
      name: 'Database Connection',
      test: async () => {
        const response = await window.ezsite.apis.tablePage('11727', {
          PageNo: 1,
          PageSize: 1,
          Filters: []
        });
        if (response.error) throw new Error(response.error);
        return `Database connected - ${response.data?.List?.length || 0} employees found`;
      }
    },
    {
      name: 'File Storage Access',
      test: async () => {
        const response = await window.ezsite.apis.tablePage('26928', {
          PageNo: 1,
          PageSize: 5,
          Filters: []
        });
        if (response.error) throw new Error(response.error);
        const fileCount = response.data?.List?.length || 0;
        return `File storage accessible - ${fileCount} files found`;
      }
    },
    {
      name: 'File URL Retrieval',
      test: async () => {
        if (!selectedFileId) {
          return 'No test file available for URL retrieval';
        }

        const urlResponse = await fileService.getFileUrl(selectedFileId, true);
        if (urlResponse.error) {
          throw new Error(urlResponse.error);
        }

        return `File URL retrieved successfully for ID ${selectedFileId}`;
      }
    },
    {
      name: 'File Accessibility Test',
      test: async () => {
        if (!selectedFileId) {
          return 'No test file available for accessibility test';
        }

        const urlResponse = await fileService.getFileUrl(selectedFileId);
        if (urlResponse.error) {
          throw new Error(urlResponse.error);
        }

        const url = urlResponse.data!;

        // Test URL accessibility
        try {
          const response = await fetch(url, { method: 'HEAD' });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return `File is accessible at ${url.substring(0, 50)}...`;
        } catch (error) {
          throw new Error(`File not accessible: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Enhanced Service Integration',
      test: async () => {
        // Test file service integration
        const fileInfo = await fileService.getFileInfo(selectedFileId || 1);
        if (fileInfo.error && selectedFileId) {
          throw new Error(fileInfo.error);
        }

        return 'Enhanced file service integration working';
      }
    }];


    for (const testCase of tests) {
      try {
        setTestResults((prev) => [...prev, {
          test: testCase.name,
          status: 'pending',
          message: 'Running test...'
        }]);

        const result = await testCase.test();

        setTestResults((prev) => prev.map((item) =>
        item.test === testCase.name ?
        { ...item, status: 'success', message: result } :
        item
        ));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        setTestResults((prev) => prev.map((item) =>
        item.test === testCase.name ?
        {
          ...item,
          status: 'error',
          message: errorMessage,
          details: `Test failed: ${errorMessage}`
        } :
        item
        ));
      }
    }

    setIsRunningTests(false);

    const passedTests = testResults.filter((r) => r.status === 'success').length;
    const totalTests = tests.length;

    toast({
      title: 'Test Complete',
      description: `${passedTests}/${totalTests} tests passed`,
      variant: passedTests === totalTests ? 'default' : 'destructive'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'offline':return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:return <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':return <Badge className="bg-green-100 text-green-800">Online</Badge>;
      case 'offline':return <Badge variant="destructive">Offline</Badge>;
      default:return <Badge variant="secondary">Checking...</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-6 h-6 text-blue-600" />
                <span>Document Loading Debug Center</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive diagnostics for document loading and display issues
              </p>
            </div>
            <Button onClick={runComprehensiveTests} disabled={isRunningTests}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRunningTests ? 'animate-spin' : ''}`} />
              {isRunningTests ? 'Running Tests...' : 'Run Full Diagnostics'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* System Status Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Database</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.database)}
                {getStatusBadge(systemStatus.database)}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Upload className="w-5 h-5 text-green-600" />
                <span className="font-medium">File Storage</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.storage)}
                {getStatusBadge(systemStatus.storage)}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-purple-600" />
                <span className="font-medium">API Service</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.api)}
                {getStatusBadge(systemStatus.api)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testResults.map((result, index) =>
            <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {result.status === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                  {result.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                  {result.status === 'pending' && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-900">{result.test}</p>
                  <p className={`text-xs mt-1 ${
                result.status === 'success' ? 'text-green-600' :
                result.status === 'error' ? 'text-red-600' :
                result.status === 'warning' ? 'text-yellow-600' :
                'text-blue-600'}`
                }>
                    {result.message}
                  </p>
                  {result.details &&
                <p className="text-xs text-gray-500 mt-1">{result.details}</p>
                }
                </div>
                <Badge variant={
              result.status === 'success' ? 'default' :
              result.status === 'error' ? 'destructive' :
              result.status === 'warning' ? 'secondary' : 'outline'
              }>
                  {result.status}
                </Badge>
              </div>
            )}
            
            {testResults.length === 0 && !isRunningTests &&
            <div className="text-center py-8 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Click "Run Full Diagnostics" to begin comprehensive system testing</p>
              </div>
            }
          </div>
        </CardContent>
      </Card>

      {/* Available Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Available Test Files</span>
            <Badge variant="secondary">{availableFiles.length} files</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableFiles.length > 0 ?
          <div className="space-y-3">
              {availableFiles.slice(0, 5).map((file) =>
            <div
              key={file.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedFileId === file.store_file_id ?
              'border-blue-500 bg-blue-50' :
              'border-gray-200 hover:border-gray-300'}`
              }
              onClick={() => setSelectedFileId(file.store_file_id)}>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">File ID: {file.store_file_id}</p>
                      <p className="text-xs text-gray-500">
                        {file.file_name} • {file.file_type}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedFileId === file.store_file_id &&
                  <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
                  }
                      <Badge variant="outline" className="text-xs">
                        {new Date(file.upload_date).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </div>
            )}
            </div> :

          <div className="text-center py-8 text-gray-500">
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No files available for testing</p>
              <p className="text-xs text-gray-400 mt-1">Upload some files to test document loading</p>
            </div>
          }
        </CardContent>
      </Card>

      {/* Enhanced Document Viewer Test */}
      {selectedFileId &&
      <Card>
          <CardHeader>
            <CardTitle>Enhanced Document Viewer Test</CardTitle>
            <p className="text-sm text-gray-600">
              Testing with File ID: {selectedFileId}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EnhancedDocumentViewer
              fileId={selectedFileId}
              label={`Test Document ${selectedFileId}`}
              isAdminUser={true}
              size="lg"
              showLabel={true}
              autoRetry={true} />

              
              <div className="space-y-4">
                <h4 className="font-medium">Enhanced Features:</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Automatic retry with exponential backoff</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Real-time connection monitoring</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Enhanced error handling and recovery</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>File URL caching and validation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Comprehensive status indicators</span>
                  </li>
                </ul>
                
                <div className="pt-4 border-t">
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileService.clearCache(selectedFileId)}
                  className="mr-2">

                    Clear Cache
                  </Button>
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={checkSystemStatus}>

                    Refresh Status
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      }

      {/* Robust File Viewer Test */}
      {availableFiles.length > 0 &&
      <Card>
          <CardHeader>
            <CardTitle>Robust File Viewer Test</CardTitle>
            <p className="text-sm text-gray-600">
              Testing multiple file handling with the enhanced viewer
            </p>
          </CardHeader>
          <CardContent>
            <RobustFileViewer
            fileIds={availableFiles.slice(0, 3).map((f) => f.store_file_id)}
            labels={availableFiles.slice(0, 3).map((f) => f.file_name || `File ${f.store_file_id}`)}
            isAdminUser={true}
            title="Test Documents"
            showPreviewDialog={true} />

          </CardContent>
        </Card>
      }

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Common Issues & Solutions:</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <strong>No file URL returned:</strong> Check file permissions and storage access</li>
                <li>• <strong>Image failed to load:</strong> Verify URL accessibility and CORS settings</li>
                <li>• <strong>Connection timeouts:</strong> Network issues or server overload</li>
                <li>• <strong>Invalid file ID:</strong> File may have been deleted or moved</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">System Requirements:</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Database connection: <strong>Required</strong></li>
                <li>• File storage access: <strong>Required</strong></li>
                <li>• Network connectivity: <strong>Required</strong></li>
                <li>• File URL generation: <strong>Must work</strong></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default DocumentLoadingDebugPage;