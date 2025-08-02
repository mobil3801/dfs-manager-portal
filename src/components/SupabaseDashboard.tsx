import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import {
  productService,
  salesReportService,
  employeeService,
  licenseService,
  stationService } from
'@/services/databaseService';
import {
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Calendar,
  FileText,
  Building2,
  Loader2,
  BarChart3,
  ShoppingCart,
  Clock } from
'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalEmployees: number;
  todaysSales: number;
  monthSales: number;
  expiringLicenses: number;
  recentSalesReports: any[];
  stationStats: any[];
}

const SupabaseDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    totalEmployees: 0,
    todaysSales: 0,
    monthSales: 0,
    expiringLicenses: 0,
    recentSalesReports: [],
    stationStats: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const { userProfile, user, isAdmin, isManager } = useSupabaseAuth();

  useEffect(() => {
    loadDashboardData();
  }, [userProfile]);

  const loadDashboardData = async () => {
    if (!userProfile) return;

    setIsLoading(true);
    try {
      const stationId = userProfile.station_id;

      // Load parallel data
      const [
      productsResult,
      lowStockResult,
      employeesResult,
      salesAnalyticsResult,
      licensesResult,
      recentSalesResult,
      stationsResult] =
      await Promise.allSettled([
      productService.getAll({ station_id: stationId }),
      productService.getLowStockProducts(stationId),
      employeeService.getAll({ station_id: stationId }),
      salesReportService.getSalesAnalytics(stationId, 'month'),
      licenseService.getExpiringLicenses(30, stationId),
      salesReportService.getSalesReportsByDateRange(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0],
        stationId
      ),
      isAdmin() || isManager() ? stationService.getStationsWithStats() : Promise.resolve({ data: null })]
      );

      // Process results
      const products = productsResult.status === 'fulfilled' ? productsResult.value.data || [] : [];
      const lowStock = lowStockResult.status === 'fulfilled' ? lowStockResult.value.data || [] : [];
      const employees = employeesResult.status === 'fulfilled' ? employeesResult.value.data || [] : [];
      const salesData = salesAnalyticsResult.status === 'fulfilled' ? salesAnalyticsResult.value.data || [] : [];
      const licenses = licensesResult.status === 'fulfilled' ? licensesResult.value.data || [] : [];
      const recentSales = recentSalesResult.status === 'fulfilled' ? recentSalesResult.value.data || [] : [];
      const stations = stationsResult.status === 'fulfilled' ? stationsResult.value.data || [] : [];

      // Calculate sales totals
      const today = new Date().toISOString().split('T')[0];
      const todaysSales = salesData.
      filter((sale: any) => sale.report_date === today).
      reduce((sum: number, sale: any) => sum + (sale.total_sales || 0), 0);

      const monthSales = salesData.
      reduce((sum: number, sale: any) => sum + (sale.total_sales || 0), 0);

      setStats({
        totalProducts: products.length,
        lowStockProducts: lowStock.length,
        totalEmployees: employees.length,
        todaysSales,
        monthSales,
        expiringLicenses: licenses.length,
        recentSalesReports: recentSales.slice(0, 5),
        stationStats: stations || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>);

  }

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            {userProfile?.role} • {userProfile?.stations?.name || 'All Stations'}
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.lowStockProducts > 0 &&
                  <span className="text-red-600">{stats.lowStockProducts} low stock</span>
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">Active staff members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.todaysSales)}</div>
                <p className="text-xs text-muted-foreground">Current day total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.lowStockProducts + stats.expiringLicenses}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.lowStockProducts} low stock, {stats.expiringLicenses} expiring licenses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Sales Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentSalesReports.length > 0 ?
                  stats.recentSalesReports.map((report: any) =>
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{report.report_date}</p>
                          <p className="text-sm text-gray-600">{report.shift || 'Full Day'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(report.total_sales || 0)}</p>
                          <Badge variant={report.status === 'Completed' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                        </div>
                      </div>
                  ) :

                  <p className="text-gray-500 text-center py-4">No recent sales reports</p>
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Alerts & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.lowStockProducts > 0 &&
                  <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-800">Low Stock Alert</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        {stats.lowStockProducts} products are running low on stock
                      </p>
                    </div>
                  }
                  
                  {stats.expiringLicenses > 0 &&
                  <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium text-yellow-800">License Expiring</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        {stats.expiringLicenses} licenses expire within 30 days
                      </p>
                    </div>
                  }
                  
                  {stats.lowStockProducts === 0 && stats.expiringLicenses === 0 &&
                  <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-800">All Systems Good</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        No alerts or issues detected
                      </p>
                    </div>
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Station Overview (for admins/managers) */}
          {(isAdmin() || isManager()) && stats.stationStats.length > 0 &&
          <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Station Overview
                </CardTitle>
                <CardDescription>
                  Performance across all stations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.stationStats.map((station: any) =>
                <div key={station.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{station.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{station.address}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Products:</span>
                          <span className="ml-1 font-medium">{station.products?.[0]?.count || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Staff:</span>
                          <span className="ml-1 font-medium">{station.employees?.[0]?.count || 0}</span>
                        </div>
                      </div>
                    </div>
                )}
                </div>
              </CardContent>
            </Card>
          }
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Sales Performance
              </CardTitle>
              <CardDescription>
                Monthly sales overview and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Today's Sales</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.todaysSales)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats.monthSales)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Average Daily</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(stats.monthSales / 30)}
                  </p>
                </div>
              </div>
              
              <div className="h-64 flex items-center justify-center border rounded-lg bg-gray-50">
                <p className="text-gray-500">Sales chart would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Inventory Status
              </CardTitle>
              <CardDescription>
                Current stock levels and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Stock Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 border rounded">
                      <span>Total Products</span>
                      <span className="font-medium">{stats.totalProducts}</span>
                    </div>
                    <div className="flex justify-between p-3 border rounded border-red-200 bg-red-50">
                      <span className="text-red-800">Low Stock Items</span>
                      <span className="font-medium text-red-800">{stats.lowStockProducts}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <Package className="h-4 w-4 mr-2" />
                      View All Products
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Check Low Stock
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

};

export default SupabaseDashboard;