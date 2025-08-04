import { supabase } from '@/lib/supabase';

// User Profile Service
export const userProfileService = {
  getUserProfileByUserId: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          stations(name, address, phone)
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return { data: null, error: { message: 'No rows found' } };
        }
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      return { data: null, error };
    }
  },

  createUserProfile: async (userId: string, profileData: any) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          ...profileData
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      return { data: null, error };
    }
  },

  updateUserProfile: async (userId: string, profileData: any) => {
    try {
      const { data, error } = await supabase.
      from('user_profiles').
      update(profileData).
      eq('user_id', userId).
      select().
      single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      return { data: null, error };
    }
  }
};

// Audit Log Service
export const auditLogService = {
  logActivity: async (
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  oldValues?: any,
  newValues?: any) =>
  {
    try {
      const { data, error } = await supabase.
      from('audit_logs').
      insert({
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        old_values: oldValues,
        new_values: newValues,
        timestamp: new Date().toISOString()
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.warn('Failed to log audit activity:', error);
      // Don't throw - audit logging failures shouldn't break functionality
      return { data: null, error };
    }
  }
};

// Station Service
export const stationService = {
  getAllStations: async () => {
    try {
      const { data, error } = await supabase.
      from('stations').
      select('*').
      eq('is_active', true).
      order('name');

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching stations:', error);
      return { data: null, error };
    }
  },

  getStationById: async (stationId: string) => {
    try {
      const { data, error } = await supabase.
      from('stations').
      select('*').
      eq('id', stationId).
      single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching station:', error);
      return { data: null, error };
    }
  }
};

// Generic database operations
export const databaseService = {
  // Generic select
  select: async (table: string, columns = '*', filters?: any) => {
    try {
      let query = supabase.from(table).select(columns);

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error(`Error selecting from ${table}:`, error);
      return { data: null, error };
    }
  },

  // Generic insert
  insert: async (table: string, data: any) => {
    try {
      const { data: result, error } = await supabase.
      from(table).
      insert(data).
      select();

      if (error) throw error;

      return { data: result, error: null };
    } catch (error: any) {
      console.error(`Error inserting into ${table}:`, error);
      return { data: null, error };
    }
  },

  // Generic update
  update: async (table: string, id: string, data: any) => {
    try {
      const { data: result, error } = await supabase.
      from(table).
      update(data).
      eq('id', id).
      select();

      if (error) throw error;

      return { data: result, error: null };
    } catch (error: any) {
      console.error(`Error updating ${table}:`, error);
      return { data: null, error };
    }
  },

  // Generic delete
  delete: async (table: string, id: string) => {
    try {
      const { error } = await supabase.
      from(table).
      delete().
      eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error(`Error deleting from ${table}:`, error);
      return { error };
    }
  }
};

export default {
  userProfileService,
  auditLogService,
  stationService,
  databaseService
};