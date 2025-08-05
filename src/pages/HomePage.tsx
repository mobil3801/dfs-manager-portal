import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, Package, FileText, Truck, Calendar, Shield, Activity } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: 'Sales Analytics',
      description: 'Track daily sales, revenue, and performance metrics across all stations',
      color: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Manage staff records, schedules, and performance tracking',
      color: 'text-green-600'
    },
    {
      icon: Package,
      title: 'Inventory Control',
      description: 'Monitor fuel levels, product stock, and automated reorder alerts',
      color: 'text-purple-600'
    },
    {
      icon: FileText,
      title: 'Report Generation',
      description: 'Generate comprehensive reports for compliance and analysis',
      color: 'text-orange-600'
    },
    {
      icon: Truck,
      title: 'Delivery Tracking',
      description: 'Track fuel deliveries, schedules, and inventory updates',
      color: 'text-cyan-600'
    },
    {
      icon: Calendar,
      title: 'License Management',
      description: 'Monitor license expiration dates and renewal requirements',
      color: 'text-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img 
                src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png" 
                alt="DFS Manager"
                className="h-10 w-auto"
              />
              <h1 className="text-2xl font-bold text-gray-900">DFS Manager Portal</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/login')}>
                Get Started
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Complete Gas Station Management Solution
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Streamline your gas station operations with our comprehensive management portal. 
              Track sales, manage inventory, monitor employees, and ensure compliance - all in one place.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="px-8 py-3 text-lg"
              onClick={() => navigate('/login')}
            >
              Access Dashboard
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-3 text-lg"
              onClick={() => navigate('/login')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Station
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools necessary to efficiently operate and monitor your gas station business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <feature.icon className={`h-12 w-12 ${feature.color} mx-auto mb-4`} />
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-blue-600 text-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Trusted by Gas Station Owners</h3>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Join thousands of successful gas station operators who rely on our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Stations Managed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime Reliability</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">$2M+</div>
              <div className="text-blue-100">Sales Tracked Daily</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto text-center">
          <Card className="p-12 max-w-3xl mx-auto">
            <Activity className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Transform your gas station management today. Access your dashboard and start optimizing your operations.
            </p>
            <Button 
              size="lg" 
              className="px-12 py-4 text-lg"
              onClick={() => navigate('/login')}
            >
              Access Your Dashboard
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png" 
                  alt="DFS Manager"
                  className="h-8 w-auto"
                />
                <h4 className="text-xl font-bold">DFS Manager Portal</h4>
              </div>
              <p className="text-gray-400 max-w-md">
                The complete solution for gas station management, providing real-time insights and operational control.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Features</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Sales Tracking</li>
                <li>Inventory Management</li>
                <li>Employee Records</li>
                <li>Report Generation</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>24/7 Support</li>
                <li>Training</li>
                <li>Updates</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} DFS Manager Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;