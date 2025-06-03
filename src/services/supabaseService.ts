import { supabase, type Database } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Generic types for database operations
type TableName = keyof Database['public']['Tables'];
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

// Real-time subscription manager
class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();

  subscribe<T extends TableName>(
  table: T,
  callback: (payload: any) => void,
  filters?: {column: string;eq: string | number;}[])
  : () => void {
    const channelName = `${table}_${Date.now()}`;

    let subscription = supabase.
    channel(channelName).
    on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table as string,
        ...(filters && { filter: filters.map((f) => `${f.column}=eq.${f.eq}`).join(',') })
      },
      callback
    );

    subscription.subscribe();
    this.channels.set(channelName, subscription);

    // Return unsubscribe function
    return () => {
      const channel = this.channels.get(channelName);
      if (channel) {
        supabase.removeChannel(channel);
        this.channels.delete(channelName);
      }
    };
  }

  unsubscribeAll() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

export const realtimeManager = new RealtimeManager();

// Generic CRUD operations
export class SupabaseService {
  // Create (Insert)
  static async create<T extends TableName>(
  table: T,
  data: TableInsert<T>)
  : Promise<{data: TableRow<T> | null;error: string | null;}> {
    try {
      const { data: result, error } = await supabase.
      from(table).
      insert(data as any).
      select().
      single();

      if (error) {
        console.error(`Error creating ${table}:`, error);
        return { data: null, error: error.message };
      }

      return { data: result, error: null };
    } catch (err) {
      console.error(`Error creating ${table}:`, err);
      return { data: null, error: 'An unexpected error occurred' };
    }
  }

  // Read (Select with pagination)
  static async read<T extends TableName>(
  table: T,
  options: {
    page?: number;
    pageSize?: number;
    orderBy?: keyof TableRow<T>;
    ascending?: boolean;
    filters?: {column: keyof TableRow<T>;operator: string;value: any;}[];
    select?: string;
  } = {})
  : Promise<{
    data: TableRow<T>[] | null;
    count: number | null;
    error: string | null;
  }> {
    try {
      const {
        page = 1,
        pageSize = 10,
        orderBy = 'id' as keyof TableRow<T>,
        ascending = false,
        filters = [],
        select = '*'
      } = options;

      let query = supabase.
      from(table).
      select(select, { count: 'exact' });

      // Apply filters
      filters.forEach((filter) => {
        const { column, operator, value } = filter;
        switch (operator.toLowerCase()) {
          case 'eq':
            query = query.eq(column as string, value);
            break;
          case 'neq':
            query = query.neq(column as string, value);
            break;
          case 'gt':
            query = query.gt(column as string, value);
            break;
          case 'gte':
            query = query.gte(column as string, value);
            break;
          case 'lt':
            query = query.lt(column as string, value);
            break;
          case 'lte':
            query = query.lte(column as string, value);
            break;
          case 'like':
            query = query.like(column as string, `%${value}%`);
            break;
          case 'ilike':
            query = query.ilike(column as string, `%${value}%`);
            break;
          default:
            query = query.eq(column as string, value);
        }
      });

      // Apply ordering
      query = query.order(orderBy as string, { ascending });

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) {
        console.error(`Error reading ${table}:`, error);
        return { data: null, count: null, error: error.message };
      }

      return { data, count, error: null };
    } catch (err) {
      console.error(`Error reading ${table}:`, err);
      return { data: null, count: null, error: 'An unexpected error occurred' };
    }
  }

  // Update
  static async update<T extends TableName>(
  table: T,
  id: number,
  data: TableUpdate<T>)
  : Promise<{data: TableRow<T> | null;error: string | null;}> {
    try {
      const { data: result, error } = await supabase.
      from(table).
      update(data as any).
      eq('id', id).
      select().
      single();

      if (error) {
        console.error(`Error updating ${table}:`, error);
        return { data: null, error: error.message };
      }

      return { data: result, error: null };
    } catch (err) {
      console.error(`Error updating ${table}:`, err);
      return { data: null, error: 'An unexpected error occurred' };
    }
  }

  // Delete
  static async delete<T extends TableName>(
  table: T,
  id: number)
  : Promise<{error: string | null;}> {
    try {
      const { error } = await supabase.
      from(table).
      delete().
      eq('id', id);

      if (error) {
        console.error(`Error deleting from ${table}:`, error);
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      console.error(`Error deleting from ${table}:`, err);
      return { error: 'An unexpected error occurred' };
    }
  }

  // Batch operations
  static async batchCreate<T extends TableName>(
  table: T,
  data: TableInsert<T>[])
  : Promise<{data: TableRow<T>[] | null;error: string | null;}> {
    try {
      const { data: result, error } = await supabase.
      from(table).
      insert(data as any).
      select();

      if (error) {
        console.error(`Error batch creating ${table}:`, error);
        return { data: null, error: error.message };
      }

      return { data: result, error: null };
    } catch (err) {
      console.error(`Error batch creating ${table}:`, err);
      return { data: null, error: 'An unexpected error occurred' };
    }
  }

  static async batchUpdate<T extends TableName>(
  table: T,
  updates: {id: number;data: TableUpdate<T>;}[])
  : Promise<{data: TableRow<T>[] | null;error: string | null;}> {
    try {
      const results = await Promise.all(
        updates.map(({ id, data }) => this.update(table, id, data))
      );

      const errors = results.filter((r) => r.error).map((r) => r.error);
      if (errors.length > 0) {
        return { data: null, error: errors.join(', ') };
      }

      const data = results.map((r) => r.data).filter(Boolean) as TableRow<T>[];
      return { data, error: null };
    } catch (err) {
      console.error(`Error batch updating ${table}:`, err);
      return { data: null, error: 'An unexpected error occurred' };
    }
  }

  static async batchDelete<T extends TableName>(
  table: T,
  ids: number[])
  : Promise<{error: string | null;}> {
    try {
      const { error } = await supabase.
      from(table).
      delete().
      in('id', ids);

      if (error) {
        console.error(`Error batch deleting from ${table}:`, error);
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      console.error(`Error batch deleting from ${table}:`, err);
      return { error: 'An unexpected error occurred' };
    }
  }

  // File upload
  static async uploadFile(
  bucket: string,
  path: string,
  file: File)
  : Promise<{data: {path: string;} | null;error: string | null;}> {
    try {
      const { data, error } = await supabase.storage.
      from(bucket).
      upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

      if (error) {
        console.error('Error uploading file:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error uploading file:', err);
      return { data: null, error: 'An unexpected error occurred' };
    }
  }

  // Get file URL
  static getFileUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.
    from(bucket).
    getPublicUrl(path);

    return data.publicUrl;
  }
}