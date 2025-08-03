import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Role {
  id: number;
  role_name: string;
  role_code: string;
  description: string;
  permissions: any;
}

interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  role_id: number;
  roles: Role;
}

export const useRoleManagement = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('role_name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersWithRoles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          roles (
            id,
            role_name,
            role_code,
            description,
            permissions
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users with roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, roleId: number) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role_id: roleId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully"
      });

      // Refresh data
      await fetchUsersWithRoles();
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
      return false;
    }
  };

  const createRole = async (roleData: Omit<Role, 'id'>) => {
    try {
      const { error } = await supabase
        .from('roles')
        .insert([roleData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role created successfully"
      });

      await fetchRoles();
      return true;
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive"
      });
      return false;
    }
  };

  const getUserRole = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.roles || null;
  };

  const hasPermission = (userId: string, permission: string) => {
    const role = getUserRole(userId);
    if (!role) return false;
    
    const permissions = role.permissions || {};
    return permissions[permission] === true || permissions.all_modules === true;
  };

  const isAdmin = (userId: string) => {
    const role = getUserRole(userId);
    return role?.role_code === 'Administrator';
  };

  const isManager = (userId: string) => {
    const role = getUserRole(userId);
    return role?.role_code === 'Manager' || isAdmin(userId);
  };

  const isEmployee = (userId: string) => {
    const role = getUserRole(userId);
    return role?.role_code === 'Employee';
  };

  useEffect(() => {
    fetchRoles();
    fetchUsersWithRoles();
  }, []);

  return {
    roles,
    users,
    loading,
    fetchRoles,
    fetchUsersWithRoles,
    updateUserRole,
    createRole,
    getUserRole,
    hasPermission,
    isAdmin,
    isManager,
    isEmployee
  };
};