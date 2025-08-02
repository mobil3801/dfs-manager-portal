import { supabase, db, storage } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

// Types
export interface DatabaseError {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterOptions {
  [key: string]: any;
}

// Base Database Service Class
class BaseService {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected handleError(error: any): DatabaseError {
    console.error(`${this.tableName} service error:`, error);

    const dbError: DatabaseError = {
      message: error?.message || 'An unexpected error occurred',
      code: error?.code,
      details: error?.details
    };

    toast({
      title: 'Database Error',
      description: dbError.message,
      variant: 'destructive'
    });

    return dbError;
  }

  async getAll(options?: PaginationOptions & FilterOptions) {
    try {
      let query = supabase.from(this.tableName).select('*');

      // Apply filters
      if (options) {
        Object.entries(options).forEach(([key, value]) => {
          if (key !== 'page' && key !== 'pageSize' && key !== 'sortBy' && key !== 'sortOrder' && value !== undefined) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply sorting
      if (options?.sortBy) {
        query = query.order(options.sortBy, { ascending: options.sortOrder === 'asc' });
      }

      // Apply pagination
      if (options?.page && options?.pageSize) {
        const start = (options.page - 1) * options.pageSize;
        const end = start + options.pageSize - 1;
        query = query.range(start, end);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async getById(id: string) {
    try {
      const { data, error } = await supabase.
      from(this.tableName).
      select('*').
      eq('id', id).
      single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async create(data: any) {
    try {
      const { data: result, error } = await supabase.
      from(this.tableName).
      insert({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).
      select().
      single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${this.tableName} created successfully`
      });

      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async update(id: string, data: any) {
    try {
      const { data: result, error } = await supabase.
      from(this.tableName).
      update({
        ...data,
        updated_at: new Date().toISOString()
      }).
      eq('id', id).
      select().
      single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${this.tableName} updated successfully`
      });

      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async delete(id: string) {
    try {
      const { error } = await supabase.
      from(this.tableName).
      delete().
      eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${this.tableName} deleted successfully`
      });

      return { error: null };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }
}

// Station Service
export class StationService extends BaseService {
  constructor() {
    super('stations');
  }

  async getStationsWithStats() {
    try {
      const { data, error } = await supabase.
      from('stations').
      select(`
          *,
          employees:employees(count),
          sales_reports:sales_reports(count),
          products:products(count)
        `).
      eq('is_active', true);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }
}

// Product Service
export class ProductService extends BaseService {
  constructor() {
    super('products');
  }

  async getLowStockProducts(stationId?: string) {
    try {
      let query = supabase.
      from('products').
      select('*').
      lt('quantity_in_stock', supabase.rpc('get_min_stock_level'));

      if (stationId) {
        query = query.eq('station_id', stationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async searchProducts(searchTerm: string, stationId?: string) {
    try {
      let query = supabase.
      from('products').
      select('*').
      or(`name.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`).
      eq('is_active', true);

      if (stationId) {
        query = query.eq('station_id', stationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }
}

// Employee Service
export class EmployeeService extends BaseService {
  constructor() {
    super('employees');
  }

  async getEmployeesWithProfiles(stationId?: string) {
    try {
      let query = supabase.
      from('employees').
      select(`
          *,
          user_profiles(*),
          stations(name, address)
        `).
      eq('is_active', true);

      if (stationId) {
        query = query.eq('station_id', stationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async uploadEmployeeDocument(employeeId: string, file: File, documentType: string) {
    try {
      const fileName = `${employeeId}/${documentType}_${Date.now()}.${file.name.split('.').pop()}`;

      const { data: uploadData, error: uploadError } = await storage.upload('employee-documents', fileName, file);

      if (uploadError) throw uploadError;

      // Update employee record with document reference
      const { data: employee, error: fetchError } = await this.getById(employeeId);
      if (fetchError) throw fetchError;

      const documents = employee.documents || [];
      documents.push({
        type: documentType,
        fileName: file.name,
        filePath: fileName,
        uploadedAt: new Date().toISOString()
      });

      const { data, error } = await this.update(employeeId, { documents });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }
}

// Sales Report Service
export class SalesReportService extends BaseService {
  constructor() {
    super('sales_reports');
  }

  async getSalesReportsByDateRange(startDate: string, endDate: string, stationId?: string) {
    try {
      let query = supabase.
      from('sales_reports').
      select(`
          *,
          stations(name),
          employees(first_name, last_name)
        `).
      gte('report_date', startDate).
      lte('report_date', endDate).
      order('report_date', { ascending: false });

      if (stationId) {
        query = query.eq('station_id', stationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async getSalesAnalytics(stationId?: string, period: 'week' | 'month' | 'year' = 'month') {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }

      let query = supabase.
      from('sales_reports').
      select('total_sales, cash_sales, card_sales, fuel_sales, retail_sales, lottery_sales, report_date').
      gte('report_date', startDate.toISOString().split('T')[0]).
      order('report_date');

      if (stationId) {
        query = query.eq('station_id', stationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }
}

// Delivery Service
export class DeliveryService extends BaseService {
  constructor() {
    super('deliveries');
  }

  async getDeliveriesByDateRange(startDate: string, endDate: string, stationId?: string) {
    try {
      let query = supabase.
      from('deliveries').
      select(`
          *,
          stations(name),
          employees(first_name, last_name)
        `).
      gte('delivery_date', startDate).
      lte('delivery_date', endDate).
      order('delivery_date', { ascending: false });

      if (stationId) {
        query = query.eq('station_id', stationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }
}

// License Service
export class LicenseService extends BaseService {
  constructor() {
    super('licenses');
  }

  async getExpiringLicenses(daysAhead: number = 30, stationId?: string) {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysAhead);

      let query = supabase.
      from('licenses').
      select(`
          *,
          stations(name)
        `).
      lte('expiry_date', expiryDate.toISOString().split('T')[0]).
      eq('status', 'Active').
      order('expiry_date');

      if (stationId) {
        query = query.eq('station_id', stationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }
}

// Vendor Service
export class VendorService extends BaseService {
  constructor() {
    super('vendors');
  }
}

// Order Service
export class OrderService extends BaseService {
  constructor() {
    super('orders');
  }

  async getOrdersWithDetails(stationId?: string) {
    try {
      let query = supabase.
      from('orders').
      select(`
          *,
          vendors(name, contact_person),
          stations(name),
          employees(first_name, last_name)
        `).
      order('order_date', { ascending: false });

      if (stationId) {
        query = query.eq('station_id', stationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }
}

// Salary Service
export class SalaryService extends BaseService {
  constructor() {
    super('salary_records');
  }

  async getSalaryRecordsByEmployee(employeeId: string, year?: number) {
    try {
      let query = supabase.
      from('salary_records').
      select(`
          *,
          employees(first_name, last_name, employee_id)
        `).
      eq('employee_id', employeeId).
      order('pay_period_start', { ascending: false });

      if (year) {
        const startOfYear = `${year}-01-01`;
        const endOfYear = `${year}-12-31`;
        query = query.gte('pay_period_start', startOfYear).lte('pay_period_start', endOfYear);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }
}

// User Profile Service
export class UserProfileService extends BaseService {
  constructor() {
    super('user_profiles');
  }

  async createUserProfile(userId: string, profileData: any) {
    try {
      const { data, error } = await supabase.
      from('user_profiles').
      insert({
        user_id: userId,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).
      select().
      single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async getUserProfileByUserId(userId: string) {
    try {
      const { data, error } = await supabase.
      from('user_profiles').
      select(`
          *,
          stations(name, address, phone)
        `).
      eq('user_id', userId).
      single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async updateUserPermissions(userId: string, permissions: any) {
    try {
      const { data, error } = await supabase.
      from('user_profiles').
      update({
        detailed_permissions: permissions,
        updated_at: new Date().toISOString()
      }).
      eq('user_id', userId).
      select().
      single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }
}

// Audit Log Service
export class AuditLogService extends BaseService {
  constructor() {
    super('audit_logs');
  }

  async logActivity(userId: string, action: string, tableName: string, recordId?: string, oldValues?: any, newValues?: any) {
    try {
      const { data, error } = await supabase.
      from('audit_logs').
      insert({
        user_id: userId,
        action,
        table_name: tableName,
        record_id: recordId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
}

// Export service instances
export const stationService = new StationService();
export const productService = new ProductService();
export const employeeService = new EmployeeService();
export const salesReportService = new SalesReportService();
export const deliveryService = new DeliveryService();
export const licenseService = new LicenseService();
export const vendorService = new VendorService();
export const orderService = new OrderService();
export const salaryService = new SalaryService();
export const userProfileService = new UserProfileService();
export const auditLogService = new AuditLogService();