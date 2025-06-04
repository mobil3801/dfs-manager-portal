import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Zap } from
'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AccessDenied from '@/components/AccessDenied';

interface AdminFeature {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <AccessDenied />;
  }

  const adminFeatures: AdminFeature[] = [
  {
    title: 'User Management',
    description: 'Manage user accounts, roles, and permissions across all stations',
    path: '/admin/user-management',
    icon: <UserCheck className="w-8 h-8" />,
    color: 'bg-blue-500',
    badge: 'Core'
  },
  {
    title: 'Site Management',
    description: 'Configure stations, settings, and operational parameters',
    path: '/admin/site-management',
    icon: <Globe className="w-8 h-8" />,
    color: 'bg-green-500',
    badge: 'Essential'
  },
  {
    title: 'SMS Alert Management',
    description: 'Configure SMS alerts for license expiry and system notifications',
    path: '/admin/sms-alert-management',
    icon: <MessageSquare className="w-8 h-8" />,
    color: 'bg-purple-500',
    badge: 'Communication'
  },
  {
    title: 'System Logs',
    description: 'View and analyze system activity logs and events',
    path: '/admin/system-logs',
    icon: <FileText className="w-8 h-8" />,
    color: 'bg-orange-500',
    badge: 'Monitoring'
  },
  {
    title: 'Security Settings',
    description: 'Configure security policies, authentication, and access controls',
    path: '/admin/security-settings',
    icon: <Shield className="w-8 h-8" />,
    color: 'bg-red-500',
    badge: 'Security'
  },
  {
    title: 'Error Recovery',
    description: 'Monitor and recover from system errors and exceptions',
    path: '/admin/error-recovery',
    icon: <AlertTriangle className="w-8 h-8" />,
    color: 'bg-yellow-500',
    badge: 'Recovery'
  },
  {
    title: 'Memory Monitoring',
    description: 'Track memory usage and detect potential memory leaks',
    path: '/admin/memory-monitoring',
    icon: <Activity className="w-8 h-8" />,
    color: 'bg-pink-500',
    badge: 'Performance'
  },
  {
    title: 'Database Monitoring',
    description: 'Monitor database connections and performance metrics',
    path: '/admin/database-monitoring',
    icon: <Database className="w-8 h-8" />,
    color: 'bg-indigo-500',
    badge: 'Database'
  },
  {
    title: 'Audit Monitoring',
    description: 'Track user activities and system audit trails',
    path: '/admin/audit-monitoring',
    icon: <Shield className="w-8 h-8" />,
    color: 'bg-teal-500',
    badge: 'Audit'
  },
  {
    title: 'Database Auto-sync',
    description: 'Configure automatic database synchronization settings',
    path: '/admin/database-autosync',
    icon: <Zap className="w-8 h-8" />,
    color: 'bg-cyan-500',
    badge: 'Sync'
  },
  {
    title: 'Supabase Test',
    description: 'Test Supabase connection and database performance',
    path: '/admin/supabase-test',
    icon: <CheckCircle className="w-8 h-8" />,
    color: 'bg-emerald-500',
    badge: 'Testing'
  },
  {
    title: 'Dev Monitoring',
    description: 'Development environment monitoring and debugging tools',
    path: '/admin/development-monitoring',
    icon: <Monitor className="w-8 h-8" />,
    color: 'bg-slate-500',
    badge: 'Development'
  },
  {
    title: 'Role Testing',
    description: 'Test and customize role-based access controls',
    path: '/admin/role-testing',
    icon: <User className="w-8 h-8" />,
    color: 'bg-violet-500',
    badge: 'Roles'
  }];


  const handleFeatureClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Panel</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Comprehensive administrative tools for managing your DFS Manager system. 
          Access all administrative features from this centralized control panel.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {adminFeatures.map((feature) =>
        <Card
          key={feature.path}
          className="group hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border-2 hover:border-gray-300"
          onClick={() => handleFeatureClick(feature.path)}>

            <div className="p-6 space-y-4">
              {/* Icon and Badge */}
              <div className="flex items-center justify-between">
                <div className={`${feature.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
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
              <p className="text-sm text-gray-600 leading-relaxed">
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

      {/* Footer Info */}
      <div className="mt-12 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Administrator Access</h3>
          <p className="text-blue-700">
            You have full administrative privileges. Use these tools responsibly to manage and monitor your DFS Manager system.
          </p>
        </div>
      </div>
    </div>);

};

export default AdminPanel;