import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  Send, 
  TestTube, 
  MessageCircle, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  Zap
} from 'lucide-react';
import { smsService } from '@/services/smsService';
import { enhancedSmsService } from '@/services/enhancedSmsService';

interface TestResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
  cost?: number;
  status?: string;
  phoneNumber: string;
}

interface BulkTestJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalMessages: number;
  sentMessages: number;
  failedMessages: number;
  progress: number;
}

const EnhancedSMSTestManager: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [bulkPhoneNumbers, setBulkPhoneNumbers] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [bulkJob, setBulkJob] = useState<BulkTestJob | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isBulkTesting, setIsBulkTesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serviceHealth, setServiceHealth] = useState<any>(null);

  useEffect(() => {
    initializeService();
    const interval = setInterval(checkBulkJobStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const initializeService = async () => {
    try {
      setLoading(true);
      await smsService.loadConfiguration();
      setIsConfigured(smsService.isServiceConfigured());
      
      if (smsService.isServiceConfigured()) {
        const health = await enhancedSmsService.getServiceHealth();
        setServiceHealth(health);
      }
    } catch (error) {
      console.error('Error initializing service:', error);
      setIsConfigured(false);
    } finally {
      setLoading(false);
    }
  };

  const checkBulkJobStatus = () => {
    if (bulkJob && bulkJob.status === 'processing') {
      // Simulate progress update
      setBulkJob(prev => {
        if (!prev) return null;
        const newProgress = Math.min(prev.progress + 5, 100);
        const newSent = Math.floor((newProgress / 100) * prev.totalMessages);
        
        if (newProgress >= 100) {
          return {
            ...prev,
            progress: 100,
            sentMessages: prev.totalMessages,
            status: 'completed'
          };
        }
        
        return {
          ...prev,
          progress: newProgress,
          sentMessages: newSent
        };
      });
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
  };

  const sendSingleTest = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive"
      });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Error", 
        description: "Please enter a valid phone number in E.164 format (+1234567890)",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsTesting(true);

      const message = customMessage || 
        `DFS Manager Enhanced Test - ${new Date().toLocaleString()}. Sinch ClickSend SMS service is working perfectly!`;

      const response = await enhancedSmsService.sendAdvancedSMS(phoneNumber, message, {
        priority: 'high',
        deliveryReport: true
      });

      const result: TestResult = {
        success: response.success,
        messageId: response.messageId,
        error: response.error,
        timestamp: new Date(),
        cost: response.cost,
        status: response.status,
        phoneNumber: phoneNumber
      };

      setTestResults(prev => [result, ...prev.slice(0, 19)]); // Keep last 20 results

      if (response.success) {
        toast({
          title: "Enhanced Test Sent",
          description: `Advanced test message sent successfully to ${phoneNumber}`,
        });
      } else {
        toast({
          title: "Test Failed",
          description: response.error || "Failed to send enhanced test SMS",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Enhanced test error:', error);
      toast({
        title: "Error",
        description: "An error occurred while sending enhanced test",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const sendBulkTest = async () => {
    const phoneNumbers = bulkPhoneNumbers
      .split('\n')
      .map(num => num.trim())
      .filter(num => num.length > 0);

    if (phoneNumbers.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one phone number",
        variant: "destructive"
      });
      return;
    }

    // Validate all phone numbers
    const invalidNumbers = phoneNumbers.filter(num => !validatePhoneNumber(num));
    if (invalidNumbers.length > 0) {
      toast({
        title: "Invalid Phone Numbers",
        description: `${invalidNumbers.length} invalid phone number(s) found. Please check E.164 format.`,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsBulkTesting(true);

      const job: BulkTestJob = {
        id: `bulk_test_${Date.now()}`,
        status: 'processing',
        totalMessages: phoneNumbers.length,
        sentMessages: 0,
        failedMessages: 0,
        progress: 0
      };

      setBulkJob(job);

      const message = customMessage || 
        `DFS Manager Bulk Test - ${new Date().toLocaleString()}. This is a bulk SMS test from Sinch ClickSend.`;

      // Process bulk SMS
      const messages = phoneNumbers.map(phone => ({
        phoneNumber: phone,
        message: message,
        options: { priority: 'normal' as const, deliveryReport: true }
      }));

      const bulkJobResult = await enhancedSmsService.sendBulkSMSWithProgress(messages);

      toast({
        title: "Bulk Test Started",
        description: `Started bulk test for ${phoneNumbers.length} phone numbers`,
      });

    } catch (error) {
      console.error('Bulk test error:', error);
      toast({
        title: "Bulk Test Failed",
        description: "Failed to start bulk SMS test",
        variant: "destructive"
      });
      setBulkJob(null);
    } finally {
      setIsBulkTesting(false);
    }
  };

  const sendEmergencyTest = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number for emergency test",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsTesting(true);

      const emergencyMessage = `🚨 EMERGENCY TEST ALERT: This is a test of the emergency notification system. Sent at ${new Date().toLocaleString()}. If this were a real emergency, you would receive specific instructions.`;

      const results = await enhancedSmsService.sendEmergencyAlert(emergencyMessage, {
        priority: 'high'
      });

      if (results.length > 0 && results[0].success) {
        toast({
          title: "Emergency Test Sent",
          description: "Emergency test alert sent successfully",
        });
      } else {
        toast({
          title: "Emergency Test Failed",
          description: "Failed to send emergency test alert",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Emergency test error:', error);
      toast({
        title: "Error",
        description: "An error occurred during emergency test",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusBadge = (result: TestResult) => {
    if (result.success) {
      return (
        <Badge variant="secondary" className="text-green-700 bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Success
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading enhanced SMS test manager...</p>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Enhanced SMS Test Manager
          </CardTitle>
          <CardDescription>Advanced SMS testing with Sinch ClickSend</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sinch ClickSend SMS service is not configured. Please configure your settings first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Health Status */}
      {serviceHealth && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span className="font-medium">Sinch ClickSend Service Health</span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={serviceHealth.status === 'healthy' ? 'secondary' : 'destructive'}>
                  {serviceHealth.status}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Balance: ${serviceHealth.balance?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single">Single Test</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Test</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Test</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Single SMS Test
              </CardTitle>
              <CardDescription>
                Send a single test message with advanced features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Custom Message (Optional)
                </Label>
                <Textarea
                  id="message"
                  placeholder="Enter custom test message (leave blank for default)"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={sendSingleTest} 
                disabled={isTesting || !phoneNumber}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isTesting ? 'Sending Enhanced Test...' : 'Send Enhanced Test'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Bulk SMS Test
              </CardTitle>
              <CardDescription>
                Send test messages to multiple phone numbers simultaneously
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulk_phones" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Numbers (one per line)
                </Label>
                <Textarea
                  id="bulk_phones"
                  placeholder="+1234567890&#10;+1987654321&#10;+1555123456"
                  value={bulkPhoneNumbers}
                  onChange={(e) => setBulkPhoneNumbers(e.target.value)}
                  rows={5}
                />
                <p className="text-sm text-muted-foreground">
                  Enter phone numbers in E.164 format, one per line
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk_message">Bulk Message (Optional)</Label>
                <Textarea
                  id="bulk_message"
                  placeholder="Enter message for bulk test (leave blank for default)"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={sendBulkTest} 
                disabled={isBulkTesting || !bulkPhoneNumbers.trim()}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                {isBulkTesting ? 'Starting Bulk Test...' : 'Start Bulk Test'}
              </Button>

              {bulkJob && (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Bulk Test Progress</span>
                        <Badge variant={bulkJob.status === 'completed' ? 'secondary' : 'outline'}>
                          {bulkJob.status}
                        </Badge>
                      </div>
                      
                      <Progress value={bulkJob.progress} className="w-full" />
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total: </span>
                          <span className="font-medium">{bulkJob.totalMessages}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sent: </span>
                          <span className="font-medium text-green-600">{bulkJob.sentMessages}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Failed: </span>
                          <span className="font-medium text-red-600">{bulkJob.failedMessages}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Emergency Alert Test
              </CardTitle>
              <CardDescription>
                Test emergency notification system with high priority alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will send a high-priority emergency test alert. Use only for testing purposes.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="emergency_phone">Emergency Contact Number</Label>
                <Input
                  id="emergency_phone"
                  type="text"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <Button 
                onClick={sendEmergencyTest} 
                disabled={isTesting || !phoneNumber}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                {isTesting ? 'Sending Emergency Test...' : 'Send Emergency Test'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Test Results History
            </CardTitle>
            <CardDescription>
              Recent SMS test results and delivery status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(result)}
                      <span className="text-sm font-medium">{result.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{result.timestamp.toLocaleString()}</span>
                      {result.messageId && <span>ID: {result.messageId}</span>}
                    </div>
                    {result.error && (
                      <p className="text-sm text-red-600">{result.error}</p>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    {result.cost && (
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-3 w-3" />
                        ${result.cost.toFixed(4)}
                      </div>
                    )}
                    {result.status && (
                      <Badge variant="outline" className="text-xs">
                        {result.status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedSMSTestManager;
