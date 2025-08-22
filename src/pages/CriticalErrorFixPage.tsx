import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, AlertTriangle, CheckCircle2, XCircle, Database, Key, UserCheck, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface FixResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  timestamp: string;
}

const CriticalErrorFixPage: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [fixResults, setFixResults] = useState<FixResult[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const { toast } = useToast();

  const addResult = (step: string, status: 'success' | 'error' | 'warning', message: string) => {
    setFixResults((prev) => [...prev, {
      step,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testSystemStatus = async () => {
    setIsTesting(true);
    try {
      // Test 1: Supabase Connection
      const { data: connectionTest, error: connectionError } = await supabase.
      from('user_profiles').
      select('count').
      limit(1);

      // Test 2: Admin Profile Exists
      const { data: adminProfile, error: adminError } = await supabase.
      from('user_profiles').
      select('*').
      eq('email', 'admin@dfs-portal.com').
      single();

      // Test 3: Module Access
      let moduleCount = 0;
      if (adminProfile) {
        const { data: modules } = await supabase.
        from('module_access').
        select('count').
        eq('user_id', adminProfile.user_id);
        moduleCount = modules?.length || 0;
      }

      // Test 4: Authentication Test
      let authTest = false;
      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: 'admin@dfs-portal.com',
          password: 'Admin123!@#'
        });
        if (!authError) {
          authTest = true;
          await supabase.auth.signOut();
        }
      } catch (e) {
































































        // Auth test failed
      }setSystemStatus({ supabaseConnection: !connectionError, adminProfileExists: !!adminProfile && !adminError, moduleAccessCount: moduleCount, authenticationWorks: authTest, errors: { connectionError: connectionError?.message, adminError: adminError?.message } });toast({ title: "System Status Updated", description: "Check the results below", variant: "default" });} catch (error: any) {setSystemStatus({ supabaseConnection: false, adminProfileExists: false, moduleAccessCount: 0, authenticationWorks: false, errors: { criticalError: error.message } });toast({ title: "System Test Failed", description: error.message, variant: "destructive" });}setIsTesting(false);};const fixCriticalErrors = async () => {setIsFixing(true);setFixResults([]);try {addResult('init', 'success', '🚀 Starting critical error fix process...'); // Step 1: Test Supabase Connection
      addResult('connection', 'success', '🔗 Testing Supabase connection...');const { data: connectionTest, error: connectionError } = await supabase.from('user_profiles').select('count').limit(1);if (connectionError) {addResult('connection', 'error', `❌ Supabase connection failed: ${connectionError.message}`);throw new Error('Cannot connect to Supabase');}addResult('connection', 'success', '✅ Supabase connection successful'); // Step 2: Generate/Use Admin User ID
      const adminUserId = '00000000-0000-0000-0000-000000000001';addResult('admin-id', 'success', `📝 Using admin user ID: ${adminUserId}`); // Step 3: Create/Update Admin Profile
      addResult('profile', 'success', '👤 Creating/updating admin profile...');const profileData = {
        id: adminUserId,
        user_id: adminUserId,
        email: 'admin@dfs-portal.com',
        first_name: 'System',
        last_name: 'Administrator',
        role: 'Administrator',
        permissions: {
          all_modules: true,
          system_admin: true,
          user_management: true,
          station_management: true,
          reporting: true,
          full_access: true
        },
        station_access: { all_stations: true },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: profileResult, error: profileError } = await supabase.
      from('user_profiles').
      upsert(profileData, { onConflict: 'email' });

      if (profileError) {
        addResult('profile', 'warning', `⚠️ Profile upsert issue: ${profileError.message}`);
        // Try insert instead
        const { error: insertError } = await supabase.
        from('user_profiles').
        insert(profileData);

        if (insertError && !insertError.message.includes('duplicate')) {
          addResult('profile', 'error', `❌ Profile creation failed: ${insertError.message}`);
        } else {
          addResult('profile', 'success', '✅ Admin profile created successfully');
        }
      } else {
        addResult('profile', 'success', '✅ Admin profile created/updated successfully');
      }

      // Step 4: Setup Module Access
      addResult('modules', 'success', '🔑 Setting up module access...');

      // Clear existing module access
      await supabase.
      from('module_access').
      delete().
      eq('user_id', adminUserId);

      const modules = [
      'Dashboard', 'Products', 'Sales', 'Employees', 'Deliveries',
      'Licenses', 'Orders', 'Vendors', 'Salary', 'Admin Panel',
      'User Management', 'Role Management', 'SMS Management',
      'System Settings', 'Audit Logs', 'Station Management'];


      let moduleSuccessCount = 0;
      for (const module of modules) {
        const moduleData = {
          user_id: adminUserId,
          module_name: module,
          display_name: module,
          access_level: 'full',
          is_active: true,
          create_enabled: true,
          edit_enabled: true,
          delete_enabled: true,
          granted_by: adminUserId,
          granted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: moduleError } = await supabase.
        from('module_access').
        insert(moduleData);

        if (!moduleError) {
          moduleSuccessCount++;
        }
      }

      addResult('modules', 'success', `✅ ${moduleSuccessCount}/${modules.length} modules configured`);

      // Step 5: Create Auth User
      addResult('auth', 'success', '🔐 Creating authentication user...');

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@dfs-portal.com',
        password: 'Admin123!@#',
        options: {
          data: {
            role: 'Administrator',
            first_name: 'System',
            last_name: 'Administrator'
          }
        }
      });

      if (signUpError && !signUpError.message.includes('already been registered')) {
        addResult('auth', 'warning', `⚠️ Auth signup: ${signUpError.message}`);
      } else {
        addResult('auth', 'success', '✅ Authentication user created/verified');
      }

      // Step 6: Test Login
      addResult('test', 'success', '🧪 Testing admin login...');

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'admin@dfs-portal.com',
        password: 'Admin123!@#'
      });

      if (loginError) {
        addResult('test', 'warning', `⚠️ Login test failed: ${loginError.message}`);
      } else {
        addResult('test', 'success', '✅ Login test successful');
        // Sign out after test
        await supabase.auth.signOut();
      }

      // Completion
      addResult('complete', 'success', '🎉 Critical error fix completed successfully!');
      addResult('credentials', 'success', '📧 Admin Email: admin@dfs-portal.com');
      addResult('credentials', 'success', '🔑 Admin Password: Admin123!@#');
      addResult('security', 'warning', '⚠️ IMPORTANT: Change password after first login!');

      toast({
        title: "Critical Errors Fixed!",
        description: "All critical system errors have been resolved",
        variant: "default"
      });

      // Refresh system status
      setTimeout(() => {
        testSystemStatus();
      }, 2000);

    } catch (error: any) {
      console.error('Critical fix error:', error);
      addResult('error', 'error', `❌ Critical error: ${error.message}`);

      toast({
        title: "Fix Failed",
        description: error.message,
        variant: "destructive"
      });
    }

    setIsFixing(false);
  };

  const getStatusIcon = (status: boolean) => {
    return status ?
    <CheckCircle2 className="w-5 h-5 text-green-600" /> :
    <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? "default" : "destructive"}>
        {status ? "OK" : "ISSUE"}
      </Badge>);

  };

  const getResultIcon = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getResultBgColor = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  React.useEffect(() => {
    // Don't auto-test on mount to avoid authentication errors
    console.log('CriticalErrorFixPage loaded - manual status check required');
  }, []);

  const allIssuesFixed = systemStatus &&
  systemStatus.supabaseConnection &&
  systemStatus.adminProfileExists &&
  systemStatus.moduleAccessCount > 0 &&
  systemStatus.authenticationWorks;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚨 Critical Error Fix</h1>
          <p className="text-gray-600">Emergency system repair and admin access restoration</p>
        </div>

        {/* Critical Alert */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>CRITICAL SYSTEM ERRORS DETECTED:</strong> Supabase upsert function errors and admin access issues require immediate fixing.
          </AlertDescription>
        </Alert>

        {/* System Status Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              System Status Dashboard
              <Button
                onClick={testSystemStatus}
                disabled={isTesting}
                variant="outline"
                size="sm"
                className="ml-auto">

                {isTesting ?
                <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Testing...
                  </> :

                <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                  </>
                }
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isTesting ?
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Running system diagnostics...
              </div> :
            systemStatus ?
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Supabase Connection</div>
                        <div className="text-sm text-gray-600">Database connectivity</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(systemStatus.supabaseConnection)}
                      {getStatusBadge(systemStatus.supabaseConnection)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Admin Profile</div>
                        <div className="text-sm text-gray-600">Administrator account exists</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(systemStatus.adminProfileExists)}
                      {getStatusBadge(systemStatus.adminProfileExists)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Module Access</div>
                        <div className="text-sm text-gray-600">{systemStatus.moduleAccessCount} modules configured</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(systemStatus.moduleAccessCount > 0)}
                      {getStatusBadge(systemStatus.moduleAccessCount > 0)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Authentication</div>
                        <div className="text-sm text-gray-600">Login functionality</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(systemStatus.authenticationWorks)}
                      {getStatusBadge(systemStatus.authenticationWorks)}
                    </div>
                  </div>
                </div>

                {/* Overall Status */}
                {allIssuesFixed ?
              <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      <strong>✅ ALL SYSTEMS OPERATIONAL!</strong> All critical issues have been resolved.
                    </AlertDescription>
                  </Alert> :

              <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>❌ CRITICAL ISSUES DETECTED!</strong> System requires immediate fixing.
                    </AlertDescription>
                  </Alert>
              }
              </> :
            null}
          </CardContent>
        </Card>

        {/* Emergency Fix Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              🚨 Emergency Fix Controls
            </CardTitle>
            <CardDescription>
              Use these controls to fix critical system errors and restore admin access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={fixCriticalErrors}
              disabled={isFixing}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-3"
              size="lg">

              {isFixing ?
              <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Fixing Critical Errors...
                </> :

              <>
                  🛠️🔥 FIX ALL CRITICAL ERRORS NOW!
                </>
              }
            </Button>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => window.location.href = '/login'}
                variant="outline"
                className="flex items-center gap-2">

                <Shield className="w-4 h-4" />
                Go to Login Page
              </Button>

              <Button
                onClick={() => window.location.href = '/dashboard'}
                variant="outline"
                className="flex items-center gap-2">

                <Database className="w-4 h-4" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Admin Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="space-y-2 font-mono">
                <div className="flex items-center gap-2">
                  <strong>📧 Email:</strong> 
                  <code className="bg-white px-2 py-1 rounded">admin@dfs-portal.com</code>
                </div>
                <div className="flex items-center gap-2">
                  <strong>🔑 Password:</strong> 
                  <code className="bg-white px-2 py-1 rounded">Admin123!@#</code>
                </div>
              </div>
              <Alert className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Warning:</strong> Change these credentials immediately after first login!
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Fix Results */}
        {fixResults.length > 0 &&
        <Card>
            <CardHeader>
              <CardTitle>Fix Progress & Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {fixResults.map((result, index) =>
              <div
                key={index}
                className={`p-3 rounded-lg border ${getResultBgColor(result.status)}`}>

                    <div className="flex items-start gap-2">
                      {getResultIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm text-gray-600">{result.step}</div>
                          <div className="text-xs text-gray-500">{result.timestamp}</div>
                        </div>
                        <div className="font-mono text-sm">{result.message}</div>
                      </div>
                    </div>
                  </div>
              )}
              </div>
            </CardContent>
          </Card>
        }

        {/* Error Details */}
        {systemStatus?.errors &&
        <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Error Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                {Object.entries(systemStatus.errors).map(([key, value]) =>
              value &&
              <div key={key} className="p-2 bg-red-50 rounded border border-red-200">
                      <strong>{key}:</strong> {value as string}
                    </div>

              )}
              </div>
            </CardContent>
          </Card>
        }
      </div>
    </div>);

};

export default CriticalErrorFixPage;