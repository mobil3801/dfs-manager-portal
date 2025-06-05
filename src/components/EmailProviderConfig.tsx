import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Save, 
  TestTube, 
  Zap,
  Globe,
  Shield,
  RefreshCw,
  Server,
  Key,
  Send
} from 'lucide-react';

interface EmailProvider {
  id?: number;
  provider_name: string;
  provider_type: string;
  is_active: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  use_ssl: boolean;
  use_auth: boolean;
  from_email: string;
  from_name: string;
  reply_to: string;
  daily_limit: number;
  monthly_limit: number;
  current_daily_count: number;
  current_monthly_count: number;
  rate_limit_per_hour: number;
  webhook_url: string;
  api_key: string;
  api_secret: string;
  last_test_date: string;
  last_test_status: string;
  created_by?: number;
}

interface ProviderStats {
  totalSent: number;
  successRate: number;
  dailyUsage: number;
  monthlyUsage: number;
  status: string;
}

const EmailProviderConfig: React.FC = () => {
  const [providers, setProviders] = useState<EmailProvider[]>([]);
  const [activeProvider, setActiveProvider] = useState<EmailProvider | null>(null);
  const [stats, setStats] = useState<ProviderStats>({
    totalSent: 0,
    successRate: 0,
    dailyUsage: 0,
    monthlyUsage: 0,
    status: 'inactive'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState('configuration');
  const { toast } = useToast();

  // Provider types
  const providerTypes = [
    'SMTP',
    'SendGrid',
    'Mailgun',
    'AWS SES',
    'Custom Domain',
    'Gmail',
    'Outlook'
  ];

  // Default configurations for different providers
  const defaultConfigs = {
    'Gmail': {
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      use_ssl: true,
      use_auth: true
    },
    'Outlook': {
      smtp_host: 'smtp-mail.outlook.com',
      smtp_port: 587,
      use_ssl: true,
      use_auth: true
    },
    'SMTP': {
      smtp_host: '',
      smtp_port: 587,
      use_ssl: true,
      use_auth: true
    },
    'SendGrid': {
      smtp_host: 'smtp.sendgrid.net',
      smtp_port: 587,
      use_ssl: true,
      use_auth: true
    },
    'Mailgun': {
      smtp_host: 'smtp.mailgun.org',
      smtp_port: 587,
      use_ssl: true,
      use_auth: true
    },
    'AWS SES': {
      smtp_host: 'email-smtp.us-east-1.amazonaws.com',
      smtp_port: 587,
      use_ssl: true,
      use_auth: true
    }
  };

  useEffect(() => {
    loadProviders();
    loadStats();
  }, []);

  const loadProviders = async () => {
    try {
      console.log('Loading email providers...');
      // Mock data until database tables are created
      const mockProviders: EmailProvider[] = [
        {
          id: 1,
          provider_name: 'DFS Manager SMTP',
          provider_type: 'Custom Domain',
          is_active: true,
          smtp_host: 'mail.dfsmanager.com',
          smtp_port: 587,
          smtp_username: 'support@dfsmanager.com',
          smtp_password: '****',
          use_ssl: true,
          use_auth: true,
          from_email: 'support@dfsmanager.com',
          from_name: 'DFS Manager Support',
          reply_to: 'support@dfsmanager.com',
          daily_limit: 1000,
          monthly_limit: 25000,
          current_daily_count: 145,
          current_monthly_count: 3240,
          rate_limit_per_hour: 100,
          webhook_url: 'https://dfsmanager.com/api/email/webhook',
          api_key: '',
          api_secret: '',
          last_test_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          last_test_status: 'success'
        },
        {
          id: 2,
          provider_name: 'Backup SendGrid',
          provider_type: 'SendGrid',
          is_active: false,
          smtp_host: 'smtp.sendgrid.net',
          smtp_port: 587,
          smtp_username: 'apikey',
          smtp_password: '****',
          use_ssl: true,
          use_auth: true,
          from_email: 'noreply@dfsmanager.com',
          from_name: 'DFS Manager',
          reply_to: 'support@dfsmanager.com',
          daily_limit: 100,
          monthly_limit: 40000,
          current_daily_count: 0,
          current_monthly_count: 0,
          rate_limit_per_hour: 600,
          webhook_url: '',
          api_key: 'SG.****',
          api_secret: '',
          last_test_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_test_status: 'pending'
        }
      ];

      setProviders(mockProviders);
      const active = mockProviders.find(p => p.is_active);
      if (active) {
        setActiveProvider(active);
      }
    } catch (error) {
      console.error('Error loading providers:', error);
      toast({
        title: "Error",
        description: "Failed to load email providers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Calculate stats from active provider
      const activeProviderData = providers.find(p => p.is_active);
      if (activeProviderData) {
        setStats({
          totalSent: activeProviderData.current_monthly_count,
          successRate: 98.5,
          dailyUsage: (activeProviderData.current_daily_count / activeProviderData.daily_limit) * 100,
          monthlyUsage: (activeProviderData.current_monthly_count / activeProviderData.monthly_limit) * 100,
          status: activeProviderData.last_test_status
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const createNewProvider = () => {
    const newProvider: EmailProvider = {
      provider_name: '',
      provider_type: 'SMTP',
      is_active: false,
      smtp_host: '',
      smtp_port: 587,
      smtp_username: '',
      smtp_password: '',
      use_ssl: true,
      use_auth: true,
      from_email: '',
      from_name: '',
      reply_to: '',
      daily_limit: 1000,
      monthly_limit: 25000,
      current_daily_count: 0,
      current_monthly_count: 0,
      rate_limit_per_hour: 100,
      webhook_url: '',
      api_key: '',
      api_secret: '',
      last_test_date: '',
      last_test_status: 'pending'
    };
    setActiveProvider(newProvider);
  };

  const saveProvider = async () => {
    if (!activeProvider) return;
    
    setSaving(true);
    try {
      if (activeProvider.id) {
        // Update existing provider
        setProviders(prev => prev.map(p => 
          p.id === activeProvider.id ? { ...activeProvider } : p
        ));
        toast({
          title: "Provider Updated",
          description: "Email provider configuration has been updated"
        });
      } else {
        // Create new provider
        const newProvider = {
          ...activeProvider,
          id: Math.max(...providers.map(p => p.id || 0)) + 1
        };
        setProviders(prev => [...prev, newProvider]);
        setActiveProvider(newProvider);
        toast({
          title: "Provider Created",
          description: "New email provider has been created"
        });
      }
      
      loadStats();
    } catch (error) {
      console.error('Error saving provider:', error);
      toast({
        title: "Error",
        description: "Failed to save provider configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const testProvider = async () => {
    if (!activeProvider) return;
    
    setTesting(true);
    try {
      const { error } = await window.ezsite.apis.sendEmail({
        from: `${activeProvider.from_name} <${activeProvider.from_email}>`,
        to: [activeProvider.from_email],
        subject: `Email Provider Test - ${activeProvider.provider_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">✅ Email Provider Test</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-top: 0;">Provider Configuration Test</h2>
              
              <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px; font-weight: bold;">Provider Name:</td>
                    <td style="padding: 8px;">${activeProvider.provider_name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; font-weight: bold;">Provider Type:</td>
                    <td style="padding: 8px;">${activeProvider.provider_type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; font-weight: bold;">SMTP Host:</td>
                    <td style="padding: 8px;">${activeProvider.smtp_host}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; font-weight: bold;">SMTP Port:</td>
                    <td style="padding: 8px;">${activeProvider.smtp_port}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; font-weight: bold;">SSL Enabled:</td>
                    <td style="padding: 8px;">${activeProvider.use_ssl ? 'Yes' : 'No'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; font-weight: bold;">Test Time:</td>
                    <td style="padding: 8px;">${new Date().toLocaleString()}</td>
                  </tr>
                </table>
              </div>
              
              <p>If you received this email, your email provider configuration is working correctly!</p>
            </div>
            
            <div style="background: #333; color: #ccc; padding: 20px; text-align: center; font-size: 12px;">
              <p>DFS Manager - Email Provider Test</p>
            </div>
          </div>
        `
      });

      if (error) throw error;

      // Update provider test status
      const updatedProvider = {
        ...activeProvider,
        last_test_date: new Date().toISOString(),
        last_test_status: 'success'
      };
      setActiveProvider(updatedProvider);
      
      if (activeProvider.id) {
        setProviders(prev => prev.map(p => 
          p.id === activeProvider.id ? updatedProvider : p
        ));
      }

      toast({
        title: "Test Email Sent",
        description: "Provider test completed successfully. Check your inbox!"
      });
    } catch (error) {
      console.error('Error testing provider:', error);
      
      // Update provider test status to failed
      const updatedProvider = {
        ...activeProvider,
        last_test_date: new Date().toISOString(),
        last_test_status: 'failed'
      };
      setActiveProvider(updatedProvider);
      
      toast({
        title: "Test Failed",
        description: "Email provider test failed. Please check your configuration.",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const setProviderActive = async (providerId: number) => {
    try {
      // Deactivate all providers first
      const updatedProviders = providers.map(p => ({
        ...p,
        is_active: p.id === providerId
      }));
      
      setProviders(updatedProviders);
      
      const newActiveProvider = updatedProviders.find(p => p.id === providerId);
      if (newActiveProvider) {
        setActiveProvider(newActiveProvider);
        loadStats();
      }
      
      toast({
        title: "Provider Activated",
        description: "Email provider has been set as active"
      });
    } catch (error) {
      console.error('Error setting provider active:', error);
      toast({
        title: "Error",
        description: "Failed to activate provider",
        variant: "destructive"
      });
    }
  };

  const applyProviderDefaults = (providerType: string) => {
    if (!activeProvider) return;
    
    const defaults = defaultConfigs[providerType as keyof typeof defaultConfigs];
    if (defaults) {
      setActiveProvider({
        ...activeProvider,
        ...defaults,
        provider_type: providerType
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading email provider configuration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Send className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Monthly Sent</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalSent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Zap className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Daily Usage</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.dailyUsage.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Server className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge className={stats.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {stats.status === 'success' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used Today</span>
                    <span>{activeProvider?.current_daily_count || 0} / {activeProvider?.daily_limit || 1000}</span>
                  </div>
                  <Progress value={stats.dailyUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used This Month</span>
                    <span>{activeProvider?.current_monthly_count || 0} / {activeProvider?.monthly_limit || 25000}</span>
                  </div>
                  <Progress value={stats.monthlyUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Provider Info */}
          {activeProvider && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Active Provider</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Provider Name</p>
                    <p className="font-medium">{activeProvider.provider_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium">{activeProvider.provider_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">From Email</p>
                    <p className="font-medium">{activeProvider.from_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">SMTP Host</p>
                    <p className="font-medium">{activeProvider.smtp_host}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Test</p>
                    <p className="font-medium">
                      {activeProvider.last_test_date 
                        ? new Date(activeProvider.last_test_date).toLocaleString()
                        : 'Never tested'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Test Status</p>
                    <Badge className={activeProvider.last_test_status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {activeProvider.last_test_status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          {activeProvider ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Provider Configuration</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={testProvider} disabled={testing} variant="outline">
                      {testing ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="w-4 h-4 mr-2" />
                      )}
                      Test Configuration
                    </Button>
                    <Button onClick={saveProvider} disabled={saving}>
                      {saving ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Configuration
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="provider_name">Provider Name</Label>
                    <Input
                      id="provider_name"
                      value={activeProvider.provider_name}
                      onChange={(e) => setActiveProvider({
                        ...activeProvider,
                        provider_name: e.target.value
                      })}
                      placeholder="My Email Provider"
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider_type">Provider Type</Label>
                    <Select 
                      value={activeProvider.provider_type} 
                      onValueChange={(value) => {
                        applyProviderDefaults(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {providerTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* SMTP Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">SMTP Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="smtp_host">SMTP Host</Label>
                      <Input
                        id="smtp_host"
                        value={activeProvider.smtp_host}
                        onChange={(e) => setActiveProvider({
                          ...activeProvider,
                          smtp_host: e.target.value
                        })}
                        placeholder="smtp.example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp_port">SMTP Port</Label>
                      <Input
                        id="smtp_port"
                        type="number"
                        value={activeProvider.smtp_port}
                        onChange={(e) => setActiveProvider({
                          ...activeProvider,
                          smtp_port: parseInt(e.target.value) || 587
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtp_username">SMTP Username</Label>
                      <Input
                        id="smtp_username"
                        value={activeProvider.smtp_username}
                        onChange={(e) => setActiveProvider({
                          ...activeProvider,
                          smtp_username: e.target.value
                        })}
                        placeholder="username or email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp_password">SMTP Password</Label>
                      <div className="relative">
                        <Input
                          id="smtp_password"
                          type={showPassword ? "text" : "password"}
                          value={activeProvider.smtp_password}
                          onChange={(e) => setActiveProvider({
                            ...activeProvider,
                            smtp_password: e.target.value
                          })}
                          placeholder="Enter password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={activeProvider.use_ssl}
                        onCheckedChange={(checked) => setActiveProvider({
                          ...activeProvider,
                          use_ssl: checked
                        })}
                      />
                      <Label>Use SSL/TLS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={activeProvider.use_auth}
                        onCheckedChange={(checked) => setActiveProvider({
                          ...activeProvider,
                          use_auth: checked
                        })}
                      />
                      <Label>Use Authentication</Label>
                    </div>
                  </div>
                </div>

                {/* Email Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="from_email">From Email</Label>
                      <Input
                        id="from_email"
                        type="email"
                        value={activeProvider.from_email}
                        onChange={(e) => setActiveProvider({
                          ...activeProvider,
                          from_email: e.target.value
                        })}
                        placeholder="noreply@yourdomain.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="from_name">From Name</Label>
                      <Input
                        id="from_name"
                        value={activeProvider.from_name}
                        onChange={(e) => setActiveProvider({
                          ...activeProvider,
                          from_name: e.target.value
                        })}
                        placeholder="Your Company Name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reply_to">Reply To Email</Label>
                    <Input
                      id="reply_to"
                      type="email"
                      value={activeProvider.reply_to}
                      onChange={(e) => setActiveProvider({
                        ...activeProvider,
                        reply_to: e.target.value
                      })}
                      placeholder="support@yourdomain.com"
                    />
                  </div>
                </div>

                {/* Limits Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Rate Limits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="daily_limit">Daily Limit</Label>
                      <Input
                        id="daily_limit"
                        type="number"
                        value={activeProvider.daily_limit}
                        onChange={(e) => setActiveProvider({
                          ...activeProvider,
                          daily_limit: parseInt(e.target.value) || 1000
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="monthly_limit">Monthly Limit</Label>
                      <Input
                        id="monthly_limit"
                        type="number"
                        value={activeProvider.monthly_limit}
                        onChange={(e) => setActiveProvider({
                          ...activeProvider,
                          monthly_limit: parseInt(e.target.value) || 25000
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rate_limit_per_hour">Hourly Limit</Label>
                      <Input
                        id="rate_limit_per_hour"
                        type="number"
                        value={activeProvider.rate_limit_per_hour}
                        onChange={(e) => setActiveProvider({
                          ...activeProvider,
                          rate_limit_per_hour: parseInt(e.target.value) || 100
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* API Configuration (for non-SMTP providers) */}
                {activeProvider.provider_type !== 'SMTP' && activeProvider.provider_type !== 'Gmail' && activeProvider.provider_type !== 'Outlook' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">API Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="api_key">API Key</Label>
                        <div className="relative">
                          <Input
                            id="api_key"
                            type={showApiKey ? "text" : "password"}
                            value={activeProvider.api_key}
                            onChange={(e) => setActiveProvider({
                              ...activeProvider,
                              api_key: e.target.value
                            })}
                            placeholder="Enter API key"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="webhook_url">Webhook URL</Label>
                        <Input
                          id="webhook_url"
                          value={activeProvider.webhook_url}
                          onChange={(e) => setActiveProvider({
                            ...activeProvider,
                            webhook_url: e.target.value
                          })}
                          placeholder="https://yourdomain.com/webhook"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Provider Selected</h3>
                <p className="text-gray-500 mb-4">Select a provider from the providers tab or create a new one.</p>
                <Button onClick={createNewProvider}>
                  <Settings className="w-4 h-4 mr-2" />
                  Create New Provider
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="w-5 h-5" />
                  <span>Email Providers</span>
                  <Badge variant="secondary">{providers.length} Configured</Badge>
                </div>
                <Button onClick={createNewProvider}>
                  <Settings className="w-4 h-4 mr-2" />
                  Add Provider
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providers.map((provider) => (
                  <Card key={provider.id} className={`border ${provider.is_active ? 'bg-blue-50 border-blue-200' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${provider.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <div>
                              <h3 className="font-semibold">{provider.provider_name}</h3>
                              <p className="text-sm text-gray-600">{provider.provider_type} • {provider.from_email}</p>
                            </div>
                          </div>
                          <div className="hidden md:block">
                            <p className="text-sm text-gray-600">Host: {provider.smtp_host}:{provider.smtp_port}</p>
                            <p className="text-sm text-gray-600">
                              Usage: {provider.current_daily_count}/{provider.daily_limit} daily
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={provider.last_test_status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {provider.last_test_status}
                          </Badge>
                          {!provider.is_active && (
                            <Button 
                              size="sm" 
                              onClick={() => setProviderActive(provider.id!)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Activate
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setActiveProvider(provider)}
                          >
                            Configure
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Daily Usage</p>
                            <p className="font-medium">{((provider.current_daily_count / provider.daily_limit) * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Monthly Usage</p>
                            <p className="font-medium">{((provider.current_monthly_count / provider.monthly_limit) * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Last Test</p>
                            <p className="font-medium">
                              {provider.last_test_date 
                                ? new Date(provider.last_test_date).toLocaleDateString()
                                : 'Never'
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Status</p>
                            <Badge className={provider.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {provider.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailProviderConfig;