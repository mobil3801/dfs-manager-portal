import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Settings, 
  Shield, 
  Database, 
  MessageSquare, 
  FileText, 
  BarChart3,
  UserCheck,
  Building,
  AlertTriangle
} from 'lucide-react';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';

const AdminPanel = () => {
  const { userProfile, isAdmin } = useSimpleAuth();
  const navigate = useNavigate();

  if (!isAdmin()) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access Denied. You need administrator privileges to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const adminFeatures = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      route: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: 'Site Management',
      description: 'Manage gas stations and locations',
      icon: Building,
      route: '/admin/sites',
      color: 'bg-green-500'
    },
    {
      title: 'Role Management',
      description: 'Configure user roles and access levels',
      icon: UserCheck,
      route: '/admin/roles',
      color: 'bg-purple-500'
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: Settings,
      route: '/admin/settings',
      color: 'bg-orange-500'
    },
    {
      title: 'Security Settings',
      description: 'Manage security policies and access controls',
      icon: Shield,
      route: '/admin/security',
      color: 'bg-red-500'
    },
    {
      title: 'Database Management',
      description: 'Monitor and manage database operations',
      icon: Database,
      route: '/admin/database',
      color: 'bg-indigo-500'
    },
    {
      title: 'SMS Management',
      description: 'Configure SMS alerts and notifications',
      icon: MessageSquare,
      route: '/admin/sms',
      color: 'bg-pink-500'
    },
    {
      title: 'System Logs',
      description: 'View system logs and audit trails',
      icon: FileText,
      route: '/admin/logs',
      color: 'bg-gray-500'
    },
    {
      title: 'Analytics',
      description: 'View system analytics and reports',
      icon: BarChart3,
      route: '/admin/analytics',
      color: 'bg-cyan-500'
    }
  ];

  const handleFeatureClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Administrator Panel
        </h1>
        <p className="text-gray-600 mb-4">
          Welcome, {userProfile?.email}. Manage your DFS Manager Portal system.
        </p>
        <Badge className="mb-6">
          {userProfile?.role} - {userProfile?.role_code}
        </Badge>
      </div>

      {/* Admin Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleFeatureClick(feature.route)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFeatureClick(feature.route);
                  }}
                >
                  Access
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin/users')}
            >
              Create New User
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin/roles')}
            >
              Assign Role
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin/sites')}
            >
              Add Station
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin/security')}
            >
              Security Audit
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin/logs')}
            >
              View Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current system health and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Online</div>
              <div className="text-sm text-gray-500">System Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1</div>
              <div className="text-sm text-gray-500">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-500">Stations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">New</div>
              <div className="text-sm text-gray-500">Installation</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Getting Started:</strong> This is a new installation. You can manage users through the User Management section and assign roles to employees. To give admin access to other users, use the Role Management feature.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AdminPanel;
