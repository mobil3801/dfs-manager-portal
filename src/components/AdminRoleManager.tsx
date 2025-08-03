import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { Users, Shield, Plus, Edit, Trash2, Key, UserCheck, AlertCircle } from 'lucide-react';

interface UserProfile {
  id: number;
  user_id?: string;
  email: string;
  role: string;
  role_code: string;
  station: string;
  employee_id: string;
  phone: string;
  hire_date: string;
  is_active: boolean;
  detailed_permissions: any;
  created_at: string;
  updated_at: string;
}

const AdminRoleManager = () => {
  const { isAdmin, assignRole, userProfile } = useSupabaseAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({
    email: '',
    role: 'Employee',
    roleCode: 'GeneralUser',
    station: 'MOBIL',
    employeeId: '',
    phone: '',
    permissions: '{}'
  });

  const roles = [
    { value: 'Administrator', label: 'Administrator', code: 'Administrator', badge: 'destructive' },
    { value: 'Management', label: 'Management', code: 'Administrator', badge: 'default' },
    { value: 'Manager', label: 'Manager', code: 'Administrator', badge: 'secondary' },
    { value: 'Employee', label: 'Employee', code: 'GeneralUser', badge: 'outline' }
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive"
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
  }, []);

  const handleAssignRole = async () => {
    try {
      if (!roleForm.email || !roleForm.role) {
        toast({
          title: "Validation Error",
          description: "Email and role are required",
          variant: "destructive"
        });
        return;
      }

      let permissions = {};
      try {
        if (roleForm.permissions) {
          permissions = JSON.parse(roleForm.permissions);
        }
      } catch (error) {
        toast({
          title: "Invalid JSON",
          description: "Please provide valid JSON for permissions",
          variant: "destructive"
        });
        return;
      }

      // If assigning Administrator role, provide full permissions
      if (roleForm.role === 'Administrator') {
        permissions = {
          users: { create: true, read: true, update: true, delete: true },
          products: { create: true, read: true, update: true, delete: true },
          sales: { create: true, read: true, update: true, delete: true },
          employees: { create: true, read: true, update: true, delete: true },
          stations: { create: true, read: true, update: true, delete: true },
          reports: { create: true, read: true, update: true, delete: true },
          admin: { create: true, read: true, update: true, delete: true },
          system: { create: true, read: true, update: true, delete: true }
        };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          email: roleForm.email,
          role: roleForm.role,
          role_code: roleForm.roleCode,
          station: roleForm.station,
          employee_id: roleForm.employeeId,
          phone: roleForm.phone,
          detailed_permissions: permissions,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email'
        })
        .select();

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `Role ${roleForm.role} assigned to ${roleForm.email}`
      });

      setIsAssignRoleOpen(false);
      setRoleForm({
        email: '',
        role: 'Employee',
        roleCode: 'GeneralUser',
        station: 'MOBIL',
        employeeId: '',
        phone: '',
        permissions: '{}'
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleToggleUserStatus = async (user: UserProfile) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_active: !user.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `User ${user.is_active ? 'deactivated' : 'activated'} successfully`
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    const roleInfo = roles.find(r => r.value === role);
    return roleInfo?.badge || 'outline';
  };

  if (!isAdmin()) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Only administrators can access role management.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Shield className="mr-2" />
              Admin Role Manager
            </h1>
            <p className="opacity-90">
              Manage user roles and permissions for the DFS Portal system
            </p>
          </div>
          <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                <Plus className="mr-2 h-4 w-4" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Assign User Role</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={roleForm.email}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={roleForm.role}
                      onValueChange={(value) => {
                        const role = roles.find(r => r.value === value);
                        setRoleForm(prev => ({ 
                          ...prev, 
                          role: value,
                          roleCode: role?.code || 'GeneralUser'
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="station">Station</Label>
                    <Select
                      value={roleForm.station}
                      onValueChange={(value) => setRoleForm(prev => ({ ...prev, station: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MOBIL">MOBIL</SelectItem>
                        <SelectItem value="SHELL">SHELL</SelectItem>
                        <SelectItem value="BP">BP</SelectItem>
                        <SelectItem value="CHEVRON">CHEVRON</SelectItem>
                        <SelectItem value="ALL_STATIONS">ALL STATIONS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      value={roleForm.employeeId}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, employeeId: e.target.value }))}
                      placeholder="EMP001"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={roleForm.phone}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1-555-0100"
                  />
                </div>

                <div>
                  <Label htmlFor="permissions">Detailed Permissions (JSON)</Label>
                  <Textarea
                    id="permissions"
                    value={roleForm.permissions}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, permissions: e.target.value }))}
                    placeholder='{"users": {"read": true, "create": false}}'
                    rows={4}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty for default role permissions
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAssignRoleOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAssignRole}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Assign Role
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current Admin Info */}
      <Alert>
        <UserCheck className="h-4 w-4" />
        <AlertDescription>
          <strong>Current Admin:</strong> {userProfile?.email} ({userProfile?.role})
        </AlertDescription>
      </Alert>

      {/* Users Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="mr-2" />
              User Roles & Permissions
            </h3>
            <Badge variant="secondary">
              {users.length} Users
            </Badge>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email}
                        {user.email === userProfile?.email && (
                          <Badge variant="outline" className="ml-2">You</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role) as any}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.station}</TableCell>
                      <TableCell>{user.employee_id || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={user.is_active}
                            onCheckedChange={() => handleToggleUserStatus(user)}
                            disabled={user.email === userProfile?.email}
                          />
                          <span className="text-sm">
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRoleForm({
                                email: user.email,
                                role: user.role,
                                roleCode: user.role_code,
                                station: user.station,
                                employeeId: user.employee_id,
                                phone: user.phone || '',
                                permissions: JSON.stringify(user.detailed_permissions || {}, null, 2)
                              });
                              setIsAssignRoleOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Role Assignment Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Administrator Role</h4>
              <p className="text-sm text-gray-600">
                Full system access, can manage all users and settings
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setRoleForm({
                    ...roleForm,
                    role: 'Administrator',
                    roleCode: 'Administrator',
                    station: 'ALL_STATIONS',
                    permissions: JSON.stringify({
                      users: { create: true, read: true, update: true, delete: true },
                      admin: { create: true, read: true, update: true, delete: true }
                    }, null, 2)
                  });
                  setIsAssignRoleOpen(true);
                }}
              >
                Assign Admin Role
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Manager Role</h4>
              <p className="text-sm text-gray-600">
                Can create, read, and update most resources
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRoleForm({
                    ...roleForm,
                    role: 'Manager',
                    roleCode: 'Administrator',
                    permissions: JSON.stringify({
                      products: { create: true, read: true, update: true },
                      sales: { create: true, read: true, update: true }
                    }, null, 2)
                  });
                  setIsAssignRoleOpen(true);
                }}
              >
                Assign Manager Role
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Alert>
        <Key className="h-4 w-4" />
        <AlertDescription>
          <strong>How to assign roles to other employees:</strong>
          <ol className="mt-2 ml-4 list-decimal space-y-1">
            <li>Click "Assign Role" button above</li>
            <li>Enter the employee's email address</li>
            <li>Select appropriate role (Administrator, Manager, or Employee)</li>
            <li>Choose their station assignment</li>
            <li>Optionally set detailed permissions using JSON format</li>
            <li>Click "Assign Role" to save</li>
          </ol>
          <p className="mt-2">
            <strong>Note:</strong> Users will need to sign up with the same email address to access their assigned role.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AdminRoleManager;