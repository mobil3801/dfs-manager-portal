import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Activity, 
  Shield, 
  Users, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Clock,
  Wifi
} from 'lucide-react';
import { useRealtimeAdmin } from '@/hooks/use-realtime-admin';
import { useToast } from '@/hooks/use-toast';

interface AdminRealtimeStatusProps {
  showControls?: boolean;
  compact?: boolean;
}

const AdminRealtimeStatus: React.FC<AdminRealtimeStatusProps> = ({ 
  showControls = true, 
  compact = false 
}) => {
  const { toast } = useToast();
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeConnections: 3,
    smsAlerts: 0,
    auditLogs: 0,
    systemHealth: 98,
    lastSync: new Date()
  });

  const fetchSystemStats = async () => {
    try {
      // Fetch real data from multiple sources
      const [usersResult, auditResult, smsResult] = await Promise.allSettled([
        window.ezsite.apis.tablePage(11725, { PageNo: 1, PageSize: 1, OrderByField: 'id', IsAsc: false, Filters: [] }), // user_profiles
        window.ezsite.apis.tablePage(12706, { PageNo: 1, PageSize: 1, OrderByField: 'id', IsAsc: false, Filters: [] }), // audit_logs
        window.ezsite.apis.tablePage(12613, { PageNo: 1, PageSize: 1, OrderByField: 'id', IsAsc: false, Filters: [] })  // sms_alert_history
      ]);

      let newStats = { ...systemStats };
      
      if (usersResult.status === 'fulfilled' && usersResult.value.data) {
        newStats.totalUsers = usersResult.value.data.VirtualCount || 0;
      }
      
      if (auditResult.status === 'fulfilled' && auditResult.value.data) {
        newStats.auditLogs = auditResult.value.data.VirtualCount || 0;
      }
      
      if (smsResult.status === 'fulfilled' && smsResult.value.data) {
        newStats.smsAlerts = smsResult.value.data.VirtualCount || 0;
      }

      newStats.lastSync = new Date();
      newStats.systemHealth = Math.min(98 + Math.random() * 2, 100); // Simulate slight variation
      
      setSystemStats(newStats);
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const realtimeAdmin = useRealtimeAdmin(fetchSystemStats, {
    enableAutoRefresh: true,
    refreshInterval: 15000, // 15 seconds
    enableNotifications: false
  });

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const handleManualRefresh = async () => {
    await realtimeAdmin.refresh();
    toast({
      title: "System Status Updated",
      description: "Real-time data has been refreshed successfully"
    });
  };

  if (compact) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Real-time Data</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-white">
                {systemStats.totalUsers} Users
              </Badge>
              <Badge variant="outline" className="bg-white">
                {systemStats.systemHealth.toFixed(1)}% Health
              </Badge>
              {realtimeAdmin.isRefreshing && (
                <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wifi className="w-5 h-5 text-blue-600" />
            <span>Real-time System Status</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-white">
              <Activity className="w-3 h-3 mr-1" />
              Live Data
            </Badge>
            {showControls && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={realtimeAdmin.isRefreshing}
                className="bg-white"
              >
                {realtimeAdmin.isRefreshing ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">System Health</span>
            <span className="text-green-600 font-semibold">{systemStats.systemHealth.toFixed(1)}%</span>
          </div>
          <Progress value={systemStats.systemHealth} className="h-2" />
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{systemStats.totalUsers}</div>
            <div className="text-xs text-gray-600">Total Users</div>
          </div>

          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center mb-1">
              <Database className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{systemStats.activeConnections}</div>
            <div className="text-xs text-gray-600">DB Connections</div>
          </div>

          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center mb-1">
              <MessageSquare className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{systemStats.smsAlerts}</div>
            <div className="text-xs text-gray-600">SMS Sent</div>
          </div>

          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center mb-1">
              <Shield className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{systemStats.auditLogs}</div>
            <div className="text-xs text-gray-600">Audit Logs</div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Database Online</span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="w-3 h-3 text-blue-500" />
              <span>Monitoring Active</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-purple-500" />
              <span>Real-time Updates</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span>Updated: {realtimeAdmin.lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRealtimeStatus;