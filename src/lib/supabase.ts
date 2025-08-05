import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://nehhjsiuhthflfwkfequ.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5laGhqc2l1aHRoZmxmd2tmZXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTMxNzUsImV4cCI6MjA2ODU4OTE3NX0.osjykkMo-WoYdRdh6quNu2F8DQHi5dN32JwSiaT5eLc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database service functions
export const databaseService = {
  // Vendors
  async getVendors() {
    const { data, error } = await supabase.
    from('vendors').
    select('*').
    order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createVendor(vendor: any) {
    const { data, error } = await supabase.
    from('vendors').
    insert([vendor]).
    select().
    single();

    if (error) throw error;
    return data;
  },

  async updateVendor(id: number, updates: any) {
    const { data, error } = await supabase.
    from('vendors').
    update(updates).
    eq('id', id).
    select().
    single();

    if (error) throw error;
    return data;
  },

  async deleteVendor(id: number) {
    const { error } = await supabase.
    from('vendors').
    delete().
    eq('id', id);

    if (error) throw error;
  },

  // Orders
  async getOrders() {
    const { data, error } = await supabase.
    from('order_summary').
    select('*').
    order('order_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createOrder(order: any) {
    const { data, error } = await supabase.
    from('orders').
    insert([order]).
    select().
    single();

    if (error) throw error;
    return data;
  },

  async updateOrder(id: number, updates: any) {
    const { data, error } = await supabase.
    from('orders').
    update(updates).
    eq('id', id).
    select().
    single();

    if (error) throw error;
    return data;
  },

  async deleteOrder(id: number) {
    const { error } = await supabase.
    from('orders').
    delete().
    eq('id', id);

    if (error) throw error;
  },

  // Salaries
  async getSalaries(employeeId?: number) {
    let query = supabase.
    from('salaries').
    select(`
        *,
        employee:employees(name, employee_id),
        station:stations(name)
      `).
    order('pay_period_start', { ascending: false });

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async createSalary(salary: any) {
    const { data, error } = await supabase.
    from('salaries').
    insert([salary]).
    select().
    single();

    if (error) throw error;
    return data;
  },

  async updateSalary(id: number, updates: any) {
    const { data, error } = await supabase.
    from('salaries').
    update(updates).
    eq('id', id).
    select().
    single();

    if (error) throw error;
    return data;
  },

  async deleteSalary(id: number) {
    const { error } = await supabase.
    from('salaries').
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
        station:stations(name)
      `).
    order('created_at', { ascending: false });

    if (error) throw error;
    return data;
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

  // Products
  async getProducts() {
    const { data, error } = await supabase.
    from('products').
    select('*').
    order('created_at', { ascending: false });

    if (error) throw error;
    return data;
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

  // Stations
  async getStations() {
    const { data, error } = await supabase.
    from('stations').
    select('*').
    order('name');

    if (error) throw error;
    return data;
  },

  // Licenses
  async getLicenses() {
    const { data, error } = await supabase.
    from('licenses').
    select('*').
    order('expiration_date');

    if (error) throw error;
    return data;
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
        station:stations(name)
      `).
    order('report_date', { ascending: false });

    if (error) throw error;
    return data;
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
        station:stations(name)
      `).
    order('delivery_date', { ascending: false });

    if (error) throw error;
    return data;
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

  // File uploads
  async uploadFile(file: File, path: string, bucket = 'documents') {
    const { data, error } = await supabase.storage.
    from(bucket).
    upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

    if (error) throw error;

    // Record file upload in database
    const { data: fileRecord, error: dbError } = await supabase.
    from('file_uploads').
    insert([{
      file_name: path.split('/').pop(),
      original_name: file.name,
      file_path: path,
      file_size: file.size,
      file_type: file.type,
      mime_type: file.type,
      bucket_name: bucket
    }]).
    select().
    single();

    if (dbError) throw dbError;

    return { storage: data, record: fileRecord };
  },

  async getFileUrl(bucket: string, path: string) {
    const { data } = supabase.storage.
    from(bucket).
    getPublicUrl(path);

    return data.publicUrl;
  },

  // User management
  async getUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase.
    from('user_profiles').
    select('*').
    eq('user_id', user.id).
    single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateUserProfile(updates: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase.
    from('user_profiles').
    upsert([{
      user_id: user.id,
      ...updates,
      updated_at: new Date().toISOString()
    }]).
    select().
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

// Auth service
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
        data: userData
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
    const { error } = await supabase.auth.resetPasswordForEmail(email);
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
  }
};