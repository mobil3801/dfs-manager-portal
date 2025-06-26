import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OptimizedRealTimeData {
  isLoading: boolean;
  lastUpdate: Date | null;
  error: string | null;
  refreshData: () => Promise<void>;
  getData: (tableId: number) => any[];
  getDataCount: (tableId: number) => number;
}

const OptimizedRealTimeContext = createContext<OptimizedRealTimeData | undefined>(undefined);

export const useOptimizedRealTime = () => {
  const context = useContext(OptimizedRealTimeContext);
  if (!context) {
    throw new Error('useOptimizedRealTime must be used within OptimizedRealTimeProvider');
  }
  return context;
};

interface OptimizedRealTimeProviderProps {
  children: React.ReactNode;
  refreshInterval?: number;
  enableAutoRefresh?: boolean;
}

export const OptimizedRealTimeProvider: React.FC<OptimizedRealTimeProviderProps> = ({ 
  children, 
  refreshInterval = 60000, // 1 minute default
  enableAutoRefresh = true 
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Map<number, any[]>>(new Map());
  const [dataCounts, setDataCounts] = useState<Map<number, number>>(new Map());
  
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  /**
   * Fetch data for a specific table with error handling
   */
  const fetchTableData = useCallback(async (tableId: number, maxRecords = 50) => {
    try {
      if (!window.ezsite?.apis) {
        throw new Error('APIs not available');
      }

      const { data: response, error } = await window.ezsite.apis.tablePage(tableId, {
        PageNo: 1,
        PageSize: maxRecords,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (error) {
        console.warn(`⚠️ Error fetching table ${tableId}:`, error);
        return { list: [], count: 0 };
      }

      return {
        list: response?.List || [],
        count: response?.VirtualCount || 0
      };
    } catch (error) {
      console.error(`❌ Failed to fetch table ${tableId}:`, error);
      return { list: [], count: 0 };
    }
  }, []);

  /**
   * Optimized refresh that only fetches essential data
   */
  const refreshData = useCallback(async () => {
    if (isRefreshingRef.current) {
      console.log('🔄 Refresh already in progress, skipping...');
      return;
    }

    isRefreshingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Refreshing optimized real-time data...');

      // Only fetch essential tables with limited records
      const essentialTables = [
        11726, // products
        11727, // employees  
        12356, // sales reports
        11730, // orders
        11731, // licenses
        12196  // deliveries
      ];

      const results = await Promise.allSettled(
        essentialTables.map(tableId => fetchTableData(tableId, 20))
      );

      const newData = new Map<number, any[]>();
      const newCounts = new Map<number, number>();

      results.forEach((result, index) => {
        const tableId = essentialTables[index];
        if (result.status === 'fulfilled') {
          newData.set(tableId, result.value.list);
          newCounts.set(tableId, result.value.count);
        } else {
          console.warn(`⚠️ Failed to fetch table ${tableId}:`, result.reason);
          // Keep existing data if refresh fails
          newData.set(tableId, data.get(tableId) || []);
          newCounts.set(tableId, dataCounts.get(tableId) || 0);
        }
      });

      setData(newData);
      setDataCounts(newCounts);
      setLastUpdate(new Date());

      console.log('✅ Real-time data refreshed successfully');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh data';
      console.error('❌ Real-time refresh failed:', errorMessage);
      setError(errorMessage);
      
      // Only show toast for critical errors
      if (errorMessage.includes('authentication') || errorMessage.includes('network')) {
        toast({
          variant: "destructive",
          title: "Data Refresh Error",
          description: "Failed to refresh real-time data. Please check your connection.",
        });
      }
    } finally {
      setIsLoading(false);
      isRefreshingRef.current = false;
    }
  }, [data, dataCounts, fetchTableData, toast]);

  /**
   * Get data for a specific table
   */
  const getData = useCallback((tableId: number): any[] => {
    return data.get(tableId) || [];
  }, [data]);

  /**
   * Get data count for a specific table
   */
  const getDataCount = useCallback((tableId: number): number => {
    return dataCounts.get(tableId) || 0;
  }, [dataCounts]);

  /**
   * Setup auto-refresh
   */
  useEffect(() => {
    if (!enableAutoRefresh) return;

    const setupAutoRefresh = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = setTimeout(() => {
        refreshData().finally(() => {
          // Schedule next refresh
          setupAutoRefresh();
        });
      }, refreshInterval);
    };

    // Initial refresh
    refreshData().finally(() => {
      // Start auto-refresh cycle
      setupAutoRefresh();
    });

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [refreshData, refreshInterval, enableAutoRefresh]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      isRefreshingRef.current = false;
    };
  }, []);

  const value: OptimizedRealTimeData = {
    isLoading,
    lastUpdate,
    error,
    refreshData,
    getData,
    getDataCount
  };

  return (
    <OptimizedRealTimeContext.Provider value={value}>
      {children}
    </OptimizedRealTimeContext.Provider>
  );
};

export default OptimizedRealTimeProvider;