import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, Plus, Edit, Trash2, Download, Printer, Shield, Users, Loader2 } from 'lucide-react';

interface PermissionToggleProps {
  userId?: number;
  module: string;
  onPermissionChange?: (permissions: ModulePermissions) => void;
  showUserSelector?: boolean;
}

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

interface UserProfile {
  ID: number;
  user_id: number;
  role: string;
  station: string;
  employee_id: string;
  detailed_permissions: string;
  is_active: boolean;
}

const defaultPermissions: ModulePermissions = {
  view: true,
  create: false,
  edit: false,
  delete: false,
  export: false,
  print: false
};

const permissionIcons = {
  view: Eye,
  create: Plus,
  edit: Edit,
  delete: Trash2,
  export: Download,
  print: Printer
};

const permissionLabels = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  export: 'Export',
  print: 'Print'
};

const RealTimePermissionToggle: React.FC<PermissionToggleProps> = ({
  userId,
  module = 'products',
  onPermissionChange,
  showUserSelector = false
}) => {
  const { userProfile } = useAuth();
  const [permissions, setPermissions] = useState<ModulePermissions>(defaultPermissions);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(userId || null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Check if current user is admin
  const isAdmin = userProfile?.role === 'Administrator';

  useEffect(() => {
    if (showUserSelector) {
      loadUsers();
    }
  }, [showUserSelector]);

  useEffect(() => {
    if (selectedUserId) {
      loadUserPermissions(selectedUserId);
    }
  }, [selectedUserId, module]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await window.ezsite.apis.tablePage('11725', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'ID',
        IsAsc: true,
        Filters: [
          { name: 'is_active', op: 'Equal', value: true }
        ]
      });

      if (error) throw error;
      setUsers(data?.List || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadUserPermissions = async (targetUserId: number) => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage('11725', {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'ID',
        IsAsc: true,
        Filters: [
          { name: 'user_id', op: 'Equal', value: targetUserId }
        ]
      });

      if (error) throw error;

      const userProfile = data?.List?.[0];
      if (userProfile) {
        let userPermissions: UserPermissions = {};
        
        try {
          if (userProfile.detailed_permissions) {
            userPermissions = JSON.parse(userProfile.detailed_permissions);
          }
        } catch (parseError) {
          console.warn('Failed to parse user permissions, using defaults');
        }

        const modulePermissions = userPermissions[module] || defaultPermissions;
        setPermissions(modulePermissions);
        
        if (onPermissionChange) {
          onPermissionChange(modulePermissions);
        }
      } else {
        setPermissions(defaultPermissions);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive"
      });
      setPermissions(defaultPermissions);
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (permissionType: keyof ModulePermissions, value: boolean) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can modify permissions",
        variant: "destructive"
      });
      return;
    }

    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user first",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(permissionType);

      // Get current user profile
      const { data: profileData, error: profileError } = await window.ezsite.apis.tablePage('11725', {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'ID',
        IsAsc: true,
        Filters: [
          { name: 'user_id', op: 'Equal', value: selectedUserId }
        ]
      });

      if (profileError) throw profileError;

      const currentProfile = profileData?.List?.[0];
      if (!currentProfile) {
        throw new Error('User profile not found');
      }

      // Parse existing permissions
      let existingPermissions: UserPermissions = {};
      try {
        if (currentProfile.detailed_permissions) {
          existingPermissions = JSON.parse(currentProfile.detailed_permissions);
        }
      } catch (parseError) {
        console.warn('Failed to parse existing permissions, creating new structure');
      }

      // Update the specific module permission
      const updatedModulePermissions = {
        ...permissions,
        [permissionType]: value
      };

      existingPermissions[module] = updatedModulePermissions;

      // Update in database
      const { error: updateError } = await window.ezsite.apis.tableUpdate('11725', {
        ID: currentProfile.ID,
        user_id: currentProfile.user_id,
        role: currentProfile.role,
        station: currentProfile.station,
        employee_id: currentProfile.employee_id,
        phone: currentProfile.phone,
        hire_date: currentProfile.hire_date,
        is_active: currentProfile.is_active,
        detailed_permissions: JSON.stringify(existingPermissions)
      });

      if (updateError) throw updateError;

      // Update local state
      setPermissions(updatedModulePermissions);
      
      if (onPermissionChange) {
        onPermissionChange(updatedModulePermissions);
      }

      toast({
        title: "Success",
        description: `${permissionLabels[permissionType]} permission ${value ? 'enabled' : 'disabled'} for ${module}`,
      });

    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "Error",
        description: `Failed to update ${permissionLabels[permissionType]} permission: ${error}`,
        variant: "destructive"
      });
    } finally {
      setSaving(null);
    }
  };

  const getPermissionColor = (permissionType: keyof ModulePermissions): string => {
    if (!permissions[permissionType]) return 'text-gray-400';
    
    switch (permissionType) {
      case 'view':
        return 'text-blue-600';
      case 'create':
        return 'text-green-600';
      case 'edit':
        return 'text-yellow-600';
      case 'delete':
        return 'text-red-600';
      case 'export':
        return 'text-purple-600';
      case 'print':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!isAdmin && !showUserSelector) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-gray-500">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Permission management requires administrator access</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Shield className="w-5 h-5" />
          <span>Real-Time Permission Management</span>
          <Badge variant="secondary" className="ml-2">
            {module.charAt(0).toUpperCase() + module.slice(1)}
          </Badge>
        </CardTitle>
        
        {showUserSelector && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Select User:</span>
            </label>
            {loadingUsers ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading users...</span>
              </div>
            ) : (
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(Number(e.target.value) || null)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a user...</option>
                {users.map((user) => (
                  <option key={user.ID} value={user.user_id}>
                    {user.employee_id} - {user.role} ({user.station})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading permissions...</span>
          </div>
        ) : !selectedUserId ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Select a user to manage their permissions</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(Object.keys(permissions) as Array<keyof ModulePermissions>).map((permissionType) => {
              const Icon = permissionIcons[permissionType];
              const isEnabled = permissions[permissionType];
              const isSaving = saving === permissionType;
              
              return (
                <div
                  key={permissionType}
                  className={`
                    relative p-4 border rounded-lg transition-all duration-200
                    ${isEnabled 
                      ? 'border-blue-200 bg-blue-50 shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                    ${!isAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${getPermissionColor(permissionType)}`} />
                      <div>
                        <p className="font-medium text-gray-900">
                          {permissionLabels[permissionType]}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {permissionType} access
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isSaving && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      )}
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(value) => updatePermission(permissionType, value)}
                        disabled={!isAdmin || isSaving}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>
                  </div>
                  
                  {isEnabled && (
                    <div className="mt-2">
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-green-100 text-green-700 border-green-200"
                      >
                        Enabled
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {selectedUserId && !loading && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Permission Summary</h4>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(permissions) as Array<keyof ModulePermissions>)
                .filter(permission => permissions[permission])
                .map(permission => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permissionLabels[permission]}
                  </Badge>
                ))
              }
              {(Object.keys(permissions) as Array<keyof ModulePermissions>)
                .filter(permission => permissions[permission]).length === 0 && (
                <span className="text-sm text-gray-500">No permissions enabled</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimePermissionToggle;