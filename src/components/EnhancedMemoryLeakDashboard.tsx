import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Download,
  TrendingUp,
  Cpu,
  HardDrive,
  Zap,
  CheckCircle
} from 'lucide-react';
import { MemoryLeakMonitor } from '@/services/memoryLeakMonitor';
import { useToast } from '@/hooks/use-toast';

const EnhancedMemoryLeakDashboard: React.FC = () => {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { toast } = useToast();

  const monitor = MemoryLeakMonitor.getInstance();

  const refreshData = () => {
    const info = monitor.getCurrentMemoryInfo();
    setMemoryInfo(info);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number): string => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const handleForceGC = () => {
    const success = monitor.forceGarbageCollection();
    if (success) {
      toast({
        title: "Garbage Collection Triggered",
        description: "Manual garbage collection executed successfully."
      });
      setTimeout(refreshData, 1000);
    } else {
      toast({
        title: "Garbage Collection Unavailable",
        description: "Enable in Chrome with --js-flags=\"--expose-gc\"",
        variant: "destructive"
      });
    }
  };

  const handleResetBaseline = () => {
    monitor.resetBaseline();
    toast({
      title: "Baseline Reset",
      description: "Memory baseline and leak detection counters reset."
    });
    refreshData();
  };

  if (!memoryInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Loading memory data...
          </div>
        </CardContent>
      </Card>
    );
  }

  const getLeakStatus = () => {
    if (memoryInfo.isCriticalLeakDetected) {
      return {
        status: 'CRITICAL LEAK',
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: AlertTriangle
      };
    } else if (memoryInfo.leakOccurrences > 0) {
      return {
        status: 'MONITORING',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-yellow-200',
        icon: Activity
      };
    } else {
      return {
        status: 'HEALTHY',
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        icon: CheckCircle
      };
    }
  };

  const leakStatus = getLeakStatus();
  const StatusIcon = leakStatus.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Memory Leak Monitor</h1>
          <p className="text-muted-foreground">
            Real-time memory monitoring with smart leak detection
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleForceGC} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Force GC
          </Button>
          <Button onClick={handleResetBaseline} variant="outline" size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Reset Baseline
          </Button>
        </div>
      </div>

      {/* Critical Alert */}
      {memoryInfo.isCriticalLeakDetected && (
        <Alert variant="destructive" className="border-2 border-red-300">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription className="text-base font-semibold">
            🚨 CRITICAL MEMORY LEAK CONFIRMED! 
            {memoryInfo.leakOccurrences} verified occurrences detected. 
            Memory increased by {formatBytes(memoryInfo.growth)}. 
            Immediate investigation required.
          </AlertDescription>
        </Alert>
      )}

      {/* Memory Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Memory</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {memoryInfo.current ? formatBytes(memoryInfo.current.usedJSHeapSize) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              of {memoryInfo.current ? formatBytes(memoryInfo.current.jsHeapSizeLimit) : 'N/A'} limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              memoryInfo.isCriticalLeakDetected ? 'text-red-600' : 'text-gray-900'
            }`}>
              {formatBytes(memoryInfo.growth)}
            </div>
            <p className="text-xs text-muted-foreground">
              since baseline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Pressure</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              memoryInfo.pressure > 0.8 ? 'text-red-600' : 
              memoryInfo.pressure > 0.6 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {(memoryInfo.pressure * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {memoryInfo.pressure > 0.8 ? 'High' : 
               memoryInfo.pressure > 0.6 ? 'Medium' : 'Low'} pressure
            </p>
            <Progress value={memoryInfo.pressure * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className={leakStatus.bgColor}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leak Detection</CardTitle>
            <StatusIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${leakStatus.color}`}>
              {leakStatus.status}
            </div>
            <p className="text-xs text-muted-foreground">
              {memoryInfo.leakOccurrences} occurrences (threshold: 3)
            </p>
            {memoryInfo.nextAlertTime > Date.now() && (
              <p className="text-xs text-muted-foreground">
                Next alert: {new Date(memoryInfo.nextAlertTime).toLocaleTimeString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Leak Detection Status</CardTitle>
          <CardDescription>
            Enhanced monitoring with false-positive prevention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Leak Occurrences</span>
                <span className={`text-lg font-bold ${
                  memoryInfo.leakOccurrences >= 3 ? 'text-red-600' : 
                  memoryInfo.leakOccurrences > 0 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {memoryInfo.leakOccurrences}
                </span>
              </div>
              <Progress 
                value={(memoryInfo.leakOccurrences / 3) * 100} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                Critical threshold: 3 occurrences
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Components Tracked</span>
                <span className="text-lg font-bold text-blue-600">
                  {memoryInfo.componentsTracked}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Active component monitoring
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Reports</span>
                <span className="text-lg font-bold text-purple-600">
                  {memoryInfo.totalLeakReports}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Component-level leak reports
              </div>
            </div>
          </div>

          {/* Status Messages */}
          <div className="space-y-2">
            {memoryInfo.isCriticalLeakDetected ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Critical memory leak confirmed! Immediate action required to prevent system instability.
                </AlertDescription>
              </Alert>
            ) : memoryInfo.leakOccurrences > 0 ? (
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  Monitoring potential memory leak pattern. {3 - memoryInfo.leakOccurrences} more occurrences 
                  needed to trigger critical alert.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Memory usage is healthy. No leak patterns detected.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Last Update */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            <Badge variant="outline">
              Auto-refresh: 5s
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Actions based on current memory status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {memoryInfo.isCriticalLeakDetected ? [
              "🚨 IMMEDIATE: Investigate critical memory leak",
              "Check for component cleanup issues in useEffect",
              "Review event listeners and subscriptions",
              "Consider triggering garbage collection",
              "Monitor application performance closely"
            ] : memoryInfo.leakOccurrences > 0 ? [
              "⚠️ Monitor memory usage closely",
              "Review recent code changes",
              "Check for potential cleanup issues",
              "Consider preventive optimizations"
            ] : [
              "✅ Memory usage is healthy",
              "Continue regular monitoring",
              "No immediate action required",
              "System is operating normally"
            ]}.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedMemoryLeakDashboard;