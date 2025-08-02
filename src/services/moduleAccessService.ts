import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface ModuleAccessRecord {
  id: string;
  user_id: string;
  module_name: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  station_restrictions: string[];
  created_at: string;
  updated_at: string;
}

class ModuleAccessService {
  private tableName = 'module_access';

  async getUserModuleAccess(userId: string): Promise<ModuleAccessRecord[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching user module access:', error);
      return [];
    }
  }

  async createDefaultModuleAccess(userId: string, role: string = 'Employee'): Promise<boolean> {
    try {
      const defaultModules = [
        'products',
        'employees', 
        'sales',
        'vendors',
        'orders',
        'licenses',
        'salary',
        'delivery'
      ];

      const moduleAccessRecords = defaultModules.map(moduleName => {
        let permissions = { view: false, create: false, edit: false, delete: false };

        // Set permissions based on role
        switch (role.toLowerCase()) {
          case 'administrator':
          case 'admin':
            permissions = { view: true, create: true, edit: true, delete: true };
            break;
          case 'management':
          case 'manager':
            permissions = { view: true, create: true, edit: true, delete: false };
            break;
          case 'employee':
          default:
            permissions = { view: true, create: false, edit: false, delete: false };
            break;
        }

        return {
          user_id: userId,
          module_name: moduleName,
          can_view: permissions.view,
          can_create: permissions.create,
          can_edit: permissions.edit,
          can_delete: permissions.delete,
          station_restrictions: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });

      const { error } = await supabase
        .from(this.tableName)
        .insert(moduleAccessRecords);

      if (error) throw error;

      console.log(`Created default module access for user ${userId} with role ${role}`);
      return true;
    } catch (error: any) {
      console.error('Error creating default module access:', error);
      return false;
    }
  }

  async updateModuleAccess(
    userId: string, 
    moduleName: string, 
    permissions: Partial<{
      can_view: boolean;
      can_create: boolean;
      can_edit: boolean;
      can_delete: boolean;
      station_restrictions: string[];
    }>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .upsert({
          user_id: userId,
          module_name: moduleName,
          ...permissions,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Module permissions updated successfully'
      });

      return true;
    } catch (error: any) {
      console.error('Error updating module access:', error);
      toast({
        title: 'Error',
        description: 'Failed to update module permissions',
        variant: 'destructive'
      });
      return false;
    }
  }

  async hasPermission(
    userId: string, 
    moduleName: string, 
    action: 'view' | 'create' | 'edit' | 'delete'
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`can_${action}`)
        .eq('user_id', userId)
        .eq('module_name', moduleName)
        .single();

      if (error || !data) return false;
      return data[`can_${action}`] || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  async bulkUpdateUserPermissions(
    userId: string, 
    modulePermissions: Array<{
      module_name: string;
      can_view: boolean;
      can_create: boolean;
      can_edit: boolean;
      can_delete: boolean;
    }>
  ): Promise<boolean> {
    try {
      const records = modulePermissions.map(permission => ({
        user_id: userId,
        ...permission,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from(this.tableName)
        .upsert(records);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User permissions updated successfully'
      });

      return true;
    } catch (error: any) {
      console.error('Error bulk updating permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user permissions',
        variant: 'destructive'
      });
      return false;
    }
  }

  async deleteUserModuleAccess(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error deleting user module access:', error);
      return false;
    }
  }

  // Helper function to get permissions for a user with caching
  private permissionCache = new Map<string, { permissions: ModuleAccessRecord[], timestamp: number }>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  async getCachedUserPermissions(userId: string): Promise<ModuleAccessRecord[]> {
    const cacheKey = userId;
    const cached = this.permissionCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
      return cached.permissions;
    }

    const permissions = await this.getUserModuleAccess(userId);
    this.permissionCache.set(cacheKey, {
      permissions,
      timestamp: Date.now()
    });

    return permissions;
  }

  clearPermissionCache(userId?: string): void {
    if (userId) {
      this.permissionCache.delete(userId);
    } else {
      this.permissionCache.clear();
    }
  }
}

export const moduleAccessService = new ModuleAccessService();
export default ModuleAccessService;