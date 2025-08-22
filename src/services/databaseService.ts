// Database Service using EasySite built-in database
import { EasySiteDB as EasySiteDatabase, TABLE_IDS, databaseService as easySiteService } from '@/lib/easysite-db';

// User Profile Service for EasySite
export const userProfileService = {
  getUserProfileByUserId: async (userId: string) => {
    try {
      console.log('🔍 Fetching user profile for user ID:', userId);

      const response = await EasySiteDatabase.tablePage(TABLE_IDS.USER_PROFILES, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
        { name: 'user_id', op: 'Equal', value: parseInt(userId) }]

      });

      if (response.error) {
        console.error('User profile fetch error:', response.error);
        return { data: null, error: { message: response.error } };
      }

      const profile = response.data?.List?.[0] || null;

      if (!profile) {
        return { data: null, error: { message: 'No rows found' } };
      }

      // Fetch station info if profile has station
      let stationData = null;
      if (profile.station) {
        try {
          const stationResponse = await EasySiteDatabase.tablePage(TABLE_IDS.STATIONS, {
            PageNo: 1,
            PageSize: 1,
            Filters: [
            { name: 'name', op: 'Equal', value: profile.station }]

          });

          if (stationResponse.data?.List?.[0]) {
            stationData = {
              name: stationResponse.data.List[0].name || '',
              address: stationResponse.data.List[0].address || '',
              phone: stationResponse.data.List[0].phone || ''
            };
          }
        } catch (error) {
          console.warn('Failed to fetch station data:', error);
        }
      }

      const profileWithStation = {
        ...profile,
        id: profile.id?.toString() || '0',
        user_id: profile.user_id?.toString() || '0',
        stations: stationData
      };

      console.log('✅ User profile fetched successfully:', profileWithStation);
      return { data: profileWithStation, error: null };

    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      return { data: null, error };
    }
  },

  createUserProfile: async (userId: string, profileData: any) => {
    try {
      console.log('📝 Creating user profile for user ID:', userId, profileData);

      const response = await EasySiteDatabase.tableCreate(TABLE_IDS.USER_PROFILES, {
        user_id: parseInt(userId),
        ...profileData
      });

      if (response.error) {
        console.error('User profile creation error:', response.error);
        return { data: null, error: { message: response.error } };
      }

      const createdProfile = {
        ...response.data,
        id: response.data?.id?.toString() || '0',
        user_id: response.data?.user_id?.toString() || userId
      };

      console.log('✅ User profile created successfully:', createdProfile);
      return { data: createdProfile, error: null };

    } catch (error: any) {
      console.error('Error creating user profile:', error);
      return { data: null, error };
    }
  },

  updateUserProfile: async (userId: string, profileData: any) => {
    try {
      console.log('📝 Updating user profile for user ID:', userId, profileData);

      // First get the profile ID
      const existingProfile = await userProfileService.getUserProfileByUserId(userId);

      if (!existingProfile.data) {
        return { data: null, error: { message: 'Profile not found' } };
      }

      const response = await EasySiteDatabase.tableUpdate(TABLE_IDS.USER_PROFILES, {
        id: parseInt(existingProfile.data.id),
        ...profileData
      });

      if (response.error) {
        console.error('User profile update error:', response.error);
        return { data: null, error: { message: response.error } };
      }

      const updatedProfile = {
        ...response.data,
        id: response.data?.id?.toString() || existingProfile.data.id,
        user_id: response.data?.user_id?.toString() || userId
      };

      console.log('✅ User profile updated successfully:', updatedProfile);
      return { data: updatedProfile, error: null };

    } catch (error: any) {
      console.error('Error updating user profile:', error);
      return { data: null, error };
    }
  }
};

// Audit Log Service for EasySite
export const auditLogService = {
  logActivity: async (
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  oldValues?: any,
  newValues?: any) =>
  {
    try {
      console.log('📊 Logging audit activity:', { userId, action, resourceType, resourceId });

      const response = await EasySiteDatabase.tableCreate(TABLE_IDS.AUDIT_LOGS, {
        user_id: parseInt(userId) || 0,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        old_values: oldValues ? JSON.stringify(oldValues) : null,
        new_values: newValues ? JSON.stringify(newValues) : null,
        timestamp: new Date().toISOString()
      });

      if (response.error) {
        console.warn('Audit logging failed:', response.error);
        return { data: null, error: response.error };
      }

      console.log('✅ Audit activity logged successfully');
      return { data: response.data, error: null };

    } catch (error: any) {
      console.warn('Failed to log audit activity:', error);
      // Don't throw - audit logging failures shouldn't break functionality
      return { data: null, error };
    }
  }
};

// Station Service for EasySite
export const stationService = {
  getAll: async () => {
    try {
      console.log('🏪 Fetching all active stations');

      const response = await EasySiteDatabase.tablePage(TABLE_IDS.STATIONS, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'name',
        IsAsc: true,
        Filters: [
        { name: 'is_active', op: 'Equal', value: true }]

      });

      if (response.error) {
        console.error('Stations fetch error:', response.error);
        return { data: null, error: { message: response.error } };
      }

      console.log('✅ Stations fetched successfully:', response.data?.List?.length || 0);
      return { data: response.data?.List || [], error: null };

    } catch (error: any) {
      console.error('Error fetching stations:', error);
      return { data: null, error };
    }
  },

  getAllStations: async () => {
    // Alias for getAll for compatibility
    return stationService.getAll();
  },

  getStationById: async (stationId: string) => {
    try {
      console.log('🏪 Fetching station by ID:', stationId);

      const response = await EasySiteDatabase.tablePage(TABLE_IDS.STATIONS, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
        { name: 'id', op: 'Equal', value: parseInt(stationId) }]

      });

      if (response.error) {
        console.error('Station fetch error:', response.error);
        return { data: null, error: { message: response.error } };
      }

      const station = response.data?.List?.[0] || null;
      console.log('✅ Station fetched successfully:', station);
      return { data: station, error: null };

    } catch (error: any) {
      console.error('Error fetching station:', error);
      return { data: null, error };
    }
  }
};

// Generic database operations using EasySite
export const databaseService = {
  // Generic select
  select: async (tableName: string, columns = '*', filters?: any) => {
    try {
      console.log(`🔍 Generic select from ${tableName}`, filters);

      // Map table names to table IDs
      const tableMapping: Record<string, number> = {
        'products': TABLE_IDS.PRODUCTS,
        'employees': TABLE_IDS.EMPLOYEES,
        'vendors': TABLE_IDS.VENDORS,
        'orders': TABLE_IDS.ORDERS,
        'licenses': TABLE_IDS.LICENSES_CERTIFICATES,
        'licenses_certificates': TABLE_IDS.LICENSES_CERTIFICATES,
        'daily_sales_reports': TABLE_IDS.DAILY_SALES_REPORTS,
        'sales_reports': TABLE_IDS.DAILY_SALES_REPORTS,
        'salary_records': TABLE_IDS.SALARY_RECORDS,
        'salaries': TABLE_IDS.SALARY_RECORDS,
        'delivery_records': TABLE_IDS.DELIVERY_RECORDS,
        'deliveries': TABLE_IDS.DELIVERY_RECORDS,
        'stations': TABLE_IDS.STATIONS,
        'user_profiles': TABLE_IDS.USER_PROFILES,
        'audit_logs': TABLE_IDS.AUDIT_LOGS,
        'file_uploads': TABLE_IDS.FILE_UPLOADS
      };

      const tableId = tableMapping[tableName];
      if (!tableId) {
        throw new Error(`Unknown table: ${tableName}`);
      }

      // Convert filters to EasySite format
      const easySiteFilters = filters ? Object.entries(filters).map(([key, value]) => ({
        name: key,
        op: 'Equal' as const,
        value
      })) : undefined;

      const response = await EasySiteDatabase.tablePage(tableId, {
        PageNo: 1,
        PageSize: 1000,
        Filters: easySiteFilters
      });

      if (response.error) {
        console.error(`Select error from ${tableName}:`, response.error);
        return { data: null, error: { message: response.error } };
      }

      console.log(`✅ Generic select from ${tableName} successful:`, response.data?.List?.length || 0);
      return { data: response.data?.List || [], error: null };

    } catch (error: any) {
      console.error(`Error selecting from ${tableName}:`, error);
      return { data: null, error };
    }
  },

  // Generic insert
  insert: async (tableName: string, data: any) => {
    try {
      console.log(`📝 Generic insert into ${tableName}`, data);

      // Map table names to table IDs
      const tableMapping: Record<string, number> = {
        'products': TABLE_IDS.PRODUCTS,
        'employees': TABLE_IDS.EMPLOYEES,
        'vendors': TABLE_IDS.VENDORS,
        'orders': TABLE_IDS.ORDERS,
        'licenses': TABLE_IDS.LICENSES_CERTIFICATES,
        'licenses_certificates': TABLE_IDS.LICENSES_CERTIFICATES,
        'daily_sales_reports': TABLE_IDS.DAILY_SALES_REPORTS,
        'sales_reports': TABLE_IDS.DAILY_SALES_REPORTS,
        'salary_records': TABLE_IDS.SALARY_RECORDS,
        'salaries': TABLE_IDS.SALARY_RECORDS,
        'delivery_records': TABLE_IDS.DELIVERY_RECORDS,
        'deliveries': TABLE_IDS.DELIVERY_RECORDS,
        'stations': TABLE_IDS.STATIONS,
        'user_profiles': TABLE_IDS.USER_PROFILES,
        'audit_logs': TABLE_IDS.AUDIT_LOGS,
        'file_uploads': TABLE_IDS.FILE_UPLOADS
      };

      const tableId = tableMapping[tableName];
      if (!tableId) {
        throw new Error(`Unknown table: ${tableName}`);
      }

      const response = await EasySiteDatabase.tableCreate(tableId, data);

      if (response.error) {
        console.error(`Insert error into ${tableName}:`, response.error);
        return { data: null, error: { message: response.error } };
      }

      console.log(`✅ Generic insert into ${tableName} successful`);
      return { data: response.data ? [response.data] : [], error: null };

    } catch (error: any) {
      console.error(`Error inserting into ${tableName}:`, error);
      return { data: null, error };
    }
  },

  // Generic update
  update: async (tableName: string, id: string, data: any) => {
    try {
      console.log(`📝 Generic update ${tableName} ID ${id}`, data);

      // Map table names to table IDs
      const tableMapping: Record<string, number> = {
        'products': TABLE_IDS.PRODUCTS,
        'employees': TABLE_IDS.EMPLOYEES,
        'vendors': TABLE_IDS.VENDORS,
        'orders': TABLE_IDS.ORDERS,
        'licenses': TABLE_IDS.LICENSES_CERTIFICATES,
        'licenses_certificates': TABLE_IDS.LICENSES_CERTIFICATES,
        'daily_sales_reports': TABLE_IDS.DAILY_SALES_REPORTS,
        'sales_reports': TABLE_IDS.DAILY_SALES_REPORTS,
        'salary_records': TABLE_IDS.SALARY_RECORDS,
        'salaries': TABLE_IDS.SALARY_RECORDS,
        'delivery_records': TABLE_IDS.DELIVERY_RECORDS,
        'deliveries': TABLE_IDS.DELIVERY_RECORDS,
        'stations': TABLE_IDS.STATIONS,
        'user_profiles': TABLE_IDS.USER_PROFILES,
        'audit_logs': TABLE_IDS.AUDIT_LOGS,
        'file_uploads': TABLE_IDS.FILE_UPLOADS
      };

      const tableId = tableMapping[tableName];
      if (!tableId) {
        throw new Error(`Unknown table: ${tableName}`);
      }

      const response = await EasySiteDatabase.tableUpdate(tableId, {
        id: parseInt(id),
        ...data
      });

      if (response.error) {
        console.error(`Update error ${tableName}:`, response.error);
        return { data: null, error: { message: response.error } };
      }

      console.log(`✅ Generic update ${tableName} successful`);
      return { data: response.data ? [response.data] : [], error: null };

    } catch (error: any) {
      console.error(`Error updating ${tableName}:`, error);
      return { data: null, error };
    }
  },

  // Generic delete
  delete: async (tableName: string, id: string) => {
    try {
      console.log(`🗑️ Generic delete from ${tableName} ID ${id}`);

      // Map table names to table IDs
      const tableMapping: Record<string, number> = {
        'products': TABLE_IDS.PRODUCTS,
        'employees': TABLE_IDS.EMPLOYEES,
        'vendors': TABLE_IDS.VENDORS,
        'orders': TABLE_IDS.ORDERS,
        'licenses': TABLE_IDS.LICENSES_CERTIFICATES,
        'licenses_certificates': TABLE_IDS.LICENSES_CERTIFICATES,
        'daily_sales_reports': TABLE_IDS.DAILY_SALES_REPORTS,
        'sales_reports': TABLE_IDS.DAILY_SALES_REPORTS,
        'salary_records': TABLE_IDS.SALARY_RECORDS,
        'salaries': TABLE_IDS.SALARY_RECORDS,
        'delivery_records': TABLE_IDS.DELIVERY_RECORDS,
        'deliveries': TABLE_IDS.DELIVERY_RECORDS,
        'stations': TABLE_IDS.STATIONS,
        'user_profiles': TABLE_IDS.USER_PROFILES,
        'audit_logs': TABLE_IDS.AUDIT_LOGS,
        'file_uploads': TABLE_IDS.FILE_UPLOADS
      };

      const tableId = tableMapping[tableName];
      if (!tableId) {
        throw new Error(`Unknown table: ${tableName}`);
      }

      const response = await EasySiteDatabase.tableDelete(tableId, { id: parseInt(id) });

      if (response.error) {
        console.error(`Delete error from ${tableName}:`, response.error);
        return { error: { message: response.error } };
      }

      console.log(`✅ Generic delete from ${tableName} successful`);
      return { error: null };

    } catch (error: any) {
      console.error(`Error deleting from ${tableName}:`, error);
      return { error };
    }
  }
};

// Export all services
export default {
  userProfileService,
  auditLogService,
  stationService,
  databaseService
};