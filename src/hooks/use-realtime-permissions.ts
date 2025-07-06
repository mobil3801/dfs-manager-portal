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

interface UseRealtimePermissionsReturn {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canPrint: boolean;
  checkView: () => boolean;
  checkCreate: () => boolean;
  checkEdit: () => boolean;
  checkDelete: () => boolean;
  checkExport: () => boolean;
  checkPrint: () => boolean;
  isAdmin: boolean;
  refreshPermissions: () => Promise<void>;
  permissions: ModulePermissions;
  loading: boolean;
}

export const useRealtimePermissions = (module: string): UseRealtimePermissionsReturn => {
  const { userProfile } = useAuth();
  const [permissions, setPermissions] = useState<ModulePermissions>({
    view: false,
    create: false,
    edit: false,
    delete: false,
    export: false,
    print: false
  });
  const [loading, setLoading] = useState(true);

  // Check if current user is admin
  const isAdmin = userProfile?.role === 'Administrator';

  const loadPermissions = useCallback(async () => {
    if (!userProfile?.user_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Admin has all permissions
      if (isAdmin) {
        setPermissions({
          view: true,
          create: true,
          edit: true,
          delete: true,
          export: true,
          print: true
        });
        setLoading(false);
        return;
      }

      // Get user profile with permissions
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

      const userRecord = data?.List?.[0];
      if (userRecord && userRecord.detailed_permissions) {
        try {
          const allPermissions = JSON.parse(userRecord.detailed_permissions);
          const modulePermissions = allPermissions[module] || {
            view: true, // Default to view only
            create: false,
            edit: false,
            delete: false,
            export: false,
            print: false
          };
          setPermissions(modulePermissions);
        } catch (parseError) {
          console.warn('Failed to parse permissions:', parseError);
          // Default permissions for non-admin users
          setPermissions({
            view: true,
            create: false,
            edit: false,
            delete: false,
            export: false,
            print: false
          });
        }
      } else {
        // Default permissions if no record found
        setPermissions({
          view: true,
          create: false,
          edit: false,
          delete: false,
          export: false,
          print: false
        });
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      // Fallback to view-only on error
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
  }, [userProfile?.user_id, isAdmin, module]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // Permission check functions with user feedback
  const checkView = useCallback(() => {
    if (!permissions.view && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this content.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  }, [permissions.view, isAdmin]);

  const checkCreate = useCallback(() => {
    if (!permissions.create && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create new items.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  }, [permissions.create, isAdmin]);

  const checkEdit = useCallback(() => {
    if (!permissions.edit && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit items.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  }, [permissions.edit, isAdmin]);

  const checkDelete = useCallback(() => {
    if (!permissions.delete && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete items.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  }, [permissions.delete, isAdmin]);

  const checkExport = useCallback(() => {
    if (!permissions.export && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to export data.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  }, [permissions.export, isAdmin]);

  const checkPrint = useCallback(() => {
    if (!permissions.print && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to print.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  }, [permissions.print, isAdmin]);

  // Refresh permissions function
  const refreshPermissions = useCallback(async () => {
    await loadPermissions();
  }, [loadPermissions]);

  return {
    canView: permissions.view || isAdmin,
    canCreate: permissions.create || isAdmin,
    canEdit: permissions.edit || isAdmin,
    canDelete: permissions.delete || isAdmin,
    canExport: permissions.export || isAdmin,
    canPrint: permissions.print || isAdmin,
    checkView,
    checkCreate,
    checkEdit,
    checkDelete,
    checkExport,
    checkPrint,
    isAdmin,
    refreshPermissions,
    permissions,
    loading
  };
};