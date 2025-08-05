import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Package, TrendingUp, AlertTriangle, ShoppingCart, DollarSign, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productService, Product } from '@/services/productService';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface ProductStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoryCounts: Record<string, number>;
  recentlyAdded: Product[];
  lowStockProducts: Product[];
}

const ProductDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useSupabaseAuth();
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    categoryCounts: {},
    recentlyAdded: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductStats();
  }, [userProfile]);

  const loadProductStats = async () => {
    try {
      setLoading(true);

      let result;
      if (userProfile?.station_id) {
        result = await productService.getByStation(userProfile.station_id);
      } else {
        result = await productService.getAll();
      }

      if (result.error) {
        throw result.error;
      }

      const products = result.data || [];

      // Calculate stats
      const totalProducts = products.length;
      const totalValue = products.reduce((sum, product) => {
        return sum + (product.stock_quantity || 0) * (product.cost || 0);
      }, 0);

      const lowStockProducts = products.filter((product) =>
      product.stock_quantity !== undefined &&
      product.min_stock_level !== undefined &&
      product.stock_quantity <= product.min_stock_level &&
      product.stock_quantity > 0
      );

      const outOfStockProducts = products.filter((product) =>
      (product.stock_quantity || 0) <= 0
      );

      // Category counts
      const categoryCounts: Record<string, number> = {};
      products.forEach((product) => {
        if (product.category) {
          categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
        }
      });

      // Recently added (last 5 products by created_at)
      const recentlyAdded = products.
      sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()).
      slice(0, 5);

      setStats({
        totalProducts,
        totalValue,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        categoryCounts,
        recentlyAdded,
        lowStockProducts: lowStockProducts.slice(0, 5) // Top 5 low stock items
      });

    } catch (error: any) {
      console.error('Error loading product stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product statistics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getStockStatusColor = (product: Product) => {
    if ((product.stock_quantity || 0) <= 0) return 'text-red-600';
    if (product.stock_quantity !== undefined &&
    product.min_stock_level !== undefined &&
    product.stock_quantity <= product.min_stock_level) {
      return 'text-orange-600';
    }
    return 'text-green-600';
  };

  const getStockPercentage = (product: Product) => {
    if (!product.max_stock_level || product.max_stock_level === 0) return 0;
    return Math.min((product.stock_quantity || 0) / product.max_stock_level * 100, 100);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) =>
        <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active products in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Products below minimum level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <ShoppingCart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Products with zero stock
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Category Distribution</span>
            </CardTitle>
            <CardDescription>Products by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.categoryCounts).
              sort(([, a], [, b]) => b - a).
              slice(0, 6).
              map(([category, count]) =>
              <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{category}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium">{count}</div>
                      <Progress
                    value={count / stats.totalProducts * 100}
                    className="w-16" />

                    </div>
                  </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>Low Stock Alert</span>
            </CardTitle>
            <CardDescription>Products that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.lowStockProducts.length === 0 ?
              <p className="text-sm text-muted-foreground text-center py-4">
                  No low stock items found
                </p> :

              stats.lowStockProducts.map((product) =>
              <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.product_name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getStockStatusColor(product)}`}>
                        {product.stock_quantity}/{product.min_stock_level}
                      </p>
                      {product.max_stock_level && product.max_stock_level > 0 &&
                  <Progress
                    value={getStockPercentage(product)}
                    className="w-16 h-2 mt-1" />

                  }
                    </div>
                  </div>
              )
              }
            </div>
            {stats.lowStockProducts.length > 0 &&
            <div className="pt-4 border-t">
                <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/products?filter=low-stock')}
                className="w-full">

                  View All Low Stock Items
                </Button>
              </div>
            }
          </CardContent>
        </Card>
      </div>

      {/* Recently Added Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Recently Added Products</span>
          </CardTitle>
          <CardDescription>Latest additions to inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentlyAdded.length === 0 ?
            <p className="text-sm text-muted-foreground text-center py-4">
                No products found
              </p> :

            stats.recentlyAdded.map((product) =>
            <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.product_name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {product.category &&
                  <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                  }
                      <span className="text-xs text-muted-foreground">
                        Added {formatDate(product.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {product.price &&
                <p className="text-sm font-medium">{formatCurrency(product.price)}</p>
                }
                    <p className={`text-xs ${getStockStatusColor(product)}`}>
                      Stock: {product.stock_quantity || 0}
                    </p>
                  </div>
                </div>
            )
            }
          </div>
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/products')}
              className="w-full">

              View All Products
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/products/new')}
              className="flex items-center space-x-2">

              <Package className="w-4 h-4" />
              <span>Add New Product</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/products?filter=low-stock')}
              className="flex items-center space-x-2">

              <AlertTriangle className="w-4 h-4" />
              <span>Review Low Stock</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => loadProductStats()}
              className="flex items-center space-x-2">

              <TrendingUp className="w-4 h-4" />
              <span>Refresh Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default ProductDashboard;