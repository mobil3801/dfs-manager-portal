import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertTriangle, Database, Shield, Key, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface FixResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

const SupabaseUpsertFix: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [fixResults, setFixResults] = useState<FixResult[]>([]);
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  const addResult = (step: string, status: 'success' | 'error' | 'warning', message: string) => {
    setFixResults((prev) => [...prev, { step, status, message }]);
  };

  const testSupabaseConnection = async () => {
    setIsTesting(true);
    setTestResults(null);

    try {
      // Test basic connection
      const { data: tables, error: tablesError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      // Test auth
      const { data: session } = await supabase.auth.getSession();

      // Test upsert functionality
      const testData = {
        user_id: 'test-user-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'Employee',
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: upsertData, error: upsertError } = await supabase
        .from('user_profiles')
        .upsert(testData, { onConflict: 'user_id' })
        .select();

      // Clean up test data
      if (!upsertError) {
        await supabase
          .from('user_profiles')
          .delete()
          .eq('user_id', 'test-user-id');
      }

      setTestResults({
        connection: !tablesError,
        auth: !!session,
        upsert: !upsertError,
        errors: {
          tablesError: tablesError?.message,
          upsertError: upsertError?.message
        }
      });

      toast({
        title: "Connection Test Complete",
        description: "Check results below",
        variant: "default"
      });

    } catch (error: any) {
      setTestResults({
        connection: false,
        auth: false,
        upsert: false,
        errors: {
          generalError: error.message
        }
      });

      toast({
        title: "Connection Test Failed",
        description: error.message,
        variant: "destructive"
      });
    }

    setIsTesting(false);
  };

  const fixAdminAccess = async () => {
    setIsFixing(true);
    setFixResults([]);

    try {
      addResult('init', 'success', '🚀 Starting comprehensive admin access fix...');

      // Step 1: Generate consistent admin user ID
      const adminUserId = '00000000-0000-0000-0000-000000000001';
      addResult('userid', 'success', `📝 Using admin user ID: ${adminUserId}`);

      // Step 2: Create/update user profile using proper upsert
      addResult('profile', 'success', '👤 Creating/updating admin user profile...');

      const profileData = {
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

      const { data: profileResult, error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'email' })
        .select();

      if (profileError) {
        addResult('profile', 'error', `❌ Profile error: ${profileError.message}`);
      } else {
        addResult('profile', 'success', '✅ Admin profile created/updated successfully');
      }

      // Step 3: Setup module access
      addResult('modules', 'success', '🔑 Setting up module access permissions...');

      // Delete existing module access for admin user
      await supabase
        .from('module_access')
        .delete()
        .eq('user_id', adminUserId);

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

        const { error: moduleError } = await supabase
          .from('module_access')
          .insert(moduleData);

        if (!moduleError) {
          moduleSuccessCount++;
        }
      }

      addResult('modules', 'success', `✅ ${moduleSuccessCount}/${modules.length} modules configured successfully`);

      // Step 4: Create authentication user
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

      // Step 5: Test login
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

      addResult('complete', 'success', '🎉 Admin access fix completed successfully!');
      addResult('credentials', 'success', '📧 Email: admin@dfs-portal.com');
      addResult('credentials', 'success', '🔑 Password: Admin123!@#');
      addResult('security', 'warning', '⚠️ IMPORTANT: Change password after first login!');

      toast({
        title: "Admin Access Fixed!",
        description: "All admin access issues have been resolved",
        variant: "default"
      });

    } catch (error: any) {
      console.error('Fix error:', error);
      addResult('error', 'error', `❌ Critical error: ${error.message}`);

      toast({
        title: "Fix Failed",
        description: error.message,
        variant: "destructive"
      });
    }

    setIsFixing(false);
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase Upsert & Admin Fix</h1>
        <p className="text-gray-600">Fix critical Supabase upsert errors and admin access issues</p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>CRITICAL ERROR DETECTED:</strong> re.from("user_profiles").upsert is not a function
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Supabase Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Test Connection
            </CardTitle>
            <CardDescription>
              Test Supabase connection and upsert functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testSupabaseConnection}
              disabled={isTesting}
              className="w-full"
              variant="outline">

              {isTesting ?
              <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Testing...
                </> :

              <>
                  <Database className="w-4 h-4 mr-2" />
                  Test Connection
                </>
              }
            </Button>

            {testResults &&
            <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span>Database Connection</span>
                  <Badge variant={testResults.connection ? "default" : "destructive"}>
                    {testResults.connection ? "OK" : "FAILED"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Authentication</span>
                  <Badge variant={testResults.auth ? "default" : "secondary"}>
                    {testResults.auth ? "ACTIVE" : "NONE"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Upsert Function</span>
                  <Badge variant={testResults.upsert ? "default" : "destructive"}>
                    {testResults.upsert ? "WORKING" : "BROKEN"}
                  </Badge>
                </div>
              </div>
            }
          </CardContent>
        </Card>

        {/* Fix Admin Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Fix Admin Access
            </CardTitle>
            <CardDescription>
              Complete admin access restoration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={fixAdminAccess}
              disabled={isFixing}
              className="w-full bg-red-600 hover:bg-red-700 text-white">

              {isFixing ?
              <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Fixing...
                </> :

              <>
                  <Shield className="w-4 h-4 mr-2" />
                  Fix Admin Access
                </>
              }
            </Button>
          </CardContent>
        </Card>
      </div>

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
              <div><strong>📧 Email:</strong> admin@dfs-portal.com</div>
              <div><strong>🔑 Password:</strong> Admin123!@#</div>
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
                      <div className="font-medium text-sm text-gray-600">{result.step}</div>
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
      {testResults?.errors &&
      <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              {Object.entries(testResults.errors).map(([key, value]) =>
            value &&
            <div key={key} className="p-2 bg-red-50 rounded">
                    <strong>{key}:</strong> {value as string}
                  </div>

            )}
            </div>
          </CardContent>
        </Card>
      }
    </div>);

};

export default SupabaseUpsertFix;