import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Shield, UserPlus, Database, CheckCircle } from 'lucide-react';

const AdminSetupComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const { toast } = useToast();

  const ADMIN_EMAIL = 'admin@dfs-portal.com';
  const ADMIN_PASSWORD = 'Admin123!@#';

  useEffect(() => {
    checkAdminUser();
  }, []);

  const checkAdminUser = async () => {
    try {
      setCheckingAdmin(true);
      
      // Check if admin user exists in user_profiles
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .ilike('role', '%admin%')
        .limit(1);

      if (error) {
        console.error('Error checking admin user:', error);
      } else {
        setAdminExists(data && data.length > 0);
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

      if (authError) {
        // Check if user already exists
        if (authError.message.includes('already registered')) {
          // Try to sign in instead
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
          });

          if (signInError) {
            toast({
              title: 'Admin Setup Failed',
              description: `Admin user exists but password might be different: ${signInError.message}`,
              variant: 'destructive'
            });
          } else {
            // User exists, now create profile
            await createAdminProfile(signInData.user.id);
          }
        } else {
          throw authError;
        }
      } else if (authData.user) {
        // User created successfully, create profile
        await createAdminProfile(authData.user.id);
      }

    } catch (error: any) {
      console.error('Admin setup error:', error);
      toast({
        title: 'Admin Setup Failed',
        description: error.message,
        variant: 'destructive'
      });
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

      if (existingProfile) {
        // Update existing profile to admin
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            role: 'Administrator',
            is_active: true,
            detailed_permissions: {
              admin: { view: true, create: true, edit: true, delete: true },
              users: { view: true, create: true, edit: true, delete: true },
              stations: { view: true, create: true, edit: true, delete: true },
              products: { view: true, create: true, edit: true, delete: true },
              sales: { view: true, create: true, edit: true, delete: true },
              employees: { view: true, create: true, edit: true, delete: true }
            }
          })
          .eq('user_id', userId);

        if (updateError) throw updateError;
      } else {
        // Create new admin profile
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            role: 'Administrator',
            station_id: null,
            employee_id: 'ADMIN001',
            phone: '',
            hire_date: new Date().toISOString().split('T')[0],
            is_active: true,
            detailed_permissions: {
              admin: { view: true, create: true, edit: true, delete: true },
              users: { view: true, create: true, edit: true, delete: true },
              stations: { view: true, create: true, edit: true, delete: true },
              products: { view: true, create: true, edit: true, delete: true },
              sales: { view: true, create: true, edit: true, delete: true },
              employees: { view: true, create: true, edit: true, delete: true }
            }
          });

        if (insertError) throw insertError;
      }

      setAdminExists(true);
      toast({
        title: 'Admin Setup Complete',
        description: `Admin user created successfully! Email: ${ADMIN_EMAIL}`,
        variant: 'default'
      });

    } catch (error: any) {
      console.error('Profile creation error:', error);
      toast({
        title: 'Profile Creation Failed',
        description: error.message,
        variant: 'destructive'
      });
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
          title: 'Login Test Successful',
          description: 'Admin user can login successfully!',
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

  if (checkingAdmin) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Checking Admin Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Account Setup
          </CardTitle>
          <CardDescription>
            Setup or verify the system administrator account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {adminExists ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Admin user already exists and is properly configured.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                No admin user found. Click the button below to create the system administrator account.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={ADMIN_EMAIL}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-password">Admin Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={ADMIN_PASSWORD}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Default password. Change after first login.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {!adminExists && (
              <Button
                onClick={createAdminUser}
                disabled={isLoading}
                className="flex-1"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isLoading ? 'Creating...' : 'Create Admin User'}
              </Button>
            )}

            <Button
              onClick={testAdminLogin}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? 'Testing...' : 'Test Login'}
            </Button>
          </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Use the admin credentials above to log in</li>
            <li>Navigate to the Admin Panel via the "More Menu" dropdown</li>
            <li>Change the default password in Security Settings</li>
            <li>Create additional user accounts as needed</li>
            <li>Configure station settings and permissions</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetupComponent;