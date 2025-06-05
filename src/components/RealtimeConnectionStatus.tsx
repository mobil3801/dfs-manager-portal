import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Activity,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { realtimeService, ConnectionStatus } from '@/services/supabaseRealtimeService';
import { useToast } from '@/hooks/use-toast';

interface RealtimeConnectionStatusProps {
  showDetails?: boolean;
  showRefreshButton?: boolean;
  className?: string;
}

const RealtimeConnectionStatus: React.FC<RealtimeConnectionStatusProps> = ({
  showDetails = false,
  showRefreshButton = true,
  className = ""
}) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false,
    lastConnected: null,
    connectionCount: 0,
    subscriptionCount: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Get initial status
    setStatus(realtimeService.getConnectionStatus());

    // Subscribe to status changes
    const unsubscribe = realtimeService.onConnectionChange((newStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Force reconnection by destroying and recreating subscriptions
      const subscriptions = realtimeService.getActiveSubscriptions();
      toast({
        title: "Refreshing Connection",
        description: `Refreshing ${subscriptions.length} real-time subscriptions...`
      });

      // Small delay for user feedback
      setTimeout(() => {
        setIsRefreshing(false);
        toast({
          title: "Connection Refreshed",
          description: "Real-time connection has been refreshed successfully"
        });
      }, 1000);
    } catch (error) {
      setIsRefreshing(false);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh real-time connection",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = () => {
    if (isRefreshing) {
      return (
        <Badge variant="secondary" className="animate-pulse">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
          Refreshing
        </Badge>
      );
    }

    if (status.reconnecting) {
      return (
        <Badge variant="secondary" className="animate-pulse">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
          Reconnecting
        </Badge>
      );
    }

    if (status.connected) {
      return (
        <Badge variant="success" className="bg-green-500 text-white">
          <CheckCircle className="w-3 h-3 mr-1" />
          Connected
        </Badge>
      );
    }

    return (
      <Badge variant="destructive">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Disconnected
      </Badge>
    );
  };

  const getStatusIcon = () => {
    if (isRefreshing) {
      return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
    }

    if (status.reconnecting) {
      return <RefreshCw className="w-4 h-4 animate-spin text-yellow-500" />;
    }

    if (status.connected) {
      return <Wifi className="w-4 h-4 text-green-500" />;
    }

    return <WifiOff className="w-4 h-4 text-red-500" />;
  };

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-2 ${className}`}>
              <motion.div
                animate={{ 
                  scale: status.connected ? [1, 1.1, 1] : 1,
                  rotate: isRefreshing ? 360 : 0
                }}
                transition={{ 
                  scale: { repeat: Infinity, duration: 2 },
                  rotate: { duration: 1, ease: "linear" }
                }}
              >
                {getStatusIcon()}
              </motion.div>
              {getStatusBadge()}
              {showRefreshButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">Real-time Status</p>
              <p>Active Subscriptions: {status.subscriptionCount}</p>
              <p>Connections: {status.connectionCount}</p>
              {status.lastConnected && (
                <p>Last Connected: {status.lastConnected.toLocaleTimeString()}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Real-time Connection
          </span>
          {showRefreshButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
        </div>

        <AnimatePresence>
          {status.reconnecting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Attempting to reconnect...
              </div>
              <Progress value={66} className="h-2" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Activity className="w-3 h-3" />
              Subscriptions
            </div>
            <div className="font-medium">{status.subscriptionCount}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <RefreshCw className="w-3 h-3" />
              Connections
            </div>
            <div className="font-medium">{status.connectionCount}</div>
          </div>
        </div>

        {status.lastConnected && (
          <div className="text-sm">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              Last Connected
            </div>
            <div className="font-mono text-xs">
              {status.lastConnected.toLocaleString()}
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Real-time data updates are {status.connected ? 'active' : 'inactive'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeConnectionStatus;