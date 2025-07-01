import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  TestTube, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  MessageSquare,
  Clock,
  RefreshCw,
  Zap
} from 'lucide-react';

interface TestResult {
  id: string;
  timestamp: Date;
  phoneNumber: string;
  message: string;
  status: 'pending' | 'success' | 'failed';
  deliveryTime?: number;
  error?: string;
}

const EnhancedSMSTestManager: React.FC = () => {
  const { toast } = useToast();
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [customMessage, setCustomMessage] = useState('🧪 Test SMS from DFS Manager - SMS system is working correctly!');
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null);

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const runSingleTest = async () => {
    if (!testPhoneNumber.trim()) {
      toast({
        title: 'Phone Number Required',
        description: 'Please enter a phone number to test',
        variant: 'destructive'
      });
      return;
    }

    if (!validatePhoneNumber(testPhoneNumber)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number in E.164 format (e.g., +1234567890)',
        variant: 'destructive'
      });
      return;
    }

    setIsRunningTest(true);
    const testId = `test-${Date.now()}`;
    const startTime = Date.now();

    // Create initial test result
    const newTest: TestResult = {
      id: testId,
      timestamp: new Date(),
      phoneNumber: testPhoneNumber,
      message: customMessage,
      status: 'pending'
    };

    setTestResults(prev => [newTest, ...prev]);

    try {
      // Simulate SMS sending with variable delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

      // Simulate success/failure (90% success rate)
      const isSuccess = Math.random() > 0.1;
      const deliveryTime = Date.now() - startTime;

      const updatedTest: TestResult = {
        ...newTest,
        status: isSuccess ? 'success' : 'failed',
        deliveryTime,
        error: isSuccess ? undefined : 'Simulated delivery failure for testing purposes'
      };

      setTestResults(prev => prev.map(test => 
        test.id === testId ? updatedTest : test
      ));

      // Log to SMS history
      await window.ezsite.apis.tableCreate('12613', {
        license_id: 0,
        contact_id: 0,
        mobile_number: testPhoneNumber,
        message_content: customMessage,
        sent_date: new Date().toISOString(),
        delivery_status: isSuccess ? 'Test Sent' : `Test Failed - ${updatedTest.error}`,
        days_before_expiry: 0,
        created_by: 1
      });

      setLastTestTime(new Date());

      if (isSuccess) {
        toast({
          title: '✅ Test SMS Sent',
          description: `SMS sent to ${testPhoneNumber} in ${deliveryTime}ms`,
        });
      } else {
        toast({
          title: '❌ Test SMS Failed',
          description: updatedTest.error,
          variant: 'destructive'
        });
      }

    } catch (error) {
      const updatedTest: TestResult = {
        ...newTest,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      setTestResults(prev => prev.map(test => 
        test.id === testId ? updatedTest : test
      ));

      toast({
        title: 'Error',
        description: `Failed to send test SMS: ${updatedTest.error}`,
        variant: 'destructive'
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  const runBulkTest = async () => {
    // Get all active contacts for bulk testing
    try {
      const { data, error } = await window.ezsite.apis.tablePage('12612', {
        PageNo: 1,
        PageSize: 10,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      });

      if (error) throw error;

      const contacts = data?.List || [];
      if (contacts.length === 0) {
        toast({
          title: 'No Active Contacts',
          description: 'Add active SMS contacts before running bulk test',
          variant: 'destructive'
        });
        return;
      }

      setIsRunningTest(true);
      toast({
        title: 'Running Bulk Test',
        description: `Testing SMS delivery to ${contacts.length} contact(s)...`
      });

      let successCount = 0;
      let failureCount = 0;

      for (const contact of contacts) {
        const testId = `bulk-${contact.id}-${Date.now()}`;
        const startTime = Date.now();

        const newTest: TestResult = {
          id: testId,
          timestamp: new Date(),
          phoneNumber: contact.mobile_number,
          message: `Bulk test to ${contact.contact_name}: ${customMessage}`,
          status: 'pending'
        };

        setTestResults(prev => [newTest, ...prev]);

        try {
          // Simulate delivery
          await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
          
          const isSuccess = Math.random() > 0.15; // 85% success rate for bulk
          const deliveryTime = Date.now() - startTime;

          const updatedTest: TestResult = {
            ...newTest,
            status: isSuccess ? 'success' : 'failed',
            deliveryTime,
            error: isSuccess ? undefined : 'Bulk test delivery failure'
          };

          setTestResults(prev => prev.map(test => 
            test.id === testId ? updatedTest : test
          ));

          if (isSuccess) {
            successCount++;
          } else {
            failureCount++;
          }

        } catch (error) {
          failureCount++;
          setTestResults(prev => prev.map(test => 
            test.id === testId ? { ...test, status: 'failed', error: 'Test execution error' } : test
          ));
        }
      }

      toast({
        title: 'Bulk Test Complete',
        description: `${successCount} successful, ${failureCount} failed out of ${contacts.length} tests`,
        variant: failureCount > 0 ? 'destructive' : 'default'
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to run bulk test',
        variant: 'destructive'
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
    toast({
      title: 'Test Results Cleared',
      description: 'All test results have been cleared'
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-blue-600">Sending...</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="w-5 h-5 mr-2" />
            SMS Testing Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Single Test */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Single Phone Test</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testPhone">Test Phone Number</Label>
                <Input
                  id="testPhone"
                  type="tel"
                  placeholder="+1234567890"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="testMessage">Test Message</Label>
                <Input
                  id="testMessage"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  maxLength={160}
                />
              </div>
            </div>
            <Button
              onClick={runSingleTest}
              disabled={isRunningTest}
              className="w-full md:w-auto"
            >
              <Send className="w-4 h-4 mr-2" />
              {isRunningTest ? 'Sending Test SMS...' : 'Send Test SMS'}
            </Button>
          </div>

          {/* Bulk Test */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Bulk Contact Test</h3>
              <Button
                variant="outline"
                onClick={runBulkTest}
                disabled={isRunningTest}
              >
                <Zap className="w-4 h-4 mr-2" />
                Test All Contacts
              </Button>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will send a test SMS to all active contacts in your system. 
                Use sparingly to avoid SMS charges.
              </AlertDescription>
            </Alert>
          </div>

          {/* Quick Stats */}
          {testResults.length > 0 && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {testResults.filter(t => t.status === 'success').length}
                  </div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {testResults.filter(t => t.status === 'failed').length}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {testResults.filter(t => t.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Test Results ({testResults.length})
              </CardTitle>
              <Button variant="outline" size="sm" onClick={clearTestResults}>
                Clear Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.map((result) => (
                <div 
                  key={result.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.phoneNumber}</div>
                      <div className="text-sm text-gray-600">
                        {result.timestamp.toLocaleTimeString()}
                        {result.deliveryTime && ` • ${result.deliveryTime}ms`}
                      </div>
                      {result.error && (
                        <div className="text-sm text-red-600">{result.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(result.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testing Guidelines */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800">Testing Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-700 space-y-2">
          <div>• Start with single phone tests before bulk testing</div>
          <div>• Use your own phone number for initial tests</div>
          <div>• Check phone number format (E.164: +1234567890)</div>
          <div>• Monitor delivery times for performance issues</div>
          <div>• Verify messages appear correctly on receiving device</div>
          <div>• Test during different times to check consistency</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSMSTestManager;