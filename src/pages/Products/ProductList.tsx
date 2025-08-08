import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Package, FileText, Loader2, X, Filter, SortAsc, SortDesc, Image, DollarSign, Tag, Barcode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { ResponsiveTable, ResponsiveStack } from '@/components/ResponsiveWrapper';
import { useResponsiveLayout } from '@/hooks/use-mobile';

// SEO Meta Tags
const ProductListSEO = () =>
<>
    <title>Products - DFS Manager Portal</title>
    <meta name="description" content="Manage your product inventory with advanced search, filters, and pagination. View published products with images, prices, and detailed information." />
    <meta name="keywords" content="products, inventory, gas station, fuel, catalog, management" />
    <link rel="canonical" href={`${window.location.origin}/products`} />
  </>;


interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  cost?: number;
  image_url?: string;
  slug?: string;
  category?: string;
  sku?: string;
  barcode?: string;
  stock_quantity?: number;
  min_stock_level?: number;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
}

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useSupabaseAuth();
  const responsive = useResponsiveLayout();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);

  const pageSize = 12; // Products per page
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Ref for the loading trigger element
  const loadingTriggerRef = useRef<HTMLDivElement>(null);

  // Load products with filters and pagination
  const loadProducts = useCallback(async (page = 1, resetList = false) => {
    try {
      if (resetList) {
        setLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      // Start building the query
      let query = supabase.
      from('products').
      select('*', { count: 'exact' }).
      eq('is_published', true); // Only published products

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%`);
      }

      // Apply category filter
      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: queryError, count } = await query;

      if (queryError) {
        throw queryError;
      }

      if (resetList || page === 1) {
        setProducts(data || []);
      } else {
        setProducts((prev) => [...prev, ...(data || [])]);
      }

      setTotalCount(count || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading products:', error);
      setError(error instanceof Error ? error.message : 'Failed to load products');
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchTerm, categoryFilter, sortBy, sortOrder, pageSize]);

  // Load categories for filter dropdown
  const loadCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase.
      from('products').
      select('category').
      eq('is_published', true).
      not('category', 'is', null);

      if (error) throw error;

      const uniqueCategories = [...new Set(data?.map((item) => item.category).filter(Boolean))] as string[];
      setCategories(uniqueCategories.sort());
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadProducts(1, true);
    loadCategories();
  }, [loadProducts, loadCategories]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      loadProducts(1, true);
    }
  }, [searchTerm, categoryFilter, sortBy, sortOrder]);

  // Load more products function
  const loadMoreProducts = useCallback(() => {
    if (isLoadingMore || products.length >= totalCount) return;
    loadProducts(currentPage + 1, false);
  }, [isLoadingMore, products.length, totalCount, currentPage, loadProducts]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && products.length < totalCount && !isLoadingMore) {
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
  }, [loadMoreProducts, products.length, totalCount, isLoadingMore]);

  const handleDelete = async (productId: string) => {
    const confirmed = confirm('Are you sure you want to delete this product? This action cannot be undone.');

    if (!confirmed) return;

    try {
      const { error } = await supabase.
      from('products').
      delete().
      eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully.",
        duration: 2000
      });

      // Reload products
      loadProducts(1, true);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: `Failed to delete product: ${error}`,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (productId: string) => {
    navigate(`/products/${productId}/edit`);
  };

  const handleProductClick = (slug?: string, id?: string) => {
    if (slug) {
      // Navigate to product detail page using slug
      navigate(`/products/${slug}`);
    } else if (id) {
      // Fallback to ID if no slug
      navigate(`/products/${id}`);
    }
  };

  // Clear search and reset filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  const formatPrice = (price?: number) => {
    if (!price && price !== 0) return '-';
    return `$${price.toFixed(2)}`;
  };

  const getStockStatus = (product: Product) => {
    if (!product.stock_quantity && product.stock_quantity !== 0) {
      return { variant: 'secondary', text: 'Unknown' };
    }

    if (product.stock_quantity <= 0) {
      return { variant: 'destructive', text: 'Out of Stock' };
    }

    if (product.min_stock_level && product.stock_quantity <= product.min_stock_level) {
      return { variant: 'destructive', text: 'Low Stock' };
    }

    return { variant: 'default', text: 'In Stock' };
  };

  // Render loading skeleton
  const renderLoadingSkeleton = () =>
  <div className="space-y-4">
      {[...Array(6)].map((_, i) =>
    <Card key={i} className="p-4">
          <div className="flex items-start space-x-4">
            <Skeleton className="w-20 h-20 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </Card>
    )}
    </div>;


  // Render product card for mobile
  const renderProductCard = (product: Product) => {
    const stockStatus = getStockStatus(product);

    return (
      <Card key={product.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleProductClick(product.slug, product.id)}>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {product.image_url &&
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }} />

                </div>
              }
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{product.name}</h3>
                {product.description &&
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {product.description}
                  </p>
                }
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-lg font-semibold text-green-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.category &&
                  <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  }
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">SKU:</span>
              <span className="ml-1 font-mono">{product.sku || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500">Stock:</span>
              <span className="ml-1">{product.stock_quantity || 0}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <Badge variant={stockStatus.variant as any}>
              {stockStatus.text}
            </Badge>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(product.id);
                }}
                title="Edit product">

                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(product.id);
                }}
                className="text-red-600 hover:text-red-700"
                title="Delete product">

                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>);

  };

  // Insert SEO meta tags
  useEffect(() => {
    const head = document.head;
    const existingTitle = head.querySelector('title');
    const existingDescription = head.querySelector('meta[name="description"]');
    const existingKeywords = head.querySelector('meta[name="keywords"]');
    const existingCanonical = head.querySelector('link[rel="canonical"]');

    // Update title
    if (existingTitle) {
      existingTitle.textContent = 'Products - DFS Manager Portal';
    } else {
      const title = document.createElement('title');
      title.textContent = 'Products - DFS Manager Portal';
      head.appendChild(title);
    }

    // Update description
    if (existingDescription) {
      existingDescription.setAttribute('content', 'Manage your product inventory with advanced search, filters, and pagination. View published products with images, prices, and detailed information.');
    } else {
      const description = document.createElement('meta');
      description.name = 'description';
      description.content = 'Manage your product inventory with advanced search, filters, and pagination. View published products with images, prices, and detailed information.';
      head.appendChild(description);
    }

    // Update keywords
    if (existingKeywords) {
      existingKeywords.setAttribute('content', 'products, inventory, gas station, fuel, catalog, management');
    } else {
      const keywords = document.createElement('meta');
      keywords.name = 'keywords';
      keywords.content = 'products, inventory, gas station, fuel, catalog, management';
      head.appendChild(keywords);
    }

    // Update canonical URL
    if (existingCanonical) {
      existingCanonical.setAttribute('href', `${window.location.origin}/products`);
    } else {
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = `${window.location.origin}/products`;
      head.appendChild(canonical);
    }
  }, []);

  if (error) {
    return (
      <ResponsiveStack spacing="lg">
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Products</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => loadProducts(1, true)}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </ResponsiveStack>);

  }

  return (
    <ResponsiveStack spacing="lg">
      <Card>
        <CardHeader>
          <div className={`flex items-center ${
          responsive.isMobile ? 'flex-col space-y-4' : 'justify-between'}`
          }>
            <div className={responsive.isMobile ? 'text-center' : ''}>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-6 h-6" />
                <span>Products Catalog</span>
              </CardTitle>
              <CardDescription className={responsive.isMobile ? 'text-center mt-2' : ''}>
                Browse and manage published products with advanced search and filtering
              </CardDescription>
            </div>
            
            <div className={`flex items-center space-x-2 ${responsive.isMobile ? 'flex-col space-y-2 space-x-0 w-full' : ''}`}>
              <Button
                onClick={() => navigate('/products/new')}
                className={`bg-brand-600 hover:bg-brand-700 text-white ${
                responsive.isMobile ? 'w-full' : ''}`
                }>

                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className={`flex items-center mb-6 ${
          responsive.isMobile ? 'flex-col space-y-3' : 'space-x-2'}`
          }>
            <div className={`relative ${
            responsive.isMobile ? 'w-full' : 'flex-1 max-w-md'}`
            }>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              {searchTerm &&
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-4 h-4 flex items-center justify-center"
                title="Clear search">

                  <X className="w-4 h-4" />
                </button>
              }
              <Input
                placeholder={responsive.isMobile ?
                "Search products..." :
                "Search by name, description, SKU, barcode..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${searchTerm ? 'pr-10' : 'pr-3'}`} />

            </div>
            
            <div className={`flex items-center space-x-2 ${
            responsive.isMobile ? 'w-full grid grid-cols-2 gap-2' : ''}`
            }>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className={responsive.isMobile ? 'w-full' : 'w-[180px]'}>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) =>
                  <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}>
                <SelectTrigger className={responsive.isMobile ? 'w-full' : 'w-[180px]'}>
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="price-asc">Price Low-High</SelectItem>
                  <SelectItem value="price-desc">Price High-Low</SelectItem>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchTerm || categoryFilter !== 'all') &&
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className={responsive.isMobile ? 'w-full' : ''}>

                Clear Filters
              </Button>
            }
          </div>

          {/* Results Count */}
          {!loading &&
          <div className="mb-4 text-sm text-gray-600">
              Showing {products.length} of {totalCount} products
              {searchTerm && ` matching "${searchTerm}"`}
              {categoryFilter !== 'all' && ` in ${categoryFilter}`}
            </div>
          }

          {/* Products Display */}
          {loading ?
          renderLoadingSkeleton() :
          products.length === 0 ?
          <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm || categoryFilter !== 'all' ?
              `No products found matching your criteria` :
              'No published products found'
              }
              </p>
              <div className="space-x-2">
                {(searchTerm || categoryFilter !== 'all') &&
              <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
              }
                <Button onClick={() => navigate('/products/new')}>
                  Add Your First Product
                </Button>
              </div>
            </div> :
          responsive.isMobile ?
          <div className="space-y-4">
              {products.map(renderProductCard)}
            </div> :

          <ResponsiveTable className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                  const stockStatus = getStockStatus(product);

                  return (
                    <TableRow
                      key={product.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleProductClick(product.slug, product.id)}>

                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {product.image_url &&
                          <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }} />

                              </div>
                          }
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{product.name}</p>
                              {product.description &&
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                                  {product.description}
                                </p>
                            }
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {product.sku || '-'}
                        </TableCell>
                        <TableCell>
                          {product.category ?
                        <Badge variant="outline">{product.category}</Badge> :
                        '-'}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatPrice(product.price)}
                        </TableCell>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(product.id);
                            }}
                            title="Edit product"
                            className="text-blue-600 hover:text-blue-700">

                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product.id);
                            }}
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
            </ResponsiveTable>
          }

          {/* Infinite Scroll Loading Trigger */}
          {products.length > 0 && products.length < totalCount &&
          <div
            ref={loadingTriggerRef}
            className="flex items-center justify-center py-8">

              {isLoadingMore ?
            <div className="flex items-center space-x-2 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading more products...</span>
                </div> :

            <div className="text-gray-400 text-sm">
                  Scroll down to load more products
                </div>
            }
            </div>
          }

          {products.length >= totalCount && totalCount > pageSize &&
          <div className="text-center py-4 text-sm text-gray-500">
              You've reached the end - all {totalCount} products loaded
            </div>
          }
        </CardContent>
      </Card>
    </ResponsiveStack>);

};

export default ProductList;