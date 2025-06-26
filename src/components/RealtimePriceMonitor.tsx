import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatPrice, getPrimaryPrice, getPriceType, isLowStock } from '@/utils/priceUtils';
import { motion } from 'motion/react';

interface PriceData {
  id: number;
  product_name: string;
  price: number;
  retail_price: number;
  unit_price: number;
  case_price: number;
  quantity_in_stock: number;
  minimum_stock: number;
  updated_at: string;
}

interface RealtimePriceMonitorProps {
  productId?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showDetailedInfo?: boolean;
  className?: string;
}

const RealtimePriceMonitor: React.FC<RealtimePriceMonitorProps> = ({
  productId,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  showDetailedInfo = false,
  className = ''
}) => {
  const { toast } = useToast();
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [priceHistory, setPriceHistory] = useState<Array<{
    timestamp: Date;
    price: number;
    type: string;
  }>>([]);

  const fetchPriceData = async (showToast = false) => {
    if (!productId) return;

    try {
      setLoading(true);

      const { data, error } = await window.ezsite.apis.tablePage(11726, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'id',
        IsAsc: true,
        Filters: [{ name: 'id', op: 'Equal', value: productId }]
      });

      if (error) throw error;

      if (data?.List?.[0]) {
        const product = data.List[0];
        const newPriceData: PriceData = {
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

        // Check for price changes
        if (priceData) {
          const oldPrice = getPrimaryPrice(priceData);
          const newPrice = getPrimaryPrice(newPriceData);

          if (oldPrice !== newPrice) {
            setPriceHistory((prev) => [...prev, {
              timestamp: new Date(),
              price: newPrice,
              type: getPriceType(newPriceData)
            }].slice(-10)); // Keep last 10 price changes

            if (showToast) {
              toast({
                title: 'Price Updated',
                description: `${newPriceData.product_name}: ${formatPrice(oldPrice)} → ${formatPrice(newPrice)}`,
                duration: 3000
              });
            }
          }
        }

        setPriceData(newPriceData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching price data:', error);
      if (showToast) {
        toast({
          title: 'Error',
          description: 'Failed to fetch price data',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchPriceData();
    }
  }, [productId]);

  useEffect(() => {
    if (autoRefresh && productId) {
      const interval = setInterval(() => {
        fetchPriceData(true);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, productId, refreshInterval]);

  const handleManualRefresh = () => {
    fetchPriceData(true);
  };

  if (!productId) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            No product selected for price monitoring
          </div>
        </CardContent>
      </Card>);

  }

  if (!priceData) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading price data...</span>
          </div>
        </CardContent>
      </Card>);

  }

  const primaryPrice = getPrimaryPrice(priceData);
  const priceType = getPriceType(priceData);
  const lowStock = isLowStock(priceData);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}>

      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span>Real-time Price</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Live
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManualRefresh}
                disabled={loading}>

                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Price */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current {priceType} Price</span>
              {lowStock &&
              <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Low Stock
                </Badge>
              }
            </div>
            <div className="text-3xl font-bold text-green-600">
              {formatPrice(primaryPrice)}
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}
            </div>
          </div>

          {/* Detailed Price Information */}
          {showDetailedInfo &&
          <div className="space-y-3 border-t pt-3">
              <h4 className="text-sm font-medium">All Prices</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {priceData.retail_price > 0 &&
              <div className="flex justify-between">
                    <span className="text-gray-600">Retail:</span>
                    <span className="font-medium">{formatPrice(priceData.retail_price)}</span>
                  </div>
              }
                {priceData.unit_price > 0 &&
              <div className="flex justify-between">
                    <span className="text-gray-600">Unit:</span>
                    <span className="font-medium">{formatPrice(priceData.unit_price)}</span>
                  </div>
              }
                {priceData.price > 0 &&
              <div className="flex justify-between">
                    <span className="text-gray-600">Base:</span>
                    <span className="font-medium">{formatPrice(priceData.price)}</span>
                  </div>
              }
                {priceData.case_price > 0 &&
              <div className="flex justify-between">
                    <span className="text-gray-600">Case:</span>
                    <span className="font-medium">{formatPrice(priceData.case_price)}</span>
                  </div>
              }
              </div>
            </div>
          }

          {/* Stock Information */}
          <div className="space-y-2 border-t pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Stock Level:</span>
              <span className={`font-medium ${lowStock ? 'text-red-600' : 'text-green-600'}`}>
                {priceData.quantity_in_stock} units
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Minimum Stock:</span>
              <span className="font-medium">{priceData.minimum_stock} units</span>
            </div>
          </div>

          {/* Price History */}
          {priceHistory.length > 0 &&
          <div className="space-y-2 border-t pt-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Recent Changes</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {priceHistory.slice(-5).reverse().map((entry, index) =>
              <div key={index} className="flex justify-between text-xs">
                    <span className="text-gray-500">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="font-medium">
                      {formatPrice(entry.price)} ({entry.type})
                    </span>
                  </div>
              )}
              </div>
            </div>
          }

          {/* Auto-refresh indicator */}
          {autoRefresh &&
          <div className="flex items-center justify-center text-xs text-gray-500 pt-2">
              <RefreshCw className="w-3 h-3 mr-1" />
              Auto-refreshing every {refreshInterval / 1000}s
            </div>
          }
        </CardContent>
      </Card>
    </motion.div>);

};

export default RealtimePriceMonitor;