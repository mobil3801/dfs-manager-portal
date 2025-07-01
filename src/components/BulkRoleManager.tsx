import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Zap,
  Users,
  Save,
  Filter,
  CheckCircle,
  AlertTriangle,
  Info,
  Building2,
  UserCheck,
  Shield } from
'lucide-react';

interface BulkRoleManagerProps {
  trigger?: React.ReactNode;
  onRolesAssigned?: () => void;
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

const BulkRoleManager: React.FC<BulkRoleManagerProps> = ({
  trigger,
  onRolesAssigned
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterStation, setFilterStation] = useState<string>('All');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

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

  const handleUserToggle = (userId: number) => {
    setSelectedUsers((prev) =>
    prev.includes(userId) ?
    prev.filter((id) => id !== userId) :
    [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  const handleBulkAssign = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one user",
        variant: "destructive"
      });
      return;
    }

    if (!selectedRole) {
      toast({
        title: "No Role Selected",
        description: "Please select a role to assign",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const roleTemplate = ROLE_TEMPLATES[selectedRole as keyof typeof ROLE_TEMPLATES];

      // Update all selected users
      for (const userId of selectedUsers) {
        const { error } = await window.ezsite.apis.tableUpdate(11725, {
          id: userId,
          role: selectedRole,
          detailed_permissions: JSON.stringify(roleTemplate.permissions)
        });

        if (error) {
          throw new Error(`Failed to update user ${userId}: ${error}`);
        }
      }

      toast({
        title: "Success",
        description: `Role "${selectedRole}" assigned to ${selectedUsers.length} users successfully`
      });

      setIsOpen(false);
      setSelectedUsers([]);
      setSelectedRole('');

      if (onRolesAssigned) {
        onRolesAssigned();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to assign roles: ${error}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    const matchesStation = filterStation === 'All' || user.station === filterStation;
    return matchesRole && matchesStation;
  });

  const roles = ['All', ...Array.from(new Set(users.map((user) => user.role)))];
  const stations = ['All', ...Array.from(new Set(users.map((user) => user.station)))];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger &&
      <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      }
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Bulk Role Assignment</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Information Alert */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="font-semibold mb-1">Bulk Role Assignment</div>
              <div>Select multiple users and assign them the same role. This will update both their role and permissions automatically.</div>
            </AlertDescription>
          </Alert>

          {/* Filters and Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Filter by Role</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) =>
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Filter by Station</Label>
              <Select value={filterStation} onValueChange={setFilterStation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) =>
                  <SelectItem key={station} value={station}>{station}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Assign Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose new role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_TEMPLATES).map(([key, template]) =>
                  <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <span>{template.name}</span>
                        <Badge className={template.color}>{template.name}</Badge>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterRole('All');
                  setFilterStation('All');
                }}>
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Selection Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">
                      {selectedUsers.length} of {filteredUsers.length} users selected
                    </span>
                  </div>
                  {selectedRole &&
                  <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        Will assign: <Badge className={ROLE_TEMPLATES[selectedRole as keyof typeof ROLE_TEMPLATES].color}>
                          {selectedRole}
                        </Badge>
                      </span>
                    </div>
                  }
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={filteredUsers.length === 0}>
                  {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Users ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <ScrollArea className="h-64">
                {loading ?
                <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">Loading users...</div>
                  </div> :

                <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                          checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all users" />
                        </TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Current Role</TableHead>
                        <TableHead>Station</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ?
                    <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="text-gray-500">No users match current filters</div>
                          </TableCell>
                        </TableRow> :

                    filteredUsers.map((user) =>
                    <TableRow
                      key={user.id}
                      className={selectedUsers.includes(user.id) ? 'bg-blue-50' : ''}>
                            <TableCell>
                              <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleUserToggle(user.id)}
                          aria-label={`Select ${user.employee_id}`} />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{user.employee_id}</div>
                                <div className="text-sm text-gray-500">{user.phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                        user.role === 'Administrator' ? 'bg-red-100 text-red-800' :
                        user.role === 'Management' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                        }>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="flex items-center space-x-1">
                                <Building2 className="w-3 h-3" />
                                <span>{user.station}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                    )
                    }
                    </TableBody>
                  </Table>
                }
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAssign}
              disabled={selectedUsers.length === 0 || !selectedRole || saving}
              className="bg-orange-600 hover:bg-orange-700">
              <Zap className="w-4 h-4 mr-2" />
              {saving ? `Assigning to ${selectedUsers.length} users...` : `Assign Role to ${selectedUsers.length} Users`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>);

};

export default BulkRoleManager;