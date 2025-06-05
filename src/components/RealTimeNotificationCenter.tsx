import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Bell, BellOff, Settings, User, Database, AlertTriangle, CheckCircle, Clock, Zap, Volume2, VolumeX, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: string;
  type: 'conflict' | 'sync' | 'audit' | 'system' | 'security' | 'performance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  source: string;
  isRead: boolean;
  isAcknowledged: boolean;
  actionRequired: boolean;
  relatedData?: any;
  expiresAt?: Date;
}

interface NotificationChannel {
  id: string;
  name: string;
  type: 'browser' | 'email' | 'sms' | 'webhook';
  isEnabled: boolean;
  config: any;
}

interface NotificationSettings {
  globalEnabled: boolean;
  soundEnabled: boolean;
  desktopEnabled: boolean;
  batchDelay: number;
  maxNotifications: number;
  autoAcknowledge: boolean;
  channels: NotificationChannel[];
  filters: {
    types: string[];
    priorities: string[];
    sources: string[];
  };
}

const RealTimeNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    globalEnabled: true,
    soundEnabled: true,
    desktopEnabled: true,
    batchDelay: 2000,
    maxNotifications: 100,
    autoAcknowledge: false,
    channels: [
    { id: 'browser', name: 'Browser Notifications', type: 'browser', isEnabled: true, config: {} },
    { id: 'email', name: 'Email Alerts', type: 'email', isEnabled: true, config: { email: 'admin@gasstation.com' } },
    { id: 'sms', name: 'SMS Alerts', type: 'sms', isEnabled: false, config: { phone: '+1234567890' } }],

    filters: {
      types: ['conflict', 'sync', 'audit', 'system', 'security', 'performance'],
      priorities: ['low', 'medium', 'high', 'critical'],
      sources: []
    }
  });
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [stats, setStats] = useState({
    unread: 0,
    acknowledged: 0,
    actionRequired: 0,
    last24Hours: 0
  });
  const { toast } = useToast();

  // Initialize with sample notifications
  useEffect(() => {
    generateSampleNotifications();
  }, []);

  // Real-time notification simulation
  useEffect(() => {
    if (!settings.globalEnabled) return;

    const interval = setInterval(() => {
      generateRandomNotification();
    }, 5000);

    return () => clearInterval(interval);
  }, [settings.globalEnabled]);

  // Update stats whenever notifications change
  useEffect(() => {
    updateStats();
  }, [notifications]);

  const generateSampleNotifications = () => {
    const sampleNotifications: Notification[] = [
    {
      id: 'notif_1',
      type: 'conflict',
      priority: 'high',
      title: 'Edit Conflict Detected',
      message: 'Sarah Johnson is editing the same product record as you',
      timestamp: new Date(Date.now() - 300000),
      source: 'Conflict Resolver',
      isRead: false,
      isAcknowledged: false,
      actionRequired: true,
      relatedData: { tableId: 'products', recordId: 123 }
    },
    {
      id: 'notif_2',
      type: 'sync',
      priority: 'medium',
      title: 'Optimistic Update Confirmed',
      message: 'Product price update has been successfully synchronized',
      timestamp: new Date(Date.now() - 240000),
      source: 'Optimistic Update Manager',
      isRead: true,
      isAcknowledged: true,
      actionRequired: false,
      relatedData: { operation: 'update', tableId: 'products' }
    },
    {
      id: 'notif_3',
      type: 'security',
      priority: 'critical',
      title: 'Failed Login Attempts',
      message: 'Multiple failed login attempts detected from IP 45.123.45.67',
      timestamp: new Date(Date.now() - 180000),
      source: 'Audit Trail',
      isRead: false,
      isAcknowledged: false,
      actionRequired: true,
      relatedData: { ipAddress: '45.123.45.67', attempts: 5 }
    },
    {
      id: 'notif_4',
      type: 'performance',
      priority: 'medium',
      title: 'Cache Hit Rate Declining',
      message: 'Cache performance has dropped below 85% in the last hour',
      timestamp: new Date(Date.now() - 120000),
      source: 'Cache Manager',
      isRead: false,
      isAcknowledged: false,
      actionRequired: false,
      relatedData: { hitRate: 83.2, threshold: 85 }
    },
    {
      id: 'notif_5',
      type: 'system',
      priority: 'low',
      title: 'Database Trigger Executed',
      message: 'License expiry alert trigger completed successfully',
      timestamp: new Date(Date.now() - 60000),
      source: 'Database Triggers',
      isRead: false,
      isAcknowledged: false,
      actionRequired: false,
      relatedData: { triggerId: 'license_alert', executionTime: 250 }
    }];


    setNotifications(sampleNotifications);
  };

  const generateRandomNotification = useCallback(() => {
    const types: ('conflict' | 'sync' | 'audit' | 'system' | 'security' | 'performance')[] = ['conflict', 'sync', 'audit', 'system', 'security', 'performance'];
    const priorities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
    const sources = ['Conflict Resolver', 'Optimistic Update Manager', 'Cache Manager', 'Database Triggers', 'Audit Trail', 'Security Monitor'];

    const templates = {
      conflict: [
      { title: 'Edit Conflict Detected', message: 'Multiple users editing the same record' },
      { title: 'Concurrent Modification', message: 'Simultaneous changes detected on employee record' }],

      sync: [
      { title: 'Sync Completed', message: 'All pending updates synchronized successfully' },
      { title: 'Sync Failed', message: 'Unable to synchronize changes, retrying...' }],

      audit: [
      { title: 'Suspicious Activity', message: 'Unusual access pattern detected' },
      { title: 'Compliance Alert', message: 'Audit requirement threshold reached' }],

      system: [
      { title: 'System Update', message: 'Background maintenance completed' },
      { title: 'Configuration Change', message: 'System settings updated' }],

      security: [
      { title: 'Security Alert', message: 'Potential security threat detected' },
      { title: 'Access Violation', message: 'Unauthorized access attempt blocked' }],

      performance: [
      { title: 'Performance Warning', message: 'System performance degraded' },
      { title: 'Resource Alert', message: 'Memory usage approaching limit' }]

    };

    const shouldGenerate = Math.random() < 0.4; // 40% chance
    if (!shouldGenerate) return;

    const type = types[Math.floor(Math.random() * types.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const template = templates[type][Math.floor(Math.random() * templates[type].length)];

    const newNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random()}`,
      type,
      priority,
      title: template.title,
      message: template.message,
      timestamp: new Date(),
      source,
      isRead: false,
      isAcknowledged: false,
      actionRequired: priority === 'high' || priority === 'critical',
      relatedData: { generated: true },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    setNotifications((prev) => [newNotification, ...prev.slice(0, settings.maxNotifications - 1)]);

    // Show notification based on settings
    showNotification(newNotification);
  }, [settings, toast]);

  const showNotification = (notification: Notification) => {
    if (!settings.globalEnabled) return;

    // Filter check
    if (!settings.filters.types.includes(notification.type)) return;
    if (!settings.filters.priorities.includes(notification.priority)) return;

    // Browser notification
    if (settings.desktopEnabled && settings.channels.find((c) => c.id === 'browser')?.isEnabled) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id
        });
      }
    }

    // Sound notification
    if (settings.soundEnabled && (notification.priority === 'high' || notification.priority === 'critical')) {
      // Would play notification sound here
      console.log('🔔 Notification sound would play');
    }

    // Toast notification
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.priority === 'critical' || notification.priority === 'high' ? 'destructive' : 'default',
      duration: notification.priority === 'critical' ? 10000 : 5000
    });
  };

  const updateStats = () => {
    const unread = notifications.filter((n) => !n.isRead).length;
    const acknowledged = notifications.filter((n) => n.isAcknowledged).length;
    const actionRequired = notifications.filter((n) => n.actionRequired && !n.isAcknowledged).length;
    const last24Hours = notifications.filter((n) =>
    Date.now() - n.timestamp.getTime() < 24 * 60 * 60 * 1000
    ).length;

    setStats({ unread, acknowledged, actionRequired, last24Hours });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) =>
    n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const markAsAcknowledged = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) =>
    n.id === notificationId ? { ...n, isAcknowledged: true, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    toast({
      title: "Notifications Cleared",
      description: "All notifications have been removed"
    });
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You will now receive desktop notifications"
        });
      }
    }
  };

  const getFilteredNotifications = () => {
    return notifications.filter((notification) => {
      if (filterType !== 'all' && notification.type !== filterType) return false;
      if (filterPriority !== 'all' && notification.priority !== filterPriority) return false;
      return true;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':return 'bg-gray-500 text-white';
      case 'medium':return 'bg-blue-500 text-white';
      case 'high':return 'bg-orange-500 text-white';
      case 'critical':return 'bg-red-500 text-white';
      default:return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'conflict':return <AlertTriangle className="h-4 w-4" />;
      case 'sync':return <CheckCircle className="h-4 w-4" />;
      case 'audit':return <User className="h-4 w-4" />;
      case 'system':return <Database className="h-4 w-4" />;
      case 'security':return <AlertTriangle className="h-4 w-4" />;
      case 'performance':return <Zap className="h-4 w-4" />;
      default:return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'conflict':return 'text-orange-600 bg-orange-50';
      case 'sync':return 'text-green-600 bg-green-50';
      case 'audit':return 'text-blue-600 bg-blue-50';
      case 'system':return 'text-purple-600 bg-purple-50';
      case 'security':return 'text-red-600 bg-red-50';
      case 'performance':return 'text-yellow-600 bg-yellow-50';
      default:return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {settings.globalEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
              Real-Time Notification Center
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={settings.globalEnabled ? "default" : "secondary"}>
                {settings.globalEnabled ? "Active" : "Paused"}
              </Badge>
              <Button
                onClick={() => setSettings((prev) => ({ ...prev, globalEnabled: !prev.globalEnabled }))}
                variant={settings.globalEnabled ? "destructive" : "default"}
                size="sm">

                {settings.globalEnabled ? "Disable" : "Enable"}
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                size="sm">

                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
              <div className="text-sm text-gray-600">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.actionRequired}</div>
              <div className="text-sm text-gray-600">Action Required</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.acknowledged}</div>
              <div className="text-sm text-gray-600">Acknowledged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.last24Hours}</div>
              <div className="text-sm text-gray-600">Last 24h</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications ({notifications.length})</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="conflict">Conflicts</SelectItem>
                  <SelectItem value="sync">Sync</SelectItem>
                  <SelectItem value="audit">Audit</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={markAllAsRead}>
                Mark All Read
              </Button>
              <Button size="sm" variant="outline" onClick={clearNotifications}>
                Clear All
              </Button>
              <Button size="sm" variant="outline" onClick={requestNotificationPermission}>
                Enable Desktop
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-96">
            <div className="space-y-3">
              <AnimatePresence>
                {getFilteredNotifications().map((notification, index) =>
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.02 }}>

                    <Card
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                    !notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`
                    }
                    onClick={() => {
                      setSelectedNotification(notification);
                      markAsRead(notification.id);
                    }}>

                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-1 rounded ${getTypeColor(notification.type)}`}>
                              {getTypeIcon(notification.type)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{notification.title}</p>
                              <p className="text-xs text-gray-600">
                                {notification.source} • {notification.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(notification.priority)}>
                              {notification.priority.toUpperCase()}
                            </Badge>
                            {notification.actionRequired && !notification.isAcknowledged &&
                          <Badge variant="destructive">Action Required</Badge>
                          }
                            {notification.isAcknowledged &&
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          }
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">{notification.message}</p>

                        {notification.actionRequired && !notification.isAcknowledged &&
                      <div className="flex gap-2">
                            <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsAcknowledged(notification.id);
                          }}>

                              Acknowledge
                            </Button>
                            <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNotification(notification);
                          }}>

                              View Details
                            </Button>
                          </div>
                      }
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {settings.channels.map((channel) =>
            <Card key={channel.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{channel.name}</CardTitle>
                    <Switch
                    checked={channel.isEnabled}
                    onCheckedChange={(checked) => {
                      setSettings((prev) => ({
                        ...prev,
                        channels: prev.channels.map((c) =>
                        c.id === channel.id ? { ...c, isEnabled: checked } : c
                        )
                      }));
                    }} />

                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline">{channel.type}</Badge>
                    {channel.type === 'email' &&
                  <p className="text-sm text-gray-600">
                        Email: {channel.config.email}
                      </p>
                  }
                    {channel.type === 'sms' &&
                  <p className="text-sm text-gray-600">
                        Phone: {channel.config.phone}
                      </p>
                  }
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        Configure
                      </Button>
                      <Button size="sm" variant="outline">
                        Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Today:</span>
                    <Badge variant="outline">{stats.last24Hours}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Average per day:</span>
                    <Badge variant="outline">{Math.round(stats.last24Hours * 0.8)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak hour:</span>
                    <Badge variant="outline">10:00 AM - 11:00 AM</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Acknowledgment Rate:</span>
                      <span>{(stats.acknowledged / notifications.length * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.acknowledged / notifications.length * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Action Required Rate:</span>
                      <span>{(stats.actionRequired / notifications.length * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.actionRequired / notifications.length * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              Notification analytics help optimize alert strategies and reduce notification fatigue. 
              Monitor response rates and adjust thresholds accordingly.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">General Settings</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sound Notifications</Label>
                  <p className="text-sm text-gray-600">Play sound for high priority alerts</p>
                </div>
                <div className="flex items-center gap-2">
                  {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, soundEnabled: checked }))} />

                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Desktop Notifications</Label>
                  <p className="text-sm text-gray-600">Show browser notifications</p>
                </div>
                <Switch
                  checked={settings.desktopEnabled}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, desktopEnabled: checked }))} />

              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-acknowledge Low Priority</Label>
                  <p className="text-sm text-gray-600">Automatically acknowledge low priority notifications</p>
                </div>
                <Switch
                  checked={settings.autoAcknowledge}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoAcknowledge: checked }))} />

              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Batch Settings</h4>
              
              <div className="space-y-2">
                <Label>Batch Delay: {settings.batchDelay}ms</Label>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={settings.batchDelay}
                  onChange={(e) => setSettings((prev) => ({ ...prev, batchDelay: Number(e.target.value) }))}
                  className="w-full" />

                <div className="flex justify-between text-xs text-gray-600">
                  <span>1s (Immediate)</span>
                  <span>10s (Batched)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Max Notifications: {settings.maxNotifications}</Label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="25"
                  value={settings.maxNotifications}
                  onChange={(e) => setSettings((prev) => ({ ...prev, maxNotifications: Number(e.target.value) }))}
                  className="w-full" />

                <div className="flex justify-between text-xs text-gray-600">
                  <span>50 (Minimal)</span>
                  <span>500 (Maximum)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowSettings(false)}>
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Detail Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          
          {selectedNotification &&
          <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded ${getTypeColor(selectedNotification.type)}`}>
                  {getTypeIcon(selectedNotification.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{selectedNotification.title}</h3>
                  <p className="text-sm text-gray-600">{selectedNotification.source}</p>
                </div>
                <Badge className={getPriorityColor(selectedNotification.priority)}>
                  {selectedNotification.priority.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Timestamp:</span>
                  <p>{selectedNotification.timestamp.toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium">Type:</span>
                  <p>{selectedNotification.type}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p>{selectedNotification.isAcknowledged ? 'Acknowledged' : 'Pending'}</p>
                </div>
                <div>
                  <span className="font-medium">Action Required:</span>
                  <p>{selectedNotification.actionRequired ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div>
                <span className="font-medium">Message:</span>
                <p className="mt-1 p-3 bg-gray-50 rounded">{selectedNotification.message}</p>
              </div>

              {selectedNotification.relatedData &&
            <div>
                  <span className="font-medium">Related Data:</span>
                  <code className="block mt-1 p-3 bg-gray-100 rounded text-xs">
                    {JSON.stringify(selectedNotification.relatedData, null, 2)}
                  </code>
                </div>
            }

              {selectedNotification.actionRequired && !selectedNotification.isAcknowledged &&
            <div className="flex gap-2 pt-4">
                  <Button
                onClick={() => {
                  markAsAcknowledged(selectedNotification.id);
                  setSelectedNotification(null);
                }}>

                    Acknowledge
                  </Button>
                  <Button
                variant="outline"
                onClick={() => setSelectedNotification(null)}>

                    Close
                  </Button>
                </div>
            }
            </div>
          }
        </DialogContent>
      </Dialog>
    </div>);

};

export default RealTimeNotificationCenter;