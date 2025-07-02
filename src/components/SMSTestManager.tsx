import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { 
  Send, 
  TestTube, 
  MessageCircle, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Clock,
  DollarSign
} from 'lucide-react';
import { smsService } from '@/services/smsService';

interface TestResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
  cost?: number;
  status?: string;
}

const SMSTestManager: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      setLoading(true);
      await smsService.loadConfiguration();
      setIsConfigured(smsService.isServiceConfigured());
    } catch (error) {
      console.error('Error checking configuration:', error);
      setIsConfigured(false);
    } finally {
      setLoading(false);
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
  };

  const sendTestSMS = async () => {
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
        `DFS Manager Test SMS - ${new Date().toLocaleString()}. Sinch ClickSend SMS is working correctly!`;

      const response = await smsService.sendSMS({
        to: phoneNumber,
        message: message,
        type: 'test'
      });

      const result: TestResult = {
        success: response.success,
        messageId: response.messageId,
        error: response.error,
        timestamp: new Date(),
        cost: response.cost,
        status: response.status
      };

      setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results

      if (response.success) {
        toast({
          title: "Test SMS Sent",
          description: `Message sent successfully to ${phoneNumber}`,
        });
      } else {
        toast({
          title: "Test Failed",
          description: response.error || "Failed to send test SMS",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Test SMS error:', error);
      toast({
        title: "Error",
        description: "An error occurred while sending test SMS",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const sendQuickTest = async () => {
    try {
      setIsTesting(true);

      const response = await smsService.testSMS(phoneNumber);

      const result: TestResult = {
        success: response.success,
        messageId: response.messageId,
        error: response.error,
        timestamp: new Date(),
        cost: response.cost,
        status: response.status
      };

      setTestResults(prev => [result, ...prev.slice(0, 9)]);

      if (response.success) {
        toast({
          title: "Quick Test Sent",
          description: `Quick test message sent to ${phoneNumber}`,
        });
      } else {
        toast({
          title: "Quick Test Failed",
          description: response.error || "Failed to send quick test",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Quick test error:', error);
      toast({
        title: "Error",
        description: "An error occurred during quick test",
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
        <p className="mt-2 text-muted-foreground">Loading SMS configuration...</p>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            SMS Test Manager
          </CardTitle>
          <CardDescription>Test your Sinch ClickSend SMS service</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              SMS service is not configured. Please configure your Sinch ClickSend settings first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            SMS Test Manager
          </CardTitle>
          <CardDescription>
            Test your Sinch ClickSend SMS service with custom or quick test messages
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
            <p className="text-sm text-muted-foreground">
              Enter phone number in E.164 format (e.g., +1234567890)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Custom Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Enter custom test message (leave blank for default test message)"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={sendTestSMS} 
              disabled={isTesting || !phoneNumber}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isTesting ? 'Sending...' : 'Send Custom Test'}
            </Button>
            <Button 
              variant="outline"
              onClick={sendQuickTest} 
              disabled={isTesting || !phoneNumber}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              Quick Test
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Test Results
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
                      {result.messageId && (
                        <span className="text-sm text-muted-foreground">
                          ID: {result.messageId}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {result.timestamp.toLocaleString()}
                    </p>
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

export default SMSTestManager;
