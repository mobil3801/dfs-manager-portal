import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  Shield,
  Settings,
  Search,
  UserPlus,
  Edit3,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Filter,
  RefreshCw,
  Lock,
  Unlock,
  UserCheck,
  Building2,
  Activity } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { motion, AnimatePresence } from 'motion/react';

interface User {
  id: number;
  user_id: number;
  role: string;
  station: string;
  employee_id: string;
  phone: string;
  hire_date: string;
  is_active: boolean;
  detailed_permissions: string;
  email?: string;
  name?: string;
  last_login?: string;
}

interface AuditLog {
  id: number;
  event_type: string;
  user_id: number;
  username: string;
  event_timestamp: string;
  event_status: string;
  action_performed: string;
  additional_data: string;
  station: string;
}

const ROLES = [
{ value: 'Administrator', label: 'Administrator', color: 'bg-red-500' },
{ value: 'Management', label: 'Management', color: 'bg-blue-500' },
{ value: 'Employee', label: 'Employee', color: 'bg-green-500' }];


const STATIONS = [
{ value: 'ALL', label: 'All Stations' },
{ value: 'MOBIL', label: 'MOBIL' },
{ value: 'AMOCO ROSEDALE', label: 'AMOCO ROSEDALE' },
{ value: 'AMOCO BROOKLYN', label: 'AMOCO BROOKLYN' }];


const DEFAULT_PERMISSIONS = {
  Administrator: {
    dashboard: { view: true, create: true, edit: true, delete: true },
    products: { view: true, create: true, edit: true, delete: true },
    employees: { view: true, create: true, edit: true, delete: true },
    sales: { view: true, create: true, edit: true, delete: true },
    vendors: { view: true, create: true, edit: true, delete: true },
    orders: { view: true, create: true, edit: true, delete: true },
    licenses: { view: true, create: true, edit: true, delete: true },
    salary: { view: true, create: true, edit: true, delete: true },
    inventory: { view: true, create: true, edit: true, delete: true },
    delivery: { view: true, create: true, edit: true, delete: true },
    settings: { view: true, create: true, edit: true, delete: true },
    admin: { view: true, create: true, edit: true, delete: true }
  },
  Management: {
    dashboard: { view: true, create: true, edit: true, delete: false },
    products: { view: true, create: true, edit: true, delete: false },
    employees: { view: true, create: true, edit: true, delete: false },
    sales: { view: true, create: true, edit: true, delete: false },
    vendors: { view: true, create: true, edit: true, delete: false },
    orders: { view: true, create: true, edit: true, delete: false },
    licenses: { view: true, create: true, edit: true, delete: false },
    salary: { view: true, create: false, edit: false, delete: false },
    inventory: { view: true, create: true, edit: true, delete: false },
    delivery: { view: true, create: true, edit: true, delete: false },
    settings: { view: true, create: false, edit: true, delete: false },
    admin: { view: false, create: false, edit: false, delete: false }
  },
  Employee: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    products: { view: true, create: false, edit: false, delete: false },
    employees: { view: false, create: false, edit: false, delete: false },
    sales: { view: true, create: true, edit: true, delete: false },
    vendors: { view: true, create: false, edit: false, delete: false },
    orders: { view: true, create: true, edit: false, delete: false },
    licenses: { view: true, create: false, edit: false, delete: false },
    salary: { view: false, create: false, edit: false, delete: false },
    inventory: { view: true, create: false, edit: false, delete: false },
    delivery: { view: true, create: true, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
    admin: { view: false, create: false, edit: false, delete: false }
  }
};

const EnhancedAdminPanel: React.FC = () => {
  const { toast } = useToast();
  const { hasAdminAccess, userRole } = useAdminAccess();

  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [stationFilter, setStationFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);

  // New user form state
  const [newUser, setNewUser] = useState({
    employee_id: '',
    role: '',
    station: '',
    phone: '',
    hire_date: '',
    detailed_permissions: ''
  });

  useEffect(() => {
    if (hasAdminAccess) {
      loadUsers();
      loadAuditLogs();
    }
  }, [hasAdminAccess]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });

      if (response.error) throw response.error;
      setUsers(response.data?.List || []);
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

  const loadAuditLogs = async () => {
    try {
      const response = await window.ezsite.apis.tablePage(12706, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: "event_timestamp",
        IsAsc: false,
        Filters: [
        { name: "event_type", op: "StringContains", value: "Permission" }]

      });

      if (response.error) throw response.error;
      setAuditLogs(response.data?.List || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  };

  const createUser = async () => {
    try {
      setLoading(true);

      // Generate default permissions based on role
      const permissions = DEFAULT_PERMISSIONS[newUser.role as keyof typeof DEFAULT_PERMISSIONS] || DEFAULT_PERMISSIONS.Employee;

      const userData = {
        ...newUser,
        detailed_permissions: JSON.stringify(permissions),
        is_active: true
      };

      const response = await window.ezsite.apis.tableCreate(11725, userData);
      if (response.error) throw response.error;

      // Log audit event
      await logAuditEvent('User Created', `Created user with role: ${newUser.role}, station: ${newUser.station}`);

      toast({
        title: "Success",
        description: "User created successfully"
      });

      setShowCreateUserDialog(false);
      setNewUser({
        employee_id: '',
        role: '',
        station: '',
        phone: '',
        hire_date: '',
        detailed_permissions: ''
      });
      loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: number, newRole: string, newStation: string) => {
    try {
      setLoading(true);

      // Generate new permissions based on role
      const permissions = DEFAULT_PERMISSIONS[newRole as keyof typeof DEFAULT_PERMISSIONS] || DEFAULT_PERMISSIONS.Employee;

      const response = await window.ezsite.apis.tableUpdate(11725, {
        id: userId,
        role: newRole,
        station: newStation,
        detailed_permissions: JSON.stringify(permissions)
      });

      if (response.error) throw response.error;

      // Log audit event
      await logAuditEvent('Role Updated', `Updated user role to: ${newRole}, station: ${newStation}`);

      toast({
        title: "Success",
        description: "User role updated successfully"
      });

      loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      const response = await window.ezsite.apis.tableUpdate(11725, {
        id: userId,
        is_active: !isActive
      });

      if (response.error) throw response.error;

      // Log audit event
      await logAuditEvent('User Status Changed', `User ${!isActive ? 'activated' : 'deactivated'}`);

      toast({
        title: "Success",
        description: `User ${!isActive ? 'activated' : 'deactivated'} successfully`
      });

      loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const logAuditEvent = async (eventType: string, actionPerformed: string) => {
    try {
      await window.ezsite.apis.tableCreate(12706, {
        event_type: eventType,
        user_id: 1, // Current user ID
        username: 'admin',
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent,
        event_timestamp: new Date().toISOString(),
        event_status: 'Success',
        resource_accessed: 'User Management',
        action_performed: actionPerformed,
        session_id: Date.now().toString(),
        risk_level: 'Medium',
        additional_data: JSON.stringify({ module: 'AdminPanel' })
      });
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.station?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStation = !stationFilter || user.station === stationFilter;

    return matchesSearch && matchesRole && matchesStation;
  });

  if (!hasAdminAccess) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have administrator privileges to access this panel.
          </p>
        </CardContent>
      </Card>);

  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions across all stations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadUsers}
            variant="outline"
            size="sm"
            disabled={loading}>

            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateUserDialog(true)}
            disabled={loading}>

            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by employee ID, role, or station..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10" />

                  </div>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    {ROLES.map((role) =>
                    <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Select value={stationFilter} onValueChange={setStationFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by station" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Stations</SelectItem>
                    {STATIONS.map((station) =>
                    <SelectItem key={station.value} value={station.value}>
                        {station.label}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Station</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hire Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredUsers.map((user) => {
                        const role = ROLES.find((r) => r.value === user.role);
                        return (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="group">

                            <TableCell className="font-medium">
                              {user.employee_id}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${role?.color} text-white`}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {user.station === 'ALL' && <Building2 className="h-4 w-4" />}
                                {user.station}
                              </div>
                            </TableCell>
                            <TableCell>{user.phone}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={user.is_active}
                                  onCheckedChange={() => toggleUserStatus(user.id, user.is_active)}
                                  disabled={loading} />

                                <span className={user.is_active ? 'text-green-600' : 'text-red-600'}>
                                  {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {user.hire_date ? new Date(user.hire_date).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowPermissionDialog(true);
                                  }}>

                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {


                                    // View user details
                                  }}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>);
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Templates</CardTitle>
              <CardDescription>
                Default permission sets for each role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {ROLES.map((role) =>
              <div key={role.value} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={`${role.color} text-white`}>
                      {role.label}
                    </Badge>
                    <h4 className="font-semibold">Permissions</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(DEFAULT_PERMISSIONS[role.value as keyof typeof DEFAULT_PERMISSIONS] || {}).map(([module, permissions]) =>
                  <Card key={module} className="p-3">
                        <h5 className="font-medium mb-2 capitalize">{module}</h5>
                        <div className="space-y-1 text-sm">
                          {Object.entries(permissions).map(([action, allowed]) =>
                      <div key={action} className="flex items-center justify-between">
                              <span className="capitalize">{action}</span>
                              {allowed ?
                        <CheckCircle className="h-4 w-4 text-green-500" /> :

                        <AlertCircle className="h-4 w-4 text-red-500" />
                        }
                            </div>
                      )}
                        </div>
                      </Card>
                  )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Permission Change Audit Log
              </CardTitle>
              <CardDescription>
                Track all permission and role changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {auditLogs.map((log) =>
                  <Card key={log.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={log.event_status === 'Success' ? 'default' : 'destructive'}>
                              {log.event_type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              by {log.username}
                            </span>
                          </div>
                          <p className="text-sm">{log.action_performed}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(log.event_timestamp).toLocaleString()}
                            </span>
                            {log.station &&
                          <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {log.station}
                              </span>
                          }
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system with appropriate permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="employee_id">Employee ID</Label>
              <Input
                id="employee_id"
                value={newUser.employee_id}
                onChange={(e) => setNewUser((prev) => ({ ...prev, employee_id: e.target.value }))}
                placeholder="Enter employee ID" />

            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser((prev) => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) =>
                  <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="station">Station Assignment</Label>
              <Select value={newUser.station} onValueChange={(value) => setNewUser((prev) => ({ ...prev, station: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  {STATIONS.map((station) =>
                  <SelectItem key={station.value} value={station.value}>
                      {station.label}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newUser.phone}
                onChange={(e) => setNewUser((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number" />

            </div>
            <div>
              <Label htmlFor="hire_date">Hire Date</Label>
              <Input
                id="hire_date"
                type="date"
                value={newUser.hire_date}
                onChange={(e) => setNewUser((prev) => ({ ...prev, hire_date: e.target.value }))} />

            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateUserDialog(false)}
                disabled={loading}>

                Cancel
              </Button>
              <Button
                onClick={createUser}
                disabled={loading || !newUser.employee_id || !newUser.role || !newUser.station}>

                {loading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Role Dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Role & Permissions</DialogTitle>
            <DialogDescription>
              Modify user role and station assignment
            </DialogDescription>
          </DialogHeader>
          {selectedUser &&
          <div className="space-y-4">
              <div>
                <Label>Employee ID</Label>
                <Input value={selectedUser.employee_id} disabled />
              </div>
              <div>
                <Label>Current Role</Label>
                <Select
                value={selectedUser.role}
                onValueChange={(value) => setSelectedUser((prev) => prev ? { ...prev, role: value } : null)}>

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) =>
                  <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                  )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Station Assignment</Label>
                <Select
                value={selectedUser.station}
                onValueChange={(value) => setSelectedUser((prev) => prev ? { ...prev, station: value } : null)}>

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATIONS.map((station) =>
                  <SelectItem key={station.value} value={station.value}>
                        {station.label}
                      </SelectItem>
                  )}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedUser.station === 'ALL' &&
            <Alert>
                  <Building2 className="h-4 w-4" />
                  <AlertDescription>
                    This user will have access to all stations and can manage cross-station operations.
                  </AlertDescription>
                </Alert>
            }

              <div className="flex justify-end gap-2">
                <Button
                variant="outline"
                onClick={() => setShowPermissionDialog(false)}
                disabled={loading}>

                  Cancel
                </Button>
                <Button
                onClick={() => {
                  if (selectedUser) {
                    updateUserRole(selectedUser.id, selectedUser.role, selectedUser.station);
                    setShowPermissionDialog(false);
                  }
                }}
                disabled={loading}>

                  {loading ? 'Updating...' : 'Update Role'}
                </Button>
              </div>
            </div>
          }
        </DialogContent>
      </Dialog>
    </div>);

};

export default EnhancedAdminPanel;