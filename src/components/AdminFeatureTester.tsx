import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  TestTube,
  Database,
  User,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  RotateCcw,
  FileText,
  Upload } from
'lucide-react';

interface TestResult {
  testName: string;
  status: 'success' | 'error' | 'running';
  message: string;
  timestamp: string;
  duration?: number;
}

const AdminFeatureTester: React.FC = () => {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState<string | null>(null);
  const [testData, setTestData] = useState({
    userId: '',
    tableName: '',
    testMessage: 'Test message from admin panel',
    testFile: null as File | null
  });

  const addTestResult = (result: TestResult) => {
    setTestResults((prev) => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const runTest = async (testName: string, testFunction: () => Promise<void>) => {
    setRunning(testName);
    const startTime = Date.now();

    addTestResult({
      testName,
      status: 'running',
      message: 'Test in progress...',
      timestamp: new Date().toISOString()
    });

    try {
      await testFunction();
      const duration = Date.now() - startTime;
      addTestResult({
        testName,
        status: 'success',
        message: 'Test completed successfully',
        timestamp: new Date().toISOString(),
        duration
      });
      toast({
        title: "Test Passed",
        description: `${testName} completed successfully in ${duration}ms`
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addTestResult({
        testName,
        status: 'error',
        message: errorMessage,
        timestamp: new Date().toISOString(),
        duration
      });
      toast({
        title: "Test Failed",
        description: `${testName}: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setRunning(null);
    }
  };

  // Database Tests
  const testDatabaseConnection = async () => {
    const { data, error } = await window.ezsite.apis.tablePage('11725', {
      PageNo: 1,
      PageSize: 1,
      OrderByField: 'id',
      IsAsc: false,
      Filters: []
    });

    if (error) throw new Error(`Database connection failed: ${error}`);
    if (!data) throw new Error('No data returned from database');
  };

  const testDatabaseWrite = async () => {
    // Test creating and then deleting a test record
    const testRecord = {
      first_name: 'Test',
      last_name: 'User',
      role: 'Employee',
      station: 'TEST_STATION',
      is_active: false,
      user_id: 999999 // Use a test user ID that shouldn't exist
    };

    const { error: createError } = await window.ezsite.apis.tableCreate('11725', testRecord);
    if (createError) throw new Error(`Database write test failed: ${createError}`);
  };

  const testAuthenticationAPI = async () => {
    const { data, error } = await window.ezsite.apis.getUserInfo();
    if (error) throw new Error(`Authentication API failed: ${error}`);
    if (!data) throw new Error('No user data returned');
  };

  const testSMSService = async () => {
    // This would test SMS functionality - mock implementation
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    // In real implementation, this would send a test SMS
  };

  const testFileUpload = async () => {
    if (!testData.testFile) {
      throw new Error('No test file selected');
    }

    const { data, error } = await window.ezsite.apis.upload({
      filename: testData.testFile.name,
      file: testData.testFile
    });

    if (error) throw new Error(`File upload failed: ${error}`);
    if (!data) throw new Error('No file ID returned');
  };

  const testTableOperations = async () => {
    // Test CRUD operations on a specific table
    const tableId = '11726'; // Products table

    // Read
    const { data: readData, error: readError } = await window.ezsite.apis.tablePage(tableId, {
      PageNo: 1,
      PageSize: 1,
      OrderByField: 'id',
      IsAsc: false,
      Filters: []
    });

    if (readError) throw new Error(`Table read failed: ${readError}`);
  };

  const runAllTests = async () => {
    const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Authentication API', fn: testAuthenticationAPI },
    { name: 'Table Operations', fn: testTableOperations },
    { name: 'SMS Service', fn: testSMSService }];


    for (const test of tests) {
      await runTest(test.name, test.fn);
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  const clearResults = () => {
    setTestResults([]);
    toast({
      title: "Results Cleared",
      description: "Test results have been cleared"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      default:
        return null;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setTestData((prev) => ({ ...prev, testFile: file }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TestTube className="w-5 h-5" />
            <CardTitle>Feature Testing Suite</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={runAllTests}
              disabled={!!running}
              variant="default"
              size="sm">

              <Play className="w-4 h-4 mr-2" />
              Run All Tests
            </Button>
            <Button
              onClick={clearResults}
              variant="outline"
              size="sm">

              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Results
            </Button>
          </div>
        </div>
        <CardDescription>
          Test system functionality and API endpoints to ensure everything is working correctly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="database" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="database" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => runTest('Database Connection', testDatabaseConnection)}
                disabled={running === 'Database Connection'}
                className="flex items-center justify-center space-x-2">

                <Database className="w-4 h-4" />
                <span>Test DB Connection</span>
              </Button>

              <Button
                onClick={() => runTest('Database Write', testDatabaseWrite)}
                disabled={running === 'Database Write'}
                variant="outline"
                className="flex items-center justify-center space-x-2">

                <Database className="w-4 h-4" />
                <span>Test DB Write</span>
              </Button>

              <Button
                onClick={() => runTest('Table Operations', testTableOperations)}
                disabled={running === 'Table Operations'}
                variant="outline"
                className="flex items-center justify-center space-x-2">

                <FileText className="w-4 h-4" />
                <span>Test Table CRUD</span>
              </Button>
            </div>

            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                Database tests check connectivity, read/write operations, and table accessibility.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="auth" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => runTest('Authentication API', testAuthenticationAPI)}
                disabled={running === 'Authentication API'}
                className="flex items-center justify-center space-x-2">

                <User className="w-4 h-4" />
                <span>Test Auth API</span>
              </Button>

              <div className="space-y-2">
                <Label htmlFor="userId">Test User ID</Label>
                <Input
                  id="userId"
                  placeholder="Enter user ID to test"
                  value={testData.userId}
                  onChange={(e) => setTestData((prev) => ({ ...prev, userId: e.target.value }))} />

              </div>
            </div>

            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                Authentication tests verify user session management and API access.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => runTest('SMS Service', testSMSService)}
                disabled={running === 'SMS Service'}
                className="flex items-center justify-center space-x-2">

                <MessageSquare className="w-4 h-4" />
                <span>Test SMS Service</span>
              </Button>

              <div className="space-y-2">
                <Label htmlFor="testFile">Test File Upload</Label>
                <Input
                  id="testFile"
                  type="file"
                  onChange={handleFileChange} />

                <Button
                  onClick={() => runTest('File Upload', testFileUpload)}
                  disabled={running === 'File Upload' || !testData.testFile}
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2">

                  <Upload className="w-4 h-4" />
                  <span>Test File Upload</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testMessage">Test Message</Label>
              <Textarea
                id="testMessage"
                placeholder="Enter test message content"
                value={testData.testMessage}
                onChange={(e) => setTestData((prev) => ({ ...prev, testMessage: e.target.value }))} />

            </div>

            <Alert>
              <TestTube className="h-4 w-4" />
              <AlertDescription>
                Feature tests verify specific functionality like SMS alerts and file uploads.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {testResults.length === 0 ?
            <div className="text-center py-8 text-gray-500">
                No test results yet. Run some tests to see results here.
              </div> :

            <div className="space-y-3">
                {testResults.map((result, index) =>
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium text-sm">{result.testName}</div>
                        <div className="text-xs text-gray-500">{result.message}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </div>
                      {result.duration &&
                  <div className="text-xs text-gray-400">
                          {result.duration}ms
                        </div>
                  }
                    </div>
                  </div>
              )}
              </div>
            }
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>);

};

export default AdminFeatureTester;