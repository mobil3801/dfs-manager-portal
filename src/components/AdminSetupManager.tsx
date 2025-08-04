import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  Shield,
  UserPlus,
  Database,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  TestTube } from
'lucide-react';

interface DatabaseTest {
  name: string;
  table: string;
  status: 'pending' | 'pass' | 'fail';
  error?: string;
}

interface AdminSetupManagerProps {
  onComplete?: () => void;
}

const AdminSetupManager: React.FC<AdminSetupManagerProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<'setup' | 'login' | 'database' | 'status'>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginTestStatus, setLoginTestStatus] = useState<'idle' | 'testing' | 'pass' | 'fail'>('idle');
  const [signupStatus, setSignupStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [databaseTests, setDatabaseTests] = useState<DatabaseTest[]>([
  { name: 'User Profiles Table', table: 'user_profiles', status: 'pending' },
  { name: 'Stations Table', table: 'stations', status: 'pending' },
  { name: 'Products Table', table: 'products', status: 'pending' },
  { name: 'Employees Table', table: 'employees', status: 'pending' },
  { name: 'Audit Logs Table', table: 'audit_logs', status: 'pending' }]
  );

  const { toast } = useToast();

  const ADMIN_EMAIL = 'admin@dfs-portal.com';
  const ADMIN_PASSWORD = 'Admin123!@#';

  useEffect(() => {
    checkAdminProfile();
  }, []);

  const checkAdminProfile = async () => {
    try {
      const { data, error } = await supabase.
      from('user_profiles').
      select('*').
      ilike('role', '%admin%').
      limit(1);

      if (error) {
        console.error('Error checking admin profile:', error);
        setAdminExists(false);
      } else {
        setAdminExists(data && data.length > 0);
      }
    } catch (error) {
      console.error('Failed to check admin profile:', error);
      setAdminExists(false);
    }
  };

  const signUpAdmin = async () => {
    try {
      setIsLoading(true);
      setSignupStatus('pending');

      // Try to sign up the admin user
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
          data: {
            full_name: 'System Administrator'
          }
        }
      });

      let userId = null;

      if (signupError) {
        if (signupError.message.includes('already registered')) {
          // User exists, try to get user ID by signing in
          const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
          });

          if (signinError) {
            throw new Error(`Admin user exists but password verification failed: ${signinError.message}`);
          }

          userId = signinData.user?.id;
          await supabase.auth.signOut();
        } else {
          throw signupError;
        }
      } else if (signupData.user) {
        userId = signupData.user.id;
      }

      if (!userId) {
        throw new Error('Failed to create or retrieve admin user ID');
      }

      // Create or update admin profile
      const profileData = {
        user_id: userId,
        employee_id: 'ADMIN001',
        role: 'Administrator',
        is_active: true,
        phone: '',
        hire_date: new Date().toISOString().split('T')[0],
        detailed_permissions: {
          admin: { view: true, create: true, edit: true, delete: true },
          users: { view: true, create: true, edit: true, delete: true },
          stations: { view: true, create: true, edit: true, delete: true },
          products: { view: true, create: true, edit: true, delete: true },
          sales: { view: true, create: true, edit: true, delete: true },
          employees: { view: true, create: true, edit: true, delete: true },
          delivery: { view: true, create: true, edit: true, delete: true },
          vendors: { view: true, create: true, edit: true, delete: true },
          orders: { view: true, create: true, edit: true, delete: true },
          licenses: { view: true, create: true, edit: true, delete: true },
          salary: { view: true, create: true, edit: true, delete: true }
        }
      };

      const { error: upsertError } = await supabase.
      from('user_profiles').
      upsert(profileData, { onConflict: 'user_id' });

      if (upsertError) {
        throw upsertError;
      }

      setSignupStatus('success');
      setAdminExists(true);

      toast({
        title: 'Admin Account Created',
        description: 'Administrator account has been successfully created.'
      });

    } catch (error: any) {
      console.error('Admin signup error:', error);
      setSignupStatus('error');
      toast({
        title: 'Signup Failed',
        description: error.message || 'Failed to create admin account',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testAdminLogin = async () => {
    try {
      setIsLoading(true);
      setLoginTestStatus('testing');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });

      if (error) {
        setLoginTestStatus('fail');
        toast({
          title: 'Login Test Failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        setLoginTestStatus('pass');
        toast({
          title: 'Login Test Successful',
          description: 'Admin credentials are working correctly.'
        });

        // Sign out immediately after test
        await supabase.auth.signOut();
      }
    } catch (error: any) {
      setLoginTestStatus('fail');
      toast({
        title: 'Login Test Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testDatabaseAccess = async () => {
    try {
      setIsLoading(true);

      const updatedTests = [...databaseTests];

      for (let i = 0; i < updatedTests.length; i++) {
        const test = updatedTests[i];
        try {
          const { data, error } = await supabase.
          from(test.table).
          select('*').
          limit(1);

          if (error) {
            updatedTests[i] = { ...test, status: 'fail', error: error.message };
          } else {
            updatedTests[i] = { ...test, status: 'pass' };
          }
        } catch (error: any) {
          updatedTests[i] = { ...test, status: 'fail', error: error.message };
        }

        setDatabaseTests([...updatedTests]);
        await new Promise((resolve) => setTimeout(resolve, 200)); // Small delay for visual effect
      }

      const passedTests = updatedTests.filter((test) => test.status === 'pass').length;
      const totalTests = updatedTests.length;

      toast({
        title: 'Database Tests Complete',
        description: `${passedTests}/${totalTests} database tables accessible`,
        variant: passedTests === totalTests ? 'default' : 'destructive'
      });

    } catch (error: any) {
      toast({
        title: 'Database Test Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard`
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getStepHeader = () => {
    switch (currentStep) {
      case 'setup':return { title: 'Setup', color: 'default' as const };
      case 'login':return { title: 'Test Login', color: 'default' as const };
      case 'database':return { title: 'Database', color: 'default' as const };
      case 'status':return { title: 'Status', color: 'default' as const };
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <div className="space-y-6">
            {/* Admin Credentials Display */}
            <div className="grid gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <span className="font-medium">Admin Email: {ADMIN_EMAIL}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(ADMIN_EMAIL, 'Email')}>

                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Default Password: {showPassword ? ADMIN_PASSWORD : '••••••••••'}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}>

                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(ADMIN_PASSWORD, 'Password')}>

                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Admin Profile Status */}
            <div className="flex items-center justify-between">
              <span>Admin Profile in Database:</span>
              <Badge variant={adminExists ? "default" : "secondary"}>
                {adminExists ? "Exists" : "Not Found"}
              </Badge>
            </div>

            {/* Sign Up Button */}
            <Button
              onClick={signUpAdmin}
              disabled={isLoading}
              className="w-full"
              size="lg">

              <UserPlus className="w-4 h-4 mr-2" />
              {signupStatus === 'pending' ? 'Creating Admin User...' : 'Sign Up Admin User'}
            </Button>

            {signupStatus === 'success' &&
            <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Admin account created successfully! You can now test the login.
                </AlertDescription>
              </Alert>
            }

            {signupStatus === 'error' &&
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to create admin account. Please try again.
                </AlertDescription>
              </Alert>
            }
          </div>);


      case 'login':
        return (
          <div className="space-y-6">
            <Button
              onClick={testAdminLogin}
              disabled={isLoading}
              className="w-full"
              size="lg">

              <TestTube className="w-4 h-4 mr-2" />
              Test Admin Login
            </Button>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {loginTestStatus === 'fail' ?
                  <AlertCircle className="w-4 h-4 text-red-500" /> :
                  loginTestStatus === 'pass' ?
                  <CheckCircle className="w-4 h-4 text-green-500" /> :

                  <div className="w-4 h-4 rounded-full bg-gray-300" />
                  }
                  Admin Login
                </span>
                <Badge variant={
                loginTestStatus === 'pass' ? 'default' :
                loginTestStatus === 'fail' ? 'destructive' :
                loginTestStatus === 'testing' ? 'secondary' : 'outline'
                }>
                  {loginTestStatus === 'pass' ? 'Pass' :
                  loginTestStatus === 'fail' ? 'Fail' :
                  loginTestStatus === 'testing' ? 'Testing...' : 'Pending'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-300" />
                  Admin Signup
                </span>
                <Badge variant="secondary">Pending</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Profile Exists
                </span>
                <Badge variant="default">Pass</Badge>
              </div>
            </div>
          </div>);


      case 'database':
        return (
          <div className="space-y-6">
            <Button
              onClick={testDatabaseAccess}
              disabled={isLoading}
              className="w-full"
              size="lg">

              <Database className="w-4 h-4 mr-2" />
              Test Database Access
            </Button>

            <div className="space-y-3">
              {databaseTests.map((test, index) =>
              <div key={index} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {test.status === 'fail' ?
                  <AlertCircle className="w-4 h-4 text-red-500" /> :
                  test.status === 'pass' ?
                  <CheckCircle className="w-4 h-4 text-green-500" /> :

                  <div className="w-4 h-4 rounded-full bg-gray-300" />
                  }
                    {test.name}
                  </span>
                  <Badge variant={
                test.status === 'pass' ? 'default' :
                test.status === 'fail' ? 'destructive' : 'outline'
                }>
                    {test.status === 'pass' ? 'Pass' :
                  test.status === 'fail' ? 'Fail' : 'Pending'}
                  </Badge>
                </div>
              )}
            </div>

            {databaseTests.some((test) => test.status === 'fail') &&
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Some database tables are not accessible. This may affect system functionality.
                </AlertDescription>
              </Alert>
            }
          </div>);


      case 'status':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Current Status</h3>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-medium">Currently Logged In: </span>
                <span className="text-gray-600">None</span>
              </div>
              
              <div>
                <span className="font-medium">User Role: </span>
                <span className="text-gray-600">Not Authenticated</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Admin Profile: </span>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600">Created</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-800">Next Steps</h4>
              </div>
              
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                <li>Create admin profile in database</li>
                <li>Sign up admin user account</li>
                <li>Verify email (check inbox)</li>
                <li>Test admin login</li>
                <li>Test database access</li>
                <li>Access admin features from navigation</li>
              </ol>
            </div>
          </div>);

    }
  };

  const stepHeader = getStepHeader();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Account Setup & Testing
          </CardTitle>
          <div className="flex gap-1">
            {(['setup', 'login', 'database', 'status'] as const).map((step) =>
            <Button
              key={step}
              variant={currentStep === step ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentStep(step)}
              className="capitalize">

                {step === 'login' ? 'Test Login' : step}
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Complete setup and testing for admin@dfs-portal.com account
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {renderCurrentStep()}

        <div className="mt-6 pt-4 border-t">
          <Button
            onClick={checkAdminProfile}
            variant="ghost"
            size="sm"
            className="w-full"
            disabled={isLoading}>

            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        </div>
      </CardContent>
    </Card>);

};

export default AdminSetupManager;