import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Shield, 
  Activity, 
  Database, 
  AlertTriangle,
  CheckCircle,
  UserPlus,
  Settings,
  Eye,
  RefreshCw,
  TrendingUp,
  Building2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  recentLogins: number;
  failedLogins: number;
  systemHealth: number;
}

interface RecentActivity {
  id: number;
  event_type: string;
  username: string;
  event_timestamp: string;
  event_status: string;
  action_performed: string;
}

const QuickAdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const { hasAdminAccess } = useAdminAccess();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    recentLogins: 0,
    failedLogins: 0,
    systemHealth: 100
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    if (hasAdminAccess) {
      loadDashboardData();
    }
  }, [hasAdminAccess]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user statistics
      const usersResponse = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });

      if (usersResponse.data?.List) {
        const users = usersResponse.data.List;
        const activeUsers = users.filter((user: any) => user.is_active).length;
        const adminUsers = users.filter((user: any) => user.role === 'Administrator').length;
        
        setStats(prev => ({
          ...prev,
          totalUsers: users.length,
          activeUsers,
          adminUsers
        }));
      }

      // Load recent audit logs
      const auditResponse = await window.ezsite.apis.tablePage(12706, {
        PageNo: 1,
        PageSize: 10,
        OrderByField: "event_timestamp",
        IsAsc: false,
        Filters: []
      });

      if (auditResponse.data?.List) {
        setRecentActivity(auditResponse.data.List);
        
        // Calculate login statistics
        const recentLogs = auditResponse.data.List;
        const recentLogins = recentLogs.filter((log: any) => 
          log.event_type === 'Login' && log.event_status === 'Success'
        ).length;
        const failedLogins = recentLogs.filter((log: any) => 
          log.event_type === 'Login' && log.event_status === 'Failed'
        ).length;
        
        setStats(prev => ({
          ...prev,
          recentLogins,
          failedLogins
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (eventType: string) => {
    switch (eventType) {
      case 'Login':
        return <UserPlus className="h-4 w-4" />;
      case 'Permission Change':
        return <Shield className="h-4 w-4" />;
      case 'User Created':
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return <Badge className="bg-green-500 text-white text-xs">Success</Badge>;
      case 'Failed':
        return <Badge className="bg-red-500 text-white text-xs">Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  if (!hasAdminAccess) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Overview</h2>
          <p className="text-muted-foreground">
            Quick insights into system health and user activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadDashboardData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => navigate('/settings')}
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Full Admin Panel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {stats.activeUsers} Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Administrators</p>
                  <p className="text-2xl font-bold">{stats.adminUsers}</p>
                </div>
                <Shield className="h-8 w-8 text-red-500" />
              </div>
              <div className="mt-2">
                <Badge className="bg-red-500 text-white text-xs">
                  Admin Level
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Logins</p>
                  <p className="text-2xl font-bold">{stats.recentLogins}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2">
                <Badge className="bg-green-500 text-white text-xs">
                  {stats.failedLogins} Failed
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Health</p>
                  <p className="text-2xl font-bold">{stats.systemHealth}%</p>
                </div>
                <Database className="h-8 w-8 text-purple-500" />
              </div>
              <div className="mt-2">
                <Progress value={stats.systemHealth} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest system events and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getActivityIcon(activity.event_type)}
                      <div>
                        <p className="font-medium text-sm">{activity.action_performed}</p>
                        <p className="text-xs text-muted-foreground">
                          by {activity.username} • {new Date(activity.event_timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(activity.event_status)}
                  </div>
                ))}
                
                {recentActivity.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardDescription>
                Current status of system components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Database Connection</span>
                </div>
                <Badge className="bg-green-500 text-white text-xs">Online</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Authentication Service</span>
                </div>
                <Badge className="bg-green-500 text-white text-xs">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Permission System</span>
                </div>
                <Badge className="bg-green-500 text-white text-xs">Operational</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">SMS Alerts</span>
                </div>
                <Badge className="bg-yellow-500 text-white text-xs">Testing</Badge>
              </div>

              <Alert className="mt-4">
                <Building2 className="h-4 w-4" />
                <AlertDescription>
                  All stations are synchronized and operational. 
                  Multi-station management is fully functional.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate('/settings')}
                variant="outline"
                size="sm"
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button
                onClick={() => navigate('/admin/system-logs')}
                variant="outline"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Audit Logs
              </Button>
              <Button
                onClick={() => navigate('/admin/security-settings')}
                variant="outline"
                size="sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Security Settings
              </Button>
              <Button
                onClick={() => navigate('/admin/database-monitoring')}
                variant="outline"
                size="sm"
              >
                <Database className="h-4 w-4 mr-2" />
                System Health
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default QuickAdminDashboard;