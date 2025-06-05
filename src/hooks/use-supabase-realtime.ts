import { useEffect, useRef, useState } from 'react';
import { supabase, Database } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

type TableName = keyof Database['public']['Tables'];
type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions {
  table: TableName;
  event?: RealtimeEvent;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onError?: (error: any) => void;
}

export const useSupabaseRealtime = (options: UseRealtimeOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const {
      table,
      event = '*',
      filter,
      onInsert,
      onUpdate,
      onDelete,
      onError
    } = options;

    // Create unique channel name
    const channelName = `realtime_${table}_${Date.now()}`;

    // Create realtime channel
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter
        },
        (payload) => {
          console.log(`Realtime event for ${table}:`, payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload);
              break;
            case 'UPDATE':
              onUpdate?.(payload);
              break;
            case 'DELETE':
              onDelete?.(payload);
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status for ${table}:`, status);
        
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          const errorMsg = `Failed to subscribe to ${table} changes`;
          setError(errorMsg);
          onError?.(errorMsg);
          toast({
            title: 'Realtime Connection Error',
            description: errorMsg,
            variant: 'destructive'
          });
        }
      });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [options.table, options.event, options.filter, toast]);

  return {
    isConnected,
    error,
    disconnect: () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      setIsConnected(false);
    }
  };
};

// Hook for real-time data fetching with automatic updates
export const useRealtimeData = <T extends TableName>(
  table: T,
  filters?: Array<{ column: string; operator: string; value: any }>,
  orderBy?: string,
  ascending = true
) => {
  const [data, setData] = useState<Database['public']['Tables'][T]['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      let query = supabase.from(table).select('*');

      // Apply filters
      if (filters) {
        filters.forEach(filter => {
          switch (filter.operator) {
            case 'Equal':
              query = query.eq(filter.column, filter.value);
              break;
            case 'GreaterThan':
              query = query.gt(filter.column, filter.value);
              break;
            case 'GreaterThanOrEqual':
              query = query.gte(filter.column, filter.value);
              break;
            case 'LessThan':
              query = query.lt(filter.column, filter.value);
              break;
            case 'LessThanOrEqual':
              query = query.lte(filter.column, filter.value);
              break;
            case 'StringContains':
              query = query.ilike(filter.column, `%${filter.value}%`);
              break;
            case 'StringStartsWith':
              query = query.ilike(filter.column, `${filter.value}%`);
              break;
            case 'StringEndsWith':
              query = query.ilike(filter.column, `%${filter.value}`);
              break;
          }
        });
      }

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy, { ascending });
      }

      const { data: result, error: queryError } = await query;

      if (queryError) {
        throw new Error(queryError.message);
      }

      setData(result || []);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMsg);
      console.error(`Error fetching ${table} data:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Set up realtime subscription
  useSupabaseRealtime({
    table,
    onInsert: (payload) => {
      setData(prev => [...prev, payload.new]);
      toast({
        title: 'New Record Added',
        description: `A new ${table.replace('_', ' ')} record has been added.`
      });
    },
    onUpdate: (payload) => {
      setData(prev => 
        prev.map(item => 
          item.id === payload.new.id ? payload.new : item
        )
      );
      toast({
        title: 'Record Updated',
        description: `A ${table.replace('_', ' ')} record has been updated.`
      });
    },
    onDelete: (payload) => {
      setData(prev => 
        prev.filter(item => item.id !== payload.old.id)
      );
      toast({
        title: 'Record Deleted',
        description: `A ${table.replace('_', ' ')} record has been deleted.`
      });
    },
    onError: (error) => {
      setError(error);
    }
  });

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [table, JSON.stringify(filters), orderBy, ascending]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

// Hook for monitoring specific record changes
export const useRealtimeRecord = <T extends TableName>(
  table: T,
  recordId: number | null
) => {
  const [record, setRecord] = useState<Database['public']['Tables'][T]['Row'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial record
  const fetchRecord = async () => {
    if (!recordId) {
      setRecord(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: queryError } = await supabase
        .from(table)
        .select('*')
        .eq('id', recordId)
        .single();

      if (queryError) {
        throw new Error(queryError.message);
      }

      setRecord(data);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch record';
      setError(errorMsg);
      console.error(`Error fetching ${table} record:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Set up realtime subscription for specific record
  useSupabaseRealtime({
    table,
    filter: recordId ? `id=eq.${recordId}` : undefined,
    onUpdate: (payload) => {
      if (payload.new.id === recordId) {
        setRecord(payload.new);
      }
    },
    onDelete: (payload) => {
      if (payload.old.id === recordId) {
        setRecord(null);
      }
    },
    onError: (error) => {
      setError(error);
    }
  });

  useEffect(() => {
    fetchRecord();
  }, [table, recordId]);

  return {
    record,
    loading,
    error,
    refetch: fetchRecord
  };
};

export default useSupabaseRealtime;