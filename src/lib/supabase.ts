import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nehhjsiuhthflfwkfequ.supabase.co';
// Use the anon key for client-side authentication
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5laGhqc2l1aHRoZmxmd2tmZXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTMxNzUsImV4cCI6MjA2ODU4OTE3NX0.bpinWqPKNpyQTLfJV0w38j1rDCKuKYXWCxJ9b2EJfuI';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
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
operation: () => Promise<{data: T;error: any;}>)
: Promise<T> => {
  try {
    const { data, error } = await operation();
    handleSupabaseError(error);
    return data;
  } catch (err) {
    console.error('Database operation failed:', err);
    throw err;
  }
};