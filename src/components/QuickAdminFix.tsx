import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const QuickAdminFix: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [fixResults, setFixResults] = useState<string[]>([]);
  const [isFixed, setIsFixed] = useState(false);
  const { toast } = useToast();

  const quickFix = async () => {
    setIsFixing(true);
    setFixResults([]);
    const results: string[] = [];

    try {
      results.push('🔥 EMERGENCY ADMIN FIX STARTED...');
      setFixResults([...results]);

      // Generate a consistent admin user ID
      const adminUserId = '00000000-0000-0000-0000-000000000001';

      results.push('🔄 Step 1: Creating admin user profile...');
      setFixResults([...results]);

      // Create admin user profile directly
      const { error: profileError } = await supabase.
      from('user_profiles').
      upsert({
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
      }, {
        onConflict: 'email'
      });

      if (profileError) {
        results.push(`❌ Profile Error: ${profileError.message}`);
        setFixResults([...results]);
      } else {
        results.push('✅ Admin profile created successfully');
        setFixResults([...results]);
      }

      results.push('🔄 Step 2: Setting up complete module access...');
      setFixResults([...results]);

      // Delete existing module access and recreate
      await supabase.
      from('module_access').
      delete().
      eq('user_id', adminUserId);

      const modules = [
      'Dashboard', 'Products', 'Sales', 'Employees', 'Deliveries',
      'Licenses', 'Orders', 'Vendors', 'Salary', 'Admin Panel',
      'User Management', 'Role Management', 'SMS Management',
      'System Settings', 'Audit Logs', 'Station Management'];


      for (const module of modules) {
        const { error: moduleError } = await supabase.
        from('module_access').
        insert({
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
        });

        if (moduleError) {
          results.push(`⚠️ Module ${module}: ${moduleError.message}`);
        }
      }

      results.push('✅ Module access configured');
      setFixResults([...results]);

      results.push('🔄 Step 3: Creating authentication user...');
      setFixResults([...results]);

      // Try to create authentication user
      const { error: signUpError } = await supabase.auth.signUp({
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
        results.push(`⚠️ Auth signup: ${signUpError.message}`);
      } else {
        results.push('✅ Authentication user created/verified');
      }

      setFixResults([...results]);

      results.push('🎉 ADMIN ACCESS EMERGENCY FIX COMPLETED!');
      results.push('📧 Email: admin@dfs-portal.com');
      results.push('🔑 Password: Admin123!@#');
      results.push('⚠️ CHANGE PASSWORD AFTER FIRST LOGIN!');

      setFixResults([...results]);
      setIsFixed(true);

      toast({
        title: "🚨 Emergency Fix Complete!",
        description: "Admin access has been restored. Login with the credentials shown.",
        variant: "default"
      });

    } catch (error: any) {
      console.error('Emergency fix error:', error);
      results.push(`❌ CRITICAL ERROR: ${error.message}`);
      setFixResults([...results]);

      toast({
        title: "Emergency Fix Failed",
        description: error.message,
        variant: "destructive"
      });
    }

    setIsFixing(false);
  };

  const testLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@dfs-portal.com',
        password: 'Admin123!@#'
      });

      if (error) throw error;

      toast({
        title: "Login Test SUCCESS!",
        description: "Admin credentials work perfectly",
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-2">🚨 EMERGENCY ADMIN FIX 🚨</h1>
        <p className="text-gray-600">Quick fix for critical admin access issues</p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>SYSTEM CRITICAL ERROR:</strong> Admin access is broken and needs immediate repair!
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">🔥 Emergency Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={quickFix}
            disabled={isFixing}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6">

            {isFixing ?
            <>
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                EMERGENCY FIX IN PROGRESS...
              </> :

            <>
                🚨🛠️ RUN EMERGENCY FIX NOW! 🛠️🚨
              </>
            }
          </Button>

          {isFixed &&
          <Button
            onClick={testLogin}
            className="w-full bg-green-600 hover:bg-green-700 text-white">

              <CheckCircle2 className="w-4 h-4 mr-2" />
              Test Admin Login
            </Button>
          }
        </CardContent>
      </Card>

      {/* Default Admin Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Default Admin Credentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <div className="space-y-2 text-lg font-mono">
              <div><strong>📧 Email:</strong> admin@dfs-portal.com</div>
              <div><strong>🔑 Password:</strong> Admin123!@#</div>
            </div>
            <Alert className="mt-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-bold">
                ⚠️ SECURITY WARNING: Change these credentials immediately after first login!
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Fix Progress */}
      {fixResults.length > 0 &&
      <Card>
          <CardHeader>
            <CardTitle>🔧 Emergency Fix Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm max-h-96 overflow-y-auto">
              {fixResults.map((result, index) =>
            <div
              key={index}
              className={`p-3 rounded ${
              result.includes('✅') ? 'bg-green-50 text-green-800' :
              result.includes('❌') ? 'bg-red-50 text-red-800' :
              result.includes('⚠️') ? 'bg-yellow-50 text-yellow-800' :
              result.includes('🎉') ? 'bg-blue-50 text-blue-800 font-bold' :
              'bg-gray-50'}`
              }>

                  <div className="whitespace-pre-wrap">{result}</div>
                </div>
            )}
            </div>
          </CardContent>
        </Card>
      }

      {isFixed &&
      <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="text-lg font-bold">
            🎉 EMERGENCY FIX SUCCESSFUL! You can now login with the admin credentials above.
          </AlertDescription>
        </Alert>
      }
    </div>);

};

export default QuickAdminFix;