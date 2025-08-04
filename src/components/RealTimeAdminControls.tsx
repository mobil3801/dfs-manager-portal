import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  Users,
  Database,
  Activity,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings
} from 'lucide-react';

interface AdminControlsProps {
  className?: string;
}

const RealTimeAdminControls: React.FC<AdminControlsProps> = ({ className = "" }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStations: 0,
    totalProducts: 0,
    databaseConnected: false,
    lastSync: new Date()
  });

  const fetchRealTimeStats = async () => {
    try {
      setLoading(true);
      
      // Test database connection and fetch real data
      const [usersResult, stationsResult, productsResult] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact' }),
        supabase.from('stations').select('*', { count: 'exact' }),
        supabase.from('products').select('*', { count: 'exact' })
      ]);

      setStats({
        totalUsers: usersResult.data?.length || 0,
        totalStations: stationsResult.data?.length || 0,
        totalProducts: productsResult.data?.length || 0,
        databaseConnected: !usersResult.error && !stationsResult.error && !productsResult.error,
        lastSync: new Date()
      });

      if (usersResult.error || stationsResult.error || productsResult.error) {
        throw new Error('Database connection issues detected');
      }

      toast({
        title: "Stats Updated",
        description: "Real-time statistics refreshed successfully",
      });

    } catch (error: any) {
      console.error('Error fetching real-time stats:', error);
      setStats(prev => ({ 
        ...prev, 
        databaseConnected: false,
        lastSync: new Date()
      }));
      
      toast({
        title: "Connection Error",
        description: `Failed to connect to database: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      setLoading(true);
      
      // Test basic database operations
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      toast({
        title: "Database Test Successful",
        description: "All database connections are working properly",
      });

    } catch (error: any) {
      toast({
        title: "Database Test Failed",
        description: `Connection error: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createSampleData = async () => {
    try {
      setLoading(true);
      
      // Create sample station if none exist
      const { data: existingStations } = await supabase
        .from('stations')
        .select('*')
        .limit(1);

      if (!existingStations || existingStations.length === 0) {
        const { error: stationError } = await supabase
          .from('stations')
          .insert([
            {
              name: 'Main Station',
              location: 'Downtown Location',
              manager_id: 'admin-user',
              is_active: true,
              created_at: new Date().toISOString()
            }
          ]);

        if (stationError) {
          throw stationError;
        }
      }

      // Create sample product if none exist
      const { data: existingProducts } = await supabase
        .from('products')
        .select('*')
        .limit(1);

      if (!existingProducts || existingProducts.length === 0) {
        const { error: productError } = await supabase
          .from('products')
          .insert([
            {
              name: 'Regular Gasoline',
              category: 'Fuel',
              price: 3.99,
              stock_quantity: 1000,
              is_active: true,
              created_at: new Date().toISOString()
            }
          ]);

        if (productError) {
          throw productError;
        }
      }

      await fetchRealTimeStats();

      toast({
        title: "Sample Data Created",
        description: "Sample station and product data has been added to the database",
      });

    } catch (error: any) {
      toast({
        title: "Error Creating Sample Data",
        description: `Failed to create sample data: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRealTimeStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, status }: {
    title: string;
    value: number | string;
    icon: any;
    color: string;
    status?: 'success' | 'error' | 'warning';
  }) => (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {status && (
              <Badge 
                className={`mt-1 ${
                  status === 'success' ? 'bg-green-100 text-green-800' :
                  status === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}
              >
                {status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                {status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                {status === 'success' ? 'Connected' : status === 'error' ? 'Disconnected' : 'Warning'}
              </Badge>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Real-Time Admin Controls</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${stats.databaseConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-500">
                {stats.databaseConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </CardTitle>
          <CardDescription>
            Live database connection and administration controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              color="text-blue-600"
              status={stats.databaseConnected ? 'success' : 'error'}
            />
            <StatCard
              title="Gas Stations"
              value={stats.totalStations}
              icon={Database}
              color="text-green-600"
            />
            <StatCard
              title="Products"
              value={stats.totalProducts}
              icon={Activity}
              color="text-purple-600"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              onClick={fetchRealTimeStats}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Stats
            </Button>
            
            <Button
              onClick={testDatabaseConnection}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <Database className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
            
            <Button
              onClick={createSampleData}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Sample Data
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            <p>Last sync: {stats.lastSync.toLocaleTimeString()}</p>
            <p className="mt-1">
              Database Status: {stats.databaseConnected ? 
                <span className="text-green-600 font-medium">✓ Connected and operational</span> : 
                <span className="text-red-600 font-medium">✗ Connection issues detected</span>
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeAdminControls;