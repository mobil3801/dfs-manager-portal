import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Users,
  Package,
  FileText,
  Truck,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = {
    totalEmployees: 25,
    activeProducts: 150,
    todayReports: 3,
    pendingDeliveries: 2,
    expiringLicenses: 1,
    totalSales: 15420
  };

  const QuickStatCard = ({
    title,
    value,
    icon: Icon,
    color,
    onClick
  }: {
    title: string;
    value: number | string;
    icon: any;
    color: string;
    onClick?: () => void;
  }) => (
    <Card
      className={`p-6 cursor-pointer hover:shadow-lg transition-shadow ${onClick ? 'hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </Card>
  );

  const QuickAction = ({
    title,
    description,
    icon: Icon,
    onClick,
    color = "text-blue-600"
  }: {
    title: string;
    description: string;
    icon: any;
    onClick: () => void;
    color?: string;
  }) => (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex items-start space-x-3">
        <Icon className={`h-6 w-6 ${color} mt-1`} />
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome to DFS Manager Portal!</h1>
          <p className="opacity-90">
            Manage your gas stations with powerful tools and insights
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <QuickStatCard
            title="Employees"
            value={stats.totalEmployees}
            icon={Users}
            color="text-blue-600"
            onClick={() => navigate('/employees')}
          />
          <QuickStatCard
            title="Products"
            value={stats.activeProducts}
            icon={Package}
            color="text-green-600"
            onClick={() => navigate('/products')}
          />
          <QuickStatCard
            title="Today's Reports"
            value={stats.todayReports}
            icon={FileText}
            color="text-purple-600"
            onClick={() => navigate('/sales')}
          />
          <QuickStatCard
            title="Deliveries"
            value={stats.pendingDeliveries}
            icon={Truck}
            color="text-orange-600"
            onClick={() => navigate('/delivery')}
          />
          <QuickStatCard
            title="Expiring Licenses"
            value={stats.expiringLicenses}
            icon={AlertTriangle}
            color="text-red-600"
            onClick={() => navigate('/licenses')}
          />
          <QuickStatCard
            title="Today's Sales"
            value={`$${stats.totalSales.toLocaleString()}`}
            icon={TrendingUp}
            color="text-emerald-600"
          />
        </div>

        {/* System Status */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="h-5 w-5" />
            <h3 className="text-lg font-semibold">System Status</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Connection</span>
              <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Data Sync</span>
              <span className="text-sm text-gray-500">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">User Session</span>
              <Badge variant="default" className="bg-blue-100 text-blue-800">Active</Badge>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            title="New Sales Report"
            description="Create a daily sales report"
            icon={FileText}
            onClick={() => navigate('/sales/new')}
          />
          <QuickAction
            title="Record Delivery"
            description="Log a new fuel delivery"
            icon={Truck}
            onClick={() => navigate('/delivery/new')}
          />
          <QuickAction
            title="Add Product"
            description="Register a new product"
            icon={Package}
            onClick={() => navigate('/products/new')}
          />
          <QuickAction
            title="Manage Employees"
            description="View and edit employee records"
            icon={Users}
            onClick={() => navigate('/employees')}
          />
          <QuickAction
            title="Check Licenses"
            description="Review license status and renewals"
            icon={Calendar}
            onClick={() => navigate('/licenses')}
          />
          <QuickAction
            title="Admin Panel"
            description="System administration and settings"
            icon={BarChart3}
            onClick={() => navigate('/admin')}
            color="text-red-600"
          />
        </div>

        {/* Navigation back to home */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="px-8"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;