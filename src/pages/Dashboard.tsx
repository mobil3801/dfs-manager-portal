import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Building2,
  Activity,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedPermissions } from '@/hooks/use-enhanced-permissions';
import { motion } from 'motion/react';
import QuickAdminDashboard from '@/components/Admin/QuickAdminDashboard';

interface DashboardStats {
  totalSales: number;
  totalProducts: number;
  totalEmployees: number;
  totalOrders: number;
  recentSalesReports: number;
  expiredLicenses: number;
  lowStockProducts: number;
  pendingOrders: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    hasPermission, 
    isAdmin, 
    isManager, 
    userStation, 
    hasAllStationsAccess,
    loading: permissionsLoading 
  } = useEnhancedPermissions();

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalProducts: 0,
    totalEmployees: 0,
    totalOrders: 0,
    recentSalesReports: 0,
    expiredLicenses: 0,
    lowStockProducts: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    if (!permissionsLoading) {
      loadDashboardData();
    }
  }, [permissionsLoading, userStation]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const statsPromises = [];

      // Load sales reports if user has permission
      if (hasPermission('sales', 'view')) {
        statsPromises.push(
          window.ezsite.apis.tablePage(12356, {
            PageNo: 1,
            PageSize: 100,
            OrderByField: "report_date",
            IsAsc: false,
            Filters: userStation && userStation !== 'ALL' ? [
              { name: "station", op: "Equal", value: userStation }
            ] : []
          }).then(response => {
            if (response.data?.List) {
              const salesReports = response.data.List;
              const totalSales = salesReports.reduce((sum: number, report: any) => 
                sum + (report.total_sales || 0), 0
              );
              return { totalSales, recentSalesReports: salesReports.length };
            }
            return { totalSales: 0, recentSalesReports: 0 };
          })
        );
      }

      // Load products if user has permission
      if (hasPermission('products', 'view')) {
        statsPromises.push(
          window.ezsite.apis.tablePage(11726, {
            PageNo: 1,
            PageSize: 100,
            OrderByField: "id",
            IsAsc: false,
            Filters: []
          }).then(response => {
            if (response.data?.List) {
              const products = response.data.List;
              const lowStock = products.filter((product: any) => 
                product.quantity_in_stock <= product.minimum_stock
              ).length;
              return { totalProducts: products.length, lowStockProducts: lowStock };
            }
            return { totalProducts: 0, lowStockProducts: 0 };
          })
        );
      }

      // Load employees if user has permission
      if (hasPermission('employees', 'view')) {
        statsPromises.push(
          window.ezsite.apis.tablePage(11727, {
            PageNo: 1,
            PageSize: 100,
            OrderByField: "id",
            IsAsc: false,
            Filters: userStation && userStation !== 'ALL' ? [
              { name: "station", op: "Equal", value: userStation }
            ] : []
          }).then(response => {
            if (response.data?.List) {
              return { totalEmployees: response.data.List.length };
            }
            return { totalEmployees: 0 };
          })
        );
      }

      // Load orders if user has permission
      if (hasPermission('orders', 'view')) {
        statsPromises.push(
          window.ezsite.apis.tablePage(11730, {
            PageNo: 1,
            PageSize: 100,
            OrderByField: "order_date",
            IsAsc: false,
            Filters: userStation && userStation !== 'ALL' ? [
              { name: "station", op: "Equal", value: userStation }
            ] : []
          }).then(response => {
            if (response.data?.List) {
              const orders = response.data.List;
              const pending = orders.filter((order: any) => order.status === 'Pending').length;
              return { totalOrders: orders.length, pendingOrders: pending };
            }
            return { totalOrders: 0, pendingOrders: 0 };
          })
        );
      }

      // Load licenses if user has permission
      if (hasPermission('licenses', 'view')) {
        statsPromises.push(
          window.ezsite.apis.tablePage(11731, {
            PageNo: 1,
            PageSize: 100,
            OrderByField: "expiry_date",
            IsAsc: true,
            Filters: userStation && userStation !== 'ALL' ? [
              { name: "station", op: "Equal", value: userStation }
            ] : []
          }).then(response => {
            if (response.data?.List) {
              const licenses = response.data.List;
              const expired = licenses.filter((license: any) => 
                new Date(license.expiry_date) < new Date()
              ).length;
              return { expiredLicenses: expired };
            }
            return { expiredLicenses: 0 };
          })
        );
      }

      const results = await Promise.all(statsPromises);
      const combinedStats = results.reduce((acc, result) => ({ ...acc, ...result }), {});
      
      setStats(prev => ({ ...prev, ...combinedStats }));

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

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.Name || 'User'}!</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {hasAllStationsAccess() ? 'All Stations Access' : `Station: ${userStation || 'Not Assigned'}`}
            {isAdmin() && (
              <Badge className="bg-red-500 text-white ml-2">
                <Shield className="h-3 w-3 mr-1" />
                Administrator
              </Badge>
            )}
            {isManager() && !isAdmin() && (
              <Badge className="bg-blue-500 text-white ml-2">
                Manager
              </Badge>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today's Date</p>
          <p className="font-semibold">{new Date().toLocaleDateString()}</p>
        </div>
      </motion.div>

      {/* Admin Dashboard Tab - Only for Administrators */}
      {isAdmin() && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview stats={stats} loading={loading} hasPermission={hasPermission} navigate={navigate} />
          </TabsContent>

          <TabsContent value="admin">
            <QuickAdminDashboard />
          </TabsContent>
        </Tabs>
      )}

      {/* Regular Dashboard for Non-Admin Users */}
      {!isAdmin() && (
        <DashboardOverview stats={stats} loading={loading} hasPermission={hasPermission} navigate={navigate} />
      )}

      {/* System Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-4"
      >
        {stats.expiredLicenses > 0 && hasPermission('licenses', 'view') && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{stats.expiredLicenses}</strong> license(s) have expired. 
              <Button 
                variant="link" 
                className="p-0 h-auto ml-2"
                onClick={() => navigate('/licenses')}
              >
                Review licenses
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {stats.lowStockProducts > 0 && hasPermission('products', 'view') && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{stats.lowStockProducts}</strong> product(s) are running low on stock.
              <Button 
                variant="link" 
                className="p-0 h-auto ml-2"
                onClick={() => navigate('/products')}
              >
                Check inventory
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {stats.pendingOrders > 0 && hasPermission('orders', 'view') && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{stats.pendingOrders}</strong> order(s) are pending approval.
              <Button 
                variant="link" 
                className="p-0 h-auto ml-2"
                onClick={() => navigate('/orders')}
              >
                Review orders
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </motion.div>
    </div>
  );
};

// Extracted Dashboard Overview Component
interface DashboardOverviewProps {
  stats: DashboardStats;
  loading: boolean;
  hasPermission: (module: string, action: string) => boolean;
  navigate: (path: string) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats, loading, hasPermission, navigate }) => {
  const statsCards = [
    {
      title: "Total Sales",
      value: `$${stats.totalSales.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      permission: hasPermission('sales', 'view'),
      onClick: () => navigate('/sales')
    },
    {
      title: "Products",
      value: stats.totalProducts.toString(),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      permission: hasPermission('products', 'view'),
      onClick: () => navigate('/products')
    },
    {
      title: "Employees",
      value: stats.totalEmployees.toString(),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      permission: hasPermission('employees', 'view'),
      onClick: () => navigate('/employees')
    },
    {
      title: "Orders",
      value: stats.totalOrders.toString(),
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      permission: hasPermission('orders', 'view'),
      onClick: () => navigate('/orders')
    }
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          if (!stat.permission) return null;
          
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={stat.onClick}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold">
                        {loading ? '...' : stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used actions and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {hasPermission('sales', 'create') && (
                <Button
                  variant="outline"
                  className="h-16 flex flex-col gap-2"
                  onClick={() => navigate('/sales/new')}
                >
                  <DollarSign className="h-5 w-5" />
                  <span className="text-sm">New Sales Report</span>
                </Button>
              )}
              
              {hasPermission('products', 'create') && (
                <Button
                  variant="outline"
                  className="h-16 flex flex-col gap-2"
                  onClick={() => navigate('/products/new')}
                >
                  <Package className="h-5 w-5" />
                  <span className="text-sm">Add Product</span>
                </Button>
              )}
              
              {hasPermission('orders', 'create') && (
                <Button
                  variant="outline"
                  className="h-16 flex flex-col gap-2"
                  onClick={() => navigate('/orders/new')}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-sm">Create Order</span>
                </Button>
              )}
              
              {hasPermission('delivery', 'create') && (
                <Button
                  variant="outline"
                  className="h-16 flex flex-col gap-2"
                  onClick={() => navigate('/delivery/new')}
                >
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm">Log Delivery</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default Dashboard;