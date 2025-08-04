import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Settings, User, Shield } from 'lucide-react';
import { supabase, safeSupabaseOperation } from '@/lib/supabase';
import { toast } from 'sonner';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  error?: string;
}

const FixedAdminSetup: React.FC = () => {
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'profile',
      title: 'Create Admin Profile',
      description: 'Setting up administrator user profile',
      status: 'pending'
    },
    {
      id: 'modules',
      title: 'Configure Module Access',
      description: 'Setting up complete system access',
      status: 'pending'
    },
    {
      id: 'verification',
      title: 'Verify Setup',
      description: 'Confirming all configurations are correct',
      status: 'pending'
    }
  ]);

  const updateStep = (id: string, updates: Partial<SetupStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const createAdminProfile = async () => {
    updateStep('profile', { status: 'running' });
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      const profileData = {
        user_id: user.id,
        email: user.email || 'admin@dfs-portal.com',
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
        station_access: {
          all_stations: true
        },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        // Create new profile
        profileData.id = user.id;
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([profileData]);

        if (insertError) throw insertError;
      }

      updateStep('profile', { status: 'success' });
      toast.success('Admin profile created successfully!');
    } catch (error: any) {
      console.error('Profile creation error:', error);
      updateStep('profile', { 
        status: 'error', 
        error: error.message || 'Failed to create admin profile'
      });
      toast.error('Failed to create admin profile');
    }
  };

  const setupModuleAccess = async () => {
    updateStep('modules', { status: 'running' });
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      // Clear existing module access
      const { error: deleteError } = await supabase
        .from('module_access')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.warn('Delete warning (may be expected):', deleteError);
      }

      // Define all modules with full access
      const modules = [
        'Dashboard', 'Users', 'Stations', 'Products', 'Sales', 
        'Deliveries', 'Employees', 'Licenses', 'Reports', 'Settings',
        'SMS Management', 'Audit Logs', 'Admin Panel'
      ];

      const moduleAccessData = modules.map(moduleName => ({
        id: crypto.randomUUID(),
        user_id: user.id,
        module_name: moduleName,
        access_level: 'full',
        is_active: true,
        granted_by: user.id,
        granted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_name: moduleName,
        create_enabled: true,
        edit_enabled: true,
        delete_enabled: true
      }));

      // Insert module access records
      const { error: insertError } = await supabase
        .from('module_access')
        .insert(moduleAccessData);

      if (insertError) throw insertError;

      updateStep('modules', { status: 'success' });
      toast.success('Module access configured successfully!');
    } catch (error: any) {
      console.error('Module access error:', error);
      updateStep('modules', { 
        status: 'error', 
        error: error.message || 'Failed to configure module access'
      });
      toast.error('Failed to configure module access');
    }
  };

  const verifySetup = async () => {
    updateStep('verification', { status: 'running' });
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      // Verify profile exists
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Admin profile not found');
      }

      // Verify module access
      const { data: modules, error: modulesError } = await supabase
        .from('module_access')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (modulesError) throw modulesError;

      if (!modules || modules.length === 0) {
        throw new Error('No module access configured');
      }

      updateStep('verification', { status: 'success' });
      toast.success('Setup verification completed successfully!');
    } catch (error: any) {
      console.error('Verification error:', error);
      updateStep('verification', { 
        status: 'error', 
        error: error.message || 'Setup verification failed'
      });
      toast.error('Setup verification failed');
    }
  };

  const runCompleteSetup = async () => {
    await createAdminProfile();
    await setupModuleAccess();
    await verifySetup();
  };

  const getStepIcon = (status: SetupStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Setup Fixed</h1>
        <p className="text-gray-600">
          Resolving critical database and authentication issues
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Setup Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
              {getStepIcon(step.status)}
              <div className="flex-1">
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
                {step.error && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm text-red-600">
                      {step.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button 
          onClick={runCompleteSetup}
          className="px-8 py-2"
          disabled={steps.some(step => step.status === 'running')}
        >
          {steps.some(step => step.status === 'running') ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Setting up...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Run Complete Setup
            </>
          )}
        </Button>
      </div>

      {steps.every(step => step.status === 'success') && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-600">
            ✅ All setup steps completed successfully! The admin user and module access have been configured properly.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FixedAdminSetup;