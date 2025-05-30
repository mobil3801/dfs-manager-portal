import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
  ID: number;
  product_name: string;
  category: string;
  quantity_in_stock: number;
  minimum_stock: number;
  supplier: string;
  description: string;
  created_by: number;
  serial_number: number;
  weight: number;
  weight_unit: string;
  department: string;
  merchant_id: number;
  bar_code_case: string;
  bar_code_unit: string;
  last_updated_date: string;
  last_shopping_date: string;
  case_price: number;
  unit_per_case: number;
  unit_price: number;
  retail_price: number;
  overdue: boolean;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const pageSize = 10;

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const filters = [];

      if (searchTerm) {
        filters.push({ name: 'product_name', op: 'StringContains', value: searchTerm });
      }

      const { data, error } = await window.ezsite.apis.tablePage('11726', {
        PageNo: currentPage,
        PageSize: pageSize,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw error;

      setProducts(data?.List || []);
      setTotalCount(data?.VirtualCount || 0);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const { error } = await window.ezsite.apis.tableDelete('11726', { ID: productId });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };



  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-6 h-6" />
                <span>Products</span>
              </CardTitle>
              <CardDescription>
                Manage your product inventory
              </CardDescription>
            </div>
            <Button onClick={() => navigate('/products/new')} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10" />

            </div>
          </div>

          {/* Products Table */}
          {loading ?
          <div className="space-y-4">
              {[...Array(5)].map((_, i) =>
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            )}
            </div> :
          products.length === 0 ?
          <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No products found</p>
              <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/products/new')}>

                Add Your First Product
              </Button>
            </div> :

          <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Last Updated Date</TableHead>
                    <TableHead>Last Shopping Date</TableHead>
                    <TableHead>Case Price</TableHead>
                    <TableHead>Unit Per Case</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                  const formatDate = (dateString: string) => {
                    if (!dateString) return '-';
                    try {
                      return new Date(dateString).toLocaleDateString();
                    } catch {
                      return '-';
                    }
                  };
                  
                  return (
                    <TableRow key={product.ID}>
                        <TableCell className="font-medium">{product.serial_number || '-'}</TableCell>
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
                        <TableCell>
                          {product.weight && product.weight > 0 ? 
                            `${product.weight} ${product.weight_unit || 'lb'}` : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.department || 'Convenience Store'}</Badge>
                        </TableCell>
                        <TableCell>{product.supplier || '-'}</TableCell>
                        <TableCell>{formatDate(product.last_updated_date)}</TableCell>
                        <TableCell>{formatDate(product.last_shopping_date)}</TableCell>
                        <TableCell>
                          {product.case_price ? `$${product.case_price.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>{product.unit_per_case || '-'}</TableCell>
                        <TableCell>
                          {product.unit_price ? `$${product.unit_price.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/products/edit/${product.ID}`)}>

                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.ID)}
                            className="text-red-600 hover:text-red-700">

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

          {/* Pagination */}
          {totalPages > 1 &&
          <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} products
              </p>
              <div className="flex items-center space-x-2">
                <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}>

                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}>

                  Next
                </Button>
              </div>
            </div>
          }
        </CardContent>
      </Card>
    </div>);

};

export default ProductList;