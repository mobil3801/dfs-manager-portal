import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface UserPermissions {
  dashboard: Permission;
  products: Permission;
  employees: Permission;
  sales: Permission;
  vendors: Permission;
  orders: Permission;
  licenses: Permission;
  salary: Permission;
  inventory: Permission;
  delivery: Permission;
  settings: Permission;
  admin: Permission;
  [key: string]: Permission;
}

interface UseEnhancedPermissionsReturn {
  permissions: UserPermissions | null;
  userRole: string;
  userStation: string;
  hasPermission: (module: string, action: 'view' | 'create' | 'edit' | 'delete') => boolean;
  hasStationAccess: (station: string) => boolean;
  hasAllStationsAccess: () => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isEmployee: () => boolean;
  refreshPermissions: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const DEFAULT_PERMISSIONS: UserPermissions = {
  dashboard: { view: false, create: false, edit: false, delete: false },
  products: { view: false, create: false, edit: false, delete: false },
  employees: { view: false, create: false, edit: false, delete: false },
  sales: { view: false, create: false, edit: false, delete: false },
  vendors: { view: false, create: false, edit: false, delete: false },
  orders: { view: false, create: false, edit: false, delete: false },
  licenses: { view: false, create: false, edit: false, delete: false },
  salary: { view: false, create: false, edit: false, delete: false },
  inventory: { view: false, create: false, edit: false, delete: false },
  delivery: { view: false, create: false, edit: false, delete: false },
  settings: { view: false, create: false, edit: false, delete: false },
  admin: { view: false, create: false, edit: false, delete: false }
};

export const useEnhancedPermissions = (): UseEnhancedPermissionsReturn => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [userRole, setUserRole] = useState<string>('Employee');
  const [userStation, setUserStation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserPermissions = useCallback(async () => {
    if (!isAuthenticated || !user?.ID) {
      setPermissions(DEFAULT_PERMISSIONS);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user profile with permissions
      const response = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: "id",
        IsAsc: false,
        Filters: [
        { name: "user_id", op: "Equal", value: user.ID }]

      });

      if (response.error) {
        throw new Error(response.error);
      }

      const userProfile = response.data?.List?.[0];

      if (userProfile) {
        setUserRole(userProfile.role || 'Employee');
        setUserStation(userProfile.station || '');

        // Parse detailed permissions
        try {
          const detailedPermissions = userProfile.detailed_permissions ?
          JSON.parse(userProfile.detailed_permissions) :
          DEFAULT_PERMISSIONS;

          setPermissions({
            ...DEFAULT_PERMISSIONS,
            ...detailedPermissions
          });
        } catch (parseError) {
          console.error('Error parsing permissions:', parseError);
          setPermissions(DEFAULT_PERMISSIONS);
        }
      } else {
        // No profile found, create one with default Employee permissions
        const newProfile = {
          user_id: user.ID,
          role: 'Employee',
          station: '',
          employee_id: `EMP${Date.now()}`,
          phone: '',
          hire_date: new Date().toISOString(),
          is_active: true,
          detailed_permissions: JSON.stringify(DEFAULT_PERMISSIONS)
        };

        const createResponse = await window.ezsite.apis.tableCreate(11725, newProfile);
        if (createResponse.error) {
          throw new Error(createResponse.error);
        }

        setUserRole('Employee');
        setUserStation('');
        setPermissions(DEFAULT_PERMISSIONS);
      }
    } catch (error) {
      console.error('Error loading user permissions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load permissions');
      setPermissions(DEFAULT_PERMISSIONS);

      toast({
        title: "Permission Error",
        description: "Failed to load user permissions. Using default settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.ID, toast]);

  useEffect(() => {
    loadUserPermissions();
  }, [loadUserPermissions]);

  const hasPermission = useCallback((module: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    if (!permissions) return false;

    const modulePermissions = permissions[module];
    if (!modulePermissions) return false;

    return modulePermissions[action] === true;
  }, [permissions]);

  const hasStationAccess = useCallback((station: string): boolean => {
    if (!userStation) return false;

    // Admin and users with "ALL" station access can access any station
    if (userRole === 'Administrator' || userStation === 'ALL') {
      return true;
    }

    // Otherwise, check if user's station matches the requested station
    return userStation === station;
  }, [userRole, userStation]);

  const hasAllStationsAccess = useCallback((): boolean => {
    return userRole === 'Administrator' || userStation === 'ALL';
  }, [userRole, userStation]);

  const isAdmin = useCallback((): boolean => {
    return userRole === 'Administrator';
  }, [userRole]);

  const isManager = useCallback((): boolean => {
    return userRole === 'Management' || userRole === 'Administrator';
  }, [userRole]);

  const isEmployee = useCallback((): boolean => {
    return userRole === 'Employee';
  }, [userRole]);

  const refreshPermissions = useCallback(async (): Promise<void> => {
    await loadUserPermissions();
  }, [loadUserPermissions]);

  return {
    permissions,
    userRole,
    userStation,
    hasPermission,
    hasStationAccess,
    hasAllStationsAccess,
    isAdmin,
    isManager,
    isEmployee,
    refreshPermissions,
    loading,
    error
  };
};

export default useEnhancedPermissions;