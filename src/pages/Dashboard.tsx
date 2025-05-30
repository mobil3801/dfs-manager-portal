import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Users,
  TrendingUp,
  Building2,
  ShoppingCart,
  FileText,
  AlertTriangle,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle } from
'lucide-react';

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalEmployees: number;
  activeEmployees: number;
  todaySales: number;
  monthSales: number;
  totalVendors: number;
  activeVendors: number;
  pendingOrders: number;
  deliveredOrders: number;
  activeLicenses: number;
  expiringLicenses: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    todaySales: 0,
    monthSales: 0,
    totalVendors: 0,
    activeVendors: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    activeLicenses: 0,
    expiringLicenses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const promises = [];

      // Products statistics
      promises.push(
        window.ezsite.apis.tablePage('11726', { PageNo: 1, PageSize: 1000 }).
        then(({ data, error }) => {
          if (!error && data) {
            const products = data.List || [];
            const lowStock = products.filter((p) => p.quantity_in_stock <= p.minimum_stock);
            return { totalProducts: products.length, lowStockProducts: lowStock.length };
          }
          return { totalProducts: 0, lowStockProducts: 0 };
        })
      );

      // Employees statistics
      promises.push(
        window.ezsite.apis.tablePage('11727', { PageNo: 1, PageSize: 1000 }).
        then(({ data, error }) => {
          if (!error && data) {
            const employees = data.List || [];
            const active = employees.filter((e) => e.is_active);
            return { totalEmployees: employees.length, activeEmployees: active.length };
          }
          return { totalEmployees: 0, activeEmployees: 0 };
        })
      );

      // Sales statistics
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      promises.push(
        window.ezsite.apis.tablePage('11728', {
          PageNo: 1,
          PageSize: 1000,
          Filters: [{ name: 'report_date', op: 'GreaterThanOrEqual', value: today }]
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
          Filters: [{ name: 'report_date', op: 'GreaterThanOrEqual', value: startOfMonth }]
        }).then(({ data, error }) => {
          if (!error && data) {
            const monthReports = data.List || [];
            const monthTotal = monthReports.reduce((sum, report) => sum + (report.total_sales || 0), 0);
            return { monthSales: monthTotal };
          }
          return { monthSales: 0 };
        })
      );

      // Vendors statistics
      promises.push(
        window.ezsite.apis.tablePage('11729', { PageNo: 1, PageSize: 1000 }).
        then(({ data, error }) => {
          if (!error && data) {
            const vendors = data.List || [];
            const active = vendors.filter((v) => v.is_active);
            return { totalVendors: vendors.length, activeVendors: active.length };
          }
          return { totalVendors: 0, activeVendors: 0 };
        })
      );

      // Orders statistics
      promises.push(
        window.ezsite.apis.tablePage('11730', {
          PageNo: 1,
          PageSize: 1000,
          Filters: [{ name: 'status', op: 'Equal', value: 'Pending' }]
        }).then(({ data, error }) => {
          if (!error && data) {
            return { pendingOrders: (data.List || []).length };
          }
          return { pendingOrders: 0 };
        })
      );

      promises.push(
        window.ezsite.apis.tablePage('11730', {
          PageNo: 1,
          PageSize: 1000,
          Filters: [{ name: 'status', op: 'Equal', value: 'Delivered' }]
        }).then(({ data, error }) => {
          if (!error && data) {
            return { deliveredOrders: (data.List || []).length };
          }
          return { deliveredOrders: 0 };
        })
      );

      // Licenses statistics
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      promises.push(
        window.ezsite.apis.tablePage('11731', {
          PageNo: 1,
          PageSize: 1000,
          Filters: [{ name: 'status', op: 'Equal', value: 'Active' }]
        }).then(({ data, error }) => {
          if (!error && data) {
            return { activeLicenses: (data.List || []).length };
          }
          return { activeLicenses: 0 };
        })
      );

      promises.push(
        window.ezsite.apis.tablePage('11731', {
          PageNo: 1,
          PageSize: 1000,
          Filters: [
          { name: 'expiry_date', op: 'LessThanOrEqual', value: thirtyDaysFromNow.toISOString() },
          { name: 'status', op: 'Equal', value: 'Active' }]

        }).then(({ data, error }) => {
          if (!error && data) {
            return { expiringLicenses: (data.List || []).length };
          }
          return { expiringLicenses: 0 };
        })
      );

      const results = await Promise.all(promises);

      // Merge all results
      const newStats = { ...stats };
      results.forEach((result) => {
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

  const quickActions = [
  {
    title: 'Add New Product',
    description: 'Add a product to inventory',
    icon: <Package className="w-5 h-5" />,
    color: 'bg-blue-500',
    action: () => navigate('/products/new')
  },
  {
    title: 'Add Employee',
    description: 'Register new employee',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-green-500',
    action: () => navigate('/employees/new')
  },
  {
    title: 'Create Sales Report',
    description: 'Record daily sales',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'bg-purple-500',
    action: () => navigate('/sales/new')
  },
  {
    title: 'Add Vendor',
    description: 'Register new vendor',
    icon: <Building2 className="w-5 h-5" />,
    color: 'bg-orange-500',
    action: () => navigate('/vendors/new')
  },
  {
    title: 'Create Order',
    description: 'Place new purchase order',
    icon: <ShoppingCart className="w-5 h-5" />,
    color: 'bg-indigo-500',
    action: () => navigate('/orders/new')
  },
  {
    title: 'Add License',
    description: 'Register license/certificate',
    icon: <FileText className="w-5 h-5" />,
    color: 'bg-pink-500',
    action: () => navigate('/licenses/new')
  }];


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) =>
          <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Business Management Dashboard
        </h1>
        <p className="text-blue-100">
          Gas Station Operations Center
        </p>
        <p className="text-sm text-blue-200 mt-2">
          Monitor your business performance and manage operations efficiently.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Products */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/products')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
                {stats.lowStockProducts > 0 &&
                <p className="text-sm text-orange-600 flex items-center mt-1">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {stats.lowStockProducts} low stock
                  </p>
                }
              </div>
              <div className="p-3 rounded-full bg-blue-500 text-white">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employees */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/employees')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.activeEmployees}/{stats.totalEmployees}
                </p>
                <p className="text-sm text-green-600">Active employees</p>
              </div>
              <div className="p-3 rounded-full bg-green-500 text-white">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Sales */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/sales')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Sales</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.monthSales)}
                </p>
                <p className="text-sm text-purple-600">
                  Today: {formatCurrency(stats.todaySales)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-500 text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/orders')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingOrders}</p>
                <p className="text-sm text-orange-600">Pending orders</p>
              </div>
              <div className="p-3 rounded-full bg-orange-500 text-white">
                <ShoppingCart className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/vendors')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.activeVendors}/{stats.totalVendors}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/orders')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.deliveredOrders}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/licenses')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Licenses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeLicenses}</p>
                {stats.expiringLicenses > 0 &&
                <p className="text-sm text-red-600 flex items-center mt-1">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {stats.expiringLicenses} expiring soon
                  </p>
                }
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Commonly used operations for efficient management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action, index) =>
              <Button
                key={index}
                variant="outline"
                className="p-4 h-auto justify-start"
                onClick={action.action}>

                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded ${action.color} text-white`}>
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </div>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>
              Current system status and key information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-blue-600" />
                <span>Inventory Status</span>
              </div>
              <Badge variant={stats.lowStockProducts > 0 ? "destructive" : "default"}>
                {stats.lowStockProducts > 0 ? `${stats.lowStockProducts} Low Stock` : 'Good'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-green-600" />
                <span>Staff Status</span>
              </div>
              <Badge variant="default">
                {stats.activeEmployees} Active
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                <span>Order Status</span>
              </div>
              <Badge variant={stats.pendingOrders > 0 ? "secondary" : "default"}>
                {stats.pendingOrders} Pending
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>License Status</span>
              </div>
              <Badge variant={stats.expiringLicenses > 0 ? "destructive" : "default"}>
                {stats.expiringLicenses > 0 ? `${stats.expiringLicenses} Expiring` : 'Up to Date'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

};

export default Dashboard;