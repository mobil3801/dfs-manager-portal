import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { useRealtime } from '@/hooks/use-realtime';
import AccessDenied from '@/components/AccessDenied';
import EmailAutomationSettings from '@/components/EmailAutomationSettings';
import { 
  Mail, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';

const EmailAutomationPage: React.FC = () => {
  const { isAdmin } = useAdminAccess();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    isActive: false,
    totalSent: 0,
    activeAutomations: 0,
    lastActivity: ''
  });
  const { toast } = useToast();
  const { connectionStatus } = useRealtime();

  // Get initial tab from URL params
  const initialTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    if (isAdmin) {
      loadSystemStatus();
    }
  }, [isAdmin]);

  const loadSystemStatus = async () => {
    try {
      console.log('Loading email automation system status...');
      
      // Simulate loading system status
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSystemStatus({
        isActive: true,
        totalSent: 245,
        activeAutomations: 3,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      });
      
      toast({
        title: "Email System Status",
        description: "Email automation system loaded successfully",
      });
    } catch (error) {
      console.error('Error loading system status:', error);
      toast({
        title: "Error",
        description: "Failed to load email automation system",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <AccessDenied
        feature="Email Automation Management"
        requiredRole="Administrator"
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg">Loading email automation system...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/admin/site-management">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Site Management
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <Mail className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Email Automation System</h1>
              <p className="text-gray-600">Manage automated email communications from your domain</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge className={systemStatus.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {systemStatus.isActive ? 'System Active' : 'System Inactive'}
          </Badge>
          <Badge className={connectionStatus === 'connected' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
            {connectionStatus === 'connected' ? 'Real-time Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      {/* System Status Alert */}
      <Alert className={`border-l-4 ${systemStatus.isActive ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
        <div className="flex items-center space-x-2">
          {systemStatus.isActive ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <AlertDescription className={`text-lg ${systemStatus.isActive ? 'text-green-800' : 'text-red-800'}`}>
            <strong>Email Automation System Status:</strong> {systemStatus.isActive ? 'Operational' : 'Needs Attention'}
            {systemStatus.isActive && (
              <span className="ml-2">
                • {systemStatus.totalSent} emails sent • {systemStatus.activeAutomations} automations running
                • Real-time updates: {connectionStatus}
              </span>
            )}
          </AlertDescription>
        </div>
      </Alert>

      {/* Email Automation Settings Component */}
      <EmailAutomationSettings />

      {/* Additional System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>System Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">📧 Email Features</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Automated license expiry alerts</li>
                <li>• Daily/weekly sales reports</li>
                <li>• System notifications</li>
                <li>• Custom email templates</li>
                <li>• Real-time delivery tracking</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🚀 Domain Integration</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Send from your own domain</li>
                <li>• Professional email branding</li>
                <li>• SMTP configuration support</li>
                <li>• Multiple provider backup</li>
                <li>• SSL/TLS security</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">⚡ Real-time Updates</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Live email status updates</li>
                <li>• Instant delivery notifications</li>
                <li>• Real-time automation triggers</li>
                <li>• Dynamic content updates</li>
                <li>• Live system monitoring</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailAutomationPage;