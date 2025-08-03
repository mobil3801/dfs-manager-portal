import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, Database, User, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const SimpleAuthTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [authResult, setAuthResult] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('testing');

    try {
      // Test basic connection by trying to get session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setConnectionStatus('error');
        toast({
          title: "Connection Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setConnectionStatus('success');
        setSession(data.session);
        toast({
          title: "Connection Successful",
          description: "Supabase is connected and working properly"
        });
      }
    } catch (error: any) {
      setConnectionStatus('error');
      toast({
        title: "Connection Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setAuthResult({ success: false, error: error.message });
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setAuthResult({ success: true, user: data.user });
        setSession(data.session);
        toast({
          title: "Login Successful",
          description: "Successfully authenticated with Supabase"
        });
      }
    } catch (error: any) {
      setAuthResult({ success: false, error: error.message });
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSignOut = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setAuthResult(null);
        setSession(null);
        toast({
          title: "Signed Out",
          description: "Successfully signed out"
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Authentication Test
          </CardTitle>
          <CardDescription>
            Test Supabase connection and authentication functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="space-y-3">
            <h3 className="font-medium">Connection Status</h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {connectionStatus === 'testing' && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                {connectionStatus === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                {connectionStatus === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                <span>Supabase Connection</span>
              </div>
              <Badge variant={
              connectionStatus === 'success' ? 'default' :
              connectionStatus === 'error' ? 'destructive' : 'secondary'
              }>
                {connectionStatus === 'testing' ? 'Testing...' :
                connectionStatus === 'success' ? 'Connected' : 'Failed'}
              </Badge>
            </div>
            
            <Button
              onClick={testConnection}
              disabled={isLoading}
              variant="outline"
              className="w-full">

              {isLoading ?
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </> :

              'Test Connection Again'
              }
            </Button>
          </div>

          {/* Current Session */}
          {session &&
          <div className="space-y-3">
              <h3 className="font-medium">Current Session</h3>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Authenticated</span>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>User ID:</strong> {session.user?.id}</p>
                  <p><strong>Email:</strong> {session.user?.email}</p>
                  <p><strong>Token Type:</strong> {session.token_type}</p>
                  {session.expires_at &&
                <p><strong>Expires:</strong> {new Date(session.expires_at * 1000).toLocaleString()}</p>
                }
                </div>
              </div>
            </div>
          }

          {/* Authentication Test */}
          <div className="space-y-4">
            <h3 className="font-medium">Test Authentication</h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="test@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading} />

              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading} />

              </div>

              <div className="flex gap-2">
                <Button
                  onClick={testLogin}
                  disabled={isLoading || !email || !password}
                  className="flex-1">

                  <User className="mr-2 h-4 w-4" />
                  Test Sign In
                </Button>

                {session &&
                <Button
                  onClick={testSignOut}
                  disabled={isLoading}
                  variant="outline">

                    <Lock className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                }
              </div>
            </div>

            {/* Auth Result */}
            {authResult &&
            <Alert className={authResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {authResult.success ?
              <CheckCircle2 className="h-4 w-4 text-green-600" /> :

              <XCircle className="h-4 w-4 text-red-600" />
              }
                <AlertDescription>
                  {authResult.success ?
                <div>
                      <strong>Authentication Successful!</strong>
                      <div className="mt-1 text-sm">
                        User: {authResult.user?.email}
                      </div>
                    </div> :

                <div>
                      <strong>Authentication Failed:</strong>
                      <div className="mt-1 text-sm">{authResult.error}</div>
                    </div>
                }
                </AlertDescription>
              </Alert>
            }
          </div>

          {/* Help Information */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">How to Test</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>1. First, check that the connection status shows "Connected"</p>
              <p>2. To test authentication, you'll need valid Supabase user credentials</p>
              <p>3. You can create a test account by going to the main login page and registering</p>
              <p>4. Once signed in, you can test the sign out functionality</p>
            </div>
          </div>

          {/* Configuration Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Supabase Configuration</h4>
            <div className="text-sm space-y-1">
              <p><strong>URL:</strong> {supabase.supabaseUrl}</p>
              <p><strong>Status:</strong> Using custom client implementation</p>
              <p><strong>Auth Redirect:</strong> {window.location.origin}/onauthsuccess</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default SimpleAuthTest;