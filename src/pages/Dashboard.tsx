import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceAdaptive } from '@/contexts/DeviceAdaptiveContext';
import AdaptiveCard from '@/components/AdaptiveCard';
import { TouchOptimizedButton } from '@/components/TouchOptimizedComponents';
import PerformanceOptimizedContainer from '@/components/PerformanceOptimizedContainer';
import {
  Users, Package, TrendingUp, DollarSign,
  BarChart3, Calendar, AlertCircle, Truck, FileText, ShoppingCart, Bell, Clock } from
'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalSales: number;
  totalProducts: number;
  totalEmployees: number;
  totalOrders: number;
  totalDeliveries: number;
  totalLicenses: number;
  totalVendors: number;
  recentSalesCount: number;
  pendingOrders: number;
  expiringLicenses: number;
}

interface RecentActivity {
  id: string;
  action: string;
  station: string;
  time: string;
  type: string;
  details?: string;
}

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const device = useDeviceAdaptive();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalProducts: 0,
    totalEmployees: 0,
    totalOrders: 0,
    totalDeliveries: 0,
    totalLicenses: 0,
    totalVendors: 0,
    recentSalesCount: 0,
    pendingOrders: 0,
    expiringLicenses: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Only load data if authenticated
    if (!authLoading && isAuthenticated) {
      console.log('🏗️ Dashboard: Auth ready, loading data...');
      loadDashboardData();
    } else if (!authLoading && !isAuthenticated) {
      console.log('🏗️ Dashboard: Not authenticated, redirecting...');
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const safeApiCall = async (
  tableId: number,
  params: any,
  tableName: string)
  : Promise<{data?: any;error?: string;}> => {
    try {
      console.log(`📊 Fetching ${tableName} data...`);

      if (!window.ezsite?.apis) {
        throw new Error('APIs not available');
      }

      const response = await window.ezsite.apis.tablePage(tableId, params);

      if (response.error) {
        console.warn(`⚠️ ${tableName} API error:`, response.error);
        return { error: response.error };
      }

      console.log(`✅ ${tableName} data loaded:`, response.data?.VirtualCount || 0, 'records');
      return { data: response.data };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ ${tableName} fetch failed:`, errorMessage);
      return { error: errorMessage };
    }
  };

  const loadDashboardData = async () => {
    try {
      console.log('🔄 Loading dashboard data...');
      setLoading(true);
      setHasError(false);

      // Check if APIs are available
      if (!window.ezsite?.apis) {
        throw new Error('Dashboard APIs not available. Please refresh the page.');
      }

      // Load dashboard statistics with individual error handling
      const results = await Promise.allSettled([
      // Sales reports (last 30 days)
      safeApiCall(12356, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'report_date',
        IsAsc: false,
        Filters: []
      }, 'Sales Reports'),

      // Products
      safeApiCall(11726, {
        PageNo: 1,
        PageSize: 1,
        Filters: []
      }, 'Products'),

      // Employees
      safeApiCall(11727, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      }, 'Employees'),

      // Orders
      safeApiCall(11730, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'order_date',
        IsAsc: false,
        Filters: []
      }, 'Orders'),

      // Deliveries
      safeApiCall(12196, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'delivery_date',
        IsAsc: false,
        Filters: []
      }, 'Deliveries'),

      // Licenses
      safeApiCall(11731, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'expiry_date',
        IsAsc: true,
        Filters: []
      }, 'Licenses'),

      // Vendors
      safeApiCall(11729, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      }, 'Vendors')]
      );

      // Process results safely
      const [
      salesResult,
      productsResult,
      employeesResult,
      ordersResult,
      deliveriesResult,
      licensesResult,
      vendorsResult] =
      results.map((result) =>
      result.status === 'fulfilled' ? result.value : { error: 'Failed to load' }
      );

      // Calculate statistics with error handling
      let totalSales = 0;
      let recentSalesCount = 0;

      if (salesResult.data?.List) {
        totalSales = salesResult.data.List.reduce((sum: number, report: any) => {
          const reportSales = parseFloat(report.total_sales) || 0;
          return sum + reportSales;
        }, 0);

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        recentSalesCount = salesResult.data.List.filter((report: any) => {
          const reportDate = new Date(report.report_date);
          return reportDate >= thirtyDaysAgo;
        }).length;
      }

      let pendingOrders = 0;
      if (ordersResult.data?.List) {
        pendingOrders = ordersResult.data.List.filter((order: any) =>
        order.status?.toLowerCase() === 'pending'
        ).length;
      }

      let expiringLicenses = 0;
      if (licensesResult.data?.List) {
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        expiringLicenses = licensesResult.data.List.filter((license: any) => {
          if (!license.expiry_date || license.status?.toLowerCase() === 'cancelled') return false;
          const expiryDate = new Date(license.expiry_date);
          return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
        }).length;
      }

      setStats({
        totalSales,
        totalProducts: productsResult.data?.VirtualCount || 0,
        totalEmployees: employeesResult.data?.VirtualCount || 0,
        totalOrders: ordersResult.data?.VirtualCount || 0,
        totalDeliveries: deliveriesResult.data?.VirtualCount || 0,
        totalLicenses: licensesResult.data?.VirtualCount || 0,
        totalVendors: vendorsResult.data?.VirtualCount || 0,
        recentSalesCount,
        pendingOrders,
        expiringLicenses
      });

      // Generate recent activities safely
      const activities: RecentActivity[] = [];

      // Add recent sales reports
      if (salesResult.data?.List) {
        salesResult.data.List.slice(0, 2).forEach((report: any, index: number) => {
          const reportDate = new Date(report.report_date);
          const timeAgo = getTimeAgo(reportDate);
          activities.push({
            id: `sale-${report.id || index}`,
            action: 'Sales report submitted',
            station: report.station || 'Unknown Station',
            time: timeAgo,
            type: 'sale',
            details: `$${(parseFloat(report.total_sales) || 0).toFixed(2)}`
          });
        });
      }

      // Add recent deliveries
      if (deliveriesResult.data?.List) {
        deliveriesResult.data.List.slice(0, 2).forEach((delivery: any, index: number) => {
          const deliveryDate = new Date(delivery.delivery_date);
          const timeAgo = getTimeAgo(deliveryDate);
          const totalDelivered = (delivery.regular_delivered || 0) + (
          delivery.plus_delivered || 0) + (
          delivery.super_delivered || 0);
          activities.push({
            id: `delivery-${delivery.id || index}`,
            action: 'Fuel delivery completed',
            station: delivery.station || 'Unknown Station',
            time: timeAgo,
            type: 'inventory',
            details: `${totalDelivered.toFixed(0)} gallons`
          });
        });
      }

      // Add pending orders
      if (ordersResult.data?.List) {
        ordersResult.data.List.
        filter((order: any) => order.status?.toLowerCase() === 'pending').
        slice(0, 1).
        forEach((order: any, index: number) => {
          const orderDate = new Date(order.order_date);
          const timeAgo = getTimeAgo(orderDate);
          activities.push({
            id: `order-${order.id || index}`,
            action: 'New order pending',
            station: order.station || 'Unknown Station',
            time: timeAgo,
            type: 'order',
            details: `Order #${order.order_number || 'N/A'}`
          });
        });
      }

      // Add expiring licenses
      if (expiringLicenses > 0 && licensesResult.data?.List) {
        const expiringLicense = licensesResult.data.List.find((license: any) => {
          if (!license.expiry_date || license.status?.toLowerCase() === 'cancelled') return false;
          const expiryDate = new Date(license.expiry_date);
          const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
        });

        if (expiringLicense) {
          const expiryDate = new Date(expiringLicense.expiry_date);
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          activities.push({
            id: `license-${expiringLicense.id}`,
            action: 'License expiring soon',
            station: expiringLicense.station || 'Unknown Station',
            time: `${daysUntilExpiry} days`,
            type: 'alert',
            details: expiringLicense.license_name
          });
        }
      }

      // Sort activities by priority and set
      activities.sort((a, b) => {
        const typePriority = { alert: 0, sale: 1, inventory: 2, order: 3 };
        return (typePriority[a.type as keyof typeof typePriority] || 4) - (
        typePriority[b.type as keyof typeof typePriority] || 4);
      });

      setRecentActivities(activities.slice(0, 4));
      setRetryCount(0);
      console.log('✅ Dashboard data loaded successfully');

    } catch (error) {
      console.error('❌ Dashboard loading error:', error);
      setHasError(true);

      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';

      if (retryCount < 3) {
        console.log(`🔄 Retrying dashboard load (${retryCount + 1}/3)...`);
        setRetryCount((prev) => prev + 1);
        setTimeout(() => loadDashboardData(), 1000 * (retryCount + 1));
      } else {
        toast({
          title: 'Dashboard Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const quickStats = [
  {
    label: 'Total Sales',
    value: loading ? '...' : `$${stats.totalSales.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    change: stats.recentSalesCount > 0 ? `${stats.recentSalesCount} this month` : 'No recent sales',
    icon: DollarSign,
    color: 'text-green-600',
    onClick: () => navigate('/sales')
  },
  {
    label: 'Products',
    value: loading ? '...' : stats.totalProducts.toLocaleString(),
    change: 'Active inventory',
    icon: Package,
    color: 'text-blue-600',
    onClick: () => navigate('/products')
  },
  {
    label: 'Employees',
    value: loading ? '...' : stats.totalEmployees.toLocaleString(),
    change: 'Active staff',
    icon: Users,
    color: 'text-purple-600',
    onClick: () => navigate('/employees')
  },
  {
    label: 'Orders',
    value: loading ? '...' : stats.totalOrders.toLocaleString(),
    change: stats.pendingOrders > 0 ? `${stats.pendingOrders} pending` : 'All processed',
    icon: ShoppingCart,
    color: 'text-orange-600',
    onClick: () => navigate('/orders')
  }];


  const getGridClasses = () => {
    if (device.isMobile) return 'grid-cols-1 gap-4';
    if (device.isTablet) return 'grid-cols-2 gap-6';
    return 'grid-cols-4 gap-6';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':return TrendingUp;
      case 'inventory':return Truck;
      case 'alert':return AlertCircle;
      case 'order':return ShoppingCart;
      case 'license':return FileText;
      default:return BarChart3;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'sale':return 'bg-green-100 text-green-800';
      case 'inventory':return 'bg-blue-100 text-blue-800';
      case 'alert':return 'bg-red-100 text-red-800';
      case 'order':return 'bg-orange-100 text-orange-800';
      case 'license':return 'bg-purple-100 text-purple-800';
      default:return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state during auth
  if (authLoading) {
    return (
      <PerformanceOptimizedContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Initializing dashboard...</span>
          </div>
        </div>
      </PerformanceOptimizedContainer>);

  }

  return (
    <PerformanceOptimizedContainer>
      <div className="space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`font-bold text-gray-900 dark:text-white ${
            device.optimalFontSize === 'large' ? 'text-3xl' : 'text-2xl'}`
            }>
              Welcome back, {user?.Name || 'User'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's what's happening at your gas stations today.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            {hasError &&
            <Badge variant="destructive" className="text-sm">
                <AlertCircle className="w-3 h-3 mr-1" />
                Loading issues
              </Badge>
            }
            {stats.expiringLicenses > 0 && !loading &&
            <Badge variant="destructive" className="text-sm">
                <AlertCircle className="w-3 h-3 mr-1" />
                {stats.expiringLicenses} license{stats.expiringLicenses > 1 ? 's' : ''} expiring
              </Badge>
            }
            <Badge variant="outline" className="text-sm">
              {device.deviceType} • {device.screenSize}
            </Badge>
          </div>
        </motion.div>

        {/* Error State */}
        {hasError && !loading &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">Some dashboard data failed to load</span>
              </div>
              <TouchOptimizedButton
              variant="outline"
              onClick={() => {
                setHasError(false);
                setRetryCount(0);
                loadDashboardData();
              }}
              className="text-red-600 border-red-300 hover:bg-red-50">
                Retry
              </TouchOptimizedButton>
            </div>
          </motion.div>
        }

        {/* Quick Stats */}
        <div className={`grid ${getGridClasses()}`}>
          {quickStats.map((stat, index) =>
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}>
              <AdaptiveCard hoverable className="cursor-pointer transition-transform hover:scale-105" onClick={stat.onClick}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-gray-600 dark:text-gray-400 ${
                  device.optimalFontSize === 'large' ? 'text-base' : 'text-sm'}`
                  }>
                      {stat.label}
                    </p>
                    <p className={`font-bold text-gray-900 dark:text-white ${
                  device.isMobile ? 'text-xl' : 'text-2xl'}`
                  }>
                      {stat.value}
                    </p>
                    <p className={`text-gray-500 ${
                  device.optimalFontSize === 'large' ? 'text-sm' : 'text-xs'}`
                  }>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg bg-opacity-10`}>
                    <stat.icon className={`${device.isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} />
                  </div>
                </div>
              </AdaptiveCard>
            </motion.div>
          )}
        </div>

        {/* Secondary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`grid ${device.isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-3 gap-6'}`}>
          <AdaptiveCard hoverable className="cursor-pointer" onClick={() => navigate('/delivery')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Deliveries</p>
                <p className="text-2xl font-bold text-blue-600">
                  {loading ? '...' : stats.totalDeliveries}
                </p>
                <p className="text-xs text-gray-500">Fuel deliveries</p>
              </div>
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
          </AdaptiveCard>

          <AdaptiveCard hoverable className="cursor-pointer" onClick={() => navigate('/licenses')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Licenses</p>
                <p className="text-2xl font-bold text-purple-600">
                  {loading ? '...' : stats.totalLicenses}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.expiringLicenses > 0 ? `${stats.expiringLicenses} expiring soon` : 'All current'}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </AdaptiveCard>

          <AdaptiveCard hoverable className="cursor-pointer" onClick={() => navigate('/vendors')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Vendors</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? '...' : stats.totalVendors}
                </p>
                <p className="text-xs text-gray-500">Active suppliers</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </AdaptiveCard>
        </motion.div>

        {/* Main Content Grid */}
        <div className={`grid ${device.isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 lg:grid-cols-3 gap-8'}`}>
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className={device.isMobile ? '' : 'lg:col-span-1'}>
            <AdaptiveCard title="Quick Actions" description="Common tasks">
              <div className="space-y-3">
                <TouchOptimizedButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/products/new')}>
                  <Package className="w-4 h-4 mr-2" />
                  Add New Product
                </TouchOptimizedButton>
                <TouchOptimizedButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/sales/new')}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Record Sales
                </TouchOptimizedButton>
                <TouchOptimizedButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/delivery/new')}>
                  <Truck className="w-4 h-4 mr-2" />
                  Log Delivery
                </TouchOptimizedButton>
                <TouchOptimizedButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/licenses')}>
                  <FileText className="w-4 h-4 mr-2" />
                  View Licenses
                </TouchOptimizedButton>
              </div>
            </AdaptiveCard>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className={device.isMobile ? '' : 'lg:col-span-2'}>
            <AdaptiveCard title="Recent Activity" description="Latest updates across all stations">
              <div className="space-y-4">
                {loading ?
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) =>
                  <div key={i} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                        </div>
                      </div>
                  )}
                  </div> :
                recentActivities.length > 0 ?
                recentActivities.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                          <ActivityIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-gray-900 dark:text-white ${
                        device.optimalFontSize === 'large' ? 'text-base' : 'text-sm'}`
                        }>
                            {activity.action}
                          </p>
                          <p className={`text-gray-600 dark:text-gray-400 ${
                        device.optimalFontSize === 'large' ? 'text-sm' : 'text-xs'}`
                        }>
                            {activity.station} • {activity.time}
                            {activity.details && ` • ${activity.details}`}
                          </p>
                        </div>
                      </motion.div>);

                }) :

                <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-xs text-gray-400 mt-1">Activity will appear here as you use the system</p>
                  </div>
                }
              </div>
            </AdaptiveCard>
          </motion.div>
        </div>

        {/* Device Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}>
            <AdaptiveCard title="Device Information" description="Current device detection results">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Device Type:</span>
                  <p className="text-gray-600">{device.deviceType}</p>
                </div>
                <div>
                  <span className="font-medium">Screen Size:</span>
                  <p className="text-gray-600">{device.screenSize}</p>
                </div>
                <div>
                  <span className="font-medium">Touch Support:</span>
                  <p className="text-gray-600">{device.hasTouch ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="font-medium">Navigation:</span>
                  <p className="text-gray-600">{device.preferredNavigation}</p>
                </div>
              </div>
            </AdaptiveCard>
          </motion.div>
        }
      </div>
    </PerformanceOptimizedContainer>);

};

export default Dashboard;