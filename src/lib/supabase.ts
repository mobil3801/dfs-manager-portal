import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://nehhjsiuhthflfwkfequ.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5laGhqc2l1aHRoZmxmd2tmZXF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxMzE3NSwiZXhwIjoyMDY4NTg5MTc1fQ.7naT6l_oNH8VI5MaEKgJ19PoYw1EErv6-ftkEin12wE'

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onauthsuccess`,
        data: metadata
      }
    })
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  },

  signOut: async () => {
    return await supabase.auth.signOut()
  },

  resetPassword: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/resetpassword`
    })
  },

  updatePassword: async (password: string) => {
    return await supabase.auth.updateUser({ password })
  },

  getSession: async () => {
    return await supabase.auth.getSession()
  },

  getUser: async () => {
    return await supabase.auth.getUser()
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper functions
export const db = {
  select: async (table: string, columns = '*') => {
    return await supabase.from(table).select(columns)
  },

  insert: async (table: string, data: any) => {
    return await supabase.from(table).insert(data).select()
  },

  update: async (table: string, id: string, data: any) => {
    return await supabase.from(table).update(data).eq('id', id).select()
  },

  upsert: async (table: string, data: any) => {
    return await supabase.from(table).upsert(data).select()
  },

  delete: async (table: string, id: string) => {
    return await supabase.from(table).delete().eq('id', id)
  }
}

// Storage helper functions - using empty bucket name as per requirements
export const storage = {
  upload: async (path: string, file: File) => {
    return await supabase.storage.from('').upload(path, file)
  },

  download: async (path: string) => {
    return await supabase.storage.from('').download(path)
  },

  getPublicUrl: (path: string) => {
    return supabase.storage.from('').getPublicUrl(path)
  },

  remove: async (paths: string[]) => {
    return await supabase.storage.from('').remove(paths)
  }
}

export default supabase
