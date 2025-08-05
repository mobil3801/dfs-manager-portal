import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Activity, Database, Wifi, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'checking';
  value?: string;
  lastCheck: Date;
  message: string;
}

const ServerHealthMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  const checkHealth = async () => {
    const newMetrics: HealthMetric[] = [];
    const now = new Date();

    // Database Connectivity
    try {
      const start = performance.now();
      const { error } = await supabase.from('user_profiles').select('id').limit(1);
      const duration = performance.now() - start;
      
      newMetrics.push({
        name: 'Database Connection',
        status: error ? 'error' : (duration > 2000 ? 'warning' : 'healthy'),
        value: `${duration.toFixed(0)}ms`,
        lastCheck: now,
        message: error ? 'Database connection failed' : `Response time: ${duration.toFixed(0)}ms`
      });
    } catch (error) {
      newMetrics.push({
        name: 'Database Connection',
        status: 'error',
        lastCheck: now,
        message: 'Unable to connect to database'
      });
    }

    // Authentication Status
    try {
      const { error } = await supabase.auth.getSession();
      newMetrics.push({
        name: 'Authentication Service',
        status: error ? 'warning' : 'healthy',
        lastCheck: now,
        message: error ? 'Auth service has issues' : 'Authentication system operational'
      });
    } catch (error) {
      newMetrics.push({
        name: 'Authentication Service',
        status: 'error',
        lastCheck: now,
        message: 'Authentication service unavailable'
      });
    }

    // Network Connectivity
    const networkStatus = navigator.onLine ? 'healthy' : 'error';
    newMetrics.push({
      name: 'Network Connection',
      status: networkStatus,
      lastCheck: now,
      message: navigator.onLine ? 'Network connection active' : 'No network connection'
    });

    // Application Performance
    const memUsage = (performance as any).memory ? {
      used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024)
    } : null;

    if (memUsage) {
      const memPercent = (memUsage.used / memUsage.total) * 100;
      newMetrics.push({
        name: 'Memory Usage',
        status: memPercent > 80 ? 'warning' : 'healthy',
        value: `${memUsage.used}MB / ${memUsage.total}MB`,
        lastCheck: now,
        message: `Memory usage at ${memPercent.toFixed(1)}%`
      });
    }

    setMetrics(newMetrics);
  };

  useEffect(() => {
    // Initial health check
    checkHealth();

    // Set up auto-refresh
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusIcon = (status: HealthMetric['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: HealthMetric['status']) => {
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      error: 'destructive',
      checking: 'secondary'
    } as const;

    const colors = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: '',
      checking: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge 
        variant={variants[status]} 
        className={status !== 'error' ? colors[status] : ''}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryIcon = (metricName: string) => {
    if (metricName.includes('Database')) return <Database className="h-5 w-5" />;
    if (metricName.includes('Auth')) return <Shield className="h-5 w-5" />;
    if (metricName.includes('Network')) return <Wifi className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };

  const overallStatus = metrics.length > 0 ? (() => {
    if (metrics.some(m => m.status === 'error')) return 'error';
    if (metrics.some(m => m.status === 'warning')) return 'warning';
    return 'healthy';
  })() : 'checking';

  const handleRefresh = async () => {
    setIsMonitoring(true);
    await checkHealth();
    setIsMonitoring(false);
    toast({
      title: 'Health Check Complete',
      description: 'Server health metrics updated'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6" />
            <div>
              <CardTitle>Server Health Monitor</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Real-time system health monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isMonitoring}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isMonitoring ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <Alert className={`${
          overallStatus === 'healthy' ? 'border-green-200 bg-green-50' :
          overallStatus === 'error' ? 'border-red-200 bg-red-50' :
          overallStatus === 'warning' ? 'border-yellow-200 bg-yellow-50' :
          'border-blue-200 bg-blue-50'
        }`}>
          <div className="flex items-center gap-2">
            {getStatusIcon(overallStatus)}
            <AlertDescription className={`font-medium ${
              overallStatus === 'healthy' ? 'text-green-800' :
              overallStatus === 'error' ? 'text-red-800' :
              overallStatus === 'warning' ? 'text-yellow-800' :
              'text-blue-800'
            }`}>
              {overallStatus === 'healthy' && 'All systems are running normally'}
              {overallStatus === 'error' && 'Critical issues detected'}
              {overallStatus === 'warning' && 'Some systems need attention'}
              {overallStatus === 'checking' && 'Checking system health...'}
            </AlertDescription>
          </div>
        </Alert>

        {/* Health Metrics */}
        <div className="grid gap-3">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getCategoryIcon(metric.name)}
                <div>
                  <p className="font-medium text-sm">{metric.name}</p>
                  <p className="text-xs text-gray-600">{metric.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {metric.value && (
                  <span className="text-sm font-mono text-gray-700">
                    {metric.value}
                  </span>
                )}
                {getStatusBadge(metric.status)}
              </div>
            </div>
          ))}
        </div>

        {metrics.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No health metrics available</p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
              Run Health Check
            </Button>
          </div>
        )}

        {/* Last Update */}
        {metrics.length > 0 && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Last updated: {metrics[0]?.lastCheck.toLocaleTimeString()}
            {autoRefresh && ' • Auto-refresh enabled'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServerHealthMonitor;