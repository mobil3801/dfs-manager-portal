import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Shield, 
  Clock, 
  AlertCircle,
  TestTube,
  LogIn,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthenticationTest: React.FC = () => {
  const { 
    user, 
    userProfile, 
    isAuthenticated, 
    isLoading, 
    authError,
    login, 
    logout,
    isAdmin,
    isManager,
    hasPermission
  } = useAuth();
  
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const runLoginTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      console.log('🧪 Running authentication test...');
      const result = await login(testEmail, testPassword);
      
      if (result) {
        setTestResult('success');
        toast({
          title: "Test Successful",
          description: "Authentication system is working correctly!"
        });
      } else {
        setTestResult('failed');
        toast({
          title: "Test Failed", 
          description: "Login test failed - check credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Test error:', error);
      setTestResult('error');
      toast({
        title: "Test Error",
        description: "An error occurred during testing",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const runLogoutTest = async () => {
    setTesting(true);
    try {
      await logout();
      setTestResult('logout_success');
      toast({
        title: "Logout Successful",
        description: "User logged out successfully"
      });
    } catch (error) {
      console.error('Logout test error:', error);
      toast({
        title: "Logout Test Failed",
        description: "An error occurred during logout test",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusBadge = (condition: boolean, trueText: string, falseText: string) => (
    <Badge variant={condition ? "default" : "secondary"} className="flex items-center gap-1">
      {condition ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {condition ? trueText : falseText}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Authentication Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-600" />
            Authentication Status
          </CardTitle>
          <CardDescription>
            Current authentication state and system health
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Authentication State</Label>
              {getStatusBadge(isAuthenticated, "Authenticated", "Not Authenticated")}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Loading State</Label>
              {getStatusBadge(!isLoading, "Ready", "Loading")}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Error State</Label>
              {getStatusBadge(!authError, "No Errors", "Has Errors")}
            </div>
          </div>

          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* User Information */}
      {isAuthenticated && user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-brand-600" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">User ID</Label>
                <p className="text-sm text-gray-600">{user.ID}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm text-gray-600">{user.Name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-gray-600">{user.Email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm text-gray-600">
                  {new Date(user.CreateTime).toLocaleDateString()}
                </p>
              </div>
            </div>

            {userProfile && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Role</Label>
                    <p className="text-sm text-gray-600">{userProfile.role}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Station</Label>
                    <p className="text-sm text-gray-600">{userProfile.station}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Active</Label>
                    {getStatusBadge(userProfile.is_active, "Active", "Inactive")}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Admin Access</Label>
                    {getStatusBadge(isAdmin(), "Admin", "Regular User")}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Permission Testing */}
      {isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand-600" />
              Permission Testing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Admin Access</Label>
                {getStatusBadge(isAdmin(), "Has Admin Access", "No Admin Access")}
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Manager Access</Label>
                {getStatusBadge(isManager(), "Has Manager Access", "No Manager Access")}
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">View Permission</Label>
                {getStatusBadge(hasPermission('view'), "Can View", "Cannot View")}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Authentication Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-brand-600" />
            Authentication Testing
          </CardTitle>
          <CardDescription>
            Test login and logout functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAuthenticated ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testEmail">Test Email</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="testPassword">Test Password</Label>
                  <Input
                    id="testPassword"
                    type="password"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    placeholder="password123"
                  />
                </div>
              </div>
              
              <Button 
                onClick={runLoginTest}
                disabled={testing || isLoading}
                className="w-full bg-brand-600 hover:bg-brand-700"
              >
                <LogIn className="h-4 w-4 mr-2" />
                {testing ? 'Testing Login...' : 'Test Login'}
              </Button>
            </div>
          ) : (
            <Button 
              onClick={runLogoutTest}
              disabled={testing}
              variant="outline"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {testing ? 'Testing Logout...' : 'Test Logout'}
            </Button>
          )}

          {testResult && (
            <Alert variant={testResult.includes('success') ? "default" : "destructive"}>
              {testResult.includes('success') ? 
                <CheckCircle className="h-4 w-4" /> : 
                <XCircle className="h-4 w-4" />
              }
              <AlertDescription>
                {testResult === 'success' && 'Login test completed successfully!'}
                {testResult === 'failed' && 'Login test failed - check credentials or system status'}
                {testResult === 'error' && 'Login test encountered an error'}
                {testResult === 'logout_success' && 'Logout test completed successfully!'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-600" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="font-medium">Environment</Label>
              <p className="text-gray-600">{process.env.NODE_ENV || 'development'}</p>
            </div>
            <div>
              <Label className="font-medium">API Status</Label>
              <Badge variant={window.ezsite?.apis ? "default" : "destructive"}>
                {window.ezsite?.apis ? "Available" : "Not Available"}
              </Badge>
            </div>
            <div>
              <Label className="font-medium">Current Time</Label>
              <p className="text-gray-600">{new Date().toLocaleString()}</p>
            </div>
            <div>
              <Label className="font-medium">User Agent</Label>
              <p className="text-gray-600 text-xs">{navigator.userAgent.substring(0, 50)}...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthenticationTest;