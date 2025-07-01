import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Database,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AuthDebugger: React.FC = () => {
  const { user, userProfile, isAuthenticated, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const [showSensitive, setShowSensitive] = useState(false);
  const [authState, setAuthState] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    updateAuthState();
  }, [user, userProfile, isAuthenticated, isAdmin, isLoading]);

  const updateAuthState = () => {
    setAuthState({
      isAuthenticated,
      isAdmin,
      isLoading,
      user: user ? {
        ID: user.ID,
        Name: user.Name,
        Email: user.Email,
        CreateTime: user.CreateTime
      } : null,
      userProfile: userProfile ? {
        user_id: userProfile.user_id,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        role: userProfile.role,
        station: userProfile.station,
        is_active: userProfile.is_active,
        created_at: userProfile.created_at
      } : null,
      timestamp: new Date().toISOString()
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Trigger auth state refresh
      updateAuthState();
      toast({
        title: "Success",
        description: "Auth state refreshed successfully"
      });
    } catch (error) {
      console.error('Error refreshing auth state:', error);
      toast({
        title: "Error",
        description: "Failed to refresh auth state",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const testAuthEndpoint = async () => {
    try {
      const response = await window.ezsite.apis.getUserInfo();
      toast({
        title: "Auth Test",
        description: response.error ? 
          `Error: ${response.error}` : 
          "Authentication endpoint working correctly",
        variant: response.error ? "destructive" : "default"
      });
    } catch (error) {
      toast({
        title: "Auth Test Failed",
        description: "Failed to test authentication endpoint",
        variant: "destructive"
      });
    }
  };

  const getAuthStatus = () => {
    if (isLoading) return { status: 'loading', color: 'bg-yellow-500', text: 'Loading' };
    if (!isAuthenticated) return { status: 'unauthenticated', color: 'bg-red-500', text: 'Not Authenticated' };
    if (isAdmin) return { status: 'admin', color: 'bg-green-500', text: 'Admin' };
    return { status: 'authenticated', color: 'bg-blue-500', text: 'Authenticated' };
  };

  const authStatus = getAuthStatus();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <CardTitle>Authentication Debugger</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${authStatus.color}`}></div>
            <Badge variant="outline">{authStatus.text}</Badge>
          </div>
        </div>
        <CardDescription>
          Debug and monitor authentication state and user permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auth Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong>Status:</strong> {authStatus.text}
            </AlertDescription>
          </Alert>
          
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Last Updated:</strong> {authState?.timestamp ? 
                new Date(authState.timestamp).toLocaleTimeString() : 'Unknown'}
            </AlertDescription>
          </Alert>
        </div>

        {/* User Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">User Information</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSensitive(!showSensitive)}
            >
              {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showSensitive ? 'Hide' : 'Show'} Details
            </Button>
          </div>

          {showSensitive && authState && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs overflow-auto max-h-64">
                {JSON.stringify(authState, null, 2)}
              </pre>
            </div>
          )}

          {!showSensitive && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>User ID:</strong> {user?.ID || 'Not available'}
                </div>
                <div className="text-sm">
                  <strong>Email:</strong> {user?.Email || 'Not available'}
                </div>
                <div className="text-sm">
                  <strong>Name:</strong> {user?.Name || 'Not available'}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Profile Role:</strong> {userProfile?.role || 'Not available'}
                </div>
                <div className="text-sm">
                  <strong>Station:</strong> {userProfile?.station || 'Not available'}
                </div>
                <div className="text-sm">
                  <strong>Active:</strong> {userProfile?.is_active ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh State</span>
          </Button>

          <Button
            onClick={testAuthEndpoint}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Database className="w-4 h-4" />
            <span>Test Auth API</span>
          </Button>
        </div>

        {/* Warnings */}
        {!isAuthenticated && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              User is not authenticated. This may indicate a session issue.
            </AlertDescription>
          </Alert>
        )}

        {isAuthenticated && !userProfile && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              User is authenticated but profile is missing. Check user profile data.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDebugger;