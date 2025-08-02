import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RobustIDDocumentViewer from '@/components/RobustIDDocumentViewer';
import RobustIDDocumentsDisplay from '@/components/RobustIDDocumentsDisplay';
import { useToast } from '@/hooks/use-toast';
import { FileText, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

// Mock employee data for testing
const mockEmployee = {
  ID: 1, 
  employee_id: 'EMP001',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '1234567890',
  position: 'Manager',
  station: 'Station A',
  shift: 'Day',
  hire_date: '2023-01-01',
  salary: 50000,
  is_active: true,
  employment_status: 'Active',
  created_by: 1,
  profile_image_id: null,
  date_of_birth: '1990-01-01',
  current_address: '123 Main St',
  mailing_address: '123 Main St',
  reference_name: 'Jane Smith',
  id_document_type: 'Driving License',
  id_document_file_id: 123,  // Test file ID
  id_document_2_file_id: 124, // Test file ID
  id_document_3_file_id: null,
  id_document_4_file_id: null
};

const DocumentViewerTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'pending' | 'success' | 'error';
    message: string;
  }>>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Run tests automatically on page load
    runTests();
  }, []);

  const runTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'API Connection Test',
        test: async () => {
          const response = await window.ezsite.apis.tablePage('11727', {
            PageNo: 1,
            PageSize: 1,
            Filters: []
          });
          if (response.error) throw new Error(response.error);
          return 'API connection successful';
        }
      },
      {
        name: 'File Storage Test',
        test: async () => {
          const response = await window.ezsite.apis.tablePage('26928', {
            PageNo: 1,
            PageSize: 1,
            Filters: []
          });
          if (response.error) throw new Error(response.error);
          return 'File storage connection successful';
        }
      },
      {
        name: 'File URL Test (Sample)',
        test: async () => {
          // Get a real file ID from the database if available
          const filesResponse = await window.ezsite.apis.tablePage('26928', {
            PageNo: 1,
            PageSize: 1,
            Filters: []
          });
          
          if (filesResponse.error) throw new Error(filesResponse.error);
          
          if (!filesResponse.data?.List?.length) {
            return 'No test files available in storage';
          }
          
          const testFileId = filesResponse.data.List[0].store_file_id;
          if (!testFileId) {
            return 'No valid file ID found for testing';
          }
          
          const urlResponse = await window.ezsite.apis.getUploadUrl(testFileId);
          if (urlResponse.error) throw new Error(urlResponse.error);
          if (!urlResponse.data) throw new Error('No URL returned');
          
          return `File URL retrieval successful for ID ${testFileId}`;
        }
      }
    ];

    for (const testCase of tests) {
      try {
        const result = await testCase.test();
        setTestResults(prev => [...prev, {
          test: testCase.name,
          status: 'success',
          message: result
        }]);
      } catch (error) {
        setTestResults(prev => [...prev, {
          test: testCase.name,
          status: 'error', 
          message: error instanceof Error ? error.message : 'Unknown error'
        }]);
      }
    }
    
    setIsRunningTests(false);
  };

  const handleRefresh = () => {
    toast({
      title: 'Test Refresh',
      description: 'Document viewer refresh triggered'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Viewer Test Page</h1>
              <p className="text-sm text-gray-500 mt-1">
                Testing the Robust ID Document Viewer with real API connections
              </p>
            </div>
            <Button onClick={runTests} disabled={isRunningTests}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRunningTests ? 'animate-spin' : ''}`} />
              {isRunningTests ? 'Running Tests...' : 'Run Tests'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {result.status === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                  {result.status === 'pending' && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-900">{result.test}</p>
                  <p className={`text-xs ${
                    result.status === 'success' ? 'text-green-600' : 
                    result.status === 'error' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {result.message}
                  </p>
                </div>
                <Badge variant={
                  result.status === 'success' ? 'default' : 
                  result.status === 'error' ? 'destructive' : 'secondary'
                }>
                  {result.status}
                </Badge>
              </div>
            ))}
            
            {testResults.length === 0 && !isRunningTests && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Click "Run Tests" to begin system diagnostics</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Individual Document Viewer */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Individual Document Viewer Test</h2>
          <p className="text-sm text-gray-500">
            Testing individual document viewer with mock file IDs
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RobustIDDocumentViewer
              fileId={123}
              label="Test Document 1"
              documentType="Test License"
              isAdminUser={true}
              size="md"
              className="border border-gray-200 rounded-lg"
            />
            <RobustIDDocumentViewer
              fileId={124}
              label="Test Document 2"
              documentType="Test ID"
              isAdminUser={true}
              size="md"
              className="border border-gray-200 rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Full Documents Display */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Full Documents Display Test</h2>
          <p className="text-sm text-gray-500">
            Testing the complete documents display component with mock employee data
          </p>
        </CardHeader>
        <CardContent>
          <RobustIDDocumentsDisplay
            employee={mockEmployee}
            isAdminUser={true}
            onRefresh={handleRefresh}
            allowDelete={true}
            showPreview={true}
          />
        </CardContent>
      </Card>

      {/* Information Panel */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span><strong>Enhanced Document Viewer Features:</strong></span>
            </div>
            <ul className="ml-6 space-y-1 text-xs">
              <li>• Automatic retry with exponential backoff</li>
              <li>• Real-time connection monitoring</li>
              <li>• Alternative URL fetching strategies</li>
              <li>• Comprehensive error handling and recovery</li>
              <li>• System status monitoring (API, Database, Storage)</li>
              <li>• Manual retry and connection testing</li>
              <li>• Improved loading states and error messages</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentViewerTestPage;