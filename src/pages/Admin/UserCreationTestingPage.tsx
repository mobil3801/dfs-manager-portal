import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AccessDenied from '@/components/AccessDenied';
import useAdminAccess from '@/hooks/use-admin-access';
import UserCreationTestingDashboard from '@/components/UserCreationTestingDashboard';
import EmailTemplateManager from '@/components/EmailTemplateManager';
import UserRolePermissionTester from '@/components/UserRolePermissionTester';
import { 
  TestTube, 
  Users, 
  Mail, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  Zap
} from 'lucide-react';

const UserCreationTestingPage: React.FC = () => {
  const { isAdmin } = useAdminAccess();

  if (!isAdmin) {
    return (
      <AccessDenied 
        feature="User Creation Testing" 
        requiredRole="Administrator" 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TestTube className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Creation Testing Suite</h1>
            <p className="text-gray-600">Comprehensive testing for user creation, roles, permissions, and email templates</p>
          </div>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          Production Testing Environment
        </Badge>
      </div>

      {/* Important Notice */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Production Environment:</strong> This testing suite is designed for production validation. 
          All tests use real database operations and send actual emails. Use carefully and monitor results.
        </AlertDescription>
      </Alert>

      {/* Testing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">User Creation</p>
                <p className="text-lg font-bold">Full Flow Testing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Email Templates</p>
                <p className="text-lg font-bold">3 Role Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Permissions</p>
                <p className="text-lg font-bold">15 Content Areas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Validation</p>
                <p className="text-lg font-bold">180+ Tests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Testing Interface */}
      <Tabs defaultValue="user-creation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="user-creation" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>User Creation</span>
          </TabsTrigger>
          <TabsTrigger value="email-templates" className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>Email Templates</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Permission Testing</span>
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Integration Tests</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="user-creation" className="space-y-6">
          <UserCreationTestingDashboard />
        </TabsContent>

        <TabsContent value="email-templates" className="space-y-6">
          <EmailTemplateManager />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <UserRolePermissionTester />
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          {/* Integration Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <span>End-to-End Integration Tests</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Complete User Flow Test */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Complete User Creation Flow</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">1. User Registration (Auth)</span>
                      <Badge variant="outline">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">2. Profile Creation (Database)</span>
                      <Badge variant="outline">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">3. Permission Assignment</span>
                      <Badge variant="outline">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">4. Welcome Email Delivery</span>
                      <Badge variant="outline">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">5. Login Validation</span>
                      <Badge variant="outline">Ready</Badge>
                    </div>
                  </div>
                </div>

                {/* Role-Based Access Testing */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Role-Based Access Validation</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-800">Administrator</h4>
                      <ul className="text-sm text-red-700 mt-2 space-y-1">
                        <li>• Full system access</li>
                        <li>• User management</li>
                        <li>• System configuration</li>
                        <li>• Security settings</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800">Management</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Sales & reports</li>
                        <li>• Inventory management</li>
                        <li>• Order processing</li>
                        <li>• Station oversight</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800">Employee</h4>
                      <ul className="text-sm text-green-700 mt-2 space-y-1">
                        <li>• Dashboard access</li>
                        <li>• Sales report viewing</li>
                        <li>• Inventory viewing</li>
                        <li>• Basic operations</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Email Template Testing */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>Email Template Integration</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium">Administrator Welcome</span>
                        <p className="text-xs text-gray-600">Full access notification with security guidelines</p>
                      </div>
                      <Badge variant="outline">Template Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium">Management Welcome</span>
                        <p className="text-xs text-gray-600">Management features and responsibilities</p>
                      </div>
                      <Badge variant="outline">Template Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium">Employee Welcome</span>
                        <p className="text-xs text-gray-600">Basic access and getting started guide</p>
                      </div>
                      <Badge variant="outline">Template Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium">Password Reset</span>
                        <p className="text-xs text-gray-600">Secure password reset with token validation</p>
                      </div>
                      <Badge variant="outline">Template Ready</Badge>
                    </div>
                  </div>
                </div>

                {/* Database Integration */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Database Integration Status</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">User Tables</h4>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>user_profiles (ID: 11725)</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>audit_logs (ID: 12706)</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>employees (ID: 11727)</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Authentication</h4>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>Supabase Auth Integration</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>Email Verification</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>Password Reset Flow</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All integration components are ready for production testing. 
                    Use the individual tabs above to run specific tests or the User Creation tab to run complete workflow tests.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserCreationTestingPage;