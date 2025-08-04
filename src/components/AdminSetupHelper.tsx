import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, CheckCircle } from 'lucide-react';

const AdminSetupHelper = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const { user, userProfile } = useSupabaseAuth();
  const { toast } = useToast();

  const createAdminUser = async () => {
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // First register the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'Administrator'
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Create admin profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            email: email,
            first_name: 'Administrator',
            last_name: '',
            user_role: 'Administrator',
            permissions: {
              admin: {
                view: true,
                create: true,
                edit: true,
                delete: true
              }
            },
            station_access: {},
            is_active: true,
            phone: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        setSetupComplete(true);
        toast({
          title: 'Admin User Created',
          description: 'Administrator account has been created successfully. Please check your email for verification.',
          duration: 5000
        });
      }

    } catch (error: any) {
      console.error('Admin setup error:', error);
      toast({
        title: 'Setup Failed',
        description: error.message || 'Failed to create admin user',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show if user is already admin
  if (userProfile?.user_role === 'Administrator') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
          <CardTitle className="text-green-600">Admin Access Confirmed</CardTitle>
          <CardDescription>You have administrator privileges</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (setupComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
          <CardTitle className="text-green-600">Setup Complete</CardTitle>
          <CardDescription>
            Administrator account created successfully. Please check your email to verify the account and then log in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.href = '/login'} 
            className="w-full"
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <Shield className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <CardTitle>Create Administrator Account</CardTitle>
        <CardDescription>
          Set up the first administrator account for the DFS Manager Portal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            This will create an administrator account with full system access.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="email">Administrator Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter a secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <Button 
          onClick={createAdminUser} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>Creating Administrator...</>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Administrator
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminSetupHelper;