import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Shield, UserPlus, Database, CheckCircle, AlertCircle, Copy, Eye, EyeOff } from 'lucide-react';

const AdminSetupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const { toast } = useToast();

  const ADMIN_EMAIL = 'admin@dfs-portal.com';
  const ADMIN_PASSWORD = 'Admin123!@#';

  useEffect(() => {
    checkAdminUser();
  }, []);

  const checkAdminUser = async () => {
    try {
      setCheckingAdmin(true);
      
      // Check if admin user exists in user_profiles with admin role
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*, auth_users:user_id(*)')
        .or('role.ilike.%admin%,role.ilike.%administrator%')
        .limit(1);

      if (error) {
        console.error('Error checking admin user:', error);
      } else {
        setAdminExists(data && data.length > 0);
        if (data && data.length > 0) {
          setSetupStep(3); // Admin exists, show success
        }
      }
    } catch (error) {
      console.error('Failed to check admin user:', error);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const createAdminUser = async () => {
    try {
      setIsLoading(true);
      setSetupStep(2);

      toast({
        title: 'Creating Admin User',
        description: 'Please wait while we set up the administrator account...',
      });

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
          data: {
            full_name: 'System Administrator'
          }
        }
      });

      let userId = null;

      if (authError) {
        if (authError.message.includes('already registered')) {
          // User exists, try to get user ID by signing in
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
          });

          if (signInError) {
            throw new Error(`Admin user exists but password verification failed: ${signInError.message}`);
          }

          userId = signInData.user.id;
          // Sign out immediately after getting ID
          await supabase.auth.signOut();
        } else {
          throw authError;
        }
      } else if (authData.user) {
        userId = authData.user.id;
      }

      if (!userId) {
        throw new Error('Failed to create or retrieve admin user ID');
      }

      // Step 2: Create admin profile
      await createAdminProfile(userId);

    } catch (error: any) {
      console.error('Admin setup error:', error);
      toast({
        title: 'Admin Setup Failed',
        description: error.message,
        variant: 'destructive'
      });
      setSetupStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const createAdminProfile = async (userId: string) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const profileData = {
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
          employees: { view: true, create: true, edit: true, delete: true },
          delivery: { view: true, create: true, edit: true, delete: true },
          vendors: { view: true, create: true, edit: true, delete: true },
          orders: { view: true, create: true, edit: true, delete: true },
          licenses: { view: true, create: true, edit: true, delete: true },
          salary: { view: true, create: true, edit: true, delete: true }
        }
      };

      if (existingProfile) {
        // Update existing profile to admin
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', userId);

        if (updateError) throw updateError;
      } else {
        // Create new admin profile
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            ...profileData
          });

        if (insertError) throw insertError;
      }

      setAdminExists(true);
      setSetupStep(3);
      
      toast({
        title: 'Admin Setup Complete!',
        description: `Administrator account created successfully with email: ${ADMIN_EMAIL}`,
        variant: 'default'
      });

    } catch (error: any) {
      console.error('Profile creation error:', error);
      throw new Error(`Failed to create admin profile: ${error.message}`);
    }
  };

  const testAdminLogin = async () => {
    try {
      setIsLoading(true);

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
          description: 'Admin user can login successfully. You can now access the admin panel.',
          variant: 'default'
        });

        // Sign out immediately after test
        await supabase.auth.signOut();
      }
    } catch (error: any) {
      console.error('Login test error:', error);
      toast({
        title: 'Login Test Failed',
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
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Checking Admin Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">DFS Manager Portal</h1>
          <p className="text-xl text-gray-600">Administrator Account Setup</p>
          <Badge variant="outline" className="mt-2">
            Step {setupStep} of 3
          </Badge>
        </div>

        {/* Setup Steps */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Main Setup Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {setupStep === 1 && 'Step 1: Create Administrator Account'}
                {setupStep === 2 && 'Step 2: Setting Up Admin Profile'}
                {setupStep === 3 && 'Step 3: Setup Complete!'}
              </CardTitle>
              <CardDescription>
                {setupStep === 1 && 'Create the system administrator account to manage the DFS Portal'}
                {setupStep === 2 && 'Configuring administrator privileges and permissions...'}
                {setupStep === 3 && 'Administrator account is ready for use'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {setupStep === 1 && (
                <>
                  {adminExists ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Administrator account already exists and is properly configured.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <Database className="h-4 w-4" />
                      <AlertDescription>
                        No administrator account found. Click the button below to create the system administrator account.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="admin-email">Administrator Email</Label>
                      <div className="flex gap-2">
                        <Input
                          id="admin-email"
                          type="email"
                          value={ADMIN_EMAIL}
                          disabled
                          className="bg-gray-50"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(ADMIN_EMAIL, 'Email')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="admin-password">Administrator Password</Label>
                      <div className="flex gap-2">
                        <Input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
                          value={ADMIN_PASSWORD}
                          disabled
                          className="bg-gray-50"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(ADMIN_PASSWORD, 'Password')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-orange-600 font-medium">
                        ⚠️ Change this password after first login for security
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {!adminExists && (
                      <Button
                        onClick={createAdminUser}
                        disabled={isLoading}
                        className="flex-1"
                        size="lg"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {isLoading ? 'Creating Administrator...' : 'Create Administrator Account'}
                      </Button>
                    )}

                    <Button
                      onClick={testAdminLogin}
                      disabled={isLoading}
                      variant="outline"
                      size="lg"
                    >
                      {isLoading ? 'Testing...' : 'Test Login'}
                    </Button>
                  </div>
                </>
              )}

              {setupStep === 2 && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg font-medium">Setting up administrator account...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                </div>
              )}

              {setupStep === 3 && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-green-800">Setup Complete!</h3>
                    <p className="text-green-600 mt-2">Administrator account is ready for use</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg text-left">
                    <h4 className="font-medium text-green-800 mb-2">Next Steps:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-green-700">
                      <li>Use the admin credentials to log in</li>
                      <li>Access the Admin Panel via the "More Menu" dropdown</li>
                      <li>Change the default password in Security Settings</li>
                      <li>Create station and employee accounts</li>
                      <li>Configure system settings as needed</li>
                    </ol>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={testAdminLogin}
                      disabled={isLoading}
                      variant="default"
                      size="lg"
                      className="flex-1"
                    >
                      Test Admin Login
                    </Button>
                    <Button
                      onClick={() => window.location.href = '/login'}
                      variant="outline"
                      size="lg"
                      className="flex-1"
                    >
                      Go to Login Page
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={checkAdminUser}
                disabled={isLoading}
                variant="ghost"
                className="w-full"
              >
                Refresh Status
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• The default password is temporary and should be changed immediately</p>
              <p>• Admin account has full system access</p>
              <p>• All actions are logged for security audit</p>
              <p>• Two-factor authentication can be enabled later</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Features</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Complete user and role management</p>
              <p>• Station and inventory tracking</p>
              <p>• Sales reporting and analytics</p>
              <p>• SMS notifications and alerts</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSetupPage;