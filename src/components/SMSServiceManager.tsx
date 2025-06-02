import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  MessageSquare,
  Settings,
  TestTube,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Send,
  Activity,
  Smartphone,
  TrendingUp } from
'lucide-react';
import smsService from '@/services/smsService';

interface ServiceStatus {
  available: boolean;
  message: string;
  providers?: any[];
  quota?: any;
}

interface TestResult {
  phoneNumber: string;
  message: string;
  success: boolean;
  error?: string;
  timestamp: Date;
  provider?: string;
  messageId?: string;
}

const SMSServiceManager: React.FC = () => {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Hello! This is a test message from DFS Manager SMS Service. 📱✅');
  const [sendingTest, setSendingTest] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkServiceStatus();
    loadRecentTests();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        checkServiceStatus();
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const checkServiceStatus = async () => {
    try {
      setLoading(true);
      const status = await smsService.getServiceStatus();
      setServiceStatus(status);
    } catch (error) {
      console.error('Error checking SMS service status:', error);
      setServiceStatus({
        available: false,
        message: 'Error checking service status'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTests = () => {
    // Load test results from localStorage for persistence
    const stored = localStorage.getItem('sms_test_results');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTestResults(parsed.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp)
        })));
      } catch (error) {
        console.error('Error loading test results:', error);
      }
    }
  };

  const saveTestResults = (results: TestResult[]) => {
    localStorage.setItem('sms_test_results', JSON.stringify(results));
  };

  const sendTestSMS = async () => {
    if (!testPhone.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number to test SMS functionality.",
        variant: "destructive"
      });
      return;
    }

    if (!smsService.isValidPhoneNumber(testPhone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number (e.g., +1234567890 or 1234567890).",
        variant: "destructive"
      });
      return;
    }

    try {
      setSendingTest(true);

      const result = await smsService.sendSMS(testPhone, testMessage);

      const testResult: TestResult = {
        phoneNumber: testPhone,
        message: testMessage,
        success: result.success,
        error: result.error,
        timestamp: new Date(),
        provider: result.provider,
        messageId: result.messageId
      };

      const newResults = [testResult, ...testResults.slice(0, 9)]; // Keep last 10 tests
      setTestResults(newResults);
      saveTestResults(newResults);

      if (result.success) {
        toast({
          title: "✅ Test SMS Sent Successfully",
          description: `SMS sent to ${testPhone} via ${result.provider}. Check your device!`
        });
      } else {
        toast({
          title: "❌ Test SMS Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending test SMS:', error);
      toast({
        title: "Error",
        description: "Failed to send test SMS",
        variant: "destructive"
      });
    } finally {
      setSendingTest(false);
    }
  };

  const clearTestHistory = () => {
    setTestResults([]);
    localStorage.removeItem('sms_test_results');
    toast({
      title: "Test History Cleared",
      description: "All SMS test results have been cleared."
    });
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString();
  };

  const getStatusIcon = (available: boolean) => {
    return available ?
    <CheckCircle className="w-5 h-5 text-green-500" /> :

    <AlertCircle className="w-5 h-5 text-red-500" />;

  };

  return (
    <div className="space-y-6">
      {/* Service Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              SMS Service Status
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh} />

                <Label htmlFor="auto-refresh" className="text-sm">Auto Refresh</Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={checkServiceStatus}
                disabled={loading}>

                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {serviceStatus ?
          <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(serviceStatus.available)}
                <span className={`font-medium ${serviceStatus.available ? 'text-green-600' : 'text-red-600'}`}>
                  {serviceStatus.message}
                </span>
              </div>

              {/* Provider Status */}
              {serviceStatus.providers && serviceStatus.providers.length > 0 &&
            <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Provider Status:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {serviceStatus.providers.map((provider, index) =>
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{provider.name}</span>
                        <Badge variant={provider.available ? 'default' : 'secondary'}>
                          {provider.available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                )}
                  </div>
                </div>
            }

              {/* Quota Information */}
              {serviceStatus.quota &&
            <div className="bg-blue-50 p-3 rounded">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-800">Free SMS Quota</span>
                    <Badge variant="outline" className="text-blue-600">
                      {serviceStatus.quota.quotaRemaining || 0} remaining
                    </Badge>
                  </div>
                </div>
            }
            </div> :

          <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Loading service status...</p>
              </div>
            </div>
          }
        </CardContent>
      </Card>

      {/* SMS Testing Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="w-5 h-5 mr-2" />
            SMS Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="test-phone">Test Phone Number</Label>
              <Input
                id="test-phone"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+1234567890 or 1234567890"
                className="mt-1" />

              {testPhone && !smsService.isValidPhoneNumber(testPhone) &&
              <p className="text-sm text-red-500 mt-1">
                  Please enter a valid phone number
                </p>
              }
            </div>
            <div>
              <Label htmlFor="test-message">Test Message</Label>
              <Textarea
                id="test-message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter your test message..."
                rows={3}
                className="mt-1" />

              <p className="text-xs text-gray-500 mt-1">
                {testMessage.length}/1600 characters
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              onClick={sendTestSMS}
              disabled={sendingTest || !serviceStatus?.available}
              className="bg-blue-600 hover:bg-blue-700">

              <Send className="w-4 h-4 mr-2" />
              {sendingTest ? 'Sending...' : 'Send Test SMS'}
            </Button>
            
            {testResults.length > 0 &&
            <Button
              variant="outline"
              onClick={clearTestHistory}
              size="sm">

                Clear History
              </Button>
            }
          </div>
        </CardContent>
      </Card>

      {/* Test Results History */}
      {testResults.length > 0 &&
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Recent Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) =>
            <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Smartphone className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{result.phoneNumber}</span>
                        <Badge variant={result.success ? 'default' : 'destructive'}>
                          {result.success ? 'Success' : 'Failed'}
                        </Badge>
                        {result.provider &&
                    <Badge variant="outline" className="text-xs">
                            {result.provider}
                          </Badge>
                    }
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{result.message}</p>
                      {result.error &&
                  <p className="text-sm text-red-600">Error: {result.error}</p>
                  }
                      {result.messageId &&
                  <p className="text-xs text-gray-500">Message ID: {result.messageId}</p>
                  }
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {formatTimestamp(result.timestamp)}
                    </div>
                  </div>
                </div>
            )}
            </div>
          </CardContent>
        </Card>
      }

      {/* Service Configuration Help */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            SMS Service Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
              <p className="font-medium text-yellow-800">Current Configuration:</p>
              <p className="text-yellow-700">Using TextBelt free tier for testing. For production use, configure Twilio or another premium SMS provider.</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">To configure Twilio for production:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Sign up for a Twilio account at twilio.com</li>
                <li>Get your Account SID and Auth Token</li>
                <li>Purchase a phone number</li>
                <li>Update the SMS service configuration</li>
                <li>Test the integration using this interface</li>
              </ol>
            </div>

            <div className="bg-blue-50 p-3 rounded">
              <p className="font-medium text-blue-800">Supported Features:</p>
              <ul className="list-disc list-inside text-blue-700 text-xs space-y-1">
                <li>Multiple SMS provider support with failover</li>
                <li>Phone number validation and formatting</li>
                <li>Message length validation</li>
                <li>Delivery status tracking</li>
                <li>Quota monitoring</li>
                <li>Test message functionality</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default SMSServiceManager;