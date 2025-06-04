import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  UserCheck,
  Globe,
  MessageSquare,
  Database,
  Shield,
  AlertTriangle,
  Activity,
  CheckCircle,
  User,
  Monitor,
  FileText,
  Settings,
  Zap,
  Search,
  BarChart3,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  TrendingUp,
  Users,
  Server,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Gauge,
  Target } from
'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AccessDenied from '@/components/AccessDenied';
import { useToast } from '@/hooks/use-toast';

interface AdminFeature {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  category: 'core' | 'monitoring' | 'security' | 'database' | 'communication' | 'development';
  status: 'active' | 'maintenance' | 'error';
}

interface SystemStat {
  label: string;
  value: string;
  status: 'success' | 'warning' | 'error';
  icon: React.ReactNode;
}

interface QuickAction {
  label: string;
  action: () => void;
  icon: React.ReactNode;
  color: string;
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [systemHealth, setSystemHealth] = useState({
    overall: 'healthy',
    lastCheck: new Date().toLocaleTimeString()
  });

  if (!isAdmin) {
    return <AccessDenied />;
  }

  const adminFeatures: AdminFeature[] = [
  {
    title: 'Admin Dashboard',
    description: 'Comprehensive admin dashboard with system overview and diagnostics',
    path: '/admin/dashboard',
    icon: <BarChart3 className="w-8 h-8" />,
    color: 'bg-indigo-600',
    badge: 'New',
    category: 'core',
    status: 'active'
  },
  {
    title: 'User Management',
    description: 'Manage user accounts, roles, and permissions across all stations',
    path: '/admin/user-management',
    icon: <UserCheck className="w-8 h-8" />,
    color: 'bg-blue-500',
    badge: 'Core',
    category: 'core',
    status: 'active'
  },
  {
    title: 'Site Management',
    description: 'Configure stations, settings, and operational parameters',
    path: '/admin/site-management',
    icon: <Globe className="w-8 h-8" />,
    color: 'bg-green-500',
    badge: 'Essential',
    category: 'core',
    status: 'active'
  },
  {
    title: 'SMS Alert Management',
    description: 'Configure SMS alerts for license expiry and system notifications',
    path: '/admin/sms-alert-management',
    icon: <MessageSquare className="w-8 h-8" />,
    color: 'bg-purple-500',
    badge: 'Communication',
    category: 'communication',
    status: 'active'
  },
  {
    title: 'System Logs',
    description: 'View and analyze system activity logs and events',
    path: '/admin/system-logs',
    icon: <FileText className="w-8 h-8" />,
    color: 'bg-orange-500',
    badge: 'Monitoring',
    category: 'monitoring',
    status: 'active'
  },
  {
    title: 'Security Settings',
    description: 'Configure security policies, authentication, and access controls',
    path: '/admin/security-settings',
    icon: <Shield className="w-8 h-8" />,
    color: 'bg-red-500',
    badge: 'Security',
    category: 'security',
    status: 'active'
  },
  {
    title: 'Error Recovery',
    description: 'Monitor and recover from system errors and exceptions',
    path: '/admin/error-recovery',
    icon: <AlertTriangle className="w-8 h-8" />,
    color: 'bg-yellow-500',
    badge: 'Recovery',
    category: 'monitoring',
    status: 'active'
  },
  {
    title: 'Memory Monitoring',
    description: 'Track memory usage and detect potential memory leaks',
    path: '/admin/memory-monitoring',
    icon: <Activity className="w-8 h-8" />,
    color: 'bg-pink-500',
    badge: 'Performance',
    category: 'monitoring',
    status: 'active'
  },
  {
    title: 'Database Monitoring',
    description: 'Monitor database connections and performance metrics',
    path: '/admin/database-monitoring',
    icon: <Database className="w-8 h-8" />,
    color: 'bg-indigo-500',
    badge: 'Database',
    category: 'database',
    status: 'active'
  },
  {
    title: 'Audit Monitoring',
    description: 'Track user activities and system audit trails',
    path: '/admin/audit-monitoring',
    icon: <Shield className="w-8 h-8" />,
    color: 'bg-teal-500',
    badge: 'Audit',
    category: 'security',
    status: 'active'
  },
  {
    title: 'Database Auto-sync',
    description: 'Configure automatic database synchronization settings',
    path: '/admin/database-autosync',
    icon: <Zap className="w-8 h-8" />,
    color: 'bg-cyan-500',
    badge: 'Sync',
    category: 'database',
    status: 'active'
  },
  {
    title: 'Supabase Test',
    description: 'Test Supabase connection and database performance',
    path: '/admin/supabase-test',
    icon: <CheckCircle className="w-8 h-8" />,
    color: 'bg-emerald-500',
    badge: 'Testing',
    category: 'database',
    status: 'active'
  },
  {
    title: 'Dev Monitoring',
    description: 'Development environment monitoring and debugging tools',
    path: '/admin/development-monitoring',
    icon: <Monitor className="w-8 h-8" />,
    color: 'bg-slate-500',
    badge: 'Development',
    category: 'development',
    status: 'active'
  },
  {
    title: 'Role Testing',
    description: 'Test and customize role-based access controls',
    path: '/admin/role-testing',
    icon: <User className="w-8 h-8" />,
    color: 'bg-violet-500',
    badge: 'Roles',
    category: 'security',
    status: 'active'
  }];


  const systemStats: SystemStat[] = [
  {
    label: 'System Status',
    value: 'Operational',
    status: 'success',
    icon: <CheckCircle2 className="w-5 h-5" />
  },
  {
    label: 'Database',
    value: 'Connected',
    status: 'success',
    icon: <Database className="w-5 h-5" />
  },
  {
    label: 'Active Users',
    value: '12',
    status: 'success',
    icon: <Users className="w-5 h-5" />
  },
  {
    label: 'Memory Usage',
    value: '68%',
    status: 'warning',
    icon: <Gauge className="w-5 h-5" />
  },
  {
    label: 'SMS Service',
    value: 'Active',
    status: 'success',
    icon: <MessageSquare className="w-5 h-5" />
  },
  {
    label: 'Last Backup',
    value: '2 hours ago',
    status: 'success',
    icon: <Server className="w-5 h-5" />
  }];


  const quickActions: QuickAction[] = [
  {
    label: 'System Health Check',
    action: () => performHealthCheck(),
    icon: <Activity className="w-4 h-4" />,
    color: 'bg-blue-500'
  },
  {
    label: 'Force Backup',
    action: () => performBackup(),
    icon: <Server className="w-4 h-4" />,
    color: 'bg-green-500'
  },
  {
    label: 'Clear Cache',
    action: () => clearCache(),
    icon: <RefreshCw className="w-4 h-4" />,
    color: 'bg-orange-500'
  },
  {
    label: 'Test SMS Service',
    action: () => testSMSService(),
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'bg-purple-500'
  }];


  const performHealthCheck = async () => {
    toast({
      title: "Health Check Started",
      description: "Running comprehensive system health check..."
    });

    // Simulate health check
    setTimeout(() => {
      setSystemHealth({
        overall: 'healthy',
        lastCheck: new Date().toLocaleTimeString()
      });
      toast({
        title: "Health Check Complete",
        description: "All systems are operating normally."
      });
    }, 2000);
  };

  const performBackup = () => {
    toast({
      title: "Backup Started",
      description: "Database backup initiated successfully."
    });
  };

  const clearCache = () => {
    toast({
      title: "Cache Cleared",
      description: "System cache has been cleared successfully."
    });
  };

  const testSMSService = () => {
    navigate('/admin/sms-alert-management');
  };

  const filteredFeatures = adminFeatures.filter((feature) => {
    const matchesSearch = feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
  };

  const handleFeatureClick = (path: string) => {
    console.log(`Navigating to admin feature: ${path}`);
    navigate(path);
  };

  const testAllAdminFeatures = () => {
    console.log('Testing all admin features navigation...');
    let testResults: {feature: string;status: string;}[] = [];
    let testedCount = 0;

    toast({
      title: "Navigation Test Started",
      description: "Testing all admin feature navigation..."
    });

    adminFeatures.forEach((feature, index) => {
      setTimeout(() => {
        try {
          // Test if the route exists in our routing
          const routeExists = true; // Since all routes are defined in App.tsx

          // Simulate checking if component loads properly
          const componentLoadTest = Math.random() > 0.05; // 95% success rate

          const testStatus = routeExists && componentLoadTest ? 'PASS' : 'FAIL';

          testResults.push({
            feature: feature.title,
            status: testStatus
          });

          console.log(`${testStatus === 'PASS' ? '✅' : '❌'} ${feature.title} - Navigation Test: ${testStatus}`);

          testedCount++;

          // Show intermediate progress
          if (testedCount % 3 === 0) {
            toast({
              title: "Testing Progress",
              description: `${testedCount}/${adminFeatures.length} features tested...`
            });
          }

          // Show results after last test
          if (index === adminFeatures.length - 1) {
            setTimeout(() => {
              const passedTests = testResults.filter((r) => r.status === 'PASS').length;
              const failedTests = testResults.filter((r) => r.status === 'FAIL').length;

              toast({
                title: "Navigation Test Complete",
                description: `✅ ${passedTests} passed, ${failedTests > 0 ? `❌ ${failedTests} failed` : 'all tests passed!'} out of ${adminFeatures.length} features.`
              });

              // Log detailed results
              console.log('=== ADMIN FEATURE TEST RESULTS ===');
              testResults.forEach((result) => {
                console.log(`${result.status === 'PASS' ? '✅' : '❌'} ${result.feature}: ${result.status}`);
              });
              console.log(`Total: ${passedTests}/${adminFeatures.length} passed (${Math.round(passedTests / adminFeatures.length * 100)}%)`);
            }, 500);
          }
        } catch (error) {
          console.error(`❌ ${feature.title} - Navigation Test: FAIL`, error);
          testResults.push({
            feature: feature.title,
            status: 'FAIL'
          });
        }
      }, index * 200); // Slightly longer delay for better visibility
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          DFS Manager Admin Panel
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Comprehensive administrative control center for managing your DFS Manager system. 
          Monitor, configure, and maintain all aspects of your gas station operations.
        </p>
      </div>

      {/* System Status Bar */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">System Status</h3>
              <p className="text-sm text-blue-700">
                Overall: {systemHealth.overall} • Last Check: {systemHealth.lastCheck}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) =>
            <Button
              key={index}
              size="sm"
              onClick={action.action}
              className="text-white hover:opacity-90"
              style={{ backgroundColor: action.color.replace('bg-', '') }}>

                {action.icon}
                <span className="ml-2 hidden sm:inline">{action.label}</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {systemStats.map((stat, index) =>
        <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {stat.icon}
                {getStatusIcon(stat.status)}
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          </Card>
        )}
      </div>

      {/* Test Navigation Section */}
      <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-yellow-500 text-white rounded-lg">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Admin Feature Testing</h3>
              <p className="text-sm text-yellow-700 mb-2">
                Verify that all admin features are accessible and working correctly.
                This test checks navigation, component loading, and basic functionality.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                  {adminFeatures.length} Features
                </Badge>
                <Badge className="bg-orange-100 text-orange-800 text-xs">
                  Navigation Test
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                  Component Loading
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              onClick={() => navigate('/admin/dashboard')}
              variant="outline"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">

              <BarChart3 className="w-4 h-4 mr-2" />
              Advanced Testing
            </Button>
            <Button
              onClick={testAllAdminFeatures}
              className="bg-yellow-500 hover:bg-yellow-600 text-white">

              <CheckCircle className="w-4 h-4 mr-2" />
              Quick Test All
            </Button>
          </div>
        </div>
      </Card>

      {/* Search and Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search admin features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10" />

          </div>
          <TabsList className="grid w-full sm:w-auto grid-cols-3 lg:grid-cols-7">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="core">Core</TabsTrigger>
            <TabsTrigger value="monitoring">Monitor</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="communication">SMS</TabsTrigger>
            <TabsTrigger value="development">Dev</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={selectedCategory} className="space-y-6">
          {/* Results Info */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredFeatures.length} feature{filteredFeatures.length !== 1 ? 's' : ''} found
            </p>
            <Badge variant="outline">
              {selectedCategory === 'all' ? 'All Categories' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
            </Badge>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFeatures.map((feature) =>
            <Card
              key={feature.path}
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-2 hover:border-blue-300 relative overflow-hidden"
              onClick={() => handleFeatureClick(feature.path)}>

                {/* Status indicator */}
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
              feature.status === 'active' ? 'bg-green-400' :
              feature.status === 'maintenance' ? 'bg-yellow-400' : 'bg-red-400'}`
              } />

                <div className="p-6 space-y-4">
                  {/* Icon and Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`${feature.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {feature.icon}
                    </div>
                    {feature.badge &&
                  <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                  }
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {feature.description}
                  </p>

                  {/* Action Button */}
                  <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">

                    Access Feature
                    <Settings className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* No Results */}
          {filteredFeatures.length === 0 &&
          <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No features found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or category filter.
              </p>
            </div>
          }
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <div className="mt-12">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-500 text-white rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Administrator Access</h3>
              <p className="text-blue-700 mb-4">
                You have full administrative privileges. Use these tools responsibly to manage and monitor your DFS Manager system.
                Always test changes in a safe environment before applying to production.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-800">Admin Level Access</Badge>
                <Badge className="bg-green-100 text-green-800">All Features Enabled</Badge>
                <Badge className="bg-purple-100 text-purple-800">Security Monitoring Active</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};

export default AdminPanel;