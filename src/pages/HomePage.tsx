
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Users, 
  Package, 
  TrendingUp, 
  Shield, 
  Smartphone,
  Clock,
  CheckCircle,
  ArrowRight,
  Fuel,
  FileText,
  AlertTriangle
} from 'lucide-react'

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <Building2 className="h-8 w-8" />,
      title: "Multi-Station Management",
      description: "Manage multiple gas stations from a single dashboard with station-specific access controls."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Employee Management",
      description: "Track employee information, roles, and performance across all your locations."
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: "Inventory Control",
      description: "Monitor product levels, track deliveries, and manage supplier relationships."
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Sales Analytics",
      description: "Comprehensive reporting on sales performance, trends, and financial metrics."
    },
    {
      icon: <Fuel className="h-8 w-8" />,
      title: "Fuel Management",
      description: "Track fuel deliveries, monitor tank levels, and manage fuel pricing."
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "License Tracking",
      description: "Never miss license renewals with automated alerts and document management."
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "SMS Notifications",
      description: "Automated alerts for important events, low inventory, and license expirations."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Security & Compliance",
      description: "Role-based access control and comprehensive audit trails for compliance."
    }
  ]

  const benefits = [
    "Real-time dashboard with key performance indicators",
    "Automated inventory alerts and reorder notifications",
    "Mobile-responsive design for on-the-go management",
    "Secure cloud-based storage with automatic backups",
    "Customizable reporting and analytics",
    "Integration with SMS services for instant notifications"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">DFS</span>
            </div>
            <span className="font-bold text-xl text-gray-900">DFS Manager</span>
          </div>
          <Link to="/login">
            <Button variant="outline" className="gap-2">
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <Badge variant="secondary" className="mb-4">
            Complete Gas Station Management Solution
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            Streamline Your
            <span className="text-blue-600 block">Gas Station Operations</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive management platform designed specifically for gas station owners. 
            Monitor sales, track inventory, manage employees, and stay compliant with automated alerts.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Link to="/login">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Your Business
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From inventory management to compliance tracking, our platform provides 
            all the tools you need to run your gas stations efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-blue-600 mb-2">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose DFS Manager?
              </h2>
              <p className="text-gray-600 mb-8">
                Built specifically for gas station owners, our platform combines industry 
                expertise with modern technology to deliver a solution that actually works 
                for your business.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Save Time</h3>
                <p className="text-sm text-gray-600">Reduce administrative tasks by 60%</p>
              </Card>
              <Card className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Increase Revenue</h3>
                <p className="text-sm text-gray-600">Optimize operations for better profits</p>
              </Card>
              <Card className="p-6 text-center">
                <Shield className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Stay Compliant</h3>
                <p className="text-sm text-gray-600">Never miss important deadlines</p>
              </Card>
              <Card className="p-6 text-center">
                <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Prevent Issues</h3>
                <p className="text-sm text-gray-600">Proactive alerts and monitoring</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Gas Station Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of gas station owners who have streamlined their operations 
            with DFS Manager. Start your free trial today.
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="gap-2">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">DFS</span>
            </div>
            <span className="font-bold text-lg">DFS Manager</span>
          </div>
          <p className="text-gray-400">
            © 2024 DFS Manager. All rights reserved. Built for gas station excellence.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
