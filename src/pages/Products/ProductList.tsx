import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Package, FileText, Loader2, X, Save, History, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { productService, Product } from '@/services/productService';
import ProductLogs from '@/components/ProductLogs';
import ProductChangelogDialog from '@/components/ProductChangelogDialog';
import HighlightText from '@/components/HighlightText';
import { ResponsiveTable, ResponsiveStack } from '@/components/ResponsiveWrapper';
import { useResponsiveLayout } from '@/hooks/use-mobile';
import ProductCards from '@/components/ProductCards';
import { generateSafeKey, safeMap } from '@/utils/invariantSafeHelper';

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useSupabaseAuth();
  const responsive = useResponsiveLayout();

  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [changelogModalOpen, setChangelogModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{id: string; name: string;} | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);

  const pageSize = 50; // Load more products per batch
  const [loadedProductsCount, setLoadedProductsCount] = useState(pageSize);

  // Ref for the loading trigger element
  const loadingTriggerRef = useRef<HTMLDivElement>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setLoadedProductsCount(pageSize); // Reset loaded count when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, pageSize]);

  // Load all products initially
  useEffect(() => {
    loadAllProducts();
  }, []);

  // Filter and slice products when search term or loaded count changes
  useEffect(() => {
    filterAndSliceProducts();
  }, [debouncedSearchTerm, loadedProductsCount, allProducts]);

  const loadAllProducts = async () => {
    try {
      setLoading(true);

      const { data, error } = await productService.getAll();

      if (error) {
        throw error;
      }

      setAllProducts(data || []);
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

  const filterAndSliceProducts = () => {
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
          product.sku,
          product.barcode
        ].join(' ').toLowerCase();

        // Check if all keywords are present in the searchable text
        return searchKeywords.every((keyword) => searchableText.includes(keyword));
      });
    }

    // Sort by product name when not searching
    if (!debouncedSearchTerm) {
      filteredProducts = filteredProducts.sort((a, b) => {
        const nameA = a.product_name || '';
        const nameB = b.product_name || '';
        return nameA.localeCompare(nameB);
      });
    }

    // Slice products based on loaded count for infinite scroll
    const slicedProducts = filteredProducts.slice(0, loadedProductsCount);

    setProducts(slicedProducts);
    setTotalCount(filteredProducts.length);
    setHasMoreProducts(loadedProductsCount < filteredProducts.length);
  };

  const handleDelete = async (productId: string) => {
    console.log('handleDelete called for product ID:', productId);

    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to delete this product? This action cannot be undone.');
    console.log('User confirmed deletion:', confirmed);

    if (!confirmed) {
      console.log('Deletion cancelled by user');
      return;
    }

    try {
      console.log('Attempting to delete product with ID:', productId);
      const { error } = await productService.delete(productId);

      if (error) {
        console.error('API returned error:', error);
        throw error;
      }

      console.log('Product deleted successfully');
      toast({
        title: "Success",
        description: "Product deleted successfully.",
        duration: 2000
      });

      // Reload all products
      loadAllProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: `Failed to delete product: ${error}`,
        variant: "destructive"
      });
    }
  };

  // Load more products function
  const loadMoreProducts = useCallback(() => {
    if (isLoadingMore || !hasMoreProducts) return;

    setIsLoadingMore(true);

    // Simulate loading delay for smooth UX
    setTimeout(() => {
      setLoadedProductsCount((prev) => prev + pageSize);
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, hasMoreProducts, pageSize]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMoreProducts && !isLoadingMore) {
          loadMoreProducts();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    const currentTrigger = loadingTriggerRef.current;
    if (currentTrigger) {
      observer.observe(currentTrigger);
    }

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }
    };
  }, [loadMoreProducts, hasMoreProducts, isLoadingMore]);

  const handleViewLogs = (productId: string, productName: string) => {
    console.log('handleViewLogs called for:', { productId, productName });
    setSelectedProduct({ id: productId, name: productName });
    setLogsModalOpen(true);
    console.log('Logs modal should now be open');
  };

  const handleEdit = (productId: string) => {
    console.log('handleEdit called for product ID:', productId);
    navigate(`/products/${productId}/edit`);
  };

  const handleViewChangelog = (productId: string, productName: string) => {
    console.log('handleViewChangelog called for:', { productId, productName });
    setSelectedProduct({ id: productId, name: productName });
    setChangelogModalOpen(true);
    console.log('Changelog modal should now be open');
  };

  // Calculate display text for showing results
  const getDisplayText = () => {
    if (totalCount === 0) return '';

    const currentlyShowing = Math.min(products.length, totalCount);

    if (debouncedSearchTerm) {
      return `Showing ${currentlyShowing} of ${totalCount} products matching "${debouncedSearchTerm}"`;
    }

    if (hasMoreProducts) {
      return `Showing ${currentlyShowing} of ${totalCount} products - Scroll down to load more`;
    }

    return `Showing all ${totalCount} products`;
  };

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
      highlightComponent: (
        <HighlightText
          text={text}
          searchTerms={searchKeywords}
          allMatch={allMatch}
        />
      )
    };
  };

  // Clear search and reset to show all products
  const handleClearSearch = () => {
    setSearchTerm('');
    setLoadedProductsCount(pageSize);
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
                Manage your product inventory with Supabase - Search across all product fields
              </CardDescription>
            </div>
            
            <div className={`flex items-center space-x-2 ${responsive.isMobile ? 'flex-col space-y-2 space-x-0 w-full' : ''}`}>
              <Button
                onClick={() => navigate('/products/new')}
                className={`bg-brand-600 hover:bg-brand-700 text-white ${
                  responsive.isMobile ? 'w-full' : ''
                }`}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
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
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-4 h-4 flex items-center justify-center"
                  title="Clear search">
                  <X className="w-4 h-4" />
                </button>
              )}
              <Input
                placeholder={responsive.isMobile ? 
                  "Search products..." : 
                  "Search products by name, description, category, SKU, barcode..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${searchTerm ? 'pr-10' : 'pr-3'}`}
              />
            </div>
            {debouncedSearchTerm && (
              <div className={`flex items-center space-x-2 ${
                responsive.isMobile ? 'w-full justify-center' : ''
              }`}>
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
                {debouncedSearchTerm ? `No products found matching "${debouncedSearchTerm}"` : 'No products found'}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => debouncedSearchTerm ? handleClearSearch() : navigate('/products/new')}>
                {debouncedSearchTerm ? 'Clear Search' : 'Add Your First Product'}
              </Button>
            </div>
          ) : responsive.isMobile ? (
            <div className="space-y-4">
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <Card key={product.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">
                            {debouncedSearchTerm ? 
                              getSearchData(product.product_name).highlightComponent : 
                              product.product_name
                            }
                          </h3>
                          {product.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {debouncedSearchTerm ? 
                                getSearchData(product.description).highlightComponent : 
                                product.description
                              }
                            </p>
                          )}
                        </div>
                        <Badge variant={stockStatus.variant as any}>
                          {stockStatus.text}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">SKU:</span>
                          <span className="ml-1 font-mono">{product.sku || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <span className="ml-1">{formatPrice(product.price)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Stock:</span>
                          <span className="ml-1">{product.stock_quantity || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <span className="ml-1">{product.category || '-'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-2">
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
                          onClick={() => handleViewChangelog(product.id, product.product_name)}
                          title="View changelog"
                          className="text-green-600 hover:text-green-700">
                          <History className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewLogs(product.id, product.product_name)}
                          title="View change logs">
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete product">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <ResponsiveTable className="border rounded-lg overflow-hidden">
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
                  {safeMap(products, (product, index) => {
                    const stockStatus = getStockStatus(product);

                    return (
                      <TableRow key={generateSafeKey(product, index, 'product')}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {debouncedSearchTerm ? 
                                getSearchData(product.product_name).highlightComponent : 
                                product.product_name
                              }
                            </p>
                            {product.description && (
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {debouncedSearchTerm ? 
                                  getSearchData(product.description).highlightComponent : 
                                  product.description
                                }
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {product.sku || '-'}
                        </TableCell>
                        <TableCell>
                          {product.category ? (
                            <Badge variant="outline">{product.category}</Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{formatPrice(product.price)}</TableCell>
                        <TableCell>{formatPrice(product.cost)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{product.stock_quantity || 0}</div>
                            {product.min_stock_level && (
                              <div className="text-gray-500">
                                Min: {product.min_stock_level}
                              </div>
                            )}
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
                              onClick={() => {
                                console.log('Editing product:', product.id);
                                handleEdit(product.id);
                              }}
                              title="Edit product"
                              className="text-blue-600 hover:text-blue-700">
                              <Edit className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('Viewing changelog for product:', product.id, product.product_name);
                                handleViewChangelog(product.id, product.product_name);
                              }}
                              title="View changelog"
                              className="text-green-600 hover:text-green-700">
                              <History className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('Viewing logs for product:', product.id, product.product_name);
                                handleViewLogs(product.id, product.product_name);
                              }}
                              title="View change logs">
                              <FileText className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('Deleting product:', product.id);
                                handleDelete(product.id);
                              }}
                              className="text-red-600 hover:text-red-700"
                              title="Delete product">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ResponsiveTable>
          )}

          {/* Loading Status and Infinite Scroll */}
          {products.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-gray-700 text-center mb-4">
                {getDisplayText()}
              </p>
              
              {/* Loading trigger for infinite scroll */}
              {hasMoreProducts && (
                <div
                  ref={loadingTriggerRef}
                  className="flex items-center justify-center py-8">
                  {isLoadingMore ? (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading more products...</span>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      Scroll down to load more products
                    </div>
                  )}
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

      {/* Product Logs Modal */}
      {selectedProduct && (
        <ProductLogs
          isOpen={logsModalOpen}
          onClose={() => {
            setLogsModalOpen(false);
            setSelectedProduct(null);
          }}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
        />
      )}

      {/* Product Changelog Modal */}
      {selectedProduct && (
        <ProductChangelogDialog
          isOpen={changelogModalOpen}
          onClose={() => {
            setChangelogModalOpen(false);
            setSelectedProduct(null);
          }}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
        />
      )}
    </ResponsiveStack>
  );
};

export default ProductList;