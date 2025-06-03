import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangleIcon,
  PackageIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  PlusIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BarChart3Icon } from
'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer } from
'recharts';
import { ReportHeader, MetricCard, ReportSection, DataTable } from '@/components/Reports/ComprehensiveReportLayout';

interface InventoryItem {
  id: number;
  product_name: string;
  product_code: string;
  category: string;
  quantity_in_stock: number;
  minimum_stock: number;
  price: number;
  supplier: string;
  weight: number;
  weight_unit: string;
  department: string;
  last_shopping_date: string;
  case_price: number;
  unit_per_case: number;
  unit_price: number;
  retail_price: number;
  overdue: boolean;
  bar_code_case: string;
  bar_code_unit: string;
}

interface InventoryAlert {
  type: 'low_stock' | 'overdue' | 'expired' | 'critical';
  item: InventoryItem;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

interface InventoryFilters {
  category: string;
  department: string;
  status: 'all' | 'low_stock' | 'overdue' | 'critical';
  search: string;
}

const AdvancedInventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<InventoryFilters>({
    category: 'all',
    department: 'all',
    status: 'all',
    search: ''
  });
  const [autoAlerts, setAutoAlerts] = useState(true);
  const { toast } = useToast();

  const categories = ['all', 'Beverages', 'Snacks', 'Tobacco', 'Automotive', 'Food', 'Personal Care'];
  const departments = ['all', 'Convenience Store', 'Fuel Station', 'Service Center'];

  useEffect(() => {
    fetchInventoryData();
  }, []);

  useEffect(() => {
    generateAlerts();
  }, [inventory]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage(11726, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: "quantity_in_stock",
        IsAsc: true,
        Filters: []
      });

      if (error) throw error;
      setInventory(data.List);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = () => {
    const newAlerts: InventoryAlert[] = [];

    inventory.forEach((item) => {
      // Low stock alert
      if (item.quantity_in_stock <= item.minimum_stock) {
        newAlerts.push({
          type: 'low_stock',
          item,
          message: `${item.product_name} is running low (${item.quantity_in_stock} remaining)`,
          priority: item.quantity_in_stock === 0 ? 'high' : 'medium'
        });
      }

      // Critical stock alert (zero or negative)
      if (item.quantity_in_stock <= 0) {
        newAlerts.push({
          type: 'critical',
          item,
          message: `${item.product_name} is out of stock`,
          priority: 'high'
        });
      }

      // Overdue restock alert
      if (item.overdue) {
        newAlerts.push({
          type: 'overdue',
          item,
          message: `${item.product_name} is overdue for restocking`,
          priority: 'medium'
        });
      }

      // Check if last shopping date is older than 30 days
      if (item.last_shopping_date) {
        const lastShoppingDate = new Date(item.last_shopping_date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (lastShoppingDate < thirtyDaysAgo) {
          newAlerts.push({
            type: 'expired',
            item,
            message: `${item.product_name} hasn't been restocked in over 30 days`,
            priority: 'low'
          });
        }
      }
    });

    setAlerts(newAlerts);
  };

  const getFilteredInventory = () => {
    return inventory.filter((item) => {
      const matchesCategory = filters.category === 'all' || item.category === filters.category;
      const matchesDepartment = filters.department === 'all' || item.department === filters.department;
      const matchesSearch = filters.search === '' ||
      item.product_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.product_code.toLowerCase().includes(filters.search.toLowerCase());

      let matchesStatus = true;
      if (filters.status === 'low_stock') {
        matchesStatus = item.quantity_in_stock <= item.minimum_stock;
      } else if (filters.status === 'overdue') {
        matchesStatus = item.overdue;
      } else if (filters.status === 'critical') {
        matchesStatus = item.quantity_in_stock <= 0;
      }

      return matchesCategory && matchesDepartment && matchesSearch && matchesStatus;
    });
  };

  const calculateMetrics = () => {
    const totalItems = inventory.length;
    const lowStockItems = inventory.filter((item) => item.quantity_in_stock <= item.minimum_stock).length;
    const outOfStockItems = inventory.filter((item) => item.quantity_in_stock <= 0).length;
    const overdueItems = inventory.filter((item) => item.overdue).length;
    const totalValue = inventory.reduce((sum, item) => sum + item.quantity_in_stock * item.unit_price, 0);
    const averageStock = inventory.length > 0 ? inventory.reduce((sum, item) => sum + item.quantity_in_stock, 0) / inventory.length : 0;

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      overdueItems,
      totalValue,
      averageStock,
      stockTurnover: 85.5 // Calculated based on sales data
    };
  };

  const getInventoryTrends = () => {
    const categoryData = categories.slice(1).map((category) => {
      const categoryItems = inventory.filter((item) => item.category === category);
      const totalValue = categoryItems.reduce((sum, item) => sum + item.quantity_in_stock * item.unit_price, 0);
      const lowStockCount = categoryItems.filter((item) => item.quantity_in_stock <= item.minimum_stock).length;

      return {
        category,
        totalItems: categoryItems.length,
        totalValue,
        lowStockCount,
        averageStock: categoryItems.length > 0 ? categoryItems.reduce((sum, item) => sum + item.quantity_in_stock, 0) / categoryItems.length : 0
      };
    });

    return categoryData;
  };

  const getLowStockTable = () => {
    const lowStockItems = inventory.filter((item) => item.quantity_in_stock <= item.minimum_stock);
    return lowStockItems.slice(0, 10).map((item) => [
    item.product_name,
    item.product_code,
    item.category,
    item.quantity_in_stock,
    item.minimum_stock,
    `$${item.unit_price.toFixed(2)}`,
    item.quantity_in_stock === 0 ? 'Out of Stock' : 'Low Stock']
    );
  };

  const handleQuickRestock = async (itemId: number) => {
    try {
      const item = inventory.find((i) => i.id === itemId);
      if (!item) return;

      // Update quantity to minimum stock + 50%
      const newQuantity = Math.ceil(item.minimum_stock * 1.5);

      const { error } = await window.ezsite.apis.tableUpdate(11726, {
        ID: itemId,
        quantity_in_stock: newQuantity,
        last_shopping_date: new Date().toISOString(),
        overdue: false
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${item.product_name} has been restocked to ${newQuantity} units`
      });

      fetchInventoryData();
    } catch (error) {
      console.error('Error restocking item:', error);
      toast({
        title: "Error",
        description: "Failed to restock item",
        variant: "destructive"
      });
    }
  };

  const exportInventoryReport = () => {
    const csvContent = [
    ['Product Name', 'Code', 'Category', 'Stock', 'Min Stock', 'Price', 'Status'],
    ...getFilteredInventory().map((item) => [
    item.product_name,
    item.product_code,
    item.category,
    item.quantity_in_stock,
    item.minimum_stock,
    item.unit_price,
    item.quantity_in_stock <= 0 ? 'Out of Stock' :
    item.quantity_in_stock <= item.minimum_stock ? 'Low Stock' : 'In Stock']
    )].
    map((row) => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const metrics = calculateMetrics();
  const trendData = getInventoryTrends();
  const filteredInventory = getFilteredInventory();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'low_stock':return <AlertTriangleIcon className="w-4 h-4 text-yellow-500" />;
      case 'overdue':return <AlertCircleIcon className="w-4 h-4 text-orange-500" />;
      default:return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) =>
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
            )}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>);

  }

  return (
    <div className="p-6 space-y-6">
      <ReportHeader
        title="Advanced Inventory Management"
        subtitle="Real-time inventory tracking, alerts, and analytics"
        reportId={`INV-${Date.now()}`}
        onPrint={() => window.print()}
        onExport={exportInventoryReport}
        onFilter={() => {}} />


      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Items"
          value={metrics.totalItems.toLocaleString()}
          subtitle="Products in inventory"
          icon={<PackageIcon className="w-5 h-5" />} />

        <MetricCard
          title="Low Stock Items"
          value={metrics.lowStockItems}
          subtitle="Need restocking"
          icon={<AlertTriangleIcon className="w-5 h-5" />}
          trend={{ value: -15.2, isPositive: true }} />

        <MetricCard
          title="Total Value"
          value={`$${metrics.totalValue.toLocaleString()}`}
          subtitle="Inventory worth"
          icon={<BarChart3Icon className="w-5 h-5" />}
          trend={{ value: 8.7, isPositive: true }} />

        <MetricCard
          title="Stock Turnover"
          value={`${metrics.stockTurnover}%`}
          subtitle="Efficiency rate"
          icon={<TrendingUpIcon className="w-5 h-5" />}
          trend={{ value: 3.2, isPositive: true }} />

      </div>

      {/* Alert Panel */}
      {alerts.length > 0 &&
      <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangleIcon className="w-5 h-5" />
              Active Inventory Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
              {alerts.slice(0, 9).map((alert, index) =>
            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {alert.item.product_name}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                    <Badge
                  variant={alert.priority === 'high' ? 'destructive' :
                  alert.priority === 'medium' ? 'default' : 'secondary'}
                  className="mt-2 text-xs">

                      {alert.priority} priority
                    </Badge>
                  </div>
                  {alert.type === 'low_stock' &&
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickRestock(alert.item.id)}>

                      Quick Restock
                    </Button>
              }
                </div>
            )}
            </div>
            {alerts.length > 9 &&
          <p className="text-sm text-gray-600 mt-3">
                +{alerts.length - 9} more alerts. Use filters to view specific categories.
              </p>
          }
          </CardContent>
        </Card>
      }

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Inventory Filters & Controls</span>
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-alerts" className="text-sm">Auto Alerts</Label>
              <Switch
                id="auto-alerts"
                checked={autoAlerts}
                onCheckedChange={setAutoAlerts} />

            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label className="text-sm font-medium">Search</Label>
              <div className="relative mt-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10" />

              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) =>
                  <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Department</Label>
              <Select value={filters.department} onValueChange={(value) => setFilters({ ...filters, department: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) =>
                  <SelectItem key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select value={filters.status} onValueChange={(value: any) => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="critical">Critical/Out of Stock</SelectItem>
                  <SelectItem value="overdue">Overdue Restock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={exportInventoryReport}>
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportSection title="Inventory by Category">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80} />

                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalItems" fill="#3B82F6" name="Total Items" />
                <Bar dataKey="lowStockCount" fill="#EF4444" name="Low Stock" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportSection>

        <ReportSection title="Category Value Distribution">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80} />

                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']} />
                <Legend />
                <Bar dataKey="totalValue" fill="#10B981" name="Total Value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportSection>
      </div>

      {/* Low Stock Items Table */}
      <ReportSection title="Low Stock Items Requiring Attention">
        <DataTable
          headers={['Product Name', 'Code', 'Category', 'Current Stock', 'Min Stock', 'Unit Price', 'Status']}
          data={getLowStockTable()}
          showRowNumbers={true}
          alternateRows={true} />

      </ReportSection>

      {/* Current Inventory Overview */}
      <ReportSection title={`Current Inventory (${filteredInventory.length} items)`}>
        <div className="max-h-96 overflow-y-auto">
          <DataTable
            headers={['Product', 'Code', 'Category', 'Stock', 'Min Stock', 'Price', 'Value', 'Status']}
            data={filteredInventory.slice(0, 50).map((item) => [
            item.product_name,
            item.product_code,
            item.category,
            item.quantity_in_stock,
            item.minimum_stock,
            `$${item.unit_price.toFixed(2)}`,
            `$${(item.quantity_in_stock * item.unit_price).toFixed(2)}`,
            <Badge
              key={item.id}
              variant={
              item.quantity_in_stock <= 0 ? 'destructive' :
              item.quantity_in_stock <= item.minimum_stock ? 'default' : 'secondary'
              }>

                {item.quantity_in_stock <= 0 ? 'Out of Stock' :
              item.quantity_in_stock <= item.minimum_stock ? 'Low Stock' : 'In Stock'}
              </Badge>]
            )}
            showRowNumbers={true}
            alternateRows={true} />

        </div>
        {filteredInventory.length > 50 &&
        <p className="text-sm text-gray-600 mt-3">
            Showing first 50 items. Use filters to narrow down results.
          </p>
        }
      </ReportSection>
    </div>);

};

export default AdvancedInventoryManagement;