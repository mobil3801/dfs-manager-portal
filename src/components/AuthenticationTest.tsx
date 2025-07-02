import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { CheckCircle, XCircle, User, Shield, Settings, AlertTriangle } from 'lucide-react';

const AuthenticationTest: React.FC = () => {
  const { user, userProfile, isAuthenticated, login, logout } = useAuth();
  const adminAccess = useAdminAccess();

  const testLogin = async () => {
    try {
      // Test with any valid credentials
      const result = await login('test@example.com', 'password123');
      console.log('Login test result:', result);
    } catch (error) {
      console.error('Login test error:', error);
    }
  };

  const StatusIndicator = ({ condition, label }: { condition: boolean; label: string }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="font-medium">{label}</span>
      <div className="flex items-center space-x-2">
        {condition ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
        <Badge variant={condition ? 'default' : 'secondary'}>
          {condition ? 'Working' : 'Not Working'}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            Authentication System Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Authentication Status */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center">
              <User className="w-5 h-5 mr-2" />
              Authentication Status
            </h3>
            <StatusIndicator condition={isAuthenticated} label="User Authenticated" />
            <StatusIndicator condition={!!user} label="User Data Loaded" />
            <StatusIndicator condition={!!userProfile} label="User Profile Loaded" />
          </div>

          {/* User Information */}
          {user && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">User Information</h3>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div><strong>User ID:</strong> {user.ID}</div>
                <div><strong>Name:</strong> {user.Name}</div>
                <div><strong>Email:</strong> {user.Email}</div>
                <div><strong>Created:</strong> {new Date(user.CreateTime).toLocaleDateString()}</div>
              </div>
            </div>
          )}

          {/* Profile Information */}
          {userProfile && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Profile Information</h3>
              <div className="bg-green-50 p-4 rounded-lg space-y-2">
                <div><strong>Role:</strong> {userProfile.role}</div>
                <div><strong>Station:</strong> {userProfile.station}</div>
                <div><strong>Employee ID:</strong> {userProfile.employee_id}</div>
                <div><strong>Active:</strong> {userProfile.is_active ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}

          {/* Admin Access Test */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Admin Access Test
            </h3>
            <StatusIndicator condition={adminAccess.isAdmin} label="Admin Access" />
            <StatusIndicator condition={adminAccess.isManager} label="Manager Access" />
            <StatusIndicator condition={adminAccess.hasAccess} label="Administrative Access" />
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Is Admin:</strong> {adminAccess.isAdmin ? 'Yes' : 'No'}</div>
                <div><strong>Is Manager:</strong> {adminAccess.isManager ? 'Yes' : 'No'}</div>
                <div><strong>Is Employee:</strong> {adminAccess.isEmployee ? 'Yes' : 'No'}</div>
                <div><strong>Is Guest:</strong> {adminAccess.isGuest ? 'Yes' : 'No'}</div>
                <div><strong>Has Access:</strong> {adminAccess.hasAccess ? 'Yes' : 'No'}</div>
                <div><strong>Loading:</strong> {adminAccess.loading ? 'Yes' : 'No'}</div>
              </div>
              {adminAccess.error && (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700">
                  <strong>Error:</strong> {adminAccess.error}
                </div>
              )}
            </div>
          </div>

          {/* Test Actions */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Test Actions</h3>
            <div className="flex space-x-4">
              {!isAuthenticated ? (
                <Button onClick={testLogin} className="bg-blue-600 hover:bg-blue-700">
                  Test Login
                </Button>
              ) : (
                <Button onClick={logout} variant="outline">
                  Logout
                </Button>
              )}
              <Button onClick={() => window.location.reload()} variant="outline">
                Refresh Page
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2">
              {isAuthenticated && adminAccess.hasAccess ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-lg font-semibold text-green-700">
                    ✅ Authentication & Admin System Working Correctly
                  </span>
                </>
              ) : isAuthenticated ? (
                <>
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  <span className="text-lg font-semibold text-yellow-700">
                    ⚠️ Authenticated but No Admin Access
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-500" />
                  <span className="text-lg font-semibold text-red-700">
                    ❌ Authentication System Issues
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthenticationTest;