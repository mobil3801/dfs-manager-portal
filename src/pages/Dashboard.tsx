import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Package, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const { user, userProfile } = useAuth();

  const stats = [
    {
      title: 'Total Products',
      value: '1,234',
      change: '+12%',
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Total Sales',
      value: '$45,231',
      change: '+8.5%',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Active Orders',
      value: '89',
      change: '+3.2%',
      icon: ShoppingCart,
      color: 'text-orange-600'
    },
    {
      title: 'Pending Alerts',
      value: '12',
      change: '-2.1%',
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ];

  const recentActivities = [
    { action: 'New product added', item: 'Premium Gas', time: '2 hours ago' },
    { action: 'Sales report generated', item: 'Daily Report', time: '4 hours ago' },
    { action: 'Inventory alert', item: 'Low stock warning', time: '6 hours ago' },
    { action: 'User registered', item: 'John Doe', time: '8 hours ago' },
    { action: 'Order completed', item: 'Order #1234', time: '1 day ago' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userProfile?.full_name || user?.Name || 'User'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your business today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Role</p>
                {userProfile?.role && (
                  <Badge className="mt-1">
                    {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                  </Badge>
                )}
              </div>
              <Avatar className="w-12 h-12">
                <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.full_name || user?.Name} />
                <AvatarFallback>
                  {(userProfile?.full_name || user?.Name || user?.Email || '')
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest actions and updates in your system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.item}</p>
                    </div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Add Product</p>
                    <p className="text-sm text-gray-600">Add new inventory item</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Sales Report</p>
                    <p className="text-sm text-gray-600">Generate daily report</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-orange-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Manage Staff</p>
                    <p className="text-sm text-gray-600">Add or edit employees</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">View Alerts</p>
                    <p className="text-sm text-gray-600">Check system alerts</p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* User Profile Info (for debugging/info) */}
        {userProfile && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your current profile details and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Username</label>
                  <p className="text-gray-900">{userProfile.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900">{userProfile.department || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge variant={userProfile.status === 'active' ? 'default' : 'secondary'}>
                    {userProfile.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
