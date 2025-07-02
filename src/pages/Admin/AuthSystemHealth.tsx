import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import AuthStatusDashboard from '@/components/AuthStatusDashboard';
import {
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  BarChart3,
  Clock,
  Server,
  Users,
  Eye,
  EyeOff } from
'lucide-react';

const AuthSystemHealthPage: React.FC = () => {
  const {
    isAuthenticated,
    user,
    userProfile,
    serviceStatus,
    authError,
    checkServiceHealth,
    restartAuthService,
    isLoading
  } = useEnhancedAuth();

  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);

  useEffect(() => {
    // Simulate system logs - in a real app, this would come from your logging service
    const mockLogs = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 300000),
      level: 'INFO',
      message: 'Authentication service started successfully',
      source: 'AuthService'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 120000),
      level: 'WARN',
      message: 'High response time detected: 2.5s',
      source: 'HealthMonitor'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 60000),
      level: 'INFO',
      message: 'User authentication successful',
      source: 'AuthService'
    }];

    setSystemLogs(mockLogs);
  }, []);

  const getSystemOverview = () => {
    const isHealthy = serviceStatus?.isHealthy ?? false;
    const responseTime = serviceStatus?.responseTime ?? 0;
    const consecutiveFailures = serviceStatus?.consecutiveFailures ?? 0;

    return {
      status: isHealthy ? 'Healthy' : 'Unhealthy',
      statusColor: isHealthy ? 'text-green-600' : 'text-red-600',
      uptime: Math.max(0, 100 - consecutiveFailures * 10),
      responseTime: responseTime < 1000 ? 'Good' : responseTime < 3000 ? 'Fair' : 'Poor',
      responseTimeColor: responseTime < 1000 ? 'text-green-600' : responseTime < 3000 ? 'text-yellow-600' : 'text-red-600'
    };
  };

  const systemOverview = getSystemOverview();

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString();
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'ERROR':
        return <Badge variant="destructive">ERROR</Badge>;
      case 'WARN':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">WARN</Badge>;
      case 'INFO':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">INFO</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Authentication System Health</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage the authentication service status and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}>

            {showTechnicalDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            Technical Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRealTimeMonitoring(!realTimeMonitoring)}>

            <Activity className="h-4 w-4 mr-2" />
            {realTimeMonitoring ? 'Disable' : 'Enable'} Real-time
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className={`text-lg font-bold ${systemOverview.statusColor}`}>
                  {systemOverview.status}
                </p>
              </div>
              <Shield className={`h-8 w-8 ${systemOverview.statusColor}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-lg font-bold text-blue-600">
                  {systemOverview.uptime.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className={`text-lg font-bold ${systemOverview.responseTimeColor}`}>
                  {systemOverview.responseTime}
                </p>
              </div>
              <Clock className={`h-8 w-8 ${systemOverview.responseTimeColor}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-lg font-bold text-purple-600">
                  {isAuthenticated ? '1' : '0'}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alerts */}
      {authError &&
      <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Authentication Error:</strong> {authError}
          </AlertDescription>
        </Alert>
      }

      {serviceStatus && !serviceStatus.isHealthy &&
      <Alert variant="destructive">
          <Server className="h-4 w-4" />
          <AlertDescription>
            <strong>Service Health Issue:</strong> {serviceStatus.error}
            {serviceStatus.consecutiveFailures > 0 &&
          <span className="ml-2">
                ({serviceStatus.consecutiveFailures} consecutive failures)
              </span>
          }
          </AlertDescription>
        </Alert>
      }

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Service Dashboard</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="user-info">User Information</TabsTrigger>
          <TabsTrigger value="controls">System Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <AuthStatusDashboard />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Logs
                {realTimeMonitoring &&
                <Badge variant="default" className="bg-green-100 text-green-800">
                    Live
                  </Badge>
                }
              </CardTitle>
              <CardDescription>
                Recent authentication system events and status changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {systemLogs.map((log) =>
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getLevelBadge(log.level)}
                      <div>
                        <p className="text-sm font-medium">{log.message}</p>
                        <p className="text-xs text-gray-500">
                          {log.source} • {formatTimestamp(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current User Information</CardTitle>
              <CardDescription>
                Details about the currently authenticated user session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAuthenticated ?
              <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <Badge className="bg-green-100 text-green-800">Authenticated</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">User Details</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>ID:</strong> {user?.ID}</p>
                        <p><strong>Email:</strong> {user?.Email}</p>
                        <p><strong>Name:</strong> {user?.Name}</p>
                        <p><strong>Created:</strong> {user?.CreateTime}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold">Profile Details</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Role:</strong> {userProfile?.role}</p>
                        <p><strong>Station:</strong> {userProfile?.station}</p>
                        <p><strong>Employee ID:</strong> {userProfile?.employee_id}</p>
                        <p><strong>Active:</strong> {userProfile?.is_active ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div> :

              <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No user currently authenticated</p>
                </div>
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Controls
              </CardTitle>
              <CardDescription>
                Administrative controls for the authentication system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={checkServiceHealth}
                  disabled={isLoading}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center">

                  <Activity className="h-6 w-6 mb-2" />
                  Run Health Check
                </Button>

                <Button
                  onClick={restartAuthService}
                  disabled={isLoading}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center text-orange-600 hover:text-orange-700">

                  <RefreshCw className="h-6 w-6 mb-2" />
                  Restart Service
                </Button>
              </div>

              {showTechnicalDetails &&
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Technical Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Service Status:</strong> {JSON.stringify(serviceStatus, null, 2)}</p>
                    <p><strong>Loading State:</strong> {isLoading ? 'Active' : 'Idle'}</p>
                    <p><strong>Browser:</strong> {navigator.userAgent}</p>
                    <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
                  </div>
                </div>
              }
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

};

export default AuthSystemHealthPage;