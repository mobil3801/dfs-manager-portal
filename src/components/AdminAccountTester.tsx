import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { User, Shield, CheckCircle, AlertCircle, Settings, UserPlus, Database } from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const AdminAccountTester = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<{[key: string]: boolean | null;}>({});
  const [adminExists, setAdminExists] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useSupabaseAuth();

  useEffect(() => {
    checkAdminUser();
    setCurrentUser(user);
  }, [user]);

  const checkAdminUser = async () => {
    try {
      const { data, error } = await supabase.
      from('user_profiles').
      select('*').
      eq('email', 'admin@dfs-portal.com').
      single();

      if (data && !error) {
        setAdminExists(true);
        setTestResults((prev) => ({ ...prev, adminProfileExists: true }));
      } else {
        setAdminExists(false);
        setTestResults((prev) => ({ ...prev, adminProfileExists: false }));
      }
    } catch (error) {
      setAdminExists(false);
      setTestResults((prev) => ({ ...prev, adminProfileExists: false }));
    }
  };

  const createAdminProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.
      from('user_profiles').
      insert([
      {
        email: 'admin@dfs-portal.com',
        first_name: 'System',
        last_name: 'Administrator',
        user_role: 'Administrator',
        permissions: {
          admin_panel: true,
          user_management: true,
          system_settings: true,
          all_modules: true
        },
        station_access: {
          all_stations: true
        },
        is_active: true
      }]
      ).
      select().
      single();

      if (error) {
        toast({
          title: "Error Creating Admin Profile",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setAdminExists(true);
        setTestResults((prev) => ({ ...prev, adminProfileExists: true }));
        toast({
          title: "Admin Profile Created",
          description: "Admin profile created successfully",
          variant: "default"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signUpAdmin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@dfs-portal.com',
        password: 'Admin123!@#',
        options: {
          data: {
            first_name: 'System',
            last_name: 'Administrator'
          }
        }
      });

      if (error) {
        toast({
          title: "Signup Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setTestResults((prev) => ({ ...prev, adminSignup: true }));
        toast({
          title: "Admin Signup Initiated",
          description: "Check email for verification link",
          variant: "default"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
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
        password: 'Admin123!@#'
      });

      if (error) {
        setTestResults((prev) => ({ ...prev, adminLogin: false }));
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setTestResults((prev) => ({ ...prev, adminLogin: true }));
        toast({
          title: "Login Successful",
          description: "Admin login test passed",
          variant: "default"
        });
      }
    } catch (error: any) {
      setTestResults((prev) => ({ ...prev, adminLogin: false }));
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseAccess = async () => {
    setLoading(true);
    const dbTests = {
      userProfiles: false,
      stations: false,
      products: false,
      employees: false,
      auditLogs: false
    };

    try {
      // Test user_profiles table
      const { error: profilesError } = await supabase.
      from('user_profiles').
      select('count(*)').
      single();
      dbTests.userProfiles = !profilesError;

      // Test stations table
      const { error: stationsError } = await supabase.
      from('stations').
      select('count(*)').
      single();
      dbTests.stations = !stationsError;

      // Test products table
      const { error: productsError } = await supabase.
      from('products').
      select('count(*)').
      single();
      dbTests.products = !productsError;

      // Test employees table
      const { error: employeesError } = await supabase.
      from('employees').
      select('count(*)').
      single();
      dbTests.employees = !employeesError;

      // Test audit_logs table
      const { error: auditError } = await supabase.
      from('audit_logs').
      select('count(*)').
      single();
      dbTests.auditLogs = !auditError;

      setTestResults((prev) => ({ ...prev, ...dbTests }));

      const passedTests = Object.values(dbTests).filter(Boolean).length;
      toast({
        title: "Database Tests Complete",
        description: `${passedTests}/5 database tables accessible`,
        variant: passedTests >= 3 ? "default" : "destructive"
      });

    } catch (error: any) {
      toast({
        title: "Database Test Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const TestResultBadge = ({ testName, result }: {testName: string;result?: boolean | null;}) =>
  <div className="flex items-center gap-2">
      {result === true ?
    <CheckCircle className="h-4 w-4 text-green-500" /> :
    result === false ?
    <AlertCircle className="h-4 w-4 text-red-500" /> :

    <div className="h-4 w-4 rounded-full bg-gray-300" />
    }
      <span className="text-sm">{testName}</span>
      <Badge variant={result === true ? "default" : result === false ? "destructive" : "secondary"}>
        {result === true ? "Pass" : result === false ? "Fail" : "Pending"}
      </Badge>
    </div>;


  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Account Setup & Testing
          </CardTitle>
          <CardDescription>
            Complete setup and testing for admin@dfs-portal.com account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="test">Test Login</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <User className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Admin Email:</strong> admin@dfs-portal.com<br />
                    <strong>Default Password:</strong> Admin123!@#
                  </AlertDescription>
                </Alert>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span>Admin Profile in Database:</span>
                    <Badge variant={adminExists ? "default" : "secondary"}>
                      {adminExists ? "Exists" : "Not Found"}
                    </Badge>
                  </div>

                  {!adminExists &&
                  <Button
                    onClick={createAdminProfile}
                    disabled={loading}
                    variant="outline"
                    className="w-full">

                      <UserPlus className="h-4 w-4 mr-2" />
                      {loading ? "Creating..." : "Create Admin Profile"}
                    </Button>
                  }

                  <Button
                    onClick={signUpAdmin}
                    disabled={loading}
                    className="w-full">

                    <User className="h-4 w-4 mr-2" />
                    {loading ? "Signing Up..." : "Sign Up Admin User"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <div className="space-y-4">
                <Button
                  onClick={testAdminLogin}
                  disabled={loading}
                  className="w-full">

                  {loading ? "Testing..." : "Test Admin Login"}
                </Button>

                <div className="space-y-2">
                  <TestResultBadge testName="Admin Login" result={testResults.adminLogin} />
                  <TestResultBadge testName="Admin Signup" result={testResults.adminSignup} />
                  <TestResultBadge testName="Profile Exists" result={testResults.adminProfileExists} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="database" className="space-y-4">
              <div className="space-y-4">
                <Button
                  onClick={testDatabaseAccess}
                  disabled={loading}
                  className="w-full"
                  variant="outline">

                  <Database className="h-4 w-4 mr-2" />
                  {loading ? "Testing..." : "Test Database Access"}
                </Button>

                <div className="space-y-2">
                  <TestResultBadge testName="User Profiles Table" result={testResults.userProfiles} />
                  <TestResultBadge testName="Stations Table" result={testResults.stations} />
                  <TestResultBadge testName="Products Table" result={testResults.products} />
                  <TestResultBadge testName="Employees Table" result={testResults.employees} />
                  <TestResultBadge testName="Audit Logs Table" result={testResults.auditLogs} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Currently Logged In:</strong> {currentUser?.email || 'None'}</p>
                    <p><strong>User Role:</strong> {currentUser ? 'Authenticated' : 'Not Authenticated'}</p>
                    <p><strong>Admin Profile:</strong> {adminExists ? '✅ Created' : '❌ Missing'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm space-y-1">
                      <p>1. Create admin profile in database</p>
                      <p>2. Sign up admin user account</p>
                      <p>3. Verify email (check inbox)</p>
                      <p>4. Test admin login</p>
                      <p>5. Test database access</p>
                      <p>6. Access admin features from navigation</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>);

};

export default AdminAccountTester;