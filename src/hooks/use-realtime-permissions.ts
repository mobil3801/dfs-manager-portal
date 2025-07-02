import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  print: boolean;
}

interface UserPermissions {
  [module: string]: ModulePermissions;
}

const defaultModulePermissions: ModulePermissions = {
  view: true,
  create: false,
  edit: false,
  delete: false,
  export: false,
  print: false
};

export const useRealtimePermissions = (module: string = 'products') => {
  const { userProfile } = useAuth();
  const [permissions, setPermissions] = useState<ModulePermissions>(defaultModulePermissions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin (admins have all permissions)
  const isAdmin = userProfile?.role === 'Administrator';

  const loadPermissions = useCallback(async () => {
    if (!userProfile?.user_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Administrators always have full permissions
      if (isAdmin) {
        const adminPermissions: ModulePermissions = {
          view: true,
          create: true,
          edit: true,
          delete: true,
          export: true,
          print: true
        };
        setPermissions(adminPermissions);
        setLoading(false);
        return;
      }

      // Load permissions from database for non-admin users
      const { data, error: fetchError } = await window.ezsite.apis.tablePage('11725', {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'ID',
        IsAsc: true,
        Filters: [
          { name: 'user_id', op: 'Equal', value: userProfile.user_id }
        ]
      });

      if (fetchError) throw fetchError;

      const userProfileData = data?.List?.[0];
      if (userProfileData) {
        let userPermissions: UserPermissions = {};
        
        try {
          if (userProfileData.detailed_permissions) {
            userPermissions = JSON.parse(userProfileData.detailed_permissions);
          }
        } catch (parseError) {
          console.warn('Failed to parse user permissions, using defaults');
        }

        const modulePermissions = userPermissions[module] || defaultModulePermissions;
        setPermissions(modulePermissions);
      } else {
        setPermissions(defaultModulePermissions);
      }
    } catch (err) {
      console.error('Error loading permissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load permissions');
      setPermissions(defaultModulePermissions);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.user_id, module, isAdmin]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // Permission checking functions
  const hasPermission = useCallback((permissionType: keyof ModulePermissions): boolean => {
    if (isAdmin) return true;
    return permissions[permissionType] || false;
  }, [permissions, isAdmin]);

  const checkPermission = useCallback((permissionType: keyof ModulePermissions, action: string = 'perform this action'): boolean => {
    const hasAccess = hasPermission(permissionType);
    
    if (!hasAccess) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to ${action}. Contact your administrator for access.`,
        variant: "destructive"
      });
    }
    
    return hasAccess;
  }, [hasPermission]);

  // Specific permission checks
  const canView = useCallback(() => hasPermission('view'), [hasPermission]);
  const canCreate = useCallback(() => hasPermission('create'), [hasPermission]);
  const canEdit = useCallback(() => hasPermission('edit'), [hasPermission]);
  const canDelete = useCallback(() => hasPermission('delete'), [hasPermission]);
  const canExport = useCallback(() => hasPermission('export'), [hasPermission]);
  const canPrint = useCallback(() => hasPermission('print'), [hasPermission]);

  // Permission check with user feedback
  const checkView = useCallback(() => checkPermission('view', 'view this content'), [checkPermission]);
  const checkCreate = useCallback(() => checkPermission('create', 'create new items'), [checkPermission]);
  const checkEdit = useCallback(() => checkPermission('edit', 'edit this item'), [checkPermission]);
  const checkDelete = useCallback(() => checkPermission('delete', 'delete this item'), [checkPermission]);
  const checkExport = useCallback(() => checkPermission('export', 'export data'), [checkPermission]);
  const checkPrint = useCallback(() => checkPermission('print', 'print this content'), [checkPermission]);

  // Refresh permissions (useful for real-time updates)
  const refreshPermissions = useCallback(() => {
    loadPermissions();
  }, [loadPermissions]);

  return {
    permissions,
    loading,
    error,
    isAdmin,
    
    // Permission checking functions
    hasPermission,
    checkPermission,
    
    // Specific permission checks (boolean only)
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    canPrint,
    
    // Permission checks with user feedback
    checkView,
    checkCreate,
    checkEdit,
    checkDelete,
    checkExport,
    checkPrint,
    
    // Utility functions
    refreshPermissions
  };
};

export default useRealtimePermissions;