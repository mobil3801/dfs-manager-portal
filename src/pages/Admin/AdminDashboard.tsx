import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart3,
  Users,
  Database,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  Clock,
  Shield,
  Server,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AccessDenied from '@/components/AccessDenied';
import AdminDiagnostics from '@/components/AdminDiagnostics';
import AdminFeatureTester from '@/components/AdminFeatureTester';
import { useToast } from '@/hooks/use-toast';

interface DashboardStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

interface RecentActivity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  resolved: boolean;
}

const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isAdmin) {
    return <AccessDenied />;
  }

  const dashboardStats: DashboardStat[] = [
    {
      label: 'Total Users',
      value: '24',
      change: '+2 this week',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      label: 'Active Sessions',
      value: '12',
      change: '+5 since yesterday',
      trend: 'up',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      label: 'Database Size',
      value: '2.4 GB',
      change: '+120 MB this month',
      trend: 'up',
      icon: <Database className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      label: 'SMS Alerts Sent',
      value: '156',
      change: '+23 today',
      trend: 'up',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-orange-500'
    },
    {
      label: 'System Uptime',
      value: '99.9%',
      change: 'Last 30 days',
      trend: 'stable',
      icon: <Server className="w-6 h-6" />,
      color: 'bg-teal-500'
    },
    {
      label: 'API Response Time',
      value: '245ms',
      change: '-12ms improved',
      trend: 'up',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-yellow-500'
    }
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      action: 'User "john.doe" logged in',
      user: 'john.doe',
      timestamp: '2 minutes ago',
      type: 'success'
    },
    {
      id: '2',
      action: 'SMS alert sent for license expiry',
      user: 'system',
      timestamp: '15 minutes ago',
      type: 'info'
    },
    {
      id: '3',
      action: 'Database backup completed',
      user: 'system',
      timestamp: '1 hour ago',
      type: 'success'
    },
    {
      id: '4',
      action: 'Failed login attempt from unknown IP',
      user: 'unknown',
      timestamp: '2 hours ago',
      type: 'warning'
    },
    {
      id: '5',
      action: 'New employee added by admin',
      user: 'admin',
      timestamp: '3 hours ago',
      type: 'success'
    }
  ];

  const systemAlerts: SystemAlert[] = [
    {
      id: '1',
      title: 'Memory Usage High',
      message: 'System memory usage is at 85%. Consider upgrading server resources.',
      severity: 'medium',
      timestamp: '30 minutes ago',
      resolved: false
    },
    {
      id: '2',
      title: 'License Expiring Soon',
      message: 'Business license for MOBIL station expires in 5 days.',
      severity: 'high',
      timestamp: '1 hour ago',
      resolved: false
    },
    {
      id: '3',
      title: 'Backup Successful',
      message: 'Daily database backup completed successfully.',
      severity: 'low',
      timestamp: '2 hours ago',
      resolved: true
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const resolveAlert = (alertId: string) => {
    // In a real app, this would make an API call
    toast({
      title: "Alert Resolved",
      description: "Alert has been marked as resolved.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Monitor and manage your DFS Manager system with real-time insights and controls.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardStats.map((stat, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`${stat.color} text-white p-3 rounded-lg`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getTrendIcon(stat.trend)}
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="flex flex-col items-center p-4 h-auto">
                <Users className="w-6 h-6 mb-2" />
                <span className="text-sm">Manage Users</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                <Database className="w-6 h-6 mb-2" />
                <span className="text-sm">Backup Database</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                <MessageSquare className="w-6 h-6 mb-2" />
                <span className="text-sm">Send SMS Test</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                <BarChart3 className="w-6 h-6 mb-2" />
                <span className="text-sm">View Reports</span>
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {activity.user}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">System Alerts</h3>
              <Badge variant="outline">
                {systemAlerts.filter(alert => !alert.resolved).length} Active
              </Badge>
            </div>
            <div className="space-y-4">
              {systemAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 border-2 rounded-lg ${getAlertColor(alert.severity)} ${
                    alert.resolved ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge 
                          variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {alert.severity}
                        </Badge>
                        {alert.resolved && (
                          <Badge className="text-xs bg-green-100 text-green-800">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {alert.timestamp}
                      </span>
                    </div>
                    {!alert.resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-6">
          <AdminDiagnostics />
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <AdminFeatureTester />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;