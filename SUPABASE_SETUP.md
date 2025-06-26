# 🚀 DFS Manager Portal - Supabase Full Activation Guide

## Overview
This guide will help you activate complete real-time capabilities for the DFS Manager Portal using Supabase. Once configured, your application will have:

- ⚡ **Real-time data synchronization** across all users
- 🔒 **Secure authentication** with Row Level Security  
- 📊 **Live dashboard updates** for sales, inventory, and employee data
- 🔔 **Instant notifications** for important events
- 👥 **Multi-user collaboration** with conflict resolution
- 💾 **Automatic backup** and data persistence

## Quick Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click **"New Project"** and configure:
   - **Project name**: DFS Manager Portal
   - **Database password**: Choose a strong password
   - **Region**: Select closest to your location
3. Wait 1-2 minutes for project creation

### Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings > API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

### Step 3: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Setup Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Execute this SQL to create all required tables:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Employee',
  station TEXT DEFAULT '',
  employee_id TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  hire_date TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  detailed_permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  product_name TEXT DEFAULT '',
  product_code TEXT DEFAULT '',
  category TEXT DEFAULT '',
  price DECIMAL DEFAULT 0,
  quantity_in_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  supplier TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_by INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  serial_number INTEGER DEFAULT 0,
  weight DECIMAL DEFAULT 0,
  weight_unit TEXT DEFAULT 'lb',
  department TEXT DEFAULT 'Convenience Store',
  merchant_id INTEGER DEFAULT 0,
  bar_code_case TEXT DEFAULT '',
  bar_code_unit TEXT DEFAULT '',
  last_updated_date TIMESTAMPTZ DEFAULT NOW(),
  last_shopping_date TIMESTAMPTZ DEFAULT NOW(),
  case_price DECIMAL DEFAULT 0,
  unit_per_case INTEGER DEFAULT 1,
  unit_price DECIMAL DEFAULT 0,
  retail_price DECIMAL DEFAULT 0,
  overdue BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  hire_date TIMESTAMPTZ DEFAULT NOW(),
  salary DECIMAL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER DEFAULT 0,
  date_of_birth TIMESTAMPTZ DEFAULT NOW(),
  current_address TEXT DEFAULT '',
  mailing_address TEXT DEFAULT '',
  reference_name TEXT DEFAULT '',
  id_document_type TEXT DEFAULT '',
  id_document_file_id INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales reports table
CREATE TABLE IF NOT EXISTS daily_sales_reports_enhanced (
  id BIGSERIAL PRIMARY KEY,
  report_date TIMESTAMPTZ DEFAULT NOW(),
  station TEXT DEFAULT '',
  employee_name TEXT DEFAULT '',
  cash_collection_on_hand DECIMAL DEFAULT 0,
  total_short_over DECIMAL DEFAULT 0,
  credit_card_amount DECIMAL DEFAULT 0,
  debit_card_amount DECIMAL DEFAULT 0,
  mobile_amount DECIMAL DEFAULT 0,
  cash_amount DECIMAL DEFAULT 0,
  grocery_sales DECIMAL DEFAULT 0,
  ebt_sales DECIMAL DEFAULT 0,
  lottery_net_sales DECIMAL DEFAULT 0,
  scratch_off_sales DECIMAL DEFAULT 0,
  lottery_total_cash DECIMAL DEFAULT 0,
  regular_gallons DECIMAL DEFAULT 0,
  super_gallons DECIMAL DEFAULT 0,
  diesel_gallons DECIMAL DEFAULT 0,
  total_gallons DECIMAL DEFAULT 0,
  expenses_data TEXT DEFAULT '[]',
  day_report_file_id INTEGER DEFAULT 0,
  veeder_root_file_id INTEGER DEFAULT 0,
  lotto_report_file_id INTEGER DEFAULT 0,
  scratch_off_report_file_id INTEGER DEFAULT 0,
  total_sales DECIMAL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_by INTEGER DEFAULT 0,
  employee_id TEXT DEFAULT '',
  shift TEXT DEFAULT 'DAY',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add other tables as needed (vendors, orders, licenses, etc.)
```

### Step 5: Enable Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales_reports_enhanced ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage employees" ON employees
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage sales reports" ON daily_sales_reports_enhanced
  FOR ALL USING (auth.role() = 'authenticated');
```

### Step 6: Enable Real-time Features

```sql
-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE employees;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_sales_reports_enhanced;
ALTER PUBLICATION supabase_realtime ADD TABLE vendors;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE licenses_certificates;
ALTER PUBLICATION supabase_realtime ADD TABLE delivery_records;
ALTER PUBLICATION supabase_realtime ADD TABLE salary_records;
ALTER PUBLICATION supabase_realtime ADD TABLE stations;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
```

## Verification

After setup, restart your application and:

1. Check the **real-time status indicator** in the dashboard header
2. Use the **"Test Supabase Connection"** button in the setup guide
3. Look for the green **"✅ Connected"** status
4. Try creating/updating records to see real-time sync

## Features Activated

Once setup is complete, you'll have:

### 🔄 Real-time Data Sync
- All changes sync instantly across users
- No need to refresh pages
- Live updates for sales, inventory, employees

### 🔒 Secure Authentication  
- Row Level Security protects data
- User-based access control
- Secure API endpoints

### 📊 Live Dashboard
- Real-time sales metrics
- Instant inventory updates
- Live employee status

### 🔔 Smart Notifications
- Real-time alerts for low stock
- License expiration warnings
- Sales milestone notifications

### 👥 Multi-user Support
- Multiple users can work simultaneously
- Conflict resolution built-in
- Activity tracking and audit logs

## Troubleshooting

### Connection Issues
- Verify environment variables are correct
- Check Supabase project is active
- Ensure network connectivity

### Database Errors
- Confirm all tables are created
- Verify RLS policies are applied
- Check real-time publications are enabled

### Permission Problems
- Review Row Level Security policies
- Confirm user authentication status
- Check user roles and permissions

## Support

For additional help:
- Check the built-in setup guide in the app
- Review Supabase documentation
- Use the test connection feature
- Check browser console for errors

---

**🎉 Congratulations!** Your DFS Manager Portal now has full real-time capabilities powered by Supabase.