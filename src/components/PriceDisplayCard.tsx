import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatPrice, getPrimaryPrice, getPriceType, isLowStock } from '@/utils/priceUtils';
import { motion } from 'motion/react';

interface PriceDisplayCardProps {
  product: {
    id: number;
    product_name: string;
    price?: number;
    retail_price?: number;
    unit_price?: number;
    case_price?: number;
    quantity_in_stock?: number;
    minimum_stock?: number;
    updated_at?: string;
  };
  showAllPrices?: boolean;
  showStockInfo?: boolean;
  className?: string;
}

const PriceDisplayCard: React.FC<PriceDisplayCardProps> = ({
  product,
  showAllPrices = false,
  showStockInfo = true,
  className = ''
}) => {
  const primaryPrice = getPrimaryPrice(product);
  const priceType = getPriceType(product);
  const lowStock = isLowStock(product);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}>

      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span>Current Price</span>
            </div>
            {lowStock &&
            <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Low Stock
              </Badge>
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Price Display */}
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-green-600">
              {formatPrice(primaryPrice)}
            </div>
            <div className="text-sm text-gray-600">
              {priceType} Price
            </div>
            {product.updated_at &&
            <div className="text-xs text-gray-500">
                Updated: {new Date(product.updated_at).toLocaleString()}
              </div>
            }
          </div>

          {/* All Prices */}
          {showAllPrices &&
          <div className="space-y-3 border-t pt-3">
              <h4 className="text-sm font-medium">All Available Prices</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {product.retail_price && product.retail_price > 0 &&
              <div className="flex justify-between">
                    <span className="text-gray-600">Retail:</span>
                    <span className="font-medium">{formatPrice(product.retail_price)}</span>
                  </div>
              }
                {product.unit_price && product.unit_price > 0 &&
              <div className="flex justify-between">
                    <span className="text-gray-600">Unit:</span>
                    <span className="font-medium">{formatPrice(product.unit_price)}</span>
                  </div>
              }
                {product.price && product.price > 0 &&
              <div className="flex justify-between">
                    <span className="text-gray-600">Base:</span>
                    <span className="font-medium">{formatPrice(product.price)}</span>
                  </div>
              }
                {product.case_price && product.case_price > 0 &&
              <div className="flex justify-between">
                    <span className="text-gray-600">Case:</span>
                    <span className="font-medium">{formatPrice(product.case_price)}</span>
                  </div>
              }
              </div>
            </div>
          }

          {/* Stock Information */}
          {showStockInfo &&
          <div className="space-y-2 border-t pt-3">
              <h4 className="text-sm font-medium">Stock Information</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Stock:</span>
                  <span className={`font-medium ${lowStock ? 'text-red-600' : 'text-green-600'}`}>
                    {product.quantity_in_stock || 0} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Stock:</span>
                  <span className="font-medium">{product.minimum_stock || 0} units</span>
                </div>
                {lowStock &&
              <div className="flex items-center space-x-2 mt-2 p-2 bg-red-50 rounded-md">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-red-700">
                      Stock level is below minimum threshold
                    </span>
                  </div>
              }
              </div>
            </div>
          }

          {/* Price Status */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Price Status:</span>
              <Badge variant={primaryPrice > 0 ? 'default' : 'destructive'}>
                {primaryPrice > 0 ? 'Configured' : 'Not Set'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>);

};

export default PriceDisplayCard;