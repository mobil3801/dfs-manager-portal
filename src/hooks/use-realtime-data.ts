import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeService, ConnectionStatus } from '@/services/supabaseRealtimeService';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface UseRealtimeDataOptions {
  table: string;
  initialData?: any[];
  enableOptimisticUpdates?: boolean;
  conflictResolution?: 'server' | 'client' | 'prompt';
  autoSubscribe?: boolean;
  filter?: string;
}

interface RealtimeDataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  connected: boolean;
  lastUpdate: Date | null;
  optimisticUpdates: Set<string>;
  conflicts: Map<string, any>;
}

interface OptimisticOperation {
  id: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: Date;
}

export function useRealtimeData<T extends {id: number;}>(
options: UseRealtimeDataOptions)
{
  const { toast } = useToast();
  const [state, setState] = useState<RealtimeDataState<T>>({
    data: options.initialData || [],
    loading: false,
    error: null,
    connected: false,
    lastUpdate: null,
    optimisticUpdates: new Set(),
    conflicts: new Map()
  });

  const subscriptionKeysRef = useRef<string[]>([]);
  const optimisticOperationsRef = useRef<Map<string, OptimisticOperation>>(new Map());
  const conflictTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Connection status monitoring
  useEffect(() => {
    const unsubscribe = realtimeService.onConnectionChange((status: ConnectionStatus) => {
      setState((prev) => ({
        ...prev,
        connected: status.connected
      }));

      if (!status.connected && status.reconnecting) {
        toast({
          title: "Connection Lost",
          description: "Reconnecting to real-time updates...",
          variant: "destructive"
        });
      } else if (status.connected) {
        toast({
          title: "Connected",
          description: "Real-time updates are active",
          variant: "default"
        });
      }
    });

    return unsubscribe;
  }, [toast]);

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((payload: RealtimePostgresChangesPayload<T>) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    setState((prev) => {
      let newData = [...prev.data];
      const optimisticKey = `${eventType}_${newRecord?.id || oldRecord?.id}`;

      // Check if this is resolving an optimistic update
      const wasOptimistic = prev.optimisticUpdates.has(optimisticKey);

      switch (eventType) {
        case 'INSERT':
          if (newRecord) {
            // Check for conflicts with optimistic updates
            const existingIndex = newData.findIndex((item) => item.id === newRecord.id);
            if (existingIndex >= 0 && !wasOptimistic) {
              // Conflict detected
              handleConflict(optimisticKey, newData[existingIndex], newRecord);
            } else {
              if (!wasOptimistic) {
                newData.push(newRecord);
              }
            }
          }
          break;

        case 'UPDATE':
          if (newRecord) {
            const index = newData.findIndex((item) => item.id === newRecord.id);
            if (index >= 0) {
              // Check for conflicts
              if (!wasOptimistic && hasConflict(newData[index], newRecord)) {
                handleConflict(optimisticKey, newData[index], newRecord);
              } else {
                newData[index] = newRecord;
              }
            }
          }
          break;

        case 'DELETE':
          if (oldRecord) {
            newData = newData.filter((item) => item.id !== oldRecord.id);
          }
          break;
      }

      // Remove from optimistic updates if it was optimistic
      const newOptimisticUpdates = new Set(prev.optimisticUpdates);
      if (wasOptimistic) {
        newOptimisticUpdates.delete(optimisticKey);
        optimisticOperationsRef.current.delete(optimisticKey);
      }

      return {
        ...prev,
        data: newData,
        lastUpdate: new Date(),
        optimisticUpdates: newOptimisticUpdates
      };
    });
  }, []);

  // Handle conflicts
  const handleConflict = useCallback((key: string, localData: T, serverData: T) => {
    if (options.conflictResolution === 'server') {
      // Server wins - do nothing, server data will be applied
      return;
    } else if (options.conflictResolution === 'client') {
      // Client wins - ignore server update
      return;
    } else {
      // Prompt user for resolution
      setState((prev) => ({
        ...prev,
        conflicts: new Map(prev.conflicts).set(key, { local: localData, server: serverData })
      }));

      // Auto-resolve after 30 seconds to server version
      const timeout = setTimeout(() => {
        resolveConflict(key, 'server');
      }, 30000);

      conflictTimeoutRef.current.set(key, timeout);
    }
  }, [options.conflictResolution]);

  // Check for conflicts
  const hasConflict = useCallback((localData: T, serverData: T): boolean => {
    // Simple conflict detection based on timestamps or version fields
    if ('updated_at' in localData && 'updated_at' in serverData) {
      return new Date(localData.updated_at as string) > new Date(serverData.updated_at as string);
    }
    return false;
  }, []);

  // Resolve conflicts
  const resolveConflict = useCallback((key: string, resolution: 'local' | 'server') => {
    setState((prev) => {
      const conflicts = new Map(prev.conflicts);
      const conflict = conflicts.get(key);

      if (conflict) {
        const data = [...prev.data];
        const resolvedData = resolution === 'local' ? conflict.local : conflict.server;
        const index = data.findIndex((item) => item.id === resolvedData.id);

        if (index >= 0) {
          data[index] = resolvedData;
        }

        conflicts.delete(key);

        // Clear timeout
        const timeout = conflictTimeoutRef.current.get(key);
        if (timeout) {
          clearTimeout(timeout);
          conflictTimeoutRef.current.delete(key);
        }

        return {
          ...prev,
          data,
          conflicts
        };
      }

      return prev;
    });
  }, []);

  // Optimistic update functions
  const optimisticInsert = useCallback((newData: Omit<T, 'id'>) => {
    if (!options.enableOptimisticUpdates) return;

    const tempId = Date.now(); // Temporary ID
    const optimisticData = { ...newData, id: tempId } as T;
    const operationKey = `INSERT_${tempId}`;

    setState((prev) => ({
      ...prev,
      data: [...prev.data, optimisticData],
      optimisticUpdates: new Set(prev.optimisticUpdates).add(operationKey)
    }));

    optimisticOperationsRef.current.set(operationKey, {
      id: operationKey,
      type: 'INSERT',
      data: optimisticData,
      timestamp: new Date()
    });

    // Remove optimistic update after timeout if not confirmed
    setTimeout(() => {
      if (optimisticOperationsRef.current.has(operationKey)) {
        setState((prev) => ({
          ...prev,
          data: prev.data.filter((item) => item.id !== tempId),
          optimisticUpdates: new Set([...prev.optimisticUpdates].filter((key) => key !== operationKey))
        }));
        optimisticOperationsRef.current.delete(operationKey);
      }
    }, 10000);
  }, [options.enableOptimisticUpdates]);

  const optimisticUpdate = useCallback((id: number, updates: Partial<T>) => {
    if (!options.enableOptimisticUpdates) return;

    const operationKey = `UPDATE_${id}`;

    setState((prev) => {
      const data = [...prev.data];
      const index = data.findIndex((item) => item.id === id);

      if (index >= 0) {
        data[index] = { ...data[index], ...updates };
      }

      return {
        ...prev,
        data,
        optimisticUpdates: new Set(prev.optimisticUpdates).add(operationKey)
      };
    });

    optimisticOperationsRef.current.set(operationKey, {
      id: operationKey,
      type: 'UPDATE',
      data: updates,
      timestamp: new Date()
    });
  }, [options.enableOptimisticUpdates]);

  const optimisticDelete = useCallback((id: number) => {
    if (!options.enableOptimisticUpdates) return;

    const operationKey = `DELETE_${id}`;

    setState((prev) => ({
      ...prev,
      data: prev.data.filter((item) => item.id !== id),
      optimisticUpdates: new Set(prev.optimisticUpdates).add(operationKey)
    }));

    optimisticOperationsRef.current.set(operationKey, {
      id: operationKey,
      type: 'DELETE',
      data: { id },
      timestamp: new Date()
    });
  }, [options.enableOptimisticUpdates]);

  // Subscribe to real-time updates
  const subscribe = useCallback(() => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const subscriptionKey = realtimeService.subscribe(
        options.table,
        handleRealtimeUpdate,
        '*',
        options.filter
      );

      subscriptionKeysRef.current.push(subscriptionKey);

      setState((prev) => ({ ...prev, loading: false }));

      return subscriptionKey;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to subscribe to real-time updates'
      }));
      return null;
    }
  }, [options.table, options.filter, handleRealtimeUpdate]);

  // Unsubscribe from real-time updates
  const unsubscribe = useCallback(() => {
    subscriptionKeysRef.current.forEach((key) => {
      realtimeService.unsubscribe(key);
    });
    subscriptionKeysRef.current = [];
  }, []);

  // Auto-subscribe if enabled
  useEffect(() => {
    if (options.autoSubscribe !== false) {
      subscribe();
    }

    return () => {
      unsubscribe();
      // Clear all timeouts
      conflictTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, [subscribe, unsubscribe, options.autoSubscribe]);

  // Update data externally
  const updateData = useCallback((newData: T[]) => {
    setState((prev) => ({
      ...prev,
      data: newData,
      lastUpdate: new Date()
    }));
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    unsubscribe();
    return subscribe();
  }, [subscribe, unsubscribe]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    refresh,
    updateData,
    optimisticInsert,
    optimisticUpdate,
    optimisticDelete,
    resolveConflict,
    hasOptimisticUpdates: state.optimisticUpdates.size > 0,
    hasConflicts: state.conflicts.size > 0,
    getOptimisticOperations: () => Array.from(optimisticOperationsRef.current.values())
  };
}

export default useRealtimeData;