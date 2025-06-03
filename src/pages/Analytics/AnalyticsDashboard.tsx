import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import SalesAnalyticsDashboard from '@/components/Analytics/SalesAnalyticsDashboard';
import AdvancedInventoryManagement from '@/components/Inventory/AdvancedInventoryManagement';
import DeliveryTrackingSystem from '@/components/Operations/DeliveryTrackingSystem';
import FinancialManagementDashboard from '@/components/Financial/FinancialManagementDashboard';
import { 
  BarChart3Icon, 
  PackageIcon, 
  TruckIcon, 
  DollarSignIcon,
  TrendingUpIcon,
  ActivityIcon
} from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-blue-100">
              Comprehensive business intelligence and performance analytics for DFS Manager Portal
            </p>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="mb-2">
              Real-time Data
            </Badge>
            <p className="text-sm text-blue-100">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3Icon className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUpIcon className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Sales Analytics</h3>
            <p className="text-sm text-gray-600">
              Revenue trends, payment methods, and station performance analysis
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <PackageIcon className="w-6 h-6 text-green-600" />
              </div>
              <ActivityIcon className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Inventory Management</h3>
            <p className="text-sm text-gray-600">
              Stock levels, alerts, turnover rates, and category analysis
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TruckIcon className="w-6 h-6 text-orange-600" />
              </div>
              <TrendingUpIcon className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delivery Tracking</h3>
            <p className="text-sm text-gray-600">
              Fuel deliveries, tank reports, and verification management
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSignIcon className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUpIcon className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Financial Management</h3>
            <p className="text-sm text-gray-600">
              Profit analysis, cash flow, expenses, and financial health
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <BarChart3Icon className="w-4 h-4" />
            Sales Analytics
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <PackageIcon className="w-4 h-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <TruckIcon className="w-4 h-4" />
            Delivery
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSignIcon className="w-4 h-4" />
            Financial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3Icon className="w-5 h-5 text-blue-600" />
                Sales Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <SalesAnalyticsDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageIcon className="w-5 h-5 text-green-600" />
                Advanced Inventory Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <AdvancedInventoryManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TruckIcon className="w-5 h-5 text-orange-600" />
                Delivery Tracking System
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DeliveryTrackingSystem />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSignIcon className="w-5 h-5 text-purple-600" />
                Financial Management Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <FinancialManagementDashboard />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analytics Features Overview */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle>Analytics Features & Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Sales Analytics</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Revenue trend analysis</li>
                <li>• Payment method breakdown</li>
                <li>• Station performance comparison</li>
                <li>• Top performing days/products</li>
                <li>• Real-time sales metrics</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-600 mb-2">Inventory Management</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Real-time stock alerts</li>
                <li>• Category-wise analysis</li>
                <li>• Automated reorder points</li>
                <li>• Turnover rate tracking</li>
                <li>• Supplier performance</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-orange-600 mb-2">Delivery Tracking</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Fuel delivery monitoring</li>
                <li>• Tank verification reports</li>
                <li>• BOL number tracking</li>
                <li>• Discrepancy management</li>
                <li>• Delivery performance metrics</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">Financial Analysis</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Profit & loss analysis</li>
                <li>• Cash flow monitoring</li>
                <li>• Expense categorization</li>
                <li>• Station profitability</li>
                <li>• Financial health indicators</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;