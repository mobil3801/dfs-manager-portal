import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Shield, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const AdminAccessFix = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [adminStatus, setAdminStatus] = useState<{
    authUser: boolean;
    userProfile: boolean;
    adminRole: boolean;
    canLogin: boolean;
  }>({
    authUser: false,
    userProfile: false,
    adminRole: false,
    canLogin: false
  });
  const { toast } = useToast();

  const ADMIN_EMAIL = 'admin@dfs-portal.com';
  const ADMIN_PASSWORD = 'Admin123!@#';

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    setIsChecking(true);

    try {
      let authUserExists = false;
      let userProfileExists = false;
      let hasAdminRole = false;
      let userId = null;

      // Try to check if admin user exists by attempting login
      try {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        });

        if (!loginError && loginData.user) {
          authUserExists = true;
          userId = loginData.user.id;

          // Check user profile
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', userId)
              .single();

            if (!profileError && profileData) {
              userProfileExists = true;
              hasAdminRole = profileData.role === 'Administrator' || profileData.role === 'Admin';
            }
          } catch (profileError) {
            console.warn('Profile check failed:', profileError);
          }

          // Sign out immediately
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.warn('Auth check failed:', error);
        // Try to check profiles table directly
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('role', 'Administrator')
            .limit(1);

          if (!profileError && profileData && profileData.length > 0) {
            userProfileExists = true;
            hasAdminRole = true;
          }
        } catch (directError) {
          console.warn('Direct profile check failed:', directError);
        }
      }

      setAdminStatus({
        authUser: authUserExists,
        userProfile: userProfileExists,
        adminRole: hasAdminRole,
        canLogin: authUserExists && userProfileExists && hasAdminRole
      });

    } catch (error) {
      console.error('Error checking admin status:', error);
      // Set default failure state
      setAdminStatus({
        authUser: false,
        userProfile: false,
        adminRole: false,
        canLogin: false
      });
    } finally {
      setIsChecking(false);
    }
  };

  const fixAdminAccess = async () => {
    setIsChecking(true);

    try {
      // Step 1: Create/verify auth user
      if (!adminStatus.authUser) {
        const { data, error } = await supabase.auth.signUp({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          options: {
            data: {
              full_name: 'System Administrator'
            }
          }
        });

        if (error && !error.message.includes('already registered')) {
          throw error;
        }
      }

      // Step 2: Get user ID
      let userId = null;
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });

      if (signInError) {
        throw new Error(`Cannot sign in: ${signInError.message}`);
      }

      userId = signInData.user.id;
      await supabase.auth.signOut();

      // Step 3: Create/update user profile
      const adminProfileData = {
        role: 'Administrator',
        is_active: true,
        employee_id: 'ADMIN001',
        phone: '',
        hire_date: new Date().toISOString().split('T')[0],
        detailed_permissions: {
          admin: { view: true, create: true, edit: true, delete: true },
          users: { view: true, create: true, edit: true, delete: true },
          stations: { view: true, create: true, edit: true, delete: true },
          products: { view: true, create: true, edit: true, delete: true },
          sales: { view: true, create: true, edit: true, delete: true },
          employees: { view: true, create: true, edit: true, delete: true }
        }
      };

      const { data: existingProfile } = await supabase.
      from('user_profiles').
      select('*').
      eq('user_id', userId).
      single();

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase.
        from('user_profiles').
        update(adminProfileData).
        eq('user_id', userId);

        if (updateError) throw updateError;
      } else {
        // Create new profile
        const { error: insertError } = await supabase.
        from('user_profiles').
        insert({
          user_id: userId,
          ...adminProfileData
        });

        if (insertError) throw insertError;
      }

      toast({
        title: 'Success!',
        description: 'Admin access has been fixed and configured properly',
        variant: 'default'
      });

      // Recheck status
      await checkAdminStatus();

    } catch (error: any) {
      console.error('Error fixing admin access:', error);
      toast({
        title: 'Error',
        description: `Failed to fix admin access: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const testAdminLogin = async () => {
    setIsChecking(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });

      if (error) {
        toast({
          title: 'Login Test Failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Login Test Successful!',
          description: 'Admin user can login successfully',
          variant: 'default'
        });

        // Sign out after test
        await supabase.auth.signOut();
      }
    } catch (error: any) {
      toast({
        title: 'Login Test Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const StatusItem = ({ label, status, description }: {label: string;status: boolean;description: string;}) =>
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {status ?
        <CheckCircle className="w-4 h-4 text-green-600" /> :

        <AlertTriangle className="w-4 h-4 text-red-600" />
        }
          <span className="font-medium">{label}</span>
        </div>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
      <div className={`px-2 py-1 rounded text-xs font-medium ${
    status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`
    }>
        {status ? 'OK' : 'ISSUE'}
      </div>
    </div>;


  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Admin Access Diagnostics
        </CardTitle>
        <CardDescription>
          Diagnose and fix admin account access issues for {ADMIN_EMAIL}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Status Overview */}
        <div className="space-y-3">
          <h3 className="font-medium">System Status</h3>
          <StatusItem
            label="Authentication User"
            status={adminStatus.authUser}
            description="User exists in Supabase Auth system" />

          <StatusItem
            label="User Profile"
            status={adminStatus.userProfile}
            description="Profile exists in user_profiles table" />

          <StatusItem
            label="Admin Role"
            status={adminStatus.adminRole}
            description="User has Administrator role assigned" />

          <StatusItem
            label="Login Access"
            status={adminStatus.canLogin}
            description="User can successfully authenticate" />

        </div>

        {/* Overall Status */}
        <Alert>
          {adminStatus.canLogin ?
          <>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Admin access is working correctly. The admin user can log in and access the admin panel.
              </AlertDescription>
            </> :

          <>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Admin access has issues that need to be resolved. Use the fix button below.
              </AlertDescription>
            </>
          }
        </Alert>

        {/* Admin Credentials */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Admin Credentials</h4>
          <div className="space-y-1 text-sm">
            <p><strong>Email:</strong> {ADMIN_EMAIL}</p>
            <p><strong>Password:</strong> {ADMIN_PASSWORD}</p>
            <p className="text-blue-700 text-xs mt-2">
              ⚠️ Change the password after successful login for security
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={fixAdminAccess}
            disabled={isChecking || adminStatus.canLogin}
            className="flex-1">

            {isChecking ?
            <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Fixing...
              </> :

            'Fix Admin Access'
            }
          </Button>
          
          <Button
            onClick={testAdminLogin}
            disabled={isChecking}
            variant="outline"
            className="flex-1">

            {isChecking ? 'Testing...' : 'Test Login'}
          </Button>
        </div>

        <Button
          onClick={checkAdminStatus}
          disabled={isChecking}
          variant="ghost"
          className="w-full">

          {isChecking ?
          <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </> :

          'Refresh Status'
          }
        </Button>

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-2">
          <h4 className="font-medium text-gray-900">How to Access Admin Panel:</h4>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Log in using the admin credentials above</li>
            <li>Click on "More Menu" in the top navigation</li>
            <li>Select "Admin Panel" from the dropdown</li>
            <li>You'll have access to all administrative functions</li>
          </ol>
        </div>
      </CardContent>
    </Card>);

};

export default AdminAccessFix;