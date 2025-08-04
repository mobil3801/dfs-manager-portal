import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nehhjsiuhthflfwkfequ.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5laGhqc2l1aHRoZmxmd2tmZXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTMxNzUsImV4cCI6MjA2ODU4OTE3NX0.N5_BFIRPavCz0f-C7GxOGFnNfhE9dALJmhxYzxhqCwQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Helper function to ensure proper error handling
export const handleSupabaseError = (error: any) => {
  if (error) {
    console.error('Supabase Error:', error);
    throw new Error(error.message || 'Database operation failed');
  }
};

// Helper function for safe database operations
export const safeSupabaseOperation = async <T,>(
  operation: () => Promise<{data: T; error: any;}>
): Promise<T> => {
  try {
    const { data, error } = await operation();
    handleSupabaseError(error);
    return data;
  } catch (err) {
    console.error('Database operation failed:', err);
    throw err;
  }
};

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};