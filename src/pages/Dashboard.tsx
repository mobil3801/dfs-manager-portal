import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Users, 
  TrendingUp, 
  Building2, 
  ShoppingCart, 
  FileText,
  AlertTriangle,
  DollarSign
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalEmployees: number;
  activeEmployees: number;
  todaySales: number;
  monthSales: number;
  pendingOrders: number;
  expiringLicenses: number;
}

const Dashboard: React.FC = () => {
  const { user, userProfile, hasPermission } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    todaySales: 0,
    monthSales: 0,
    pendingOrders: 0,
    expiringLicenses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load various statistics
      const promises = [];

      // Products statistics
      if (hasPermission('products', 'read')) {
        promises.push(
          window.ezsite.apis.tablePage('11726', { PageNo: 1, PageSize: 1000 })
            .then(({ data, error }) => {
              if (!error && data) {
                const products = data.List || [];
                const lowStock = products.filter(p => p.quantity_in_stock <= p.minimum_stock);
                return { totalProducts: products.length, lowStockProducts: lowStock.length };
              }
              return { totalProducts: 0, lowStockProducts: 0 };
            })
        );
      }

      // Employees statistics
      if (hasPermission('employees', 'read')) {
        promises.push(
          window.ezsite.apis.tablePage('11727', { PageNo: 1, PageSize: 1000 })
            .then(({ data, error }) => {
              if (!error && data) {
                const employees = data.List || [];
                const active = employees.filter(e => e.is_active);
                return { totalEmployees: employees.length, activeEmployees: active.length };
              }
              return { totalEmployees: 0, activeEmployees: 0 };
            })
        );
      }

      // Sales statistics
      if (hasPermission('sales', 'read')) {
        const today = new Date().toISOString().split('T')[0];
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        
        promises.push(
          window.ezsite.apis.tablePage('11728', {
            PageNo: 1,
            PageSize: 1000,
            Filters: [
              { name: 'report_date', op: 'GreaterThanOrEqual', value: today }
            ]
          }).then(({ data, error }) => {
            if (!error && data) {
              const todayReports = data.List || [];
              const todayTotal = todayReports.reduce((sum, report) => sum + (report.total_sales || 0), 0);
              return { todaySales: todayTotal };
            }
            return { todaySales: 0 };
          })
        );

        promises.push(
          window.ezsite.apis.tablePage('11728', {
            PageNo: 1,
            PageSize: 1000,
            Filters: [
              { name: 'report_date', op: 'GreaterThanOrEqual', value: startOfMonth }
            ]
          }).then(({ data, error }) => {
            if (!error && data) {
              const monthReports = data.List || [];
              const monthTotal = monthReports.reduce((sum, report) => sum + (report.total_sales || 0), 0);
              return { monthSales: monthTotal };
            }
            return { monthSales: 0 };
          })
        );
      }

      // Orders statistics
      if (hasPermission('orders', 'read')) {
        promises.push(
          window.ezsite.apis.tablePage('11730', {
            PageNo: 1,
            PageSize: 1000,
            Filters: [
              { name: 'status', op: 'Equal', value: 'Pending' }
            ]
          }).then(({ data, error }) => {
            if (!error && data) {
              return { pendingOrders: (data.List || []).length };
            }
            return { pendingOrders: 0 };
          })
        );
      }

      // Licenses statistics
      if (hasPermission('licenses', 'read')) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        promises.push(
          window.ezsite.apis.tablePage('11731', {
            PageNo: 1,
            PageSize: 1000,
            Filters: [
              { name: 'expiry_date', op: 'LessThanOrEqual', value: thirtyDaysFromNow.toISOString() },
              { name: 'status', op: 'Equal', value: 'Active' }
            ]
          }).then(({ data, error }) => {
            if (!error && data) {
              return { expiringLicenses: (data.List || []).length };
            }
            return { expiringLicenses: 0 };
          })
        );
      }

      const results = await Promise.all(promises);
      
      // Merge all results
      const newStats = { ...stats };
      results.forEach(result => {
        Object.assign(newStats, result);
      });
      
      setStats(newStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const statsCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <Package className="w-6 h-6" />,
      color: 'bg-blue-500',
      show: hasPermission('products', 'read')
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockProducts,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-orange-500',
      show: hasPermission('products', 'read') && stats.lowStockProducts > 0
    },
    {
      title: 'Active Employees',
      value: `${stats.activeEmployees}/${stats.totalEmployees}`,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500',
      show: hasPermission('employees', 'read')
    },
    {
      title: "Today's Sales",
      value: formatCurrency(stats.todaySales),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-purple-500',
      show: hasPermission('sales', 'read')
    },
    {
      title: 'Monthly Sales',
      value: formatCurrency(stats.monthSales),
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-indigo-500',
      show: hasPermission('sales', 'read')
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'bg-yellow-500',
      show: hasPermission('orders', 'read')
    },
    {
      title: 'Expiring Licenses',
      value: stats.expiringLicenses,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-red-500',
      show: hasPermission('licenses', 'read') && stats.expiringLicenses > 0
    }
  ].filter(card => card.show);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.Name}!
        </h1>
        <p className="text-blue-100">
          {userProfile?.role} at {userProfile?.station || 'Dream Frame Queens'}
        </p>
        <p className="text-sm text-blue-200 mt-2">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasPermission('products', 'write') && (
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span>Add New Product</span>
                </div>
                <Badge variant="secondary">Products</Badge>
              </div>
            )}
            {hasPermission('employees', 'write') && (
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <span>Add New Employee</span>
                </div>
                <Badge variant="secondary">Employees</Badge>
              </div>
            )}
            {hasPermission('sales', 'write') && (
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span>Create Sales Report</span>
                </div>
                <Badge variant="secondary">Sales</Badge>
              </div>
            )}
            {hasPermission('orders', 'write') && (
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
                  <span>Create New Order</span>
                </div>
                <Badge variant="secondary">Orders</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              Current system status and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Your Role</span>
              <Badge variant={userProfile?.role === 'Administrator' ? 'default' : 'secondary'}>
                {userProfile?.role}
              </Badge>
            </div>
            {userProfile?.station && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Assigned Station</span>
                <Badge variant="outline">{userProfile.station}</Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Access Level</span>
              <Badge variant={hasPermission('dashboard', 'write') ? 'default' : 'secondary'}>
                {hasPermission('dashboard', 'write') ? 'Read & Write' : 'Read Only'}
              </Badge>
            </div>
            {userProfile?.employee_id && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Employee ID</span>
                <span className="text-sm font-medium">{userProfile.employee_id}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;