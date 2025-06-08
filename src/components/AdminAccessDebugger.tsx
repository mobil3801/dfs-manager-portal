import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Shield, 
  Database, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { toast } from '@/hooks/use-toast';

interface DebugInfo {
  authContext: {
    user: any;
    userProfile: any;
    isAdmin: boolean;
    loading: boolean;
  };
  adminHook: {
    isAdmin: boolean;
    hasAdminAccess: boolean;
    isLoading: boolean;
    debugInfo: any;
  };
  database: {
    userProfiles: any[];
    error: string | null;
  };
}

const AdminAccessDebugger: React.FC = () => {
  const auth = useAuth();
  const adminAccess = useAdminAccess();
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    authContext: {
      user: null,
      userProfile: null,
      isAdmin: false,
      loading: true
    },
    adminHook: {
      isAdmin: false,
      hasAdminAccess: false,
      isLoading: true,
      debugInfo: {}
    },
    database: {
      userProfiles: [],
      error: null
    }
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchDebugInfo = async () => {
    try {
      setRefreshing(true);

      // Get user profiles from database
      const { data, error } = await window.ezsite.apis.tablePage('11725', {
        PageNo: 1,
        PageSize: 10,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: []
      });

      setDebugInfo({
        authContext: {
          user: auth.user,
          userProfile: auth.userProfile,
          isAdmin: auth.isAdmin,
          loading: auth.loading
        },
        adminHook: {
          isAdmin: adminAccess.isAdmin,
          hasAdminAccess: adminAccess.hasAdminAccess,
          isLoading: adminAccess.isLoading,
          debugInfo: adminAccess.debugInfo
        },
        database: {
          userProfiles: data?.List || [],
          error: error || null
        }
      });

      console.log('Debug info updated:', {
        auth: auth,
        adminAccess: adminAccess,
        database: { data, error }
      });

    } catch (err) {
      console.error('Error fetching debug info:', err);
      setDebugInfo(prev => ({
        ...prev,
        database: {
          userProfiles: [],
          error: String(err)
        }
      }));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDebugInfo();
  }, [auth.user, auth.userProfile, auth.isAdmin, auth.loading]);

  const createAdminProfile = async () => {
    if (!auth.user) {
      toast({
        title: "Error",
        description: "No user logged in",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create admin profile
      const adminProfile = {
        user_id: auth.user.ID,
        role: 'Administrator',
        station: 'ALL',
        employee_id: 'ADMIN' + auth.user.ID,
        phone: '',
        hire_date: new Date().toISOString(),
        is_active: true,
        detailed_permissions: JSON.stringify({
          canViewReports: true,
          canEditProducts: true,
          canManageUsers: true,
          canAccessAdmin: true,
          canViewLogs: true
        })
      };

      const { error } = await window.ezsite.apis.tableCreate('11725', adminProfile);

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Success",
        description: "Admin profile created successfully!"
      });

      // Refresh page to update auth context
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error creating admin profile:', error);
      toast({
        title: "Error",
        description: `Failed to create admin profile: ${error}`,
        variant: "destructive"
      });
    }
  };

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return status ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Access Debugger
            <Button
              size="sm"
              variant="outline"
              onClick={fetchDebugInfo}
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Auth Context Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Authentication Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>User Logged In:</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={!!debugInfo.authContext.user} />
                    <Badge variant={debugInfo.authContext.user ? "default" : "destructive"}>
                      {debugInfo.authContext.user ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
                
                {debugInfo.authContext.user && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>Email:</strong> {debugInfo.authContext.user.Email}<br />
                    <strong>ID:</strong> {debugInfo.authContext.user.ID}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span>User Profile:</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={!!debugInfo.authContext.userProfile} />
                    <Badge variant={debugInfo.authContext.userProfile ? "default" : "destructive"}>
                      {debugInfo.authContext.userProfile ? "Found" : "Missing"}
                    </Badge>
                  </div>
                </div>

                {debugInfo.authContext.userProfile && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>Role:</strong> {debugInfo.authContext.userProfile.role}<br />
                    <strong>Station:</strong> {debugInfo.authContext.userProfile.station}<br />
                    <strong>Employee ID:</strong> {debugInfo.authContext.userProfile.employee_id}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span>Is Admin (Context):</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={debugInfo.authContext.isAdmin} />
                    <Badge variant={debugInfo.authContext.isAdmin ? "default" : "destructive"}>
                      {debugInfo.authContext.isAdmin ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Loading:</span>
                  <Badge variant={debugInfo.authContext.loading ? "secondary" : "outline"}>
                    {debugInfo.authContext.loading ? "Yes" : "No"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Admin Hook Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Admin Access Hook
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Is Admin (Hook):</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={debugInfo.adminHook.isAdmin} />
                    <Badge variant={debugInfo.adminHook.isAdmin ? "default" : "destructive"}>
                      {debugInfo.adminHook.isAdmin ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Has Admin Access:</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={debugInfo.adminHook.hasAdminAccess} />
                    <Badge variant={debugInfo.adminHook.hasAdminAccess ? "default" : "destructive"}>
                      {debugInfo.adminHook.hasAdminAccess ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Hook Loading:</span>
                  <Badge variant={debugInfo.adminHook.isLoading ? "secondary" : "outline"}>
                    {debugInfo.adminHook.isLoading ? "Yes" : "No"}
                  </Badge>
                </div>

                {debugInfo.adminHook.debugInfo && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>Hook Debug:</strong><br />
                    User Role: {debugInfo.adminHook.debugInfo.userRole || 'None'}<br />
                    Has User: {debugInfo.adminHook.debugInfo.user ? 'Yes' : 'No'}<br />
                    Has Profile: {debugInfo.adminHook.debugInfo.userProfile ? 'Yes' : 'No'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Database Status */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Database User Profiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {debugInfo.database.error ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      Database Error: {debugInfo.database.error}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Found {debugInfo.database.userProfiles.length} user profiles in database:
                    </p>
                    {debugInfo.database.userProfiles.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {debugInfo.database.userProfiles.map((profile, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                            <strong>ID:</strong> {profile.ID} | 
                            <strong> User ID:</strong> {profile.user_id} | 
                            <strong> Role:</strong> {profile.role} | 
                            <strong> Station:</strong> {profile.station} |
                            <strong> Active:</strong> {profile.is_active ? 'Yes' : 'No'}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <Eye className="w-4 h-4" />
                        <AlertDescription>
                          No user profiles found in database. This might be why admin access is denied.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            {auth.user && !auth.userProfile && (
              <Button onClick={createAdminProfile} className="bg-green-600 hover:bg-green-700">
                Create Admin Profile
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('Full debug info:', debugInfo);
                toast({
                  title: "Debug Info",
                  description: "Check browser console for full debug information"
                });
              }}
            >
              Log to Console
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAccessDebugger;