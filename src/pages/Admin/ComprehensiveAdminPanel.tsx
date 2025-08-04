import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  Users,
  Shield,
  Activity,
  Database,
  MessageSquare,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  TestTube,
  Bell,
  BarChart3,
  FileText,
  Building,
  Monitor,
  AlertCircle,
  RefreshCw,
  Eye,
  UserCheck,
  Lock,
  Zap,
  TrendingUp,
  Server
} from 'lucide-react';

// Import admin components that exist
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import RealTimeAdminControls from '@/components/RealTimeAdminControls';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalStations: number;
  totalProducts: number;
  totalAuditLogs: number;
  todaysActivity: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  databaseConnected: boolean;
  lastRefresh: Date;
}

const ComprehensiveAdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isAuthenticated } = useSupabaseAuth();

  // Redirect if not admin
  if (!isAuthenticated || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You need administrator privileges to access this page.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalStations: 0,
    totalProducts: 0,
    totalAuditLogs: 0,
    todaysActivity: 0,
    systemHealth: 'healthy',
    databaseConnected: false,
    lastRefresh: new Date()
  });
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      
      // Test database connection
      const { data: dbTest, error: dbError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (dbError) {
        throw new Error(`Database connection failed: ${dbError.message}`);
      }

      // Fetch user profiles
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*');

      // Fetch stations
      const { data: stationsData, error: stationsError } = await supabase
        .from('stations')
        .select('*');

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');

      // Fetch audit logs
      const { data: auditData, error: auditError } = await supabase
        .from('audit_logs')
        .select('*');

      // Fetch today's activity
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAuditData, error: todayAuditError } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('event_timestamp', today);

      // Count active users (assuming they have role_code set)
      const activeUsersCount = usersData?.filter(user => user.role_code && user.is_active !== false).length || 0;

      setStats({
        totalUsers: usersData?.length || 0,
        activeUsers: activeUsersCount,
        totalStations: stationsData?.length || 0,
        totalProducts: productsData?.length || 0,
        totalAuditLogs: auditData?.length || 0,
        todaysActivity: todayAuditData?.length || 0,
        systemHealth: 'healthy',
        databaseConnected: true,
        lastRefresh: new Date()
      });

      toast({
        title: "Stats Updated",
        description: "Admin dashboard statistics refreshed successfully",
      });

    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
      setStats(prev => ({ 
        ...prev, 
        systemHealth: 'error',
        databaseConnected: false,
        lastRefresh: new Date()
      }));
      
      toast({
        title: "Error",
        description: `Failed to load admin statistics: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAdminStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    onClick,
    loading: cardLoading = false
  }: {
    title: string;
    value: number | string;
    icon: any;
    color: string;
    onClick?: () => void;
    loading?: boolean;
  }) => (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${onClick ? 'hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">
              {cardLoading ? (
                <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                value
              )}
            </p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  const AdminModule = ({ 
    title, 
    description, 
    icon: Icon, 
    onClick,
    badge,
    color = "text-blue-600"
  }: {
    title: string;
    description: string;
    icon: any;
    onClick: () => void;
    badge?: string;
    color?: string;
  }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:bg-gray-50">
      <CardContent className="p-6" onClick={onClick}>
        <div className="flex items-start space-x-3">
          <Icon className={`h-8 w-8 ${color} mt-1 flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{title}</h3>
              {badge && (
                <Badge variant="secondary" className="ml-2 flex-shrink-0">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
            <Button size="sm" className="mt-3" onClick={(e) => { e.stopPropagation(); onClick(); }}>
              Access {title}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getSystemHealthBadge = () => {
    const health = stats.systemHealth;
    if (health === 'healthy' && stats.databaseConnected) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Healthy</Badge>;
    } else if (health === 'warning') {
      return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Warning</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Error</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Comprehensive Admin Panel</h1>
              <p className="text-blue-100 mt-2">
                Complete system administration and monitoring dashboard
              </p>
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${stats.databaseConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                  <span className="text-sm">
                    {stats.databaseConnected ? 'Database Connected' : 'Database Disconnected'}
                  </span>
                </div>
                {getSystemHealthBadge()}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchAdminStats}
                disabled={loading}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="text-right">
                <p className="text-sm opacity-90">Last Updated</p>
                <p className="text-xs opacity-75">{stats.lastRefresh.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full lg:w-fit grid-cols-5 lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Real-Time Admin Controls */}
            <RealTimeAdminControls />
            
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={Users}
                color="text-blue-600"
                onClick={() => setActiveTab('users')}
                loading={loading}
              />
              <StatCard
                title="Active Users"
                value={stats.activeUsers}
                icon={UserCheck}
                color="text-green-600"
                loading={loading}
              />
              <StatCard
                title="Gas Stations"
                value={stats.totalStations}
                icon={Building}
                color="text-orange-600"
                loading={loading}
              />
              <StatCard
                title="Products"
                value={stats.totalProducts}
                icon={Package}
                color="text-purple-600"
                loading={loading}
              />
              <StatCard
                title="Audit Logs"
                value={stats.totalAuditLogs}
                icon={Database}
                color="text-indigo-600"
                onClick={() => setActiveTab('monitoring')}
                loading={loading}
              />
              <StatCard
                title="Today's Activity"
                value={stats.todaysActivity}
                icon={Activity}
                color="text-red-600"
                loading={loading}
              />
              <StatCard
                title="System Health"
                value={stats.systemHealth === 'healthy' ? 'Good' : 'Issues'}
                icon={stats.systemHealth === 'healthy' ? CheckCircle : AlertTriangle}
                color={stats.systemHealth === 'healthy' ? 'text-green-600' : 'text-red-600'}
                loading={loading}
              />
              <StatCard
                title="Database"
                value={stats.databaseConnected ? 'Connected' : 'Offline'}
                icon={stats.databaseConnected ? Database : AlertCircle}
                color={stats.databaseConnected ? 'text-green-600' : 'text-red-600'}
                loading={loading}
              />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Admin Actions</CardTitle>
                <CardDescription>
                  Frequently used administrative functions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AdminModule
                    title="User Management"
                    description="Manage user accounts, roles, and permissions"
                    icon={Users}
                    onClick={() => setActiveTab('users')}
                    badge="Active"
                    color="text-blue-600"
                  />
                  <AdminModule
                    title="Role Management"
                    description="Configure user roles and access permissions"
                    icon={Shield}
                    onClick={() => navigate('/admin/roles')}
                    color="text-green-600"
                  />
                  <AdminModule
                    title="System Monitor"
                    description="Monitor system health and performance"
                    icon={Monitor}
                    onClick={() => setActiveTab('monitoring')}
                    color="text-purple-600"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AdminModule
                title="User Management"
                description="Create, edit, and manage user accounts"
                icon={Users}
                onClick={() => navigate('/admin/users')}
                color="text-blue-600"
              />
              <AdminModule
                title="Role Management"
                description="Configure roles and permissions"
                icon={Shield}
                onClick={() => navigate('/admin/roles')}
                color="text-green-600"
              />
              <AdminModule
                title="User Validation"
                description="Validate user data and prevent conflicts"
                icon={UserCheck}
                onClick={() => navigate('/admin/user-validation')}
                color="text-orange-600"
              />
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">User Management Module</h3>
              <p className="text-gray-600 mb-4">
                The user management module will be loaded here. Click "User Management" above to access the full interface.
              </p>
              <Button onClick={() => navigate('/admin/users')}>
                Open User Management
              </Button>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AdminModule
                title="Database Monitor"
                description="Monitor database performance and connections"
                icon={Database}
                onClick={() => navigate('/admin/database')}
                color="text-blue-600"
              />
              <AdminModule
                title="SMS Management"
                description="Configure SMS alerts and notifications"
                icon={MessageSquare}
                onClick={() => navigate('/admin/sms')}
                color="text-green-600"
              />
              <AdminModule
                title="Alert Settings"
                description="Configure system alerts and thresholds"
                icon={Bell}
                onClick={() => navigate('/admin/alerts')}
                color="text-yellow-600"
              />
              <AdminModule
                title="Security Settings"
                description="Manage security policies and access controls"
                icon={Lock}
                onClick={() => navigate('/admin/security')}
                color="text-red-600"
              />
              <AdminModule
                title="Site Management"
                description="Configure gas stations and locations"
                icon={Building}
                onClick={() => navigate('/admin/sites')}
                color="text-purple-600"
              />
              <AdminModule
                title="System Logs"
                description="View and analyze system activity logs"
                icon={FileText}
                onClick={() => navigate('/admin/logs')}
                color="text-indigo-600"
              />
            </div>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AdminModule
                title="Audit Monitoring"
                description="Review audit trails and user activity"
                icon={Eye}
                onClick={() => navigate('/admin/audit')}
                color="text-blue-600"
              />
              <AdminModule
                title="Error Monitoring"
                description="Track and resolve system errors"
                icon={AlertCircle}
                onClick={() => navigate('/admin/errors')}
                color="text-red-600"
              />
              <AdminModule
                title="Performance Monitor"
                description="Monitor system performance metrics"
                icon={TrendingUp}
                onClick={() => navigate('/admin/performance')}
                color="text-green-600"
              />
              <AdminModule
                title="Memory Monitoring"
                description="Track memory usage and detect leaks"
                icon={Server}
                onClick={() => navigate('/admin/memory')}
                color="text-purple-600"
              />
              <AdminModule
                title="Development Monitor"
                description="Development tools and debugging"
                icon={TestTube}
                onClick={() => navigate('/admin/development')}
                color="text-orange-600"
              />
              <AdminModule
                title="Real-time Analytics"
                description="Live system analytics and metrics"
                icon={BarChart3}
                onClick={() => navigate('/admin/analytics')}
                color="text-indigo-600"
              />
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Audit Monitoring Module</h3>
              <p className="text-gray-600 mb-4">
                The audit monitoring module will be loaded here. Click "Audit Monitoring" above to access the full interface.
              </p>
              <Button onClick={() => navigate('/admin/audit')}>
                Open Audit Monitoring
              </Button>
            </div>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AdminModule
                title="Navigation Debug"
                description="Debug navigation and overflow issues"
                icon={TestTube}
                onClick={() => navigate('/admin/navigation-debug')}
                color="text-blue-600"
              />
              <AdminModule
                title="Login Testing"
                description="Test authentication and login flows"
                icon={UserCheck}
                onClick={() => navigate('/admin/login-test')}
                color="text-green-600"
              />
              <AdminModule
                title="Role Testing"
                description="Test role-based access and permissions"
                icon={Shield}
                onClick={() => navigate('/admin/role-testing')}
                color="text-purple-600"
              />
              <AdminModule
                title="Module Access"
                description="Configure module access permissions"
                icon={Lock}
                onClick={() => navigate('/admin/module-access')}
                color="text-red-600"
              />
              <AdminModule
                title="Overflow Testing"
                description="Test responsive design behavior"
                icon={Monitor}
                onClick={() => navigate('/overflow-testing')}
                color="text-orange-600"
              />
              <AdminModule
                title="API Testing"
                description="Test API endpoints and database connections"
                icon={Zap}
                onClick={() => navigate('/admin/api-test')}
                color="text-indigo-600"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComprehensiveAdminPanel;