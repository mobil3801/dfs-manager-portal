import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { User, Shield, Database, CheckCircle, AlertCircle, Users, Settings } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  user_role: string;
  is_active: boolean;
  created_at: string;
}

const AdminSetupManager = () => {
  const [loading, setLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminPassword, setAdminPassword] = useState('Admin123!@#');
  const [setupStep, setSetupStep] = useState<'signup' | 'verify' | 'complete'>('signup');
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  useEffect(() => {
    checkExistingAdmin();
  }, []);

  const checkExistingAdmin = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', 'admin@dfs-portal.com')
        .single();

      if (data) {
        setAdminUser(data);
        setSetupStep('complete');
      }
    } catch (error) {
      console.log('Admin user not found, setup needed');
    }
  };

  const createAdminUser = async () => {
    setLoading(true);
    try {
      // First, sign up the admin user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'admin@dfs-portal.com',
        password: adminPassword,
        options: {
          data: {
            first_name: 'System',
            last_name: 'Administrator'
          }
        }
      });

      if (authError) {
        toast({
          title: "Authentication Error",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      // Insert admin user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: authData.user?.id,
            email: 'admin@dfs-portal.com',
            first_name: 'System',
            last_name: 'Administrator',
            user_role: 'Administrator',
            permissions: {
              all_modules: true,
              user_management: true,
              system_settings: true,
              admin_panel: true
            },
            station_access: { all_stations: true },
            is_active: true
          }
        ])
        .select()
        .single();

      if (profileError) {
        toast({
          title: "Profile Creation Error",
          description: profileError.message,
          variant: "destructive",
        });
        return;
      }

      setAdminUser(profileData);
      setSetupStep('verify');
      
      toast({
        title: "Admin User Created",
        description: "Admin user created successfully. Please check email for verification.",
        variant: "default",
      });

    } catch (error: any) {
      toast({
        title: "Setup Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testAdminLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@dfs-portal.com',
        password: adminPassword
      });

      if (error) {
        toast({
          title: "Login Test Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setTestResults(prev => ({ ...prev, login: true }));
      toast({
        title: "Login Test Passed",
        description: "Admin login successful",
        variant: "default",
      });

      // Test admin access to user_profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(5);

      setTestResults(prev => ({ 
        ...prev, 
        login: true, 
        database: !profileError,
        userManagement: !profileError 
      }));

    } catch (error: any) {
      toast({
        title: "Test Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testAdminFeatures = async () => {
    setLoading(true);
    const tests = {
      userProfiles: false,
      moduleAccess: false,
      auditLogs: false,
      stations: false,
      smsConfig: false
    };

    try {
      // Test user profiles access
      const { error: profilesError } = await supabase
        .from('user_profiles')
        .select('count(*)')
        .single();
      tests.userProfiles = !profilesError;

      // Test module access
      const { error: moduleError } = await supabase
        .from('module_access')
        .select('count(*)')
        .single();
      tests.moduleAccess = !moduleError;

      // Test audit logs
      const { error: auditError } = await supabase
        .from('audit_logs')
        .select('count(*)')
        .single();
      tests.auditLogs = !auditError;

      // Test stations
      const { error: stationsError } = await supabase
        .from('stations')
        .select('count(*)')
        .single();
      tests.stations = !stationsError;

      // Test SMS config
      const { error: smsError } = await supabase
        .from('sms_config')
        .select('count(*)')
        .single();
      tests.smsConfig = !smsError;

      setTestResults(prev => ({ ...prev, ...tests }));

      const passedTests = Object.values(tests).filter(Boolean).length;
      toast({
        title: "Feature Tests Complete",
        description: `${passedTests}/5 admin features are accessible`,
        variant: passedTests === 5 ? "default" : "destructive",
      });

    } catch (error: any) {
      toast({
        title: "Feature Test Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const TestResultBadge = ({ testName, result }: { testName: string; result?: boolean }) => (
    <div className="flex items-center gap-2">
      {result === true ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : result === false ? (
        <AlertCircle className="h-4 w-4 text-red-500" />
      ) : (
        <div className="h-4 w-4 rounded-full bg-gray-300" />
      )}
      <span className="text-sm">{testName}</span>
      <Badge variant={result === true ? "default" : result === false ? "destructive" : "secondary"}>
        {result === true ? "Pass" : result === false ? "Fail" : "Pending"}
      </Badge>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin User Setup & Testing
          </CardTitle>
          <CardDescription>
            Create and test the admin@dfs-portal.com account with full administrative privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Setup Admin</TabsTrigger>
              <TabsTrigger value="test">Test Features</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input 
                    id="email" 
                    value="admin@dfs-portal.com" 
                    disabled 
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Admin Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter secure password"
                  />
                </div>

                {setupStep === 'signup' && (
                  <Button 
                    onClick={createAdminUser} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Creating Admin User..." : "Create Admin User"}
                  </Button>
                )}

                {setupStep === 'verify' && (
                  <Alert>
                    <User className="h-4 w-4" />
                    <AlertDescription>
                      Admin user created! Please check email for verification link, then test login.
                    </AlertDescription>
                  </Alert>
                )}

                {setupStep === 'complete' && adminUser && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Admin user is set up and ready! Role: {adminUser.user_role}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <div className="space-y-4">
                <Button 
                  onClick={testAdminLogin} 
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? "Testing Login..." : "Test Admin Login"}
                </Button>

                <Button 
                  onClick={testAdminFeatures} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Testing Features..." : "Test All Admin Features"}
                </Button>

                <div className="space-y-3 mt-6">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Test Results
                  </h4>
                  
                  <div className="grid gap-2">
                    <TestResultBadge testName="Admin Login" result={testResults.login} />
                    <TestResultBadge testName="Database Access" result={testResults.database} />
                    <TestResultBadge testName="User Management" result={testResults.userManagement} />
                    <TestResultBadge testName="User Profiles" result={testResults.userProfiles} />
                    <TestResultBadge testName="Module Access" result={testResults.moduleAccess} />
                    <TestResultBadge testName="Audit Logs" result={testResults.auditLogs} />
                    <TestResultBadge testName="Stations" result={testResults.stations} />
                    <TestResultBadge testName="SMS Config" result={testResults.smsConfig} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Admin Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {adminUser ? (
                      <div className="space-y-2">
                        <p><strong>Email:</strong> {adminUser.email}</p>
                        <p><strong>Name:</strong> {adminUser.first_name} {adminUser.last_name}</p>
                        <p><strong>Role:</strong> <Badge>{adminUser.user_role}</Badge></p>
                        <p><strong>Status:</strong> 
                          <Badge variant={adminUser.is_active ? "default" : "destructive"}>
                            {adminUser.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </p>
                        <p><strong>Created:</strong> {new Date(adminUser.created_at).toLocaleDateString()}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No admin user found. Please create one in the Setup tab.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>1. ✅ Create admin user account</p>
                      <p>2. 📧 Verify email address</p>
                      <p>3. 🧪 Test admin login</p>
                      <p>4. 🔍 Test all admin features</p>
                      <p>5. 🚀 Access Admin Panel from main navigation</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetupManager;