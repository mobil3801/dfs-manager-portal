import React, { useState, useEffect } from 'react';
import { supabase, getCurrentUser, isAuthenticated } from '@/lib/supabase';
import { SupabaseService } from '@/services/supabaseService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Database,
  Users,
  Shield,
  Cloud,
  RefreshCw,
  Activity } from
'lucide-react';

interface ConnectionTestResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
  timing?: number;
}

const SupabaseConnectionTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<ConnectionTestResult[]>([]);
  const [overallStatus, setOverallStatus] = useState<'success' | 'error' | 'warning' | 'pending'>('pending');

  const runConnectionTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    const results: ConnectionTestResult[] = [];

    // Test 1: Basic Supabase Configuration
    const startTime = Date.now();
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!url || url === 'https://your-project.supabase.co') {
        results.push({
          test: 'Supabase Configuration',
          status: 'error',
          message: 'Supabase URL not configured properly',
          details: { url, hasKey: !!key }
        });
      } else if (!key || key === 'your-anon-key') {
        results.push({
          test: 'Supabase Configuration',
          status: 'error',
          message: 'Supabase Anonymous Key not configured properly',
          details: { url, hasKey: !!key }
        });
      } else {
        results.push({
          test: 'Supabase Configuration',
          status: 'success',
          message: 'Configuration loaded successfully',
          details: { url: url.substring(0, 30) + '...', hasKey: true }
        });
      }
    } catch (error) {
      results.push({
        test: 'Supabase Configuration',
        status: 'error',
        message: 'Failed to load configuration',
        details: error
      });
    }

    // Test 2: Database Connection
    try {
      const connectionStart = Date.now();
      const { data, error } = await supabase.from('stations').select('count', { count: 'exact', head: true });
      const connectionTime = Date.now() - connectionStart;

      if (error) {
        results.push({
          test: 'Database Connection',
          status: 'error',
          message: `Database connection failed: ${error.message}`,
          details: error,
          timing: connectionTime
        });
      } else {
        results.push({
          test: 'Database Connection',
          status: 'success',
          message: 'Successfully connected to database',
          details: { recordCount: data?.[0]?.count || 0 },
          timing: connectionTime
        });
      }
    } catch (error) {
      results.push({
        test: 'Database Connection',
        status: 'error',
        message: 'Database connection error',
        details: error
      });
    }

    // Test 3: Authentication Service
    try {
      const authStart = Date.now();
      const { data: { session }, error } = await supabase.auth.getSession();
      const authTime = Date.now() - authStart;

      if (error) {
        results.push({
          test: 'Authentication Service',
          status: 'warning',
          message: `Auth service warning: ${error.message}`,
          details: error,
          timing: authTime
        });
      } else {
        results.push({
          test: 'Authentication Service',
          status: 'success',
          message: 'Authentication service is working',
          details: {
            hasSession: !!session,
            userId: session?.user?.id || 'Not logged in'
          },
          timing: authTime
        });
      }
    } catch (error) {
      results.push({
        test: 'Authentication Service',
        status: 'error',
        message: 'Authentication service error',
        details: error
      });
    }

    // Test 4: Real-time Capabilities
    try {
      const realtimeStart = Date.now();
      const channel = supabase.channel('connection-test').
      on('postgres_changes',
      { event: '*', schema: 'public', table: 'stations' },
      () => {}).
      subscribe();

      await new Promise((resolve) => setTimeout(resolve, 1000));
      const realtimeTime = Date.now() - realtimeStart;

      if (channel.state === 'SUBSCRIBED') {
        results.push({
          test: 'Real-time Capabilities',
          status: 'success',
          message: 'Real-time subscriptions are working',
          details: { channelState: channel.state },
          timing: realtimeTime
        });
      } else {
        results.push({
          test: 'Real-time Capabilities',
          status: 'warning',
          message: 'Real-time subscription pending',
          details: { channelState: channel.state },
          timing: realtimeTime
        });
      }

      supabase.removeChannel(channel);
    } catch (error) {
      results.push({
        test: 'Real-time Capabilities',
        status: 'error',
        message: 'Real-time service error',
        details: error
      });
    }

    // Test 5: Storage Access
    try {
      const storageStart = Date.now();
      const { data: buckets, error } = await supabase.storage.listBuckets();
      const storageTime = Date.now() - storageStart;

      if (error) {
        results.push({
          test: 'Storage Service',
          status: 'warning',
          message: `Storage access limited: ${error.message}`,
          details: error,
          timing: storageTime
        });
      } else {
        results.push({
          test: 'Storage Service',
          status: 'success',
          message: 'Storage service is accessible',
          details: { bucketCount: buckets?.length || 0 },
          timing: storageTime
        });
      }
    } catch (error) {
      results.push({
        test: 'Storage Service',
        status: 'error',
        message: 'Storage service error',
        details: error
      });
    }

    // Test 6: Table Access
    const tableTests = [
    'stations',
    'products',
    'employees',
    'daily_sales_reports_enhanced',
    'delivery_records'];


    for (const table of tableTests) {
      try {
        const tableStart = Date.now();
        const { count, error } = await SupabaseService.read(table as any, { pageSize: 1 });
        const tableTime = Date.now() - tableStart;

        if (error) {
          results.push({
            test: `Table Access: ${table}`,
            status: 'error',
            message: `Cannot access ${table}: ${error}`,
            details: { table, error },
            timing: tableTime
          });
        } else {
          results.push({
            test: `Table Access: ${table}`,
            status: 'success',
            message: `Table ${table} is accessible`,
            details: { table, recordCount: count || 0 },
            timing: tableTime
          });
        }
      } catch (error) {
        results.push({
          test: `Table Access: ${table}`,
          status: 'error',
          message: `Error accessing ${table}`,
          details: { table, error }
        });
      }
    }

    const totalTime = Date.now() - startTime;

    // Determine overall status
    const hasErrors = results.some((r) => r.status === 'error');
    const hasWarnings = results.some((r) => r.status === 'warning');

    if (hasErrors) {
      setOverallStatus('error');
    } else if (hasWarnings) {
      setOverallStatus('warning');
    } else {
      setOverallStatus('success');
    }

    results.push({
      test: 'Overall Test Summary',
      status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'success',
      message: `Test completed in ${totalTime}ms`,
      details: {
        totalTests: results.length,
        successful: results.filter((r) => r.status === 'success').length,
        warnings: results.filter((r) => r.status === 'warning').length,
        errors: results.filter((r) => r.status === 'error').length,
        totalTime
      }
    });

    setTestResults(results);
    setIsLoading(false);
  };

  useEffect(() => {
    runConnectionTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default' as const,
      error: 'destructive' as const,
      warning: 'secondary' as const,
      pending: 'outline' as const
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>);

  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Supabase Connection Test
              </CardTitle>
              <CardDescription>
                Comprehensive test of Supabase configuration and connectivity
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(overallStatus)}
              <Button
                onClick={runConnectionTests}
                disabled={isLoading}
                size="sm">

                {isLoading ?
                <Loader2 className="h-4 w-4 animate-spin" /> :

                <RefreshCw className="h-4 w-4" />
                }
                {isLoading ? 'Testing...' : 'Retest'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {testResults.map((result, index) =>
          <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <h3 className="font-medium">{result.test}</h3>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                      {result.timing &&
                    <p className="text-xs text-muted-foreground mt-1">
                          <Activity className="h-3 w-3 inline mr-1" />
                          {result.timing}ms
                        </p>
                    }
                    </div>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Current Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Supabase URL:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {import.meta.env.VITE_SUPABASE_URL?.substring(0, 50)}...
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Anonymous Key:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Project ID:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {import.meta.env.VITE_SUPABASE_PROJECT_ID || 'Not set'}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Environment:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {import.meta.env.VITE_APP_ENVIRONMENT || 'development'}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Cloud className="h-4 w-4" />
            <AlertDescription>
              Make sure your Supabase project is active and the environment variables are properly configured.
              Check your .env.local file for the correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY values.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {testResults.map((result, index) =>
          result.details &&
          <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-sm">{result.test}</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </CardContent>
              </Card>

          )}
        </TabsContent>
      </Tabs>
    </div>);

};

export default SupabaseConnectionTest;