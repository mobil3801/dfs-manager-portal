import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  Shield,
  Users,
  Database,
  MessageSquare,
  Bell,
  FileText,
  Activity,
  AlertCircle,
  Building,
  Settings,
  UserPlus,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';
import AdminSetupComponent from '@/components/AdminSetupComponent';

interface DatabaseStats {
  users: number;
  stations: number;
  products: number;
  sales_reports: number;
  employees: number;
  audit_logs: number;
}

const ComprehensiveAdminPanel = () => {
  const { isAdmin, userProfile, isAuthenticated } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DatabaseStats>({
    users: 0,
    stations: 0,
    products: 0,
    sales_reports: 0,
    employees: 0,
    audit_logs: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && isAdmin()) {
      fetchStats();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      const tables = ['user_profiles', 'stations', 'products', 'sales_reports', 'employees', 'audit_logs'];
      const statPromises = tables.map(async (table) => {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          return { table, count: data?.length || 0 };
        } catch (error) {
          console.warn(`Failed to fetch ${table} count:`, error);
          return { table, count: 0 };
        }
      });

      const results = await Promise.all(statPromises);
      const newStats = results.reduce((acc, { table, count }) => {
        const key = table === 'user_profiles' ? 'users' : table;
        acc[key as keyof DatabaseStats] = count;
        return acc;
      }, {} as DatabaseStats);

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to access the admin panel.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin()) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have administrator privileges to access this panel.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const StatCard = ({ title, value, icon: Icon, description }: {
    title: string;
    value: number;
    icon: any;
    description?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{isLoading ? '...' : value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon: Icon, action, variant = 'default' }: {
    title: string;
    description: string;
    icon: any;
    action: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={action}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-600">
            Welcome, {userProfile?.role || 'Administrator'}
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Admin Access
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={stats.users}
              icon={Users}
              description="Registered users"
            />
            <StatCard
              title="Stations"
              value={stats.stations}
              icon={Building}
              description="Active stations"
            />
            <StatCard
              title="Products"
              value={stats.products}
              icon={FileText}
              description="Product catalog"
            />
            <StatCard
              title="Sales Reports"
              value={stats.sales_reports}
              icon={Activity}
              description="Generated reports"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <QuickActionCard
                  title="User Management"
                  description="Add, edit, and manage users"
                  icon={UserPlus}
                  action={() => setActiveTab('users')}
                />
                <QuickActionCard
                  title="Database Monitor"
                  description="Monitor database performance"
                  icon={Database}
                  action={() => setActiveTab('database')}
                />
                <QuickActionCard
                  title="SMS Settings"
                  description="Configure SMS notifications"
                  icon={MessageSquare}
                  action={() => setActiveTab('sms')}
                />
                <QuickActionCard
                  title="Security Settings"
                  description="Manage security policies"
                  icon={Shield}
                  action={() => setActiveTab('security')}
                />
                <QuickActionCard
                  title="System Setup"
                  description="Initial system configuration"
                  icon={Settings}
                  action={() => setActiveTab('setup')}
                />
                <QuickActionCard
                  title="Refresh Data"
                  description="Update dashboard statistics"
                  icon={RefreshCw}
                  action={fetchStats}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  User management functionality will be implemented here. This includes creating new users, 
                  editing roles, and managing permissions.
                </AlertDescription>
              </Alert>
              <div className="mt-4">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New User
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>
                Monitor and manage database operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <StatCard
                  title="Employees"
                  value={stats.employees}
                  icon={Users}
                  description="Employee records"
                />
                <StatCard
                  title="Audit Logs"
                  value={stats.audit_logs}
                  icon={FileText}
                  description="System audit trail"
                />
              </div>
              <div className="mt-4 space-y-2">
                <Button onClick={fetchStats} className="mr-2">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Statistics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMS Management</CardTitle>
              <CardDescription>
                Configure SMS settings and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  SMS configuration panel will be implemented here. This includes setting up 
                  SMS providers, configuring alert notifications, and managing SMS templates.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Security settings panel will be implemented here. This includes password policies, 
                  session management, and access control configurations.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <AdminSetupComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveAdminPanel;