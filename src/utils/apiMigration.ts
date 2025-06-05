// Utility to replace window.ezsite.apis with Supabase service
import { supabaseService, apis } from '@/services/supabaseService';

// Create a global API object that mimics the old window.ezsite.apis
const createApiWrapper = () => {
  // Make APIs available globally to replace window.ezsite.apis
  if (typeof window !== 'undefined') {
    (window as any).ezsite = {
      apis: apis
    };
  }

  return apis;
};

// Initialize the API wrapper
export const initializeApiMigration = () => {
  const apiWrapper = createApiWrapper();
  
  console.log('API Migration: Supabase service initialized');
  console.log('Available APIs:', Object.keys(apiWrapper));
  
  return apiWrapper;
};

// Helper function to get table ID from table name (for backward compatibility)
export const getTableId = (tableName: string): string => {
  // Map table names to their IDs if needed
  const tableIdMap: Record<string, string> = {
    'products': 'products',
    'employees': 'employees',
    'vendors': 'vendors',
    'orders': 'orders',
    'licenses_certificates': 'licenses_certificates',
    'salary_records': 'salary_records',
    'daily_sales_reports': 'daily_sales_reports',
    'daily_sales_reports_enhanced': 'daily_sales_reports_enhanced',
    'delivery_records': 'delivery_records',
    'stations': 'stations',
    'user_profiles': 'user_profiles',
    'product_logs': 'product_logs',
    'after_delivery_tank_reports': 'after_delivery_tank_reports',
    'sms_alert_settings': 'sms_alert_settings',
    'sms_alert_contacts': 'sms_alert_contacts',
    'sms_alert_history': 'sms_alert_history',
    'sms_provider_config': 'sms_provider_config',
    'sms_templates': 'sms_templates',
    'alert_schedules': 'alert_schedules',
    'audit_logs': 'audit_logs',
    'product_categories': 'product_categories',
    'email_automation_configs': 'email_automation_configs',
    'email_templates': 'email_templates',
    'email_providers': 'email_providers',
    'email_automation_history': 'email_automation_history'
  };

  return tableIdMap[tableName] || tableName;
};

// Migration helper for components that need to be updated
export const migrateApiCalls = {
  // Convert old API calls to new Supabase calls
  async tablePage(tableName: string, params: any) {
    const tableId = getTableId(tableName);
    return await apis.tablePage(tableId, params);
  },

  async tableCreate(tableName: string, data: any) {
    const tableId = getTableId(tableName);
    return await apis.tableCreate(tableId, data);
  },

  async tableUpdate(tableName: string, data: any) {
    const tableId = getTableId(tableName);
    return await apis.tableUpdate(tableId, data);
  },

  async tableDelete(tableName: string, params: any) {
    const tableId = getTableId(tableName);
    return await apis.tableDelete(tableId, params);
  },

  // Authentication methods
  async login(credentials: { email: string; password: string }) {
    return await apis.login(credentials);
  },

  async register(credentials: { email: string; password: string }) {
    return await apis.register(credentials);
  },

  async logout() {
    return await apis.logout();
  },

  async getUserInfo() {
    return await apis.getUserInfo();
  },

  async sendResetPwdEmail(email: { email: string }) {
    return await apis.sendResetPwdEmail(email);
  },

  async resetPassword(resetInfo: { token: string; password: string }) {
    return await apis.resetPassword(resetInfo);
  },

  // File upload
  async upload(fileInfo: { filename: string; file: File }) {
    return await apis.upload(fileInfo);
  },

  // Email
  async sendEmail(emailData: any) {
    return await apis.sendEmail(emailData);
  }
};

// Default export for easy import
export default migrateApiCalls;