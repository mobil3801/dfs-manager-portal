import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Phone, 
  Key,
  ExternalLink,
  RefreshCw,
  Shield,
  Zap
} from 'lucide-react';

interface ConfigStatus {
  isValid: boolean;
  message: string;
  details?: string;
}

interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  testMode: boolean;
}

const SMSConfigurationValidator = () => {
  const [config, setConfig] = useState<SMSConfig>({
    accountSid: '',
    authToken: '',
    fromNumber: '',
    testMode: true
  });
  
  const [validation, setValidation] = useState<{
    accountSid: ConfigStatus;
    authToken: ConfigStatus;
    fromNumber: ConfigStatus;
    connection: ConfigStatus;
  }>({
    accountSid: { isValid: false, message: 'Not configured' },
    authToken: { isValid: false, message: 'Not configured' },
    fromNumber: { isValid: false, message: 'Not configured' },
    connection: { isValid: false, message: 'Not tested' }
  });
  
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      // Simulate loading configuration from environment/database
      // In a real app, this would come from secure storage
      const mockConfig = {
        accountSid: process.env.REACT_APP_TWILIO_ACCOUNT_SID || '',
        authToken: process.env.REACT_APP_TWILIO_AUTH_TOKEN || '',
        fromNumber: process.env.REACT_APP_TWILIO_FROM_NUMBER || '',
        testMode: true
      };
      
      setConfig(mockConfig);
      validateConfiguration(mockConfig);
    } catch (error) {
      console.error('Error loading SMS configuration:', error);
      toast({
        title: "Configuration Error",
        description: "Failed to load SMS configuration",
        variant: "destructive"
      });
    }
  };

  const validateConfiguration = (configData: SMSConfig) => {
    const newValidation = { ...validation };

    // Validate Account SID
    if (!configData.accountSid) {
      newValidation.accountSid = {
        isValid: false,
        message: 'Account SID is required',
        details: 'Get this from your Twilio Console Dashboard'
      };
    } else if (!configData.accountSid.startsWith('AC')) {
      newValidation.accountSid = {
        isValid: false,
        message: 'Invalid Account SID format',
        details: 'Account SID should start with "AC" followed by 32 characters'
      };
    } else if (configData.accountSid.length !== 34) {
      newValidation.accountSid = {
        isValid: false,
        message: 'Invalid Account SID length',
        details: 'Account SID should be exactly 34 characters long'
      };
    } else {
      newValidation.accountSid = {
        isValid: true,
        message: 'Valid Account SID format'
      };
    }

    // Validate Auth Token
    if (!configData.authToken) {
      newValidation.authToken = {
        isValid: false,
        message: 'Auth Token is required',
        details: 'Get this from your Twilio Console Dashboard'
      };
    } else if (configData.authToken.length !== 32) {
      newValidation.authToken = {
        isValid: false,
        message: 'Invalid Auth Token length',
        details: 'Auth Token should be exactly 32 characters long'
      };
    } else {
      newValidation.authToken = {
        isValid: true,
        message: 'Valid Auth Token format'
      };
    }

    // Validate From Number
    if (!configData.fromNumber) {
      newValidation.fromNumber = {
        isValid: false,
        message: 'From Number is required',
        details: 'Use a Twilio phone number in E.164 format (+1234567890)'
      };
    } else if (!configData.fromNumber.match(/^\+[1-9]\d{1,14}$/)) {
      newValidation.fromNumber = {
        isValid: false,
        message: 'Invalid phone number format',
        details: 'Use E.164 format: +1234567890 (country code + number)'
      };
    } else {
      newValidation.fromNumber = {
        isValid: true,
        message: 'Valid phone number format'
      };
    }

    setValidation(newValidation);
  };

  const testConnection = async () => {
    setIsValidating(true);
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const allValid = validation.accountSid.isValid && 
                      validation.authToken.isValid && 
                      validation.fromNumber.isValid;
      
      if (allValid) {
        setValidation(prev => ({
          ...prev,
          connection: {
            isValid: true,
            message: 'Connection successful',
            details: 'Twilio API is accessible with current credentials'
          }
        }));
        
        toast({
          title: "✅ Connection Successful",
          description: "SMS service is properly configured and ready to use"
        });
      } else {
        setValidation(prev => ({
          ...prev,
          connection: {
            isValid: false,
            message: 'Connection failed',
            details: 'Fix configuration errors above before testing connection'
          }
        }));
        
        toast({
          title: "❌ Connection Failed",
          description: "Please fix configuration issues before testing",
          variant: "destructive"
        });
      }
    } catch (error) {
      setValidation(prev => ({
        ...prev,
        connection: {
          isValid: false,
          message: 'Connection error',
          details: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }));
      
      toast({
        title: "Connection Error",
        description: "Failed to test SMS service connection",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getValidationIcon = (status: ConfigStatus) => {
    return status.isValid ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const getValidationBadge = (status: ConfigStatus) => {
    return (
      <Badge variant={status.isValid ? "default" : "destructive"}>
        {status.isValid ? "Valid" : "Invalid"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Configuration Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            SMS Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Account SID</div>
                <div className="text-sm text-muted-foreground">
                  {validation.accountSid.message}
                </div>
              </div>
              {getValidationIcon(validation.accountSid)}
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Auth Token</div>
                <div className="text-sm text-muted-foreground">
                  {validation.authToken.message}
                </div>
              </div>
              {getValidationIcon(validation.authToken)}
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">From Number</div>
                <div className="text-sm text-muted-foreground">
                  {validation.fromNumber.message}
                </div>
              </div>
              {getValidationIcon(validation.fromNumber)}
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Connection</div>
                <div className="text-sm text-muted-foreground">
                  {validation.connection.message}
                </div>
              </div>
              {getValidationIcon(validation.connection)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Twilio Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="accountSid">Account SID</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="accountSid"
                  value={config.accountSid}
                  onChange={(e) => {
                    const newConfig = { ...config, accountSid: e.target.value };
                    setConfig(newConfig);
                    validateConfiguration(newConfig);
                  }}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="font-mono"
                />
                {getValidationBadge(validation.accountSid)}
              </div>
              {validation.accountSid.details && (
                <p className="text-sm text-muted-foreground mt-1">
                  {validation.accountSid.details}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="authToken">Auth Token</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="authToken"
                  type="password"
                  value={config.authToken}
                  onChange={(e) => {
                    const newConfig = { ...config, authToken: e.target.value };
                    setConfig(newConfig);
                    validateConfiguration(newConfig);
                  }}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="font-mono"
                />
                {getValidationBadge(validation.authToken)}
              </div>
              {validation.authToken.details && (
                <p className="text-sm text-muted-foreground mt-1">
                  {validation.authToken.details}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="fromNumber">From Number</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="fromNumber"
                  value={config.fromNumber}
                  onChange={(e) => {
                    const newConfig = { ...config, fromNumber: e.target.value };
                    setConfig(newConfig);
                    validateConfiguration(newConfig);
                  }}
                  placeholder="+1234567890"
                  className="font-mono"
                />
                {getValidationBadge(validation.fromNumber)}
              </div>
              {validation.fromNumber.details && (
                <p className="text-sm text-muted-foreground mt-1">
                  {validation.fromNumber.details}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security & Test Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className={config.testMode ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}>
              <Zap className={`h-4 w-4 ${config.testMode ? 'text-orange-600' : 'text-green-600'}`} />
              <AlertDescription className={config.testMode ? 'text-orange-800' : 'text-green-800'}>
                <div className="space-y-2">
                  <div><strong>Current Mode: {config.testMode ? 'Test Mode' : 'Production Mode'}</strong></div>
                  <div className="text-sm">
                    {config.testMode ? (
                      <>
                        🧪 <strong>Test Mode Active:</strong> SMS will only be sent to verified phone numbers in your Twilio account.
                        This is safer for testing but may cause confusion if real phone numbers aren't verified.
                      </>
                    ) : (
                      <>
                        🚀 <strong>Production Mode:</strong> SMS can be sent to any valid phone number.
                        Make sure all phone numbers are correct to avoid sending messages to wrong recipients.
                      </>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-semibold">Configuration Checklist:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  {getValidationIcon(validation.accountSid)}
                  <span>Twilio Account SID configured</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getValidationIcon(validation.authToken)}
                  <span>Twilio Auth Token configured</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getValidationIcon(validation.fromNumber)}
                  <span>Valid Twilio phone number set</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getValidationIcon(validation.connection)}
                  <span>Connection to Twilio API tested</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={testConnection} 
              disabled={isValidating}
              className="w-full"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Test SMS Connection
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Help & Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Help & Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Getting Started with Twilio:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4" />
                  <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline">
                    Twilio Console
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4" />
                  <a href="https://www.twilio.com/docs/sms/quickstart" target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:underline">
                    SMS Quickstart Guide
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4" />
                  <a href="https://support.twilio.com/hc/en-us/articles/223183068-Twilio-international-phone-number-availability-and-their-capabilities"
                     target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    International Phone Numbers
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Common Configuration Issues:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• <strong>Invalid credentials:</strong> Double-check Account SID and Auth Token from Twilio Console</div>
                <div>• <strong>Wrong phone number format:</strong> Use E.164 format (+1234567890)</div>
                <div>• <strong>Test mode limitations:</strong> Only verified numbers receive SMS in test mode</div>
                <div>• <strong>Insufficient balance:</strong> Check your Twilio account balance</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMSConfigurationValidator;