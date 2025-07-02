import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Activity,
  Clock,
  Shield,
  Server,
  Wifi,
  WifiOff
} from 'lucide-react';

const AuthStatusDashboard: React.FC = () => {
  const { 
    serviceStatus, 
    isAuthenticated, 
    user, 
    isLoading,
    authError,
    checkServiceHealth,
    restartAuthService 
  } = useEnhancedAuth();

  const [isChecking, setIsChecking] = useState(false);
  const [lastManualCheck, setLastManualCheck] = useState<Date | null>(null);
  const [uptimeProgress, setUptimeProgress] = useState(100);

  useEffect(() => {
    if (serviceStatus) {
      // Calculate uptime percentage based on consecutive failures
      const maxFailures = 10;
      const failures = Math.min(serviceStatus.consecutiveFailures, maxFailures);
      const uptime = ((maxFailures - failures) / maxFailures) * 100;
      setUptimeProgress(uptime);
    }
  }, [serviceStatus]);

  const handleManualHealthCheck = async () => {
    setIsChecking(true);
    try {
      await checkServiceHealth();
      setLastManualCheck(new Date());
    } catch (error) {
      console.error('Manual health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRestartService = async () => {
    if (confirm('Are you sure you want to restart the authentication service? This may temporarily interrupt service.')) {
      await restartAuthService();
    }
  };

  const getStatusIcon = (isHealthy: boolean) => {
    if (isHealthy) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = (isHealthy: boolean) => {
    if (isHealthy) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
    }
    return <Badge variant="destructive">Unhealthy</Badge>;
  };

  const formatResponseTime = (responseTime: number) => {
    if (responseTime < 1000) {
      return `${responseTime}ms`;
    }
    return `${(responseTime / 1000).toFixed(2)}s`;
  };

  const formatLastCheck = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds} seconds ago`;
    }
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours} hours ago`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication Service Status
          </CardTitle>
          <CardDescription>
            Monitor the health and availability of the authentication system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Service Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Service Status</span>
              </div>
              <div className="flex items-center gap-2">
                {serviceStatus ? getStatusIcon(serviceStatus.isHealthy) : <Activity className="h-4 w-4 text-gray-400" />}
                {serviceStatus ? getStatusBadge(serviceStatus.isHealthy) : <Badge variant="secondary">Unknown</Badge>}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Response Time</span>
              </div>
              <Badge variant="outline">
                {serviceStatus?.responseTime ? formatResponseTime(serviceStatus.responseTime) : 'N/A'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Last Check</span>
              </div>
              <Badge variant="outline">
                {serviceStatus?.lastCheck ? formatLastCheck(serviceStatus.lastCheck) : 'Never'}
              </Badge>
            </div>
          </div>

          {/* Uptime Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Service Reliability</span>
              <span className="text-sm text-gray-600">{uptimeProgress.toFixed(1)}%</span>
            </div>
            <Progress value={uptimeProgress} className="h-2" />
            {serviceStatus?.consecutiveFailures > 0 && (
              <p className="text-xs text-red-600">
                {serviceStatus.consecutiveFailures} consecutive failures detected
              </p>
            )}
          </div>

          {/* Authentication Status */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              {isAuthenticated ? <Wifi className="h-4 w-4 text-blue-600" /> : <WifiOff className="h-4 w-4 text-gray-400" />}
              <span className="text-sm font-medium">User Authentication</span>
            </div>
            <div className="text-right">
              {isAuthenticated ? (
                <div>
                  <Badge className="bg-blue-100 text-blue-800">Authenticated</Badge>
                  <p className="text-xs text-gray-600 mt-1">{user?.Email}</p>
                </div>
              ) : (
                <Badge variant="secondary">Not Authenticated</Badge>
              )}
            </div>
          </div>

          {/* Error Display */}
          {authError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {authError}
              </AlertDescription>
            </Alert>
          )}

          {serviceStatus?.error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Service Error: {serviceStatus.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleManualHealthCheck} 
              disabled={isChecking || isLoading}
              variant="outline"
              size="sm"
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Activity className="h-4 w-4 mr-2" />
              )}
              Check Health
            </Button>

            <Button 
              onClick={handleRestartService}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="text-orange-600 hover:text-orange-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart Service
            </Button>
          </div>

          {lastManualCheck && (
            <p className="text-xs text-gray-500">
              Last manual check: {formatLastCheck(lastManualCheck)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Detailed Service Information */}
      {serviceStatus?.details && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
              {JSON.stringify(serviceStatus.details, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuthStatusDashboard;
