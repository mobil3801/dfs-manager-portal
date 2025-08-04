import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, AlertTriangle, RefreshCw, UserPlus, Key, Database } from 'lucide-react';

const AdminAccessEmergencyFix = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [checkResults, setCheckResults] = useState<{
    authUserExists: boolean;
    profileExists: boolean;
    hasAdminRole: boolean;
    checked: boolean;
  }>({
    authUserExists: false,
    profileExists: false,
    hasAdminRole: false,
    checked: false
  });
  const { toast } = useToast();

  const ADMIN_EMAIL = 'admin@dfs-portal.com';
  const ADMIN_PASSWORD = 'Admin123!@#';

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      // Check if auth user exists
      const authResult = await window.ezsite.apis.run({
        path: "check-auth-user",
        param: [ADMIN_EMAIL]
      });

      // Check if profile exists
      const profileResult = await window.ezsite.apis.run({
        path: "check-user-profile",
        param: [ADMIN_EMAIL]
      });

      setCheckResults({
        authUserExists: authResult?.exists || false,
        profileExists: profileResult?.exists || false,
        hasAdminRole: profileResult?.role === 'Administrator',
        checked: true
      });

    } catch (error) {
      console.error('Error checking admin status:', error);
      setCheckResults({
        authUserExists: false,
        profileExists: false,
        hasAdminRole: false,
        checked: true
      });
    }
  };

  const createAdminUser = async () => {
    setIsFixing(true);
    try {
      // Step 1: Create auth user if doesn't exist
      if (!checkResults.authUserExists) {
        toast({
          title: 'Creating Admin User',
          description: 'Creating authentication user...'
        });

        const createAuthResult = await window.ezsite.apis.run({
          path: "create-admin-auth-user",
          param: [ADMIN_EMAIL, ADMIN_PASSWORD]
        });

        if (!createAuthResult.success) {
          throw new Error(`Failed to create auth user: ${createAuthResult.error}`);
        }
      }

      // Step 2: Create/update user profile with Administrator role
      toast({
        title: 'Setting Up Admin Profile',
        description: 'Creating administrator profile...'
      });

      const createProfileResult = await window.ezsite.apis.run({
        path: "create-admin-profile",
        param: [ADMIN_EMAIL]
      });

      if (!createProfileResult.success) {
        throw new Error(`Failed to create admin profile: ${createProfileResult.error}`);
      }

      toast({
        title: 'Success!',
        description: 'Admin access has been configured successfully',
        variant: 'default'
      });

      // Recheck status
      await checkAdminStatus();

    } catch (error: any) {
      console.error('Error creating admin user:', error);
      toast({
        title: 'Error',
        description: `Failed to set up admin access: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setIsFixing(false);
    }
  };

  const testAdminLogin = async () => {
    setIsFixing(true);
    try {
      const testResult = await window.ezsite.apis.run({
        path: "test-admin-login",
        param: [ADMIN_EMAIL, ADMIN_PASSWORD]
      });

      if (testResult.success) {
        toast({
          title: 'Login Test Successful!',
          description: 'Admin user can login successfully',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Login Test Failed',
          description: testResult.error || 'Login test failed',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Login Test Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsFixing(false);
    }
  };

  const StatusItem = ({
    icon: Icon,
    label,
    status,
    description





  }: {icon: React.ComponentType<any>;label: string;status: boolean;description: string;}) =>
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${status ? 'text-green-600' : 'text-red-600'}`} />
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


  const allSystemsGo = checkResults.authUserExists && checkResults.profileExists && checkResults.hasAdminRole;

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <Shield className="w-5 h-5" />
          🚨 ADMIN ACCESS EMERGENCY FIX 🚨
        </CardTitle>
        <CardDescription>
          Emergency diagnostics and fix for admin@dfs-portal.com access issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Critical Admin Info */}
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>CRITICAL:</strong> Admin access is currently broken for {ADMIN_EMAIL}
          </AlertDescription>
        </Alert>

        {/* Status Check Results */}
        {checkResults.checked &&
        <div className="space-y-3">
            <h3 className="font-medium text-lg">System Diagnostic Results</h3>
            
            <StatusItem
            icon={UserPlus}
            label="Authentication User"
            status={checkResults.authUserExists}
            description="User exists in Supabase auth.users table" />


            <StatusItem
            icon={Database}
            label="User Profile"
            status={checkResults.profileExists}
            description="Profile exists in user_profiles table" />


            <StatusItem
            icon={Key}
            label="Administrator Role"
            status={checkResults.hasAdminRole}
            description="User has Administrator role permissions" />

          </div>
        }

        {/* Overall Status */}
        <Alert className={allSystemsGo ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {allSystemsGo ?
          <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>✅ FIXED!</strong> Admin access is now working correctly.
              </AlertDescription>
            </> :

          <>
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>❌ BROKEN!</strong> Admin access has critical issues that need immediate fixing.
              </AlertDescription>
            </>
          }
        </Alert>

        {/* Admin Credentials */}
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Key className="w-4 h-4" />
            Admin Credentials
          </h4>
          <div className="space-y-1 text-sm">
            <p><strong>Email:</strong> {ADMIN_EMAIL}</p>
            <p><strong>Password:</strong> {ADMIN_PASSWORD}</p>
            <p className="text-blue-700 text-xs mt-2">
              ⚠️ These are the default admin credentials. Change after successful login!
            </p>
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="space-y-3">
          <h3 className="font-medium text-lg text-red-600">🚨 Emergency Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={createAdminUser}
              disabled={isFixing || allSystemsGo}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="lg">

              {isFixing ?
              <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Fixing Admin Access...
                </> :

              <>
                  <Shield className="w-4 h-4 mr-2" />
                  🔥 FIX ADMIN ACCESS NOW!
                </>
              }
            </Button>
            
            <Button
              onClick={testAdminLogin}
              disabled={isFixing}
              variant="outline"
              size="lg"
              className="border-blue-600 text-blue-600 hover:bg-blue-50">

              {isFixing ? 'Testing...' :
              <>
                  <Key className="w-4 h-4 mr-2" />
                  Test Admin Login
                </>
              }
            </Button>
          </div>

          <Button
            onClick={checkAdminStatus}
            disabled={isFixing}
            variant="ghost"
            className="w-full">

            {isFixing ?
            <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Checking Status...
              </> :

            <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Diagnostic
              </>
            }
          </Button>
        </div>

        {/* Success Instructions */}
        {allSystemsGo &&
        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
            <h4 className="font-medium text-green-900 mb-2">🎉 Admin Access Restored!</h4>
            <div className="text-sm text-green-800 space-y-2">
              <p><strong>How to access the admin panel:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Log in using: {ADMIN_EMAIL} / {ADMIN_PASSWORD}</li>
                <li>Click "More Menu" in the top navigation</li>
                <li>Select "Admin Panel" from the dropdown</li>
                <li>You now have full administrative access!</li>
              </ol>
            </div>
          </div>
        }

        {/* Technical Details */}
        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
          <strong>Technical Details:</strong> This tool creates the admin user in both auth.users and user_profiles tables
          with proper Administrator role assignment and all necessary permissions.
        </div>
      </CardContent>
    </Card>);

};

export default AdminAccessEmergencyFix;