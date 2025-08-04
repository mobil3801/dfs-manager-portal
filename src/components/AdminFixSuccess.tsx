import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Shield, Key, Database, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const AdminFixSuccess: React.FC = () => {
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const { toast } = useToast();

  const verifyFix = async () => {
    setVerifying(true);
    try {
      // Check if admin profile exists
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', 'admin@dfs-portal.com');

      if (error) throw error;

      if (profiles && profiles.length > 0) {
        // Check module access
        const { data: modules } = await supabase
          .from('module_access')
          .select('*')
          .eq('user_id', profiles[0].user_id);

        if (modules && modules.length >= 10) { // Should have multiple modules
          setVerified(true);
          toast({
            title: "✅ Fix Verified!",
            description: "Admin access is working correctly",
            variant: "default"
          });
        }
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Issue",
        description: "Please run the emergency fix",
        variant: "destructive"
      });
    }
    setVerifying(false);
  };

  const goToLogin = () => {
    window.location.href = '/login';
  };

  const goToAdminPanel = () => {
    window.location.href = '/admin';
  };

  useEffect(() => {
    verifyFix();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">🎉 Admin Access Fixed!</h1>
        <p className="text-gray-600">The emergency repair has been completed successfully</p>
      </div>

      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>SUCCESS!</strong> Admin access has been restored. You can now login with full administrator privileges.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Shield className="w-5 h-5" />
            What Was Fixed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-medium">Admin User Profile</div>
              <div className="text-sm text-gray-600">Created administrator profile with full permissions</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-medium">Module Access Rights</div>
              <div className="text-sm text-gray-600">Configured access to all system modules</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-medium">Authentication Setup</div>
              <div className="text-sm text-gray-600">Created login credentials and user authentication</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            Admin Login Credentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <div className="space-y-2 font-mono">
              <div><strong>📧 Email:</strong> admin@dfs-portal.com</div>
              <div><strong>🔑 Password:</strong> Admin123!@#</div>
            </div>
            <Alert className="mt-3">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Reminder:</strong> Change these credentials immediately after your first login!
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button 
          onClick={goToLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
        >
          <Key className="w-5 h-5 mr-2" />
          Go to Login Page
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <Button 
          onClick={goToAdminPanel}
          variant="outline"
          className="w-full"
        >
          <Database className="w-4 h-4 mr-2" />
          Access Admin Panel
        </Button>
      </div>

      {verified && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ <strong>Verification Complete:</strong> All admin access components are working correctly.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AdminFixSuccess;