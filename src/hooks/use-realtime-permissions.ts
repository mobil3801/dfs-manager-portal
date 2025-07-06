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

interface UserProfile {
  ID: number;
  user_id: number;
  role: string;
  station: string;
  employee_id: string;
  detailed_permissions: string;
  is_active: boolean;
}

export const useRealtimePermissions = (module: string) => {
  const { userProfile } = useAuth();
  const [permissions, setPermissions] = useState<ModulePermissions>({
    view: true,
    create: false,
    edit: false,
    delete: false,
    export: false,
    print: false
  });
  const [loading, setLoading] = useState(true);

  // Check if current user is admin
  const isAdmin = userProfile?.role === 'Administrator';

  // Load user permissions from database
  const loadPermissions = useCallback(async () => {
    if (!userProfile?.user_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch user profile with permissions
      const { data, error } = await window.ezsite.apis.tablePage('11725', {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'ID',
        IsAsc: true,
        Filters: [
          { name: 'user_id', op: 'Equal', value: userProfile.user_id }
        ]
      });

      if (error) throw error;

      const user = data?.List?.[0];
      if (user) {
        let userPermissions = {};
        if (user.detailed_permissions) {
          try {
            userPermissions = JSON.parse(user.detailed_permissions);
          } catch (parseError) {
            console.warn('Failed to parse user permissions:', parseError);
          }
        }

        const modulePermissions = userPermissions[module] || {
          view: true,
          create: false,
          edit: false,
          delete: false,
          export: false,
          print: false
        };

        // Admins get all permissions by default
        if (isAdmin) {
          setPermissions({
            view: true,
            create: true,
            edit: true,
            delete: true,
            export: true,
            print: true
          });
        } else {
          setPermissions(modulePermissions);
        }
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      // Set default permissions on error
      setPermissions({
        view: true,
        create: false,
        edit: false,
        delete: false,
        export: false,
        print: false
      });
    } finally {
      setLoading(false);
    }
  }, [userProfile, module, isAdmin]);

  // Load permissions on mount and when dependencies change
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // Permission check functions with toast notifications
  const checkView = useCallback(() => {
    if (!permissions.view) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to view ${module}.`,
        variant: "destructive"
      });
      return false;
    }
    return true;
  }, [permissions.view, module]);

  const checkCreate = useCallback(() => {
    if (!permissions.create) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to create ${module}.`,
        variant: "destructive"
      });
      return false;
    }
    return true;
  }, [permissions.create, module]);

  const checkEdit = useCallback(() => {
    if (!permissions.edit) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to edit ${module}.`,
        variant: "destructive"
      });
      return false;
    }
    return true;
  }, [permissions.edit, module]);

  const checkDelete = useCallback(() => {
    if (!permissions.delete) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to delete ${module}.`,
        variant: "destructive"
      });
      return false;
    }
    return true;
  }, [permissions.delete, module]);

  const checkExport = useCallback(() => {
    if (!permissions.export) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to export ${module}.`,
        variant: "destructive"
      });
      return false;
    }
    return true;
  }, [permissions.export, module]);

  const checkPrint = useCallback(() => {
    if (!permissions.print) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to print ${module}.`,
        variant: "destructive"
      });
      return false;
    }
    return true;
  }, [permissions.print, module]);

  // Refresh permissions function
  const refreshPermissions = useCallback(() => {
    loadPermissions();
  }, [loadPermissions]);

  // Return all permission states and functions
  return {
    // Permission states
    canView: permissions.view,
    canCreate: permissions.create,
    canEdit: permissions.edit,
    canDelete: permissions.delete,
    canExport: permissions.export,
    canPrint: permissions.print,
    
    // Permission check functions (with toast)
    checkView,
    checkCreate,
    checkEdit,
    checkDelete,
    checkExport,
    checkPrint,
    
    // Utility functions
    isAdmin,
    loading,
    refreshPermissions,
    
    // Raw permissions object
    permissions
  };
};

export default useRealtimePermissions;