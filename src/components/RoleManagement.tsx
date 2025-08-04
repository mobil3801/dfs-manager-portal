import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Users,
  Shield,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Copy,
  AlertTriangle,
  History,
  Search,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  GitCompare,
  Filter,
  MoreHorizontal,
  Save,
  RefreshCw,
  Lock,
  Unlock } from
'lucide-react';

interface Role {
  id: string;
  role_name: string;
  role_code: string;
  description?: string;
  permissions: Record<string, any>;
  is_active: boolean;
  is_system_role: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  user_count?: number;
}

interface PermissionTemplate {
  id: string;
  template_name: string;
  template_description?: string;
  permissions: Record<string, any>;
  category: string;
  created_at: string;
}

interface Module {
  name: string;
  displayName: string;
  actions: string[];
}

const DEFAULT_MODULES: Module[] = [
{ name: 'products', displayName: 'Products', actions: ['read', 'create', 'update', 'delete'] },
{ name: 'sales_reports', displayName: 'Sales Reports', actions: ['read', 'create', 'update', 'delete'] },
{ name: 'employees', displayName: 'Employees', actions: ['read', 'create', 'update', 'delete'] },
{ name: 'licenses', displayName: 'Licenses', actions: ['read', 'create', 'update', 'delete'] },
{ name: 'deliveries', displayName: 'Deliveries', actions: ['read', 'create', 'update', 'delete'] },
{ name: 'stations', displayName: 'Stations', actions: ['read', 'create', 'update', 'delete'] },
{ name: 'user_management', displayName: 'User Management', actions: ['read', 'create', 'update', 'delete'] },
{ name: 'role_management', displayName: 'Role Management', actions: ['read', 'create', 'update', 'delete'] },
{ name: 'audit_logs', displayName: 'Audit Logs', actions: ['read'] },
{ name: 'sms_management', displayName: 'SMS Management', actions: ['read', 'create', 'update', 'delete'] }];


const RoleManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [roles, setRoles] = useState<Role[]>([]);
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false);
  const [compareRoles, setCompareRoles] = useState<[Role | null, Role | null]>([null, null]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    role_name: '',
    role_code: '',
    description: '',
    permissions: {} as Record<string, any>,
    is_active: true
  });

  // Load data
  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);

      // Load roles with user count
      const { data: rolesData, error: rolesError } = await supabase.
      from('roles').
      select(`
          *,
          user_profiles(count)
        `).
      order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Process roles with user count
      const processedRoles = rolesData?.map((role) => ({
        ...role,
        user_count: role.user_profiles?.length || 0
      })) || [];

      setRoles(processedRoles);

      // Load permission templates
      const { data: templatesData, error: templatesError } = await supabase.
      from('role_permission_templates').
      select('*').
      order('category', { ascending: true });

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

    } catch (error: any) {
      console.error('Error loading roles:', error);
      toast({
        title: "Error",
        description: "Failed to load roles and templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Real-time subscription
  useEffect(() => {
    loadRoles();

    const channel = supabase.
    channel('roles-changes').
    on('postgres_changes',
    { event: '*', schema: 'public', table: 'roles' },
    () => loadRoles()
    ).
    subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [loadRoles]);

  // Audit logging
  const logAuditEvent = async (action: string, roleId?: string, oldValues?: any, newValues?: any) => {
    try {
      await supabase.
      from('audit_logs').
      insert({
        user_id: user?.id,
        user_email: user?.email,
        action,
        table_name: 'roles',
        record_id: roleId,
        old_values: oldValues,
        new_values: newValues,
        action_performed: `Role ${action}`,
        event_type: 'role_management',
        event_status: 'success',
        risk_level: 'medium'
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  };

  // Permission management functions
  const getDefaultPermissions = (): Record<string, any> => {
    const permissions: Record<string, any> = { modules: {} };
    DEFAULT_MODULES.forEach((module) => {
      permissions.modules[module.name] = {};
      module.actions.forEach((action) => {
        permissions.modules[module.name][action] = false;
      });
    });
    return permissions;
  };

  const applyTemplate = (template: PermissionTemplate) => {
    setFormData((prev) => ({
      ...prev,
      permissions: template.permissions
    }));
    toast({
      title: "Template Applied",
      description: `Applied "${template.template_name}" permissions template`
    });
  };

  // CRUD Operations
  const handleCreateRole = async () => {
    try {
      if (!formData.role_name || !formData.role_code) {
        toast({
          title: "Validation Error",
          description: "Role name and code are required",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.
      from('roles').
      insert({
        role_name: formData.role_name,
        role_code: formData.role_code,
        description: formData.description,
        permissions: formData.permissions,
        is_active: formData.is_active,
        created_by: user?.id
      }).
      select().
      single();

      if (error) throw error;

      await logAuditEvent('create', data.id, null, data);

      toast({
        title: "Success",
        description: "Role created successfully"
      });

      setIsCreateDialogOpen(false);
      resetForm();
      loadRoles();
    } catch (error: any) {
      console.error('Error creating role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive"
      });
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      const { data, error } = await supabase.
      from('roles').
      update({
        role_name: formData.role_name,
        role_code: formData.role_code,
        description: formData.description,
        permissions: formData.permissions,
        is_active: formData.is_active
      }).
      eq('id', selectedRole.id).
      select().
      single();

      if (error) throw error;

      await logAuditEvent('update', selectedRole.id, selectedRole, data);

      toast({
        title: "Success",
        description: "Role updated successfully"
      });

      setIsEditDialogOpen(false);
      setSelectedRole(null);
      resetForm();
      loadRoles();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.is_system_role) {
      toast({
        title: "Cannot Delete",
        description: "System roles cannot be deleted",
        variant: "destructive"
      });
      return;
    }

    if (role.user_count && role.user_count > 0) {
      toast({
        title: "Cannot Delete",
        description: `Cannot delete role "${role.role_name}" as it is assigned to ${role.user_count} user(s)`,
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.
      from('roles').
      delete().
      eq('id', role.id);

      if (error) throw error;

      await logAuditEvent('delete', role.id, role, null);

      toast({
        title: "Success",
        description: "Role deleted successfully"
      });

      loadRoles();
    } catch (error: any) {
      console.error('Error deleting role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive"
      });
    }
  };

  const handleToggleRoleStatus = async (role: Role) => {
    try {
      const newStatus = !role.is_active;

      const { data, error } = await supabase.
      from('roles').
      update({ is_active: newStatus }).
      eq('id', role.id).
      select().
      single();

      if (error) throw error;

      await logAuditEvent('status_change', role.id, { is_active: role.is_active }, { is_active: newStatus });

      toast({
        title: "Success",
        description: `Role ${newStatus ? 'activated' : 'deactivated'} successfully`
      });

      loadRoles();
    } catch (error: any) {
      console.error('Error toggling role status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update role status",
        variant: "destructive"
      });
    }
  };

  // Bulk operations
  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedRoles.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select roles to perform bulk action",
        variant: "destructive"
      });
      return;
    }

    const roleIds = Array.from(selectedRoles);
    const rolesToUpdate = roles.filter((role) => roleIds.includes(role.id));

    // Check for system roles in delete operation
    if (action === 'delete') {
      const systemRoles = rolesToUpdate.filter((role) => role.is_system_role);
      const rolesWithUsers = rolesToUpdate.filter((role) => role.user_count && role.user_count > 0);

      if (systemRoles.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "System roles cannot be deleted",
          variant: "destructive"
        });
        return;
      }

      if (rolesWithUsers.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "Cannot delete roles that are assigned to users",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      if (action === 'delete') {
        const { error } = await supabase.
        from('roles').
        delete().
        in('id', roleIds);

        if (error) throw error;

        // Log bulk delete
        for (const role of rolesToUpdate) {
          await logAuditEvent('bulk_delete', role.id, role, null);
        }
      } else {
        const isActive = action === 'activate';
        const { error } = await supabase.
        from('roles').
        update({ is_active: isActive }).
        in('id', roleIds);

        if (error) throw error;

        // Log bulk status change
        for (const role of rolesToUpdate) {
          await logAuditEvent(`bulk_${action}`, role.id, { is_active: role.is_active }, { is_active: isActive });
        }
      }

      toast({
        title: "Success",
        description: `Bulk ${action} completed successfully`
      });

      setSelectedRoles(new Set());
      loadRoles();
    } catch (error: any) {
      console.error(`Error in bulk ${action}:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to perform bulk ${action}`,
        variant: "destructive"
      });
    }
  };

  // Utility functions
  const resetForm = () => {
    setFormData({
      role_name: '',
      role_code: '',
      description: '',
      permissions: getDefaultPermissions(),
      is_active: true
    });
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      role_name: role.role_name,
      role_code: role.role_code,
      description: role.description || '',
      permissions: role.permissions || getDefaultPermissions(),
      is_active: role.is_active
    });
    setIsEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setFormData((prev) => ({ ...prev, permissions: getDefaultPermissions() }));
    setIsCreateDialogOpen(true);
  };

  // Filter and search
  const filteredRoles = roles.filter((role) => {
    const matchesSearch = role.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.role_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' ||
    filterStatus === 'active' && role.is_active ||
    filterStatus === 'inactive' && !role.is_active;

    return matchesSearch && matchesFilter;
  });

  // Permission comparison
  const comparePermissions = (role1: Role, role2: Role) => {
    const permissions1 = role1.permissions?.modules || {};
    const permissions2 = role2.permissions?.modules || {};

    const allModules = new Set([...Object.keys(permissions1), ...Object.keys(permissions2)]);
    const comparison: Record<string, any> = {};

    allModules.forEach((module) => {
      const module1 = permissions1[module] || {};
      const module2 = permissions2[module] || {};
      const allActions = new Set([...Object.keys(module1), ...Object.keys(module2)]);

      comparison[module] = {};
      allActions.forEach((action) => {
        comparison[module][action] = {
          role1: module1[action] || false,
          role2: module2[action] || false,
          different: (module1[action] || false) !== (module2[action] || false)
        };
      });
    });

    return comparison;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading roles...
        </CardContent>
      </Card>);

  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Role Management</h2>
          <p className="text-muted-foreground">
            Manage user roles and permissions for the DFS Portal system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="templates">Permission Templates</TabsTrigger>
          <TabsTrigger value="comparison">Role Comparison</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search roles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10" />

                  </div>
                </div>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions */}
              {selectedRoles.size > 0 &&
              <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedRoles.size} role(s) selected
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('activate')}>

                        <CheckCircle className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                      <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('deactivate')}>

                        <XCircle className="h-4 w-4 mr-1" />
                        Deactivate
                      </Button>
                      <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBulkAction('delete')}>

                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              }
            </CardContent>
          </Card>

          {/* Roles Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRoles.size === filteredRoles.length && filteredRoles.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRoles(new Set(filteredRoles.map((role) => role.id)));
                          } else {
                            setSelectedRoles(new Set());
                          }
                        }} />

                    </TableHead>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) =>
                  <TableRow key={role.id}>
                      <TableCell>
                        <Checkbox
                        checked={selectedRoles.has(role.id)}
                        onCheckedChange={(checked) => {
                          const newSelected = new Set(selectedRoles);
                          if (checked) {
                            newSelected.add(role.id);
                          } else {
                            newSelected.delete(role.id);
                          }
                          setSelectedRoles(newSelected);
                        }} />

                      </TableCell>
                      <TableCell className="font-medium">{role.role_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{role.role_code}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {role.description || 'No description'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {role.user_count || 0} users
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={role.is_active ? "default" : "secondary"}>
                            {role.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleRoleStatus(role)}
                          className="h-6 w-6 p-0">

                            {role.is_active ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={role.is_system_role ? "destructive" : "outline"}>
                          {role.is_system_role ? "System" : "Custom"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(role.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(role)}
                          className="h-8 w-8 p-0">

                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (compareRoles[0]) {
                              setCompareRoles([compareRoles[0], role]);
                            } else {
                              setCompareRoles([role, null]);
                            }
                            setIsCompareDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0">

                            <GitCompare className="h-4 w-4" />
                          </Button>
                          {!role.is_system_role &&
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRole(role)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive">

                              <Trash2 className="h-4 w-4" />
                            </Button>
                        }
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {filteredRoles.length === 0 &&
          <Card>
              <CardContent className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No roles found matching your criteria</p>
              </CardContent>
            </Card>
          }
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Templates</CardTitle>
              <CardDescription>
                Pre-configured permission sets for quick role setup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) =>
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{template.template_name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.template_description}
                      </p>
                      <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => applyTemplate(template)}>

                        <Copy className="h-4 w-4 mr-2" />
                        Apply Template
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Comparison</CardTitle>
              <CardDescription>
                Compare permissions between different roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>First Role</Label>
                  <Select
                    value={compareRoles[0]?.id || ""}
                    onValueChange={(value) => {
                      const role = roles.find((r) => r.id === value);
                      setCompareRoles([role || null, compareRoles[1]]);
                    }}>

                    <SelectTrigger>
                      <SelectValue placeholder="Select first role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) =>
                      <SelectItem key={role.id} value={role.id}>
                          {role.role_name}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Second Role</Label>
                  <Select
                    value={compareRoles[1]?.id || ""}
                    onValueChange={(value) => {
                      const role = roles.find((r) => r.id === value);
                      setCompareRoles([compareRoles[0], role || null]);
                    }}>

                    <SelectTrigger>
                      <SelectValue placeholder="Select second role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) =>
                      <SelectItem key={role.id} value={role.id}>
                          {role.role_name}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {compareRoles[0] && compareRoles[1] &&
              <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Permission Comparison</h3>
                  <div className="space-y-4">
                    {Object.entries(comparePermissions(compareRoles[0], compareRoles[1])).map(([module, actions]) => {
                    const moduleInfo = DEFAULT_MODULES.find((m) => m.name === module);
                    return (
                      <div key={module} className="border rounded p-3">
                          <h4 className="font-medium mb-2">
                            {moduleInfo?.displayName || module}
                          </h4>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="font-medium">Action</div>
                            <div className="font-medium text-center">{compareRoles[0].role_name}</div>
                            <div className="font-medium text-center">{compareRoles[1].role_name}</div>
                            {Object.entries(actions as Record<string, any>).map(([action, comparison]) =>
                          <React.Fragment key={action}>
                                <div className="capitalize">{action}</div>
                                <div className="text-center">
                                  <Badge variant={comparison.role1 ? "default" : "secondary"}>
                                    {comparison.role1 ? "✓" : "✗"}
                                  </Badge>
                                </div>
                                <div className="text-center">
                                  <Badge
                                variant={comparison.role2 ? "default" : "secondary"}
                                className={comparison.different ? "border-orange-500" : ""}>

                                    {comparison.role2 ? "✓" : "✗"}
                                  </Badge>
                                </div>
                              </React.Fragment>
                          )}
                          </div>
                        </div>);

                  })}
                  </div>
                </div>
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Management Audit Trail</CardTitle>
              <CardDescription>
                Track all role-related changes for compliance and security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4" />
                <p>Audit trail functionality is available in the main audit logs section</p>
                <Button variant="outline" className="mt-2" asChild>
                  <a href="/admin/audit-monitoring">View Audit Logs</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role with custom permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role_name">Role Name *</Label>
                <Input
                  id="role_name"
                  value={formData.role_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role_name: e.target.value }))}
                  placeholder="Enter role name" />

              </div>
              <div>
                <Label htmlFor="role_code">Role Code *</Label>
                <Input
                  id="role_code"
                  value={formData.role_code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role_code: e.target.value }))}
                  placeholder="Enter role code" />

              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter role description"
                rows={3} />

            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))} />

              <Label htmlFor="is_active">Active Role</Label>
            </div>

            <Separator />

            <div>
              <Label>Permission Templates</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {templates.map((template) =>
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate(template)}>

                    {template.template_name}
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label>Module Permissions</Label>
              <div className="space-y-3 mt-2 max-h-96 overflow-y-auto border rounded p-3">
                {DEFAULT_MODULES.map((module) =>
                <div key={module.name} className="border rounded p-3">
                    <h4 className="font-medium mb-2">{module.displayName}</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {module.actions.map((action) =>
                    <div key={action} className="flex items-center space-x-2">
                          <Checkbox
                        id={`${module.name}-${action}`}
                        checked={formData.permissions?.modules?.[module.name]?.[action] || false}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => ({
                            ...prev,
                            permissions: {
                              ...prev.permissions,
                              modules: {
                                ...prev.permissions.modules,
                                [module.name]: {
                                  ...prev.permissions.modules?.[module.name],
                                  [action]: checked
                                }
                              }
                            }
                          }));
                        }} />

                          <Label
                        htmlFor={`${module.name}-${action}`}
                        className="text-sm capitalize">

                            {action}
                          </Label>
                        </div>
                    )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole}>
              <Save className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Modify role settings and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_role_name">Role Name *</Label>
                <Input
                  id="edit_role_name"
                  value={formData.role_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role_name: e.target.value }))}
                  placeholder="Enter role name"
                  disabled={selectedRole?.is_system_role} />

              </div>
              <div>
                <Label htmlFor="edit_role_code">Role Code *</Label>
                <Input
                  id="edit_role_code"
                  value={formData.role_code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role_code: e.target.value }))}
                  placeholder="Enter role code"
                  disabled={selectedRole?.is_system_role} />

              </div>
            </div>

            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter role description"
                rows={3} />

            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))} />

              <Label htmlFor="edit_is_active">Active Role</Label>
            </div>

            {selectedRole?.is_system_role &&
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This is a system role. Some fields cannot be modified to maintain system integrity.
                </AlertDescription>
              </Alert>
            }

            <Separator />

            <div>
              <Label>Permission Templates</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {templates.map((template) =>
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate(template)}>

                    {template.template_name}
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label>Module Permissions</Label>
              <div className="space-y-3 mt-2 max-h-96 overflow-y-auto border rounded p-3">
                {DEFAULT_MODULES.map((module) =>
                <div key={module.name} className="border rounded p-3">
                    <h4 className="font-medium mb-2">{module.displayName}</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {module.actions.map((action) =>
                    <div key={action} className="flex items-center space-x-2">
                          <Checkbox
                        id={`edit-${module.name}-${action}`}
                        checked={formData.permissions?.modules?.[module.name]?.[action] || false}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => ({
                            ...prev,
                            permissions: {
                              ...prev.permissions,
                              modules: {
                                ...prev.permissions.modules,
                                [module.name]: {
                                  ...prev.permissions.modules?.[module.name],
                                  [action]: checked
                                }
                              }
                            }
                          }));
                        }} />

                          <Label
                        htmlFor={`edit-${module.name}-${action}`}
                        className="text-sm capitalize">

                            {action}
                          </Label>
                        </div>
                    )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>
              <Save className="h-4 w-4 mr-2" />
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);

};

export default RoleManagement;