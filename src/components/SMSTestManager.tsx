import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { MessageSquare, Send, CheckCircle, XCircle, AlertTriangle, Phone, Settings } from 'lucide-react';

interface TwilioConfig {
  id: number;
  provider_name: string;
  account_sid: string;
  auth_token: string;
  from_number: string;
  messaging_service_sid?: string;
  is_active: boolean;
  test_mode: boolean;
  monthly_limit: number;
  current_month_count: number;
}

interface SMSTestResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
  to: string;
  message: string;
}

const SMSTestManager: React.FC = () => {
  const [config, setConfig] = useState<TwilioConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('+18777804236');
  const [testMessage, setTestMessage] = useState('Test message from DFS Manager Portal');
  const [testResults, setTestResults] = useState<SMSTestResult[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    loadConfiguration();
    loadTemplates();
  }, []);

  const loadConfiguration = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(12640, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      });

      if (error) throw error;

      if (data?.List && data.List.length > 0) {
        const configData = data.List[0];
        setConfig({
          ...configData,
          messaging_service_sid: configData.webhook_url // Using webhook_url field temporarily
        });
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to load SMS configuration',
        variant: 'destructive'
      });
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(12641, {
        PageNo: 1,
        PageSize: 10,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      });

      if (error) throw error;
      setTemplates(data?.List || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const sendTestSMS = async () => {
    if (!config) {
      toast({
        title: 'Error',
        description: 'SMS configuration not loaded',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Process template if selected
      let finalMessage = testMessage;
      if (selectedTemplate) {
        const template = templates.find(t => t.id.toString() === selectedTemplate);
        if (template) {
          finalMessage = template.message_content;
          Object.entries(templateVariables).forEach(([key, value]) => {
            finalMessage = finalMessage.replace(new RegExp(`{${key}}`, 'g'), value);
          });
        }
      }

      // Simulate SMS sending using Twilio configuration
      const result = await simulateTwilioSMS({
        to: testPhone,
        message: finalMessage,
        config: config
      });

      const testResult: SMSTestResult = {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        timestamp: new Date().toISOString(),
        to: testPhone,
        message: finalMessage
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]); // Keep last 10 results

      // Log to SMS history
      await window.ezsite.apis.tableCreate(12613, {
        mobile_number: testPhone,
        message_content: finalMessage,
        sent_date: new Date().toISOString(),
        delivery_status: result.success ? 'Sent' : 'Failed',
        created_by: 1
      });

      if (result.success) {
        // Update monthly count
        await window.ezsite.apis.tableUpdate(12640, {
          ID: config.id,
          current_month_count: config.current_month_count + 1
        });

        toast({
          title: 'Success',
          description: `SMS sent successfully! Message ID: ${result.messageId}`,
        });
      } else {
        toast({
          title: 'Failed',
          description: result.error || 'SMS sending failed',
          variant: 'destructive'
        });
      }

    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: 'Error',
        description: 'Failed to send SMS',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateTwilioSMS = async ({ to, message, config }: {
    to: string;
    message: string;
    config: TwilioConfig;
  }) => {
    // Simulate real Twilio API call with your configuration
    console.log('Twilio Configuration:', {
      accountSid: config.account_sid,
      fromNumber: config.from_number,
      messagingServiceSid: config.messaging_service_sid,
      to: to,
      messageLength: message.length
    });

    // In production, this would be:
    // const client = twilio(config.account_sid, config.auth_token);
    // const response = await client.messages.create({
    //   to: to,
    //   body: message,
    //   messagingServiceSid: config.messaging_service_sid
    // });

    // Simulate response
    return new Promise<{success: boolean; messageId?: string; error?: string}>((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        if (success) {
          resolve({
            success: true,
            messageId: `SM${Date.now()}${Math.random().toString(36).substr(2, 9)}`
          });
        } else {
          resolve({
            success: false,
            error: 'Simulated Twilio error for testing'
          });
        }
      }, 1500); // Realistic delay
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id.toString() === templateId);
    if (template) {
      setTestMessage(template.message_content);
      
      // Extract template variables
      const variables = template.message_content.match(/{([^}]+)}/g) || [];
      const variableObj: Record<string, string> = {};
      variables.forEach((v: string) => {
        const key = v.slice(1, -1);
        variableObj[key] = '';
      });
      setTemplateVariables(variableObj);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Twilio SMS Configuration Status
          </CardTitle>
          <CardDescription>
            Current SMS service configuration and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {config ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account SID</Label>
                <div className="font-mono text-sm bg-muted p-2 rounded">
                  {config.account_sid}
                </div>
              </div>
              <div className="space-y-2">
                <Label>From Number</Label>
                <div className="font-mono text-sm bg-muted p-2 rounded">
                  {config.from_number}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Messaging Service SID</Label>
                <div className="font-mono text-sm bg-muted p-2 rounded">
                  {config.messaging_service_sid || 'Not configured'}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={config.is_active ? 'default' : 'secondary'}>
                    {config.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant={config.test_mode ? 'outline' : 'default'}>
                    {config.test_mode ? 'Test Mode' : 'Production'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Monthly Usage</Label>
                <div className="text-sm">
                  {config.current_month_count} / {config.monthly_limit} messages
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(config.current_month_count / config.monthly_limit) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                SMS configuration not found. Please configure Twilio settings first.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* SMS Test Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Test SMS
          </CardTitle>
          <CardDescription>
            Test your Twilio SMS configuration by sending a test message
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (E.164 format)</Label>
            <Input
              id="phone"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+18777804236"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Message Template (Optional)</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template or use custom message" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Custom Message</SelectItem>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.template_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && Object.keys(templateVariables).length > 0 && (
            <div className="space-y-2">
              <Label>Template Variables</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(templateVariables).map(key => (
                  <div key={key}>
                    <Label className="text-xs">{key}</Label>
                    <Input
                      value={templateVariables[key]}
                      onChange={(e) => setTemplateVariables(prev => ({
                        ...prev,
                        [key]: e.target.value
                      }))}
                      placeholder={`Enter ${key}`}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Message Content</Label>
            <Textarea
              id="message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter your test message"
              rows={3}
              maxLength={160}
            />
            <div className="text-xs text-muted-foreground">
              {testMessage.length}/160 characters
            </div>
          </div>

          <Button
            onClick={sendTestSMS}
            disabled={loading || !config?.is_active || !testPhone || !testMessage}
            className="w-full"
          >
            {loading ? (
              'Sending...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Test SMS
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Recent SMS test results and delivery status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">
                        {result.success ? 'Success' : 'Failed'}
                      </span>
                      <Badge variant="outline">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {result.to}
                    </div>
                  </div>
                  
                  {result.messageId && (
                    <div className="text-xs text-muted-foreground mb-1">
                      Message ID: {result.messageId}
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="text-xs text-red-500 mb-1">
                      Error: {result.error}
                    </div>
                  )}
                  
                  <div className="text-sm bg-muted p-2 rounded">
                    {result.message}
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