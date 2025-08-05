import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'error';
  database: 'healthy' | 'warning' | 'error';
  auth: 'healthy' | 'warning' | 'error';
  lastCheck: Date;
}

const SystemStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>({
    overall: 'healthy',
    database: 'healthy',
    auth: 'healthy',
    lastCheck: new Date()
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkSystemStatus = async () => {
    setIsChecking(true);
    
    const newStatus: SystemStatus = {
      overall: 'healthy',
      database: 'healthy',
      auth: 'healthy',
      lastCheck: new Date()
    };

    // Check database connectivity
    try {
      const { error } = await supabase.from('user_profiles').select('id').limit(1);
      newStatus.database = error ? 'error' : 'healthy';
    } catch (error) {
      newStatus.database = 'error';
    }

    // Check authentication service
    try {
      const { error } = await supabase.auth.getSession();
      newStatus.auth = error ? 'warning' : 'healthy';
    } catch (error) {
      newStatus.auth = 'error';
    }

    // Determine overall status
    if (newStatus.database === 'error' || newStatus.auth === 'error') {
      newStatus.overall = 'error';
    } else if (newStatus.database === 'warning' || newStatus.auth === 'warning') {
      newStatus.overall = 'warning';
    } else {
      newStatus.overall = 'healthy';
    }

    setStatus(newStatus);
    setIsChecking(false);
  };

  useEffect(() => {
    checkSystemStatus();
    
    // Check status every 2 minutes
    const interval = setInterval(checkSystemStatus, 120000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (statusType: 'healthy' | 'warning' | 'error') => {
    switch (statusType) {
      case 'healthy':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (statusType: 'healthy' | 'warning' | 'error') => {
    switch (statusType) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (statusType: 'healthy' | 'warning' | 'error') => {
    switch (statusType) {
      case 'healthy':
        return 'System Healthy';
      case 'warning':
        return 'System Warning';
      case 'error':
        return 'System Error';
      default:
        return 'System Status';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2">
          <Activity className="h-4 w-4" />
          <Badge 
            variant="outline" 
            className={`text-xs ${getStatusColor(status.overall)}`}
          >
            {getStatusIcon(status.overall)}
            {getStatusText(status.overall)}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">System Status</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkSystemStatus}
              disabled={isChecking}
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Database</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.database)}
                <span className="text-xs capitalize">{status.database}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Authentication</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.auth)}
                <span className="text-xs capitalize">{status.auth}</span>
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Last checked:</span>
              <span>{status.lastCheck.toLocaleTimeString()}</span>
            </div>
          </div>
          
          {status.overall !== 'healthy' && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.location.href = '/admin/server-diagnostics'}
              >
                View Diagnostics
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SystemStatusIndicator;