import { supabase } from '@/lib/supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface SubscriptionConfig {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  callback: (payload: RealtimePostgresChangesPayload<any>) => void;
}

interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  lastConnected: Date | null;
  connectionCount: number;
  subscriptionCount: number;
}

class SupabaseRealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscriptions: Map<string, SubscriptionConfig> = new Map();
  private connectionListeners: ((status: ConnectionStatus) => void)[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  private connectionStatus: ConnectionStatus = {
    connected: false,
    reconnecting: false,
    lastConnected: null,
    connectionCount: 0,
    subscriptionCount: 0
  };

  constructor() {
    this.initializeConnection();
    this.startHeartbeat();
  }

  private initializeConnection() {
    // Listen to connection status changes
    supabase.realtime.onOpen(() => {
      console.log('Supabase Realtime connected');
      this.connectionStatus.connected = true;
      this.connectionStatus.reconnecting = false;
      this.connectionStatus.lastConnected = new Date();
      this.connectionStatus.connectionCount++;
      this.reconnectAttempts = 0;
      this.notifyConnectionListeners();
    });

    supabase.realtime.onClose(() => {
      console.log('Supabase Realtime disconnected');
      this.connectionStatus.connected = false;
      this.handleDisconnection();
    });

    supabase.realtime.onError((error) => {
      console.error('Supabase Realtime error:', error);
      this.connectionStatus.connected = false;
      this.handleDisconnection();
    });
  }

  private async handleDisconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.connectionStatus.reconnecting = true;
      this.notifyConnectionListeners();
      
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.reconnectAllSubscriptions();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    } else {
      console.error('Max reconnection attempts reached');
      this.connectionStatus.reconnecting = false;
      this.notifyConnectionListeners();
    }
  }

  private async reconnectAllSubscriptions() {
    // Remove all existing channels
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();

    // Recreate all subscriptions
    const subscriptionsArray = Array.from(this.subscriptions.entries());
    for (const [key, config] of subscriptionsArray) {
      await this.subscribe(config.table, config.callback, config.event, config.filter, key);
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      // Check connection status
      if (this.connectionStatus.connected) {
        // Update subscription count
        this.connectionStatus.subscriptionCount = this.channels.size;
        this.notifyConnectionListeners();
      }
    }, 5000);
  }

  private notifyConnectionListeners() {
    this.connectionListeners.forEach(listener => {
      try {
        listener({ ...this.connectionStatus });
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  public subscribe(
    table: string,
    callback: (payload: RealtimePostgresChangesPayload<any>) => void,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
    filter?: string,
    customKey?: string
  ): string {
    const key = customKey || `${table}_${event}_${filter || 'all'}_${Date.now()}`;
    
    try {
      // Remove existing subscription if it exists
      if (this.subscriptions.has(key)) {
        this.unsubscribe(key);
      }

      const config: SubscriptionConfig = {
        table,
        event,
        filter,
        callback: (payload) => {
          try {
            callback(payload);
          } catch (error) {
            console.error('Error in subscription callback:', error);
          }
        }
      };

      let channel = supabase
        .channel(`realtime:${key}`)
        .on(
          'postgres_changes',
          {
            event,
            schema: 'public',
            table,
            ...(filter && { filter })
          },
          config.callback
        );

      channel.subscribe((status) => {
        console.log(`Subscription ${key} status:`, status);
        if (status === 'SUBSCRIBED') {
          this.connectionStatus.subscriptionCount = this.channels.size;
          this.notifyConnectionListeners();
        }
      });

      this.channels.set(key, channel);
      this.subscriptions.set(key, config);

      console.log(`Subscribed to ${table} with key: ${key}`);
      return key;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  public unsubscribe(key: string): void {
    try {
      const channel = this.channels.get(key);
      if (channel) {
        supabase.removeChannel(channel);
        this.channels.delete(key);
        this.subscriptions.delete(key);
        this.connectionStatus.subscriptionCount = this.channels.size;
        this.notifyConnectionListeners();
        console.log(`Unsubscribed from: ${key}`);
      }
    } catch (error) {
      console.error('Error removing subscription:', error);
    }
  }

  public unsubscribeAll(): void {
    try {
      this.channels.forEach((channel, key) => {
        supabase.removeChannel(channel);
        console.log(`Unsubscribed from: ${key}`);
      });
      this.channels.clear();
      this.subscriptions.clear();
      this.connectionStatus.subscriptionCount = 0;
      this.notifyConnectionListeners();
    } catch (error) {
      console.error('Error removing all subscriptions:', error);
    }
  }

  public getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  public onConnectionChange(listener: (status: ConnectionStatus) => void): () => void {
    this.connectionListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionListeners.indexOf(listener);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  public getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  public getSubscriptionDetails(key: string): SubscriptionConfig | undefined {
    return this.subscriptions.get(key);
  }

  // Enhanced subscription methods for specific use cases
  public subscribeToTable(
    table: string,
    callbacks: {
      onInsert?: (payload: any) => void;
      onUpdate?: (payload: any) => void;
      onDelete?: (payload: any) => void;
    }
  ): string[] {
    const keys: string[] = [];

    if (callbacks.onInsert) {
      keys.push(this.subscribe(table, callbacks.onInsert, 'INSERT'));
    }
    if (callbacks.onUpdate) {
      keys.push(this.subscribe(table, callbacks.onUpdate, 'UPDATE'));
    }
    if (callbacks.onDelete) {
      keys.push(this.subscribe(table, callbacks.onDelete, 'DELETE'));
    }

    return keys;
  }

  public subscribeToUserData(
    userId: number,
    tables: string[],
    callback: (payload: RealtimePostgresChangesPayload<any>) => void
  ): string[] {
    return tables.map(table => 
      this.subscribe(table, callback, '*', `created_by=eq.${userId}`)
    );
  }

  public subscribeToStation(
    station: string,
    tables: string[],
    callback: (payload: RealtimePostgresChangesPayload<any>) => void
  ): string[] {
    return tables.map(table => 
      this.subscribe(table, callback, '*', `station=eq.${station}`)
    );
  }

  public destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.unsubscribeAll();
    this.connectionListeners = [];
  }
}

// Create singleton instance
export const realtimeService = new SupabaseRealtimeService();

// Export types
export type { ConnectionStatus, SubscriptionConfig };
export default realtimeService;