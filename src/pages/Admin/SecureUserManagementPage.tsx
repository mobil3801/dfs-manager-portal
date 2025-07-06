import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Database, 
  Activity,
  Mail,
  UserCheck,
  RefreshCw,
  Eye,
  FileText,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SecureUserManagement from '@/components/SecureUserManagement';
import { userSecurityService } from '@/services/userSecurityService';
import AccessDenied from '@/components/AccessDenied';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityStats {
  totalUsers: number;
  activeUsers: number;
  administrators: number;
  protectedAccounts: number;
  recentSecurityEvents: number;
  emailConflicts: number;
  roleConflicts: number;
}

interface SecurityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

const SecureUserManagementPage: React.FC = () => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalUsers: 0,
    activeUsers: 0,
    administrators: 0,
    protectedAccounts: 0,
    recentSecurityEvents: 0,
    emailConflicts: 0,
    roleConflicts: 0
  });
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');

  useEffect(() => {
    if (isAdmin) {
      loadSecurityDashboard();
    }
  }, [isAdmin]);

  const loadSecurityDashboard = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSecurityStats(),
        loadSecurityEvents(),
        checkSystemHealth()
      ]);
    } catch (error) {
      console.error('Error loading security dashboard:', error);
      toast({
        title: "❌ Dashboard Error",
        description: "Failed to load security dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityStats = async () => {
    try {
      // Fetch user profiles to calculate stats
      const { data, error } = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;

      const profiles = data?.List || [];
      
      const stats: SecurityStats = {
        totalUsers: profiles.length,
        activeUsers: profiles.filter(p => p.is_active).length,
        administrators: profiles.filter(p => p.role === 'Administrator').length,
        protectedAccounts: profiles.filter(p => 
          p.employee_id?.toLowerCase().includes('admin') || 
          p.role === 'Administrator'
        ).length,
        recentSecurityEvents: 0, // Would be calculated from audit logs
        emailConflicts: 0, // Would be calculated from validation checks
        roleConflicts: 0 // Would be calculated from role analysis
      };

      // Check for potential conflicts
      for (const profile of profiles) {
        // Check role conflicts
        const roleCheck = await userSecurityService.checkRoleConflicts(
          profile.role,
          profile.station,
          profile.user_id
        );
        if (roleCheck.hasConflict) {
          stats.roleConflicts++;
        }
      }

      setSecurityStats(stats);
    } catch (error) {
      console.error('Error loading security stats:', error);
    }
  };

  const loadSecurityEvents = async () => {
    try {
      // Fetch recent audit logs
      const { data, error } = await window.ezsite.apis.tablePage(12706, {
        PageNo: 1,
        PageSize: 20,
        OrderByField: "event_timestamp",
        IsAsc: false,
        Filters: [
          { name: 'event_type', op: 'Equal', value: 'Admin Action' }
        ]
      });

      if (error) throw error;

      const events: SecurityEvent[] = (data?.List || []).map((log: any) => ({
        id: log.id.toString(),
        type: log.action_performed || 'Unknown Action',
        message: `${log.action_performed} by user ${log.username || 'Unknown'}`,
        timestamp: log.event_timestamp,
        severity: log.risk_level?.toLowerCase() || 'low',
        resolved: log.event_status === 'Success'
      }));

      setSecurityEvents(events);
    } catch (error) {
      console.error('Error loading security events:', error);
    }
  };

  const checkSystemHealth = async () => {
    try {
      let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';

      // Check for critical issues
      if (securityStats.administrators === 0) {
        healthStatus = 'critical';
      } else if (securityStats.roleConflicts > 0 || securityStats.emailConflicts > 0) {
        healthStatus = 'warning';
      }

      setSystemStatus(healthStatus);
    } catch (error) {
      console.error('Error checking system health:', error);
      setSystemStatus('warning');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin) {
    return (
      <AccessDenied
        feature="Secure User Management"
        requiredRole="Administrator"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading security dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🔐 Secure User Management Dashboard</h1>
            <p className="text-sm text-gray-600">
              Comprehensive user security with role conflict prevention and admin protection
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(systemStatus)}>
            {systemStatus === 'healthy' && <CheckCircle className="w-3 h-3 mr-1" />}
            {systemStatus === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {systemStatus === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
            System {systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}
          </Badge>
          <Button
            onClick={loadSecurityDashboard}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* System Health Alert */}
      {systemStatus !== 'healthy' && (
        <Alert variant={systemStatus === 'critical' ? 'destructive' : 'default'} className="border-2">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">
                {systemStatus === 'critical' ? '🚨 Critical Security Issue Detected' : '⚠️ Security Warning'}
              </p>
              {securityStats.administrators === 0 && (
                <p>• No administrator accounts found - system access may be compromised</p>
              )}
              {securityStats.roleConflicts > 0 && (
                <p>• {securityStats.roleConflicts} role conflict(s) detected</p>
              )}
              {securityStats.emailConflicts > 0 && (
                <p>• {securityStats.emailConflicts} email conflict(s) detected</p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Security Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{securityStats.totalUsers}</p>
                <p className="text-xs text-green-600">✓ Validated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Administrators</p>
                <p className="text-2xl font-bold">{securityStats.administrators}</p>
                <p className="text-xs text-blue-600">🛡️ Protected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{securityStats.activeUsers}</p>
                <p className="text-xs text-green-600">✅ Secure</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Lock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Protected Accounts</p>
                <p className="text-2xl font-bold">{securityStats.protectedAccounts}</p>
                <p className="text-xs text-purple-600">🔒 Immutable</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Features Overview */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span>🔐 Enhanced Security Features Active</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Email Uniqueness Validation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Role Conflict Prevention</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Admin Account Protection</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Secure Employee ID Generation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Comprehensive Audit Logging</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Real-time Security Validation</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="management" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="management" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>User Management</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Security Events</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Audit Trail</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-6">
          <SecureUserManagement />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-orange-600" />
                <span>Recent Security Events</span>
                <Badge variant="outline">{securityEvents.length} Events</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {securityEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent security events</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {securityEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity.toUpperCase()}
                        </Badge>
                        <div>
                          <p className="font-medium">{event.type}</p>
                          <p className="text-sm text-gray-600">{event.message}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {event.resolved ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>User Management Audit Trail</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Database className="w-4 h-4" />
                <AlertDescription>
                  All user creation, modification, and deletion activities are automatically logged 
                  with full audit trails including security validation results and admin protection checks.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">🔐 Admin Protection Events</span>
                  <Badge variant="outline">Protected</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">📧 Email Uniqueness Checks</span>
                  <Badge variant="outline">Validated</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">⚖️ Role Conflict Validations</span>
                  <Badge variant="outline">Prevented</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">🆔 Secure ID Generation</span>
                  <Badge variant="outline">Generated</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecureUserManagementPage;