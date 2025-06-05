import { supabase, Database, getCurrentUser } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Comprehensive Supabase service layer to replace window.ezsite.apis
export class SupabaseService {
  private realtimeChannels: Map<string, RealtimeChannel> = new Map();

  // Authentication methods
  async register(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onauthsuccess`
        }
      });

      if (error) throw new Error(error.message);

      return { data, error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Registration failed' };
    }
  }

  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw new Error(error.message);

      // Create user profile if it doesn't exist
      if (data.user) {
        await this.ensureUserProfile(data.user.id, email);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Login failed' };
    }
  }

  async logout() {
    try {
      // Clean up realtime subscriptions
      this.cleanup();

      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);

      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
      return { error: error instanceof Error ? error.message : 'Logout failed' };
    }
  }

  async getUserInfo() {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return { data: null, error: 'No authenticated user' };
      }

      // Get user profile with additional information
      const { data: profile } = await supabase.
      from('user_profiles').
      select('*').
      eq('user_id', user.id).
      single();

      const userInfo = {
        ID: user.id,
        Name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        Email: user.email || '',
        CreateTime: user.created_at,
        Profile: profile
      };

      return { data: userInfo, error: null };
    } catch (error) {
      console.error('Get user info error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to get user info' };
    }
  }

  async sendResetPwdEmail(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/resetpassword`
      });

      if (error) throw new Error(error.message);

      return { error: null };
    } catch (error) {
      console.error('Reset password email error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to send reset email' };
    }
  }

  async resetPassword(token: string, password: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) throw new Error(error.message);

      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to reset password' };
    }
  }

  // Database operations
  async tablePage<T extends keyof Database['public']['Tables']>(
  table: T,
  params: {
    PageNo: number;
    PageSize: number;
    OrderByField?: string;
    IsAsc?: boolean;
    Filters?: Array<{
      name: string;
      op: 'Equal' | 'GreaterThan' | 'GreaterThanOrEqual' | 'LessThan' | 'LessThanOrEqual' | 'StringContains' | 'StringStartsWith' | 'StringEndsWith';
      value: any;
    }>;
  })
  {
    try {
      let query = supabase.from(table).select('*', { count: 'exact' });

      // Apply filters
      if (params.Filters) {
        params.Filters.forEach((filter) => {
          switch (filter.op) {
            case 'Equal':
              query = query.eq(filter.name, filter.value);
              break;
            case 'GreaterThan':
              query = query.gt(filter.name, filter.value);
              break;
            case 'GreaterThanOrEqual':
              query = query.gte(filter.name, filter.value);
              break;
            case 'LessThan':
              query = query.lt(filter.name, filter.value);
              break;
            case 'LessThanOrEqual':
              query = query.lte(filter.name, filter.value);
              break;
            case 'StringContains':
              query = query.ilike(filter.name, `%${filter.value}%`);
              break;
            case 'StringStartsWith':
              query = query.ilike(filter.name, `${filter.value}%`);
              break;
            case 'StringEndsWith':
              query = query.ilike(filter.name, `%${filter.value}`);
              break;
          }
        });
      }

      // Apply ordering
      if (params.OrderByField) {
        query = query.order(params.OrderByField, { ascending: params.IsAsc ?? true });
      }

      // Apply pagination
      const from = (params.PageNo - 1) * params.PageSize;
      const to = from + params.PageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw new Error(error.message);

      return {
        data: {
          List: data || [],
          VirtualCount: count || 0
        },
        error: null
      };
    } catch (error) {
      console.error(`Table page error for ${table}:`, error);
      return {
        data: { List: [], VirtualCount: 0 },
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      };
    }
  }

  async tableCreate<T extends keyof Database['public']['Tables']>(
  table: T,
  data: Database['public']['Tables'][T]['Insert'])
  {
    try {
      // Add created_by field if it exists and user is authenticated
      const user = await getCurrentUser();
      if (user && 'created_by' in data) {
        (data as any).created_by = user.id;
      }

      const { data: result, error } = await supabase.
      from(table).
      insert(data).
      select().
      single();

      if (error) throw new Error(error.message);

      // Log the action
      await this.logAuditEvent('Data Creation', table, 'create', result);

      return { data: result, error: null };
    } catch (error) {
      console.error(`Table create error for ${table}:`, error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create record' };
    }
  }

  async tableUpdate<T extends keyof Database['public']['Tables']>(
  table: T,
  data: Database['public']['Tables'][T]['Update'] & {id: number;})
  {
    try {
      const { id, ...updateData } = data;

      const { data: result, error } = await supabase.
      from(table).
      update(updateData).
      eq('id', id).
      select().
      single();

      if (error) throw new Error(error.message);

      // Log the action
      await this.logAuditEvent('Data Modification', table, 'update', result);

      return { data: result, error: null };
    } catch (error) {
      console.error(`Table update error for ${table}:`, error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update record' };
    }
  }

  async tableDelete<T extends keyof Database['public']['Tables']>(
  table: T,
  params: {id: number;})
  {
    try {
      const { error } = await supabase.
      from(table).
      delete().
      eq('id', params.id);

      if (error) throw new Error(error.message);

      // Log the action
      await this.logAuditEvent('Data Deletion', table, 'delete', { id: params.id });

      return { error: null };
    } catch (error) {
      console.error(`Table delete error for ${table}:`, error);
      return { error: error instanceof Error ? error.message : 'Failed to delete record' };
    }
  }

  // File upload
  async upload(fileInfo: {filename: string;file: File;}) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Authentication required for file upload');
      }

      // Create unique path
      const timestamp = Date.now();
      const sanitizedName = fileInfo.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `uploads/${user.id}/${timestamp}_${sanitizedName}`;

      const { data, error } = await supabase.storage.
      from('files').
      upload(path, fileInfo.file, {
        cacheControl: '3600',
        upsert: false
      });

      if (error) throw new Error(error.message);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.
      from('files').
      getPublicUrl(data.path);

      // Store file metadata (you might want to create a files table)
      const fileMetadata = {
        path: data.path,
        filename: fileInfo.filename,
        size: fileInfo.file.size,
        type: fileInfo.file.type,
        url: publicUrl,
        uploaded_by: user.id,
        uploaded_at: new Date().toISOString()
      };

      return { data: fileMetadata, error: null };
    } catch (error) {
      console.error('File upload error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to upload file' };
    }
  }

  // Email sending
  async sendEmail(emailData: {
    from: string;
    to: string[];
    subject: string;
    text?: string;
    html?: string;
  }) {
    try {
      // This would need to be implemented based on your email service
      // For now, we'll simulate the API call
      console.log('Sending email:', emailData);

      // You might want to use a service like Resend, SendGrid, or implement server-side function
      // For production, this should call your email service API

      return { error: null };
    } catch (error) {
      console.error('Email send error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to send email' };
    }
  }

  // Real-time subscriptions
  subscribeToTable<T extends keyof Database['public']['Tables']>(
  table: T,
  callback: (payload: any) => void,
  filter?: string)
  {
    const channelName = `${table}_${Date.now()}`;

    let channel = supabase.
    channel(channelName).
    on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter
      },
      callback
    ).
    subscribe();

    this.realtimeChannels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.realtimeChannels.delete(channelName);
    };
  }

  // Utility methods
  private async ensureUserProfile(userId: string, email: string) {
    try {
      const { data: existingProfile } = await supabase.
      from('user_profiles').
      select('id').
      eq('user_id', userId).
      single();

      if (!existingProfile) {
        await supabase.
        from('user_profiles').
        insert({
          user_id: userId,
          role: 'Employee',
          station: 'MOBIL',
          employee_id: '',
          phone: '',
          hire_date: new Date().toISOString(),
          is_active: true,
          detailed_permissions: JSON.stringify({
            products: { view: true, create: false, edit: false, delete: false },
            employees: { view: false, create: false, edit: false, delete: false },
            sales: { view: true, create: true, edit: true, delete: false },
            inventory: { view: true, create: false, edit: false, delete: false },
            reports: { view: true, create: false, edit: false, delete: false }
          })
        });
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  }

  private async logAuditEvent(
  eventType: string,
  resource: string,
  action: string,
  data: any)
  {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      await supabase.
      from('audit_logs').
      insert({
        event_type: eventType,
        user_id: user.id,
        username: user.email || '',
        ip_address: '', // Would need to get from request
        user_agent: navigator.userAgent,
        event_timestamp: new Date().toISOString(),
        event_status: 'Success',
        resource_accessed: resource,
        action_performed: action,
        failure_reason: '',
        session_id: '',
        risk_level: 'Low',
        additional_data: JSON.stringify(data),
        station: '',
        geo_location: ''
      });
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  // Cleanup method
  cleanup() {
    this.realtimeChannels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.realtimeChannels.clear();
  }
}

// Create singleton instance
export const supabaseService = new SupabaseService();

// Export methods for compatibility with existing window.ezsite.apis calls
export const apis = {
  // Authentication
  register: (credentials: {email: string;password: string;}) =>
  supabaseService.register(credentials.email, credentials.password),

  login: (credentials: {email: string;password: string;}) =>
  supabaseService.login(credentials.email, credentials.password),

  logout: () => supabaseService.logout(),

  getUserInfo: () => supabaseService.getUserInfo(),

  sendResetPwdEmail: (email: {email: string;}) =>
  supabaseService.sendResetPwdEmail(email.email),

  resetPassword: (resetInfo: {token: string;password: string;}) =>
  supabaseService.resetPassword(resetInfo.token, resetInfo.password),

  // Database operations
  tablePage: (table: string, params: any) =>
  supabaseService.tablePage(table as any, params),

  tableCreate: (table: string, data: any) =>
  supabaseService.tableCreate(table as any, data),

  tableUpdate: (table: string, data: any) =>
  supabaseService.tableUpdate(table as any, data),

  tableDelete: (table: string, params: any) =>
  supabaseService.tableDelete(table as any, params),

  // File upload
  upload: (fileInfo: {filename: string;file: File;}) =>
  supabaseService.upload(fileInfo),

  // Email
  sendEmail: (emailData: any) => supabaseService.sendEmail(emailData)
};

export default supabaseService;