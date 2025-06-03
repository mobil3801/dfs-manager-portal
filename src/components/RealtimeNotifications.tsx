import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, X, Clock, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRealtime } from '@/hooks/use-realtime';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  table: string;
  recordId?: number;
  read: boolean;
}

interface RealtimeNotificationsProps {
  tables: string[];
  maxNotifications?: number;
  autoRemoveAfter?: number; // in milliseconds
}

const RealtimeNotifications: React.FC<RealtimeNotificationsProps> = ({
  tables,
  maxNotifications = 10,
  autoRemoveAfter = 10000 // 10 seconds
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationType = (table: string, eventType: string): Notification['type'] => {
    if (table === 'audit_logs' && eventType === 'INSERT') return 'warning';
    if (eventType === 'DELETE') return 'error';
    if (eventType === 'UPDATE') return 'info';
    if (eventType === 'INSERT') return 'success';
    return 'info';
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev].slice(0, maxNotifications);
      return updated;
    });

    // Auto-remove notification after specified time
    if (autoRemoveAfter > 0) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, autoRemoveAfter);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
    prev.map((n) => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const formatTableName = (table: string) => {
    return table.split('_').map((word) =>
    word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Set up real-time subscriptions for all tables
  tables.forEach((table) => {
    useRealtime({
      table,
      onInsert: (payload) => {
        addNotification({
          type: getNotificationType(table, 'INSERT'),
          title: `New ${formatTableName(table)} Record`,
          message: `A new record has been added to ${formatTableName(table)}.`,
          table,
          recordId: payload.id
        });
      },
      onUpdate: (payload) => {
        addNotification({
          type: getNotificationType(table, 'UPDATE'),
          title: `${formatTableName(table)} Updated`,
          message: `A record in ${formatTableName(table)} has been modified.`,
          table,
          recordId: payload.new?.id
        });
      },
      onDelete: (payload) => {
        addNotification({
          type: getNotificationType(table, 'DELETE'),
          title: `${formatTableName(table)} Deleted`,
          message: `A record has been removed from ${formatTableName(table)}.`,
          table,
          recordId: payload.id
        });
      },
      showNotifications: false // We handle notifications manually
    });
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative">

        <Bell className="h-4 w-4" />
        {unreadCount > 0 &&
        <Badge
          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          variant="destructive">

            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        }
      </Button>

      <AnimatePresence>
        {isOpen &&
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="absolute right-0 top-full mt-2 z-50">

            <Card className="w-80 max-h-96 shadow-lg border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Real-time Notifications
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 &&
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="text-xs h-7">

                        Clear All
                      </Button>
                  }
                    <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-7 w-7 p-0">

                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {notifications.length === 0 ?
              <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications yet
                  </div> :

              <ScrollArea className="h-80">
                    <div className="space-y-1 p-2">
                      {notifications.map((notification) =>
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-3 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-background'}`
                    }
                    onClick={() => markAsRead(notification.id)}>

                          <div className="flex items-start gap-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium truncate">
                                  {notification.title}
                                </p>
                                <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100">

                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(notification.timestamp)}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {formatTableName(notification.table)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                  )}
                    </div>
                  </ScrollArea>
              }
              </CardContent>
            </Card>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

};

export default RealtimeNotifications;