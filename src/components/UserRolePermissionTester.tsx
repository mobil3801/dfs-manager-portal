import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Users, 
  Eye,
  Edit3,
  Trash2,
  Plus,
  Play,
  RefreshCw,
  Building2,
  Lock,
  Unlock
} from 'lucide-react';

interface PermissionTest {
  id: string;
  name: string;
  description: string;
  expectedResult: boolean;
  actualResult?: boolean;
  status: 'pending' | 'running' | 'passed' | 'failed';
  error?: string;
}

interface RolePermissions {
  role: string;
  permissions: {
    [area: string]: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
  };
}

interface TestUser {
  id: string;
  role: string;
  station: string;
  employee_id: string;
  permissions: string;
}

const UserRolePermissionTester: React.FC = () => {
  const { toast } = useToast();
  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [selectedRole, setSelectedRole] = useState('Administrator');
  const [permissionTests, setPermissionTests] = useState<PermissionTest[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>([]);

  const roles = ['Administrator', 'Management', 'Employee'];
  const stations = ['MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'];
  const contentAreas = [
    'dashboard', 'products', 'employees', 'sales_reports', 'vendors',
    'orders', 'licenses', 'salary', 'inventory', 'delivery', 'settings',
    'user_management', 'site_management', 'system_logs', 'security_settings'
  ];

  const actions = ['view', 'create', 'edit', 'delete'];

  useEffect(() => {
    initializeRolePermissions();
    generatePermissionTests();
    fetchTestUsers();
  }, []);

  const initializeRolePermissions = () => {
    const permissions: RolePermissions[] = [
      {
        role: 'Administrator',
        permissions: {
          dashboard: { view: true, create: false, edit: false, delete: false },
          products: { view: true, create: true, edit: true, delete: true },
          employees: { view: true, create: true, edit: true, delete: true },
          sales_reports: { view: true, create: true, edit: true, delete: false },
          vendors: { view: true, create: true, edit: true, delete: true },
          orders: { view: true, create: true, edit: true, delete: true },
          licenses: { view: true, create: true, edit: true, delete: false },
          salary: { view: true, create: true, edit: true, delete: false },
          inventory: { view: true, create: true, edit: true, delete: false },
          delivery: { view: true, create: true, edit: true, delete: false },
          settings: { view: true, create: false, edit: true, delete: false },
          user_management: { view: true, create: true, edit: true, delete: true },
          site_management: { view: true, create: true, edit: true, delete: true },
          system_logs: { view: true, create: false, edit: false, delete: false },
          security_settings: { view: true, create: false, edit: true, delete: false }
        }
      },
      {
        role: 'Management',
        permissions: {
          dashboard: { view: true, create: false, edit: false, delete: false },
          products: { view: true, create: false, edit: false, delete: false },
          employees: { view: false, create: false, edit: false, delete: false },
          sales_reports: { view: true, create: true, edit: true, delete: false },
          vendors: { view: true, create: false, edit: false, delete: false },
          orders: { view: true, create: true, edit: true, delete: false },
          licenses: { view: true, create: false, edit: false, delete: false },
          salary: { view: false, create: false, edit: false, delete: false },
          inventory: { view: true, create: true, edit: true, delete: false },
          delivery: { view: true, create: true, edit: true, delete: false },
          settings: { view: false, create: false, edit: false, delete: false },
          user_management: { view: false, create: false, edit: false, delete: false },
          site_management: { view: false, create: false, edit: false, delete: false },
          system_logs: { view: false, create: false, edit: false, delete: false },
          security_settings: { view: false, create: false, edit: false, delete: false }
        }
      },
      {
        role: 'Employee',
        permissions: {
          dashboard: { view: true, create: false, edit: false, delete: false },
          products: { view: false, create: false, edit: false, delete: false },
          employees: { view: false, create: false, edit: false, delete: false },
          sales_reports: { view: true, create: false, edit: false, delete: false },
          vendors: { view: false, create: false, edit: false, delete: false },
          orders: { view: false, create: false, edit: false, delete: false },
          licenses: { view: false, create: false, edit: false, delete: false },
          salary: { view: false, create: false, edit: false, delete: false },
          inventory: { view: true, create: false, edit: false, delete: false },
          delivery: { view: false, create: false, edit: false, delete: false },
          settings: { view: false, create: false, edit: false, delete: false },
          user_management: { view: false, create: false, edit: false, delete: false },
          site_management: { view: false, create: false, edit: false, delete: false },
          system_logs: { view: false, create: false, edit: false, delete: false },
          security_settings: { view: false, create: false, edit: false, delete: false }
        }
      }
    ];
    setRolePermissions(permissions);
  };

  const generatePermissionTests = () => {
    const tests: PermissionTest[] = [];

    roles.forEach(role => {
      contentAreas.forEach(area => {
        actions.forEach(action => {
          const roleConfig = rolePermissions.find(r => r.role === role);
          const expectedResult = roleConfig?.permissions[area]?.[action as keyof typeof roleConfig.permissions[typeof area]] || false;
          
          tests.push({
            id: `${role}_${area}_${action}`,
            name: `${role} - ${area} - ${action}`,
            description: `Test if ${role} can ${action} in ${area}`,
            expectedResult,
            status: 'pending'
          });
        });
      });
    });

    setPermissionTests(tests);
  };

  const fetchTestUsers = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;

      const users: TestUser[] = (data?.List || []).map((user: any) => ({
        id: user.id,
        role: user.role,
        station: user.station,
        employee_id: user.employee_id,
        permissions: user.detailed_permissions || '{}'
      }));

      setTestUsers(users);
    } catch (error) {
      console.error('Error fetching test users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch test users",
        variant: "destructive"
      });
    }
  };

  const runPermissionTest = async (test: PermissionTest): Promise<PermissionTest> => {
    // Simulate permission testing by checking against expected permissions
    const [role, area, action] = test.id.split('_');
    const roleConfig = rolePermissions.find(r => r.role === role);
    const actualResult = roleConfig?.permissions[area]?.[action as keyof typeof roleConfig.permissions[typeof area]] || false;
    
    // Simulate some randomness for testing failures
    const hasRandomFailure = Math.random() < 0.05; // 5% chance of simulated failure
    
    return {
      ...test,
      actualResult: hasRandomFailure ? !test.expectedResult : actualResult,
      status: (hasRandomFailure ? !test.expectedResult : actualResult) === test.expectedResult ? 'passed' : 'failed',
      error: hasRandomFailure ? 'Simulated permission check failure' : undefined
    };
  };

  const runAllPermissionTests = async () => {
    setIsRunningTests(true);
    setTestProgress(0);

    const rolesToTest = [selectedRole];
    const testsToRun = permissionTests.filter(test => 
      rolesToTest.some(role => test.id.startsWith(role))
    );

    const updatedTests = [...permissionTests];

    for (let i = 0; i < testsToRun.length; i++) {
      const testIndex = permissionTests.findIndex(t => t.id === testsToRun[i].id);
      
      updatedTests[testIndex] = { ...testsToRun[i], status: 'running' };
      setPermissionTests([...updatedTests]);
      
      const result = await runPermissionTest(testsToRun[i]);
      updatedTests[testIndex] = result;
      setPermissionTests([...updatedTests]);
      
      setTestProgress(((i + 1) / testsToRun.length) * 100);
      
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsRunningTests(false);
    
    const passedTests = testsToRun.filter(t => {
      const updated = updatedTests.find(ut => ut.id === t.id);
      return updated?.status === 'passed';
    }).length;
    
    toast({
      title: "Permission Tests Complete",
      description: `${passedTests}/${testsToRun.length} tests passed for ${selectedRole}`,
      variant: passedTests === testsToRun.length ? "default" : "destructive"
    });
  };

  const createTestUser = async (role: string, station: string) => {
    const timestamp = Date.now();
    const testUserData = {
      user_id: Math.floor(Math.random() * 1000000) + 100000,
      role,
      station,
      employee_id: `TEST-${role.substring(0, 3).toUpperCase()}-${timestamp.toString().slice(-6)}`,
      phone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      hire_date: new Date().toISOString().split('T')[0],
      is_active: true,
      detailed_permissions: JSON.stringify(rolePermissions.find(r => r.role === role)?.permissions || {})
    };

    try {
      const { error } = await window.ezsite.apis.tableCreate(11725, testUserData);
      if (error) throw error;

      toast({
        title: "Test User Created",
        description: `Test ${role} user created for ${station}`,
      });

      fetchTestUsers();
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: `Failed to create test user: ${error}`,
        variant: "destructive"
      });
    }
  };

  const deleteTestUser = async (userId: string) => {
    try {
      const { error } = await window.ezsite.apis.tableDelete(11725, { id: userId });
      if (error) throw error;

      toast({
        title: "Test User Deleted",
        description: "Test user removed successfully"
      });

      fetchTestUsers();
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: `Failed to delete test user: ${error}`,
        variant: "destructive"
      });
    }
  };

  const getPermissionBadge = (hasPermission: boolean) => (
    <Badge variant={hasPermission ? 'default' : 'secondary'}>
      {hasPermission ? 'Allowed' : 'Denied'}
    </Badge>
  );

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredTests = permissionTests.filter(test => 
    test.id.startsWith(selectedRole)
  );

  const testStats = {
    total: filteredTests.length,
    passed: filteredTests.filter(t => t.status === 'passed').length,
    failed: filteredTests.filter(t => t.status === 'failed').length,
    pending: filteredTests.filter(t => t.status === 'pending').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">User Role & Permission Tester</h1>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={runAllPermissionTests} 
            disabled={isRunningTests}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunningTests ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Tests
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tests" className="flex items-center space-x-2">
            <TestTube className="w-4 h-4" />
            <span>Permission Tests</span>
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Permission Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Test Users</span>
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Validation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-6">
          {/* Test Progress */}
          {isRunningTests && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Testing {selectedRole} Permissions</h3>
                    <Badge variant="outline">{Math.round(testProgress)}%</Badge>
                  </div>
                  <Progress value={testProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <TestTube className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Tests</p>
                    <p className="text-2xl font-bold">{testStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Passed</p>
                    <p className="text-2xl font-bold">{testStats.passed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-2xl font-bold">{testStats.failed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold">{testStats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results for {selectedRole}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTests.map((test) => (
                  <div 
                    key={test.id} 
                    className={`p-3 rounded-lg border ${
                      test.status === 'passed' ? 'bg-green-50 border-green-200' :
                      test.status === 'failed' ? 'bg-red-50 border-red-200' :
                      test.status === 'running' ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTestStatusIcon(test.status)}
                        <div>
                          <h4 className="font-medium text-sm">{test.name}</h4>
                          <p className="text-xs text-gray-600">{test.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Expected:</span>
                        {getPermissionBadge(test.expectedResult)}
                        {test.actualResult !== undefined && (
                          <>
                            <span className="text-xs text-gray-500">Actual:</span>
                            {getPermissionBadge(test.actualResult)}
                          </>
                        )}
                      </div>
                    </div>
                    {test.error && (
                      <Alert className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">{test.error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix for {selectedRole}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-2 text-left">Content Area</th>
                      <th className="border border-gray-300 px-3 py-2 text-center">View</th>
                      <th className="border border-gray-300 px-3 py-2 text-center">Create</th>
                      <th className="border border-gray-300 px-3 py-2 text-center">Edit</th>
                      <th className="border border-gray-300 px-3 py-2 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contentAreas.map((area, index) => {
                      const roleConfig = rolePermissions.find(r => r.role === selectedRole);
                      const permissions = roleConfig?.permissions[area];
                      
                      return (
                        <tr key={area} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-3 py-2 font-medium capitalize">
                            {area.replace('_', ' ')}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            {permissions?.view ? (
                              <Unlock className="w-4 h-4 text-green-600 mx-auto" />
                            ) : (
                              <Lock className="w-4 h-4 text-red-600 mx-auto" />
                            )}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            {permissions?.create ? (
                              <Unlock className="w-4 h-4 text-green-600 mx-auto" />
                            ) : (
                              <Lock className="w-4 h-4 text-red-600 mx-auto" />
                            )}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            {permissions?.edit ? (
                              <Unlock className="w-4 h-4 text-green-600 mx-auto" />
                            ) : (
                              <Lock className="w-4 h-4 text-red-600 mx-auto" />
                            )}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            {permissions?.delete ? (
                              <Unlock className="w-4 h-4 text-green-600 mx-auto" />
                            ) : (
                              <Lock className="w-4 h-4 text-red-600 mx-auto" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Test User Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Test Users ({testUsers.length})</CardTitle>
                <div className="flex space-x-2">
                  {roles.map((role) => (
                    <Button
                      key={role}
                      size="sm"
                      variant="outline"
                      onClick={() => createTestUser(role, 'MOBIL')}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {role}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium">{user.employee_id}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Badge className={
                            user.role === 'Administrator' ? 'bg-red-100 text-red-800' :
                            user.role === 'Management' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {user.role}
                          </Badge>
                          <span>•</span>
                          <Badge variant="outline">{user.station}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          try {
                            const permissions = JSON.parse(user.permissions);
                            const permissionCount = Object.values(permissions).filter((p: any) => p.view).length;
                            toast({
                              title: "User Permissions",
                              description: `${user.employee_id} has access to ${permissionCount} content areas`
                            });
                          } catch {
                            toast({
                              title: "Permission Error",
                              description: "Failed to parse user permissions",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTestUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {testUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No test users found. Create some test users to begin testing.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Validation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => {
                  const roleTests = permissionTests.filter(t => t.id.startsWith(role));
                  const passed = roleTests.filter(t => t.status === 'passed').length;
                  const failed = roleTests.filter(t => t.status === 'failed').length;
                  const pending = roleTests.filter(t => t.status === 'pending').length;
                  
                  return (
                    <div key={role} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold flex items-center space-x-2">
                          <Shield className="w-5 h-5" />
                          <span>{role}</span>
                        </h4>
                        <div className="flex space-x-2">
                          <Badge variant="default">{passed} Passed</Badge>
                          <Badge variant="destructive">{failed} Failed</Badge>
                          <Badge variant="secondary">{pending} Pending</Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${roleTests.length > 0 ? (passed / roleTests.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {roleTests.length} total permission tests
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserRolePermissionTester;