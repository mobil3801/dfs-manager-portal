import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Server, Database, Shield, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticCheck {
  name: string;
  status: 'checking' | 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const ServerDiagnostics: React.FC = () => {
  const [checks, setChecks] = useState<DiagnosticCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const { toast } = useToast();

  const updateCheck = (name: string, status: DiagnosticCheck['status'], message: string, details?: string) => {
    setChecks((prev) => prev.map((check) =>
    check.name === name ? { ...check, status, message, details } : check
    ));
  };

  const initializeChecks = () => {
    const initialChecks: DiagnosticCheck[] = [
    { name: 'Frontend Build', status: 'checking', message: 'Checking application build...' },
    { name: 'Supabase Connection', status: 'checking', message: 'Testing database connection...' },
    { name: 'Authentication System', status: 'checking', message: 'Verifying auth configuration...' },
    { name: 'API Endpoints', status: 'checking', message: 'Testing API connectivity...' },
    { name: 'Database Tables', status: 'checking', message: 'Checking database schema...' },
    { name: 'Storage Access', status: 'checking', message: 'Testing file storage...' },
    { name: 'Environment Config', status: 'checking', message: 'Validating configuration...' },
    { name: 'Performance Metrics', status: 'checking', message: 'Collecting performance data...' }];

    setChecks(initialChecks);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    initializeChecks();

    try {
      // 1. Frontend Build Check
      updateCheck('Frontend Build', 'checking', 'Checking React application...');
      try {
        if (typeof React !== 'undefined' && typeof window !== 'undefined') {
          updateCheck('Frontend Build', 'pass', 'React application loaded successfully');
        } else {
          updateCheck('Frontend Build', 'fail', 'React application not properly initialized');
        }
      } catch (error) {
        updateCheck('Frontend Build', 'fail', 'Frontend build error detected', error instanceof Error ? error.message : 'Unknown error');
      }

      // 2. Supabase Connection Check
      updateCheck('Supabase Connection', 'checking', 'Testing Supabase connection...');
      try {
        const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
        if (error) {
          updateCheck('Supabase Connection', 'fail', 'Database connection failed', error.message);
        } else {
          updateCheck('Supabase Connection', 'pass', 'Database connection successful');
        }
      } catch (error) {
        updateCheck('Supabase Connection', 'fail', 'Cannot connect to database', error instanceof Error ? error.message : 'Connection timeout');
      }

      // 3. Authentication System Check
      updateCheck('Authentication System', 'checking', 'Checking authentication...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          updateCheck('Authentication System', 'warning', 'Auth system has issues', error.message);
        } else {
          updateCheck('Authentication System', 'pass', 'Authentication system operational');
        }
      } catch (error) {
        updateCheck('Authentication System', 'fail', 'Authentication system error', error instanceof Error ? error.message : 'Auth error');
      }

      // 4. API Endpoints Check
      updateCheck('API Endpoints', 'checking', 'Testing API endpoints...');
      try {
        // Test a simple database query
        const { data, error } = await supabase.from('stations').select('id').limit(1);
        if (error) {
          updateCheck('API Endpoints', 'warning', 'Some API endpoints may have issues', error.message);
        } else {
          updateCheck('API Endpoints', 'pass', 'API endpoints responding correctly');
        }
      } catch (error) {
        updateCheck('API Endpoints', 'fail', 'API endpoints not accessible', error instanceof Error ? error.message : 'API error');
      }

      // 5. Database Tables Check
      updateCheck('Database Tables', 'checking', 'Checking database schema...');
      try {
        const tables = ['user_profiles', 'stations', 'products', 'employees', 'audit_logs'];
        const tableChecks = await Promise.all(
          tables.map(async (table) => {
            try {
              const { data, error } = await supabase.from(table).select('*').limit(1);
              return { table, success: !error, error: error?.message };
            } catch {
              return { table, success: false, error: 'Table not accessible' };
            }
          })
        );

        const failedTables = tableChecks.filter((check) => !check.success);
        if (failedTables.length === 0) {
          updateCheck('Database Tables', 'pass', 'All required tables accessible');
        } else if (failedTables.length < tables.length / 2) {
          updateCheck('Database Tables', 'warning', 'Some tables have issues',
          `Failed tables: ${failedTables.map((t) => t.table).join(', ')}`);
        } else {
          updateCheck('Database Tables', 'fail', 'Multiple database tables inaccessible',
          `Failed tables: ${failedTables.map((t) => t.table).join(', ')}`);
        }
      } catch (error) {
        updateCheck('Database Tables', 'fail', 'Cannot check database schema', error instanceof Error ? error.message : 'Schema error');
      }

      // 6. Storage Access Check
      updateCheck('Storage Access', 'checking', 'Testing file storage...');
      try {
        // Test if storage is accessible (this will fail gracefully if no bucket exists)
        const { data, error } = await supabase.storage.listBuckets();
        if (error) {
          updateCheck('Storage Access', 'warning', 'Storage access limited', error.message);
        } else {
          updateCheck('Storage Access', 'pass', 'File storage accessible');
        }
      } catch (error) {
        updateCheck('Storage Access', 'warning', 'Storage system not configured', error instanceof Error ? error.message : 'Storage error');
      }

      // 7. Environment Configuration Check
      updateCheck('Environment Config', 'checking', 'Validating environment...');
      try {
        const requiredEnvVars = ['NODE_ENV'];
        const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

        if (missingVars.length === 0) {
          updateCheck('Environment Config', 'pass', 'Environment configuration valid');
        } else {
          updateCheck('Environment Config', 'warning', 'Some environment variables missing',
          `Missing: ${missingVars.join(', ')}`);
        }
      } catch (error) {
        updateCheck('Environment Config', 'fail', 'Environment configuration error', error instanceof Error ? error.message : 'Config error');
      }

      // 8. Performance Metrics Check
      updateCheck('Performance Metrics', 'checking', 'Collecting performance data...');
      try {
        const start = performance.now();
        await supabase.from('user_profiles').select('id').limit(1);
        const duration = performance.now() - start;

        if (duration < 1000) {
          updateCheck('Performance Metrics', 'pass', `Database response time: ${duration.toFixed(2)}ms`);
        } else if (duration < 5000) {
          updateCheck('Performance Metrics', 'warning', `Database response time: ${duration.toFixed(2)}ms (slow)`);
        } else {
          updateCheck('Performance Metrics', 'fail', `Database response time: ${duration.toFixed(2)}ms (very slow)`);
        }
      } catch (error) {
        updateCheck('Performance Metrics', 'warning', 'Cannot measure performance', error instanceof Error ? error.message : 'Performance error');
      }

      setLastRun(new Date());
      toast({
        title: 'Diagnostics Complete',
        description: 'Server diagnostics have been completed'
      });

    } catch (error) {
      toast({
        title: 'Diagnostics Error',
        description: 'An error occurred during diagnostics',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Run diagnostics on component mount
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticCheck['status']) => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: DiagnosticCheck['status']) => {
    switch (status) {
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
      case 'pass':
        return <Badge variant="default" className="bg-green-100 text-green-800">Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (checkName: string) => {
    if (checkName.includes('Database') || checkName.includes('Tables')) return <Database className="h-5 w-5" />;
    if (checkName.includes('Auth')) return <Shield className="h-5 w-5" />;
    if (checkName.includes('API') || checkName.includes('Endpoints')) return <Globe className="h-5 w-5" />;
    return <Server className="h-5 w-5" />;
  };

  const overallStatus = checks.length > 0 ? (() => {
    const failCount = checks.filter((c) => c.status === 'fail').length;
    const warningCount = checks.filter((c) => c.status === 'warning').length;

    if (failCount > 0) return 'fail';
    if (warningCount > 0) return 'warning';
    if (checks.every((c) => c.status === 'pass')) return 'pass';
    return 'checking';
  })() : 'checking';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Server Diagnostics</h1>
          <p className="text-gray-600 mt-1">
            System health check and troubleshooting tools
          </p>
          {lastRun &&
          <p className="text-sm text-gray-500 mt-1">
              Last run: {lastRun.toLocaleString()}
            </p>
          }
        </div>
        <Button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="flex items-center gap-2">

          <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Running...' : 'Run Diagnostics'}
        </Button>
      </div>

      {/* Overall Status */}
      <Alert className={`${
      overallStatus === 'pass' ? 'border-green-200 bg-green-50' :
      overallStatus === 'fail' ? 'border-red-200 bg-red-50' :
      overallStatus === 'warning' ? 'border-yellow-200 bg-yellow-50' :
      'border-blue-200 bg-blue-50'}`
      }>
        <div className="flex items-center gap-2">
          {getStatusIcon(overallStatus)}
          <AlertDescription className={`font-medium ${
          overallStatus === 'pass' ? 'text-green-800' :
          overallStatus === 'fail' ? 'text-red-800' :
          overallStatus === 'warning' ? 'text-yellow-800' :
          'text-blue-800'}`
          }>
            {overallStatus === 'pass' && 'All systems operational'}
            {overallStatus === 'fail' && 'Critical issues detected - server may not be working properly'}
            {overallStatus === 'warning' && 'Some issues detected - server is functional but needs attention'}
            {overallStatus === 'checking' && 'Running diagnostics...'}
          </AlertDescription>
        </div>
      </Alert>

      {/* Diagnostic Results */}
      <div className="grid gap-4 md:grid-cols-2">
        {checks.map((check, index) =>
        <Card key={index} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(check.name)}
                  <CardTitle className="text-lg">{check.name}</CardTitle>
                </div>
                {getStatusBadge(check.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(check.status)}
                <CardDescription className="text-sm">
                  {check.message}
                </CardDescription>
              </div>
              {check.details &&
            <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-600 font-mono">
                    {check.details}
                  </p>
                </div>
            }
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common troubleshooting steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Button variant="outline" onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}>
              Clear Cache
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/login'}>
              Reset Authentication
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Application</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Environment:</span> {process.env.NODE_ENV || 'development'}</p>
                <p><span className="font-medium">User Agent:</span> {navigator.userAgent.substring(0, 50)}...</p>
                <p><span className="font-medium">URL:</span> {window.location.origin}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Browser</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Online:</span> {navigator.onLine ? 'Yes' : 'No'}</p>
                <p><span className="font-medium">Cookies:</span> {navigator.cookieEnabled ? 'Enabled' : 'Disabled'}</p>
                <p><span className="font-medium">Language:</span> {navigator.language}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default ServerDiagnostics;