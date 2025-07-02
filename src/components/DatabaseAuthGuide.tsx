import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Database, Key, Users, CheckCircle2, Info } from 'lucide-react';

const DatabaseAuthGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Authentication System</h1>
        <p className="text-gray-600">Your DFS Manager Portal now uses secure database-based authentication</p>
      </div>

      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Authentication System Active:</strong> Your application is now using the EasySite database for user authentication instead of the built-in authentication service.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5 text-blue-600" />
              Database Tables
            </CardTitle>
            <CardDescription>
              New tables created for authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Users Table</p>
                  <p className="text-xs text-gray-600">Stores user credentials and basic info</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">User Sessions</p>
                  <p className="text-xs text-gray-600">Manages active login sessions</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">User Profiles</p>
                  <p className="text-xs text-gray-600">Existing table for roles and permissions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-green-600" />
              Security Features
            </CardTitle>
            <CardDescription>
              Enhanced security measures implemented
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Password Hashing</p>
                  <p className="text-xs text-gray-600">PBKDF2 with 100,000 iterations</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Session Management</p>
                  <p className="text-xs text-gray-600">24-hour session expiry</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Email Verification</p>
                  <p className="text-xs text-gray-600">Optional email verification system</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5 text-purple-600" />
              Getting Started
            </CardTitle>
            <CardDescription>
              How to set up your first admin user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <p className="font-medium text-sm">Visit Admin Setup</p>
                  <p className="text-xs text-gray-600">Go to /admin-setup to create admin user</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <p className="font-medium text-sm">Create Admin Account</p>
                  <p className="text-xs text-gray-600">Default credentials will be provided</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <p className="font-medium text-sm">Login & Change Password</p>
                  <p className="text-xs text-gray-600">Use provided credentials and update password</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-orange-600" />
              User Management
            </CardTitle>
            <CardDescription>
              How users and roles work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Administrator</p>
                  <p className="text-xs text-gray-600">Full system access and user management</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Management</p>
                  <p className="text-xs text-gray-600">Station management and reporting</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Employee</p>
                  <p className="text-xs text-gray-600">Basic access for daily operations</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-2">
            <p><strong>Next Steps:</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Visit <code className="bg-blue-100 px-1 rounded">/admin-setup</code> to create your admin user</li>
              <li>Login with the provided credentials</li>
              <li>Change the default password in settings</li>
              <li>Create additional user accounts as needed</li>
              <li>Configure user roles and permissions</li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DatabaseAuthGuide;
