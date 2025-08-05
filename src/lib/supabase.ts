import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://nehhjsiuhthflfwkfequ.supabase.co';
// Using the service role key for this production environment
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5laGhqc2l1aHRoZmxmd2tmZXF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxMzE3NSwiZXhwIjoyMDY4NTg5MTc1fQ.7naT6l_oNH8VI5MaEKgJ19PoYw1EErv6-ftkEin12wE';

// Create the Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'dfs-manager-auth'
  },
  global: {
    headers: {
      'X-Client-Info': 'dfs-manager-portal@1.0.0'
    }
  }
});

// Auth helper functions with improved error handling
export const auth = {
  signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      return await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onauthsuccess`,
          data: metadata || {}
        }
      });
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      return await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
    } catch (error) {
      console.error('SignIn error:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      return await supabase.auth.signOut();
    } catch (error) {
      console.error('SignOut error:', error);
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    try {
      return await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  updatePassword: async (password: string) => {
    try {
      return await supabase.auth.updateUser({ password });
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  },

  getSession: async () => {
    try {
      return await supabase.auth.getSession();
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  },

  getUser: async () => {
    try {
      return await supabase.auth.getUser();
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helper functions with error handling
export const db = {
  select: async (table: string, columns = '*') => {
    try {
      return await supabase.from(table).select(columns);
    } catch (error) {
      console.error(`Database select error for table ${table}:`, error);
      throw error;
    }
  },

  insert: async (table: string, data: any) => {
    try {
      return await supabase.from(table).insert(data).select();
    } catch (error) {
      console.error(`Database insert error for table ${table}:`, error);
      throw error;
    }
  },

  update: async (table: string, id: string, data: any) => {
    try {
      return await supabase.from(table).update(data).eq('id', id).select();
    } catch (error) {
      console.error(`Database update error for table ${table}:`, error);
      throw error;
    }
  },

  upsert: async (table: string, data: any) => {
    try {
      return await supabase.from(table).upsert(data).select();
    } catch (error) {
      console.error(`Database upsert error for table ${table}:`, error);
      throw error;
    }
  },

  delete: async (table: string, id: string) => {
    try {
      return await supabase.from(table).delete().eq('id', id);
    } catch (error) {
      console.error(`Database delete error for table ${table}:`, error);
      throw error;
    }
  }
};

// Storage helper functions - using empty bucket name as per requirements
export const storage = {
  upload: async (path: string, file: File) => {
    try {
      return await supabase.storage.from('').upload(path, file);
    } catch (error) {
      console.error(`Storage upload error for path ${path}:`, error);
      throw error;
    }
  },

  download: async (path: string) => {
    try {
      return await supabase.storage.from('').download(path);
    } catch (error) {
      console.error(`Storage download error for path ${path}:`, error);
      throw error;
    }
  },

  getPublicUrl: (path: string) => {
    try {
      return supabase.storage.from('').getPublicUrl(path);
    } catch (error) {
      console.error(`Storage getPublicUrl error for path ${path}:`, error);
      throw error;
    }
  },

  remove: async (paths: string[]) => {
    try {
      return await supabase.storage.from('').remove(paths);
    } catch (error) {
      console.error(`Storage remove error for paths ${paths}:`, error);
      throw error;
    }
  }
};

export default supabase;