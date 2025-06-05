import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Users, 
  Database, 
  Zap, 
  TrendingUp,
  Wifi,
  Clock,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import useRealtimeData from '@/hooks/use-realtime-data';
import { realtimeService, ConnectionStatus } from '@/services/supabaseRealtimeService';

interface RealtimeStatsProps {
  className?: string;
  showConnectionStatus?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface SystemStats {
  totalRecords: number;
  activeUsers: number;
  recentUpdates: number;
  systemHealth: number;
  dataFlowRate: number;
  lastUpdate: Date;
}

const RealtimeStatsWidget: React.FC<RealtimeStatsProps> = ({
  className = '',
  showConnectionStatus = true,
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false,
    lastConnected: null,
    connectionCount: 0,
    subscriptionCount: 0
  });

  const [stats, setStats] = useState<SystemStats>({
    totalRecords: 0,
    activeUsers: 0,
    recentUpdates: 0,
    systemHealth: 0,
    dataFlowRate: 0,
    lastUpdate: new Date()
  });

  // Real-time data hooks for different tables
  const salesData = useRealtimeData({
    table: 'daily_sales_reports_enhanced',
    enableOptimisticUpdates: false,
    autoSubscribe: true
  });

  const productData = useRealtimeData({
    table: 'products',
    enableOptimisticUpdates: false,
    autoSubscribe: true
  });

  const employeeData = useRealtimeData({
    table: 'employees',
    enableOptimisticUpdates: false,
    autoSubscribe: true
  });

  const auditData = useRealtimeData({
    table: 'audit_logs',
    enableOptimisticUpdates: false,
    autoSubscribe: true
  });

  // Monitor connection status
  useEffect(() => {
    const unsubscribe = realtimeService.onConnectionChange((status) => {
      setConnectionStatus(status);
    });

    // Get initial status
    setConnectionStatus(realtimeService.getConnectionStatus());

    return unsubscribe;
  }, []);

  // Calculate stats from real-time data
  useEffect(() => {
    const calculateStats = () => {
      const totalRecords = 
        salesData.data.length + 
        productData.data.length + 
        employeeData.data.length + 
        auditData.data.length;

      const activeUsers = employeeData.data.filter(emp => emp.is_active).length;
      
      // Calculate recent updates (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentUpdates = [
        ...salesData.data.filter(item => item.updated_at && new Date(item.updated_at) > fiveMinutesAgo),
        ...productData.data.filter(item => item.updated_at && new Date(item.updated_at) > fiveMinutesAgo),
        ...auditData.data.filter(item => item.event_timestamp && new Date(item.event_timestamp) > fiveMinutesAgo)
      ].length;

      // Calculate system health based on connection status and data freshness
      let systemHealth = 0;
      if (connectionStatus.connected) systemHealth += 40;
      if (connectionStatus.subscriptionCount > 0) systemHealth += 30;
      if (totalRecords > 0) systemHealth += 20;
      if (recentUpdates > 0) systemHealth += 10;

      // Calculate data flow rate (updates per minute)
      const dataFlowRate = Math.round(recentUpdates / 5); // per minute

      setStats({
        totalRecords,
        activeUsers,
        recentUpdates,
        systemHealth,
        dataFlowRate,
        lastUpdate: new Date()
      });
    };

    calculateStats();

    if (autoRefresh) {
      const interval = setInterval(calculateStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [
    salesData.data,
    productData.data,
    employeeData.data,
    auditData.data,
    connectionStatus,
    autoRefresh,
    refreshInterval
  ]);

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadge = (health: number) => {
    if (health >= 80) return { variant: 'success', text: 'Excellent', className: 'bg-green-500 text-white' };
    if (health >= 60) return { variant: 'secondary', text: 'Good', className: 'bg-yellow-500 text-white' };
    return { variant: 'destructive', text: 'Needs Attention', className: 'bg-red-500 text-white' };
  };

  const healthBadge = getHealthBadge(stats.systemHealth);

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Real-time System Stats
          </span>
          {showConnectionStatus && (
            <div className="flex items-center gap-2">
              {connectionStatus.connected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <Wifi className="w-4 h-4 text-red-500" />
              )}
              <Badge 
                variant={connectionStatus.connected ? 'success' : 'destructive'}
                className={connectionStatus.connected ? 'bg-green-500 text-white' : ''}
              >
                {connectionStatus.connected ? 'Live' : 'Offline'}
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        {showConnectionStatus && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Connection Status</span>
              <motion.div
                animate={{ 
                  scale: connectionStatus.connected ? [1, 1.2, 1] : 1 
                }}
                transition={{ 
                  repeat: connectionStatus.connected ? Infinity : 0,
                  duration: 2 
                }}
              >
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </motion.div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <span>Subscriptions: {connectionStatus.subscriptionCount}</span>
              <span>Connections: {connectionStatus.connectionCount}</span>
            </div>
          </div>
        )}

        {/* System Health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">System Health</span>
            <Badge variant={healthBadge.variant} className={healthBadge.className}>
              {healthBadge.text}
            </Badge>
          </div>
          <Progress value={stats.systemHealth} className="h-2" />
          <div className="text-xs text-gray-500 text-right">{stats.systemHealth}%</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">Total Records</span>
            </div>
            <div className="text-lg font-bold text-blue-900">{stats.totalRecords}</div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-800">Active Users</span>
            </div>
            <div className="text-lg font-bold text-green-900">{stats.activeUsers}</div>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-800">Recent Updates</span>
            </div>
            <div className="text-lg font-bold text-purple-900">{stats.recentUpdates}</div>
          </div>

          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-800">Flow Rate</span>
            </div>
            <div className="text-lg font-bold text-orange-900">{stats.dataFlowRate}/min</div>
          </div>
        </div>

        {/* Data Sources Status */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Data Sources</span>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Sales Reports</span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${salesData.connected ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>{salesData.data.length}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Products</span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${productData.connected ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>{productData.data.length}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Employees</span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${employeeData.connected ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>{employeeData.data.length}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Audit Logs</span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${auditData.connected ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>{auditData.data.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Last Update */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Last updated: {stats.lastUpdate.toLocaleTimeString()}</span>
            {autoRefresh && (
              <RefreshCw className="w-3 h-3 animate-spin" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeStatsWidget;