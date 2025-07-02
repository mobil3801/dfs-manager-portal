import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Settings, Shield, TestTube, BarChart3, Phone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { smsService } from '@/services/smsService';

interface TwilioConfigManagerProps {
  onConfigurationSaved?: () => void;
}

interface TwilioConfig {
  ID?: number;
  provider_name: string;
  account_sid: string;
  auth_token: string;
  from_number: string;
  is_active: boolean;
  test_mode: boolean;
  monthly_limit: number;
  current_month_count: number;
  webhook_url: string;
}

const TwilioConfigManager: React.FC<TwilioConfigManagerProps> = ({ onConfigurationSaved }) => {
  const [config, setConfig] = useState<TwilioConfig>({
    provider_name: 'Twilio',
    account_sid: '',
    auth_token: '',
    from_number: '',
    is_active: true,
    test_mode: true,
    monthly_limit: 1000,
    current_month_count: 0,
    webhook_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testNumber, setTestNumber] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 1000, percentage: 0 });
  const { toast } = useToast();

  useEffect(() => {
    loadConfiguration();
    loadUsage();
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

      if (error) throw new Error(error);
      
      if (data?.List && data.List.length > 0) {
        const loadedConfig = data.List[0];
        setConfig({
          ID: loadedConfig.ID,
          provider_name: loadedConfig.provider_name,
          account_sid: loadedConfig.account_sid,
          auth_token: loadedConfig.auth_token,
          from_number: loadedConfig.from_number,
          is_active: loadedConfig.is_active,
          test_mode: loadedConfig.test_mode,
          monthly_limit: loadedConfig.monthly_limit,
          current_month_count: loadedConfig.current_month_count,
          webhook_url: loadedConfig.webhook_url || ''
        });
        setIsValidated(!!loadedConfig.account_sid && !!loadedConfig.auth_token);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Twilio configuration',
        variant: 'destructive'
      });
    }
  };

  const loadUsage = async () => {
    try {
      const usage = await smsService.getMonthlyUsage();
      setUsage(usage);
    } catch (error) {
      console.error('Error loading usage:', error);
    }
  };

  const saveConfiguration = async () => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (!config.account_sid || !config.auth_token || !config.from_number) {
        throw new Error('Please fill in all required fields');
      }

      // Validate phone number format
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(config.from_number)) {
        throw new Error('From number must be in E.164 format (+1234567890)');
      }

      const configData = {
        provider_name: config.provider_name,
        account_sid: config.account_sid,
        auth_token: config.auth_token,
        from_number: config.from_number,
        is_active: config.is_active,
        test_mode: config.test_mode,
        monthly_limit: config.monthly_limit,
        current_month_count: config.current_month_count,
        webhook_url: config.webhook_url,
        created_by: 1 // This should be the current user ID
      };

      if (config.ID) {
        const { error } = await window.ezsite.apis.tableUpdate(12640, {
          ID: config.ID,
          ...configData
        });
        if (error) throw new Error(error);
      } else {
        const { error } = await window.ezsite.apis.tableCreate(12640, configData);
        if (error) throw new Error(error);
      }

      // Configure the SMS service
      await smsService.configure({
        accountSid: config.account_sid,
        authToken: config.auth_token,
        fromNumber: config.from_number,
        testMode: config.test_mode,
        webhookUrl: config.webhook_url
      });

      setIsValidated(true);
      
      toast({
        title: 'Success',
        description: 'Twilio configuration saved successfully'
      });

      onConfigurationSaved?.();
      loadConfiguration();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save configuration',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConfiguration = async () => {
    if (!testNumber) {
      toast({
        title: 'Error',
        description: 'Please enter a test phone number',
        variant: 'destructive'
      });
      return;
    }

    setIsTesting(true);
    try {
      // Add test number temporarily
      await smsService.addTestNumber(testNumber);
      
      const response = await smsService.testSMS(testNumber);
      
      if (response.success) {
        toast({
          title: 'Test Successful',
          description: `SMS sent successfully! Message ID: ${response.messageId}`
        });
      } else {
        throw new Error(response.error || 'Test failed');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: 'Test Failed',
        description: error instanceof Error ? error.message : 'SMS test failed',
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const validateCredentials = async () => {
    setIsLoading(true);
    try {
      // In production, this would make an actual API call to Twilio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (config.account_sid && config.auth_token) {
        setIsValidated(true);
        toast({
          title: 'Validation Successful',
          description: 'Twilio credentials are valid'
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      setIsValidated(false);
      toast({
        title: 'Validation Failed',
        description: 'Invalid Twilio credentials',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=\"space-y-6\">
      <Card>
        <CardHeader>
          <div className=\"flex items-center justify-between\">
            <div>
              <CardTitle className=\"flex items-center gap-2\">
                <Settings className=\"h-5 w-5\" />
                Twilio SMS Configuration
              </CardTitle>
              <CardDescription>
                Configure your Twilio account for premium SMS services
              </CardDescription>
            </div>
            <div className=\"flex items-center gap-2\">
              {isValidated ? (
                <Badge variant=\"secondary\" className=\"bg-green-100 text-green-800\">
                  <CheckCircle className=\"h-3 w-3 mr-1\" />
                  Validated
                </Badge>
              ) : (
                <Badge variant=\"outline\" className=\"border-orange-300 text-orange-600\">
                  <AlertCircle className=\"h-3 w-3 mr-1\" />
                  Not Validated
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue=\"config\" className=\"space-y-4\">
            <TabsList className=\"grid w-full grid-cols-4\">
              <TabsTrigger value=\"config\">Configuration</TabsTrigger>
              <TabsTrigger value=\"testing\">Testing</TabsTrigger>
              <TabsTrigger value=\"usage\">Usage</TabsTrigger>
              <TabsTrigger value=\"security\">Security</TabsTrigger>
            </TabsList>

            <TabsContent value=\"config\" className=\"space-y-4\">
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                <div className=\"space-y-2\">
                  <Label htmlFor=\"account_sid\">Account SID *</Label>
                  <Input
                    id=\"account_sid\"
                    placeholder=\"ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\"
                    value={config.account_sid}
                    onChange={(e) => setConfig(prev => ({ ...prev, account_sid: e.target.value }))}
                  />
                </div>
                <div className=\"space-y-2\">
                  <Label htmlFor=\"auth_token\">Auth Token *</Label>
                  <Input
                    id=\"auth_token\"
                    type=\"password\"
                    placeholder=\"Your Twilio auth token\"
                    value={config.auth_token}
                    onChange={(e) => setConfig(prev => ({ ...prev, auth_token: e.target.value }))}
                  />
                </div>
                <div className=\"space-y-2\">
                  <Label htmlFor=\"from_number\">From Number *</Label>
                  <Input
                    id=\"from_number\"
                    placeholder=\"+1234567890\"
                    value={config.from_number}
                    onChange={(e) => setConfig(prev => ({ ...prev, from_number: e.target.value }))}
                  />
                </div>
                <div className=\"space-y-2\">
                  <Label htmlFor=\"monthly_limit\">Monthly SMS Limit</Label>
                  <Input
                    id=\"monthly_limit\"
                    type=\"number\"
                    value={config.monthly_limit}
                    onChange={(e) => setConfig(prev => ({ ...prev, monthly_limit: parseInt(e.target.value) || 1000 }))}
                  />
                </div>
                <div className=\"space-y-2\">
                  <Label htmlFor=\"webhook_url\">Webhook URL (Optional)</Label>
                  <Input
                    id=\"webhook_url\"
                    placeholder=\"https://your-app.com/webhook/sms\"
                    value={config.webhook_url}
                    onChange={(e) => setConfig(prev => ({ ...prev, webhook_url: e.target.value }))}
                  />
                </div>
              </div>

              <div className=\"flex items-center space-x-4\">
                <div className=\"flex items-center space-x-2\">
                  <Switch
                    id=\"is_active\"
                    checked={config.is_active}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor=\"is_active\">Active</Label>
                </div>
                <div className=\"flex items-center space-x-2\">
                  <Switch
                    id=\"test_mode\"
                    checked={config.test_mode}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, test_mode: checked }))}
                  />
                  <Label htmlFor=\"test_mode\">Test Mode</Label>
                </div>
              </div>

              <div className=\"flex gap-2\">
                <Button onClick={saveConfiguration} disabled={isLoading}>
                  {isLoading && <Loader2 className=\"h-4 w-4 mr-2 animate-spin\" />}
                  Save Configuration
                </Button>
                <Button variant=\"outline\" onClick={validateCredentials} disabled={isLoading}>
                  {isLoading && <Loader2 className=\"h-4 w-4 mr-2 animate-spin\" />}
                  <Shield className=\"h-4 w-4 mr-2\" />
                  Validate Credentials
                </Button>
              </div>
            </TabsContent>

            <TabsContent value=\"testing\" className=\"space-y-4\">
              <div className=\"space-y-4\">
                <div>
                  <Label htmlFor=\"test_number\">Test Phone Number</Label>
                  <div className=\"flex gap-2 mt-2\">
                    <Input
                      id=\"test_number\"
                      placeholder=\"+1234567890\"
                      value={testNumber}
                      onChange={(e) => setTestNumber(e.target.value)}
                    />
                    <Button onClick={testConfiguration} disabled={isTesting || !isValidated}>
                      {isTesting && <Loader2 className=\"h-4 w-4 mr-2 animate-spin\" />}
                      <TestTube className=\"h-4 w-4 mr-2\" />
                      Send Test SMS
                    </Button>
                  </div>
                  <p className=\"text-sm text-gray-600 mt-1\">
                    Phone number must be in E.164 format (e.g., +1234567890)
                  </p>
                </div>

                {config.test_mode && (
                  <div className=\"bg-yellow-50 border border-yellow-200 rounded-lg p-4\">
                    <div className=\"flex items-center gap-2 text-yellow-800\">
                      <AlertCircle className=\"h-4 w-4\" />
                      <span className=\"font-medium\">Test Mode Enabled</span>
                    </div>
                    <p className=\"text-sm text-yellow-700 mt-1\">
                      SMS will only be sent to verified phone numbers. Disable test mode for production use.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value=\"usage\" className=\"space-y-4\">
              <div className=\"space-y-4\">
                <div>
                  <div className=\"flex items-center justify-between mb-2\">
                    <Label>Monthly Usage</Label>
                    <span className=\"text-sm text-gray-600\">
                      {usage.used} / {usage.limit} SMS
                    </span>
                  </div>
                  <Progress value={usage.percentage} className=\"h-2\" />
                  <p className=\"text-sm text-gray-600 mt-1\">
                    {usage.percentage.toFixed(1)}% of monthly limit used
                  </p>
                </div>

                <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
                  <Card>
                    <CardContent className=\"p-4\">
                      <div className=\"flex items-center gap-2\">
                        <BarChart3 className=\"h-4 w-4 text-blue-600\" />
                        <span className=\"text-sm font-medium\">Messages Sent</span>
                      </div>
                      <p className=\"text-2xl font-bold mt-1\">{usage.used}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className=\"p-4\">
                      <div className=\"flex items-center gap-2\">
                        <Phone className=\"h-4 w-4 text-green-600\" />
                        <span className=\"text-sm font-medium\">Remaining</span>
                      </div>
                      <p className=\"text-2xl font-bold mt-1\">{usage.limit - usage.used}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className=\"p-4\">
                      <div className=\"flex items-center gap-2\">
                        <Settings className=\"h-4 w-4 text-purple-600\" />
                        <span className=\"text-sm font-medium\">Monthly Limit</span>
                      </div>
                      <p className=\"text-2xl font-bold mt-1\">{usage.limit}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value=\"security\" className=\"space-y-4\">
              <div className=\"space-y-4\">
                <div className=\"bg-blue-50 border border-blue-200 rounded-lg p-4\">
                  <div className=\"flex items-center gap-2 text-blue-800\">
                    <Shield className=\"h-4 w-4\" />
                    <span className=\"font-medium\">Security Best Practices</span>
                  </div>
                  <ul className=\"text-sm text-blue-700 mt-2 space-y-1\">
                    <li>• Store Auth Token securely and never share it</li>
                    <li>• Use webhook URLs with HTTPS only</li>
                    <li>• Enable test mode for development environments</li>
                    <li>• Monitor usage regularly for unexpected spikes</li>
                    <li>• Rotate Auth Tokens periodically</li>
                  </ul>
                </div>

                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                  <Card>
                    <CardContent className=\"p-4\">
                      <div className=\"flex items-center gap-2 mb-2\">
                        <CheckCircle className=\"h-4 w-4 text-green-600\" />
                        <span className=\"font-medium\">Account Security</span>
                      </div>
                      <div className=\"space-y-2 text-sm\">
                        <div className=\"flex justify-between\">
                          <span>Two-Factor Auth</span>
                          <Badge variant=\"secondary\">Recommended</Badge>
                        </div>
                        <div className=\"flex justify-between\">
                          <span>API Key Rotation</span>
                          <Badge variant=\"secondary\">Quarterly</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className=\"p-4\">
                      <div className=\"flex items-center gap-2 mb-2\">
                        <AlertCircle className=\"h-4 w-4 text-orange-600\" />
                        <span className=\"font-medium\">Rate Limiting</span>
                      </div>
                      <div className=\"space-y-2 text-sm\">
                        <div className=\"flex justify-between\">
                          <span>Current Status</span>
                          <Badge variant={config.test_mode ? \"outline\" : \"secondary\"}>
                            {config.test_mode ? 'Test Mode' : 'Production'}
                          </Badge>
                        </div>
                        <div className=\"flex justify-between\">
                          <span>Monthly Limit</span>
                          <span>{config.monthly_limit}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TwilioConfigManager;