import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Users, Clock, CheckCircle, XCircle, GitMerge, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'motion/react';

interface ConflictData {
  id: string;
  tableId: string;
  recordId: number;
  fieldName: string;
  originalValue: any;
  userValue: any;
  otherUserValue: any;
  otherUserId: number;
  otherUserName: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ConflictResolution {
  strategy: 'merge' | 'user_wins' | 'other_wins' | 'manual';
  resolvedValue: any;
  reasoning: string;
}

interface ActiveUser {
  userId: number;
  userName: string;
  currentTable: string;
  currentRecord: number;
  lastActivity: Date;
  activeFields: string[];
}

const RealTimeConflictResolver: React.FC = () => {
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<ConflictData | null>(null);
  const [resolutionStrategy, setResolutionStrategy] = useState<ConflictResolution | null>(null);
  const [autoResolveEnabled, setAutoResolveEnabled] = useState(true);
  const [conflictStats, setConflictStats] = useState({
    totalConflicts: 0,
    resolvedToday: 0,
    averageResolutionTime: 0,
    conflictRate: 0
  });
  const { toast } = useToast();

  // Simulate real-time conflict detection
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      detectConflicts();
      updateActiveUsers();
      updateConflictStats();
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const detectConflicts = useCallback(async () => {
    try {
      // Simulate conflict detection by checking for concurrent edits
      const simulatedConflicts = generateSimulatedConflicts();

      const newConflicts = simulatedConflicts.filter((conflict) =>
      !conflicts.some((existing) => existing.id === conflict.id)
      );

      if (newConflicts.length > 0) {
        setConflicts((prev) => [...prev, ...newConflicts]);

        newConflicts.forEach((conflict) => {
          if (autoResolveEnabled && conflict.severity !== 'critical') {
            resolveConflictAutomatically(conflict);
          } else {
            toast({
              title: "Edit Conflict Detected",
              description: `${conflict.otherUserName} is editing the same ${conflict.fieldName} field`,
              variant: "destructive"
            });
          }
        });
      }
    } catch (error) {
      console.error('Error detecting conflicts:', error);
    }
  }, [conflicts, autoResolveEnabled, toast]);

  const generateSimulatedConflicts = (): ConflictData[] => {
    const shouldGenerate = Math.random() < 0.1; // 10% chance
    if (!shouldGenerate) return [];

    const tableNames = ['products', 'employees', 'sales', 'orders'];
    const fieldNames = ['name', 'price', 'quantity', 'status', 'notes'];
    const users = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Rodriguez'];

    return [{
      id: `conflict_${Date.now()}_${Math.random()}`,
      tableId: tableNames[Math.floor(Math.random() * tableNames.length)],
      recordId: Math.floor(Math.random() * 100) + 1,
      fieldName: fieldNames[Math.floor(Math.random() * fieldNames.length)],
      originalValue: 'Original Value',
      userValue: 'Your Changes',
      otherUserValue: 'Other User Changes',
      otherUserId: Math.floor(Math.random() * 1000),
      otherUserName: users[Math.floor(Math.random() * users.length)],
      timestamp: new Date(),
      severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any
    }];
  };

  const updateActiveUsers = useCallback(() => {
    // Simulate active users tracking
    const simulatedUsers: ActiveUser[] = [
    {
      userId: 1,
      userName: 'John Smith',
      currentTable: 'products',
      currentRecord: 123,
      lastActivity: new Date(),
      activeFields: ['name', 'price']
    },
    {
      userId: 2,
      userName: 'Sarah Johnson',
      currentTable: 'employees',
      currentRecord: 45,
      lastActivity: new Date(Date.now() - 30000),
      activeFields: ['salary', 'position']
    }];


    setActiveUsers(simulatedUsers);
  }, []);

  const updateConflictStats = useCallback(() => {
    setConflictStats({
      totalConflicts: conflicts.length,
      resolvedToday: Math.floor(conflicts.length * 0.8),
      averageResolutionTime: 45, // seconds
      conflictRate: Math.random() * 5 // conflicts per hour
    });
  }, [conflicts.length]);

  const resolveConflictAutomatically = async (conflict: ConflictData) => {
    try {
      let resolution: ConflictResolution;

      switch (conflict.severity) {
        case 'low':
          // For low severity, prefer newer value
          resolution = {
            strategy: 'other_wins',
            resolvedValue: conflict.otherUserValue,
            reasoning: 'Auto-resolved: Newer value preferred for low-impact changes'
          };
          break;
        case 'medium':
          // For medium severity, attempt merge
          resolution = {
            strategy: 'merge',
            resolvedValue: `${conflict.userValue} | ${conflict.otherUserValue}`,
            reasoning: 'Auto-resolved: Values merged for review'
          };
          break;
        default:
          // High and critical require manual resolution
          return;
      }

      await applyResolution(conflict, resolution);
      removeConflict(conflict.id);

      toast({
        title: "Conflict Auto-Resolved",
        description: resolution.reasoning
      });
    } catch (error) {
      console.error('Error auto-resolving conflict:', error);
    }
  };

  const resolveConflictManually = async (conflict: ConflictData, resolution: ConflictResolution) => {
    try {
      await applyResolution(conflict, resolution);
      removeConflict(conflict.id);
      setSelectedConflict(null);

      toast({
        title: "Conflict Resolved",
        description: `Applied ${resolution.strategy} strategy successfully`
      });
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast({
        title: "Resolution Failed",
        description: "Failed to apply conflict resolution",
        variant: "destructive"
      });
    }
  };

  const applyResolution = async (conflict: ConflictData, resolution: ConflictResolution) => {
    // Simulate API call to apply resolution
    console.log('Applying resolution:', { conflict, resolution });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const removeConflict = (conflictId: string) => {
    setConflicts((prev) => prev.filter((c) => c.id !== conflictId));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':return 'bg-green-500';
      case 'medium':return 'bg-yellow-500';
      case 'high':return 'bg-orange-500';
      case 'critical':return 'bg-red-500';
      default:return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':return <CheckCircle className="h-4 w-4" />;
      case 'medium':return <Clock className="h-4 w-4" />;
      case 'high':return <AlertTriangle className="h-4 w-4" />;
      case 'critical':return <XCircle className="h-4 w-4" />;
      default:return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GitMerge className="h-5 w-5" />
              Real-Time Conflict Resolver
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isMonitoring ? "default" : "secondary"}>
                {isMonitoring ? "Monitoring" : "Stopped"}
              </Badge>
              <Button
                onClick={() => setIsMonitoring(!isMonitoring)}
                variant={isMonitoring ? "destructive" : "default"}
                size="sm">

                {isMonitoring ? "Stop" : "Start"} Monitoring
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{conflictStats.totalConflicts}</div>
              <div className="text-sm text-gray-600">Active Conflicts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{conflictStats.resolvedToday}</div>
              <div className="text-sm text-gray-600">Resolved Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{conflictStats.averageResolutionTime}s</div>
              <div className="text-sm text-gray-600">Avg Resolution Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{conflictStats.conflictRate.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Conflicts/Hour</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="conflicts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="conflicts">Active Conflicts ({conflicts.length})</TabsTrigger>
          <TabsTrigger value="users">Active Users ({activeUsers.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="conflicts" className="space-y-4">
          {conflicts.length === 0 ?
          <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No active conflicts detected. All users are working in harmony!
              </AlertDescription>
            </Alert> :

          <div className="space-y-3">
              <AnimatePresence>
                {conflicts.map((conflict) =>
              <motion.div
                key={conflict.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}>

                    <Card className="border-l-4" style={{ borderLeftColor: getSeverityColor(conflict.severity).replace('bg-', '#') }}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getSeverityIcon(conflict.severity)}
                              {conflict.severity.toUpperCase()}
                            </Badge>
                            <div>
                              <p className="font-medium">
                                {conflict.tableId} → {conflict.fieldName}
                              </p>
                              <p className="text-sm text-gray-600">
                                Conflict with {conflict.otherUserName} • Record #{conflict.recordId}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(conflict.timestamp).toLocaleTimeString()}
                            </Badge>
                            <Button
                          size="sm"
                          onClick={() => setSelectedConflict(conflict)}>

                              Resolve
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-blue-600">Your Changes:</p>
                            <p className="bg-blue-50 p-2 rounded">{conflict.userValue}</p>
                          </div>
                          <div>
                            <p className="font-medium text-orange-600">{conflict.otherUserName}'s Changes:</p>
                            <p className="bg-orange-50 p-2 rounded">{conflict.otherUserValue}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
              )}
              </AnimatePresence>
            </div>
          }
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeUsers.map((user) =>
            <Card key={user.userId}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.userName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{user.userName}</p>
                      <p className="text-sm text-gray-600">ID: {user.userId}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Current Table:</span>
                      <Badge variant="outline">{user.currentTable}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Record:</span>
                      <span>#{user.currentRecord}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Activity:</span>
                      <span>{new Date(user.lastActivity).toLocaleTimeString()}</span>
                    </div>
                    <div>
                      <span>Active Fields:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.activeFields.map((field) =>
                      <Badge key={field} variant="secondary" className="text-xs">
                            {field}
                          </Badge>
                      )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conflict Resolution Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-resolve Low/Medium Conflicts</p>
                  <p className="text-sm text-gray-600">Automatically resolve conflicts with low to medium severity</p>
                </div>
                <Button
                  variant={autoResolveEnabled ? "default" : "outline"}
                  onClick={() => setAutoResolveEnabled(!autoResolveEnabled)}>

                  {autoResolveEnabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium">Detection Interval</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Real-time (2s intervals)</span>
                  <Progress value={100} className="flex-1" />
                  <Zap className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Conflict Resolution Dialog */}
      <Dialog open={!!selectedConflict} onOpenChange={() => setSelectedConflict(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Resolve Edit Conflict</DialogTitle>
          </DialogHeader>
          
          {selectedConflict &&
          <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Multiple users have edited the same field. Choose how to resolve this conflict.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-2">Original Value:</p>
                  <div className="bg-gray-50 p-3 rounded border">
                    {selectedConflict.originalValue}
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-2 text-blue-600">Your Changes:</p>
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    {selectedConflict.userValue}
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-2 text-orange-600">{selectedConflict.otherUserName}'s Changes:</p>
                  <div className="bg-orange-50 p-3 rounded border border-orange-200">
                    {selectedConflict.otherUserValue}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                variant="outline"
                onClick={() => resolveConflictManually(selectedConflict, {
                  strategy: 'user_wins',
                  resolvedValue: selectedConflict.userValue,
                  reasoning: 'User chose to keep their changes'
                })}>

                  Keep Mine
                </Button>
                <Button
                variant="outline"
                onClick={() => resolveConflictManually(selectedConflict, {
                  strategy: 'other_wins',
                  resolvedValue: selectedConflict.otherUserValue,
                  reasoning: 'User chose to accept other user\'s changes'
                })}>

                  Accept Theirs
                </Button>
                <Button
                variant="outline"
                onClick={() => resolveConflictManually(selectedConflict, {
                  strategy: 'merge',
                  resolvedValue: `${selectedConflict.userValue} | ${selectedConflict.otherUserValue}`,
                  reasoning: 'User chose to merge both values'
                })}>

                  Merge Both
                </Button>
                <Button
                variant="outline"
                onClick={() => setSelectedConflict(null)}>

                  Cancel
                </Button>
              </div>
            </div>
          }
        </DialogContent>
      </Dialog>
    </div>);

};

export default RealTimeConflictResolver;