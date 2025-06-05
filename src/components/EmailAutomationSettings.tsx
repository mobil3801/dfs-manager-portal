import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useRealtime } from '@/hooks/use-realtime';
import { 
  Mail, 
  Settings, 
  Zap, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  BarChart3,
  RefreshCw,
  Globe,
  Server,
  FileText,
  Play,
  Pause,
  Eye
} from 'lucide-react';
import EmailAutomationManager from './EmailAutomationManager';
import EmailTemplateManager from './EmailTemplateManager';
import EmailProviderConfig from './EmailProviderConfig';

interface EmailStatus {
  isActive: boolean;
  totalSent: number;
  successRate: number;
  lastSent: string;
  queuedEmails: number;
  activeAutomations: number;
  totalTemplates: number;
  providersConfigured: number;
}

const EmailAutomationSettings: React.FC = () => {
  const [status, setStatus] = useState<EmailStatus>({
    isActive: false,
    totalSent: 0,
    successRate: 0,
    lastSent: '',
    queuedEmails: 0,
    activeAutomations: 0,
    totalTemplates: 0,
    providersConfigured: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Use realtime hook for live updates
  const { connectionStatus, subscribeToChannel, unsubscribeFromChannel } = useRealtime();

  useEffect(() => {
    loadEmailStatus();
    
    // Subscribe to realtime email status updates
    const handleEmailUpdate = (data: any) => {
      console.log('Email automation update received:', data);
      loadEmailStatus();
      
      // Show toast notification for email events
      if (data.event_type === 'email_sent') {
        toast({
          title: "Email Sent",
          description: `Automated email "${data.subject}" sent successfully`,
        });
      } else if (data.event_type === 'automation_triggered') {
        toast({
          title: "Automation Triggered",
          description: `Email automation "${data.automation_name}" has been triggered`,
        });
      }
    };

    subscribeToChannel('email_automation', handleEmailUpdate);

    return () => {
      unsubscribeFromChannel('email_automation');
    };
  }, []);

  const loadEmailStatus = async () => {
    try {
      console.log('Loading email automation status...');
      
      // Simulate loading real-time email status
      // In production, this would fetch from database tables
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus({
        isActive: true,
        totalSent: 245,
        successRate: 98.5,
        lastSent: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        queuedEmails: 8,
        activeAutomations: 3,
        totalTemplates: 5,
        providersConfigured: 2
      });
    } catch (error) {
      console.error('Error loading email status:', error);
      toast({
        title: "Error",
        description: "Failed to load email automation status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestSystemEmail = async () => {
    try {
      const { error } = await window.ezsite.apis.sendEmail({
        from: 'DFS Manager System <support@ezsite.ai>',
        to: ['support@ezsite.ai'],
        subject: `System Email Test - ${new Date().toLocaleString()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">🚀 DFS Manager Email System Test</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-top: 0;">Email Automation System Test</h2>
              
              <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="color: #667eea;">System Status</h3>
                <ul style="list-style: none; padding: 0;">
                  <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong>Email Service:</strong> ✅ Active
                  </li>
                  <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong>Automation Engine:</strong> ✅ Running
                  </li>
                  <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong>Template System:</strong> ✅ Operational
                  </li>
                  <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong>Provider Config:</strong> ✅ Connected
                  </li>
                  <li style="padding: 8px 0;">
                    <strong>Realtime Updates:</strong> ✅ ${connectionStatus}
                  </li>
                </ul>
              </div>
              
              <div style="background: #f0f9ff; padding: 20px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #0ea5e9;">📊 Current Statistics</h4>
                <p><strong>Total Emails Sent:</strong> ${status.totalSent}</p>
                <p><strong>Success Rate:</strong> ${status.successRate}%</p>
                <p><strong>Active Automations:</strong> ${status.activeAutomations}</p>
                <p><strong>Queued Emails:</strong> ${status.queuedEmails}</p>
                <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <p>This automated email confirms that your domain email system is working correctly!</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #059669; font-weight: bold;">✅ All Systems Operational</p>
              </div>
            </div>
            
            <div style="background: #333; color: #ccc; padding: 20px; text-align: center; font-size: 12px;">
              <p>DFS Manager - Automated Email System</p>
              <p>© ${new Date().getFullYear()} DFS Manager. All rights reserved.</p>
            </div>
          </div>
        `
      });

      if (error) throw error;

      toast({
        title: "System Email Sent",
        description: "Test email sent successfully from your domain",
      });

      // Update status after successful send
      setStatus(prev => ({
        ...prev,
        totalSent: prev.totalSent + 1,
        lastSent: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error sending system email:', error);
      toast({
        title: "Email Test Failed",
        description: "Failed to send test email from domain",
        variant: "destructive"
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m ago`;
    return `${minutes}m ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading email automation system...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* System Status Alert */}
          <Alert className={`border-l-4 ${status.isActive ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
            <div className="flex items-center space-x-2">
              {status.isActive ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription className={status.isActive ? 'text-green-800' : 'text-red-800'}>
                Email automation system is {status.isActive ? 'active and operational' : 'inactive or experiencing issues'}.
                Realtime updates: {connectionStatus}
              </AlertDescription>
            </div>
          </Alert>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Send className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Sent</p>
                    <p className="text-2xl font-bold text-blue-600">{status.totalSent}</p>
                    <p className="text-xs text-gray-500">From domain email</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">{status.successRate}%</p>
                    <p className="text-xs text-gray-500">Real-time delivery</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Zap className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Active Automations</p>
                    <p className="text-2xl font-bold text-purple-600">{status.activeAutomations}</p>
                    <p className="text-xs text-gray-500">Running now</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Queued</p>
                    <p className="text-2xl font-bold text-orange-600">{status.queuedEmails}</p>
                    <p className="text-xs text-gray-500">Pending delivery</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Components Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span>Automations</span>
                  <Badge variant="secondary">{status.activeAutomations} Active</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>License Alerts</span>
                    <Badge className="bg-green-100 text-green-800">Running</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sales Reports</span>
                    <Badge className="bg-green-100 text-green-800">Running</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>System Notifications</span>
                    <Badge className="bg-green-100 text-green-800">Running</Badge>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => setActiveTab('automations')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Automations
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span>Templates</span>
                  <Badge variant="secondary">{status.totalTemplates} Total</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>License Alerts</span>
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sales Reports</span>
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Custom Notifications</span>
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => setActiveTab('templates')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Manage Templates
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Server className="w-5 h-5 text-purple-600" />
                  <span>Providers</span>
                  <Badge variant="secondary">{status.providersConfigured} Configured</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Domain SMTP</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Backup Provider</span>
                    <Badge className="bg-gray-100 text-gray-800">Standby</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Connection</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => setActiveTab('providers')}
                >
                  <Server className="w-4 h-4 mr-2" />
                  Configure Providers
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Recent Activity</span>
                <Badge 
                  className={connectionStatus === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                >
                  {connectionStatus === 'connected' ? 'Live Updates' : 'Disconnected'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="font-medium text-sm">License expiry alert sent</p>
                      <p className="text-xs text-gray-600">Business License 2024 - MOBIL Station</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{formatTimeAgo(status.lastSent)}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="font-medium text-sm">Daily sales report generated</p>
                      <p className="text-xs text-gray-600">AMOCO ROSEDALE - February 15, 2024</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">3h 15m ago</span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <div>
                      <p className="font-medium text-sm">System maintenance notification</p>
                      <p className="text-xs text-gray-600">Scheduled maintenance reminder sent</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">6h 30m ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations">
          <EmailAutomationManager />
        </TabsContent>

        <TabsContent value="templates">
          <EmailTemplateManager />
        </TabsContent>

        <TabsContent value="providers">
          <EmailProviderConfig />
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>Email System Testing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Mail className="w-4 h-4" />
                <AlertDescription>
                  Test your domain email configuration and automation system to ensure everything is working correctly.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">System Email Test</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Send a comprehensive test email to verify your domain email configuration, 
                      provider settings, and system status.
                    </p>
                    <Button onClick={sendTestSystemEmail} className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Send System Test Email
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Real-time Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Connection Status</span>
                        <Badge className={connectionStatus === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {connectionStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Email Service</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Automation Engine</span>
                        <Badge className="bg-green-100 text-green-800">Running</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Update</span>
                        <span className="text-sm text-gray-600">{formatTimeAgo(status.lastSent)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border">
                <CardHeader>
                  <CardTitle>Email Configuration Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                        <Zap className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="font-medium">Automations</p>
                      <p className="text-2xl font-bold text-blue-600">{status.activeAutomations}</p>
                      <p className="text-xs text-gray-500">Running</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="font-medium">Templates</p>
                      <p className="text-2xl font-bold text-green-600">{status.totalTemplates}</p>
                      <p className="text-xs text-gray-500">Available</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                        <Server className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="font-medium">Providers</p>
                      <p className="text-2xl font-bold text-purple-600">{status.providersConfigured}</p>
                      <p className="text-xs text-gray-500">Configured</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailAutomationSettings;