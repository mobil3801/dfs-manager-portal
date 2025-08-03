import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

const supabaseUrl = 'https://nehhjsiuhthflfwkfequ.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5laGhqc2l1aHRoZmxmd2tmZXF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxMzE3NSwiZXhwIjoyMDY4NTg5MTc1fQ.7naT6l_oNH8VI5MaEKgJ19PoYw1EErv6-ftkEin12wE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'dfs-manager-portal'
    }
  }
});

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onauthsuccess`,
        data: metadata
      }
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/resetpassword`
    });
    return { data, error };
  },

  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password
    });
    return { data, error };
  }
};

// Database helper functions
export const db = {
  // Generic CRUD operations
  select: async (table: string, query?: any) => {
    let request = supabase.from(table).select(query || '*');
    return await request;
  },

  insert: async (table: string, data: any) => {
    const { data: result, error } = await supabase.
    from(table).
    insert(data).
    select();
    return { data: result, error };
  },

  update: async (table: string, id: string, data: any) => {
    const { data: result, error } = await supabase.
    from(table).
    update(data).
    eq('id', id).
    select();
    return { data: result, error };
  },

  delete: async (table: string, id: string) => {
    const { error } = await supabase.
    from(table).
    delete().
    eq('id', id);
    return { error };
  },

  // Specific queries
  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase.
    from('user_profiles').
    select(`
        *,
        stations(name, address, phone)
      `).
    eq('user_id', userId).
    single();
    return { data, error };
  },

  getStations: async () => {
    const { data, error } = await supabase.
    from('stations').
    select('*').
    eq('is_active', true).
    order('name');
    return { data, error };
  }
};

// Storage helper functions
export const storage = {
  upload: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage.
    from(bucket).
    upload(path, file);
    return { data, error };
  },

  download: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage.
    from(bucket).
    download(path);
    return { data, error };
  },

  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage.
    from(bucket).
    getPublicUrl(path);
    return data;
  },

  delete: async (bucket: string, paths: string[]) => {
    const { data, error } = await supabase.storage.
    from(bucket).
    remove(paths);
    return { data, error };
  }
};

// Real-time subscriptions
export const realtime = {
  subscribe: (table: string, callback: (payload: any) => void) => {
    const channel = supabase.
    channel(`${table}_changes`).
    on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table
      },
      callback
    ).
    subscribe();

    return channel;
  },

  unsubscribe: (channel: any) => {
    return supabase.removeChannel(channel);
  }
};

export default supabase;