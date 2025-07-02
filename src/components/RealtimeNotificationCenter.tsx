import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  BellRing,
  X,
  Check,
  AlertCircle,
  Info,
  CheckCircle,
  TrendingUp,
  Users,
  Package,
  Calendar,
  DollarSign,
  Fuel,
  FileText,
  AlertTriangle } from
'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { realtimeService } from '@/services/supabaseRealtimeService';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface RealtimeNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  data?: any;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'sales' | 'inventory' | 'employee' | 'license' | 'delivery' | 'system';
}

interface NotificationRule {
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  condition?: (data: any) => boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'sales' | 'inventory' | 'employee' | 'license' | 'delivery' | 'system';
  titleTemplate: string;
  messageTemplate: string;
}

const notificationRules: NotificationRule[] = [
// Sales notifications
{
  table: 'daily_sales_reports_enhanced',
  action: 'INSERT',
  priority: 'medium',
  category: 'sales',
  titleTemplate: 'New Sales Report',
  messageTemplate: 'Sales report for {station} on {report_date} has been submitted by {employee_name}'
},
{
  table: 'daily_sales_reports_enhanced',
  action: 'UPDATE',
  condition: (data) => data.total_sales > 10000,
  priority: 'high',
  category: 'sales',
  titleTemplate: 'High Sales Alert',
  messageTemplate: 'Exceptional sales of ${total_sales} reported for {station}'
},

// Inventory notifications
{
  table: 'products',
  action: 'UPDATE',
  condition: (data) => data.quantity_in_stock <= data.minimum_stock,
  priority: 'high',
  category: 'inventory',
  titleTemplate: 'Low Stock Alert',
  messageTemplate: '{product_name} is running low. Current stock: {quantity_in_stock}'
},

// Employee notifications
{
  table: 'employees',
  action: 'INSERT',
  priority: 'medium',
  category: 'employee',
  titleTemplate: 'New Employee Added',
  messageTemplate: 'Welcome {first_name} {last_name} to {station}'
},

// License notifications
{
  table: 'licenses_certificates',
  action: 'UPDATE',
  condition: (data) => {
    const expiryDate = new Date(data.expiry_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30;
  },
  priority: 'critical',
  category: 'license',
  titleTemplate: 'License Expiry Warning',
  messageTemplate: '{license_name} expires soon. Action required for {station}'
},

// Delivery notifications
{
  table: 'delivery_records',
  action: 'INSERT',
  priority: 'medium',
  category: 'delivery',
  titleTemplate: 'New Fuel Delivery',
  messageTemplate: 'Fuel delivery completed at {station}. BOL: {bol_number}'
},

// System notifications
{
  table: 'audit_logs',
  action: 'INSERT',
  condition: (data) => data.risk_level === 'High' || data.risk_level === 'Critical',
  priority: 'critical',
  category: 'system',
  titleTemplate: 'Security Alert',
  messageTemplate: 'High-risk activity detected: {action_performed}'
}];


const RealtimeNotificationCenter: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [subscriptionKeys, setSubscriptionKeys] = useState<string[]>([]);

  // Create notification from real-time update
  const createNotification = useCallback((
  payload: RealtimePostgresChangesPayload<any>,
  rule: NotificationRule)
  : RealtimeNotification => {
    const data = payload.new || payload.old || {};

    // Replace template variables
    const title = rule.titleTemplate.replace(/{(\w+)}/g, (match, key) => {
      return data[key] || match;
    });

    const message = rule.messageTemplate.replace(/{(\w+)}/g, (match, key) => {
      return data[key] || match;
    });

    const getNotificationType = (priority: string) => {
      switch (priority) {
        case 'critical':return 'error';
        case 'high':return 'warning';
        case 'medium':return 'info';
        default:return 'info';
      }
    };

    return {
      id: `${Date.now()}_${Math.random()}`,
      type: getNotificationType(rule.priority),
      title,
      message,
      timestamp: new Date(),
      table: rule.table,
      action: payload.eventType,
      data,
      read: false,
      priority: rule.priority,
      category: rule.category
    };
  }, []);

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    const matchingRules = notificationRules.filter((rule) => {
      if (rule.table !== payload.table) return false;
      if (rule.action !== '*' && rule.action !== payload.eventType) return false;

      if (rule.condition) {
        const data = payload.new || payload.old || {};
        return rule.condition(data);
      }

      return true;
    });

    matchingRules.forEach((rule) => {
      const notification = createNotification(payload, rule);

      setNotifications((prev) => [notification, ...prev.slice(0, 99)]); // Keep last 100

      // Show toast for high priority notifications
      if (rule.priority === 'critical' || rule.priority === 'high') {
        toast({
          title: notification.title,
          description: notification.message,
          variant: rule.priority === 'critical' ? 'destructive' : 'default'
        });
      }
    });
  }, [createNotification, toast]);

  // Subscribe to all relevant tables
  useEffect(() => {
    const tables = [...new Set(notificationRules.map((rule) => rule.table))];
    const keys: string[] = [];

    tables.forEach((table) => {
      const key = realtimeService.subscribe(table, handleRealtimeUpdate);
      keys.push(key);
    });

    setSubscriptionKeys(keys);

    return () => {
      keys.forEach((key) => realtimeService.unsubscribe(key));
    };
  }, [handleRealtimeUpdate]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
    prev.map((notif) =>
    notif.id === id ? { ...notif, read: true } : notif
    )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
    prev.map((notif) => ({ ...notif, read: true }))
    );
  }, []);

  // Clear notification
  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Filter notifications
  const getFilteredNotifications = useCallback((filter: string) => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.category === filter);
  }, [notifications]);

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sales':return <DollarSign className="w-4 h-4" />;
      case 'inventory':return <Package className="w-4 h-4" />;
      case 'employee':return <Users className="w-4 h-4" />;
      case 'license':return <FileText className="w-4 h-4" />;
      case 'delivery':return <Fuel className="w-4 h-4" />;
      case 'system':return <AlertTriangle className="w-4 h-4" />;
      default:return <Info className="w-4 h-4" />;
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          onClick={() => setIsOpen(true)}>

          {unreadCount > 0 ?
          <BellRing className="w-5 h-5" /> :

          <Bell className="w-5 h-5" />
          }
          <AnimatePresence>
            {unreadCount > 0 &&
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1">

                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              </motion.div>
            }
          </AnimatePresence>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BellRing className="w-5 h-5" />
              Real-time Notifications
            </span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 &&
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <Check className="w-4 h-4 mr-1" />
                  Mark All Read
                </Button>
              }
              <Button variant="outline" size="sm" onClick={clearAll}>
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="employee">Employee</TabsTrigger>
            <TabsTrigger value="license">License</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <ScrollArea className="h-96">
              <AnimatePresence>
                {getFilteredNotifications(activeTab).length === 0 ?
                <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications found</p>
                  </div> :

                <div className="space-y-2">
                    {getFilteredNotifications(activeTab).map((notification) =>
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 300 }}
                    transition={{ duration: 0.2 }}>

                        <Card className={`${!notification.read ? 'border-blue-200 bg-blue-50/50' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="flex items-center gap-2">
                                  {getNotificationIcon(notification.type)}
                                  {getCategoryIcon(notification.category)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-sm">{notification.title}</h4>
                                    <Badge
                                  variant={notification.priority === 'critical' ? 'destructive' : 'secondary'}
                                  className="text-xs">

                                      {notification.priority}
                                    </Badge>
                                    {!notification.read &&
                                <Badge variant="default" className="text-xs">
                                        New
                                      </Badge>
                                }
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {notification.message}
                                  </p>
                                  
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>{format(notification.timestamp, 'MMM dd, HH:mm')}</span>
                                    <span className="capitalize">{notification.table.replace('_', ' ')}</span>
                                    <span className="capitalize">{notification.action.toLowerCase()}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                {!notification.read &&
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 w-6 p-0">

                                    <Check className="w-3 h-3" />
                                  </Button>
                            }
                                <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => clearNotification(notification.id)}
                              className="h-6 w-6 p-0">

                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                  )}
                  </div>
                }
              </AnimatePresence>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>);

};

export default RealtimeNotificationCenter;