import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, User, UserCheck, UserX, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface UserRole {
  id: number;
  role_name: string;
  role_display_name: string;
  role_description: string;
  permissions_json: string;
  is_active: boolean;
  is_system_role: boolean;
  created_by: number;
}

interface UserProfile {
  id: number;
  user_id: number;
  username: string;
  full_name: string;
  role: string;
  phone: string;
  department: string;
  status: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

const USER_ROLES_TABLE_ID = '24054';
const USER_PROFILE_TABLE_ID = '24040';

const UserRoleManager: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  // Load users and roles
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load users
      const { data: usersData, error: usersError } = await window.ezsite.apis.tablePage(USER_PROFILE_TABLE_ID, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'full_name',
        IsAsc: true,
        Filters: []
      });

      if (usersError) {
        toast({ title: 'Error', description: usersError, variant: 'destructive' });
      } else {
        setUsers(usersData?.List || []);
      }

      // Load roles
      const { data: rolesData, error: rolesError } = await window.ezsite.apis.tablePage(USER_ROLES_TABLE_ID, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'role_name',
        IsAsc: true,
        Filters: []
      });

      if (rolesError) {
        toast({ title: 'Error', description: rolesError, variant: 'destructive' });
      } else {
        setRoles(rolesData?.List || []);
      }

      // If no roles exist, create default ones
      if (!rolesData?.List?.length) {
        await createDefaultRoles();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: 'Error', description: 'Failed to load user data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultRoles = async () => {
    const defaultRoles = [
      {
        role_name: 'admin',
        role_display_name: 'Administrator',
        role_description: 'Full system access with all permissions',
        permissions_json: JSON.stringify({
          users: { view: true, create: true, edit: true, delete: true },
          products: { view: true, create: true, edit: true, delete: true },
          sales: { view: true, create: true, edit: true, delete: true },
          employees: { view: true, create: true, edit: true, delete: true },
          vendors: { view: true, create: true, edit: true, delete: true },
          orders: { view: true, create: true, edit: true, delete: true },
          licenses: { view: true, create: true, edit: true, delete: true },
          salary: { view: true, create: true, edit: true, delete: true },
          inventory: { view: true, create: true, edit: true, delete: true },
          delivery: { view: true, create: true, edit: true, delete: true },
          settings: { view: true, create: true, edit: true, delete: true }
        }),
        is_active: true,
        is_system_role: true,
        created_by: 1
      },
      {
        role_name: 'manager',
        role_display_name: 'Manager',
        role_description: 'Station management with limited administrative access',
        permissions_json: JSON.stringify({
          users: { view: true, create: false, edit: false, delete: false },
          products: { view: true, create: true, edit: true, delete: false },
          sales: { view: true, create: true, edit: true, delete: false },
          employees: { view: true, create: true, edit: true, delete: false },
          vendors: { view: true, create: true, edit: true, delete: false },
          orders: { view: true, create: true, edit: true, delete: false },
          licenses: { view: true, create: false, edit: false, delete: false },
          salary: { view: true, create: true, edit: true, delete: false },
          inventory: { view: true, create: true, edit: true, delete: false },
          delivery: { view: true, create: true, edit: true, delete: false },
          settings: { view: false, create: false, edit: false, delete: false }
        }),
        is_active: true,
        is_system_role: true,
        created_by: 1
      },
      {
        role_name: 'employee',
        role_display_name: 'Employee',
        role_description: 'Basic access for daily operations',
        permissions_json: JSON.stringify({
          users: { view: false, create: false, edit: false, delete: false },
          products: { view: true, create: false, edit: false, delete: false },
          sales: { view: true, create: true, edit: false, delete: false },
          employees: { view: false, create: false, edit: false, delete: false },
          vendors: { view: false, create: false, edit: false, delete: false },
          orders: { view: true, create: false, edit: false, delete: false },
          licenses: { view: false, create: false, edit: false, delete: false },
          salary: { view: false, create: false, edit: false, delete: false },
          inventory: { view: true, create: false, edit: false, delete: false },
          delivery: { view: true, create: false, edit: false, delete: false },
          settings: { view: false, create: false, edit: false, delete: false }
        }),
        is_active: true,
        is_system_role: true,
        created_by: 1
      }
    ];

    for (const role of defaultRoles) {
      try {
        await window.ezsite.apis.tableCreate(USER_ROLES_TABLE_ID, role);
      } catch (error) {
        console.error('Error creating default role:', error);
      }
    }

    // Reload roles
    const { data: rolesData } = await window.ezsite.apis.tablePage(USER_ROLES_TABLE_ID, {
      PageNo: 1,
      PageSize: 100,
      OrderByField: 'role_name',
      IsAsc: true,
      Filters: []
    });
    setRoles(rolesData?.List || []);
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      const { error } = await window.ezsite.apis.tableUpdate(USER_PROFILE_TABLE_ID, {
        id: userId,
        role: newRole,
        updated_at: new Date().toISOString()
      });

      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
        return;
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({ title: 'Success', description: 'User role updated successfully' });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({ title: 'Error', description: 'Failed to update user role', variant: 'destructive' });
    }
  };

  const handleUpdateUserStatus = async (userId: number, newStatus: string) => {
    try {
      const { error } = await window.ezsite.apis.tableUpdate(USER_PROFILE_TABLE_ID, {
        id: userId,
        status: newStatus,
        updated_at: new Date().toISOString()
      });

      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
        return;
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));

      toast({ title: 'Success', description: 'User status updated successfully' });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({ title: 'Error', description: 'Failed to update user status', variant: 'destructive' });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            User Role Management
          </h2>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
        <Button onClick={() => setShowRoleDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Roles Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Available Roles</CardTitle>
          <CardDescription>System roles and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div key={role.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getRoleColor(role.role_name)}>
                    {role.role_display_name}
                  </Badge>
                  {!role.is_system_role && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingRole(role);
                        setShowRoleDialog(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{role.role_description}</p>
                <div className="mt-2 text-xs">
                  Users: {users.filter(u => u.role === role.role_name).length}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Assign roles and manage user access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-sm text-muted-foreground">{user.username}</div>
                    <div className="text-sm text-muted-foreground">{user.department}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-2">
                    <Badge className={getRoleColor(user.role)}>
                      {roles.find(r => r.role_name === user.role)?.role_display_name || user.role}
                    </Badge>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleUpdateUserRole(user.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.filter(r => r.is_active).map((role) => (
                          <SelectItem key={role.id} value={role.role_name}>
                            {role.role_display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={user.status}
                      onValueChange={(value) => handleUpdateUserStatus(user.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Creation/Edit Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </DialogTitle>
            <DialogDescription>
              Define role permissions and access levels
            </DialogDescription>
          </DialogHeader>
          {/* Role form content would go here */}
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Role editing form will be implemented here
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowRoleDialog(false)}>
                Save Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserRoleManager;