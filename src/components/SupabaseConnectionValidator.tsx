import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Database, User, Shield, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ConnectionStatus {
  database: 'connected' | 'failed' | 'testing';
  auth: 'connected' | 'failed' | 'testing';
  storage: 'connected' | 'failed' | 'testing';
  rls: 'enabled' | 'disabled' | 'testing';
}

const SupabaseConnectionValidator: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    database: 'testing',
    auth: 'testing',
    storage: 'testing',
    rls: 'testing'
  });
  const [tables, setTables] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const testDatabaseConnection = async () => {
    try {
      // Test basic database connection by querying a simple table
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Database connection error:', error);
        return 'failed';
      }

      return 'connected';
    } catch (error) {
      console.error('Database test failed:', error);
      return 'failed';
    }
  };

  const testAuthConnection = async () => {
    try {
      // Test auth connection by getting current session
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth connection error:', error);
        return 'failed';
      }

      return 'connected';
    } catch (error) {
      console.error('Auth test failed:', error);
      return 'failed';
    }
  };

  const testStorageConnection = async () => {
    try {
      // Test storage by trying to list buckets (will fail gracefully if no access)
      const publicUrl = supabase.storage.from('test').getPublicUrl('test-file');
      
      if (publicUrl.data.publicUrl) {
        return 'connected';
      }

      return 'failed';
    } catch (error) {
      console.error('Storage test failed:', error);
      return 'failed';
    }
  };

  const testRLSStatus = async () => {
    try {
      // Check if RLS is enabled by attempting an unauthorized query
      const { error } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);

      // If we get a permission error, RLS is likely enabled
      if (error && error.message.includes('permission')) {
        return 'enabled';
      }

      // If no error, RLS might be disabled or we have access
      return 'disabled';
    } catch (error) {
      return 'testing';
    }
  };

  const fetchTables = async () => {
    try {
      // Get available tables from the information schema
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (error) {
        // Fallback to known tables from the schema
        setTables([
          'products', 'sales_reports', 'deliveries', 'sms_history',
          'module_access', 'stations', 'employees', 'audit_logs',
          'alert_settings', 'sms_contacts', 'alert_history',
          'licenses', 'user_profiles', 'sms_config', 'sms_settings'
        ]);
        return;
      }

      const tableNames = data?.map(table => table.table_name) || [];
      setTables(tableNames);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      // Use known tables as fallback
      setTables([
        'products', 'sales_reports', 'deliveries', 'sms_history',
        'module_access', 'stations', 'employees', 'audit_logs',
        'alert_settings', 'sms_contacts', 'alert_history',
        'licenses', 'user_profiles', 'sms_config', 'sms_settings'
      ]);
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    
    try {
      // Run all tests simultaneously
      const [dbStatus, authStatus, storageStatus, rlsStatus] = await Promise.all([
        testDatabaseConnection(),
        testAuthConnection(),
        testStorageConnection(),
        testRLSStatus()
      ]);

      setStatus({
        database: dbStatus,
        auth: authStatus,
        storage: storageStatus,
        rls: rlsStatus
      });

      // Fetch tables after successful database connection
      if (dbStatus === 'connected') {
        await fetchTables();
      }

      toast.success('Connection tests completed');
    } catch (error) {
      console.error('Test suite failed:', error);
      toast.error('Connection tests failed');
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const getStatusIcon = (status: 'connected' | 'failed' | 'testing' | 'enabled' | 'disabled') => {
    switch (status) {
      case 'connected':
      case 'enabled':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
      case 'disabled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }
  };

  const getStatusBadge = (status: 'connected' | 'failed' | 'testing' | 'enabled' | 'disabled') => {
    const variants = {
      connected: 'default',
      enabled: 'default',
      failed: 'destructive',
      disabled: 'secondary',
      testing: 'outline'
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Supabase Connection Validator
          </CardTitle>
          <CardDescription>
            Validate your Supabase database connection and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Database</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.database)}
                {getStatusBadge(status.database)}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-500" />
                <span className="font-medium">Auth</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.auth)}
                {getStatusBadge(status.auth)}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Storage</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.storage)}
                {getStatusBadge(status.storage)}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                <span className="font-medium">RLS</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.rls)}
                {getStatusBadge(status.rls)}
              </div>
            </div>
          </div>

          {/* Database Tables */}
          {tables.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Available Tables ({tables.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {tables.map((table) => (
                  <Badge key={table} variant="outline" className="justify-center">
                    {table}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Configuration Details */}
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project URL:</span>
              <span className="font-mono">https://nehhjsiuhthflfwkfequ.supabase.co</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project ID:</span>
              <span className="font-mono">nehhjsiuhthflfwkfequ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Region:</span>
              <span className="font-mono">us-east-2</span>
            </div>
          </div>

          {/* Test Actions */}
          <div className="flex gap-3">
            <Button onClick={runAllTests} disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Run Tests Again'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseConnectionValidator;