import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Activity,
  Database,
  CheckCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  BarChart3,
  FileText,
  Trash2,
  RefreshCw,
  Zap,
  Shield,
  TrendingUp } from
'lucide-react';
import autoSyncService from '@/services/autoSyncService';

interface SyncLog {
  id: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete' | 'scan' | 'error';
  tableName: string;
  status: 'success' | 'failed' | 'pending';
  details: string;
  duration: number;
}

interface SyncMetrics {
  totalTables: number;
  syncedToday: number;
  errorCount: number;
  avgSyncTime: number;
  successRate: number;
}

const SyncMonitoringDashboard: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [metrics, setMetrics] = useState<SyncMetrics>({
    totalTables: 0,
    syncedToday: 0,
    errorCount: 0,
    avgSyncTime: 0,
    successRate: 0
  });

  const [syncStatus, setSyncStatus] = useState({
    isActive: false,
    lastSync: '',
    nextSync: '',
    currentOperation: ''
  });

  // Load monitoring data
  useEffect(() => {
    loadSyncData();
    const interval = setInterval(loadSyncData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSyncData = async () => {
    try {
      // Load sync logs (mock data)
      const mockLogs: SyncLog[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        type: 'create',
        tableName: 'user_registration',
        status: 'success',
        details: 'Table created with 6 fields',
        duration: 1200
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        type: 'update',
        tableName: 'product_catalog',
        status: 'success',
        details: 'Added new field: image_url',
        duration: 800
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        type: 'scan',
        tableName: 'contact_form',
        status: 'success',
        details: 'Structure scan completed',
        duration: 400
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        type: 'error',
        tableName: 'order_management',
        status: 'failed',
        details: 'Connection timeout during sync',
        duration: 0
      }];


      setSyncLogs(mockLogs);

      // Calculate metrics
      const successfulSyncs = mockLogs.filter((log) => log.status === 'success');
      const todaysSyncs = mockLogs.filter((log) => {
        const logDate = new Date(log.timestamp);
        const today = new Date();
        return logDate.toDateString() === today.toDateString();
      });

      setMetrics({
        totalTables: 8,
        syncedToday: todaysSyncs.length,
        errorCount: mockLogs.filter((log) => log.status === 'failed').length,
        avgSyncTime: successfulSyncs.reduce((acc, log) => acc + log.duration, 0) / successfulSyncs.length || 0,
        successRate: successfulSyncs.length / mockLogs.length * 100
      });

      // Update sync status
      const status = autoSyncService.getStatus();
      setSyncStatus({
        isActive: status.isMonitoring,
        lastSync: status.lastSync,
        nextSync: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
        currentOperation: status.isMonitoring ? 'Monitoring for changes...' : 'Idle'
      });

    } catch (error) {
      console.error('Error loading sync data:', error);
    }
  };

  const handleManualSync = async () => {
    setIsLoading(true);
    try {
      await autoSyncService.triggerSync();

      toast({
        title: "Manual Sync Triggered",
        description: "Database synchronization has been initiated."
      });

      // Reload data after sync
      setTimeout(loadSyncData, 2000);
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to trigger manual sync. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setSyncLogs([]);
    toast({
      title: "Logs Cleared",
      description: "Sync logs have been cleared."
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <Database className="h-4 w-4 text-blue-500" />;
      case 'update':
        return <RefreshCw className="h-4 w-4 text-orange-500" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'scan':
        return <Activity className="h-4 w-4 text-purple-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sync Monitoring</h1>
          <p className="text-muted-foreground">Monitor and manage database synchronization</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleManualSync} disabled={isLoading}>
            {isLoading ?
            <RefreshCw className="h-4 w-4 animate-spin mr-2" /> :

            <RotateCcw className="h-4 w-4 mr-2" />
            }
            Manual Sync
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tables</p>
                <div className="text-2xl font-bold">{metrics.totalTables}</div>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Synced Today</p>
                <div className="text-2xl font-bold text-green-600">{metrics.syncedToday}</div>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <div className="text-2xl font-bold text-blue-600">{metrics.successRate.toFixed(1)}%</div>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Sync Time</p>
                <div className="text-2xl font-bold">{Math.round(metrics.avgSyncTime)}ms</div>
              </div>
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Auto-Sync:</span>
                  <Badge variant={syncStatus.isActive ? 'default' : 'secondary'}>
                    {syncStatus.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Operation:</span>
                    <span className="text-muted-foreground">{syncStatus.currentOperation}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Last Sync:</span>
                    <span className="text-muted-foreground">
                      {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleTimeString() : 'Never'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Next Sync:</span>
                    <span className="text-muted-foreground">
                      {syncStatus.nextSync ? new Date(syncStatus.nextSync).toLocaleTimeString() : 'Not scheduled'}
                    </span>
                  </div>
                </div>

                {metrics.errorCount > 0 &&
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {metrics.errorCount} sync errors detected. Check logs for details.
                    </AlertDescription>
                  </Alert>
                }
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Health Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Connection</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sync Performance</span>
                    <Badge variant={metrics.avgSyncTime < 1000 ? 'default' : 'secondary'}>
                      {metrics.avgSyncTime < 1000 ? 'Good' : 'Slow'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate</span>
                    <Badge variant={metrics.errorCount === 0 ? 'default' : 'destructive'}>
                      {metrics.errorCount === 0 ? 'Low' : 'High'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Success Rate</span>
                    <span>{metrics.successRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.successRate} className="w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sync Logs</CardTitle>
                <CardDescription>Recent synchronization activities</CardDescription>
              </div>
              <Button onClick={clearLogs} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Logs
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncLogs.length === 0 ?
                <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No sync logs available</p>
                  </div> :

                syncLogs.map((log) =>
                <div key={log.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(log.type)}
                        {getStatusIcon(log.status)}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {log.type.charAt(0).toUpperCase() + log.type.slice(1)} - {log.tableName}
                          </p>
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                            {log.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{log.details}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                          {log.duration > 0 && <span>{log.duration}ms</span>}
                        </div>
                      </div>
                    </div>
                )
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sync Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{metrics.syncedToday}</div>
                      <div className="text-sm text-muted-foreground">Today's Syncs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{Math.round(metrics.avgSyncTime)}</div>
                      <div className="text-sm text-muted-foreground">Avg Time (ms)</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Performance Score</span>
                      <span>{Math.round(100 - metrics.avgSyncTime / 10)}%</span>
                    </div>
                    <Progress value={Math.round(100 - metrics.avgSyncTime / 10)} className="w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{metrics.errorCount}</div>
                      <div className="text-sm text-muted-foreground">Total Errors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {metrics.successRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Reliability Score</span>
                      <span>{metrics.successRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.successRate} className="w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>);

};

export default SyncMonitoringDashboard;