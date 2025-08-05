import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Package, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { productService, Product } from '@/services/productService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const SupabaseProductList: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useSupabaseAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);

      let result;
      if (userProfile?.station_id) {
        // If user has a specific station, load products for that station
        result = await productService.getByStation(userProfile.station_id);
      } else {
        // Otherwise load all products
        result = await productService.getAll();
      }

      if (result.error) {
        throw result.error;
      }

      setProducts(result.data || []);
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        product.product_name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.sku?.toLowerCase().includes(searchLower) ||
        product.barcode?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower));

    });

    setFilteredProducts(filtered);
  };

  const handleEdit = (productId: string) => {
    navigate(`/products/${productId}/edit`);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);

      const { error } = await productService.delete(productToDelete.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Product deleted successfully'
      });

      // Reload products
      await loadProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '-';
    return `$${price.toFixed(2)}`;
  };

  const getStockStatus = (product: Product) => {
    if (!product.stock_quantity || !product.min_stock_level) {
      return { variant: 'secondary', text: 'Unknown' };
    }

    if (product.stock_quantity <= 0) {
      return { variant: 'destructive', text: 'Out of Stock' };
    }

    if (product.stock_quantity <= product.min_stock_level) {
      return { variant: 'destructive', text: 'Low Stock' };
    }

    return { variant: 'default', text: 'In Stock' };
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading products...</p>
            </div>
          </CardContent>
        </Card>
      </div>);

  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-6 h-6" />
                <span>Products</span>
              </CardTitle>
              <CardDescription>
                Manage your product inventory with Supabase
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => navigate('/products/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10" />

            </div>
            {searchTerm &&
            <div className="ml-4">
                <Badge variant="secondary">
                  {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found
                </Badge>
              </div>
            }
          </div>

          {/* Products Table */}
          {filteredProducts.length === 0 ?
          <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? `No products found matching "${searchTerm}"` : 'No products found'}
              </p>
              <Button
              variant="outline"
              className="mt-4"
              onClick={() => searchTerm ? setSearchTerm('') : navigate('/products/new')}>

                {searchTerm ? 'Clear Search' : 'Add Your First Product'}
              </Button>
            </div> :

          <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);

                  return (
                    <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.product_name}</p>
                            {product.description &&
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                                {product.description}
                              </p>
                          }
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {product.sku || '-'}
                        </TableCell>
                        <TableCell>
                          {product.category ?
                        <Badge variant="outline">{product.category}</Badge> :

                        '-'
                        }
                        </TableCell>
                        <TableCell>{formatPrice(product.price)}</TableCell>
                        <TableCell>{formatPrice(product.cost)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{product.stock_quantity || 0}</div>
                            {product.min_stock_level &&
                          <div className="text-gray-500">
                                Min: {product.min_stock_level}
                              </div>
                          }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant as any}>
                            {stockStatus.text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product.id)}
                            title="Edit product">

                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(product)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete product">

                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>);

                })}
                </TableBody>
              </Table>
            </div>
          }

          {/* Results Summary */}
          {filteredProducts.length > 0 &&
          <div className="mt-4 text-sm text-gray-700 text-center">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          }
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Delete Product</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{productToDelete?.product_name}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}>

              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}>

              {deleting ?
              <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </> :

              'Delete Product'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);

};

export default SupabaseProductList;