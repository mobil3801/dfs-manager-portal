import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Bell, Mail, Settings, Package, TrendingDown, RefreshCw, Eye, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: number;
  product_name: string;
  category: string;
  quantity_in_stock: number;
  minimum_stock: number;
  supplier: string;
  department: string;
  retail_price: number;
  last_updated_date: string;
  overdue: boolean;
}

interface AlertSettings {
  lowStockThreshold: number;
  criticalStockThreshold: number;
  emailNotifications: boolean;
  autoReorderSuggestions: boolean;
}

const InventoryAlerts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    lowStockThreshold: 10,
    criticalStockThreshold: 5,
    emailNotifications: true,
    autoReorderSuggestions: true
  });
  const { toast } = useToast();

  const pageSize = 20;
  const PRODUCTS_TABLE_ID = '11726';

  useEffect(() => {
    fetchProducts();
    loadAlertSettings();
  }, [currentPage, categoryFilter, severityFilter, searchTerm]);

  const loadAlertSettings = () => {
    const saved = localStorage.getItem('inventoryAlertSettings');
    if (saved) {
      setAlertSettings(JSON.parse(saved));
    }
  };

  const saveAlertSettings = (newSettings: AlertSettings) => {
    setAlertSettings(newSettings);
    localStorage.setItem('inventoryAlertSettings', JSON.stringify(newSettings));
    toast({
      title: 'Settings Saved',
      description: 'Alert settings have been updated successfully'
    });
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const filters = [];

      if (categoryFilter !== 'all') {
        filters.push({ name: 'category', op: 'Equal', value: categoryFilter });
      }

      if (searchTerm) {
        filters.push({ name: 'product_name', op: 'StringContains', value: searchTerm });
      }

      const { data, error } = await window.ezsite.apis.tablePage(PRODUCTS_TABLE_ID, {
        PageNo: currentPage,
        PageSize: pageSize,
        OrderByField: 'quantity_in_stock',
        IsAsc: true,
        Filters: filters
      });

      if (error) throw error;

      const allProducts = data?.List || [];
      setProducts(allProducts);
      setTotalRecords(data?.VirtualCount || 0);

      // Filter products that need attention
      const alertProducts = allProducts.filter((product) => {
        const stockRatio = product.quantity_in_stock / (product.minimum_stock || 1);

        if (severityFilter === 'critical') {
          return product.quantity_in_stock <= alertSettings.criticalStockThreshold;
        } else if (severityFilter === 'low') {
          return product.quantity_in_stock <= alertSettings.lowStockThreshold &&
          product.quantity_in_stock > alertSettings.criticalStockThreshold;
        } else if (severityFilter === 'reorder') {
          return product.quantity_in_stock <= product.minimum_stock;
        } else if (severityFilter === 'overdue') {
          return product.overdue;
        }

        return product.quantity_in_stock <= alertSettings.lowStockThreshold ||
        product.quantity_in_stock <= product.minimum_stock ||
        product.overdue;
      });

      setLowStockProducts(alertProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch inventory data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
    toast({
      title: 'Data Refreshed',
      description: 'Inventory data has been updated'
    });
  };

  const sendLowStockAlert = async () => {
    if (lowStockProducts.length === 0) {
      toast({
        title: 'No Alerts to Send',
        description: 'All products are adequately stocked'
      });
      return;
    }

    try {
      const criticalItems = lowStockProducts.filter((p) => p.quantity_in_stock <= alertSettings.criticalStockThreshold);
      const lowItems = lowStockProducts.filter((p) =>
      p.quantity_in_stock <= alertSettings.lowStockThreshold &&
      p.quantity_in_stock > alertSettings.criticalStockThreshold
      );

      const emailContent = `
        <h2>🚨 Inventory Alert Report</h2>
        <p>The following products require immediate attention:</p>
        
        ${criticalItems.length > 0 ? `
        <h3 style="color: #dc2626;">⚠️ Critical Stock Levels (${criticalItems.length} items)</h3>
        <ul>
          ${criticalItems.map((item) => `
            <li><strong>${item.product_name}</strong> - Only ${item.quantity_in_stock} units remaining (Supplier: ${item.supplier})</li>
          `).join('')}
        </ul>
        ` : ''}
        
        ${lowItems.length > 0 ? `
        <h3 style="color: #ea580c;">📉 Low Stock Levels (${lowItems.length} items)</h3>
        <ul>
          ${lowItems.map((item) => `
            <li><strong>${item.product_name}</strong> - ${item.quantity_in_stock} units remaining (Min: ${item.minimum_stock})</li>
          `).join('')}
        </ul>
        ` : ''}
        
        <p><strong>Report generated:</strong> ${new Date().toLocaleString()}</p>
        <p>Please review and take appropriate action to restock these items.</p>
      `;

      const { error } = await window.ezsite.apis.sendEmail({
        from: 'support@ezsite.ai',
        to: ['manager@gasstation.com'], // Replace with actual manager email
        subject: `🚨 Inventory Alert: ${lowStockProducts.length} products need attention`,
        html: emailContent
      });

      if (error) throw error;

      toast({
        title: 'Alert Sent',
        description: `Email alert sent for ${lowStockProducts.length} products`
      });
    } catch (error) {
      console.error('Error sending alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to send email alert',
        variant: 'destructive'
      });
    }
  };

  const getStockSeverity = (product: Product) => {
    if (product.quantity_in_stock <= alertSettings.criticalStockThreshold) return 'critical';
    if (product.quantity_in_stock <= alertSettings.lowStockThreshold) return 'low';
    if (product.quantity_in_stock <= product.minimum_stock) return 'reorder';
    if (product.overdue) return 'overdue';
    return 'normal';
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Critical</Badge>;
      case 'low':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Low Stock</Badge>;
      case 'reorder':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Reorder</Badge>;
      case 'overdue':
        return <Badge variant="destructive" className="bg-purple-100 text-purple-800">Overdue</Badge>;
      default:
        return <Badge variant="default">Normal</Badge>;
    }
  };

  const calculateSummaryStats = () => {
    const critical = products.filter((p) => getStockSeverity(p) === 'critical').length;
    const low = products.filter((p) => getStockSeverity(p) === 'low').length;
    const reorder = products.filter((p) => getStockSeverity(p) === 'reorder').length;
    const overdue = products.filter((p) => getStockSeverity(p) === 'overdue').length;

    return { critical, low, reorder, overdue, total: products.length };
  };

  const stats = calculateSummaryStats();
  const totalPages = Math.ceil(totalRecords / pageSize);
  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Alerts</h1>
          <p className="text-muted-foreground">Monitor stock levels and manage inventory alerts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={sendLowStockAlert} disabled={lowStockProducts.length === 0}>
            <Mail className="h-4 w-4 mr-2" />
            Send Alert Email
          </Button>
          <Link to="/inventory/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-red-600">Critical Stock</p>
              <p className="text-2xl font-bold text-red-700">{stats.critical}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center p-4">
            <TrendingDown className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-orange-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-700">{stats.low}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center p-4">
            <Bell className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-yellow-600">Reorder Point</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.reorder}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="flex items-center p-4">
            <Package className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-purple-600">Overdue</p>
              <p className="text-2xl font-bold text-purple-700">{stats.overdue}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full" />

            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.filter(category => category && category.trim() !== '').map((category) =>
                <SelectItem key={category} value={category}>{category}</SelectItem>
                )}
              </SelectContent>
            </Select>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="critical">Critical Only</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="reorder">Reorder Point</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Status</CardTitle>
          <CardDescription>
            Showing {products.length} products ({lowStockProducts.length} need attention)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ?
          <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div> :

          <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                  const severity = getStockSeverity(product);
                  const stockPercentage = product.quantity_in_stock / product.minimum_stock * 100;

                  return (
                    <TableRow key={product.id} className={severity === 'critical' ? 'bg-red-50' : severity === 'low' ? 'bg-orange-50' : ''}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{product.product_name}</div>
                            <div className="text-sm text-muted-foreground">{product.department}</div>
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${severity === 'critical' ? 'text-red-600' : severity === 'low' ? 'text-orange-600' : ''}`}>
                              {product.quantity_in_stock}
                            </span>
                            {severity !== 'normal' &&
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                              className={`h-full ${severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'}`}
                              style={{ width: `${Math.min(stockPercentage, 100)}%` }} />

                              </div>
                          }
                          </div>
                        </TableCell>
                        <TableCell>{product.minimum_stock}</TableCell>
                        <TableCell>{getSeverityBadge(severity)}</TableCell>
                        <TableCell>{product.supplier}</TableCell>
                        <TableCell>
                          {new Date(product.last_updated_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link to={`/products/${product.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link to={`/products/${product.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>);

                })}
                </TableBody>
              </Table>
              
              {products.length === 0 &&
            <div className="text-center py-8 text-muted-foreground">
                  No products found matching your criteria.
                </div>
            }
            </div>
          }
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 &&
      <div className="flex justify-center gap-2">
          <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}>

            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}>

            Next
          </Button>
        </div>
      }
    </div>);

};

export default InventoryAlerts;