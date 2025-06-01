import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SalesChart from '@/components/SalesChart';
import SMSAlertStatus from '@/components/SMSAlertStatus';
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
  XCircle,
  Bell,
  Clock,
  Info,
  AlertCircle,
  Plus,
  Settings,
  X } from
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
  // New auto-calculated fields for accurate totals
  allSalesTotal: number;
  allFuelSales: number;
  allConvenienceSales: number;
  allCashSales: number;
  allCreditSales: number;
  totalReports: number;
}

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  action?: () => void;
  actionLabel?: string;
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
    expiringLicenses: 0,
    allSalesTotal: 0,
    allFuelSales: 0,
    allConvenienceSales: 0,
    allCashSales: 0,
    allCreditSales: 0,
    totalReports: 0
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showGuide, setShowGuide] = useState(false);

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

      // Get ALL sales reports for accurate calculations
      promises.push(
        window.ezsite.apis.tablePage('11728', {
          PageNo: 1,
          PageSize: 1000,
          OrderByField: 'report_date',
          IsAsc: false
        }).then(({ data, error }) => {
          if (!error && data) {
            const allReports = data.List || [];
            console.log('All sales reports for calculations:', allReports);

            // Calculate totals with proper validation
            let totalSales = 0;
            let totalFuelSales = 0;
            let totalConvenienceSales = 0;
            let totalCashSales = 0;
            let totalCreditSales = 0;
            let reportCount = 0;

            allReports.forEach((report) => {
              // Ensure all calculations are accurate
              const fuelSales = parseFloat(report.fuel_sales) || 0;
              const convenienceSales = parseFloat(report.convenience_sales) || 0;
              const cashSales = parseFloat(report.cash_sales) || 0;
              const creditSales = parseFloat(report.credit_card_sales) || 0;
              const reportTotal = parseFloat(report.total_sales) || 0;

              // Validate that cash + credit = total
              const calculatedPaymentTotal = cashSales + creditSales;
              if (Math.abs(calculatedPaymentTotal - reportTotal) > 0.01) {
                console.warn(`Report ID ${report.ID}: Payment total (${calculatedPaymentTotal}) doesn't match total sales (${reportTotal})`);
              }

              // Validate that fuel + convenience <= total
              const calculatedCategoryTotal = fuelSales + convenienceSales;
              if (calculatedCategoryTotal > reportTotal + 0.01) {
                console.warn(`Report ID ${report.ID}: Category total (${calculatedCategoryTotal}) exceeds total sales (${reportTotal})`);
              }

              // Add to running totals (use the reported total_sales as the authoritative figure)
              totalSales += reportTotal;
              totalFuelSales += fuelSales;
              totalConvenienceSales += convenienceSales;
              totalCashSales += cashSales;
              totalCreditSales += creditSales;
              reportCount++;
            });

            console.log('Calculated dashboard totals:', {
              totalSales,
              totalFuelSales,
              totalConvenienceSales,
              totalCashSales,
              totalCreditSales,
              reportCount
            });

            return {
              allSalesTotal: totalSales,
              allFuelSales: totalFuelSales,
              allConvenienceSales: totalConvenienceSales,
              allCashSales: totalCashSales,
              allCreditSales: totalCreditSales,
              totalReports: reportCount
            };
          }
          return {
            allSalesTotal: 0,
            allFuelSales: 0,
            allConvenienceSales: 0,
            allCashSales: 0,
            allCreditSales: 0,
            totalReports: 0
          };
        })
      );

      // Today's sales (for comparison)
      const today = new Date().toISOString().split('T')[0];
      promises.push(
        window.ezsite.apis.tablePage('11728', {
          PageNo: 1,
          PageSize: 1000,
          Filters: [{ name: 'report_date', op: 'GreaterThanOrEqual', value: today }]
        }).then(({ data, error }) => {
          if (!error && data) {
            const todayReports = data.List || [];
            const todayTotal = todayReports.reduce((sum, report) => {
              const total = parseFloat(report.total_sales) || 0;
              return sum + total;
            }, 0);
            return { todaySales: todayTotal };
          }
          return { todaySales: 0 };
        })
      );

      // Month's sales
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      promises.push(
        window.ezsite.apis.tablePage('11728', {
          PageNo: 1,
          PageSize: 1000,
          Filters: [{ name: 'report_date', op: 'GreaterThanOrEqual', value: startOfMonth }]
        }).then(({ data, error }) => {
          if (!error && data) {
            const monthReports = data.List || [];
            const monthTotal = monthReports.reduce((sum, report) => {
              const total = parseFloat(report.total_sales) || 0;
              return sum + total;
            }, 0);
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
      generateNotifications(newStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = (currentStats: DashboardStats) => {
    const newNotifications: Notification[] = [];
    const now = new Date();

    // Low stock notifications
    if (currentStats.lowStockProducts > 0) {
      newNotifications.push({
        id: 'low-stock-' + Date.now(),
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${currentStats.lowStockProducts} product(s) are running low on stock. Consider reordering soon.`,
        timestamp: new Date(now.getTime() - Math.random() * 60 * 60 * 1000), // Random time within last hour
        isRead: false,
        action: () => navigate('/products'),
        actionLabel: 'View Products'
      });
    }

    // Pending orders notifications
    if (currentStats.pendingOrders > 0) {
      newNotifications.push({
        id: 'pending-orders-' + Date.now(),
        type: 'info',
        title: 'Pending Orders',
        message: `You have ${currentStats.pendingOrders} pending order(s) that require attention.`,
        timestamp: new Date(now.getTime() - Math.random() * 2 * 60 * 60 * 1000), // Random time within last 2 hours
        isRead: false,
        action: () => navigate('/orders'),
        actionLabel: 'View Orders'
      });
    }

    // Expiring licenses notifications
    if (currentStats.expiringLicenses > 0) {
      newNotifications.push({
        id: 'expiring-licenses-' + Date.now(),
        type: 'error',
        title: 'License Expiration Alert',
        message: `${currentStats.expiringLicenses} license(s) will expire within 30 days. Renew them to avoid compliance issues.`,
        timestamp: new Date(now.getTime() - Math.random() * 30 * 60 * 1000), // Random time within last 30 minutes
        isRead: false,
        action: () => navigate('/licenses'),
        actionLabel: 'View Licenses'
      });
    }

    // Good sales notification
    if (currentStats.todaySales > 1000) {
      newNotifications.push({
        id: 'good-sales-' + Date.now(),
        type: 'success',
        title: 'Great Sales Performance',
        message: `Today's sales reached ${formatCurrency(currentStats.todaySales)}. Keep up the excellent work!`,
        timestamp: new Date(now.getTime() - Math.random() * 4 * 60 * 60 * 1000), // Random time within last 4 hours
        isRead: false,
        action: () => navigate('/sales'),
        actionLabel: 'View Reports'
      });
    }

    // New employee notification (example)
    if (currentStats.activeEmployees > 0) {
      newNotifications.push({
        id: 'system-info-' + Date.now(),
        type: 'info',
        title: 'System Status',
        message: `All systems operational. ${currentStats.activeEmployees} staff members are currently active.`,
        timestamp: new Date(now.getTime() - Math.random() * 6 * 60 * 60 * 1000), // Random time within last 6 hours
        isRead: Math.random() > 0.3, // 70% chance to be unread
        action: () => navigate('/employees'),
        actionLabel: 'View Staff'
      });
    }

    // Sort notifications by timestamp (newest first)
    newNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setNotifications(newNotifications);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
    prev.map((notif) =>
    notif.id === notificationId ?
    { ...notif, isRead: true } :
    notif
    )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
    prev.map((notif) => ({ ...notif, isRead: true }))
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-brand-700" />;
    }
  };

  const getNotificationStyle = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return 'border-l-4 border-orange-400 bg-orange-50';
      case 'error':
        return 'border-l-4 border-red-400 bg-red-50';
      case 'success':
        return 'border-l-4 border-green-400 bg-green-50';
      case 'info':
      default:
        return 'border-l-4 border-brand-400 bg-brand-50';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };




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
      <div className="bg-gradient-to-r from-brand-800 to-brand-900 rounded-lg p-6 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">
            DFS Manager Portal
          </h1>

        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Products */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/products')}>
              <Package className="w-6 h-6 text-brand-700" />
              <span className="font-semibold">Products</span>
            </div>
          </CardHeader>
          <CardDescription className="px-6 pb-2">
            Manage your product inventory - Search across all product fields for similar items
          </CardDescription>
          <CardContent className="p-6 pt-0">
            <div className="flex items-center justify-between">
              <div className="cursor-pointer flex-1" onClick={() => navigate('/products')}>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
                {stats.lowStockProducts > 0 &&
                <p className="text-sm text-orange-600 flex items-center mt-1">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {stats.lowStockProducts} low stock
                  </p>
                }
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

      {/* New Features - Salary, Inventory & Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 bg-blue-50" onClick={() => navigate('/salary')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">💰 Salary Management</p>
                <p className="text-lg font-bold text-blue-900 mt-1">Payroll System</p>
                <p className="text-sm text-blue-600">Manage employee salaries & records</p>
              </div>
              <div className="p-3 rounded-full bg-blue-600 text-white">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-blue-600">
              ✨ NEW FEATURE - Click to explore
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-red-200 bg-red-50" onClick={() => navigate('/inventory/alerts')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">🚨 Inventory Alerts</p>
                <p className="text-lg font-bold text-red-900 mt-1">Stock Monitoring</p>
                <p className="text-sm text-red-600">Real-time low stock alerts</p>
              </div>
              <div className="p-3 rounded-full bg-red-600 text-white">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-red-600">
              ✨ NEW FEATURE - Smart notifications
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 bg-green-50" onClick={() => navigate('/inventory/settings')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">⚙️ System Settings</p>
                <p className="text-lg font-bold text-green-900 mt-1">App Configuration</p>
                <p className="text-sm text-green-600">Image compression & alerts</p>
              </div>
              <div className="p-3 rounded-full bg-green-600 text-white">
                <Settings className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-green-600">
              ✨ NEW - Auto image compression
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
              <Building2 className="w-8 h-8 text-brand-700" />
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
              <FileText className="w-8 h-8 text-brand-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SalesChart />
        <SMSAlertStatus />

        {/* Notifications Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-brand-700" />
                <CardTitle>Recent Notifications</CardTitle>
                {unreadCount > 0 &&
                <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                }
              </div>
              {unreadCount > 0 &&
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-sm text-brand-700 hover:text-brand-800">

                  Mark all read
                </Button>
              }
            </div>
            <CardDescription>
              Stay updated with important alerts and system notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length === 0 ?
            <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No notifications at the moment</p>
                <p className="text-sm">All systems are running smoothly</p>
              </div> :

            <div className="space-y-3 max-h-80 overflow-y-auto">
                {notifications.map((notification) =>
              <div
                key={notification.id}
                className={`p-3 rounded-lg transition-all duration-200 hover:shadow-sm cursor-pointer ${
                getNotificationStyle(notification.type)} ${
                notification.isRead ? 'opacity-70' : ''}`}
                onClick={() => markAsRead(notification.id)}>

                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium ${
                      notification.isRead ? 'text-gray-600' : 'text-gray-900'}`
                      }>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {!notification.isRead &&
                        <div className="w-2 h-2 bg-brand-700 rounded-full"></div>
                        }
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimeAgo(notification.timestamp)}
                            </div>
                          </div>
                        </div>
                        <p className={`text-sm ${
                    notification.isRead ? 'text-gray-500' : 'text-gray-700'}`
                    }>
                          {notification.message}
                        </p>
                        {notification.action && notification.actionLabel &&
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        notification.action!();
                      }}
                      className="mt-2 text-xs px-2 py-1 h-auto">

                            {notification.actionLabel}
                          </Button>
                    }
                      </div>
                    </div>
                  </div>
              )}
              </div>
            }
            
            {notifications.length > 0 &&
            <div className="pt-3 border-t">
                <Button
                variant="ghost"
                size="sm"
                className="w-full text-sm text-gray-600 hover:text-gray-800"
                onClick={() => {
                  // Could navigate to a full notifications page in the future
                  console.log('View all notifications');
                }}>

                  View all notifications
                </Button>
              </div>
            }
          </CardContent>
        </Card>
      </div>
      
      {/* Visual Edit Status Note */}
      {showGuide &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Visual Editing Guide</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowGuide(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Visual Editing Fully Enabled</span>
              </div>
              <p className="text-gray-600">
                All users have complete access to create, edit, and delete records across all modules including:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Products management with barcode scanning</li>
                <li>Employee records and scheduling</li>
                <li>Sales reports and analytics</li>
                <li>Vendor and supplier management</li>
                <li>Order tracking and fulfillment</li>
                <li>License and certificate tracking</li>
                <li>Salary and payroll management</li>
                <li>Inventory alerts and monitoring</li>
              </ul>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Pro Tip:</strong> Look for edit buttons in table rows and use the search functionality to quickly find and modify records.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowGuide(false)}>Got it!</Button>
            </div>
          </div>
        </div>
      }
    </div>);

};

export default Dashboard;