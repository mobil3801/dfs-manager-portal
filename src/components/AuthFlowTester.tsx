
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuthTestingGuide from '@/components/AuthTestingGuide';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  User,
  LogIn,
  LogOut,
  Shield,
  Clock,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff } from
'lucide-react';
import { supabase } from '@/lib/supabase'; // Use EasySite-compatible client

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  timestamp: Date;
}

interface AuthState {
  user: any;
  session: any;
  isLoading: boolean;
}

const AuthFlowTester: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true
  });
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [signupCredentials, setSignupCredentials] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();

      setAuthState({
        user,
        session,
        isLoading: false
      });

      addTestResult('Initial Session Check',
      session ? 'success' : 'warning',
      session ? `User logged in: ${user?.email}` : 'No active session found'
      );
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session);

        setAuthState((prev) => ({
          ...prev,
          user: session?.user || null,
          session,
          isLoading: false
        }));

        addTestResult('Auth State Change', 'success',
        `Event: ${event}, User: ${session?.user?.email || 'None'}`
        );
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const addTestResult = (name: string, status: TestResult['status'], message: string) => {
    const result: TestResult = {
      name,
      status,
      message,
      timestamp: new Date()
    };

    setTestResults((prev) => [result, ...prev.slice(0, 19)]); // Keep last 20 results

    if (status === 'error') {
      toast.error(`${name}: ${message}`);
    } else if (status === 'success') {
      toast.success(`${name}: ${message}`);
    }
  };

  // Login Tests
  const testLogin = async () => {
    if (!loginCredentials.email || !loginCredentials.password) {
      addTestResult('Login Test', 'error', 'Email and password required');
      return;
    }

    try {
      addTestResult('Login Test', 'pending', 'Attempting login...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginCredentials.email,
        password: loginCredentials.password
      });

      if (error) {
        addTestResult('Login Test', 'error', error.message);
      } else if (data.user) {
        addTestResult('Login Test', 'success',
        `Successfully logged in as ${data.user.email}`
        );
      }
    } catch (error: any) {
      addTestResult('Login Test', 'error', error.message);
    }
  };

  const testInvalidLogin = async () => {
    try {
      addTestResult('Invalid Login Test', 'pending', 'Testing invalid credentials...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });

      if (error) {
        addTestResult('Invalid Login Test', 'success',
        `Correctly rejected invalid login: ${error.message}`
        );
      } else {
        addTestResult('Invalid Login Test', 'warning',
        'Invalid login was accepted - check auth configuration'
        );
      }
    } catch (error: any) {
      addTestResult('Invalid Login Test', 'success',
      `Login properly failed: ${error.message}`
      );
    }
  };

  // Logout Tests
  const testLogout = async () => {
    try {
      addTestResult('Logout Test', 'pending', 'Attempting logout...');

      const { error } = await supabase.auth.signOut();

      if (error) {
        addTestResult('Logout Test', 'error', error.message);
      } else {
        addTestResult('Logout Test', 'success', 'Successfully logged out');
      }
    } catch (error: any) {
      addTestResult('Logout Test', 'error', error.message);
    }
  };

  // Session Tests
  const testSessionRetrieval = async () => {
    try {
      addTestResult('Session Retrieval', 'pending', 'Getting current session...');

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        addTestResult('Session Retrieval', 'error', error.message);
      } else if (session) {
        addTestResult('Session Retrieval', 'success',
        `Session active, expires: ${new Date(session.expires_at! * 1000).toLocaleString()}`
        );
      } else {
        addTestResult('Session Retrieval', 'warning', 'No active session');
      }
    } catch (error: any) {
      addTestResult('Session Retrieval', 'error', error.message);
    }
  };

  const testSessionRefresh = async () => {
    try {
      addTestResult('Session Refresh', 'pending', 'Refreshing session...');

      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        addTestResult('Session Refresh', 'error', error.message);
      } else if (data.session) {
        addTestResult('Session Refresh', 'success',
        `Session refreshed successfully`
        );
      } else {
        addTestResult('Session Refresh', 'warning', 'No session to refresh');
      }
    } catch (error: any) {
      addTestResult('Session Refresh', 'error', error.message);
    }
  };

  // User Tests
  const testUserRetrieval = async () => {
    try {
      addTestResult('User Retrieval', 'pending', 'Getting current user...');

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        addTestResult('User Retrieval', 'error', error.message);
      } else if (user) {
        addTestResult('User Retrieval', 'success',
        `User: ${user.email}, ID: ${user.id}`
        );
      } else {
        addTestResult('User Retrieval', 'warning', 'No authenticated user');
      }
    } catch (error: any) {
      addTestResult('User Retrieval', 'error', error.message);
    }
  };

  // Signup Test
  const testSignup = async () => {
    if (!signupCredentials.email || !signupCredentials.password) {
      addTestResult('Signup Test', 'error', 'Email and password required');
      return;
    }

    if (signupCredentials.password !== signupCredentials.confirmPassword) {
      addTestResult('Signup Test', 'error', 'Passwords do not match');
      return;
    }

    try {
      addTestResult('Signup Test', 'pending', 'Attempting signup...');

      const { data, error } = await supabase.auth.signUp({
        email: signupCredentials.email,
        password: signupCredentials.password
      });

      if (error) {
        addTestResult('Signup Test', 'error', error.message);
      } else if (data.user) {
        addTestResult('Signup Test', 'success',
        `Signup successful for ${data.user.email}. Check email for verification.`
        );
      }
    } catch (error: any) {
      addTestResult('Signup Test', 'error', error.message);
    }
  };

  // Run All Tests
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    const tests = [
    testSessionRetrieval,
    testUserRetrieval,
    testInvalidLogin,
    testSessionRefresh];


    for (const test of tests) {
      await test();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay between tests
    }

    setIsRunningTests(false);
    addTestResult('Test Suite', 'success', 'All automated tests completed');
  };

  const clearResults = () => {
    setTestResults([]);
    toast.success('Test results cleared');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    } as const;

    return (
      <Badge variant={variants[status]} className="text-xs">
        {status.toUpperCase()}
      </Badge>);

  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Authentication Flow Tester</h1>
          <p className="text-muted-foreground">
            Test login, logout, and session management functionality
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runAllTests}
            disabled={isRunningTests}
            className="flex items-center gap-2">

            {isRunningTests ?
            <RefreshCw className="h-4 w-4 animate-spin" /> :

            <Shield className="h-4 w-4" />
            }
            Run All Tests
          </Button>
          <Button variant="outline" onClick={clearResults}>
            Clear Results
          </Button>
        </div>
      </div>

      {/* Current Auth State */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current Authentication State
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>User Status</Label>
              <div className="flex items-center gap-2">
                {authState.isLoading ?
                <RefreshCw className="h-4 w-4 animate-spin" /> :
                authState.user ?
                <CheckCircle className="h-4 w-4 text-green-500" /> :

                <XCircle className="h-4 w-4 text-red-500" />
                }
                <span>
                  {authState.isLoading ? 'Loading...' :
                  authState.user ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>User Email</Label>
              <p className="text-sm">
                {authState.user?.email || 'No user logged in'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Session Status</Label>
              <div className="flex items-center gap-2">
                {authState.session ?
                <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Active</span>
                  </> :

                <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>No Session</span>
                  </>
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manual">Manual Tests</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="guide">Testing Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          {/* Login Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Login Tests
              </CardTitle>
              <CardDescription>
                Test login functionality with valid and invalid credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={loginCredentials.email}
                    onChange={(e) => setLoginCredentials((prev) => ({
                      ...prev,
                      email: e.target.value
                    }))} />

                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={loginCredentials.password}
                      onChange={(e) => setLoginCredentials((prev) => ({
                        ...prev,
                        password: e.target.value
                      }))} />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}>

                      {showPassword ?
                      <EyeOff className="h-4 w-4" /> :

                      <Eye className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={testLogin}>Test Valid Login</Button>
                <Button variant="outline" onClick={testInvalidLogin}>
                  Test Invalid Login
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Signup Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Signup Tests</CardTitle>
              <CardDescription>
                Test user registration functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter email"
                    value={signupCredentials.email}
                    onChange={(e) => setSignupCredentials((prev) => ({
                      ...prev,
                      email: e.target.value
                    }))} />

                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Enter password"
                    value={signupCredentials.password}
                    onChange={(e) => setSignupCredentials((prev) => ({
                      ...prev,
                      password: e.target.value
                    }))} />

                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm password"
                    value={signupCredentials.confirmPassword}
                    onChange={(e) => setSignupCredentials((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))} />

                </div>
              </div>
              
              <Button onClick={testSignup}>Test Signup</Button>
            </CardContent>
          </Card>

          {/* Session & User Tests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Session Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  onClick={testSessionRetrieval}
                  className="w-full">

                  Test Session Retrieval
                </Button>
                <Button
                  variant="outline"
                  onClick={testSessionRefresh}
                  className="w-full">

                  Test Session Refresh
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogOut className="h-5 w-5" />
                  Logout & User Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  onClick={testUserRetrieval}
                  className="w-full">

                  Test User Retrieval
                </Button>
                <Button
                  variant="destructive"
                  onClick={testLogout}
                  className="w-full">

                  Test Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Recent authentication test results and logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ?
              <div className="text-center py-8 text-muted-foreground">
                  No test results yet. Run some tests to see results here.
                </div> :

              <div className="space-y-2 max-h-96 overflow-y-auto">
                  {testResults.map((result, index) =>
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border">

                      {getStatusIcon(result.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {result.name}
                          </span>
                          {getStatusBadge(result.status)}
                        </div>
                        <p className="text-sm text-muted-foreground break-words">
                          {result.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                )}
                </div>
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <AuthTestingGuide />
        </TabsContent>
      </Tabs>
    </div>);

};

export default AuthFlowTester;