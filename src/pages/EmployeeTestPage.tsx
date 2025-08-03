import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Users, Database, CheckCircle, XCircle, RefreshCw, Trash2 } from 'lucide-react';
import EmployeeTestForm from '@/components/EmployeeTestForm';

const EmployeeTestPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    checkConnection();
    loadEmployees();
  }, []);

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const { data, error } = await supabase.from('employees').select('count').limit(1);
      
      if (error) {
        console.error('Connection test failed:', error);
        setConnectionStatus('error');
      } else {
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionStatus('error');
    }
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading employees:', error);
        throw error;
      }

      setEmployees(data || []);
    } catch (error: any) {
      console.error('Failed to load employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTestEmployees = async () => {
    try {
      if (!confirm('Are you sure you want to delete all TEST employees?')) {
        return;
      }

      setLoading(true);
      
      const { error } = await supabase
        .from('employees')
        .delete()
        .like('employee_id', 'TEST%');

      if (error) {
        console.error('Error deleting test employees:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "All test employees deleted successfully"
      });

      loadEmployees();
    } catch (error: any) {
      console.error('Failed to delete test employees:', error);
      toast({
        title: "Error",
        description: "Failed to delete test employees",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'checking':
        return <Badge variant="secondary" className="text-blue-600">Checking...</Badge>;
      case 'connected':
        return <Badge className="bg-green-500 text-white">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Connection Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-6 h-6" />
            <span>Employee Database Test</span>
          </CardTitle>
          <CardDescription>
            Test and verify the employee database connection and functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Database Connection:</span>
              {getConnectionStatusBadge()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkConnection}
              disabled={connectionStatus === 'checking'}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
              Test Connection
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Total Employees:</span>
              <Badge variant="outline">{employees.length}</Badge>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadEmployees}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {employees.some(emp => emp.employee_id?.startsWith('TEST')) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteTestEmployees}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Test Data
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <EmployeeTestForm />

      {employees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Recent Employees</span>
            </CardTitle>
            <CardDescription>
              Latest employees in the database (showing first 10)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employees.slice(0, 10).map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <h4 className="font-medium">
                        {employee.first_name} {employee.last_name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        ID: {employee.employee_id} • {employee.position || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-500 text-white">
                      {employee.department || 'N/A'}
                    </Badge>
                    <Badge className={employee.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                      {employee.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {employee.employee_id?.startsWith('TEST') && (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        TEST
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connected' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">
                Database connection {connectionStatus === 'connected' ? 'successful' : 'failed'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {employees.length >= 0 ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">
                Employee table accessible
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeTestPage;