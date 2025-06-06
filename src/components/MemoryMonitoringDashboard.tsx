import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Activity, Trash2, RefreshCw, Settings, TrendingUp, TrendingDown } from 'lucide-react';
import { useRealTimeData } from './RealTimeDataProvider';
import { useToast } from '@/hooks/use-toast';

const MemoryMonitoringDashboard: React.FC = () => {
  const { memoryStats, clearCache, forceCleanup, updateMemoryConfig } = useRealTimeData();
  const { toast } = useToast();
  const [isAutoCleanupEnabled, setIsAutoCleanupEnabled] = useState(true);
  const [memoryThreshold, setMemoryThreshold] = useState(100);
  const [cacheRetention, setCacheRetention] = useState(30);
  const [pollingInterval, setPollingInterval] = useState(60);
  const [memoryTrend, setMemoryTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [lastMemoryUsage, setLastMemoryUsage] = useState(0);

  // Convert bytes to MB
  const bytesToMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);
  
  // Calculate memory usage percentage
  const memoryUsagePercent = memoryStats.jsHeapSizeLimit > 0 
    ? (memoryStats.usedJSHeapSize / memoryStats.jsHeapSizeLimit) * 100
    : 0;

  // Determine memory status
  const getMemoryStatus = () => {
    if (memoryUsagePercent > 80) return { status: 'critical', color: 'destructive' };
    if (memoryUsagePercent > 60) return { status: 'warning', color: 'warning' };
    return { status: 'healthy', color: 'success' };
  };

  const memoryStatus = getMemoryStatus();

  // Track memory trend
  useEffect(() => {
    const currentUsage = memoryStats.usedJSHeapSize;
    if (lastMemoryUsage > 0) {
      const difference = currentUsage - lastMemoryUsage;
      const changePercent = Math.abs(difference / lastMemoryUsage) * 100;
      
      if (changePercent > 5) {
        setMemoryTrend(difference > 0 ? 'up' : 'down');
      } else {
        setMemoryTrend('stable');
      }
    }
    setLastMemoryUsage(currentUsage);
  }, [memoryStats.usedJSHeapSize, lastMemoryUsage]);

  const handleConfigUpdate = () => {
    updateMemoryConfig({
      enableAutoCleanup: isAutoCleanupEnabled,
      memoryThresholdMB: memoryThreshold,
      dataRetentionMinutes: cacheRetention,
      pollInterval: pollingInterval * 1000 // Convert to ms
    });
    
    toast({
      title: "Configuration Updated",
      description: "Memory management settings have been updated."
    });
  };

  const handleEmergencyCleanup = () => {
    forceCleanup();
    toast({
      title: "Emergency Cleanup Initiated",
      description: "Forced memory cleanup and cache clearing completed.",
      variant: memoryUsagePercent > 80 ? "destructive" : "default"
    });
  };

  return (
    <div className="space-y-6">
      {/* Memory Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bytesToMB(memoryStats.usedJSHeapSize)} MB</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={memoryUsagePercent} className="flex-1" />
              <Badge variant={memoryStatus.color as any}>
                {memoryUsagePercent.toFixed(1)}%
              </Badge>
            </div>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              {memoryTrend === 'up' && <TrendingUp className="h-3 w-3 mr-1 text-red-500" />}
              {memoryTrend === 'down' && <TrendingDown className="h-3 w-3 mr-1 text-green-500" />}
              {memoryTrend === 'stable' && <Activity className="h-3 w-3 mr-1" />}
              {memoryTrend === 'up' ? 'Increasing' : memoryTrend === 'down' ? 'Decreasing' : 'Stable'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memoryStats.cacheSize.toFixed(2)} MB</div>
            <p className="text-xs text-muted-foreground mt-2">
              Data age: {memoryStats.dataAge.toFixed(1)} minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heap Limit</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bytesToMB(memoryStats.jsHeapSizeLimit)} MB</div>
            <p className="text-xs text-muted-foreground mt-2">
              Total: {bytesToMB(memoryStats.totalJSHeapSize)} MB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Cleanup</CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {memoryStats.lastCleanup.toLocaleTimeString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((Date.now() - memoryStats.lastCleanup.getTime()) / 60000)} minutes ago
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Memory Alert */}
      {memoryUsagePercent > 80 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical Memory Usage!</strong> Memory usage is at {memoryUsagePercent.toFixed(1)}%. 
            Consider running emergency cleanup or reducing data retention settings.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={handleEmergencyCleanup}
            >
              Emergency Cleanup
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Memory Management Controls */}
      <Tabs defaultValue="monitoring" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="actions">Cleanup Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memory Usage Trends</CardTitle>
              <CardDescription>
                Real-time monitoring of application memory consumption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Used Heap</Label>
                    <div className="mt-2">
                      <Progress value={memoryUsagePercent} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0 MB</span>
                        <span>{bytesToMB(memoryStats.jsHeapSizeLimit)} MB</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Cache Usage</Label>
                    <div className="mt-2">
                      <Progress value={(memoryStats.cacheSize / 50) * 100} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0 MB</span>
                        <span>50 MB</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Memory Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Used JS Heap:</span>
                      <span className="ml-2 font-mono">{bytesToMB(memoryStats.usedJSHeapSize)} MB</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total JS Heap:</span>
                      <span className="ml-2 font-mono">{bytesToMB(memoryStats.totalJSHeapSize)} MB</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Heap Size Limit:</span>
                      <span className="ml-2 font-mono">{bytesToMB(memoryStats.jsHeapSizeLimit)} MB</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cache Size:</span>
                      <span className="ml-2 font-mono">{memoryStats.cacheSize.toFixed(2)} MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memory Management Settings</CardTitle>
              <CardDescription>
                Configure automatic cleanup and memory thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-cleanup"
                  checked={isAutoCleanupEnabled}
                  onCheckedChange={setIsAutoCleanupEnabled}
                />
                <Label htmlFor="auto-cleanup">Enable automatic cleanup</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="memory-threshold">Memory Threshold (MB)</Label>
                  <Input
                    id="memory-threshold"
                    type="number"
                    value={memoryThreshold}
                    onChange={(e) => setMemoryThreshold(parseInt(e.target.value) || 100)}
                    min="50"
                    max="500"
                  />
                  <p className="text-xs text-muted-foreground">
                    Trigger cleanup when memory exceeds this limit
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cache-retention">Cache Retention (minutes)</Label>
                  <Input
                    id="cache-retention"
                    type="number"
                    value={cacheRetention}
                    onChange={(e) => setCacheRetention(parseInt(e.target.value) || 30)}
                    min="5"
                    max="120"
                  />
                  <p className="text-xs text-muted-foreground">
                    How long to keep data in cache
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="polling-interval">Polling Interval (seconds)</Label>
                  <Input
                    id="polling-interval"
                    type="number"
                    value={pollingInterval}
                    onChange={(e) => setPollingInterval(parseInt(e.target.value) || 60)}
                    min="10"
                    max="300"
                  />
                  <p className="text-xs text-muted-foreground">
                    How often to refresh data
                  </p>
                </div>
              </div>
              
              <Button onClick={handleConfigUpdate} className="w-full">
                Update Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Memory Cleanup Actions</CardTitle>
              <CardDescription>
                Manual cleanup and maintenance operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={clearCache}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Cache
                </Button>
                
                <Button 
                  variant="destructive" 
                  onClick={handleEmergencyCleanup}
                  className="w-full"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Emergency Cleanup
                </Button>
              </div>
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Cleanup Information</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• <strong>Clear Cache:</strong> Removes all cached data while keeping current data</li>
                  <li>• <strong>Emergency Cleanup:</strong> Clears cache, resets data, and forces garbage collection</li>
                  <li>• Automatic cleanup runs every minute when enabled</li>
                  <li>• LRU (Least Recently Used) algorithm removes old cache entries first</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemoryMonitoringDashboard;