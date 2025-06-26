
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  AlertTriangle,
  Shield,
  Building,
  FileText,
  Clock,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import useRolePermissions from '@/hooks/use-role-permissions';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'motion/react';

interface DashboardData {
  todaySales: number;
  totalProducts: number;
  activeEmployees: number;
  pendingOrders: number;
  lowStockItems: number;
  expiringLicenses: number;
  systemHealth: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: string;
    status: 'success' | 'warning' | 'error';
  }>;
}

const EnhancedDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    todaySales: 0,
    totalProducts: 0,
    activeEmployees: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    expiringLicenses: 0,
    systemHealth: 98,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { 
    hasPermission, 
    isAdmin, 
    isManagement, 
    isEmployee, 
    rolePermissions,
    canAccessStation 
  } = useRolePermissions();
  const { toast } = useToast();

  console.log('EnhancedDashboard: Component initialized', { 
    user, 
    rolePermissions,
    isAdmin, 
    isManagement, 
    isEmployee 
  });

  useEffect(() => {
    loadDashboardData();
  }, [rolePermissions]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('EnhancedDashboard: Loading dashboard data');

      // Simulate loading dashboard data
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data - in a real app, this would come from APIs
      const mockData: DashboardData = {
        todaySales: 15420.50,
        totalProducts: 847,
        activeEmployees: 23,
        pendingOrders: 12,
        lowStockItems: 5,
        expiringLicenses: 2,
        systemHealth: 98,
        recentActivity: [
          {
            id: '1',
            type: 'Sales Report',
            description: 'Daily sales report completed for MOBIL station',
            timestamp: '2 minutes ago',
            user: 'John Doe',
            status: 'success'
          },
          {
            id: '2',
            type: 'Inventory Alert',
            description: 'Low stock alert for Energy Drinks category',
            timestamp: '15 minutes ago',
            user: 'System',
            status: 'warning'
          },
          {
            id: '3',
            type: 'License Expiry',
            description: 'Business license expires in 30 days',
            timestamp: '1 hour ago',
            user: 'System',
            status: 'warning'
          },
          {
            id: '4',
            type: 'Employee Update',
            description: 'New employee profile created',
            timestamp: '2 hours ago',
            user: 'Jane Smith',
            status: 'success'
          }
        ]
      };

      setDashboardData(mockData);
      console.log('EnhancedDashboard: Dashboard data loaded', mockData);
      
    } catch (error) {
      console.error('EnhancedDashboard: Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusIcon = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    canView: boolean;
  }> = ({ title, value, change, icon: Icon, color, canView }) => {
    if (!canView) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {change && (
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {change}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-full ${color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {getGreeting()}, {user?.Name || 'User'}!
                </h1>
                <p className="text-blue-100 mt-1">
                  Welcome to your {rolePermissions?.role} dashboard
                </p>
                {rolePermissions?.station && (
                  <Badge variant="secondary" className="mt-2">
                    {rolePermissions.station}
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span className="text-sm">System Status</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Progress value={dashboardData.systemHealth} className="w-20" />
                  <span className="text-sm">{dashboardData.systemHealth}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Sales"
          value={`$${dashboardData.todaySales.toLocaleString()}`}
          change="+12.5% from yesterday"
          icon={DollarSign}
          color="bg-green-500"
          canView={hasPermission('sales', 'view')}
        />
        <StatCard
          title="Total Products"
          value={dashboardData.totalProducts}
          change="+3 new this week"
          icon={Package}
          color="bg-blue-500"
          canView={hasPermission('products', 'view')}
        />
        <StatCard
          title="Active Employees"
          value={dashboardData.activeEmployees}
          change="All stations"
          icon={Users}
          color="bg-purple-500"
          canView={hasPermission('employees', 'view')}
        />
        <StatCard
          title="System Health"
          value={`${dashboardData.systemHealth}%`}
          change="All systems operational"
          icon={Shield}
          color="bg-indigo-500"
          canView={isAdmin || isManagement}
        />
      </div>

      {/* Alerts and Notifications */}
      {(dashboardData.lowStockItems > 0 || dashboardData.expiringLicenses > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="space-y-1">
                {dashboardData.lowStockItems > 0 && hasPermission('inventory', 'view') && (
                  <div>• {dashboardData.lowStockItems} items are running low on stock</div>
                )}
                {dashboardData.expiringLicenses > 0 && hasPermission('licenses', 'view') && (
                  <div>• {dashboardData.expiringLicenses} licenses are expiring soon</div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pending Tasks */}
            {hasPermission('orders', 'view') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Pending Tasks</span>
                  </CardTitle>
                  <CardDescription>Items requiring your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Pending Orders</p>
                        <p className="text-sm text-gray-600">Awaiting processing</p>
                      </div>
                      <Badge variant="secondary">{dashboardData.pendingOrders}</Badge>
                    </div>
                    {hasPermission('inventory', 'view') && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Low Stock Items</p>
                          <p className="text-sm text-gray-600">Need restocking</p>
                        </div>
                        <Badge variant={dashboardData.lowStockItems > 0 ? 'destructive' : 'secondary'}>
                          {dashboardData.lowStockItems}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Station Overview */}
            {(isAdmin || isManagement) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Station Overview</span>
                  </CardTitle>
                  <CardDescription>Multi-station performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'].map(station => (
                      canAccessStation(station) && (
                        <div key={station} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{station}</p>
                            <p className="text-sm text-gray-600">Operational</p>
                          </div>
                          <Badge variant="default">Active</Badge>
                        </div>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Latest system activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{activity.type}</p>
                        <span className="text-sm text-gray-500">{activity.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick-actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used actions based on your role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hasPermission('sales', 'create') && (
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col space-y-2"
                    onClick={() => window.location.href = '/sales/new'}
                  >
                    <FileText className="h-6 w-6" />
                    <span>New Sales Report</span>
                  </Button>
                )}
                {hasPermission('products', 'view') && (
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col space-y-2"
                    onClick={() => window.location.href = '/products'}
                  >
                    <Package className="h-6 w-6" />
                    <span>View Products</span>
                  </Button>
                )}
                {hasPermission('employees', 'manage') && (
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col space-y-2"
                    onClick={() => window.location.href = '/employees'}
                  >
                    <Users className="h-6 w-6" />
                    <span>Manage Staff</span>
                  </Button>
                )}
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col space-y-2"
                    onClick={() => window.location.href = '/settings'}
                  >
                    <Shield className="h-6 w-6" />
                    <span>Admin Panel</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDashboard;
