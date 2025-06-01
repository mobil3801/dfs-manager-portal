import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Package, FileText, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ProductLogs from '@/components/ProductLogs';
import HighlightText from '@/components/HighlightText';
import VisualEditToolbar from '@/components/VisualEditToolbar';

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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{id: number;name: string;} | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const pageSize = 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load all products initially
  useEffect(() => {
    loadAllProducts();
  }, []);

  // Filter and paginate when search term or page changes
  useEffect(() => {
    filterAndPaginateProducts();
  }, [debouncedSearchTerm, currentPage, allProducts]);

  const loadAllProducts = async () => {
    try {
      setLoading(true);

      const { data, error } = await window.ezsite.apis.tablePage('11726', {
        PageNo: 1,
        PageSize: 1000, // Load a large number to get all products
        OrderByField: 'ID',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;

      setAllProducts(data?.List || []);
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

  const filterAndPaginateProducts = () => {
    setIsSearching(!!debouncedSearchTerm);

    let filteredProducts = allProducts;

    // Client-side filtering for keyword matching
    if (debouncedSearchTerm) {
      const searchKeywords = debouncedSearchTerm.toLowerCase().trim().split(/\s+/).filter((keyword) => keyword.length > 0);

      filteredProducts = allProducts.filter((product) => {
        const searchableText = [
        product.product_name,
        product.description,
        product.category,
        product.supplier,
        product.department,
        product.bar_code_case,
        product.bar_code_unit,
        product.serial_number?.toString()].
        join(' ').toLowerCase();

        // Check if all keywords are present in the searchable text
        return searchKeywords.every((keyword) => searchableText.includes(keyword));
      });
    }

    // Sort by serial number when not searching (show from serial 01)
    if (!debouncedSearchTerm) {
      filteredProducts = filteredProducts.sort((a, b) => {
        const serialA = a.serial_number || 0;
        const serialB = b.serial_number || 0;
        return serialA - serialB;
      });
    }

    // Apply pagination to filtered results
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    setProducts(paginatedProducts);
    setTotalCount(filteredProducts.length);
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
      loadAllProducts(); // Reload all products
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const handleViewLogs = (productId: number, productName: string) => {
    setSelectedProduct({ id: productId, name: productName });
    setLogsModalOpen(true);
  };

  // Visual editing enabled for all users
  const hasEditPermission = true;

  const totalPages = Math.ceil(totalCount / pageSize);

  // Get search keywords and check if all match
  const getSearchData = (text: string) => {
    if (!debouncedSearchTerm || !text) {
      return {
        keywords: [],
        allMatch: false,
        highlightComponent: text
      };
    }

    const searchKeywords = debouncedSearchTerm.toLowerCase().trim().split(/\s+/).filter((keyword) => keyword.length > 0);
    const textLower = text.toLowerCase();

    // Check if all keywords are present in this specific text
    const allMatch = searchKeywords.every((keyword) => textLower.includes(keyword));

    return {
      keywords: searchKeywords,
      allMatch,
      highlightComponent:
      <HighlightText
        text={text}
        searchTerms={searchKeywords}
        allMatch={allMatch} />


    };
  };

  // Clear search and reset to show all products from serial 01
  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <VisualEditToolbar className="mb-4" />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-6 h-6" />
                <span>Products</span>
              </CardTitle>
              <CardDescription>
                Manage your product inventory - Search across all product fields for similar items
              </CardDescription>
            </div>
            <Button
              onClick={() => navigate('/app/products/new')}
              className="bg-brand-600 hover:bg-brand-700 text-white">

              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              {searchTerm &&
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-4 h-4 flex items-center justify-center"
                title="Clear search">

                  <X className="w-4 h-4" />
                </button>
              }
              <Input
                placeholder="Search products by name, description, category, supplier, barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${searchTerm ? 'pr-10' : 'pr-3'}`} />
            </div>
            {debouncedSearchTerm &&
            <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {totalCount} result{totalCount !== 1 ? 's' : ''} found
                </Badge>
                <Button
                variant="outline"
                size="sm"
                onClick={handleClearSearch}>
                  Clear
                </Button>
              </div>
            }
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
              <p className="text-gray-500">
                {debouncedSearchTerm ? `No products found matching "${debouncedSearchTerm}"` : 'No products found'}
              </p>
              <Button
              variant="outline"
              className="mt-4"
              onClick={() => debouncedSearchTerm ? handleClearSearch() : navigate('/app/products/new')}>
                {debouncedSearchTerm ? 'Clear Search' : 'Add Your First Product'}
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
                    <TableHead>Retail Price</TableHead>
                    <TableHead>Profit Margin</TableHead>
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
                            <p className="font-medium">
                              {debouncedSearchTerm ?
                            getSearchData(product.product_name).highlightComponent :
                            product.product_name
                            }
                            </p>
                            {product.description &&
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                                {debouncedSearchTerm ?
                            getSearchData(product.description).highlightComponent :
                            product.description
                            }
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
                          <Badge variant="outline">
                            {debouncedSearchTerm ?
                          getSearchData(product.department || 'Convenience Store').highlightComponent :
                          product.department || 'Convenience Store'
                          }
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {debouncedSearchTerm ?
                        getSearchData(product.supplier || '-').highlightComponent :
                        product.supplier || '-'
                        }
                        </TableCell>
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
                          {product.retail_price ? `$${product.retail_price.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          {(() => {
                          if (product.unit_price && product.retail_price && product.retail_price > 0) {
                            const margin = (product.retail_price - product.unit_price) / product.retail_price * 100;
                            return (
                              <Badge
                                variant={margin > 20 ? 'default' : margin > 10 ? 'secondary' : 'destructive'}
                                className="text-xs">
                                  {margin.toFixed(1)}%
                                </Badge>);
                          }
                          return '-';
                        })()} 
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewLogs(product.ID, product.product_name)}
                            title="View change logs">
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/app/products/edit/${product.ID}`)}
                            title="Edit product">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.ID)}
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

          {/* Pagination */}
          {totalPages > 1 &&
          <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} products
                {debouncedSearchTerm && ` matching "${debouncedSearchTerm}"`}
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

      {/* Product Logs Modal */}
      {selectedProduct &&
      <ProductLogs
        isOpen={logsModalOpen}
        onClose={() => {
          setLogsModalOpen(false);
          setSelectedProduct(null);
        }}
        productId={selectedProduct.id}
        productName={selectedProduct.name} />
      }
    </div>);
};

export default ProductList;