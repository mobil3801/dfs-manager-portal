import { createClient } from '@supabase/supabase-js';

// Environment variable validation with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nehhjsiuhthflfwkfequ.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5laGhqc2l1aHRoZmxmd2tmZXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTMxNzUsImV4cCI6MjA2ODU4OTE3NX0.osjykkMo-WoYdRdh6quNu2F8DQHi5dN32JwSiaT5eLc';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database service functions with proper error handling
export const databaseService = {
  // Products
  async getProducts() {
    const { data, error } = await supabase.
    from('products').
    select('*').
    order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createProduct(product: any) {
    const { data, error } = await supabase.
    from('products').
    insert([product]).
    select().
    single();

    if (error) throw error;
    return data;
  },

  async updateProduct(id: number, updates: any) {
    const { data, error } = await supabase.
    from('products').
    update(updates).
    eq('id', id).
    select().
    single();

    if (error) throw error;
    return data;
  },

  async deleteProduct(id: number) {
    const { error } = await supabase.
    from('products').
    delete().
    eq('id', id);

    if (error) throw error;
  },

  // Employees
  async getEmployees() {
    const { data, error } = await supabase.
    from('employees').
    select(`
        *,
        stations(name, address, phone)
      `).
    order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createEmployee(employee: any) {
    const { data, error } = await supabase.
    from('employees').
    insert([employee]).
    select().
    single();

    if (error) throw error;
    return data;
  },

  async updateEmployee(id: number, updates: any) {
    const { data, error } = await supabase.
    from('employees').
    update(updates).
    eq('id', id).
    select().
    single();

    if (error) throw error;
    return data;
  },

  async deleteEmployee(id: number) {
    const { error } = await supabase.
    from('employees').
    delete().
    eq('id', id);

    if (error) throw error;
  },

  // Stations
  async getStations() {
    const { data, error } = await supabase.
    from('stations').
    select('*').
    order('name');

    if (error) throw error;
    return data || [];
  },

  // Licenses
  async getLicenses() {
    const { data, error } = await supabase.
    from('licenses').
    select('*').
    order('expiration_date');

    if (error) throw error;
    return data || [];
  },

  async createLicense(license: any) {
    const { data, error } = await supabase.
    from('licenses').
    insert([license]).
    select().
    single();

    if (error) throw error;
    return data;
  },

  async updateLicense(id: number, updates: any) {
    const { data, error } = await supabase.
    from('licenses').
    update(updates).
    eq('id', id).
    select().
    single();

    if (error) throw error;
    return data;
  },

  async deleteLicense(id: number) {
    const { error } = await supabase.
    from('licenses').
    delete().
    eq('id', id);

    if (error) throw error;
  },

  // Sales Reports
  async getSalesReports() {
    const { data, error } = await supabase.
    from('sales_reports').
    select(`
        *,
        stations(name, address, phone)
      `).
    order('report_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createSalesReport(report: any) {
    const { data, error } = await supabase.
    from('sales_reports').
    insert([report]).
    select().
    single();

    if (error) throw error;
    return data;
  },

  async updateSalesReport(id: number, updates: any) {
    const { data, error } = await supabase.
    from('sales_reports').
    update(updates).
    eq('id', id).
    select().
    single();

    if (error) throw error;
    return data;
  },

  async deleteSalesReport(id: number) {
    const { error } = await supabase.
    from('sales_reports').
    delete().
    eq('id', id);

    if (error) throw error;
  },

  // Deliveries
  async getDeliveries() {
    const { data, error } = await supabase.
    from('deliveries').
    select(`
        *,
        stations(name, address, phone)
      `).
    order('delivery_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createDelivery(delivery: any) {
    const { data, error } = await supabase.
    from('deliveries').
    insert([delivery]).
    select().
    single();

    if (error) throw error;
    return data;
  },

  async updateDelivery(id: number, updates: any) {
    const { data, error } = await supabase.
    from('deliveries').
    update(updates).
    eq('id', id).
    select().
    single();

    if (error) throw error;
    return data;
  },

  async deleteDelivery(id: number) {
    const { error } = await supabase.
    from('deliveries').
    delete().
    eq('id', id);

    if (error) throw error;
  },

  // User Profile Management
  async getUserProfile(userId?: string) {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      userId = user.id;
    }

    const { data, error } = await supabase.
    from('user_profiles').
    select(`
        *,
        stations(name, address, phone)
      `).
    eq('user_id', userId).
    single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createUserProfile(userId: string, profileData: any) {
    const { data, error } = await supabase.
    from('user_profiles').
    insert([{
      user_id: userId,
      ...profileData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]).
    select(`
        *,
        stations(name, address, phone)
      `).
    single();

    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase.
    from('user_profiles').
    update({
      ...updates,
      updated_at: new Date().toISOString()
    }).
    eq('user_id', userId).
    select(`
        *,
        stations(name, address, phone)
      `).
    single();

    if (error) throw error;
    return data;
  }
};

// Storage service
export const storageService = {
  async uploadFile(file: File, bucket: string, path: string) {
    const { data, error } = await supabase.storage.
    from(bucket).
    upload(path, file);

    if (error) throw error;
    return data;
  },

  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage.
    from(bucket).
    remove([path]);

    if (error) throw error;
  },

  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.
    from(bucket).
    getPublicUrl(path);

    return data.publicUrl;
  }
};

// Comprehensive Auth service
export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, userData?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/onauthsuccess`
      }
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  onAuthStateChange(callback: (event: any, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async refreshSession() {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return session;
  }
};

// Export default client
export default supabase;