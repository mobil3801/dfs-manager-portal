/**
 * Price utilities for real-time pricing calculations and formatting
 */

export interface PriceData {
  price?: number;
  retail_price?: number;
  unit_price?: number;
  case_price?: number;
  quantity_in_stock?: number;
  minimum_stock?: number;
}

/**
 * Get the primary price to display based on priority
 * Priority: retail_price > unit_price > price > case_price
 */
export const getPrimaryPrice = (product: PriceData): number => {
  return product.retail_price && product.retail_price > 0 ? product.retail_price :
  product.unit_price && product.unit_price > 0 ? product.unit_price :
  product.price && product.price > 0 ? product.price :
  product.case_price && product.case_price > 0 ? product.case_price : 0;
};

/**
 * Get the type of price being displayed
 */
export const getPriceType = (product: PriceData): string => {
  if (product.retail_price && product.retail_price > 0) return 'Retail';
  if (product.unit_price && product.unit_price > 0) return 'Unit';
  if (product.price && product.price > 0) return 'Base';
  if (product.case_price && product.case_price > 0) return 'Case';
  return 'No Price';
};

/**
 * Format price as currency string
 */
export const formatPrice = (price: number): string => {
  return price > 0 ? `$${price.toFixed(2)}` : '$0.00';
};

/**
 * Format price with type indicator
 */
export const formatPriceWithType = (product: PriceData): {
  formattedPrice: string;
  priceType: string;
  price: number;
} => {
  const price = getPrimaryPrice(product);
  const priceType = getPriceType(product);
  const formattedPrice = formatPrice(price);

  return { formattedPrice, priceType, price };
};

/**
 * Check if product is low stock
 */
export const isLowStock = (product: PriceData): boolean => {
  if (!product.quantity_in_stock && !product.minimum_stock) return false;
  return (product.quantity_in_stock || 0) <= (product.minimum_stock || 0);
};

/**
 * Calculate total inventory value
 */
export const calculateInventoryValue = (products: PriceData[]): number => {
  return products.reduce((sum, product) => {
    const price = getPrimaryPrice(product);
    return sum + price * (product.quantity_in_stock || 0);
  }, 0);
};

/**
 * Get all price information for a product
 */
export const getAllPriceInfo = (product: PriceData) => {
  const prices = [];

  if (product.retail_price && product.retail_price > 0) {
    prices.push({ type: 'Retail', price: product.retail_price, primary: true });
  }
  if (product.unit_price && product.unit_price > 0) {
    prices.push({ type: 'Unit', price: product.unit_price, primary: !prices.length });
  }
  if (product.price && product.price > 0) {
    prices.push({ type: 'Base', price: product.price, primary: !prices.length });
  }
  if (product.case_price && product.case_price > 0) {
    prices.push({ type: 'Case', price: product.case_price, primary: !prices.length });
  }

  return prices;
};

/**
 * Validate if a price value is valid
 */
export const isValidPrice = (price: any): boolean => {
  return typeof price === 'number' && price >= 0 && !isNaN(price);
};

/**
 * Calculate profit margin percentage
 */
export const calculateProfitMargin = (unitPrice: number, retailPrice: number): number => {
  if (!unitPrice || !retailPrice || retailPrice <= 0) return 0;
  return (retailPrice - unitPrice) / retailPrice * 100;
};

/**
 * Get price status indicator
 */
export const getPriceStatus = (product: PriceData): {
  status: 'good' | 'warning' | 'error';
  message: string;
} => {
  const primaryPrice = getPrimaryPrice(product);

  if (primaryPrice === 0) {
    return { status: 'error', message: 'No price set' };
  }

  if (product.unit_price && product.retail_price) {
    const margin = calculateProfitMargin(product.unit_price, product.retail_price);
    if (margin < 10) {
      return { status: 'warning', message: 'Low profit margin' };
    }
    if (margin > 50) {
      return { status: 'warning', message: 'High markup' };
    }
  }

  return { status: 'good', message: 'Price configured' };
};

/**
 * Real-time price data fetcher
 */
export const fetchRealTimePricing = async (productId: number): Promise<PriceData | null> => {
  try {
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
      return {
        price: product.price || 0,
        retail_price: product.retail_price || 0,
        unit_price: product.unit_price || 0,
        case_price: product.case_price || 0,
        quantity_in_stock: product.quantity_in_stock || 0,
        minimum_stock: product.minimum_stock || 0
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching real-time pricing:', error);
    return null;
  }
};

export default {
  getPrimaryPrice,
  getPriceType,
  formatPrice,
  formatPriceWithType,
  isLowStock,
  calculateInventoryValue,
  getAllPriceInfo,
  isValidPrice,
  calculateProfitMargin,
  getPriceStatus,
  fetchRealTimePricing
};