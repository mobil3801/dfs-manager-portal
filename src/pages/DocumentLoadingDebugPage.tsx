import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  Download,
  User } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImprovedIDDocumentViewer from '@/components/ImprovedIDDocumentViewer';
import FixedIDDocumentViewer from '@/components/FixedIDDocumentViewer';
import IDDocumentViewer from '@/components/IDDocumentViewer';

interface FileTestResult {
  fileId: number;
  url?: string;
  error?: string;
  success: boolean;
  responseTime: number;
  status?: number;
}

const DocumentLoadingDebugPage: React.FC = () => {
  const [testFileId, setTestFileId] = useState<string>('');
  const [testResults, setTestResults] = useState<FileTestResult[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const { toast } = useToast();

  // Load employees with document files on mount
  useEffect(() => {
    loadEmployeesWithDocuments();
  }, []);

  const loadEmployeesWithDocuments = async () => {
    try {
      setLoadingEmployees(true);

      // Load employees that have document files
      const { data, error } = await window.ezsite.apis.tablePage('11727', {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: []
      });

      if (error) throw new Error(error);

      // Filter employees that have at least one document file
      const employeesWithDocs = (data?.List || []).filter((emp: any) =>
      emp.id_document_file_id ||
      emp.id_document_2_file_id ||
      emp.id_document_3_file_id ||
      emp.id_document_4_file_id
      );

      setEmployees(employeesWithDocs);
      console.log(`[DocumentLoadingDebugPage] Loaded ${employeesWithDocs.length} employees with documents`);

    } catch (error) {
      console.error('[DocumentLoadingDebugPage] Error loading employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees with documents",
        variant: "destructive"
      });
    } finally {
      setLoadingEmployees(false);
    }
  };

  const testFileLoad = async (fileId: number): Promise<FileTestResult> => {
    const startTime = Date.now();

    try {
      console.log(`[DocumentLoadingDebugPage] Testing file ID: ${fileId}`);

      const { data: fileUrl, error } = await window.ezsite.apis.getUploadUrl(fileId);
      const responseTime = Date.now() - startTime;

      if (error) {
        console.error(`[DocumentLoadingDebugPage] API error for file ${fileId}:`, error);
        return {
          fileId,
          error,
          success: false,
          responseTime
        };
      }

      if (!fileUrl) {
        console.error(`[DocumentLoadingDebugPage] No URL returned for file ${fileId}`);
        return {
          fileId,
          error: 'No URL returned from API',
          success: false,
          responseTime
        };
      }

      console.log(`[DocumentLoadingDebugPage] Successfully got URL for file ${fileId}:`, fileUrl);

      // Test if the URL is accessible
      try {
        const testResponse = await fetch(fileUrl, { method: 'HEAD' });
        return {
          fileId,
          url: fileUrl,
          success: testResponse.ok,
          responseTime,
          status: testResponse.status,
          error: testResponse.ok ? undefined : `HTTP ${testResponse.status}: ${testResponse.statusText}`
        };
      } catch (fetchError) {
        return {
          fileId,
          url: fileUrl,
          success: false,
          responseTime,
          error: `Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`
        };
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[DocumentLoadingDebugPage] Test failed for file ${fileId}:`, error);

      return {
        fileId,
        error: errorMessage,
        success: false,
        responseTime
      };
    }
  };

  const runSingleFileTest = async () => {
    const fileId = parseInt(testFileId);
    if (!fileId || isNaN(fileId)) {
      toast({
        title: "Invalid File ID",
        description: "Please enter a valid numeric file ID",
        variant: "destructive"
      });
      return;
    }

    setIsRunningTest(true);
    try {
      const result = await testFileLoad(fileId);
      setTestResults([result]);

      if (result.success) {
        toast({
          title: "Test Successful",
          description: `File ${fileId} loaded successfully in ${result.responseTime}ms`
        });
      } else {
        toast({
          title: "Test Failed",
          description: `File ${fileId} failed to load: ${result.error}`,
          variant: "destructive"
        });
      }
    } finally {
      setIsRunningTest(false);
    }
  };

  const runBulkTest = async () => {
    if (employees.length === 0) {
      toast({
        title: "No Documents",
        description: "No employees with documents found to test",
        variant: "destructive"
      });
      return;
    }

    setIsRunningTest(true);
    setTestResults([]);

    try {
      const fileIds: number[] = [];

      // Collect all file IDs from employees
      employees.forEach((emp) => {
        if (emp.id_document_file_id) fileIds.push(emp.id_document_file_id);
        if (emp.id_document_2_file_id) fileIds.push(emp.id_document_2_file_id);
        if (emp.id_document_3_file_id) fileIds.push(emp.id_document_3_file_id);
        if (emp.id_document_4_file_id) fileIds.push(emp.id_document_4_file_id);
      });

      const uniqueFileIds = [...new Set(fileIds)];
      console.log(`[DocumentLoadingDebugPage] Testing ${uniqueFileIds.length} unique file IDs`);

      const results: FileTestResult[] = [];

      // Test files in batches of 5 to avoid overwhelming the API
      const batchSize = 5;
      for (let i = 0; i < uniqueFileIds.length; i += batchSize) {
        const batch = uniqueFileIds.slice(i, i + batchSize);
        const batchPromises = batch.map(testFileLoad);
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Update results incrementally
        setTestResults([...results]);

        // Small delay between batches
        if (i + batchSize < uniqueFileIds.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      toast({
        title: "Bulk Test Complete",
        description: `${successCount} files loaded successfully, ${failureCount} failed`,
        variant: failureCount > 0 ? "destructive" : "default"
      });

    } catch (error) {
      console.error('[DocumentLoadingDebugPage] Bulk test error:', error);
      toast({
        title: "Test Error",
        description: "Failed to complete bulk test",
        variant: "destructive"
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-6 h-6" />
            <span>Document Loading Debug Tool</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This tool helps debug document loading issues. Test individual files or run bulk tests on all employee documents.
            </AlertDescription>
          </Alert>

          {/* Single File Test */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Single File Test</h3>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Enter file ID (e.g., 12345)"
                value={testFileId}
                onChange={(e) => setTestFileId(e.target.value)}
                className="max-w-xs" />

              <Button
                onClick={runSingleFileTest}
                disabled={isRunningTest}>

                {isRunningTest ?
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> :

                <FileText className="w-4 h-4 mr-2" />
                }
                Test File
              </Button>
            </div>
          </div>

          {/* Bulk Test */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Bulk Test</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {employees.length} employees with documents
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadEmployeesWithDocuments}
                  disabled={loadingEmployees}>

                  {loadingEmployees ?
                  <RefreshCw className="w-4 h-4 animate-spin" /> :

                  <RefreshCw className="w-4 h-4" />
                  }
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={runBulkTest}
                disabled={isRunningTest || employees.length === 0}>

                {isRunningTest ?
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> :

                <FileText className="w-4 h-4 mr-2" />
                }
                Test All Documents
              </Button>
              
              {testResults.length > 0 &&
              <Button
                variant="outline"
                onClick={clearResults}>

                  Clear Results
                </Button>
              }
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 &&
          <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Test Results</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="default">
                    {testResults.filter((r) => r.success).length} Success
                  </Badge>
                  <Badge variant="destructive">
                    {testResults.filter((r) => !r.success).length} Failed
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {testResults.map((result, index) =>
              <Card key={index} className={`border ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {result.success ?
                      <CheckCircle className="w-4 h-4 text-green-600" /> :

                      <AlertCircle className="w-4 h-4 text-red-600" />
                      }
                          <span className="font-medium">File ID: {result.fileId}</span>
                        </div>
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.responseTime}ms
                        </Badge>
                      </div>
                      
                      {result.success ?
                  <div className="space-y-2">
                          <p className="text-sm text-green-700">
                            Status: {result.status || 'OK'}
                          </p>
                          {result.url &&
                    <div className="flex items-center space-x-2">
                              <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(result.url, '_blank')}>

                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <p className="text-xs text-gray-600 truncate flex-1">
                                {result.url}
                              </p>
                            </div>
                    }
                        </div> :

                  <div className="space-y-2">
                          <p className="text-sm text-red-700">
                            Error: {result.error}
                          </p>
                          {result.status &&
                    <p className="text-xs text-red-600">
                              HTTP Status: {result.status}
                            </p>
                    }
                          {result.url &&
                    <p className="text-xs text-gray-600 truncate">
                              URL: {result.url}
                            </p>
                    }
                        </div>
                  }
                    </CardContent>
                  </Card>
              )}
              </div>
            </div>
          }
        </CardContent>
      </Card>

      {/* Component Comparison */}
      {testFileId && !isNaN(parseInt(testFileId)) &&
      <Card>
          <CardHeader>
            <CardTitle>Component Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium">Original Component</h4>
                <IDDocumentViewer
                fileId={parseInt(testFileId)}
                label="Original Viewer"
                isAdminUser={true}
                size="md" />

              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Fixed Component</h4>
                <FixedIDDocumentViewer
                fileId={parseInt(testFileId)}
                label="Fixed Viewer"
                isAdminUser={true}
                size="md" />

              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Improved Component</h4>
                <ImprovedIDDocumentViewer
                fileId={parseInt(testFileId)}
                label="Improved Viewer"
                isAdminUser={true}
                size="md" />

              </div>
            </div>
          </CardContent>
        </Card>
      }

      {/* Employee Documents */}
      {employees.length > 0 &&
      <Card>
          <CardHeader>
            <CardTitle>Employee Documents (Live Test)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.slice(0, 3).map((employee) =>
            <div key={employee.ID} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium">
                        {employee.first_name} {employee.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        ID: {employee.employee_id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                { id: employee.id_document_file_id, label: 'Document 1' },
                { id: employee.id_document_2_file_id, label: 'Document 2' },
                { id: employee.id_document_3_file_id, label: 'Document 3' },
                { id: employee.id_document_4_file_id, label: 'Document 4' }].
                filter((doc) => doc.id).map((doc) =>
                <ImprovedIDDocumentViewer
                  key={doc.id}
                  fileId={doc.id}
                  label={doc.label}
                  isAdminUser={true}
                  size="sm" />

                )}
                  </div>
                </div>
            )}
              
              {employees.length > 3 &&
            <p className="text-sm text-gray-600 text-center">
                  Showing first 3 employees. Total: {employees.length} employees with documents.
                </p>
            }
            </div>
          </CardContent>
        </Card>
      }
    </div>);

};

export default DocumentLoadingDebugPage;