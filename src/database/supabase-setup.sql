-- Supabase Database Setup Script
-- This script sets up Row Level Security (RLS) policies and other necessary configurations

-- Enable Row Level Security on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales_reports_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE after_delivery_tank_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_alert_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_provider_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_automation_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_automation_history ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users

-- Products table policies
CREATE POLICY "Users can view products" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can insert products" ON products
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid()::text::int 
      AND role IN ('Administrator', 'Management')
    )
  );

CREATE POLICY "Managers can update products" ON products
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid()::text::int 
      AND role IN ('Administrator', 'Management')
    )
  );

CREATE POLICY "Admins can delete products" ON products
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid()::text::int 
      AND role = 'Administrator'
    )
  );

-- User profiles table policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    user_id = auth.uid()::text::int
  );

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid()::text::int 
      AND role = 'Administrator'
    )
  );

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    user_id = auth.uid()::text::int
  );

CREATE POLICY "Admins can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid()::text::int 
      AND role = 'Administrator'
    )
  );

-- Sales reports policies
CREATE POLICY "Users can view sales reports for their station" ON daily_sales_reports_enhanced
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    (
      station = (
        SELECT station FROM user_profiles 
        WHERE user_id = auth.uid()::text::int
      ) OR
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid()::text::int 
        AND role IN ('Administrator', 'Management')
      )
    )
  );

CREATE POLICY "Users can insert sales reports" ON daily_sales_reports_enhanced
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    created_by = auth.uid()::text::int
  );

CREATE POLICY "Users can update own sales reports" ON daily_sales_reports_enhanced
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    created_by = auth.uid()::text::int
  );

-- Employees table policies
CREATE POLICY "Managers can view employees" ON employees
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid()::text::int 
      AND role IN ('Administrator', 'Management')
    )
  );

CREATE POLICY "Admins can manage employees" ON employees
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid()::text::int 
      AND role = 'Administrator'
    )
  );

-- Audit logs policies
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid()::text::int 
      AND role = 'Administrator'
    )
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Generic policies for other tables (can be customized as needed)
DO $$
DECLARE
    table_name text;
    tables_array text[] := ARRAY[
        'vendors', 'orders', 'licenses_certificates', 'salary_records',
        'daily_sales_reports', 'delivery_records', 'stations',
        'product_logs', 'after_delivery_tank_reports', 'sms_alert_settings',
        'sms_alert_contacts', 'sms_alert_history', 'sms_provider_config',
        'sms_templates', 'alert_schedules', 'product_categories',
        'email_automation_configs', 'email_templates', 'email_providers',
        'email_automation_history'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_array
    LOOP
        -- Select policy for authenticated users
        EXECUTE format('
            CREATE POLICY "Users can view %s" ON %s
            FOR SELECT USING (auth.role() = ''authenticated'')
        ', table_name, table_name);
        
        -- Insert policy for authenticated users
        EXECUTE format('
            CREATE POLICY "Users can insert %s" ON %s
            FOR INSERT WITH CHECK (auth.role() = ''authenticated'')
        ', table_name, table_name);
        
        -- Update policy for record owners or admins
        EXECUTE format('
            CREATE POLICY "Users can update own %s" ON %s
            FOR UPDATE USING (
                auth.role() = ''authenticated'' AND
                (
                    created_by = auth.uid()::text::int OR
                    EXISTS (
                        SELECT 1 FROM user_profiles 
                        WHERE user_id = auth.uid()::text::int 
                        AND role IN (''Administrator'', ''Management'')
                    )
                )
            )
        ', table_name, table_name);
        
        -- Delete policy for admins only
        EXECUTE format('
            CREATE POLICY "Admins can delete %s" ON %s
            FOR DELETE USING (
                auth.role() = ''authenticated'' AND
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE user_id = auth.uid()::text::int 
                    AND role = ''Administrator''
                )
            )
        ', table_name, table_name);
    END LOOP;
END $$;

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id = 'files'
  );

CREATE POLICY "Users can view files" ON storage.objects
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    bucket_id = 'files'
  );

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    bucket_id = 'files' AND
    owner = auth.uid()
  );

-- Enable realtime for all tables
DO $$
DECLARE
    table_name text;
    all_tables text[] := ARRAY[
        'products', 'employees', 'vendors', 'orders', 'licenses_certificates',
        'salary_records', 'daily_sales_reports', 'daily_sales_reports_enhanced',
        'delivery_records', 'stations', 'user_profiles', 'product_logs',
        'after_delivery_tank_reports', 'sms_alert_settings', 'sms_alert_contacts',
        'sms_alert_history', 'sms_provider_config', 'sms_templates',
        'alert_schedules', 'audit_logs', 'product_categories',
        'email_automation_configs', 'email_templates', 'email_providers',
        'email_automation_history'
    ];
BEGIN
    FOREACH table_name IN ARRAY all_tables
    LOOP
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %s', table_name);
    END LOOP;
END $$;

-- Create functions for common operations

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM user_profiles WHERE user_id = user_uuid::text::int;
$$;

-- Function to check permissions
CREATE OR REPLACE FUNCTION check_user_permission(user_uuid uuid, resource text, action text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_permissions jsonb;
  resource_permissions jsonb;
BEGIN
  SELECT detailed_permissions::jsonb INTO user_permissions
  FROM user_profiles 
  WHERE user_id = user_uuid::text::int;
  
  IF user_permissions IS NULL THEN
    RETURN false;
  END IF;
  
  resource_permissions := user_permissions -> resource;
  
  IF resource_permissions IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN COALESCE((resource_permissions ->> action)::boolean, false);
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_station ON products(department);
CREATE INDEX IF NOT EXISTS idx_employees_station ON employees(station);
CREATE INDEX IF NOT EXISTS idx_sales_reports_date ON daily_sales_reports_enhanced(report_date);
CREATE INDEX IF NOT EXISTS idx_sales_reports_station ON daily_sales_reports_enhanced(station);
CREATE INDEX IF NOT EXISTS idx_delivery_records_date ON delivery_records(delivery_date);
CREATE INDEX IF NOT EXISTS idx_delivery_records_station ON delivery_records(station);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Create triggers for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      event_type, user_id, username, event_timestamp, event_status,
      resource_accessed, action_performed, additional_data
    ) VALUES (
      'Data Creation',
      COALESCE(auth.uid()::text::int, 0),
      COALESCE(auth.email(), 'system'),
      NOW(),
      'Success',
      TG_TABLE_NAME,
      'INSERT',
      row_to_json(NEW)::text
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      event_type, user_id, username, event_timestamp, event_status,
      resource_accessed, action_performed, additional_data
    ) VALUES (
      'Data Modification',
      COALESCE(auth.uid()::text::int, 0),
      COALESCE(auth.email(), 'system'),
      NOW(),
      'Success',
      TG_TABLE_NAME,
      'UPDATE',
      json_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))::text
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      event_type, user_id, username, event_timestamp, event_status,
      resource_accessed, action_performed, additional_data
    ) VALUES (
      'Data Deletion',
      COALESCE(auth.uid()::text::int, 0),
      COALESCE(auth.email(), 'system'),
      NOW(),
      'Success',
      TG_TABLE_NAME,
      'DELETE',
      row_to_json(OLD)::text
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Apply audit triggers to sensitive tables
DO $$
DECLARE
    table_name text;
    sensitive_tables text[] := ARRAY[
        'products', 'employees', 'salary_records', 'daily_sales_reports_enhanced',
        'delivery_records', 'user_profiles', 'licenses_certificates'
    ];
BEGIN
    FOREACH table_name IN ARRAY sensitive_tables
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS audit_trigger_%s ON %s;
            CREATE TRIGGER audit_trigger_%s
            AFTER INSERT OR UPDATE OR DELETE ON %s
            FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
        ', table_name, table_name, table_name, table_name);
    END LOOP;
END $$;