
import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceAdaptive } from '@/contexts/DeviceAdaptiveContext';
import AdaptiveCard from '@/components/AdaptiveCard';
import { TouchOptimizedButton } from '@/components/TouchOptimizedComponents';
import PerformanceOptimizedContainer from '@/components/PerformanceOptimizedContainer';
import {
  Users, Package, TrendingUp, DollarSign,
  BarChart3, Calendar, AlertCircle, Truck } from
'lucide-react';
import { Badge } from '@/components/ui/badge';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const device = useDeviceAdaptive();

  const quickStats = [
  {
    label: 'Total Sales',
    value: '$12,345',
    change: '+12%',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    label: 'Products',
    value: '1,234',
    change: '+5%',
    icon: Package,
    color: 'text-blue-600'
  },
  {
    label: 'Employees',
    value: '45',
    change: '+2%',
    icon: Users,
    color: 'text-purple-600'
  },
  {
    label: 'Orders',
    value: '89',
    change: '+8%',
    icon: Truck,
    color: 'text-orange-600'
  }];


  const recentActivities = [
  { id: 1, action: 'New sale recorded', station: 'MOBIL', time: '2 minutes ago', type: 'sale' },
  { id: 2, action: 'Product restocked', station: 'AMOCO ROSEDALE', time: '15 minutes ago', type: 'inventory' },
  { id: 3, action: 'License expiring soon', station: 'AMOCO BROOKLYN', time: '1 hour ago', type: 'alert' },
  { id: 4, action: 'Employee clocked in', station: 'MOBIL', time: '2 hours ago', type: 'employee' }];


  const getGridClasses = () => {
    if (device.isMobile) return 'grid-cols-1 gap-4';
    if (device.isTablet) return 'grid-cols-2 gap-6';
    return 'grid-cols-4 gap-6';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':return TrendingUp;
      case 'inventory':return Package;
      case 'alert':return AlertCircle;
      case 'employee':return Users;
      default:return BarChart3;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'sale':return 'bg-green-100 text-green-800';
      case 'inventory':return 'bg-blue-100 text-blue-800';
      case 'alert':return 'bg-red-100 text-red-800';
      case 'employee':return 'bg-purple-100 text-purple-800';
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
            device.optimalFontSize === 'large' ? 'text-3xl' : 'text-2xl'}`
            }>
              Welcome back, {user?.name || 'User'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's what's happening at your gas stations today.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
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

              <AdaptiveCard hoverable>
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
                    <p className={`text-green-600 ${
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

        {/* Main Content Grid */}
        <div className={`grid ${device.isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 lg:grid-cols-3 gap-8'}`}>
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={device.isMobile ? '' : 'lg:col-span-1'}>

            <AdaptiveCard title="Quick Actions" description="Common tasks">
              <div className="space-y-3">
                <TouchOptimizedButton variant="outline" className="w-full justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Add New Product
                </TouchOptimizedButton>
                <TouchOptimizedButton variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Record Sales
                </TouchOptimizedButton>
                <TouchOptimizedButton variant="outline" className="w-full justify-start">
                  <Truck className="w-4 h-4 mr-2" />
                  Log Delivery
                </TouchOptimizedButton>
                <TouchOptimizedButton variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Schedule
                </TouchOptimizedButton>
              </div>
            </AdaptiveCard>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={device.isMobile ? '' : 'lg:col-span-2'}>

            <AdaptiveCard title="Recent Activity" description="Latest updates across all stations">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
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
                        </p>
                      </div>
                    </motion.div>);

                })}
              </div>
            </AdaptiveCard>
          </motion.div>
        </div>

        {/* Device Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}>

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
                <div>
                  <span className="font-medium">Orientation:</span>
                  <p className="text-gray-600">{device.orientation}</p>
                </div>
                <div>
                  <span className="font-medium">Connection:</span>
                  <p className="text-gray-600">{device.connectionType}</p>
                </div>
                <div>
                  <span className="font-medium">Platform:</span>
                  <p className="text-gray-600">{device.platform}</p>
                </div>
                <div>
                  <span className="font-medium">Browser:</span>
                  <p className="text-gray-600">{device.browserName}</p>
                </div>
              </div>
            </AdaptiveCard>
          </motion.div>
        }
      </div>
    </PerformanceOptimizedContainer>);

};

export default Dashboard;