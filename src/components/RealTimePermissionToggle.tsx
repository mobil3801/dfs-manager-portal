import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Shield,
  User,
  Save,
  RefreshCw,
  Eye,
  Plus,
  Edit,
  Trash2,
  Download,
  Printer,
  Loader2
} from 'lucide-react';

interface ModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  print: boolean;
}

interface RealTimePermissionToggleProps {
  userId?: number;
  module: string;
  onPermissionChange: (permissions: ModulePermissions) => void;
  showUserSelector?: boolean;
  className?: string;
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

const RealTimePermissionToggle: React.FC<RealTimePermissionToggleProps> = ({
  userId,
  module,
  onPermissionChange,
  showUserSelector = false,
  className = ''
}) => {
  const { userProfile } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(userId);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [permissions, setPermissions] = useState<ModulePermissions>({
    view: false,
    create: false,
    edit: false,
    delete: false,
    export: false,
    print: false
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    setSelectedUserId(userId);
  }, [userId]);

  const loadUsers = async () => {
    try {
      setLoading(true);
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

      const userList = data?.List || [];
      setUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

      const userRecord = data?.List?.[0];
      if (userRecord && userRecord.detailed_permissions) {
        try {
          const allPermissions = JSON.parse(userRecord.detailed_permissions);
          const modulePermissions = allPermissions[module] || {
            view: false,
            create: false,
            edit: false,
            delete: false,
            export: false,
            print: false
          };
          setPermissions(modulePermissions);
        } catch (parseError) {
          console.warn('Failed to parse permissions:', parseError);
          setPermissions({
            view: false,
            create: false,
            edit: false,
            delete: false,
            export: false,
            print: false
          });
        }
      } else {
        setPermissions({
          view: false,
          create: false,
          edit: false,
          delete: false,
          export: false,
          print: false
        });
      }
    } catch (error) {
      console.error('Error loading user permissions:', error);
      toast({
        title: "Error",
        description: "Failed to load user permissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permissionType: keyof ModulePermissions, value: boolean) => {
    const newPermissions = {
      ...permissions,
      [permissionType]: value
    };
    setPermissions(newPermissions);
    onPermissionChange(newPermissions);
  };

  const savePermissions = async () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user first",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);

      // Get current user record
      const { data, error } = await window.ezsite.apis.tablePage('11725', {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'ID',
        IsAsc: true,
        Filters: [
          { name: 'user_id', op: 'Equal', value: selectedUserId }
        ]
      });

      if (error) throw error;

      const userRecord = data?.List?.[0];
      if (!userRecord) {
        throw new Error('User record not found');
      }

      // Parse existing permissions
      let allPermissions = {};
      if (userRecord.detailed_permissions) {
        try {
          allPermissions = JSON.parse(userRecord.detailed_permissions);
        } catch (parseError) {
          console.warn('Failed to parse existing permissions, creating new:', parseError);
        }
      }

      // Update module permissions
      allPermissions[module] = permissions;

      // Save updated permissions
      const updateResponse = await window.ezsite.apis.tableUpdate('11725', {
        ID: userRecord.ID,
        detailed_permissions: JSON.stringify(allPermissions)
      });

      if (updateResponse.error) throw updateResponse.error;

      toast({
        title: "Success",
        description: `${module} permissions updated successfully`,
        variant: "default"
      });

    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        title: "Error",
        description: "Failed to save permissions",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getPermissionIcon = (type: keyof ModulePermissions) => {
    const icons = {
      view: Eye,
      create: Plus,
      edit: Edit,
      delete: Trash2,
      export: Download,
      print: Printer
    };
    return icons[type];
  };

  const getPermissionLabel = (type: keyof ModulePermissions) => {
    const labels = {
      view: 'View',
      create: 'Create',
      edit: 'Edit',
      delete: 'Delete',
      export: 'Export',
      print: 'Print'
    };
    return labels[type];
  };

  if (!isAdmin) {
    return (
      <Card className={`border-orange-200 bg-orange-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-900">Permission Toggle</p>
              <p className="text-sm text-orange-700">
                Administrator access required
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-blue-900">
          <Shield className="w-5 h-5" />
          <span>Real-Time Permission Toggle</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {module}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Selector */}
        {showUserSelector && (
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Select User</span>
            </Label>
            <Select 
              value={selectedUserId?.toString() || ''} 
              onValueChange={(value) => setSelectedUserId(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a user to manage permissions" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id.toString()}>
                    <div className="flex items-center space-x-2">
                      <span>{user.employee_id}</span>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {user.station}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Permission Toggles */}
        {selectedUserId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Module Permissions</h4>
              {loading && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(permissions) as Array<keyof ModulePermissions>).map((permissionType) => {
                const Icon = getPermissionIcon(permissionType);
                const isEnabled = permissions[permissionType];

                return (
                  <div
                    key={permissionType}
                    className={`
                      p-3 border rounded-lg transition-all duration-200
                      ${isEnabled 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                        <Label 
                          htmlFor={`${module}-${permissionType}`}
                          className={`font-medium cursor-pointer ${isEnabled ? 'text-green-900' : 'text-gray-700'}`}
                        >
                          {getPermissionLabel(permissionType)}
                        </Label>
                      </div>
                      <Switch
                        id={`${module}-${permissionType}`}
                        checked={isEnabled}
                        onCheckedChange={(checked) => handlePermissionChange(permissionType, checked)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Changes are applied in real-time
              </div>
              <Button
                onClick={savePermissions}
                disabled={saving || loading}
                className="flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Permissions</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {!selectedUserId && showUserSelector && (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>Select a user to manage their {module} permissions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimePermissionToggle;