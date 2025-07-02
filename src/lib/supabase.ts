import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database type definitions based on table DDL
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: number;
          product_name: string;
          product_code: string;
          category: string;
          price: number;
          quantity_in_stock: number;
          minimum_stock: number;
          supplier: string;
          description: string;
          created_by: number;
          updated_at: string;
          serial_number: number;
          weight: number;
          weight_unit: string;
          department: string;
          merchant_id: number;
          bar_code_case: string;
          bar_code_unit: string;
          last_updated_date: string;
          last_shopping_date: string;
          case_price: number;
          unit_per_case: number;
          unit_price: number;
          retail_price: number;
          overdue: boolean;
          product_image_id: number;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      employees: {
        Row: {
          id: number;
          employee_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          position: string;
          station: string;
          hire_date: string;
          salary: number;
          is_active: boolean;
          created_by: number;
          date_of_birth: string;
          current_address: string;
          mailing_address: string;
          reference_name: string;
          id_document_type: string;
          id_document_file_id: number;
        };
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['employees']['Insert']>;
      };
      vendors: {
        Row: {
          id: number;
          vendor_name: string;
          contact_person: string;
          email: string;
          phone: string;
          address: string;
          category: string;
          payment_terms: string;
          is_active: boolean;
          created_by: number;
          station: string;
        };
        Insert: Omit<Database['public']['Tables']['vendors']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['vendors']['Insert']>;
      };
      orders: {
        Row: {
          id: number;
          order_number: string;
          vendor_id: number;
          order_date: string;
          expected_delivery: string;
          station: string;
          total_amount: number;
          status: string;
          notes: string;
          created_by: number;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      licenses_certificates: {
        Row: {
          id: number;
          license_name: string;
          license_number: string;
          issuing_authority: string;
          issue_date: string;
          expiry_date: string;
          station: string;
          category: string;
          status: string;
          document_file_id: number;
          created_by: number;
        };
        Insert: Omit<Database['public']['Tables']['licenses_certificates']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['licenses_certificates']['Insert']>;
      };
      salary_records: {
        Row: {
          id: number;
          employee_id: string;
          pay_period_start: string;
          pay_period_end: string;
          pay_date: string;
          pay_frequency: string;
          base_salary: number;
          hourly_rate: number;
          regular_hours: number;
          overtime_hours: number;
          overtime_rate: number;
          overtime_pay: number;
          bonus_amount: number;
          commission: number;
          gross_pay: number;
          federal_tax: number;
          state_tax: number;
          social_security: number;
          medicare: number;
          health_insurance: number;
          retirement_401k: number;
          other_deductions: number;
          total_deductions: number;
          net_pay: number;
          station: string;
          status: string;
          notes: string;
          created_by: number;
        };
        Insert: Omit<Database['public']['Tables']['salary_records']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['salary_records']['Insert']>;
      };
      daily_sales_reports: {
        Row: {
          id: number;
          report_date: string;
          station: string;
          total_sales: number;
          cash_sales: number;
          credit_card_sales: number;
          fuel_sales: number;
          convenience_sales: number;
          employee_id: string;
          notes: string;
          created_by: number;
        };
        Insert: Omit<Database['public']['Tables']['daily_sales_reports']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['daily_sales_reports']['Insert']>;
      };
      daily_sales_reports_enhanced: {
        Row: {
          id: number;
          report_date: string;
          station: string;
          employee_name: string;
          cash_collection_on_hand: number;
          total_short_over: number;
          credit_card_amount: number;
          debit_card_amount: number;
          mobile_amount: number;
          cash_amount: number;
          grocery_sales: number;
          ebt_sales: number;
          lottery_net_sales: number;
          scratch_off_sales: number;
          lottery_total_cash: number;
          regular_gallons: number;
          super_gallons: number;
          diesel_gallons: number;
          total_gallons: number;
          expenses_data: string;
          day_report_file_id: number;
          veeder_root_file_id: number;
          lotto_report_file_id: number;
          scratch_off_report_file_id: number;
          total_sales: number;
          notes: string;
          created_by: number;
          employee_id: string;
          shift: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_sales_reports_enhanced']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['daily_sales_reports_enhanced']['Insert']>;
      };
      delivery_records: {
        Row: {
          id: number;
          delivery_date: string;
          station: string;
          regular_tank_volume: number;
          plus_tank_volume: number;
          super_tank_volume: number;
          regular_delivered: number;
          plus_delivered: number;
          super_delivered: number;
          delivery_notes: string;
          created_by: number;
          bol_number: string;
        };
        Insert: Omit<Database['public']['Tables']['delivery_records']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['delivery_records']['Insert']>;
      };
      stations: {
        Row: {
          id: number;
          station_name: string;
          address: string;
          phone: string;
          operating_hours: string;
          manager_name: string;
          status: string;
          last_updated: string;
          created_by: number;
        };
        Insert: Omit<Database['public']['Tables']['stations']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['stations']['Insert']>;
      };
      user_profiles: {
        Row: {
          id: number;
          user_id: number;
          role: string;
          station: string;
          employee_id: string;
          phone: string;
          hire_date: string;
          is_active: boolean;
          detailed_permissions: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      product_logs: {
        Row: {
          id: number;
          product_id: number;
          field_name: string;
          old_value: string;
          new_value: string;
          change_date: string;
          changed_by: number;
        };
        Insert: Omit<Database['public']['Tables']['product_logs']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['product_logs']['Insert']>;
      };
      after_delivery_tank_reports: {
        Row: {
          id: number;
          report_date: string;
          station: string;
          delivery_record_id: number;
          bol_number: string;
          regular_tank_final: number;
          plus_tank_final: number;
          super_tank_final: number;
          tank_temperature: number;
          verification_status: string;
          discrepancy_notes: string;
          reported_by: string;
          supervisor_approval: boolean;
          additional_notes: string;
          created_by: number;
        };
        Insert: Omit<Database['public']['Tables']['after_delivery_tank_reports']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['after_delivery_tank_reports']['Insert']>;
      };
      sms_alert_settings: {
        Row: {
          id: number;
          setting_name: string;
          days_before_expiry: number;
          alert_frequency_days: number;
          is_active: boolean;
          message_template: string;
          created_by: number;
        };
        Insert: Omit<Database['public']['Tables']['sms_alert_settings']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['sms_alert_settings']['Insert']>;
      };
      sms_alert_contacts: {
        Row: {
          id: number;
          contact_name: string;
          mobile_number: string;
          station: string;
          is_active: boolean;
          contact_role: string;
          created_by: number;
        };
        Insert: Omit<Database['public']['Tables']['sms_alert_contacts']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['sms_alert_contacts']['Insert']>;
      };
      sms_alert_history: {
        Row: {
          id: number;
          license_id: number;
          contact_id: number;
          mobile_number: string;
          message_content: string;
          sent_date: string;
          delivery_status: string;
          days_before_expiry: number;
          created_by: number;
        };
        Insert: Omit<Database['public']['Tables']['sms_alert_history']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['sms_alert_history']['Insert']>;
      };
      sms_provider_config: {
        Row: {
          id: number;
          provider_name: string;
          account_sid: string;
          auth_token: string;
          from_number: string;
          is_active: boolean;
          test_mode: boolean;
          monthly_limit: number;
          current_month_count: number;
          webhook_url: string;
          created_by: number;
        };
        Insert: Omit<Database['public']['Tables']['sms_provider_config']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['sms_provider_config']['Insert']>;
      };
      sms_templates: {
        Row: {
          id: number;
          template_name: string;
          template_type: string;
          message_content: string;
          is_active: boolean;
          priority_level: string;
          character_count: number;
          created_by: number;
        };
        Insert: Omit<Database['public']['Tables']['sms_templates']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['sms_templates']['Insert']>;
      };
      alert_schedules: {
        Row: {
          id: number;
          schedule_name: string;
          alert_type: string;
          days_before_expiry: number;
          frequency_days: number;
          template_id: number;
          is_active: boolean;
          last_run: string;
          next_run: string;
          station_filter: string;
          created_by: number;
        };
        Insert: Omit<Database['public']['Tables']['alert_schedules']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['alert_schedules']['Insert']>;
      };
      audit_logs: {
        Row: {
          id: number;
          event_type: string;
          user_id: number;
          username: string;
          ip_address: string;
          user_agent: string;
          event_timestamp: string;
          event_status: string;
          resource_accessed: string;
          action_performed: string;
          failure_reason: string;
          session_id: string;
          risk_level: string;
          additional_data: string;
          station: string;
          geo_location: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
      };
      product_categories: {
        Row: {
          id: number;
          category_name: string;
          department: string;
          description: string;
          is_active: boolean;
          sort_order: number;
          created_by: number;
        };
        Insert: Omit<Database['public']['Tables']['product_categories']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['product_categories']['Insert']>;
      };
      email_automation_configs: {
        Row: {
          id: number;
          automation_name: string;
          email_type: string;
          is_active: boolean;
          from_email: string;
          from_name: string;
          trigger_condition: string;
          trigger_value: number;
          frequency_hours: number;
          template_id: number;
          recipient_groups: string;
          last_run: string;
          next_run: string;
          total_sent: number;
          success_rate: number;
          created_by: number;
        };
        Insert: Omit<Database['public']['Tables']['email_automation_configs']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['email_automation_configs']['Insert']>;
      };
      email_templates: {
        Row: {
          id: number;
          template_name: string;
          template_type: string;
          subject: string;
          html_content: string;
          text_content: string;
          is_active: boolean;
          variables: string;
          preview_data: string;
          usage_count: number;
          last_used: string;
          created_by: number;
        };
        Insert: Omit<Database['public']['Tables']['email_templates']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['email_templates']['Insert']>;
      };
      email_providers: {
        Row: {
          id: number;
          provider_name: string;
          provider_type: string;
          is_active: boolean;
          smtp_host: string;
          smtp_port: number;
          smtp_username: string;
          smtp_password: string;
          use_ssl: boolean;
          use_auth: boolean;
          from_email: string;
          from_name: string;
          reply_to: string;
          daily_limit: number;
          monthly_limit: number;
          current_daily_count: number;
          current_monthly_count: number;
          rate_limit_per_hour: number;
          webhook_url: string;
          api_key: string;
          api_secret: string;
          last_test_date: string;
          last_test_status: string;
          created_by: number;
        };
        Insert: Omit<Database['public']['Tables']['email_providers']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['email_providers']['Insert']>;
      };
      email_automation_history: {
        Row: {
          id: number;
          automation_id: number;
          template_id: number;
          provider_id: number;
          recipient_email: string;
          recipient_name: string;
          subject: string;
          content_preview: string;
          sent_date: string;
          delivery_status: string;
          delivery_date: string;
          open_date: string;
          click_count: number;
          error_message: string;
          trigger_data: string;
          station: string;
          created_by: number;
        };
        Insert: Omit<Database['public']['Tables']['email_automation_history']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['email_automation_history']['Insert']>;
      };
    };
    Views: { [_ in
    never]: never };

    Functions: { [_ in
    never]: never };

    Enums: { [_ in
    never]: never };

  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseAnonKey, {
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

// Authentication utilities
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};

export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

// Get user profile with role information
export const getUserProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: profile, error } = await supabase.
  from('user_profiles').
  select('*').
  eq('user_id', user.id).
  single();

  if (error) {
    console.error('Error getting user profile:', error);
    return null;
  }

  return { user, profile };
};

// Database operation utilities
export const createRecord = async <T extends keyof Database['public']['Tables'],>(
table: T,
data: Database['public']['Tables'][T]['Insert']) =>
{
  const { data: result, error } = await supabase.
  from(table).
  insert(data).
  select().
  single();

  return { data: result, error: error?.message };
};

export const updateRecord = async <T extends keyof Database['public']['Tables'],>(
table: T,
id: number,
data: Database['public']['Tables'][T]['Update']) =>
{
  const { data: result, error } = await supabase.
  from(table).
  update(data).
  eq('id', id).
  select().
  single();

  return { data: result, error: error?.message };
};

export const deleteRecord = async <T extends keyof Database['public']['Tables'],>(
table: T,
id: number) =>
{
  const { error } = await supabase.
  from(table).
  delete().
  eq('id', id);

  return { error: error?.message };
};

export const getRecords = async <T extends keyof Database['public']['Tables'],>(
table: T,
options?: {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  ascending?: boolean;
  filters?: Array<{column: string;operator: string;value: any;}>;
}) =>
{
  let query = supabase.from(table).select('*', { count: 'exact' });

  // Apply filters
  if (options?.filters) {
    options.filters.forEach((filter) => {
      switch (filter.operator) {
        case 'Equal':
          query = query.eq(filter.column, filter.value);
          break;
        case 'GreaterThan':
          query = query.gt(filter.column, filter.value);
          break;
        case 'GreaterThanOrEqual':
          query = query.gte(filter.column, filter.value);
          break;
        case 'LessThan':
          query = query.lt(filter.column, filter.value);
          break;
        case 'LessThanOrEqual':
          query = query.lte(filter.column, filter.value);
          break;
        case 'StringContains':
          query = query.ilike(filter.column, `%${filter.value}%`);
          break;
        case 'StringStartsWith':
          query = query.ilike(filter.column, `${filter.value}%`);
          break;
        case 'StringEndsWith':
          query = query.ilike(filter.column, `%${filter.value}`);
          break;
      }
    });
  }

  // Apply ordering
  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? true });
  }

  // Apply pagination
  if (options?.page && options?.pageSize) {
    const from = (options.page - 1) * options.pageSize;
    const to = from + options.pageSize - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  return {
    data: {
      List: data || [],
      VirtualCount: count || 0
    },
    error: error?.message
  };
};

// File upload utility
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage.
  from(bucket).
  upload(path, file, {
    cacheControl: '3600',
    upsert: false
  });

  if (error) {
    return { data: null, error: error.message };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage.
  from(bucket).
  getPublicUrl(data.path);

  return { data: { path: data.path, publicUrl }, error: null };
};

// Get file URL
export const getFileUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.
  from(bucket).
  getPublicUrl(path);

  return data.publicUrl;
};

export default supabase;