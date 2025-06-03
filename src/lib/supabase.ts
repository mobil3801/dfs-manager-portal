import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client
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

// Database types based on your existing tables
export interface Database {
  public: {
    Tables: {
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
    };
  };
}

// Helper function to get user session
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};