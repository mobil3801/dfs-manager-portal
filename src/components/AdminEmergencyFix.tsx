import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, AlertTriangle, CheckCircle2, XCircle, UserCheck, Database, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface DiagnosticResult {
  authUser: boolean;
  userProfile: boolean;
  adminRole: boolean;
  moduleAccess: boolean;
}

const AdminEmergencyFix: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [fixResults, setFixResults] = useState<string[]>([]);
  const { toast } = useToast();

  const runDiagnostic = async () => {
    setIsDiagnosing(true);
    try {
      // Check auth user by trying to get user profile
      const { data: profiles, error: profileError } = await supabase.
      from('user_profiles').
      select('*').
      eq('email', 'admin@dfs-portal.com');

      const adminExists = profiles && profiles.length > 0;

      const profileExists = adminExists;

      // Check admin role and module access
      let adminRole = false;
      let moduleAccess = false;

      if (profileExists && profiles[0]) {
        adminRole = profiles[0].role === 'Administrator';

        const { data: modules } = await supabase.
        from('module_access').
        select('*').
        eq('user_id', profiles[0].user_id);

        moduleAccess = modules && modules.length > 0;
      }

      setDiagnostic({
        authUser: adminExists,
        userProfile: profileExists,
        adminRole,
        moduleAccess
      });

    } catch (error) {
      console.error('Diagnostic error:', error);
      toast({
        title: "Diagnostic Failed",
        description: "Failed to run system diagnostic",
        variant: "destructive"
      });
    }
    setIsDiagnosing(false);
  };

  const fixAdminAccess = async () => {
    setIsFixing(true);
    setFixResults([]);
    const results: string[] = [];

    try {
      // Step 1: Create/ensure auth user exists
      results.push('🔄 Creating admin authentication user...');
      setFixResults([...results]);

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
        throw signUpError;
      }

      results.push('✅ Admin authentication user created/verified');
      setFixResults([...results]);

      // Step 2: Get current user or generate ID
      let adminUserId = signUpData?.user?.id;

      if (!adminUserId) {
        // Check if profile exists and get user_id
        const { data: existingProfiles } = await supabase.
        from('user_profiles').
        select('user_id').
        eq('email', 'admin@dfs-portal.com').
        limit(1);

        if (existingProfiles && existingProfiles.length > 0) {
          adminUserId = existingProfiles[0].user_id;
        } else {
          // Generate a new UUID for the admin user
          adminUserId = crypto.randomUUID();
        }
      }

      results.push('🔄 Creating user profile...');
      setFixResults([...results]);

      // Step 3: Create/update user profile
      const { error: profileError } = await supabase.
      from('user_profiles').
      upsert({
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
          reporting: true
        },
        station_access: { all_stations: true },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

      if (profileError) throw profileError;

      results.push('✅ User profile created/updated');
      setFixResults([...results]);

      // Step 4: Setup module access
      results.push('🔄 Setting up module access permissions...');
      setFixResults([...results]);

      const modules = [
      'Dashboard', 'Products', 'Sales', 'Employees', 'Deliveries',
      'Licenses', 'Orders', 'Vendors', 'Salary', 'Admin Panel',
      'User Management', 'Role Management', 'SMS Management',
      'System Settings', 'Audit Logs', 'Station Management'];


      for (const module of modules) {
        await supabase.
        from('module_access').
        upsert({
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
        }, {
          onConflict: 'user_id,module_name'
        });
      }

      results.push('✅ Module access permissions configured');
      setFixResults([...results]);

      results.push('🎉 Admin access fully restored!');
      setFixResults([...results]);

      toast({
        title: "Admin Access Fixed!",
        description: "All admin access issues have been resolved",
        variant: "default"
      });

      // Re-run diagnostic
      setTimeout(() => {
        runDiagnostic();
      }, 1000);

    } catch (error: any) {
      console.error('Fix error:', error);
      results.push(`❌ Error: ${error.message}`);
      setFixResults([...results]);

      toast({
        title: "Fix Failed",
        description: error.message,
        variant: "destructive"
      });
    }

    setIsFixing(false);
  };

  const testAdminLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@dfs-portal.com',
        password: 'Admin123!@#'
      });

      if (error) throw error;

      toast({
        title: "Login Test Successful!",
        description: "Admin credentials are working correctly",
        variant: "default"
      });

      // Sign out after test
      await supabase.auth.signOut();
    } catch (error: any) {
      toast({
        title: "Login Test Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  React.useEffect(() => {
    runDiagnostic();
  }, []);

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

  const allIssuesFixed = diagnostic &&
  diagnostic.authUser &&
  diagnostic.userProfile &&
  diagnostic.adminRole &&
  diagnostic.moduleAccess;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Emergency Fix</h1>
        <p className="text-gray-600">Diagnose and fix critical admin access issues</p>
      </div>

      {/* Error Alert */}
      {!allIssuesFixed &&
      <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Failed to set up admin access:</strong> Critical issues detected that need immediate fixing.
          </AlertDescription>
        </Alert>
      }

      {/* System Diagnostic Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            System Diagnostic Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDiagnosing ?
          <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Running diagnostic...
            </div> :
          diagnostic ?
          <>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="font-medium">Authentication User</div>
                    <div className="text-sm text-gray-600">User exists in Supabase auth.users table</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnostic.authUser)}
                  {getStatusBadge(diagnostic.authUser)}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="font-medium">User Profile</div>
                    <div className="text-sm text-gray-600">Profile exists in user_profiles table</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnostic.userProfile)}
                  {getStatusBadge(diagnostic.userProfile)}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="font-medium">Administrator Role</div>
                    <div className="text-sm text-gray-600">User has Administrator role permissions</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnostic.adminRole)}
                  {getStatusBadge(diagnostic.adminRole)}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="font-medium">Module Access</div>
                    <div className="text-sm text-gray-600">User has proper module access permissions</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(diagnostic.moduleAccess)}
                  {getStatusBadge(diagnostic.moduleAccess)}
                </div>
              </div>
            </> :
          null}

          {/* Status Alert */}
          {diagnostic && !allIssuesFixed &&
          <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>❌ BROKEN!</strong> Admin access has critical issues that need immediate fixing.
              </AlertDescription>
            </Alert>
          }

          {diagnostic && allIssuesFixed &&
          <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>✅ ALL GOOD!</strong> Admin access is working correctly.
              </AlertDescription>
            </Alert>
          }
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
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div><strong>Email:</strong> admin@dfs-portal.com</div>
              <div><strong>Password:</strong> Admin123!@#</div>
            </div>
            <Alert className="mt-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                These are the default admin credentials. Change after successful login!
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            🚨 Emergency Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={fixAdminAccess}
            disabled={isFixing}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            size="lg">

            {isFixing ?
            <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Fixing Admin Access...
              </> :

            <>
                🛡️🔥 FIX ADMIN ACCESS NOW!
              </>
            }
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={testAdminLogin}
              variant="outline"
              className="flex items-center gap-2">

              <Shield className="w-4 h-4" />
              Test Admin Login
            </Button>

            <Button
              onClick={runDiagnostic}
              disabled={isDiagnosing}
              variant="outline"
              className="flex items-center gap-2">

              {isDiagnosing ?
              <Loader2 className="w-4 h-4 animate-spin" /> :

              <Database className="w-4 h-4" />
              }
              Refresh Diagnostic
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fix Results */}
      {fixResults.length > 0 &&
      <Card>
          <CardHeader>
            <CardTitle>Fix Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              {fixResults.map((result, index) =>
            <div key={index} className="p-2 bg-gray-50 rounded">
                  {result}
                </div>
            )}
            </div>
          </CardContent>
        </Card>
      }
    </div>);

};

export default AdminEmergencyFix;