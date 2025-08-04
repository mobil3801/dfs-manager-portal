
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Clock, 
  RefreshCw, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nehhjsiuhthflfwkfequ.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5laGhqc2l1aHRoZmxmd2tmZXF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxMzE3NSwiZXhwIjoyMDY4NTg5MTc1fQ.7naT6l_oNH8VI5MaEKgJ19PoYw1EErv6-ftkEin12wE'
);

interface SessionInfo {
  isActive: boolean;
  expiresAt: Date | null;
  timeRemaining: number;
  accessToken: string | null;
  refreshToken: string | null;
  user: any;
}

const SessionManager: React.FC = () => {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({
    isActive: false,
    expiresAt: null,
    timeRemaining: 0,
    accessToken: null,
    refreshToken: null,
    user: null
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    updateSessionInfo();
    
    // Set up interval to update session info every second
    const interval = setInterval(updateSessionInfo, 1000);
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Session Manager - Auth state change:', event);
        updateSessionInfo();
        
        if (event === 'TOKEN_REFRESHED') {
          toast.success('Session refreshed successfully');
        } else if (event === 'SIGNED_OUT') {
          toast.info('Session ended');
        }
      }
    );

    return () => {
      clearInterval(interval);
      subscription?.unsubscribe();
    };
  }, []);

  const updateSessionInfo = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        return;
      }

      if (session) {
        const expiresAt = new Date(session.expires_at! * 1000);
        const now = new Date();
        const timeRemaining = Math.max(0, expiresAt.getTime() - now.getTime());
        
        setSessionInfo({
          isActive: true,
          expiresAt,
          timeRemaining,
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          user: session.user
        });

        // Auto refresh if enabled and session expires in less than 5 minutes
        if (autoRefresh && timeRemaining < 5 * 60 * 1000 && timeRemaining > 0) {
          await refreshSession();
        }
      } else {
        setSessionInfo({
          isActive: false,
          expiresAt: null,
          timeRemaining: 0,
          accessToken: null,
          refreshToken: null,
          user: null
        });
      }
    } catch (error) {
      console.error('Error updating session info:', error);
    }
  };

  const refreshSession = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        toast.error(`Session refresh failed: ${error.message}`);
      } else if (data.session) {
        toast.success('Session refreshed successfully');
        updateSessionInfo();
      }
    } catch (error: any) {
      toast.error(`Session refresh error: ${error.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const invalidateSession = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(`Logout failed: ${error.message}`);
      } else {
        toast.success('Session invalidated');
      }
    } catch (error: any) {
      toast.error(`Logout error: ${error.message}`);
    }
  };

  const formatTimeRemaining = (milliseconds: number): string => {
    if (milliseconds <= 0) return 'Expired';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getExpirationProgress = (): number => {
    if (!sessionInfo.expiresAt || !sessionInfo.isActive) return 0;
    
    const sessionDuration = 60 * 60 * 1000; // 1 hour in milliseconds
    const remaining = sessionInfo.timeRemaining;
    
    return Math.max(0, Math.min(100, (remaining / sessionDuration) * 100));
  };

  const getExpirationStatus = () => {
    const minutes = sessionInfo.timeRemaining / (1000 * 60);
    
    if (minutes <= 0) return { color: 'text-red-500', status: 'Expired' };
    if (minutes <= 5) return { color: 'text-red-500', status: 'Critical' };
    if (minutes <= 15) return { color: 'text-yellow-500', status: 'Warning' };
    return { color: 'text-green-500', status: 'Good' };
  };

  const expirationStatus = getExpirationStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Session Manager</h2>
          <p className="text-muted-foreground">
            Monitor and manage user session state
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Timer className="h-4 w-4 mr-2" />
            Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Session Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Session Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {sessionInfo.isActive ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium">Status</span>
              </div>
              <Badge variant={sessionInfo.isActive ? "default" : "destructive"} className="text-xs">
                {sessionInfo.isActive ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Time Remaining</span>
              </div>
              <p className={`text-sm font-mono ${expirationStatus.color}`}>
                {formatTimeRemaining(sessionInfo.timeRemaining)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Expiration Status</span>
              </div>
              <Badge 
                variant={expirationStatus.status === 'Good' ? 'default' : 
                        expirationStatus.status === 'Warning' ? 'secondary' : 'destructive'} 
                className="text-xs"
              >
                {expirationStatus.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">User</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {sessionInfo.user?.email || 'No user'}
              </p>
            </div>
          </div>

          {sessionInfo.isActive && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Session Progress</span>
                <span>{Math.round(getExpirationProgress())}%</span>
              </div>
              <Progress value={getExpirationProgress()} className="w-full" />
            </div>
          )}

          {sessionInfo.expiresAt && (
            <div className="mt-4 text-sm text-muted-foreground">
              <strong>Expires:</strong> {sessionInfo.expiresAt.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Session Controls</CardTitle>
          <CardDescription>
            Manage your current session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              onClick={refreshSession} 
              disabled={isRefreshing || !sessionInfo.isActive}
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Session
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={invalidateSession}
              disabled={!sessionInfo.isActive}
            >
              Invalidate Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Session Details */}
      {sessionInfo.isActive && (
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>
              Technical session information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium">Access Token (Last 20 chars)</label>
                  <p className="text-xs font-mono bg-muted p-2 rounded mt-1">
                    ...{sessionInfo.accessToken?.slice(-20) || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">User ID</label>
                  <p className="text-xs font-mono bg-muted p-2 rounded mt-1">
                    {sessionInfo.user?.id || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">User Role</label>
                  <p className="text-xs font-mono bg-muted p-2 rounded mt-1">
                    {sessionInfo.user?.role || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {sessionInfo.isActive && sessionInfo.timeRemaining < 5 * 60 * 1000 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your session will expire in less than 5 minutes. Consider refreshing your session to avoid losing your work.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SessionManager;
