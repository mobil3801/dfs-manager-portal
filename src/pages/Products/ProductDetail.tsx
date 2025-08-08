import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, Package, DollarSign, Tag, Barcode, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { ResponsiveStack } from '@/components/ResponsiveWrapper';
import { useResponsiveLayout } from '@/hooks/use-mobile';

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

const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{slug: string;}>();
  const { userProfile } = useSupabaseAuth();
  const responsive = useResponsiveLayout();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load product details
  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) {
        setError('Product not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Try to find by slug first, then by ID as fallback
        let query = supabase.
        from('products').
        select('*').
        eq('is_published', true);

        // Check if slug is a UUID (ID) or actual slug
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);

        if (isUUID) {
          query = query.eq('id', slug);
        } else {
          query = query.eq('slug', slug);
        }

        const { data, error: queryError } = await query.single();

        if (queryError) {
          if (queryError.code === 'PGRST116') {
            setError('Product not found');
          } else {
            throw queryError;
          }
          return;
        }

        setProduct(data);

        // Update SEO meta tags
        updateSEOTags(data);
      } catch (error) {
        console.error('Error loading product:', error);
        setError(error instanceof Error ? error.message : 'Failed to load product');
        toast({
          title: "Error",
          description: "Failed to load product details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  const updateSEOTags = (product: Product) => {
    const head = document.head;

    // Update title
    const existingTitle = head.querySelector('title');
    const newTitle = `${product.name} - DFS Manager Portal`;
    if (existingTitle) {
      existingTitle.textContent = newTitle;
    }

    // Update description
    const existingDescription = head.querySelector('meta[name="description"]');
    const newDescription = product.description ?
    `${product.description} - Price: $${product.price?.toFixed(2) || 'N/A'} - Category: ${product.category || 'Uncategorized'}` :
    `View details for ${product.name} in our product catalog.`;

    if (existingDescription) {
      existingDescription.setAttribute('content', newDescription);
    } else {
      const description = document.createElement('meta');
      description.name = 'description';
      description.content = newDescription;
      head.appendChild(description);
    }

    // Update canonical URL
    const existingCanonical = head.querySelector('link[rel="canonical"]');
    const canonicalUrl = `${window.location.origin}/products/${product.slug || product.id}`;
    if (existingCanonical) {
      existingCanonical.setAttribute('href', canonicalUrl);
    } else {
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = canonicalUrl;
      head.appendChild(canonical);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price && price !== 0) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  const calculateProfitMargin = (price?: number, cost?: number) => {
    if (!price || !cost) return null;
    const margin = (price - cost) / price * 100;
    return margin.toFixed(1);
  };

  if (loading) {
    return (
      <ResponsiveStack spacing="lg">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2 mb-4">
              <Skeleton className="w-8 h-8" />
              <Skeleton className="w-24 h-4" />
            </div>
            <Skeleton className="w-3/4 h-8" />
            <Skeleton className="w-full h-4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="w-full h-64" />
              <div className="space-y-4">
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      </ResponsiveStack>);

  }

  if (error || !product) {
    return (
      <ResponsiveStack spacing="lg">
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Not Found</h3>
            <p className="text-gray-600 mb-4">{error || 'The requested product could not be found.'}</p>
            <div className="space-x-2">
              <Button onClick={() => navigate('/products')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </ResponsiveStack>);

  }

  const stockStatus = getStockStatus(product);
  const profitMargin = calculateProfitMargin(product.price, product.cost);

  return (
    <ResponsiveStack spacing="lg">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/products')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </div>
          <div className={`flex items-start ${responsive.isMobile ? 'flex-col space-y-4' : 'justify-between'}`}>
            <div>
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <CardDescription className="text-base mt-2">
                {product.description || 'No description available'}
              </CardDescription>
            </div>
            <div className={`flex items-center space-x-2 ${responsive.isMobile ? 'w-full' : ''}`}>
              <Button
                onClick={() => navigate(`/products/${product.id}/edit`)}
                className={responsive.isMobile ? 'flex-1' : ''}>

                <Edit className="w-4 h-4 mr-2" />
                Edit Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Image */}
            <div className="lg:col-span-1">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {product.image_url ?
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-product.png';
                  }} /> :


                <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-16 h-16" />
                  </div>
                }
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Price and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Pricing</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Selling Price:</span>
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(product.price)}
                        </div>
                      </div>
                      {product.cost &&
                      <div>
                          <span className="text-sm text-gray-500">Cost:</span>
                          <div className="text-lg">{formatPrice(product.cost)}</div>
                        </div>
                      }
                      {profitMargin &&
                      <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-500">Profit Margin:</span>
                          <span className="font-medium text-blue-600">{profitMargin}%</span>
                        </div>
                      }
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Inventory</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Current Stock:</span>
                        <div className="text-2xl font-bold">
                          {product.stock_quantity || 0}
                        </div>
                      </div>
                      {product.min_stock_level &&
                      <div>
                          <span className="text-sm text-gray-500">Min Level:</span>
                          <div className="text-lg">{product.min_stock_level}</div>
                        </div>
                      }
                      <Badge variant={stockStatus.variant as any} className="mt-2">
                        {stockStatus.text}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Product Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Product Information</h3>
                  <div className="space-y-3">
                    {product.category &&
                    <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Category:</span>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                    }
                    {product.sku &&
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">SKU:</span>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{product.sku}</code>
                      </div>
                    }
                    {product.barcode &&
                    <div className="flex items-center space-x-2">
                        <Barcode className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Barcode:</span>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{product.barcode}</code>
                      </div>
                    }
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Timestamps</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Created:</span>
                      <span className="text-sm">{formatDate(product.created_at)}</span>
                    </div>
                    {product.updated_at &&
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Last Updated:</span>
                        <span className="text-sm">{formatDate(product.updated_at)}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </ResponsiveStack>);

};

export default ProductDetail;