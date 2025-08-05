const supabaseUrl = 'https://nehhjsiuhthflfwkfequ.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5laGhqc2l1aHRoZmxmd2tmZXF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxMzE3NSwiZXhwIjoyMDY4NTg5MTc1fQ.7naT6l_oNH8VI5MaEKgJ19PoYw1EErv6-ftkEin12wE';

// Mock Supabase client to prevent crashes when real client fails to load
const createMockClient = () => ({
  auth: {
    signUp: async () => ({ data: null, error: { message: 'Supabase not available' } }),
    signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not available' } }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: null }),
    updateUser: async () => ({ data: null, error: { message: 'Supabase not available' } }),
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => ({ 
      eq: () => ({ 
        single: async () => ({ data: null, error: { message: 'Supabase not available' } }),
        order: () => ({ eq: async () => ({ data: null, error: { message: 'Supabase not available' } }) })
      }) 
    }),
    insert: () => ({ 
      select: () => ({ 
        single: async () => ({ data: null, error: { message: 'Supabase not available' } })
      }) 
    }),
    update: () => ({ 
      eq: () => ({ 
        select: () => ({ 
          single: async () => ({ data: null, error: { message: 'Supabase not available' } })
        }) 
      }) 
    }),
    delete: () => ({ 
      eq: async () => ({ error: null }) 
    })
  }),
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: { message: 'Supabase not available' } }),
      download: async () => ({ data: null, error: { message: 'Supabase not available' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  }
});

// Initialize with mock client
let supabase: any = createMockClient();
let isSupabaseLoaded = false;

// Initialize Supabase asynchronously
const initializeSupabase = async () => {
  if (isSupabaseLoaded) return supabase;
  
  try {
    console.log('Loading Supabase client...');
    const module = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    const { createClient } = module;
    
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    
    isSupabaseLoaded = true;
    console.log('Supabase client loaded successfully');
    return supabase;
  } catch (error) {
    console.warn('Failed to load Supabase, using mock client:', error);
    return supabase; // Return mock client
  }
};

// Export the client and initialization function
export { supabase, initializeSupabase };

// Auth helper functions with initialization
export const auth = {
  signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
    const client = await initializeSupabase();
    return await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onauthsuccess`,
        data: metadata
      }
    });
  },

  signIn: async (email: string, password: string) => {
    const client = await initializeSupabase();
    return await client.auth.signInWithPassword({ email, password });
  },

  signOut: async () => {
    const client = await initializeSupabase();
    return await client.auth.signOut();
  },

  resetPassword: async (email: string) => {
    const client = await initializeSupabase();
    return await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/resetpassword`
    });
  },

  updatePassword: async (password: string) => {
    const client = await initializeSupabase();
    return await client.auth.updateUser({ password });
  },

  getSession: async () => {
    const client = await initializeSupabase();
    return await client.auth.getSession();
  },

  getUser: async () => {
    const client = await initializeSupabase();
    return await client.auth.getUser();
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    initializeSupabase().then(client => {
      return client.auth.onAuthStateChange(callback);
    });
  }
};

// Database helper functions
export const db = {
  select: async (table: string, query?: any) => {
    const client = await initializeSupabase();
    let request = client.from(table).select(query || '*');
    return await request;
  },

  insert: async (table: string, data: any) => {
    const client = await initializeSupabase();
    const { data: result, error } = await client.from(table).insert(data).select();
    return { data: result, error };
  },

  update: async (table: string, id: string, data: any) => {
    const client = await initializeSupabase();
    const { data: result, error } = await client.from(table).update(data).eq('id', id).select();
    return { data: result, error };
  },

  delete: async (table: string, id: string) => {
    const client = await initializeSupabase();
    const { error } = await client.from(table).delete().eq('id', id);
    return { error };
  }
};

// Storage helper functions
export const storage = {
  upload: async (bucket: string, path: string, file: File) => {
    const client = await initializeSupabase();
    return await client.storage.from(bucket).upload(path, file);
  },

  download: async (bucket: string, path: string) => {
    const client = await initializeSupabase();
    return await client.storage.from(bucket).download(path);
  },

  getPublicUrl: async (bucket: string, path: string) => {
    const client = await initializeSupabase();
    return client.storage.from(bucket).getPublicUrl(path);
  }
};

export default supabase;