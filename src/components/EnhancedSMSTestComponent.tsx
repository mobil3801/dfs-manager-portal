import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Phone, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  TestTube,
  Settings
} from 'lucide-react';
import { enhancedClickSendSmsService } from '@/services/enhancedClickSendSmsService';

const EnhancedSMSTestComponent: React.FC = () => {
  const { toast } = useToast();
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Test SMS from DFS Manager using ClickSend service.');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [serviceConfigured, setServiceConfigured] = useState(false);
  const [dailyUsage, setDailyUsage] = useState({ used: 0, limit: 100, percentage: 0 });
  const [accountBalance, setAccountBalance] = useState<number | null>(null);

  useEffect(() => {
    checkServiceStatus();
    loadDailyUsage();
    checkAccountBalance();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const configured = enhancedClickSendSmsService.isServiceConfigured();
      setServiceConfigured(configured);

      if (configured) {
        const testResult = await enhancedClickSendSmsService.testConnection();
        setConnectionStatus(testResult.success ? 'connected' : 'error');
        if (testResult.balance !== undefined) {
          setAccountBalance(testResult.balance);
        }
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Error checking service status:', error);
      setConnectionStatus('error');
    }
  };

  const loadDailyUsage = async () => {
    try {
      const usage = await enhancedClickSendSmsService.getDailyUsage();
      setDailyUsage(usage);
    } catch (error) {
      console.error('Error loading daily usage:', error);
    }
  };

  const checkAccountBalance = async () => {
    try {
      const balance = await enhancedClickSendSmsService.getAccountBalance();
      setAccountBalance(balance);
    } catch (error) {
      console.error('Error checking account balance:', error);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const result = await enhancedClickSendSmsService.testConnection();
      
      if (result.success) {
        setConnectionStatus('connected');
        if (result.balance !== undefined) {
          setAccountBalance(result.balance);
        }
        toast({
          title: "Connection Test Successful",
          description: "ClickSend SMS service is working correctly.",
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Connection Test Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Connection Test Error",
        description: `Failed to test connection: ${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestSMS = async () => {
    if (!testPhone || !testMessage) {
      toast({
        title: "Missing Information",
        description: "Please enter both phone number and message.",
        variant: "destructive",
      });
      return;
    }

    if (!serviceConfigured) {
      toast({
        title: "Service Not Configured",
        description: "SMS service is not properly configured. Please check your settings.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await enhancedClickSendSmsService.sendTestSMS(testPhone, testMessage);
      
      if (result.success) {
        toast({
          title: "Test SMS Sent Successfully",
          description: `Message sent to ${testPhone}. Message ID: ${result.messageId}`,
        });
        
        // Refresh usage after sending
        await loadDailyUsage();
      } else {
        throw new Error(result.error || 'Failed to send SMS');
      }
    } catch (error) {
      toast({
        title: "Test SMS Failed",
        description: `Failed to send test SMS: ${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshConfiguration = async () => {
    setLoading(true);
    try {
      await enhancedClickSendSmsService.refreshConfiguration();
      await checkServiceStatus();
      await loadDailyUsage();
      toast({
        title: "Configuration Refreshed",
        description: "SMS service configuration has been reloaded from database.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: `Failed to refresh configuration: ${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!serviceConfigured) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Not Configured</Badge>;
    }
    
    switch (connectionStatus) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Connection Error</Badge>;
      default:
        return <Badge variant="secondary"><RefreshCw className="w-3 h-3 mr-1" />Unknown</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <TestTube className="w-5 h-5 mr-2" />
              Enhanced SMS Service Test
            </span>
            {getStatusBadge()}
          </CardTitle>
          <CardDescription>
            Test ClickSend SMS integration with real-time status monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!serviceConfigured && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                SMS service is not configured. Please configure ClickSend settings in the Admin Panel first.
              </AlertDescription>
            </Alert>
          )}

          {/* Service Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Daily Usage</span>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{dailyUsage.used}/{dailyUsage.limit}</div>
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(dailyUsage.percentage, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Service Status</span>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-lg font-bold">
                {serviceConfigured ? 'Active' : 'Inactive'}
              </div>
              <div className="text-sm text-muted-foreground">
                ClickSend SMS
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Balance</span>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-lg font-bold">
                {accountBalance !== null ? formatCurrency(accountBalance) : 'Unknown'}
              </div>
              <div className="text-sm text-muted-foreground">
                Available Credit
              </div>
            </div>
          </div>

          {/* Test SMS Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test_phone">Phone Number</Label>
              <Input
                id="test_phone"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+1234567890"
                disabled={!serviceConfigured}
              />
              <p className="text-sm text-muted-foreground">
                Use E.164 format (e.g., +1234567890)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test_message">Test Message</Label>
              <Textarea
                id="test_message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter your test message here..."
                rows={3}
                disabled={!serviceConfigured}
              />
              <p className="text-sm text-muted-foreground">
                {testMessage.length}/160 characters
              </p>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={sendTestSMS} 
                disabled={loading || !serviceConfigured || !testPhone || !testMessage}
                className="flex-1"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Send Test SMS
              </Button>
              
              <Button 
                variant="outline" 
                onClick={testConnection} 
                disabled={loading}
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
                Test Connection
              </Button>
              
              <Button 
                variant="outline" 
                onClick={refreshConfiguration} 
                disabled={loading}
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Refresh Config
              </Button>
            </div>
          </div>

          {/* Service Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Service Information</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Using ClickSend SMS service with provided credentials</p>
              <p>• Service configured: {serviceConfigured ? 'Yes' : 'No'}</p>
              <p>• Connection status: {connectionStatus}</p>
              <p>• Daily limit: {dailyUsage.limit} messages</p>
              <p>• Messages used today: {dailyUsage.used}</p>
              {accountBalance !== null && <p>• Account balance: {formatCurrency(accountBalance)}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSMSTestComponent;
