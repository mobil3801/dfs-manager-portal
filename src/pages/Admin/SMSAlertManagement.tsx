import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Settings, 
  TestTube, 
  BarChart3, 
  Users, 
  Bell,
  CheckCircle,
  AlertTriangle,
  Phone
} from 'lucide-react';

// Import Sinch ClickSend components
import SinchConfigManager from '@/components/SinchConfigManager';
import SMSServiceManager from '@/components/SMSServiceManager';
import SMSTestManager from '@/components/SMSTestManager';
import SMSConfigurationManager from '@/components/SMSConfigurationManager';

// Import SMS contacts and history components
const SMSContactsManager = React.lazy(() => import('@/components/SMSContactsManager'));
const SMSHistoryViewer = React.lazy(() => import('@/components/SMSHistoryViewer'));

interface ServiceOverview {
  isConfigured: boolean;
  isEnabled: boolean;
  dailyUsage: { used: number; limit: number };
  balance: number;
  lastCheck: Date;
}

const SMSAlertManagement: React.FC = () => {
  const [serviceOverview, setServiceOverview] = useState<ServiceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadServiceOverview();
  }, []);

  const loadServiceOverview = async () => {
    try {
      setLoading(true);

      // Get SMS configuration
      const { data: configData, error: configError } = await window.ezsite.apis.tablePage(24060, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (configError) throw new Error(configError);

      const config = configData?.List?.[0];
      const isConfigured = !!(config?.api_key && config?.username);
      const isEnabled = config?.is_enabled || false;

      // Get daily usage
      const today = new Date().toISOString().split('T')[0];
      const { data: historyData } = await window.ezsite.apis.tablePage(24062, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'id',
        IsAsc: false,
        Filters: [
          { name: 'sent_at', op: 'StringStartsWith', value: today },
          { name: 'status', op: 'Equal', value: 'Sent' }
        ]
      });

      const dailyUsage = {
        used: historyData?.VirtualCount || 0,
        limit: config?.daily_limit || 100
      };

      // For balance, we'd need to make an API call to Sinch ClickSend
      // For now, we'll set it to 0 and let the service components handle it
      const balance = 0;

      setServiceOverview({
        isConfigured,
        isEnabled,
        dailyUsage,
        balance,
        lastCheck: new Date()
      });

    } catch (error) {
      console.error('Error loading service overview:', error);
      toast({
        title: "Error",
        description: "Failed to load SMS service overview",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfigurationStatus = () => {
    if (!serviceOverview) return null;

    if (serviceOverview.isConfigured && serviceOverview.isEnabled) {
      return (
        <Badge variant="secondary" className="text-green-700 bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    } else if (serviceOverview.isConfigured && !serviceOverview.isEnabled) {
      return (
        <Badge variant="outline" className="text-yellow-700 bg-yellow-100">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Configured but Disabled
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Not Configured
        </Badge>
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading SMS service data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Alert Management</h1>
          <p className="text-muted-foreground">
            Manage your Sinch ClickSend SMS service, contacts, and alert settings
          </p>
        </div>
        <Button 
          onClick={loadServiceOverview}
          variant="outline"
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Service Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Service Status</p>
                <div className="mt-2">
                  {getConfigurationStatus()}
                </div>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Usage</p>
                <p className="text-2xl font-bold">
                  {serviceOverview ? `${serviceOverview.dailyUsage.used}/${serviceOverview.dailyUsage.limit}` : '0/100'}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Provider</p>
                <p className="text-lg font-semibold">Sinch ClickSend</p>
              </div>
              <Phone className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm">
                  {serviceOverview?.lastCheck.toLocaleString() || 'Never'}
                </p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Alert */}
      {serviceOverview && !serviceOverview.isConfigured && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            SMS service is not configured. Please set up your Sinch ClickSend credentials in the Configuration tab to enable SMS alerts.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <SMSServiceManager />
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <SMSConfigurationManager />
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                SMS Contacts Management
              </CardTitle>
              <CardDescription>
                Manage emergency contacts and notification recipients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  SMS contacts management will be implemented here. You can add emergency contacts and configure which alerts they should receive.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <SMSTestManager />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                SMS History & Analytics
              </CardTitle>
              <CardDescription>
                View SMS delivery history and usage analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <BarChart3 className="h-4 w-4" />
                <AlertDescription>
                  SMS history and analytics dashboard will be implemented here. Track delivery rates, costs, and usage patterns.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SMSAlertManagement;
