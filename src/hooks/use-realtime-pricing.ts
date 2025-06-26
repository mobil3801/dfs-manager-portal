import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getPrimaryPrice, getPriceType } from '@/utils/priceUtils';

interface PriceData {
  id: number;
  product_name?: string;
  price?: number;
  retail_price?: number;
  unit_price?: number;
  case_price?: number;
  quantity_in_stock?: number;
  minimum_stock?: number;
  updated_at?: string;
}

interface RealtimePricingOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  showToastOnUpdate?: boolean;
  trackPriceHistory?: boolean;
}

interface PriceHistoryEntry {
  timestamp: Date;
  price: number;
  priceType: string;
  productId: number;
}

export const useRealtimePricing = (
productIds: number[] = [],
options: RealtimePricingOptions = {}) =>
{
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    showToastOnUpdate = false,
    trackPriceHistory = false
  } = options;

  const { toast } = useToast();
  const [products, setProducts] = useState<Map<number, PriceData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchPricing = useCallback(async (ids: number[] = productIds, silent = false) => {
    if (ids.length === 0) return;

    try {
      if (!silent) setLoading(true);
      setError(null);

      // Fetch pricing data for all requested products
      const promises = ids.map(async (productId) => {
        const { data, error } = await window.ezsite.apis.tablePage(11726, {
          PageNo: 1,
          PageSize: 1,
          OrderByField: 'id',
          IsAsc: true,
          Filters: [{ name: 'id', op: 'Equal', value: productId }]
        });

        if (error) throw new Error(`Error fetching product ${productId}: ${error}`);

        if (data?.List?.[0]) {
          const product = data.List[0];
          return {
            id: product.id,
            product_name: product.product_name || 'Unknown Product',
            price: product.price || 0,
            retail_price: product.retail_price || 0,
            unit_price: product.unit_price || 0,
            case_price: product.case_price || 0,
            quantity_in_stock: product.quantity_in_stock || 0,
            minimum_stock: product.minimum_stock || 0,
            updated_at: product.updated_at || new Date().toISOString()
          };
        }
        return null;
      });

      const results = await Promise.all(promises);
      const validResults = results.filter((result): result is PriceData => result !== null);

      // Update products map and check for price changes
      setProducts((prevProducts) => {
        const newProducts = new Map(prevProducts);
        const priceChanges: Array<{
          productId: number;
          productName: string;
          oldPrice: number;
          newPrice: number;
          priceType: string;
        }> = [];

        validResults.forEach((newProduct) => {
          const oldProduct = prevProducts.get(newProduct.id);
          const newPrice = getPrimaryPrice(newProduct);
          const newPriceType = getPriceType(newProduct);

          if (oldProduct) {
            const oldPrice = getPrimaryPrice(oldProduct);
            if (oldPrice !== newPrice) {
              priceChanges.push({
                productId: newProduct.id,
                productName: newProduct.product_name || 'Unknown',
                oldPrice,
                newPrice,
                priceType: newPriceType
              });

              // Add to price history if tracking is enabled
              if (trackPriceHistory) {
                setPriceHistory((prev) => [...prev, {
                  timestamp: new Date(),
                  price: newPrice,
                  priceType: newPriceType,
                  productId: newProduct.id
                }].slice(-100)); // Keep last 100 entries
              }
            }
          }

          newProducts.set(newProduct.id, newProduct);
        });

        // Show toast notifications for price changes
        if (showToastOnUpdate && priceChanges.length > 0) {
          priceChanges.forEach((change) => {
            toast({
              title: 'Price Updated',
              description: `${change.productName}: $${change.oldPrice.toFixed(2)} → $${change.newPrice.toFixed(2)}`,
              duration: 3000
            });
          });
        }

        return newProducts;
      });

      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pricing data';
      setError(errorMessage);
      console.error('Error fetching real-time pricing:', err);

      if (!silent) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [productIds, showToastOnUpdate, trackPriceHistory, toast]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && productIds.length > 0) {
      const interval = setInterval(() => {
        fetchPricing(productIds, true); // Silent refresh
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, productIds, refreshInterval, fetchPricing]);

  // Initial fetch when productIds change
  useEffect(() => {
    if (productIds.length > 0) {
      fetchPricing(productIds);
    }
  }, [productIds, fetchPricing]);

  // Manual refresh function
  const refresh = useCallback((silent = false) => {
    return fetchPricing(productIds, silent);
  }, [fetchPricing, productIds]);

  // Get specific product pricing
  const getProductPricing = useCallback((productId: number): PriceData | null => {
    return products.get(productId) || null;
  }, [products]);

  // Add new product to monitoring
  const addProduct = useCallback((productId: number) => {
    if (!productIds.includes(productId)) {
      fetchPricing([productId], true);
    }
  }, [productIds, fetchPricing]);

  // Get all products as array
  const getAllProducts = useCallback((): PriceData[] => {
    return Array.from(products.values());
  }, [products]);

  // Get price history for a specific product
  const getProductPriceHistory = useCallback((productId: number): PriceHistoryEntry[] => {
    return priceHistory.filter((entry) => entry.productId === productId);
  }, [priceHistory]);

  return {
    products: getAllProducts(),
    loading,
    error,
    lastUpdated,
    priceHistory,
    refresh,
    getProductPricing,
    addProduct,
    getProductPriceHistory,
    // Computed values
    totalProducts: products.size,
    hasError: !!error,
    isStale: lastUpdated ? Date.now() - lastUpdated.getTime() > refreshInterval * 2 : true
  };
};

export default useRealtimePricing;