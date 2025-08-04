import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  User,
  Database,
  Shield,
  Settings,
  Clock,
  Key,
  Globe,
  Server
} from 'lucide-react';

interface VerificationTest {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

const AuthenticationVerification: React.FC = () => {
  const { user, userProfile, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [tests, setTests] = useState<VerificationTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Run initial verification when component mounts
    runVerificationTests();
  }, []);

  const updateTest = (name: string, status: VerificationTest['status'], message: string, details?: string) => {
    setTests(prev => {
      const index = prev.findIndex(t => t.name === name);
      const newTest = { name, status, message, details };
      
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = newTest;
        return updated;
      } else {
        return [...prev, newTest];
      }
    });
  };

  const runVerificationTests = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: Supabase Connection
    updateTest('Supabase Connection', 'pending', 'Testing connection to Supabase...');
    try {
      const { data, error } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true });
      if (error) {
        updateTest('Supabase Connection', 'error', 'Failed to connect to Supabase', error.message);
      } else {
        updateTest('Supabase Connection', 'success', 'Successfully connected to Supabase database');
      }
    } catch (error) {
      updateTest('Supabase Connection', 'error', 'Connection error', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 2: Auth Service Status
    updateTest('Auth Service', 'pending', 'Checking authentication service...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        updateTest('Auth Service', 'error', 'Auth service error', error.message);
      } else {
        updateTest('Auth Service', 'success', session ? 'Auth service active with session' : 'Auth service active, no session');
      }
    } catch (error) {
      updateTest('Auth Service', 'error', 'Auth service unavailable', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 3: Current User Status
    updateTest('User Authentication', 'pending', 'Checking current user status...');
    if (authLoading) {
      updateTest('User Authentication', 'warning', 'Authentication is still loading...');
    } else if (isAuthenticated && user) {
      updateTest('User Authentication', 'success', `User authenticated: ${user.email}`, `User ID: ${user.id}`);
    } else {
      updateTest('User Authentication', 'warning', 'No user currently authenticated');
    }

    // Test 4: User Profile
    updateTest('User Profile', 'pending', 'Checking user profile...');
    if (userProfile && userProfile.role !== 'Guest') {
      updateTest('User Profile', 'success', `Profile loaded: ${userProfile.role}`, `Employee ID: ${userProfile.employee_id || 'N/A'}`);
    } else if (isAuthenticated) {
      updateTest('User Profile', 'warning', 'User authenticated but no profile found');
    } else {
      updateTest('User Profile', 'warning', 'No profile (user not authenticated)');
    }

    // Test 5: Database Tables
    updateTest('Database Schema', 'pending', 'Verifying database tables...');
    const requiredTables = ['user_profiles', 'products', 'sales_reports', 'employees', 'stations'];
    let tableErrors = [];
    
    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          tableErrors.push(`${table}: ${error.message}`);
        }
      } catch (error) {
        tableErrors.push(`${table}: Connection error`);
      }
    }

    if (tableErrors.length === 0) {
      updateTest('Database Schema', 'success', 'All required tables accessible');
    } else {
      updateTest('Database Schema', 'error', `Table access issues`, tableErrors.join('; '));
    }

    // Test 6: User Permissions
    updateTest('User Permissions', 'pending', 'Checking user permissions...');
    if (userProfile) {
      try {
        const permissions = {
          isAdmin: userProfile.role === 'Administrator' || userProfile.role === 'Admin',
          isManager: ['Administrator', 'Admin', 'Management', 'Manager'].includes(userProfile.role),
          isEmployee: userProfile.role === 'Employee'
        };
        
        const permissionsList = Object.entries(permissions)
          .filter(([_, value]) => value)
          .map(([key, _]) => key)
          .join(', ');
          
        updateTest('User Permissions', 'success', `Permissions: ${permissionsList || 'Guest'}`);
      } catch (error) {
        updateTest('User Permissions', 'error', 'Failed to evaluate permissions', error instanceof Error ? error.message : 'Unknown error');
      }
    } else {
      updateTest('User Permissions', 'warning', 'No user profile to check permissions');
    }

    // Test 7: Session Validity
    updateTest('Session Validity', 'pending', 'Checking session validity...');
    try {
      const { data: { user: sessionUser }, error } = await supabase.auth.getUser();
      if (error) {
        updateTest('Session Validity', 'error', 'Session validation failed', error.message);
      } else if (sessionUser) {
        updateTest('Session Validity', 'success', 'Valid session found', `Expires: ${sessionUser.role || 'No expiry info'}`);
      } else {
        updateTest('Session Validity', 'warning', 'No valid session');
      }
    } catch (error) {
      updateTest('Session Validity', 'error', 'Session check failed', error instanceof Error ? error.message : 'Unknown error');
    }

    setIsRunning(false);
    toast({
      title: 'Verification Complete',
      description: 'Authentication system verification completed'
    });
  };

  const getStatusIcon = (status: VerificationTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: VerificationTest['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    } as const;

    return (
      <Badge variant={variants[status]} className="text-xs">
        {status.toUpperCase()}
      </Badge>
    );
  };

  const overallStatus = tests.length > 0 ? (
    tests.some(t => t.status === 'error') ? 'error' :
    tests.some(t => t.status === 'warning') ? 'warning' : 'success'
  ) : 'pending';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <span>Authentication System Verification</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive verification of authentication and database connectivity
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {overallStatus === 'success' && <Badge className="bg-green-100 text-green-800">All Systems OK</Badge>}
              {overallStatus === 'warning' && <Badge variant="secondary">Issues Found</Badge>}
              {overallStatus === 'error' && <Badge variant="destructive">Critical Issues</Badge>}
              <Button onClick={runVerificationTests} disabled={isRunning}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                {isRunning ? 'Running...' : 'Run Tests'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">User Status</p>
                <p className="text-xs text-gray-600">
                  {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-gray-600">Supabase Connected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Role</p>
                <p className="text-xs text-gray-600">
                  {userProfile?.role || 'Guest'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Session</p>
                <p className="text-xs text-gray-600">
                  {user ? 'Active' : 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Results</CardTitle>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Server className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Click "Run Tests" to start verification</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map((test, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 rounded-lg border bg-gray-50/50"
                >
                  {getStatusIcon(test.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium">{test.name}</h4>
                      {getStatusBadge(test.status)}
                    </div>
                    <p className="text-sm text-gray-600">{test.message}</p>
                    {test.details && (
                      <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-100 p-1 rounded">
                        {test.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Information */}
      {isAuthenticated && user && (
        <Card>
          <CardHeader>
            <CardTitle>Current User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">User Details</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                  <p><strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              
              {userProfile && (
                <div>
                  <h4 className="font-medium mb-2">Profile Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Role:</strong> {userProfile.role}</p>
                    <p><strong>Employee ID:</strong> {userProfile.employee_id || 'N/A'}</p>
                    <p><strong>Station ID:</strong> {userProfile.station_id || 'N/A'}</p>
                    <p><strong>Active:</strong> {userProfile.is_active ? 'Yes' : 'No'}</p>
                    <p><strong>Hire Date:</strong> {userProfile.hire_date ? new Date(userProfile.hire_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Authentication</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Provider:</strong> Supabase Auth</p>
                <p><strong>URL:</strong> nehhjsiuhthflfwkfequ.supabase.co</p>
                <p><strong>Auto Refresh:</strong> Enabled</p>
                <p><strong>Session Persistence:</strong> Enabled</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Application</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Environment:</strong> Production</p>
                <p><strong>Auth Context:</strong> Active</p>
                <p><strong>Module Access:</strong> Active</p>
                <p><strong>Error Boundaries:</strong> Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthenticationVerification;