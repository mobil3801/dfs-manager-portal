/**
 * Lightweight Analytics
 * Simplified replacement for heavy analytics calculations
 */

interface BasicStats {
  count: number;
  total: number;
  average: number;
  recent: number;
}

interface SimpleDashboardMetrics {
  sales: BasicStats;
  products: BasicStats;
  employees: BasicStats;
  orders: BasicStats;
  deliveries: BasicStats;
  licenses: BasicStats;
}

/**
 * Calculate basic dashboard metrics without heavy processing
 */
export const calculateSimpleMetrics = (data: Map<string, any>): SimpleDashboardMetrics => {
  try {
    const salesData = data.get('critical-data')?.[0]?.data?.List || [];
    const productsData = data.get('critical-data')?.[1]?.data || {};
    const employeesData = data.get('critical-data')?.[2]?.data || {};
    const ordersData = data.get('secondary-data')?.[0]?.data || {};
    const deliveriesData = data.get('secondary-data')?.[1]?.data || {};
    const licensesData = data.get('secondary-data')?.[2]?.data || {};

    // Calculate sales metrics
    const salesStats: BasicStats = {
      count: salesData.length,
      total: salesData.reduce((sum: number, item: any) => sum + (parseFloat(item.total_sales) || 0), 0),
      average: 0,
      recent: 0
    };
    
    if (salesStats.count > 0) {
      salesStats.average = salesStats.total / salesStats.count;
      
      // Count recent sales (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      salesStats.recent = salesData.filter((item: any) => {
        const date = new Date(item.report_date);
        return date >= thirtyDaysAgo;
      }).length;
    }

    return {
      sales: salesStats,
      products: {
        count: productsData.VirtualCount || 0,
        total: productsData.VirtualCount || 0,
        average: 0,
        recent: 0
      },
      employees: {
        count: employeesData.VirtualCount || 0,
        total: employeesData.VirtualCount || 0,
        average: 0,
        recent: 0
      },
      orders: {
        count: ordersData.VirtualCount || 0,
        total: ordersData.VirtualCount || 0,
        average: 0,
        recent: 0
      },
      deliveries: {
        count: deliveriesData.VirtualCount || 0,
        total: deliveriesData.VirtualCount || 0,
        average: 0,
        recent: 0
      },
      licenses: {
        count: licensesData.VirtualCount || 0,
        total: licensesData.VirtualCount || 0,
        average: 0,
        recent: 0
      }
    };
  } catch (error) {
    console.error('Error calculating simple metrics:', error);
    
    // Return safe defaults
    const defaultStats: BasicStats = { count: 0, total: 0, average: 0, recent: 0 };
    return {
      sales: defaultStats,
      products: defaultStats,
      employees: defaultStats,
      orders: defaultStats,
      deliveries: defaultStats,
      licenses: defaultStats
    };
  }
};

/**
 * Format currency safely
 */
export const formatCurrency = (amount: number): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    return `$${amount.toFixed(0)}`;
  }
};

/**
 * Format numbers safely
 */
export const formatNumber = (num: number): string => {
  try {
    return new Intl.NumberFormat('en-US').format(num);
  } catch (error) {
    return num.toString();
  }
};

/**
 * Calculate percentage change safely
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Get time ago string
 */
export const getTimeAgo = (date: Date): string => {
  try {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  } catch (error) {
    return 'Unknown';
  }
};

export default {
  calculateSimpleMetrics,
  formatCurrency,
  formatNumber,
  calculatePercentageChange,
  getTimeAgo
};