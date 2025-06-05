import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeData } from '@/hooks/use-supabase-realtime';
import { supabaseService } from '@/services/supabaseService';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { ResponsiveWrapper } from '@/components/ResponsiveWrapper';
import { ProductCards } from '@/components/ProductCards';
import { useIsMobile } from '@/hooks/use-mobile';
import { HighlightText } from '@/components/HighlightText';
import { ProductLogs } from '@/components/ProductLogs';
import { Search, Plus, Edit, Trash2, Package, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: number;
  product_name: string;
  product_code: string;
  category: string;
  price: number;
  quantity_in_stock: number;
  minimum_stock: number;
  supplier: string;
  description: string;
  department: string;
  weight: number;
  weight_unit: string;
  case_price: number;
  unit_per_case: number;
  unit_price: number;
  retail_price: number;
  overdue: boolean;
  last_shopping_date: string;
  updated_at: string;
}

export default function ProductListUpdated() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const { toast } = useToast();
  const { profile, hasPermission } = useSupabaseAuth();
  const isMobile = useIsMobile();

  // Real-time data fetching with filters
  const filters = searchTerm ? [
    { column: 'product_name', operator: 'StringContains' as const, value: searchTerm }
  ] : undefined;

  const { data: products, loading, error, refetch } = useRealtimeData(
    'products',
    filters,
    'product_name',
    true
  );

  const handleDeleteProduct = async (id: number) => {
    if (!hasPermission('products', 'delete')) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to delete products.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await supabaseService.tableDelete('products', { id });
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Success',
        description: 'Product deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete product.',
        variant: 'destructive'
      });
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.quantity_in_stock <= 0) {
      return { status: 'Out of Stock', color: 'destructive', icon: AlertTriangle };
    } else if (product.quantity_in_stock <= product.minimum_stock) {
      return { status: 'Low Stock', color: 'warning', icon: AlertTriangle };
    } else {
      return { status: 'In Stock', color: 'success', icon: CheckCircle };
    }
  };

  const getProfitMargin = (product: Product) => {
    if (product.unit_price > 0) {
      const margin = ((product.retail_price - product.unit_price) / product.unit_price) * 100;
      return margin.toFixed(1);
    }
    return '0.0';
  };

  const canEdit = hasPermission('products', 'edit');
  const canDelete = hasPermission('products', 'delete');
  const canCreate = hasPermission('products', 'create');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
            <p>Error loading products: {error}</p>
            <Button onClick={refetch} className="mt-2">Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ResponsiveWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your product inventory</p>
          </div>
          {canCreate && (
            <Link to="/products/form">
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {products.length} product{products.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Display */}
        {isMobile ? (
          <ProductCards 
            products={products} 
            onEdit={canEdit ? (id) => window.location.href = `/products/form?id=${id}` : undefined}
            onDelete={canDelete ? handleDeleteProduct : undefined}
            onViewLogs={(product) => {
              setSelectedProduct(product);
              setShowLogs(true);
            }}
            searchTerm={searchTerm}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Profit Margin</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const stockStatus = getStockStatus(product);
                      const StatusIcon = stockStatus.icon;
                      
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">
                                <HighlightText text={product.product_name} highlight={searchTerm} />
                              </div>
                              <div className="text-sm text-gray-500">
                                Code: {product.product_code}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`h-4 w-4 ${
                                stockStatus.color === 'destructive' ? 'text-red-500' :
                                stockStatus.color === 'warning' ? 'text-yellow-500' :
                                'text-green-500'
                              }`} />
                              <span className="text-sm">{stockStatus.status}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {product.quantity_in_stock} / {product.minimum_stock} min
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">${product.retail_price.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">
                                Cost: ${product.unit_price.toFixed(2)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              parseFloat(getProfitMargin(product)) > 50 ? 'default' :
                              parseFloat(getProfitMargin(product)) > 20 ? 'secondary' :
                              'outline'
                            }>
                              {getProfitMargin(product)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{product.supplier}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              {new Date(product.updated_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowLogs(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canEdit && (
                                <Link to={`/products/form?id=${product.id}`}>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {products.length === 0 && (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new product.'}
                  </p>
                  {canCreate && !searchTerm && (
                    <div className="mt-6">
                      <Link to="/products/form">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Product Logs Modal */}
        {showLogs && selectedProduct && (
          <ProductLogs
            productId={selectedProduct.id}
            productName={selectedProduct.product_name}
            onClose={() => {
              setShowLogs(false);
              setSelectedProduct(null);
            }}
          />
        )}
      </div>
    </ResponsiveWrapper>
  );
}