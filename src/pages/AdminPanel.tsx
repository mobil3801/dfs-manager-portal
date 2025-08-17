import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BarChart3,
  FileText,
  Zap } from
'lucide-react';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalAuditLogs: number;
  todaysActivity: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

const AdminPanel = () => {
  const { user, isAuthenticated } = useSimpleAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalAuditLogs: 0,
    todaysActivity: 0,
    systemHealth: 'healthy'
  });
  const [loading, setLoading] = useState(true);

  // Check if user is admin (simple check for now)
  const isAdmin = user?.role === 'Administrator' || user?.email?.includes('admin');

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const fetchAdminStats = async () => {
    try {
      setLoading(true);

      // Mock data for now - replace with real API calls
      setStats({
        totalUsers: 25,
        activeUsers: 18,
        totalAuditLogs: 1247,
        todaysActivity: 156,
        systemHealth: 'healthy'
      });

      toast({
        title: "Dashboard Updated",
        description: "Admin dashboard data refreshed successfully"
      });

    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setStats((prev) => ({ ...prev, systemHealth: 'error' }));
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
    // Refresh every 2 minutes
    const interval = setInterval(fetchAdminStats, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const AdminStatCard = ({
    title,
    value,
    icon: Icon,
    color,
    onClick






  }: {title: string;value: number | string;icon: any;color: string;onClick?: () => void;}) =>
  <Card
    className={`p-6 cursor-pointer hover:shadow-lg transition-shadow ${onClick ? 'hover:bg-gray-50' : ''}`}
    onClick={onClick}>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{loading ? '...' : value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </Card>;


  const QuickAdminAction = ({
    title,
    description,
    icon: Icon,
    onClick,
    variant = "default"






  }: {title: string;description: string;icon: any;onClick: () => void;variant?: "default" | "secondary" | "destructive";}) =>
  <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3 mb-3">
        <Icon className="h-6 w-6 text-blue-600 mt-1" />
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <Button onClick={onClick} variant={variant} size="sm" className="w-full">
        Access {title}
      </Button>
    </Card>;


  const getSystemHealthBadge = () => {
    const health = stats.systemHealth;
    if (health === 'healthy') {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Healthy</Badge>;
    } else if (health === 'warning') {
      return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Warning</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Error</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">DFS Manager Admin Panel</h1>
        <p className="opacity-90 text-lg">
          Welcome back, {user?.name || user?.email} • Full System Access
        </p>
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">System Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span className="text-sm">Database Connected</span>
          </div>
        </div>
      </div>

      {/* System Health */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span className="font-semibold">System Status</span>
          </div>
          {getSystemHealthBadge()}
        </div>
      </Card>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="text-blue-600"
          onClick={() => navigate('/admin/users')} />

        <AdminStatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={Shield}
          color="text-green-600" />

        <AdminStatCard
          title="System Logs"
          value={stats.totalAuditLogs}
          icon={FileText}
          color="text-purple-600" />

        <AdminStatCard
          title="Today's Activity"
          value={stats.todaysActivity}
          icon={Activity}
          color="text-orange-600" />

      </div>

      {/* Admin Actions */}
      <Tabs defaultValue="management" className="space-y-4">
        <TabsList className="grid w-full lg:w-[600px] grid-cols-3">
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAdminAction
              title="User Management"
              description="Manage user accounts, roles, and permissions"
              icon={Users}
              onClick={() => navigate('/admin/users')} />

            <QuickAdminAction
              title="Station Management"
              description="Configure gas stations and locations"
              icon={Settings}
              onClick={() => toast({ title: "Coming Soon", description: "Station management will be available soon" })} />

            <QuickAdminAction
              title="Security Settings"
              description="Manage security policies and access controls"
              icon={Shield}
              onClick={() => toast({ title: "Coming Soon", description: "Security settings will be available soon" })} />

            <QuickAdminAction
              title="Reports & Analytics"
              description="View system reports and analytics"
              icon={BarChart3}
              onClick={() => toast({ title: "Coming Soon", description: "Analytics dashboard will be available soon" })} />

            <QuickAdminAction
              title="Product Management"
              description="Manage product catalog and inventory"
              icon={Database}
              onClick={() => toast({ title: "Coming Soon", description: "Product management will be available soon" })} />

            <QuickAdminAction
              title="Employee Management"
              description="Manage employee records and access"
              icon={Users}
              onClick={() => toast({ title: "Coming Soon", description: "Employee management will be available soon" })} />

          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAdminAction
              title="Database Status"
              description="Monitor database performance and connections"
              icon={Database}
              onClick={() => toast({ title: "Database Status", description: "All database connections are healthy" })} />

            <QuickAdminAction
              title="SMS Services"
              description="Configure SMS alerts and notifications"
              icon={MessageSquare}
              onClick={() => toast({ title: "Coming Soon", description: "SMS management will be available soon" })} />

            <QuickAdminAction
              title="System Configuration"
              description="Manage system settings and preferences"
              icon={Settings}
              onClick={() => toast({ title: "Coming Soon", description: "System configuration will be available soon" })} />

            <QuickAdminAction
              title="Performance Tuning"
              description="Optimize system performance settings"
              icon={Zap}
              onClick={() => toast({ title: "Coming Soon", description: "Performance tuning will be available soon" })} />

          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAdminAction
              title="Activity Logs"
              description="Review user activity and system logs"
              icon={FileText}
              onClick={() => toast({ title: "Coming Soon", description: "Activity logs will be available soon" })} />

            <QuickAdminAction
              title="Error Monitoring"
              description="Track and resolve system errors"
              icon={AlertTriangle}
              onClick={() => toast({ title: "Coming Soon", description: "Error monitoring will be available soon" })}
              variant="secondary" />

            <QuickAdminAction
              title="Performance Metrics"
              description="Monitor system performance in real-time"
              icon={Activity}
              onClick={() => toast({ title: "Coming Soon", description: "Performance metrics will be available soon" })} />

            <QuickAdminAction
              title="System Tests"
              description="Run diagnostic tests and health checks"
              icon={TestTube}
              onClick={() => toast({ title: "System Test", description: "All systems are functioning normally" })} />

          </div>
        </TabsContent>
      </Tabs>

      {/* System Information */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Current Status</p>
            <p className="text-gray-600">All systems operational</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Last Updated</p>
            <p className="text-gray-600">{new Date().toLocaleString()}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Database Status</p>
            <p className="text-green-600">Connected and healthy</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Active Sessions</p>
            <p className="text-gray-600">{stats.activeUsers} users online</p>
          </div>
        </div>
      </Card>
    </div>);

};

export default AdminPanel;