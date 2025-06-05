import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Zap, Clock, CheckCircle, XCircle, RotateCcw, TrendingUp, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'motion/react';

interface OptimisticUpdate {
  id: string;
  tableId: string;
  recordId: number;
  operation: 'create' | 'update' | 'delete';
  localData: any;
  originalData?: any;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed' | 'rolled_back';
  retryCount: number;
  estimatedDuration: number;
  syncAttempts: number[];
}

interface PerformanceMetrics {
  averageResponseTime: number;
  successRate: number;
  totalOperations: number;
  pendingOperations: number;
  rolledBackOperations: number;
  cacheHitRate: number;
}

const OptimisticUpdateManager: React.FC = () => {
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState(1000); // 1 second
  const [maxRetries, setMaxRetries] = useState(3);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    averageResponseTime: 0,
    successRate: 0,
    totalOperations: 0,
    pendingOperations: 0,
    rolledBackOperations: 0,
    cacheHitRate: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const syncIntervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Start/stop the sync process
  useEffect(() => {
    if (isEnabled) {
      startSyncProcess();
    } else {
      stopSyncProcess();
    }

    return () => stopSyncProcess();
  }, [isEnabled, syncInterval]);

  const startSyncProcess = () => {
    stopSyncProcess();
    syncIntervalRef.current = setInterval(() => {
      processPendingUpdates();
    }, syncInterval);
  };

  const stopSyncProcess = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
  };

  // Create an optimistic update
  const createOptimisticUpdate = useCallback(async (
  tableId: string,
  operation: 'create' | 'update' | 'delete',
  localData: any,
  originalData?: any)
  : Promise<string> => {
    const updateId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const optimisticUpdate: OptimisticUpdate = {
      id: updateId,
      tableId,
      recordId: localData.id || localData.ID || Date.now(),
      operation,
      localData,
      originalData,
      timestamp: new Date(),
      status: 'pending',
      retryCount: 0,
      estimatedDuration: calculateEstimatedDuration(operation),
      syncAttempts: []
    };

    setOptimisticUpdates((prev) => [...prev, optimisticUpdate]);

    // Immediate UI update
    updateLocalState(optimisticUpdate);

    toast({
      title: "Update Applied",
      description: `${operation} operation queued for synchronization`,
      duration: 2000
    });

    return updateId;
  }, [toast]);

  const calculateEstimatedDuration = (operation: string): number => {
    const baseDurations = {
      create: 1500,
      update: 1000,
      delete: 800
    };
    return baseDurations[operation as keyof typeof baseDurations] || 1000;
  };

  const updateLocalState = (update: OptimisticUpdate) => {
    // This would typically update your local state/cache
    console.log('Updating local state:', update);
  };

  // Process pending updates
  const processPendingUpdates = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    const pendingUpdates = optimisticUpdates.filter((u) => u.status === 'pending');

    if (pendingUpdates.length === 0) {
      setIsProcessing(false);
      return;
    }

    try {
      // Process updates in batches
      const batchSize = 5;
      for (let i = 0; i < pendingUpdates.length; i += batchSize) {
        const batch = pendingUpdates.slice(i, i + batchSize);
        await Promise.all(batch.map((update) => syncUpdate(update)));
      }
    } catch (error) {
      console.error('Error processing updates:', error);
    } finally {
      setIsProcessing(false);
      updatePerformanceMetrics();
    }
  }, [optimisticUpdates, isProcessing]);

  const syncUpdate = async (update: OptimisticUpdate): Promise<void> => {
    const startTime = performance.now();

    try {
      // Simulate API call
      const success = await simulateApiCall(update);
      const duration = performance.now() - startTime;

      setOptimisticUpdates((prev) => prev.map((u) =>
      u.id === update.id ?
      {
        ...u,
        status: success ? 'confirmed' : 'failed',
        syncAttempts: [...u.syncAttempts, duration]
      } :
      u
      ));

      if (success) {
        toast({
          title: "Sync Complete",
          description: `${update.operation} operation confirmed`,
          duration: 1000
        });
      } else {
        await handleFailedUpdate(update);
      }
    } catch (error) {
      console.error('Sync error:', error);
      await handleFailedUpdate(update);
    }
  };

  const simulateApiCall = async (update: OptimisticUpdate): Promise<boolean> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500));

    // Simulate success/failure (95% success rate)
    return Math.random() > 0.05;
  };

  const handleFailedUpdate = async (update: OptimisticUpdate) => {
    const newRetryCount = update.retryCount + 1;

    if (newRetryCount <= maxRetries) {
      // Retry with exponential backoff
      const delay = Math.pow(2, newRetryCount) * 1000;

      setTimeout(() => {
        setOptimisticUpdates((prev) => prev.map((u) =>
        u.id === update.id ?
        { ...u, retryCount: newRetryCount, status: 'pending' } :
        u
        ));
      }, delay);

      toast({
        title: "Retrying Update",
        description: `Attempt ${newRetryCount} of ${maxRetries}`,
        variant: "default"
      });
    } else {
      // Rollback the update
      await rollbackUpdate(update);
    }
  };

  const rollbackUpdate = async (update: OptimisticUpdate) => {
    setOptimisticUpdates((prev) => prev.map((u) =>
    u.id === update.id ?
    { ...u, status: 'rolled_back' } :
    u
    ));

    // Restore original state
    if (update.originalData) {
      updateLocalState({
        ...update,
        localData: update.originalData,
        operation: 'update' as const
      });
    }

    toast({
      title: "Update Rolled Back",
      description: "Failed to sync changes, reverted to original state",
      variant: "destructive"
    });
  };

  const manualRetry = async (updateId: string) => {
    const update = optimisticUpdates.find((u) => u.id === updateId);
    if (!update) return;

    setOptimisticUpdates((prev) => prev.map((u) =>
    u.id === updateId ?
    { ...u, status: 'pending', retryCount: 0 } :
    u
    ));

    toast({
      title: "Manual Retry",
      description: "Attempting to sync update again"
    });
  };

  const forceRollback = async (updateId: string) => {
    const update = optimisticUpdates.find((u) => u.id === updateId);
    if (update) {
      await rollbackUpdate(update);
    }
  };

  const clearCompletedUpdates = () => {
    setOptimisticUpdates((prev) => prev.filter((u) =>
    u.status === 'pending' || u.status === 'failed'
    ));

    toast({
      title: "Cleared",
      description: "Removed completed and rolled back updates"
    });
  };

  const updatePerformanceMetrics = () => {
    const completed = optimisticUpdates.filter((u) =>
    u.status === 'confirmed' || u.status === 'failed' || u.status === 'rolled_back'
    );
    const successful = optimisticUpdates.filter((u) => u.status === 'confirmed');
    const pending = optimisticUpdates.filter((u) => u.status === 'pending');
    const rolledBack = optimisticUpdates.filter((u) => u.status === 'rolled_back');

    const totalSyncTimes = completed.flatMap((u) => u.syncAttempts);
    const averageResponseTime = totalSyncTimes.length > 0 ?
    totalSyncTimes.reduce((a, b) => a + b, 0) / totalSyncTimes.length :
    0;

    setPerformanceMetrics({
      averageResponseTime: Math.round(averageResponseTime),
      successRate: completed.length > 0 ? successful.length / completed.length * 100 : 0,
      totalOperations: optimisticUpdates.length,
      pendingOperations: pending.length,
      rolledBackOperations: rolledBack.length,
      cacheHitRate: Math.random() * 100 // Simulated
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':return <XCircle className="h-4 w-4 text-red-500" />;
      case 'rolled_back':return <RotateCcw className="h-4 w-4 text-orange-500" />;
      default:return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':return 'border-yellow-500';
      case 'confirmed':return 'border-green-500';
      case 'failed':return 'border-red-500';
      case 'rolled_back':return 'border-orange-500';
      default:return 'border-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Optimistic Update Manager
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isEnabled ? "default" : "secondary"}>
                {isEnabled ? "Active" : "Disabled"}
              </Badge>
              <Button
                onClick={() => setIsEnabled(!isEnabled)}
                variant={isEnabled ? "destructive" : "default"}
                size="sm">

                {isEnabled ? "Disable" : "Enable"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{performanceMetrics.totalOperations}</div>
              <div className="text-sm text-gray-600">Total Operations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{performanceMetrics.pendingOperations}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{performanceMetrics.successRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{performanceMetrics.averageResponseTime}ms</div>
              <div className="text-sm text-gray-600">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{performanceMetrics.rolledBackOperations}</div>
              <div className="text-sm text-gray-600">Rolled Back</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{performanceMetrics.cacheHitRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Cache Hit Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="updates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="updates">Active Updates ({optimisticUpdates.length})</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="updates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Optimistic Updates Queue</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={clearCompletedUpdates}>

                Clear Completed
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => createOptimisticUpdate('products', 'create', { name: 'Test Product', price: 9.99 })}>

                Test Update
              </Button>
            </div>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-3">
              <AnimatePresence>
                {optimisticUpdates.map((update) =>
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}>

                    <Card className={`border-l-4 ${getStatusColor(update.status)}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(update.status)}
                            <div>
                              <p className="font-medium">
                                {update.operation.toUpperCase()} • {update.tableId}
                              </p>
                              <p className="text-sm text-gray-600">
                                Record #{update.recordId} • {update.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {update.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {update.status === 'failed' &&
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => manualRetry(update.id)}>

                                Retry
                              </Button>
                          }
                            {update.status === 'pending' &&
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => forceRollback(update.id)}>

                                Rollback
                              </Button>
                          }
                          </div>
                        </div>

                        {update.status === 'pending' &&
                      <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Syncing...</span>
                              <span>{update.retryCount}/{maxRetries} attempts</span>
                            </div>
                            <Progress
                          value={(Date.now() - update.timestamp.getTime()) / update.estimatedDuration * 100}
                          className="h-2" />

                          </div>
                      }

                        <div className="text-sm space-y-2">
                          <div>
                            <p className="font-medium">Local Data:</p>
                            <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                              {JSON.stringify(update.localData, null, 2)}
                            </div>
                          </div>
                          
                          {update.syncAttempts.length > 0 &&
                        <div>
                              <p className="font-medium">Sync Attempts:</p>
                              <div className="flex gap-1">
                                {update.syncAttempts.map((duration, index) =>
                            <Badge key={index} variant="secondary" className="text-xs">
                                    {Math.round(duration)}ms
                                  </Badge>
                            )}
                              </div>
                            </div>
                        }
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Response Time Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Current Average:</span>
                    <Badge variant="outline">{performanceMetrics.averageResponseTime}ms</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Target:</span>
                    <Badge variant="outline">{'<500ms'}</Badge>
                  </div>
                  <Progress
                    value={Math.min(500 / Math.max(performanceMetrics.averageResponseTime, 1) * 100, 100)}
                    className="h-3" />

                  <p className="text-sm text-gray-600">
                    {performanceMetrics.averageResponseTime <= 500 ?
                    "✅ Performance target met" :
                    "⚠️ Performance below target"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operation Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {performanceMetrics.successRate.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">Overall Success Rate</p>
                  </div>
                  <Progress
                    value={performanceMetrics.successRate}
                    className="h-3" />

                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div>
                      <div className="font-medium text-green-600">
                        {optimisticUpdates.filter((u) => u.status === 'confirmed').length}
                      </div>
                      <div>Confirmed</div>
                    </div>
                    <div>
                      <div className="font-medium text-red-600">
                        {optimisticUpdates.filter((u) => u.status === 'failed').length}
                      </div>
                      <div>Failed</div>
                    </div>
                    <div>
                      <div className="font-medium text-orange-600">
                        {optimisticUpdates.filter((u) => u.status === 'rolled_back').length}
                      </div>
                      <div>Rolled Back</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimistic Update Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sync Interval: {syncInterval}ms
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="500"
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(Number(e.target.value))}
                    className="w-full" />

                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>500ms (Fast)</span>
                    <span>5000ms (Slow)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max Retry Attempts: {maxRetries}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={maxRetries}
                    onChange={(e) => setMaxRetries(Number(e.target.value))}
                    className="w-full" />

                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>1 (Quick Fail)</span>
                    <span>10 (Persistent)</span>
                  </div>
                </div>
              </div>

              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  Optimistic updates provide instant UI feedback while syncing changes in the background. 
                  Lower sync intervals provide faster consistency but use more resources.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

};

export default OptimisticUpdateManager;