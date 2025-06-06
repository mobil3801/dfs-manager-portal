import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Activity, 
  Trash2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Settings,
  Zap,
  Timer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAutoCleanupService, type SessionMetrics } from '@/services/autoCleanupService';

const SessionManagerDashboard: React.FC = () => {
  const { toast } = useToast();
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics | null>(null);
  const [cleanupHistory, setCleanupHistory] = useState<any[]>([]);
  const [isPerformingCleanup, setIsPerformingCleanup] = useState(false);
  
  const cleanupService = getAutoCleanupService();

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      setSessionMetrics(cleanupService.getSessionMetrics());
      setCleanupHistory(cleanupService.getCleanupHistory());
    };
    
    // Initial load
    updateMetrics();
    
    // Update every 10 seconds
    const interval = setInterval(updateMetrics, 10000);
    
    return () => clearInterval(interval);
  }, [cleanupService]);

  // Format time duration
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Get session status
  const getSessionStatus = () => {
    if (!sessionMetrics) return { status: 'unknown', color: 'secondary' };
    
    const sessionAge = Date.now() - sessionMetrics.sessionStart.getTime();
    const idleTime = Date.now() - sessionMetrics.lastActivity.getTime();
    
    if (sessionMetrics.performanceScore < 50) {
      return { status: 'critical', color: 'destructive' };
    } else if (sessionMetrics.performanceScore < 70 || idleTime > 15 * 60 * 1000) {
      return { status: 'warning', color: 'warning' };
    } else if (sessionAge < 30 * 60 * 1000) {
      return { status: 'active', color: 'success' };
    } else {
      return { status: 'stable', color: 'default' };
    }
  };

  // Force cleanup
  const handleForceCleanup = async () => {
    setIsPerformingCleanup(true);
    try {
      await cleanupService.forceCleanup();
      toast({
        title: "Cleanup Completed",
        description: "Manual cleanup operation completed successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Cleanup Failed",
        description: "Failed to perform cleanup operation."
      });
    } finally {
      setIsPerformingCleanup(false);
    }
  };

  if (!sessionMetrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading session metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sessionStatus = getSessionStatus();
  const sessionAge = Date.now() - sessionMetrics.sessionStart.getTime();
  const idleTime = Date.now() - sessionMetrics.lastActivity.getTime();

  return (
    <div className="space-y-6">
      {/* Session Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              <Badge variant={sessionStatus.color as any}>
                {sessionStatus.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Performance: {sessionMetrics.performanceScore.toFixed(1)}/100
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(sessionAge)}</div>
            <p className="text-xs text-muted-foreground">
              Started: {sessionMetrics.sessionStart.toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionMetrics.memoryUsage.toFixed(1)} MB</div>
            <Progress 
              value={Math.min((sessionMetrics.memoryUsage / 200) * 100, 100)} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idle Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(idleTime)}</div>
            <p className="text-xs text-muted-foreground">
              Last activity: {sessionMetrics.lastActivity.toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {sessionMetrics.performanceScore < 60 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Performance Alert!</strong> Session performance is degraded ({sessionMetrics.performanceScore.toFixed(1)}/100). 
            Consider performing a cleanup operation.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={handleForceCleanup}
              disabled={isPerformingCleanup}
            >
              Force Cleanup
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Session Management */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Session Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity History</TabsTrigger>
          <TabsTrigger value="cleanup">Cleanup Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Statistics</CardTitle>
              <CardDescription>
                Detailed information about the current session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Session Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Session Start:</span>
                      <span className="font-mono">{sessionMetrics.sessionStart.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Activity:</span>
                      <span className="font-mono">{sessionMetrics.lastActivity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data Accesses:</span>
                      <span className="font-mono">{sessionMetrics.dataAccesses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cleanup Count:</span>
                      <span className="font-mono">{sessionMetrics.cleanupCount}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Performance Score</span>
                        <span>{sessionMetrics.performanceScore.toFixed(1)}/100</span>
                      </div>
                      <Progress value={sessionMetrics.performanceScore} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>{sessionMetrics.memoryUsage.toFixed(1)} MB</span>
                      </div>
                      <Progress value={Math.min((sessionMetrics.memoryUsage / 200) * 100, 100)} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Session Health</span>
                        <span>{sessionStatus.status}</span>
                      </div>
                      <Progress 
                        value={sessionStatus.status === 'active' ? 100 : 
                               sessionStatus.status === 'stable' ? 80 :
                               sessionStatus.status === 'warning' ? 60 : 30} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Recent session activity and interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {sessionMetrics.dataAccesses}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Interactions</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(sessionMetrics.dataAccesses / Math.max(sessionAge / (60 * 1000), 1))}
                    </div>
                    <p className="text-sm text-muted-foreground">Interactions/Minute</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatDuration(idleTime)}
                    </div>
                    <p className="text-sm text-muted-foreground">Current Idle Time</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-medium">Activity Indicators</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      {idleTime < 5 * 60 * 1000 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span>User Activity: {idleTime < 5 * 60 * 1000 ? 'Active' : 'Idle'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {sessionMetrics.performanceScore > 70 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span>Performance: {sessionMetrics.performanceScore > 70 ? 'Good' : 'Degraded'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cleanup" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cleanup Operations</CardTitle>
                  <CardDescription>
                    History of automatic and manual cleanup operations
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleForceCleanup} 
                  disabled={isPerformingCleanup}
                  variant="outline"
                >
                  {isPerformingCleanup ? (
                    <>
                      <Zap className="mr-2 h-4 w-4 animate-pulse" />
                      Cleaning...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Force Cleanup
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{sessionMetrics.cleanupCount}</div>
                    <p className="text-sm text-muted-foreground">Total Cleanups</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {cleanupHistory.length > 0 ? 
                        cleanupHistory[cleanupHistory.length - 1].operations.length : 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Last Cleanup Operations</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {cleanupHistory.length > 0 && cleanupHistory[cleanupHistory.length - 1].memoryBefore > 0 ?
                        `${((cleanupHistory[cleanupHistory.length - 1].memoryBefore - cleanupHistory[cleanupHistory.length - 1].memoryAfter) / cleanupHistory[cleanupHistory.length - 1].memoryBefore * 100).toFixed(1)}%` :
                        '0%'}
                    </div>
                    <p className="text-sm text-muted-foreground">Memory Freed (Last)</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-3">Cleanup History</h4>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {cleanupHistory.length > 0 ? (
                        cleanupHistory.slice(-10).reverse().map((cleanup, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">
                                {cleanup.timestamp.toLocaleString()}
                              </span>
                              <Badge variant="outline">
                                {cleanup.operations.length} operations
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <p>Memory: {cleanup.memoryBefore.toFixed(1)}MB → {cleanup.memoryAfter.toFixed(1)}MB</p>
                              <p>Operations: {cleanup.operations.join(', ')}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No cleanup operations performed yet
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SessionManagerDashboard;