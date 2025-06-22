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
  const { user } = useAuth();
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all dashboard statistics in parallel
      const [
      salesData,
      productsData,
      employeesData,
      ordersData,
      deliveriesData,
      licensesData,
      vendorsData] =
      await Promise.all([
      // Sales reports (last 30 days)
      window.ezsite.apis.tablePage(12356, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'report_date',
        IsAsc: false,
        Filters: []
      }),
      // Products
      window.ezsite.apis.tablePage(11726, {
        PageNo: 1,
        PageSize: 1,
        Filters: []
      }),
      // Employees
      window.ezsite.apis.tablePage(11727, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      }),
      // Orders
      window.ezsite.apis.tablePage(11730, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'order_date',
        IsAsc: false,
        Filters: []
      }),
      // Deliveries
      window.ezsite.apis.tablePage(12196, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'delivery_date',
        IsAsc: false,
        Filters: []
      }),
      // Licenses
      window.ezsite.apis.tablePage(11731, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'expiry_date',
        IsAsc: true,
        Filters: []
      }),
      // Vendors
      window.ezsite.apis.tablePage(11729, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      })]
      );

      // Calculate statistics
      const totalSales = salesData.data?.List?.reduce((sum: number, report: any) =>
      sum + (parseFloat(report.total_sales) || 0), 0) || 0;

      const recentSalesCount = salesData.data?.List?.filter((report: any) => {
        const reportDate = new Date(report.report_date);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return reportDate >= thirtyDaysAgo;
      }).length || 0;

      const pendingOrders = ordersData.data?.List?.filter((order: any) =>
      order.status?.toLowerCase() === 'pending').length || 0;

      // Check for expiring licenses (within 30 days)
      const expiringLicenses = licensesData.data?.List?.filter((license: any) => {
        if (!license.expiry_date || license.status?.toLowerCase() === 'cancelled') return false;
        const expiryDate = new Date(license.expiry_date);
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
      }).length || 0;

      setStats({
        totalSales,
        totalProducts: productsData.data?.VirtualCount || 0,
        totalEmployees: employeesData.data?.VirtualCount || 0,
        totalOrders: ordersData.data?.VirtualCount || 0,
        totalDeliveries: deliveriesData.data?.VirtualCount || 0,
        totalLicenses: licensesData.data?.VirtualCount || 0,
        totalVendors: vendorsData.data?.VirtualCount || 0,
        recentSalesCount,
        pendingOrders,
        expiringLicenses
      });

      // Generate recent activities from actual data
      const activities: RecentActivity[] = [];

      // Add recent sales reports
      salesData.data?.List?.slice(0, 2).forEach((report: any, index: number) => {
        const reportDate = new Date(report.report_date);
        const timeAgo = getTimeAgo(reportDate);
        activities.push({
          id: `sale-${report.ID}`,
          action: `Sales report submitted`,
          station: report.station,
          time: timeAgo,
          type: 'sale',
          details: `$${(parseFloat(report.total_sales) || 0).toFixed(2)}`
        });
      });

      // Add recent deliveries
      deliveriesData.data?.List?.slice(0, 2).forEach((delivery: any) => {
        const deliveryDate = new Date(delivery.delivery_date);
        const timeAgo = getTimeAgo(deliveryDate);
        const totalDelivered = (delivery.regular_delivered || 0) + (
        delivery.plus_delivered || 0) + (
        delivery.super_delivered || 0);
        activities.push({
          id: `delivery-${delivery.id}`,
          action: `Fuel delivery completed`,
          station: delivery.station,
          time: timeAgo,
          type: 'inventory',
          details: `${totalDelivered.toFixed(0)} gallons`
        });
      });

      // Add pending orders
      ordersData.data?.List?.filter((order: any) =>
      order.status?.toLowerCase() === 'pending').slice(0, 1).forEach((order: any) => {
        const orderDate = new Date(order.order_date);
        const timeAgo = getTimeAgo(orderDate);
        activities.push({
          id: `order-${order.ID}`,
          action: `New order pending`,
          station: order.station,
          time: timeAgo,
          type: 'order',
          details: `Order #${order.order_number}`
        });
      });

      // Add expiring licenses
      if (expiringLicenses > 0) {
        const expiringLicense = licensesData.data?.List?.find((license: any) => {
          if (!license.expiry_date || license.status?.toLowerCase() === 'cancelled') return false;
          const expiryDate = new Date(license.expiry_date);
          const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
        });

        if (expiringLicense) {
          const expiryDate = new Date(expiringLicense.expiry_date);
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          activities.push({
            id: `license-${expiringLicense.ID}`,
            action: `License expiring soon`,
            station: expiringLicense.station,
            time: `${daysUntilExpiry} days`,
            type: 'alert',
            details: expiringLicense.license_name
          });
        }
      }

      // Sort activities by most recent and limit to 4
      activities.sort((a, b) => {
        // Simple sorting by type priority and time
        const typePriority = { alert: 0, sale: 1, inventory: 2, order: 3 };
        return (typePriority[a.type as keyof typeof typePriority] || 4) - (
        typePriority[b.type as keyof typeof typePriority] || 4);
      });

      setRecentActivities(activities.slice(0, 4));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please refresh the page.',
        variant: 'destructive'
      });
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
            device.optimalFontSize === 'large' ? 'text-3xl' : 'text-2xl'}`}>
              Welcome back, {user?.name || 'User'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's what's happening at your gas stations today.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            {stats.expiringLicenses > 0 &&
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
                  device.optimalFontSize === 'large' ? 'text-base' : 'text-sm'}`}>
                      {stat.label}
                    </p>
                    <p className={`font-bold text-gray-900 dark:text-white ${
                  device.isMobile ? 'text-xl' : 'text-2xl'}`}>
                      {stat.value}
                    </p>
                    <p className={`text-gray-500 ${
                  device.optimalFontSize === 'large' ? 'text-sm' : 'text-xs'}`}>
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
                        device.optimalFontSize === 'large' ? 'text-base' : 'text-sm'}`}>
                            {activity.action}
                          </p>
                          <p className={`text-gray-600 dark:text-gray-400 ${
                        device.optimalFontSize === 'large' ? 'text-sm' : 'text-xs'}`}>
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