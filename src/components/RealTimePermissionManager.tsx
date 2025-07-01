import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Users,
  Database,
  Settings,
  Eye,
  Edit3,
  Plus,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Activity
} from 'lucide-react';

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

interface PermissionGroup {
  name: string;
  displayName: string;
  permissions: {
    view: boolean;
    edit: boolean;
    create: boolean;
    delete: boolean;
  };
}

const CONTENT_AREAS = [
  { name: 'dashboard', displayName: 'Dashboard' },
  { name: 'products', displayName: 'Products' },
  { name: 'employees', displayName: 'Employees' },
  { name: 'sales_reports', displayName: 'Sales Reports' },
  { name: 'vendors', displayName: 'Vendors' },
  { name: 'orders', displayName: 'Orders' },
  { name: 'licenses', displayName: 'Licenses' },
  { name: 'salary', displayName: 'Salary' },
  { name: 'inventory', displayName: 'Inventory' },
  { name: 'delivery', displayName: 'Delivery' },
  { name: 'settings', displayName: 'Settings' },
  { name: 'user_management', displayName: 'User Management' },
  { name: 'site_management', displayName: 'Site Management' },
  { name: 'system_logs', displayName: 'System Logs' },
  { name: 'security_settings', displayName: 'Security Settings' }
];

const RealTimePermissionManager: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

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
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: `Failed to load users: ${error}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
    toast({
      title: "Success",
      description: "Real-time permission data refreshed successfully"
    });
  };

  const parsePermissions = (permissionString: string) => {
    try {
      return JSON.parse(permissionString || '{}');
    } catch {
      return {};
    }
  };

  const handleUserSelect = (user: UserProfile) => {
    setSelectedUser(user);
    const userPermissions = parsePermissions(user.detailed_permissions);
    setPermissions(userPermissions);
    setIsPermissionDialogOpen(true);
  };

  const handlePermissionChange = (area: string, permission: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [area]: {
        ...prev[area],
        [permission]: value
      }
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await window.ezsite.apis.tableUpdate(11725, {
        id: selectedUser.id,
        detailed_permissions: JSON.stringify(permissions)
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Permissions updated successfully"
      });

      setIsPermissionDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update permissions: ${error}`,
        variant: "destructive"
      });
    }
  };

  const getPermissionSummary = (user: UserProfile) => {
    const userPermissions = parsePermissions(user.detailed_permissions);
    const totalAreas = CONTENT_AREAS.length;
    const areasWithAccess = CONTENT_AREAS.filter(area => 
      userPermissions[area.name]?.view
    ).length;

    return {
      areasWithAccess,
      totalAreas,
      percentage: totalAreas > 0 ? Math.round((areasWithAccess / totalAreas) * 100) : 0
    };
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roles = ['All', ...Array.from(new Set(users.map(user => user.role)))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading real-time permission manager...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Real-Time Permission Manager</h2>
            <p className="text-sm text-blue-600 font-medium">✓ Live permission control with instant updates</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="w-3 h-3 mr-1" />
            {users.length} Users
          </Badge>
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            className="flex items-center space-x-2">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {/* Information Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Activity className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="font-semibold mb-1">Real-Time Permission Control</div>
          <div>Click on any user to modify their permissions in real-time. Changes are instantly saved to the production database.</div>
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by employee ID or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('All');
              }}>
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users & Permission Status ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Permission Status</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-3">
                        <Database className="w-12 h-12 text-gray-300" />
                        <div>
                          <p className="text-gray-500 font-medium">No users match current filters</p>
                          <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const summary = getPermissionSummary(user);
                    return (
                      <TableRow key={user.id}>
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
                          <Badge variant="outline">{user.station}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {summary.areasWithAccess > 0 ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-orange-600" />
                            )}
                            <span className="text-sm">
                              {summary.areasWithAccess}/{summary.totalAreas} areas
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  summary.percentage >= 70 ? 'bg-green-500' :
                                  summary.percentage >= 40 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${summary.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{summary.percentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleUserSelect(user)}
                            className="bg-blue-600 hover:bg-blue-700">
                            <Settings className="w-4 h-4 mr-2" />
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Permission Management Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Permission Manager - {selectedUser?.employee_id}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              {/* User Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-600">Role</Label>
                      <p className="font-medium">{selectedUser?.role}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Station</Label>
                      <p className="font-medium">{selectedUser?.station}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Status</Label>
                      <Badge className={selectedUser?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {selectedUser?.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permissions Grid */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Content Area Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Content Area</TableHead>
                          <TableHead className="text-center">View</TableHead>
                          <TableHead className="text-center">Edit</TableHead>
                          <TableHead className="text-center">Create</TableHead>
                          <TableHead className="text-center">Delete</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {CONTENT_AREAS.map((area) => (
                          <TableRow key={area.name}>
                            <TableCell className="font-medium">{area.displayName}</TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={permissions[area.name]?.view || false}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(area.name, 'view', checked as boolean)
                                } />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={permissions[area.name]?.edit || false}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(area.name, 'edit', checked as boolean)
                                } />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={permissions[area.name]?.create || false}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(area.name, 'create', checked as boolean)
                                } />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={permissions[area.name]?.delete || false}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(area.name, 'delete', checked as boolean)
                                } />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Save Permissions
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RealTimePermissionManager;