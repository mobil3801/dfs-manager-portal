
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Users, 
  Settings, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'motion/react';

interface PermissionSet {
  feature: string;
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    manage: boolean;
  };
}

interface CustomRole {
  id: string;
  name: string;
  description: string;
  level: number;
  permissions: PermissionSet[];
  isSystemRole: boolean;
}

const FEATURES = [
  'dashboard', 'users', 'products', 'employees', 'sales', 
  'vendors', 'orders', 'licenses', 'salary', 'inventory',
  'delivery', 'settings', 'reports', 'audit', 'admin'
];

const SYSTEM_ROLES: CustomRole[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    level: 100,
    isSystemRole: true,
    permissions: FEATURES.map(feature => ({
      feature,
      permissions: { view: true, create: true, edit: true, delete: true, manage: true }
    }))
  },
  {
    id: 'management',
    name: 'Management',
    description: 'Operational access with station management capabilities',
    level: 60,
    isSystemRole: true,
    permissions: FEATURES.map(feature => {
      if (['admin', 'audit', 'settings'].includes(feature)) {
        return { feature, permissions: { view: false, create: false, edit: false, delete: false, manage: false } };
      }
      if (['dashboard', 'reports'].includes(feature)) {
        return { feature, permissions: { view: true, create: false, edit: false, delete: false, manage: true } };
      }
      return { feature, permissions: { view: true, create: true, edit: true, delete: false, manage: true } };
    })
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Basic access for daily operations only',
    level: 30,
    isSystemRole: true,
    permissions: FEATURES.map(feature => {
      if (['dashboard', 'products', 'vendors', 'orders', 'inventory'].includes(feature)) {
        return { feature, permissions: { view: true, create: false, edit: false, delete: false, manage: false } };
      }
      if (['sales', 'delivery'].includes(feature)) {
        return { feature, permissions: { view: true, create: true, edit: true, delete: false, manage: false } };
      }
      return { feature, permissions: { view: false, create: false, edit: false, delete: false, manage: false } };
    })
  }
];

const PermissionManagementPanel: React.FC = () => {
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  console.log('PermissionManagementPanel: Component initialized');

  const handleCreateRole = () => {
    const newRole: CustomRole = {
      id: `custom_${Date.now()}`,
      name: '',
      description: '',
      level: 50,
      isSystemRole: false,
      permissions: FEATURES.map(feature => ({
        feature,
        permissions: { view: false, create: false, edit: false, delete: false, manage: false }
      }))
    };
    setEditingRole(newRole);
    setIsCreatingRole(true);
  };

  const handleSaveRole = () => {
    if (!editingRole) return;

    if (!editingRole.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Role name is required',
        variant: 'destructive'
      });
      return;
    }

    if (isCreatingRole) {
      setCustomRoles(prev => [...prev, editingRole]);
      toast({
        title: 'Role Created',
        description: `Custom role "${editingRole.name}" has been created successfully.`
      });
    } else {
      setCustomRoles(prev => prev.map(role => 
        role.id === editingRole.id ? editingRole : role
      ));
      toast({
        title: 'Role Updated',
        description: `Role "${editingRole.name}" has been updated successfully.`
      });
    }

    setEditingRole(null);
    setIsCreatingRole(false);
  };

  const handleDeleteRole = (roleId: string) => {
    setCustomRoles(prev => prev.filter(role => role.id !== roleId));
    toast({
      title: 'Role Deleted',
      description: 'Custom role has been deleted successfully.'
    });
  };

  const updateRolePermission = (feature: string, action: keyof PermissionSet['permissions'], value: boolean) => {
    if (!editingRole) return;

    setEditingRole(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        permissions: prev.permissions.map(p => 
          p.feature === feature 
            ? { ...p, permissions: { ...p.permissions, [action]: value } }
            : p
        )
      };
    });
  };

  const getPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-red-600" />
    );
  };

  const allRoles = [...SYSTEM_ROLES, ...customRoles];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <CardTitle>Permission Management</CardTitle>
              </div>
              <Button onClick={handleCreateRole}>
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Role
              </Button>
            </div>
            <CardDescription>
              Manage roles and permissions with granular control over system features.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Role Overview</TabsTrigger>
          <TabsTrigger value="permissions">Permission Matrix</TabsTrigger>
          <TabsTrigger value="custom">Custom Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            {allRoles.map((role) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <div className="flex space-x-1">
                        {role.isSystemRole && (
                          <Badge variant="outline">System</Badge>
                        )}
                        <Badge variant="secondary">{role.level}%</Badge>
                      </div>
                    </div>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Features Access:</strong> {role.permissions.filter(p => p.permissions.view).length}/{FEATURES.length}
                      </div>
                      <div className="text-sm">
                        <strong>Management Rights:</strong> {role.permissions.filter(p => p.permissions.manage).length}/{FEATURES.length}
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRole(role)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {!role.isSystemRole && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingRole(role);
                                setIsCreatingRole(false);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteRole(role.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                Compare permissions across all roles and features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left">Feature</th>
                      {allRoles.map(role => (
                        <th key={role.id} className="border border-gray-200 px-4 py-2 text-center min-w-32">
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURES.map(feature => (
                      <tr key={feature}>
                        <td className="border border-gray-200 px-4 py-2 font-medium capitalize">
                          {feature}
                        </td>
                        {allRoles.map(role => {
                          const featurePermission = role.permissions.find(p => p.feature === feature);
                          const hasAnyPermission = featurePermission && Object.values(featurePermission.permissions).some(p => p);
                          const hasFullAccess = featurePermission && featurePermission.permissions.manage;
                          
                          return (
                            <td key={`${role.id}-${feature}`} className="border border-gray-200 px-4 py-2 text-center">
                              {hasFullAccess ? (
                                <Badge className="bg-green-100 text-green-800">Full</Badge>
                              ) : hasAnyPermission ? (
                                <Badge variant="outline">Limited</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">None</Badge>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Roles</CardTitle>
              <CardDescription>
                Create and manage custom roles with specific permission sets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customRoles.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Custom Roles</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create custom roles to define specific permission sets.
                  </p>
                  <Button onClick={handleCreateRole} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Custom Role
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {customRoles.map(role => (
                    <div key={role.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{role.name}</h4>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingRole(role);
                              setIsCreatingRole(false);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteRole(role.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Editor Dialog */}
      <Dialog open={!!editingRole} onOpenChange={() => {setEditingRole(null); setIsCreatingRole(false);}}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreatingRole ? 'Create Custom Role' : 'Edit Role'}
            </DialogTitle>
            <DialogDescription>
              Configure role details and permissions for each system feature.
            </DialogDescription>
          </DialogHeader>
          
          {editingRole && (
            <div className="space-y-6">
              {/* Basic Role Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input
                    id="roleName"
                    value={editingRole.name}
                    onChange={(e) => setEditingRole(prev => prev ? {...prev, name: e.target.value} : prev)}
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <Label htmlFor="roleLevel">Permission Level (%)</Label>
                  <Input
                    id="roleLevel"
                    type="number"
                    min="0"
                    max="100"
                    value={editingRole.level}
                    onChange={(e) => setEditingRole(prev => prev ? {...prev, level: parseInt(e.target.value)} : prev)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="roleDescription">Description</Label>
                <Input
                  id="roleDescription"
                  value={editingRole.description}
                  onChange={(e) => setEditingRole(prev => prev ? {...prev, description: e.target.value} : prev)}
                  placeholder="Describe this role's purpose and scope"
                />
              </div>

              {/* Permission Configuration */}
              <div>
                <h3 className="text-lg font-medium mb-4">Feature Permissions</h3>
                <div className="space-y-4">
                  {editingRole.permissions.map((permissionSet) => (
                    <div key={permissionSet.feature} className="border rounded-lg p-4">
                      <h4 className="font-medium capitalize mb-3">{permissionSet.feature}</h4>
                      <div className="grid grid-cols-5 gap-4">
                        {Object.entries(permissionSet.permissions).map(([action, hasPermission]) => (
                          <div key={action} className="flex items-center space-x-2">
                            <Switch
                              checked={hasPermission}
                              onCheckedChange={(checked) => updateRolePermission(
                                permissionSet.feature, 
                                action as keyof PermissionSet['permissions'], 
                                checked
                              )}
                            />
                            <Label className="text-sm capitalize">{action}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {setEditingRole(null); setIsCreatingRole(false);}}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveRole}>
                  <Save className="h-4 w-4 mr-2" />
                  {isCreatingRole ? 'Create Role' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Role Details Dialog */}
      <Dialog open={!!selectedRole} onOpenChange={() => setSelectedRole(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRole?.name} Role Details</DialogTitle>
            <DialogDescription>
              View detailed permissions for this role.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRole && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-gray-600">{selectedRole.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Permission Breakdown</h4>
                <div className="mt-2 space-y-2">
                  {selectedRole.permissions.map(permissionSet => (
                    <div key={permissionSet.feature} className="flex items-center justify-between p-2 border rounded">
                      <span className="capitalize font-medium">{permissionSet.feature}</span>
                      <div className="flex space-x-2">
                        {Object.entries(permissionSet.permissions).map(([action, hasPermission]) => (
                          <div key={action} className="flex items-center space-x-1">
                            {getPermissionIcon(hasPermission)}
                            <span className="text-xs capitalize">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PermissionManagementPanel;
