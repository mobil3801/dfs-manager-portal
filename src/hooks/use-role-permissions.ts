
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RolePermissions {
  role: string;
  station: string;
  permissions: {
    [feature: string]: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
      manage: boolean;
    };
  };
}

interface UserProfile {
  id: number;
  user_id: number;
  role: string;
  station: string;
  employee_id: string;
  phone: string;
  hire_date: string;
  is_active: boolean;
  detailed_permissions: string;
}

export const useRolePermissions = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  console.log('useRolePermissions: Hook initialized', { user });

  const loadUserProfile = useCallback(async () => {
    if (!user?.ID) {
      console.log('useRolePermissions: No user ID available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('useRolePermissions: Loading user profile for user ID:', user.ID);

      const { data, error } = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'id',
        IsAsc: false,
        Filters: [
          {
            name: 'user_id',
            op: 'Equal',
            value: user.ID
          }
        ]
      });

      if (error) throw error;

      const profile = data?.List?.[0];
      console.log('useRolePermissions: User profile loaded:', profile);

      if (profile) {
        setUserProfile(profile);
        
        // Parse detailed permissions
        let permissions = {};
        try {
          permissions = JSON.parse(profile.detailed_permissions || '{}');
        } catch (e) {
          console.warn('useRolePermissions: Failed to parse permissions, using defaults');
          permissions = getDefaultPermissions(profile.role);
        }

        setRolePermissions({
          role: profile.role,
          station: profile.station,
          permissions
        });
      } else {
        // Create default profile for new users
        console.log('useRolePermissions: No profile found, creating default');
        const defaultProfile = {
          user_id: user.ID,
          role: 'Employee',
          station: 'MOBIL',
          employee_id: '',
          phone: '',
          hire_date: new Date().toISOString(),
          is_active: true,
          detailed_permissions: JSON.stringify(getDefaultPermissions('Employee'))
        };

        const { error: createError } = await window.ezsite.apis.tableCreate(11725, defaultProfile);
        
        if (!createError) {
          setRolePermissions({
            role: 'Employee',
            station: 'MOBIL',
            permissions: getDefaultPermissions('Employee')
          });
        }
      }
    } catch (error) {
      console.error('useRolePermissions: Error loading user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user permissions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user?.ID, toast]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const getDefaultPermissions = (role: string) => {
    const basePermissions = {
      dashboard: { view: false, create: false, edit: false, delete: false, manage: false },
      users: { view: false, create: false, edit: false, delete: false, manage: false },
      products: { view: false, create: false, edit: false, delete: false, manage: false },
      employees: { view: false, create: false, edit: false, delete: false, manage: false },
      sales: { view: false, create: false, edit: false, delete: false, manage: false },
      vendors: { view: false, create: false, edit: false, delete: false, manage: false },
      orders: { view: false, create: false, edit: false, delete: false, manage: false },
      licenses: { view: false, create: false, edit: false, delete: false, manage: false },
      salary: { view: false, create: false, edit: false, delete: false, manage: false },
      inventory: { view: false, create: false, edit: false, delete: false, manage: false },
      delivery: { view: false, create: false, edit: false, delete: false, manage: false },
      settings: { view: false, create: false, edit: false, delete: false, manage: false },
      reports: { view: false, create: false, edit: false, delete: false, manage: false },
      audit: { view: false, create: false, edit: false, delete: false, manage: false },
      admin: { view: false, create: false, edit: false, delete: false, manage: false }
    };

    switch (role) {
      case 'Administrator':
        Object.keys(basePermissions).forEach(key => {
          basePermissions[key] = { view: true, create: true, edit: true, delete: true, manage: true };
        });
        break;

      case 'Management':
        basePermissions.dashboard = { view: true, create: false, edit: false, delete: false, manage: true };
        basePermissions.products = { view: true, create: true, edit: true, delete: false, manage: true };
        basePermissions.employees = { view: true, create: true, edit: true, delete: false, manage: true };
        basePermissions.sales = { view: true, create: true, edit: true, delete: false, manage: true };
        basePermissions.vendors = { view: true, create: true, edit: true, delete: false, manage: false };
        basePermissions.orders = { view: true, create: true, edit: true, delete: false, manage: true };
        basePermissions.salary = { view: true, create: true, edit: true, delete: false, manage: true };
        basePermissions.inventory = { view: true, create: true, edit: true, delete: false, manage: true };
        basePermissions.delivery = { view: true, create: true, edit: true, delete: false, manage: true };
        basePermissions.reports = { view: true, create: true, edit: false, delete: false, manage: true };
        basePermissions.settings = { view: true, create: false, edit: false, delete: false, manage: false };
        break;

      case 'Employee':
        basePermissions.dashboard = { view: true, create: false, edit: false, delete: false, manage: false };
        basePermissions.products = { view: true, create: false, edit: false, delete: false, manage: false };
        basePermissions.sales = { view: true, create: true, edit: true, delete: false, manage: false };
        basePermissions.vendors = { view: true, create: false, edit: false, delete: false, manage: false };
        basePermissions.orders = { view: true, create: false, edit: false, delete: false, manage: false };
        basePermissions.inventory = { view: true, create: false, edit: false, delete: false, manage: false };
        basePermissions.delivery = { view: true, create: true, edit: false, delete: false, manage: false };
        break;
    }

    return basePermissions;
  };

  const hasPermission = useCallback((feature: string, action: 'view' | 'create' | 'edit' | 'delete' | 'manage'): boolean => {
    if (!rolePermissions) return false;
    
    const featurePermissions = rolePermissions.permissions[feature];
    if (!featurePermissions) return false;
    
    return featurePermissions[action] === true;
  }, [rolePermissions]);

  const hasAnyPermission = useCallback((feature: string): boolean => {
    if (!rolePermissions) return false;
    
    const featurePermissions = rolePermissions.permissions[feature];
    if (!featurePermissions) return false;
    
    return Object.values(featurePermissions).some(permission => permission === true);
  }, [rolePermissions]);

  const isAdmin = rolePermissions?.role === 'Administrator';
  const isManagement = rolePermissions?.role === 'Management';
  const isEmployee = rolePermissions?.role === 'Employee';

  const canAccessStation = useCallback((station: string): boolean => {
    if (!rolePermissions) return false;
    if (isAdmin) return true;
    if (rolePermissions.station === 'All Stations') return true;
    return rolePermissions.station === station;
  }, [rolePermissions, isAdmin]);

  console.log('useRolePermissions: Current state:', {
    role: rolePermissions?.role,
    station: rolePermissions?.station,
    isAdmin,
    isManagement,
    isEmployee,
    loading
  });

  return {
    userProfile,
    rolePermissions,
    loading,
    hasPermission,
    hasAnyPermission,
    canAccessStation,
    isAdmin,
    isManagement,
    isEmployee,
    refreshPermissions: loadUserProfile
  };
};

export default useRolePermissions;
