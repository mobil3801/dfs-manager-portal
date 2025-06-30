import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, User, Lock } from 'lucide-react';

const LoginTestComponent: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const [isTestingLogin, setIsTestingLogin] = useState(false);
  const { user, userProfile, isAuthenticated, login, logout } = useAuth();
  const { toast } = useToast();

  const runLoginTest = async () => {
    if (!testEmail || !testPassword) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both email and password for testing",
        variant: "destructive"
      });
      return;
    }

    setIsTestingLogin(true);
    setTestResults(null);

    try {
      console.log('🧪 Starting login test for:', testEmail);
      
      // Clear any existing session first
      await logout();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get initial state
      const beforeLogin = {
        user: user,
        profile: userProfile,
        authenticated: isAuthenticated
      };

      // Attempt login
      const loginSuccess = await login(testEmail, testPassword);
      
      // Small delay to let state update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get post-login state
      const afterLogin = {
        user: user,
        profile: userProfile,
        authenticated: isAuthenticated
      };

      // Test API responses directly
      const directUserResponse = await window.ezsite.apis.getUserInfo();
      
      let directProfileResponse = null;
      if (directUserResponse.data?.ID) {
        directProfileResponse = await window.ezsite.apis.tablePage(11725, {
          PageNo: 1,
          PageSize: 1,
          Filters: [
            { name: "user_id", op: "Equal", value: directUserResponse.data.ID }
          ]
        });
      }

      const results = {
        timestamp: new Date().toISOString(),
        testEmail,
        loginAttempt: {
          success: loginSuccess,
          error: null
        },
        beforeLogin,
        afterLogin,
        directApiResponses: {
          user: directUserResponse,
          profile: directProfileResponse
        },
        consistencyCheck: {
          userIdMatch: afterLogin.user?.ID === directUserResponse.data?.ID,
          profileUserIdMatch: afterLogin.profile?.user_id === directUserResponse.data?.ID,
          emailMatch: afterLogin.user?.Email === testEmail
        }
      };

      console.log('🧪 Login test results:', results);
      setTestResults(results);

      if (loginSuccess) {
        toast({
          title: "Login Test Successful",
          description: "Login completed - check results below"
        });
      } else {
        toast({
          title: "Login Test Failed",
          description: "Login was not successful",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('🧪 Login test error:', error);
      setTestResults({
        timestamp: new Date().toISOString(),
        testEmail,
        error: error instanceof Error ? error.message : String(error)
      });
      toast({
        title: "Login Test Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsTestingLogin(false);
    }
  };

  const clearTestResults = () => {
    setTestResults(null);
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <User className="h-5 w-5" />
          Login Test Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Auth Status */}
        <div className="p-3 bg-white rounded border">
          <h4 className="font-semibold text-sm mb-2">Current Authentication Status:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Authenticated: <Badge variant={isAuthenticated ? "default" : "destructive"}>
              {isAuthenticated ? "Yes" : "No"}
            </Badge></div>
            <div>User Email: <span className="font-mono">{user?.Email || 'None'}</span></div>
            <div>User ID: <span className="font-mono">{user?.ID || 'None'}</span></div>
            <div>Profile Role: <span className="font-mono">{userProfile?.role || 'None'}</span></div>
          </div>
        </div>

        {/* Test Form */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="test-email" className="text-sm">Test Email:</Label>
            <Input
              id="test-email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter email to test login"
              className="text-sm"
            />
          </div>
          <div>
            <Label htmlFor="test-password" className="text-sm">Test Password:</Label>
            <Input
              id="test-password"
              type="password"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              placeholder="Enter password to test login"
              className="text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={runLoginTest}
              disabled={isTestingLogin}
              size="sm"
            >
              <Lock className="h-4 w-4 mr-2" />
              {isTestingLogin ? 'Testing...' : 'Test Login'}
            </Button>
            {testResults && (
              <Button 
                onClick={clearTestResults}
                size="sm"
                variant="ghost"
              >
                Clear Results
              </Button>
            )}
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Test Results:</h4>
            
            {testResults.error ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Test Error: {testResults.error}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {/* Login Success Status */}
                <div className={`p-3 rounded border ${testResults.loginAttempt?.success ? 
                  'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    {testResults.loginAttempt?.success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    Login {testResults.loginAttempt?.success ? 'Successful' : 'Failed'}
                  </div>
                </div>

                {/* Consistency Check */}
                {testResults.consistencyCheck && (
                  <div className="p-3 bg-white rounded border">
                    <h5 className="font-medium text-xs mb-2">Data Consistency Check:</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        {testResults.consistencyCheck.userIdMatch ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-red-600" />
                        )}
                        User ID Match: {testResults.consistencyCheck.userIdMatch ? 'PASS' : 'FAIL'}
                      </div>
                      <div className="flex items-center gap-2">
                        {testResults.consistencyCheck.profileUserIdMatch ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-red-600" />
                        )}
                        Profile User ID Match: {testResults.consistencyCheck.profileUserIdMatch ? 'PASS' : 'FAIL'}
                      </div>
                      <div className="flex items-center gap-2">
                        {testResults.consistencyCheck.emailMatch ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-red-600" />
                        )}
                        Email Match: {testResults.consistencyCheck.emailMatch ? 'PASS' : 'FAIL'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Results */}
                <div className="p-3 bg-white rounded border">
                  <h5 className="font-medium text-xs mb-2">Detailed Results:</h5>
                  <div className="text-xs">
                    <pre className="whitespace-pre-wrap overflow-auto max-h-64 bg-gray-50 p-2 rounded">
                      {JSON.stringify(testResults, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Issue Detection */}
                {!testResults.consistencyCheck?.userIdMatch || 
                 !testResults.consistencyCheck?.profileUserIdMatch || 
                 !testResults.consistencyCheck?.emailMatch ? (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>AUTHENTICATION BUG DETECTED!</strong> The user data is inconsistent. 
                      Context data doesn't match API responses, indicating the authentication system 
                      is not correctly identifying users.
                    </AlertDescription>
                  </Alert>
                ) : testResults.loginAttempt?.success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Authentication working correctly! All data is consistent.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoginTestComponent;