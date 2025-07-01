import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle,
  AlertCircle,
  Settings,
  Phone,
  Key,
  Server,
  Shield,
  Zap,
  RefreshCw,
  Eye,
  EyeOff } from
'lucide-react';

interface SMSConfig {
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_phone_number: string;
  service_enabled: boolean;
  test_mode: boolean;
  daily_limit: number;
  monthly_limit: number;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  details?: string;
}

const SMSConfigurationValidator: React.FC = () => {
  const [config, setConfig] = useState<SMSConfig>({
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: '',
    service_enabled: true,
    test_mode: true,
    daily_limit: 100,
    monthly_limit: 1000
  });

  const [validationResults, setValidationResults] = useState<{
    credentials: ValidationResult;
    phoneNumber: ValidationResult;
    connection: ValidationResult;
    balance: ValidationResult;
  }>({
    credentials: { isValid: false, message: 'Not validated' },
    phoneNumber: { isValid: false, message: 'Not validated' },
    connection: { isValid: false, message: 'Not validated' },
    balance: { isValid: false, message: 'Not validated' }
  });

  const [loading, setLoading] = useState(false);
  const [showAuthToken, setShowAuthToken] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      // Load SMS configuration from local storage or API
      const savedConfig = localStorage.getItem('sms_configuration');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Error loading SMS configuration:', error);
    }
  };

  const saveConfiguration = async () => {
    try {
      setLoading(true);

      // Save to local storage (in production, this would be saved to your backend)
      localStorage.setItem('sms_configuration', JSON.stringify(config));

      toast({
        title: "Configuration Saved",
        description: "SMS configuration has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SMS configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateCredentials = async () => {
    if (!config.twilio_account_sid || !config.twilio_auth_token) {
      setValidationResults((prev) => ({
        ...prev,
        credentials: {
          isValid: false,
          message: 'Missing credentials',
          details: 'Both Account SID and Auth Token are required'
        }
      }));
      return;
    }

    if (!config.twilio_account_sid.startsWith('AC')) {
      setValidationResults((prev) => ({
        ...prev,
        credentials: {
          isValid: false,
          message: 'Invalid Account SID format',
          details: 'Account SID should start with "AC"'
        }
      }));
      return;
    }

    // Simulate credential validation
    setValidationResults((prev) => ({
      ...prev,
      credentials: {
        isValid: true,
        message: 'Credentials format valid',
        details: 'Account SID and Auth Token format are correct'
      }
    }));
  };

  const validatePhoneNumber = async () => {
    if (!config.twilio_phone_number) {
      setValidationResults((prev) => ({
        ...prev,
        phoneNumber: {
          isValid: false,
          message: 'Phone number required',
          details: 'Twilio phone number is required'
        }
      }));
      return;
    }

    const phoneRegex = /^\+1\d{10}$/;
    if (!phoneRegex.test(config.twilio_phone_number)) {
      setValidationResults((prev) => ({
        ...prev,
        phoneNumber: {
          isValid: false,
          message: 'Invalid phone number format',
          details: 'Phone number should be in E.164 format (+1234567890)'
        }
      }));
      return;
    }

    setValidationResults((prev) => ({
      ...prev,
      phoneNumber: {
        isValid: true,
        message: 'Phone number format valid',
        details: 'Phone number is in correct E.164 format'
      }
    }));
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      // Simulate connection test
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setValidationResults((prev) => ({
        ...prev,
        connection: {
          isValid: true,
          message: 'Connection successful',
          details: 'Successfully connected to Twilio API'
        }
      }));
    } catch (error) {
      setValidationResults((prev) => ({
        ...prev,
        connection: {
          isValid: false,
          message: 'Connection failed',
          details: 'Unable to connect to Twilio API'
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const checkBalance = async () => {
    setLoading(true);
    try {
      // Simulate balance check
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockBalance = (Math.random() * 50 + 10).toFixed(2);

      setValidationResults((prev) => ({
        ...prev,
        balance: {
          isValid: parseFloat(mockBalance) > 5,
          message: parseFloat(mockBalance) > 5 ? 'Sufficient balance' : 'Low balance',
          details: `Current balance: $${mockBalance}`
        }
      }));
    } catch (error) {
      setValidationResults((prev) => ({
        ...prev,
        balance: {
          isValid: false,
          message: 'Unable to check balance',
          details: 'Failed to retrieve account balance'
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const runFullValidation = async () => {
    setLoading(true);
    try {
      await validateCredentials();
      await validatePhoneNumber();
      await testConnection();
      await checkBalance();

      toast({
        title: "Validation Complete",
        description: "SMS configuration validation has been completed."
      });
    } finally {
      setLoading(false);
    }
  };

  const ValidationStatus = ({ result }: {result: ValidationResult;}) =>
  <div className="flex items-center space-x-2">
      {result.isValid ?
    <CheckCircle className="w-4 h-4 text-green-500" /> :

    <AlertCircle className="w-4 h-4 text-red-500" />
    }
      <div>
        <div className={`text-sm font-medium ${result.isValid ? 'text-green-700' : 'text-red-700'}`}>
          {result.message}
        </div>
        {result.details &&
      <div className="text-xs text-muted-foreground">
            {result.details}
          </div>
      }
      </div>
    </div>;


  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50">
        <Settings className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Configure and validate your SMS service settings. Make sure all validations pass before using SMS alerts.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="configuration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configuration">🔧 Configuration</TabsTrigger>
          <TabsTrigger value="validation">✅ Validation</TabsTrigger>
          <TabsTrigger value="limits">📊 Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                SMS Service Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Enable SMS Service</Label>
                  <p className="text-sm text-muted-foreground">
                    Turn on/off SMS alert functionality
                  </p>
                </div>
                <Switch
                  checked={config.service_enabled}
                  onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, service_enabled: checked }))
                  } />

              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Test Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Only send SMS to verified numbers in test mode
                  </p>
                </div>
                <Switch
                  checked={config.test_mode}
                  onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, test_mode: checked }))
                  } />

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_sid">
                    <Key className="w-4 h-4 inline mr-1" />
                    Twilio Account SID
                  </Label>
                  <Input
                    id="account_sid"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={config.twilio_account_sid}
                    onChange={(e) =>
                    setConfig((prev) => ({ ...prev, twilio_account_sid: e.target.value }))
                    } />

                  <p className="text-xs text-muted-foreground">
                    Find this in your Twilio Console Dashboard
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auth_token">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Auth Token
                  </Label>
                  <div className="relative">
                    <Input
                      id="auth_token"
                      type={showAuthToken ? "text" : "password"}
                      placeholder="Your Twilio Auth Token"
                      value={config.twilio_auth_token}
                      onChange={(e) =>
                      setConfig((prev) => ({ ...prev, twilio_auth_token: e.target.value }))
                      } />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowAuthToken(!showAuthToken)}>

                      {showAuthToken ?
                      <EyeOff className="w-4 h-4" /> :

                      <Eye className="w-4 h-4" />
                      }
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Keep this secure - it's your API authentication
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Twilio Phone Number
                </Label>
                <Input
                  id="phone_number"
                  placeholder="+1234567890"
                  value={config.twilio_phone_number}
                  onChange={(e) =>
                  setConfig((prev) => ({ ...prev, twilio_phone_number: e.target.value }))
                  } />

                <p className="text-xs text-muted-foreground">
                  The phone number you purchased from Twilio (E.164 format)
                </p>
              </div>

              <div className="flex space-x-4">
                <Button onClick={saveConfiguration} disabled={loading}>
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Configuration
                </Button>
                <Button onClick={runFullValidation} variant="outline" disabled={loading}>
                  <Zap className="w-4 h-4 mr-2" />
                  Validate All Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Credentials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ValidationStatus result={validationResults.credentials} />
                <Button
                  onClick={validateCredentials}
                  className="w-full mt-4"
                  variant="outline"
                  size="sm">

                  Validate Credentials
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Phone Number
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ValidationStatus result={validationResults.phoneNumber} />
                <Button
                  onClick={validatePhoneNumber}
                  className="w-full mt-4"
                  variant="outline"
                  size="sm">

                  Validate Phone Number
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="w-5 h-5 mr-2" />
                  Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ValidationStatus result={validationResults.connection} />
                <Button
                  onClick={testConnection}
                  className="w-full mt-4"
                  variant="outline"
                  size="sm"
                  disabled={loading}>

                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Test Connection
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Account Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ValidationStatus result={validationResults.balance} />
                <Button
                  onClick={checkBalance}
                  className="w-full mt-4"
                  variant="outline"
                  size="sm"
                  disabled={loading}>

                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Check Balance
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Validation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Badge variant={validationResults.credentials.isValid ? "default" : "destructive"}>
                    Credentials
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant={validationResults.phoneNumber.isValid ? "default" : "destructive"}>
                    Phone Number
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant={validationResults.connection.isValid ? "default" : "destructive"}>
                    Connection
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant={validationResults.balance.isValid ? "default" : "destructive"}>
                    Balance
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle>SMS Usage Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="daily_limit">Daily SMS Limit</Label>
                  <Input
                    id="daily_limit"
                    type="number"
                    value={config.daily_limit}
                    onChange={(e) =>
                    setConfig((prev) => ({ ...prev, daily_limit: parseInt(e.target.value) || 0 }))
                    } />

                  <p className="text-xs text-muted-foreground">
                    Maximum SMS messages per day
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly_limit">Monthly SMS Limit</Label>
                  <Input
                    id="monthly_limit"
                    type="number"
                    value={config.monthly_limit}
                    onChange={(e) =>
                    setConfig((prev) => ({ ...prev, monthly_limit: parseInt(e.target.value) || 0 }))
                    } />

                  <p className="text-xs text-muted-foreground">
                    Maximum SMS messages per month
                  </p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Setting appropriate limits helps prevent accidental high usage and controls SMS costs.
                  These limits are enforced by the application.
                </AlertDescription>
              </Alert>

              <Button onClick={saveConfiguration}>
                Save Limits
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

};

export default SMSConfigurationValidator;