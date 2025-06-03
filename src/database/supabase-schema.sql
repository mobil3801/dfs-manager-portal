-- DFS Manager Portal Database Schema for Supabase
-- Execute this in Supabase SQL Editor to create all tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  product_name TEXT DEFAULT '',
  product_code TEXT DEFAULT '',
  category TEXT DEFAULT '',
  price NUMERIC DEFAULT 0,
  quantity_in_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  supplier TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_by INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  serial_number INTEGER DEFAULT 0,
  weight NUMERIC DEFAULT 0,
  weight_unit TEXT DEFAULT 'lb',
  department TEXT DEFAULT 'Convenience Store',
  merchant_id INTEGER DEFAULT 0,
  bar_code_case TEXT DEFAULT '',
  bar_code_unit TEXT DEFAULT '',
  last_updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_shopping_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  case_price NUMERIC DEFAULT 0,
  unit_per_case INTEGER DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  retail_price NUMERIC DEFAULT 0,
  overdue BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees table  
CREATE TABLE IF NOT EXISTS employees (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT DEFAULT '',
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  position TEXT DEFAULT '',
  station TEXT DEFAULT '',
  hire_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  salary NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER DEFAULT 0,
  date_of_birth TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_address TEXT DEFAULT '',
  mailing_address TEXT DEFAULT '',
  reference_name TEXT DEFAULT '',
  id_document_type TEXT DEFAULT '',
  id_document_file_id INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id BIGSERIAL PRIMARY KEY,
  vendor_name TEXT DEFAULT '',
  contact_person TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  category TEXT DEFAULT '',
  payment_terms TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER DEFAULT 0,
  station TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_number TEXT DEFAULT '',
  vendor_id INTEGER DEFAULT 0,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expected_delivery TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  station TEXT DEFAULT '',
  total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  notes TEXT DEFAULT '',
  created_by INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Licenses and Certificates table
CREATE TABLE IF NOT EXISTS licenses_certificates (
  id BIGSERIAL PRIMARY KEY,
  license_name TEXT DEFAULT '',
  license_number TEXT DEFAULT '',
  issuing_authority TEXT DEFAULT '',
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  station TEXT DEFAULT '',
  category TEXT DEFAULT '',
  status TEXT DEFAULT 'Active',
  document_file_id INTEGER DEFAULT 0,
  created_by INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Sales Reports (Enhanced)
CREATE TABLE IF NOT EXISTS daily_sales_reports_enhanced (
  id BIGSERIAL PRIMARY KEY,
  report_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  station TEXT DEFAULT '',
  employee_name TEXT DEFAULT '',
  cash_collection_on_hand NUMERIC DEFAULT 0,
  total_short_over NUMERIC DEFAULT 0,
  credit_card_amount NUMERIC DEFAULT 0,
  debit_card_amount NUMERIC DEFAULT 0,
  mobile_amount NUMERIC DEFAULT 0,
  cash_amount NUMERIC DEFAULT 0,
  grocery_sales NUMERIC DEFAULT 0,
  ebt_sales NUMERIC DEFAULT 0,
  lottery_net_sales NUMERIC DEFAULT 0,
  scratch_off_sales NUMERIC DEFAULT 0,
  lottery_total_cash NUMERIC DEFAULT 0,
  regular_gallons NUMERIC DEFAULT 0,
  super_gallons NUMERIC DEFAULT 0,
  diesel_gallons NUMERIC DEFAULT 0,
  total_gallons NUMERIC DEFAULT 0,
  expenses_data TEXT DEFAULT '[]',
  day_report_file_id INTEGER DEFAULT 0,
  veeder_root_file_id INTEGER DEFAULT 0,
  lotto_report_file_id INTEGER DEFAULT 0,
  scratch_off_report_file_id INTEGER DEFAULT 0,
  total_sales NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_by INTEGER DEFAULT 0,
  employee_id TEXT DEFAULT '',
  shift TEXT DEFAULT 'DAY',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Sales Reports (Basic)
CREATE TABLE IF NOT EXISTS daily_sales_reports (
  id BIGSERIAL PRIMARY KEY,
  report_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  station TEXT DEFAULT '',
  total_sales NUMERIC DEFAULT 0,
  cash_sales NUMERIC DEFAULT 0,
  credit_card_sales NUMERIC DEFAULT 0,
  fuel_sales NUMERIC DEFAULT 0,
  convenience_sales NUMERIC DEFAULT 0,
  employee_id TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_by INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stations table
CREATE TABLE IF NOT EXISTS stations (
  id BIGSERIAL PRIMARY KEY,
  station_name TEXT DEFAULT '',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  operating_hours TEXT DEFAULT '',
  manager_name TEXT DEFAULT '',
  status TEXT DEFAULT 'Active',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery Records table
CREATE TABLE IF NOT EXISTS delivery_records (
  id BIGSERIAL PRIMARY KEY,
  delivery_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  station TEXT DEFAULT '',
  regular_tank_volume NUMERIC DEFAULT 0,
  plus_tank_volume NUMERIC DEFAULT 0,
  super_tank_volume NUMERIC DEFAULT 0,
  regular_delivered NUMERIC DEFAULT 0,
  plus_delivered NUMERIC DEFAULT 0,
  super_delivered NUMERIC DEFAULT 0,
  delivery_notes TEXT DEFAULT '',
  created_by INTEGER DEFAULT 0,
  bol_number TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- After Delivery Tank Reports table
CREATE TABLE IF NOT EXISTS after_delivery_tank_reports (
  id BIGSERIAL PRIMARY KEY,
  report_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  station TEXT DEFAULT '',
  delivery_record_id INTEGER DEFAULT 0,
  bol_number TEXT DEFAULT '',
  regular_tank_final NUMERIC DEFAULT 0,
  plus_tank_final NUMERIC DEFAULT 0,
  super_tank_final NUMERIC DEFAULT 0,
  tank_temperature NUMERIC DEFAULT 0,
  verification_status TEXT DEFAULT 'Pending Review',
  discrepancy_notes TEXT DEFAULT '',
  reported_by TEXT DEFAULT '',
  supervisor_approval BOOLEAN DEFAULT false,
  additional_notes TEXT DEFAULT '',
  created_by INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Salary Records table
CREATE TABLE IF NOT EXISTS salary_records (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT DEFAULT '',
  pay_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pay_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pay_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pay_frequency TEXT DEFAULT 'Biweekly',
  base_salary NUMERIC DEFAULT 0,
  hourly_rate NUMERIC DEFAULT 0,
  regular_hours NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  overtime_rate NUMERIC DEFAULT 0,
  overtime_pay NUMERIC DEFAULT 0,
  bonus_amount NUMERIC DEFAULT 0,
  commission NUMERIC DEFAULT 0,
  gross_pay NUMERIC DEFAULT 0,
  federal_tax NUMERIC DEFAULT 0,
  state_tax NUMERIC DEFAULT 0,
  social_security NUMERIC DEFAULT 0,
  medicare NUMERIC DEFAULT 0,
  health_insurance NUMERIC DEFAULT 0,
  retirement_401k NUMERIC DEFAULT 0,
  other_deductions NUMERIC DEFAULT 0,
  total_deductions NUMERIC DEFAULT 0,
  net_pay NUMERIC DEFAULT 0,
  station TEXT DEFAULT 'MOBIL',
  status TEXT DEFAULT 'Pending',
  notes TEXT DEFAULT '',
  created_by INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Logs table
CREATE TABLE IF NOT EXISTS product_logs (
  id BIGSERIAL PRIMARY KEY,
  product_id INTEGER DEFAULT 0,
  field_name TEXT DEFAULT '',
  old_value TEXT DEFAULT '',
  new_value TEXT DEFAULT '',
  change_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS Alert Settings table
CREATE TABLE IF NOT EXISTS sms_alert_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_name TEXT DEFAULT '',
  days_before_expiry INTEGER DEFAULT 30,
  alert_frequency_days INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  message_template TEXT DEFAULT 'ALERT: License ''{license_name}'' for {station} expires on {expiry_date}. Please renew immediately.',
  created_by INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS Alert History table
CREATE TABLE IF NOT EXISTS sms_alert_history (
  id BIGSERIAL PRIMARY KEY,
  license_id INTEGER DEFAULT 0,
  contact_id INTEGER DEFAULT 0,
  mobile_number TEXT DEFAULT '',
  message_content TEXT DEFAULT '',
  sent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivery_status TEXT DEFAULT 'Sent',
  days_before_expiry INTEGER DEFAULT 0,
  created_by INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS Alert Contacts table
CREATE TABLE IF NOT EXISTS sms_alert_contacts (
  id BIGSERIAL PRIMARY KEY,
  contact_name TEXT DEFAULT '',
  mobile_number TEXT DEFAULT '',
  station TEXT DEFAULT 'ALL',
  is_active BOOLEAN DEFAULT true,
  contact_role TEXT DEFAULT 'Manager',
  created_by INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS Provider Config table
CREATE TABLE IF NOT EXISTS sms_provider_config (
  id BIGSERIAL PRIMARY KEY,
  provider_name TEXT DEFAULT 'Twilio',
  account_sid TEXT DEFAULT '',
  auth_token TEXT DEFAULT '',
  from_number TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  test_mode BOOLEAN DEFAULT true,
  monthly_limit INTEGER DEFAULT 1000,
  current_month_count INTEGER DEFAULT 0,
  webhook_url TEXT DEFAULT '',
  created_by INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS Templates table
CREATE TABLE IF NOT EXISTS sms_templates (
  id BIGSERIAL PRIMARY KEY,
  template_name TEXT DEFAULT '',
  template_type TEXT DEFAULT 'License Expiry',
  message_content TEXT DEFAULT 'ALERT: License ''{license_name}'' for {station} expires on {expiry_date}. Please renew immediately.',
  is_active BOOLEAN DEFAULT true,
  priority_level TEXT DEFAULT 'Medium',
  character_count INTEGER DEFAULT 0,
  created_by INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert Schedules table
CREATE TABLE IF NOT EXISTS alert_schedules (
  id BIGSERIAL PRIMARY KEY,
  schedule_name TEXT DEFAULT '',
  alert_type TEXT DEFAULT 'License Expiry',
  days_before_expiry INTEGER DEFAULT 30,
  frequency_days INTEGER DEFAULT 7,
  template_id INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_run TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  station_filter TEXT DEFAULT 'ALL',
  created_by INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT DEFAULT 'Login',
  user_id INTEGER DEFAULT 0,
  username TEXT DEFAULT '',
  ip_address TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_status TEXT DEFAULT 'Success',
  resource_accessed TEXT DEFAULT '',
  action_performed TEXT DEFAULT '',
  failure_reason TEXT DEFAULT '',
  session_id TEXT DEFAULT '',
  risk_level TEXT DEFAULT 'Low',
  additional_data TEXT DEFAULT '{}',
  station TEXT DEFAULT '',
  geo_location TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER DEFAULT 0,
  role TEXT DEFAULT 'Employee',
  station TEXT DEFAULT '',
  employee_id TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  hire_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  detailed_permissions TEXT DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales_reports_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE after_delivery_tank_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_alert_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_provider_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (Allow all operations for authenticated users)
-- You can customize these policies based on your security requirements

-- Products policies
CREATE POLICY "Allow all operations on products for authenticated users" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Employees policies
CREATE POLICY "Allow all operations on employees for authenticated users" ON employees
  FOR ALL USING (auth.role() = 'authenticated');

-- Vendors policies
CREATE POLICY "Allow all operations on vendors for authenticated users" ON vendors
  FOR ALL USING (auth.role() = 'authenticated');

-- Orders policies
CREATE POLICY "Allow all operations on orders for authenticated users" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

-- Licenses policies
CREATE POLICY "Allow all operations on licenses_certificates for authenticated users" ON licenses_certificates
  FOR ALL USING (auth.role() = 'authenticated');

-- Sales reports policies
CREATE POLICY "Allow all operations on daily_sales_reports_enhanced for authenticated users" ON daily_sales_reports_enhanced
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations on daily_sales_reports for authenticated users" ON daily_sales_reports
  FOR ALL USING (auth.role() = 'authenticated');

-- Other tables policies
CREATE POLICY "Allow all operations on stations for authenticated users" ON stations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations on delivery_records for authenticated users" ON delivery_records
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations on after_delivery_tank_reports for authenticated users" ON after_delivery_tank_reports
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations on salary_records for authenticated users" ON salary_records
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations on product_logs for authenticated users" ON product_logs
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations on sms_alert_settings for authenticated users" ON sms_alert_settings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations on sms_alert_history for authenticated users" ON sms_alert_history
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations on sms_alert_contacts for authenticated users" ON sms_alert_contacts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations on sms_provider_config for authenticated users" ON sms_provider_config
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations on sms_templates for authenticated users" ON sms_templates
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations on alert_schedules for authenticated users" ON alert_schedules
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations on audit_logs for authenticated users" ON audit_logs
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations on user_profiles for authenticated users" ON user_profiles
  FOR ALL USING (auth.role() = 'authenticated');

-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE employees;
ALTER PUBLICATION supabase_realtime ADD TABLE vendors;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE licenses_certificates;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_sales_reports_enhanced;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_sales_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE stations;
ALTER PUBLICATION supabase_realtime ADD TABLE delivery_records;
ALTER PUBLICATION supabase_realtime ADD TABLE after_delivery_tank_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE salary_records;
ALTER PUBLICATION supabase_realtime ADD TABLE product_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE sms_alert_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE sms_alert_history;
ALTER PUBLICATION supabase_realtime ADD TABLE sms_alert_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE sms_provider_config;
ALTER PUBLICATION supabase_realtime ADD TABLE sms_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE alert_schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier);
CREATE INDEX IF NOT EXISTS idx_products_quantity ON products(quantity_in_stock);
CREATE INDEX IF NOT EXISTS idx_employees_station ON employees(station);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_sales_reports_date ON daily_sales_reports_enhanced(report_date);
CREATE INDEX IF NOT EXISTS idx_sales_reports_station ON daily_sales_reports_enhanced(station);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_licenses_expiry ON licenses_certificates(expiry_date);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses_certificates(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

-- Insert some sample data for testing
INSERT INTO stations (station_name, address, phone, operating_hours, manager_name, status) VALUES
('MOBIL', '123 Main St, Brooklyn, NY', '(718) 555-0001', '24/7', 'John Doe', 'Active'),
('AMOCO ROSEDALE', '456 Rose Ave, Rosedale, NY', '(718) 555-0002', '6:00 AM - 12:00 AM', 'Jane Smith', 'Active'),
('AMOCO BROOKLYN', '789 Brooklyn Blvd, Brooklyn, NY', '(718) 555-0003', '5:00 AM - 11:00 PM', 'Mike Johnson', 'Active');

COMMENT ON SCHEMA public IS 'DFS Manager Portal - Comprehensive gas station management system with real-time capabilities powered by Supabase';