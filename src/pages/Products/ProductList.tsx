import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Package, FileText, Loader2, X, Save, History, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ResponsiveTable, ResponsiveStack } from '@/components/ResponsiveWrapper';
import { useResponsiveLayout } from '@/hooks/use-mobile';

interface Product {
  id: string;
  product_name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category?: string;
  category_id?: string;
  price?: number;
  cost?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  unit_of_measure?: string;
  weight?: number;
  station_id?: string;
  supplier_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const responsive = useResponsiveLayout();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  const pageSize = 50;
  const [loadedProductsCount, setLoadedProductsCount] = useState(pageSize);

  // Check if user is admin
  const isAdmin = userProfile?.role === 'Administrator' || userProfile?.role === 'Admin';

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchProducts();
      } else {
        loadProducts();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(pageSize);

      if (error) throw error;

      setProducts(data || []);
      setTotalCount(count || 0);
      setHasMoreProducts((count || 0) > pageSize);
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async () => {
    if (!searchTerm.trim()) {
      loadProducts();
      return;
    }

    try {
      setLoading(true);

      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .or(`product_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .order('product_name', { ascending: true })
        .limit(pageSize);

      if (error) throw error;

      setProducts(data || []);
      setTotalCount(count || 0);
      setHasMoreProducts((count || 0) > pageSize);
    } catch (error: any) {
      console.error('Error searching products:', error);
      toast({
        title: "Error",
        description: "Failed to search products: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    if (isLoadingMore || !hasMoreProducts) return;

    try {
      setIsLoadingMore(true);

      const query = searchTerm 
        ? supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .or(`product_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
            .order('product_name', { ascending: true })
        : supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

      const { data, error } = await query
        .range(products.length, products.length + pageSize - 1);

      if (error) throw error;

      if (data && data.length > 0) {
        setProducts(prev => [...prev, ...data]);
        setHasMoreProducts(data.length === pageSize);
      } else {
        setHasMoreProducts(false);
      }
    } catch (error: any) {
      console.error('Error loading more products:', error);
      toast({
        title: "Error",
        description: "Failed to load more products: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete products.",
        variant: "destructive"
      });
      return;
    }

    const confirmed = confirm('Are you sure you want to delete this product? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully."
      });

      // Reload products
      loadProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (productId: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can edit products.",
        variant: "destructive"
      });
      return;
    }

    navigate(`/products/${productId}/edit`);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '-';
    }
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <ResponsiveStack spacing="lg">
      <Card>
        <CardHeader>
          <div className={`flex items-center ${
            responsive.isMobile ? 'flex-col space-y-4' : 'justify-between'
          }`}>
            <div className={responsive.isMobile ? 'text-center' : ''}>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-6 h-6" />
                <span>Products</span>
              </CardTitle>
              <CardDescription className={responsive.isMobile ? 'text-center mt-2' : ''}>
                Manage your product inventory
              </CardDescription>
            </div>
            
            <div className={`flex items-center space-x-2 ${responsive.isMobile ? 'flex-col space-y-2 space-x-0 w-full' : ''}`}>
              {isAdmin && (
                <Button
                  onClick={() => navigate('/products/new')}
                  className={`bg-brand-600 hover:bg-brand-700 text-white ${
                    responsive.isMobile ? 'w-full' : ''
                  }`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              )}
              
              {!isAdmin && (
                <Badge variant="secondary" className="text-xs">
                  View-only access
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className={`flex items-center mb-6 ${
            responsive.isMobile ? 'flex-col space-y-3' : 'space-x-2'
          }`}>
            <div className={`relative ${
              responsive.isMobile ? 'w-full' : 'flex-1 max-w-sm'
            }`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-4 h-4 flex items-center justify-center"
                  title="Clear search">
                  <X className="w-4 h-4" />
                </button>
              )}
              <Input
                placeholder={responsive.isMobile ? 
                  "Search products..." : 
                  "Search products by name, description, SKU, barcode..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${searchTerm ? 'pr-10' : 'pr-3'}`}
              />
            </div>
            {searchTerm && (
              <div className={`flex items-center space-x-2 ${
                responsive.isMobile ? 'w-full justify-center' : ''
              }`}>
                <Badge variant="secondary">
                  {totalCount} result{totalCount !== 1 ? 's' : ''} found
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm('')}>
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Products Display */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`bg-gray-100 rounded animate-pulse ${
                  responsive.isMobile ? 'h-32' : 'h-16'
                }`}></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? `No products found matching "${searchTerm}"` : 'No products found'}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => searchTerm ? setSearchTerm('') : isAdmin ? navigate('/products/new') : null}
                disabled={!searchTerm && !isAdmin}>
                {searchTerm ? 'Clear Search' : isAdmin ? 'Add Your First Product' : 'No Access'}
              </Button>
            </div>
          ) : responsive.isMobile ? (
            // Mobile Card View
            <div className="space-y-4">
              {products.map((product) => (
                <Card key={product.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">
                          {searchTerm ? highlightText(product.product_name, searchTerm) : product.product_name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {searchTerm ? highlightText(product.description, searchTerm) : product.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {product.category || 'General'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">SKU:</span>
                        <p className="font-medium">{product.sku || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Stock:</span>
                        <p className="font-medium">{product.stock_quantity || 0}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <p className="font-medium">{formatCurrency(product.price)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Cost:</span>
                        <p className="font-medium">{formatCurrency(product.cost)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-gray-500">
                        Updated: {formatDate(product.updated_at)}
                      </span>
                      <div className="flex space-x-2">
                        {isAdmin && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product.id)}
                              className="text-blue-600 hover:text-blue-700">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            // Desktop Table View
            <ResponsiveTable className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {searchTerm ? highlightText(product.product_name, searchTerm) : product.product_name}
                          </p>
                          {product.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {searchTerm ? highlightText(product.description, searchTerm) : product.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {searchTerm && product.sku ? highlightText(product.sku, searchTerm) : product.sku || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {searchTerm && product.category ? highlightText(product.category, searchTerm) : product.category || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          (product.stock_quantity || 0) <= (product.min_stock_level || 0) ? 'destructive' : 'default'
                        }>
                          {product.stock_quantity || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{formatCurrency(product.cost)}</TableCell>
                      <TableCell>{formatDate(product.updated_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(product.id)}
                                title="Edit product"
                                className="text-blue-600 hover:text-blue-700">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Delete product">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ResponsiveTable>
          )}

          {/* Load More / Pagination */}
          {products.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-gray-700 text-center mb-4">
                Showing {products.length} of {totalCount} products
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
              
              {hasMoreProducts && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={loadMoreProducts}
                    disabled={isLoadingMore}>
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
              
              {!hasMoreProducts && totalCount > pageSize && (
                <div className="text-center py-4 text-sm text-gray-500">
                  You've reached the end - all {totalCount} products loaded
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </ResponsiveStack>
  );
};

export default ProductList;