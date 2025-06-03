import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Database, RefreshCw, TrendingUp, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConnectionStats {
  connections: number;
  max: number;
  percentage: number;
  status: 'normal' | 'warning' | 'critical';
  timestamp: Date;
}

interface ConnectionHistory {
  timestamp: Date;
  connections: number;
  max: number;
}

const DatabaseConnectionMonitor = () => {
  const { toast } = useToast();
  const [connectionStats, setConnectionStats] = useState<ConnectionStats>({
    connections: 85,
    max: 100,
    percentage: 85,
    status: 'critical',
    timestamp: new Date()
  });
  const [history, setHistory] = useState<ConnectionHistory[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simulate getting connection stats (replace with actual API call)
  const fetchConnectionStats = async () => {
    try {
      // This would be replaced with actual API call to get connection stats
      // For now, simulate varying connection counts
      const connections = Math.floor(Math.random() * 20) + 75; // 75-95 range
      const max = 100;
      const percentage = connections / max * 100;

      let status: 'normal' | 'warning' | 'critical' = 'normal';
      if (percentage >= 85) status = 'critical';else
      if (percentage >= 70) status = 'warning';

      const newStats: ConnectionStats = {
        connections,
        max,
        percentage,
        status,
        timestamp: new Date()
      };

      setConnectionStats(newStats);

      // Add to history
      setHistory((prev) => {
        const newHistory = [...prev, {
          timestamp: new Date(),
          connections,
          max
        }].slice(-50); // Keep last 50 entries
        return newHistory;
      });

      // Show alerts for critical status
      if (status === 'critical' && connections !== 85) {
        toast({
          title: "Critical: High Database Connections",
          description: `${connections}/${max} connections in use (${percentage.toFixed(1)}%)`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error fetching connection stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch database connection statistics",
        variant: "destructive"
      });
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':return 'destructive';
      case 'warning':return 'secondary';
      default:return 'default';
    }
  };

  // Get progress color
  const getProgressColor = (percentage: number) => {
    if (percentage >= 85) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Start monitoring
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoRefresh) {
      setIsMonitoring(true);
      interval = setInterval(fetchConnectionStats, 30000); // Every 30 seconds
      fetchConnectionStats(); // Initial fetch
    } else {
      setIsMonitoring(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Calculate trend
  const getTrend = () => {
    if (history.length < 2) return { direction: 'stable', change: 0 };

    const recent = history.slice(-5);
    const avg = recent.reduce((sum, item) => sum + item.connections, 0) / recent.length;
    const previous = history.slice(-10, -5);
    const prevAvg = previous.length > 0 ?
    previous.reduce((sum, item) => sum + item.connections, 0) / previous.length :
    avg;

    const change = avg - prevAvg;
    const direction = change > 2 ? 'increasing' : change < -2 ? 'decreasing' : 'stable';

    return { direction, change: Math.abs(change) };
  };

  const trend = getTrend();

  // Manual refresh
  const handleManualRefresh = () => {
    fetchConnectionStats();
    toast({
      title: "Refreshed",
      description: "Database connection statistics updated"
    });
  };

  // Recommendations based on status
  const getRecommendations = () => {
    if (connectionStats.status === 'critical') {
      return [
      "Immediately check for connection leaks in application code",
      "Review long-running queries and transactions",
      "Consider implementing connection pooling",
      "Check for stuck or idle connections",
      "Restart application servers if necessary"];

    } else if (connectionStats.status === 'warning') {
      return [
      "Monitor connection usage closely",
      "Review recent application deployments",
      "Check query performance and optimization",
      "Implement connection timeout policies"];

    } else {
      return [
      "Connection usage is within normal limits",
      "Continue regular monitoring",
      "Maintain current connection pooling strategies"];

    }
  };

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <CardTitle>Database Connection Monitor</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusColor(connectionStats.status)}>
                {connectionStats.status.toUpperCase()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isMonitoring}>

                <RefreshCw className={`h-4 w-4 mr-2 ${isMonitoring ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          <CardDescription>
            Real-time monitoring of database connection usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status Alert */}
          {connectionStats.status === 'critical' &&
          <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Critical Connection Usage Detected</AlertTitle>
              <AlertDescription>
                Database connections are at {connectionStats.percentage.toFixed(1)}% capacity. 
                Immediate action required to prevent service disruption.
              </AlertDescription>
            </Alert>
          }

          {/* Connection Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Connections</span>
                <span className="text-2xl font-bold">
                  {connectionStats.connections}/{connectionStats.max}
                </span>
              </div>
              <Progress
                value={connectionStats.percentage}
                className="h-3" />

              <div className="text-xs text-muted-foreground">
                {connectionStats.percentage.toFixed(1)}% utilized
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={getStatusColor(connectionStats.status)}>
                  {connectionStats.status}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Last updated: {connectionStats.timestamp.toLocaleTimeString()}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trend</span>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">
                    {trend.direction} {trend.change > 0 ? `±${trend.change.toFixed(1)}` : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-refresh toggle */}
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span className="text-sm">Auto-refresh every 30 seconds</span>
            <Badge variant={autoRefresh ? "default" : "secondary"}>
              {isMonitoring ? 'Active' : 'Inactive'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}>

              {autoRefresh ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Actions to address current connection status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {getRecommendations().map((recommendation, index) =>
            <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{recommendation}</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Connection History */}
      {history.length > 0 &&
      <Card>
          <CardHeader>
            <CardTitle>Recent Connection History</CardTitle>
            <CardDescription>
              Last {history.length} measurements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {history.slice(-10).reverse().map((entry, index) =>
            <div key={index} className="flex items-center justify-between text-sm">
                  <span>{entry.timestamp.toLocaleTimeString()}</span>
                  <span>{entry.connections}/{entry.max}</span>
                  <Badge
                variant={
                entry.connections / entry.max * 100 >= 85 ? 'destructive' :
                entry.connections / entry.max * 100 >= 70 ? 'secondary' : 'default'
                }>

                    {(entry.connections / entry.max * 100).toFixed(1)}%
                  </Badge>
                </div>
            )}
            </div>
          </CardContent>
        </Card>
      }
    </div>);

};

export default DatabaseConnectionMonitor;