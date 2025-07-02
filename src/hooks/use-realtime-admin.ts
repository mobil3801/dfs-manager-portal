import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RealtimeAdminConfig {
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  enableNotifications?: boolean;
  onDataUpdate?: (data: any) => void;
}

export const useRealtimeAdmin = (
fetchFunction: () => Promise<void>,
config: RealtimeAdminConfig = {}) =>
{
  const {
    enableAutoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableNotifications = true,
    onDataUpdate
  } = config;

  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await fetchFunction();
      setLastUpdated(new Date());

      if (onDataUpdate) {
        onDataUpdate({ timestamp: new Date() });
      }

      if (enableNotifications) {
        console.log('Admin data refreshed at:', new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Error refreshing admin data:', error);
      if (enableNotifications) {
        toast({
          title: "Data Refresh Error",
          description: "Failed to refresh real-time data",
          variant: "destructive"
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const startAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (enableAutoRefresh) {
      intervalRef.current = setInterval(refresh, refreshInterval);
    }
  };

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startAutoRefresh();

    return () => {
      stopAutoRefresh();
    };
  }, [enableAutoRefresh, refreshInterval]);

  return {
    refresh,
    isRefreshing,
    lastUpdated,
    startAutoRefresh,
    stopAutoRefresh
  };
};

export const useRealtimeData = <T,>(
tableName: string,
tableId: number,
config: RealtimeAdminConfig = {}) =>
{
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const { data: result, error: apiError } = await window.ezsite.apis.tablePage(tableId, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (apiError) {
        throw new Error(apiError);
      }

      setData(result?.List || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error(`Error fetching ${tableName}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const realtimeAdmin = useRealtimeAdmin(fetchData, config);

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    ...realtimeAdmin
  };
};