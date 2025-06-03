import { useEffect, useState, useCallback, useRef } from 'react';
import { realtimeManager } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';

interface RealtimeOptions {
  table: string;
  filters?: {column: string;eq: string | number;}[];
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  showNotifications?: boolean;
}

export const useRealtime = (options: RealtimeOptions) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleRealtimeEvent = useCallback((payload: any) => {
    console.log('Real-time event:', payload);
    setLastUpdate(new Date());

    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        if (options.onInsert) {
          options.onInsert(newRecord);
        }
        if (options.showNotifications) {
          toast({
            title: 'New Record Added',
            description: `A new ${options.table} record has been created.`,
            duration: 3000
          });
        }
        break;

      case 'UPDATE':
        if (options.onUpdate) {
          options.onUpdate({ new: newRecord, old: oldRecord });
        }
        if (options.showNotifications) {
          toast({
            title: 'Record Updated',
            description: `A ${options.table} record has been updated.`,
            duration: 3000
          });
        }
        break;

      case 'DELETE':
        if (options.onDelete) {
          options.onDelete(oldRecord);
        }
        if (options.showNotifications) {
          toast({
            title: 'Record Deleted',
            description: `A ${options.table} record has been deleted.`,
            duration: 3000
          });
        }
        break;
    }
  }, [options, toast]);

  useEffect(() => {
    console.log(`Setting up real-time subscription for ${options.table}`);
    setIsConnected(true);

    const unsubscribe = realtimeManager.subscribe(
      options.table as any,
      handleRealtimeEvent,
      options.filters
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      console.log(`Cleaning up real-time subscription for ${options.table}`);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      setIsConnected(false);
    };
  }, [options.table, options.filters, handleRealtimeEvent]);

  const disconnect = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const reconnect = useCallback(() => {
    if (!unsubscribeRef.current) {
      const unsubscribe = realtimeManager.subscribe(
        options.table as any,
        handleRealtimeEvent,
        options.filters
      );
      unsubscribeRef.current = unsubscribe;
      setIsConnected(true);
    }
  }, [options.table, options.filters, handleRealtimeEvent]);

  return {
    isConnected,
    lastUpdate,
    disconnect,
    reconnect
  };
};

// Hook for real-time data with automatic refresh
export const useRealtimeData = <T,>(
table: string,
fetcher: () => Promise<T>,
options: Omit<RealtimeOptions, 'table'> = {}) =>
{
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  const { isConnected, lastUpdate } = useRealtime({
    table,
    ...options,
    onInsert: (payload) => {
      fetchData();
      options.onInsert?.(payload);
    },
    onUpdate: (payload) => {
      fetchData();
      options.onUpdate?.(payload);
    },
    onDelete: (payload) => {
      fetchData();
      options.onDelete?.(payload);
    }
  });

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    isConnected,
    lastUpdate,
    refetch
  };
};