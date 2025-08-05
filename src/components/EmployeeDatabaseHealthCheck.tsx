import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Users,
  HardDrive,
  Wifi,
  Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DatabaseStatus {
  connection: 'connected' | 'disconnected' | 'checking';
  tableExists: boolean;
  storageAccess: boolean;
  recordCount: number;
  lastUpdate?: string;
  error?: string;
}

const EmployeeDatabaseHealthCheck: React.FC = () => {
  const [status, setStatus] = useState<DatabaseStatus>({
    connection: 'checking',
    tableExists: false,
    storageAccess: false,
    recordCount: 0
  });
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkDatabaseHealth();
  }, []);

  const checkDatabaseHealth = async () => {
    setIsChecking(true);
    const newStatus: DatabaseStatus = {
      connection: 'checking',
      tableExists: false,
      storageAccess: false,
      recordCount: 0
    };

    try {
      // Test database connection and table access
      const { data, error } = await supabase
        .from('employees')
        .select('id, created_at', { count: 'exact' })
        .limit(1);

      if (error) {
        newStatus.connection = 'disconnected';
        newStatus.error = error.message;
        console.error('Database connection error:', error);
      } else {
        newStatus.connection = 'connected';
        newStatus.tableExists = true;
      }

      // Get record count
      const { count, error: countError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        newStatus.recordCount = count || 0;
      }

      // Test storage access
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      
      if (storageError) {
        console.warn('Storage access check failed:', storageError);
        newStatus.storageAccess = false;
      } else {
        newStatus.storageAccess = true;
      }

      newStatus.lastUpdate = new Date().toISOString();

      setStatus(newStatus);

      if (newStatus.connection === 'connected') {
        toast({
          title: "Database Connected",
          description: `Successfully connected to employees table with ${newStatus.recordCount} records`,
          duration: 3000
        });
      }

    } catch (error: any) {
      console.error('Health check failed:', error);
      newStatus.connection = 'disconnected';
      newStatus.error = error.message || 'Unknown error occurred';
      setStatus(newStatus);

      toast({
        title: "Database Connection Failed",
        description: error.message || "Failed to connect to the database",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusBadge = (type: 'connection' | 'table' | 'storage') => {
    switch (type) {
      case 'connection':
        return status.connection === 'connected' ? (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        ) : status.connection === 'disconnected' ? (
          <Badge className="bg-red-500 text-white">
            <XCircle className="w-3 h-3 mr-1" />
            Disconnected
          </Badge>
        ) : (
          <Badge className="bg-yellow-500 text-white">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Checking...
          </Badge>
        );

      case 'table':
        return status.tableExists ? (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Available
          </Badge>
        ) : (
          <Badge className="bg-red-500 text-white">
            <XCircle className="w-3 h-3 mr-1" />
            Not Found
          </Badge>
        );

      case 'storage':
        return status.storageAccess ? (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accessible
          </Badge>
        ) : (
          <Badge className="bg-orange-500 text-white">
            <AlertCircle className="w-3 h-3 mr-1" />
            Limited
          </Badge>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <CardTitle className="text-lg">Employee Database Status</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkDatabaseHealth}
            disabled={isChecking}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Refresh'}
          </Button>
        </div>
        <CardDescription>
          Real-time connection status and database health monitoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Database Connection */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Wifi className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Connection</span>
            </div>
            {getStatusBadge('connection')}
          </div>

          {/* Table Access */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Table Access</span>
            </div>
            {getStatusBadge('table')}
          </div>

          {/* Storage Access */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">File Storage</span>
            </div>
            {getStatusBadge('storage')}
          </div>

          {/* Record Count */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Records</span>
            </div>
            <Badge variant="outline" className="text-sm">
              {status.recordCount}
            </Badge>
          </div>
        </div>

        {/* Error Display */}
        {status.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Connection Error:</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{status.error}</p>
          </div>
        )}

        {/* Success Summary */}
        {status.connection === 'connected' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">All Systems Operational</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Database connected with {status.recordCount} employee records. 
              {status.storageAccess ? ' File storage is accessible.' : ' Note: File storage has limited access.'}
            </p>
            {status.lastUpdate && (
              <p className="text-xs text-green-600 mt-2">
                Last checked: {new Date(status.lastUpdate).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeDatabaseHealthCheck;