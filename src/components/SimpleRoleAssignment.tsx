import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  UserCheck,
  Save,
  Star,
  CheckCircle,
  Info,
  AlertCircle
} from 'lucide-react';

interface SimpleRoleAssignmentProps {
  selectedUserId?: number;
  trigger?: React.ReactNode;
  onRoleAssigned?: () => void;
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

const ROLE_TEMPLATES = {
  'Administrator': {
    name: 'Administrator',
    description: 'Full system access with all permissions',
    color: 'bg-red-100 text-red-800',
    icon: '👑',
    permissions: {
      dashboard: { view: true, edit: true, create: true, delete: true },
      products: { view: true, edit: true, create: true, delete: true },
      employees: { view: true, edit: true, create: true, delete: true },
      sales_reports: { view: true, edit: true, create: true, delete: true },
      vendors: { view: true, edit: true, create: true, delete: true },
      orders: { view: true, edit: true, create: true, delete: true },
      licenses: { view: true, edit: true, create: true, delete: true },
      salary: { view: true, edit: true, create: true, delete: true },
      inventory: { view: true, edit: true, create: true, delete: true },
      delivery: { view: true, edit: true, create: true, delete: true },
      settings: { view: true, edit: true, create: true, delete: true },
      user_management: { view: true, edit: true, create: true, delete: true },
      site_management: { view: true, edit: true, create: true, delete: true },
      system_logs: { view: true, edit: true, create: true, delete: true },
      security_settings: { view: true, edit: true, create: true, delete: true }
    }
  },
  'Management': {
    name: 'Management',
    description: 'Management level access excluding system administration',
    color: 'bg-blue-100 text-blue-800',
    icon: '👔',
    permissions: {
      dashboard: { view: true, edit: true, create: true, delete: true },
      products: { view: true, edit: true, create: true, delete: true },
      employees: { view: true, edit: true, create: true, delete: false },
      sales_reports: { view: true, edit: true, create: true, delete: true },
      vendors: { view: true, edit: true, create: true, delete: true },
      orders: { view: true, edit: true, create: true, delete: true },
      licenses: { view: true, edit: true, create: true, delete: true },
      salary: { view: true, edit: true, create: true, delete: true },
      inventory: { view: true, edit: true, create: true, delete: true },
      delivery: { view: true, edit: true, create: true, delete: true },
      settings: { view: true, edit: true, create: false, delete: false },
      user_management: { view: true, edit: false, create: false, delete: false },
      site_management: { view: true, edit: false, create: false, delete: false },
      system_logs: { view: true, edit: false, create: false, delete: false },
      security_settings: { view: false, edit: false, create: false, delete: false }
    }
  },
  'Employee': {
    name: 'Employee',
    description: 'Standard employee access with core functionality',
    color: 'bg-green-100 text-green-800',
    icon: '👤',
    permissions: {
      dashboard: { view: true, edit: false, create: false, delete: false },
      products: { view: true, edit: true, create: false, delete: false },
      employees: { view: false, edit: false, create: false, delete: false },
      sales_reports: { view: true, edit: true, create: true, delete: false },
      vendors: { view: true, edit: false, create: false, delete: false },
      orders: { view: true, edit: true, create: true, delete: false },
      licenses: { view: true, edit: false, create: false, delete: false },
      salary: { view: false, edit: false, create: false, delete: false },
      inventory: { view: true, edit: true, create: false, delete: false },
      delivery: { view: true, edit: true, create: true, delete: false },
      settings: { view: false, edit: false, create: false, delete: false },
      user_management: { view: false, edit: false, create: false, delete: false },
      site_management: { view: false, edit: false, create: false, delete: false },
      system_logs: { view: false, edit: false, create: false, delete: false },
      security_settings: { view: false, edit: false, create: false, delete: false }
    }
  },
  'Read Only': {
    name: 'Read Only',
    description: 'View-only access to basic information',
    color: 'bg-gray-100 text-gray-800',
    icon: '👁️',
    permissions: {
      dashboard: { view: true, edit: false, create: false, delete: false },
      products: { view: true, edit: false, create: false, delete: false },
      employees: { view: false, edit: false, create: false, delete: false },
      sales_reports: { view: true, edit: false, create: false, delete: false },
      vendors: { view: false, edit: false, create: false, delete: false },
      orders: { view: true, edit: false, create: false, delete: false },
      licenses: { view: false, edit: false, create: false, delete: false },
      salary: { view: false, edit: false, create: false, delete: false },
      inventory: { view: true, edit: false, create: false, delete: false },
      delivery: { view: false, edit: false, create: false, delete: false },
      settings: { view: false, edit: false, create: false, delete: false },
      user_management: { view: false, edit: false, create: false, delete: false },
      site_management: { view: false, edit: false, create: false, delete: false },
      system_logs: { view: false, edit: false, create: false, delete: false },
      security_settings: { view: false, edit: false, create: false, delete: false }
    }
  }
};

const SimpleRoleAssignment: React.FC<SimpleRoleAssignmentProps> = ({
  selectedUserId,
  trigger,
  onRoleAssigned
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (selectedUserId) {
        setSelectedUser(selectedUserId.toString());
      }
    }
  }, [isOpen, selectedUserId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'employee_id',
        IsAsc: true,
        Filters: []
      });

      if (error) throw error;
      setUsers(data?.List || []);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load users: ${error}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast({
        title: "Validation Error",
        description: "Please select both a user and a role",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const userId = parseInt(selectedUser);
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const roleTemplate = ROLE_TEMPLATES[selectedRole as keyof typeof ROLE_TEMPLATES];
      
      // Update both role and permissions
      const { error } = await window.ezsite.apis.tableUpdate(11725, {
        id: userId,
        role: selectedRole,
        detailed_permissions: JSON.stringify(roleTemplate.permissions)
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role "${selectedRole}" assigned successfully to ${user.employee_id}`
      });

      setIsOpen(false);
      setSelectedUser('');
      setSelectedRole('');
      
      if (onRoleAssigned) {
        onRoleAssigned();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to assign role: ${error}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedUserData = users.find(u => u.id === parseInt(selectedUser));
  const selectedRoleTemplate = selectedRole ? ROLE_TEMPLATES[selectedRole as keyof typeof ROLE_TEMPLATES] : null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Simple Role Assignment</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Information Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="font-semibold mb-1">Quick Role Assignment</div>
              <div>Choose a user and role template. Permissions will be automatically configured based on the selected role.</div>
            </AlertDescription>
          </Alert>

          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user-select">Select User</Label>
            <Select 
              value={selectedUser} 
              onValueChange={setSelectedUser}
              disabled={loading || !!selectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading users..." : "Choose a user"} />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    <div className="flex items-center space-x-2">
                      <span>{user.employee_id}</span>
                      <Badge className={
                        user.role === 'Administrator' ? 'bg-red-100 text-red-800' :
                        user.role === 'Management' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {user.role}
                      </Badge>
                      <span className="text-sm text-gray-500">({user.station})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedUserData && (
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{selectedUserData.employee_id}</div>
                      <div className="text-sm text-gray-500">{selectedUserData.phone} • {selectedUserData.station}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Current Role</div>
                      <Badge className={
                        selectedUserData.role === 'Administrator' ? 'bg-red-100 text-red-800' :
                        selectedUserData.role === 'Management' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {selectedUserData.role}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role-select">Select New Role</Label>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(ROLE_TEMPLATES).map(([key, template]) => (
                <Card 
                  key={key}
                  className={`cursor-pointer transition-all ${
                    selectedRole === key ? 'ring-2 ring-blue-500 border-blue-300' : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRole(key)}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{template.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{template.name}</span>
                          <Badge className={template.color}>{template.name}</Badge>
                          {selectedRole === key && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Role Preview */}
          {selectedRoleTemplate && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Role Preview</span>
                </div>
                <div className="text-sm text-green-700">
                  This role will provide access to key areas needed for {selectedRoleTemplate.name.toLowerCase()} responsibilities.
                  Permissions are automatically configured for optimal workflow.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignRole}
              disabled={!selectedUser || !selectedRole || saving}
              className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Assigning Role...' : 'Assign Role'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleRoleAssignment;