import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Users,
  TrendingUp,
  FileText,
  Package,
  Truck,
  DollarSign,
  Award,
  Settings,
  BarChart3 } from
'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const quickActions = [
  {
    title: 'Products',
    description: 'Manage inventory and product information',
    icon: Package,
    path: '/products',
    color: 'bg-blue-500'
  },
  {
    title: 'Employees',
    description: 'Employee management and records',
    icon: Users,
    path: '/employees',
    color: 'bg-green-500'
  },
  {
    title: 'Sales Reports',
    description: 'Daily sales tracking and analytics',
    icon: TrendingUp,
    path: '/sales',
    color: 'bg-purple-500'
  },
  {
    title: 'Vendors',
    description: 'Vendor relationships and contacts',
    icon: Truck,
    path: '/vendors',
    color: 'bg-orange-500'
  },
  {
    title: 'Orders',
    description: 'Order processing and management',
    icon: ShoppingCart,
    path: '/orders',
    color: 'bg-indigo-500'
  },
  {
    title: 'Licenses',
    description: 'Certificates and compliance tracking',
    icon: Award,
    path: '/licenses',
    color: 'bg-red-500'
  },
  {
    title: 'Salary Records',
    description: 'Payroll and salary management',
    icon: DollarSign,
    path: '/salary',
    color: 'bg-yellow-500'
  },
  {
    title: 'Deliveries',
    description: 'Delivery tracking and logistics',
    icon: FileText,
    path: '/delivery',
    color: 'bg-teal-500'
  }];


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png"
                  alt="DFS Manager Logo"
                  className="h-8 w-auto" />

                <h1 className="text-xl font-bold text-gray-900">DFS Manager Portal</h1>
              </div>
              <Button onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Comprehensive Station Management System
            </h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Streamline your gas station operations with our integrated management platform. 
              Handle everything from inventory and sales to employee management and compliance tracking.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="text-center">
                <CardHeader>
                  <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle>Real-time Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Track sales, inventory, and performance metrics in real-time</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <CardTitle>Team Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Manage employees, schedules, and payroll efficiently</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Settings className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle>Compliance Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Stay compliant with automated license and certificate management</p>
                </CardContent>
              </Card>
            </div>

            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">

              Get Started Today
            </Button>
          </div>
        </main>

        <footer className="bg-gray-900 text-white py-12 mt-20">
          <div className="container mx-auto px-6 text-center">
            <p>&copy; {new Date().getFullYear()} DFS Manager Portal. Powered by EasySite Database System.</p>
          </div>
        </footer>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png"
                alt="DFS Manager Logo"
                className="h-8 w-auto" />

              <div>
                <h1 className="text-xl font-bold text-gray-900">DFS Manager Portal</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.Name || user?.Email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                EasySite Database Connected
              </Badge>
              <Button onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Station Management Hub</h2>
          <p className="text-lg text-gray-600">
            Access all your management tools from one central location. Click any module below to get started.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => navigate(action.path)}>

                <CardHeader className="text-center pb-4">
                  <div className={`${action.color} w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <CardDescription className="text-sm">
                    {action.description}
                  </CardDescription>
                </CardContent>
              </Card>);

          })}
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">System Status</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="font-medium">Database Connected</p>
                <p className="text-sm text-gray-600">EasySite Database System</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="font-medium">Authentication Active</p>
                <p className="text-sm text-gray-600">Secure Login System</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="font-medium">All Modules Ready</p>
                <p className="text-sm text-gray-600">Production Environment</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>);

};

export default HomePage;