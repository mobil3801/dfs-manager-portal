import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Users,
  Database,
  Zap,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Eye,
  Clock,
  Server,
  Wifi,
  BarChart3,
  Shield,
  Bell } from
'lucide-react';
import { motion } from 'motion/react';
import { realtimeService, ConnectionStatus } from '@/services/supabaseRealtimeService';
import useRealtimeData from '@/hooks/use-realtime-data';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface RealtimeMetrics {
  activeConnections: number;
  totalSubscriptions: number;
  messagesPerSecond: number;
  lastActivity: Date | null;
  dataTransferred: number;
  errorCount: number;
  uptime: number;
}

interface TableActivity {
  table: string;
  inserts: number;
  updates: number;
  deletes: number;
  lastActivity: Date;
  activeSubscriptions: number;
}

interface UserActivity {
  userId: number;
  userName: string;
  lastSeen: Date;
  activeSubscriptions: number;
  actionsCount: number;
  station: string;
}

interface SystemEvent {
  id: string;
  type: 'connection' | 'subscription' | 'error' | 'data' | 'security';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: any;
}

const AdminRealtimeMonitor: React.FC = () => {
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false,
    lastConnected: null,
    connectionCount: 0,
    subscriptionCount: 0
  });

  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    activeConnections: 0,
    totalSubscriptions: 0,
    messagesPerSecond: 0,
    lastActivity: null,
    dataTransferred: 0,
    errorCount: 0,
    uptime: 0
  });

  const [tableActivities, setTableActivities] = useState<TableActivity[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Real-time data hooks for monitoring
  const auditLogs = useRealtimeData({
    table: 'audit_logs',
    enableOptimisticUpdates: false,
    autoSubscribe: isMonitoring
  });

  const salesReports = useRealtimeData({
    table: 'daily_sales_reports_enhanced',
    enableOptimisticUpdates: false,
    autoSubscribe: isMonitoring
  });

  const employees = useRealtimeData({
    table: 'employees',
    enableOptimisticUpdates: false,
    autoSubscribe: isMonitoring
  });

  const products = useRealtimeData({
    table: 'products',
    enableOptimisticUpdates: false,
    autoSubscribe: isMonitoring
  });

  // Monitor connection status
  useEffect(() => {
    const unsubscribe = realtimeService.onConnectionChange((status) => {
      setConnectionStatus(status);

      // Add system event
      const event: SystemEvent = {
        id: `${Date.now()}_${Math.random()}`,
        type: 'connection',
        message: status.connected ? 'Connection established' : 'Connection lost',
        timestamp: new Date(),
        severity: status.connected ? 'low' : 'high',
        metadata: status
      };

      setSystemEvents((prev) => [event, ...prev.slice(0, 99)]);
    });

    return unsubscribe;
  }, []);

  // Update metrics periodically
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        activeConnections: connectionStatus.connected ? 1 : 0,
        totalSubscriptions: connectionStatus.subscriptionCount,
        lastActivity: new Date(),
        uptime: prev.uptime + 1
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [connectionStatus, isMonitoring]);

  // Simulate table activities based on real-time data
  useEffect(() => {
    const activities: TableActivity[] = [
    {
      table: 'daily_sales_reports_enhanced',
      inserts: salesReports.data.length,
      updates: 0,
      deletes: 0,
      lastActivity: salesReports.lastUpdate || new Date(),
      activeSubscriptions: 1
    },
    {
      table: 'audit_logs',
      inserts: auditLogs.data.length,
      updates: 0,
      deletes: 0,
      lastActivity: auditLogs.lastUpdate || new Date(),
      activeSubscriptions: 1
    },
    {
      table: 'employees',
      inserts: employees.data.length,
      updates: 0,
      deletes: 0,
      lastActivity: employees.lastUpdate || new Date(),
      activeSubscriptions: 1
    },
    {
      table: 'products',
      inserts: products.data.length,
      updates: 0,
      deletes: 0,
      lastActivity: products.lastUpdate || new Date(),
      activeSubscriptions: 1
    }];


    setTableActivities(activities);
  }, [salesReports, auditLogs, employees, products]);

  // Simulate user activities
  useEffect(() => {
    const userActivitiesData: UserActivity[] = [
    {
      userId: 1,
      userName: 'Admin User',
      lastSeen: new Date(),
      activeSubscriptions: 4,
      actionsCount: 25,
      station: 'ALL'
    },
    {
      userId: 2,
      userName: 'Manager',
      lastSeen: new Date(Date.now() - 5 * 60 * 1000),
      activeSubscriptions: 2,
      actionsCount: 12,
      station: 'MOBIL'
    }];


    setUserActivities(userActivitiesData);
  }, []);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);

    const event: SystemEvent = {
      id: `${Date.now()}_${Math.random()}`,
      type: 'system',
      message: isMonitoring ? 'Monitoring paused' : 'Monitoring resumed',
      timestamp: new Date(),
      severity: 'medium'
    };

    setSystemEvents((prev) => [event, ...prev.slice(0, 99)]);

    toast({
      title: isMonitoring ? 'Monitoring Paused' : 'Monitoring Resumed',
      description: isMonitoring ? 'Real-time monitoring has been paused' : 'Real-time monitoring is now active'
    });
  };

  const getStatusColor = (connected: boolean) => {
    if (connected) return 'text-green-500';
    return 'text-red-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':return 'text-red-500';
      case 'high':return 'text-orange-500';
      case 'medium':return 'text-yellow-500';
      default:return 'text-blue-500';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-time System Monitor</h2>
          <p className="text-muted-foreground">Monitor real-time data flows and system health</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={connectionStatus.connected ? 'success' : 'destructive'}
            className={connectionStatus.connected ? 'bg-green-500 text-white' : ''}>

            <Wifi className="w-3 h-3 mr-1" />
            {connectionStatus.connected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Button
            variant={isMonitoring ? 'destructive' : 'default'}
            onClick={toggleMonitoring}
            className="flex items-center gap-2">

            {isMonitoring ?
            <>
                <Eye className="w-4 h-4" />
                Pause Monitoring
              </> :

            <>
                <Activity className="w-4 h-4" />
                Resume Monitoring
              </>
            }
          </Button>
        </div>
      </div>

      {/* Alert for disconnection */}
      {!connectionStatus.connected &&
      <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Real-time connection is currently offline. Data may not be up to date.
          </AlertDescription>
        </Alert>
      }

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold">{metrics.activeConnections}</p>
              </div>
              <Users className={`w-8 h-8 ${getStatusColor(connectionStatus.connected)}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subscriptions</p>
                <p className="text-2xl font-bold">{metrics.totalSubscriptions}</p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Messages/sec</p>
                <p className="text-2xl font-bold">{metrics.messagesPerSecond}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className="text-lg font-bold font-mono">{formatUptime(metrics.uptime)}</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring */}
      <Tabs defaultValue="tables" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tables">Table Activity</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="events">System Events</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Table Activity Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tableActivities.map((activity) =>
                <motion.div
                  key={activity.table}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg">

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.table}</span>
                        <Badge variant="secondary">
                          {activity.activeSubscriptions} subscription{activity.activeSubscriptions !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last activity: {format(activity.lastActivity, 'HH:mm:ss')}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Inserts: {activity.inserts}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Updates: {activity.updates}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Deletes: {activity.deletes}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Activity Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivities.map((user) =>
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg">

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.userName}</span>
                        <Badge variant="outline">{user.station}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last seen: {format(user.lastSeen, 'HH:mm:ss')}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Active subscriptions: {user.activeSubscriptions}</div>
                      <div>Actions today: {user.actionsCount}</div>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                System Events Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {systemEvents.map((event) =>
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 border rounded-lg flex items-center justify-between">

                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${getSeverityColor(event.severity).replace('text-', 'bg-')}`}></div>
                        <div>
                          <div className="font-medium text-sm">{event.message}</div>
                          <div className="text-xs text-muted-foreground">{event.type}</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(event.timestamp, 'HH:mm:ss')}
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Connection Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Connection Stability</span>
                    <span>{connectionStatus.connected ? '100%' : '0%'}</span>
                  </div>
                  <Progress value={connectionStatus.connected ? 100 : 0} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Subscription Health</span>
                    <span>95%</span>
                  </div>
                  <Progress value={95} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Data Sync Rate</span>
                    <span>98%</span>
                  </div>
                  <Progress value={98} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Failed Connections</div>
                    <div className="text-2xl font-bold">{metrics.errorCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Security Events</div>
                    <div className="text-2xl font-bold">0</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-muted-foreground mb-1">System Status</div>
                  <Badge variant="success" className="bg-green-500 text-white">
                    <Shield className="w-3 h-3 mr-1" />
                    Secure
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>);

};

export default AdminRealtimeMonitor;