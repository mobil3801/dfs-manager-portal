import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, Database, User, Shield, Wifi } from 'lucide-react';
import { supabase, authService } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ConnectionTest {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: string;
}

const SupabaseConnectionTest: React.FC = () => {
  const [tests, setTests] = useState<ConnectionTest[]>([
  { name: 'Supabase Client', status: 'pending', message: 'Initializing...' },
  { name: 'Database Connection', status: 'pending', message: 'Testing...' },
  { name: 'Authentication Service', status: 'pending', message: 'Testing...' },
  { name: 'User Session', status: 'pending', message: 'Checking...' },
  { name: 'Table Access', status: 'pending', message: 'Verifying...' }]
  );

  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const { toast } = useToast();

  const updateTest = (index: number, updates: Partial<ConnectionTest>) => {
    setTests((prev) => prev.map((test, i) =>
    i === index ? { ...test, ...updates } : test
    ));
  };

  const runConnectionTests = async () => {
    setIsRunning(true);
    setOverallStatus('pending');

    try {
      // Test 1: Supabase Client Initialization
      updateTest(0, { status: 'pending', message: 'Checking client initialization...' });

      if (!supabase) {
        updateTest(0, {
          status: 'error',
          message: 'Supabase client not initialized',
          details: 'Check if Supabase URL and key are correct'
        });
        throw new Error('Supabase client not found');
      }

      updateTest(0, {
        status: 'success',
        message: 'Client initialized successfully',
        details: `Connected to: ${supabase.supabaseUrl}`
      });

      // Test 2: Database Connection
      updateTest(1, { status: 'pending', message: 'Testing database connection...' });

      try {
        const { data, error, count } = await supabase.
        from('stations').
        select('*', { count: 'exact', head: true });

        if (error) {
          updateTest(1, {
            status: 'error',
            message: 'Database connection failed',
            details: error.message
          });
        } else {
          updateTest(1, {
            status: 'success',
            message: 'Database connected successfully',
            details: `Can access tables (${count || 0} records)`
          });
        }
      } catch (dbError: any) {
        updateTest(1, {
          status: 'error',
          message: 'Database connection failed',
          details: dbError.message
        });
      }

      // Test 3: Authentication Service
      updateTest(2, { status: 'pending', message: 'Testing auth service...' });

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          updateTest(2, {
            status: 'error',
            message: 'Auth service error',
            details: error.message
          });
        } else {
          updateTest(2, {
            status: 'success',
            message: 'Auth service available',
            details: 'Session check successful'
          });
        }
      } catch (authError: any) {
        updateTest(2, {
          status: 'error',
          message: 'Auth service failed',
          details: authError.message
        });
      }

      // Test 4: User Session
      updateTest(3, { status: 'pending', message: 'Checking user session...' });

      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          updateTest(3, {
            status: 'error',
            message: 'Session check failed',
            details: error.message
          });
        } else if (session) {
          updateTest(3, {
            status: 'success',
            message: 'User is authenticated',
            details: `User ID: ${session.user.id}`
          });
        } else {
          updateTest(3, {
            status: 'success',
            message: 'No active session',
            details: 'User not logged in (this is normal)'
          });
        }
      } catch (sessionError: any) {
        updateTest(3, {
          status: 'error',
          message: 'Session check failed',
          details: sessionError.message
        });
      }

      // Test 5: Table Access
      updateTest(4, { status: 'pending', message: 'Testing table access...' });

      try {
        // Test access to key tables
        const tables = ['stations', 'user_profiles', 'products'];
        const tableResults = [];

        for (const table of tables) {
          try {
            const { data, error } = await supabase.
            from(table).
            select('*').
            limit(1);

            if (error) {
              tableResults.push(`${table}: ❌ ${error.message}`);
            } else {
              tableResults.push(`${table}: ✅ Accessible`);
            }
          } catch (e: any) {
            tableResults.push(`${table}: ❌ ${e.message}`);
          }
        }

        const hasErrors = tableResults.some((result) => result.includes('❌'));

        updateTest(4, {
          status: hasErrors ? 'error' : 'success',
          message: hasErrors ? 'Some tables inaccessible' : 'All tables accessible',
          details: tableResults.join('\n')
        });

      } catch (tableError: any) {
        updateTest(4, {
          status: 'error',
          message: 'Table access test failed',
          details: tableError.message
        });
      }

      // Determine overall status
      const finalTests = tests.map((test, i) => {
        if (i === 0) return { ...test, status: 'success' };
        return test;
      });

      const hasAnyErrors = finalTests.some((test) => test.status === 'error');
      setOverallStatus(hasAnyErrors ? 'error' : 'success');

      if (hasAnyErrors) {
        toast({
          title: "Connection Issues Detected",
          description: "Some Supabase services are not working properly",
          variant: "destructive"
        });
      } else {
        toast({
          title: "All Tests Passed",
          description: "Supabase connection is working properly"
        });
      }

    } catch (error: any) {
      console.error('Connection test failed:', error);
      setOverallStatus('error');
      toast({
        title: "Connection Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const testAuthentication = async () => {
    try {
      // Test with a dummy email - this should fail but show auth is working
      const { error } = await authService.signIn('test@example.com', 'wrongpassword');

      if (error) {
        toast({
          title: "Auth Test Result",
          description: "Authentication service is responding (expected error for test credentials)"
        });
      }
    } catch (error: any) {
      toast({
        title: "Auth Service Available",
        description: "Authentication service is responding"
      });
    }
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runConnectionTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
      default:
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'pending':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Connection Test
          </CardTitle>
          <CardDescription>
            Verify that Supabase is properly configured and connected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Status */}
          <Alert className={getStatusColor(overallStatus)}>
            <Wifi className="h-4 w-4" />
            <AlertDescription>
              <strong>Overall Status: </strong>
              {overallStatus === 'pending' && 'Testing connection...'}
              {overallStatus === 'success' && 'All services are working properly'}
              {overallStatus === 'error' && 'Some services need attention'}
            </AlertDescription>
          </Alert>

          {/* Individual Tests */}
          <div className="space-y-3">
            {tests.map((test, index) =>
            <div key={index} className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h4 className="font-medium">{test.name}</h4>
                      <p className="text-sm text-gray-600">{test.message}</p>
                      {test.details &&
                    <pre className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">
                          {test.details}
                        </pre>
                    }
                    </div>
                  </div>
                  <Badge variant={test.status === 'success' ? 'default' : test.status === 'error' ? 'destructive' : 'secondary'}>
                    {test.status}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={runConnectionTests}
              disabled={isRunning}
              variant="default">

              {isRunning ?
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </> :

              'Run Tests Again'
              }
            </Button>
            
            <Button
              onClick={testAuthentication}
              variant="outline"
              disabled={isRunning}>

              <Shield className="mr-2 h-4 w-4" />
              Test Auth Service
            </Button>
          </div>

          {/* Configuration Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Configuration</h4>
            <div className="text-sm space-y-1">
              <p><strong>Supabase URL:</strong> {supabase.supabaseUrl}</p>
              <p><strong>Auth Flow:</strong> PKCE</p>
              <p><strong>Redirect URL:</strong> {window.location.origin}/onauthsuccess</p>
              <p><strong>Reset URL:</strong> {window.location.origin}/resetpassword</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default SupabaseConnectionTest;