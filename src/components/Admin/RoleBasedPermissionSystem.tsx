
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Users, 
  Settings, 
  Search, 
  Filter, 
  Edit,
  Save,
  X,
  Check,
  UserCheck,
  UserX,
  Building,
  AlertTriangle,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { motion } from 'motion/react';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  station: string;
  is_active: boolean;
  last_login?: string;
  created_at?: string;
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

interface RolePermissions {
  [key: string]: {
    name: string;
    description: string;
    permissions: {
      [feature: string]: {
        view: boolean;
        create: boolean;
        edit: boolean;
        delete: boolean;
        manage: boolean;
      };
    };
  };
}

const ROLE_DEFINITIONS: RolePermissions = {
  Administrator: {
    name: 'Administrator',
    description: 'Full access to all features, configuration, user management, and reporting',
    permissions: {
      dashboard: { view: true, create: true, edit: true, delete: true, manage: true },
      users: { view: true, create: true, edit: true, delete: true, manage: true },
      products: { view: true, create: true, edit: true, delete: true, manage: true },
      employees: { view: true, create: true, edit: true, delete: true, manage: true },
      sales: { view: true, create: true, edit: true, delete: true, manage: true },
      vendors: { view: true, create: true, edit: true, delete: true, manage: true },
      orders: { view: true, create: true, edit: true, delete: true, manage: true },
      licenses: { view: true, create: true, edit: true, delete: true, manage: true },
      salary: { view: true, create: true, edit: true, delete: true, manage: true },
      inventory: { view: true, create: true, edit: true, delete: true, manage: true },
      delivery: { view: true, create: true, edit: true, delete: true, manage: true },
      settings: { view: true, create: true, edit: true, delete: true, manage: true },
      reports: { view: true, create: true, edit: true, delete: true, manage: true },
      audit: { view: true, create: true, edit: true, delete: true, manage: true },
      admin: { view: true, create: true, edit: true, delete: true, manage: true }
    }
  },
  Management: {
    name: 'Management',
    description: 'Access to operational features, station management, and staff oversight within assigned stations',
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false, manage: true },
      users: { view: true, create: false, edit: false, delete: false, manage: false },
      products: { view: true, create: true, edit: true, delete: false, manage: true },
      employees: { view: true, create: true, edit: true, delete: false, manage: true },
      sales: { view: true, create: true, edit: true, delete: false, manage: true },
      vendors: { view: true, create: true, edit: true, delete: false, manage: false },
      orders: { view: true, create: true, edit: true, delete: false, manage: true },
      licenses: { view: true, create: false, edit: false, delete: false, manage: false },
      salary: { view: true, create: true, edit: true, delete: false, manage: true },
      inventory: { view: true, create: true, edit: true, delete: false, manage: true },
      delivery: { view: true, create: true, edit: true, delete: false, manage: true },
      settings: { view: true, create: false, edit: false, delete: false, manage: false },
      reports: { view: true, create: true, edit: false, delete: false, manage: true },
      audit: { view: true, create: false, edit: false, delete: false, manage: false },
      admin: { view: false, create: false, edit: false, delete: false, manage: false }
    }
  },
  Employee: {
    name: 'Employee',
    description: 'Restricted access to daily operations features only',
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false, manage: false },
      users: { view: false, create: false, edit: false, delete: false, manage: false },
      products: { view: true, create: false, edit: false, delete: false, manage: false },
      employees: { view: false, create: false, edit: false, delete: false, manage: false },
      sales: { view: true, create: true, edit: true, delete: false, manage: false },
      vendors: { view: true, create: false, edit: false, delete: false, manage: false },
      orders: { view: true, create: false, edit: false, delete: false, manage: false },
      licenses: { view: false, create: false, edit: false, delete: false, manage: false },
      salary: { view: false, create: false, edit: false, delete: false, manage: false },
      inventory: { view: true, create: false, edit: false, delete: false, manage: false },
      delivery: { view: true, create: true, edit: false, delete: false, manage: false },
      settings: { view: false, create: false, edit: false, delete: false, manage: false },
      reports: { view: false, create: false, edit: false, delete: false, manage: false },
      audit: { view: false, create: false, edit: false, delete: false, manage: false },
      admin: { view: false, create: false, edit: false, delete: false, manage: false }
    }
  }
};

const STATIONS = ['MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN', 'All Stations'];

const RoleBasedPermissionSystem: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStation, setFilterStation] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<string>('');
  const [editingStation, setEditingStation] = useState<string>('');
  const [showPermissionDetails, setShowPermissionDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const { toast } = useToast();
  const { hasAccess, isAdmin } = useAdminAccess();

  console.log('RoleBasedPermissionSystem: Component initialized');

  useEffect(() => {
    if (hasAccess) {
      loadUsers();
      loadUserProfiles();
    }
  }, [hasAccess]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Loading users from User table');
      
      const { data, error } = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;
      
      console.log('Users loaded successfully:', data);
      setUsers(data?.List || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfiles = async () => {
    try {
      console.log('Loading user profiles');
      
      const { data, error } = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;
      
      console.log('User profiles loaded successfully:', data);
      setUserProfiles(data?.List || []);
    } catch (error) {
      console.error('Error loading user profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user profiles',
        variant: 'destructive'
      });
    }
  };

  const updateUserRole = async (userId: number, newRole: string, newStation: string) => {
    try {
      setLoading(true);
      console.log('Updating user role:', { userId, newRole, newStation });

      // Find existing profile or create new one
      const existingProfile = userProfiles.find(p => p.user_id === userId);
      
      const profileData = {
        user_id: userId,
        role: newRole,
        station: newStation,
        employee_id: existingProfile?.employee_id || '',
        phone: existingProfile?.phone || '',
        hire_date: existingProfile?.hire_date || new Date().toISOString(),
        is_active: true,
        detailed_permissions: JSON.stringify(ROLE_DEFINITIONS[newRole]?.permissions || {})
      };

      let error;
      if (existingProfile) {
        // Update existing profile
        const response = await window.ezsite.apis.tableUpdate(11725, {
          id: existingProfile.id,
          ...profileData
        });
        error = response.error;
      } else {
        // Create new profile
        const response = await window.ezsite.apis.tableCreate(11725, profileData);
        error = response.error;
      }

      if (error) throw error;

      console.log('User role updated successfully');
      await loadUserProfiles();
      
      toast({
        title: 'Success',
        description: `User role updated to ${newRole}`,
      });

      setSelectedUser(null);
      setEditingRole('');
      setEditingStation('');
      
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const profile = userProfiles.find(p => p.user_id === user.id);
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || profile?.role === filterRole;
    const matchesStation = !filterStation || profile?.station === filterStation;
    
    return matchesSearch && matchesRole && matchesStation;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrator': return 'bg-red-100 text-red-800 border-red-200';
      case 'Management': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Employee': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPermissionLevel = (role: string): number => {
    switch (role) {
      case 'Administrator': return 100;
      case 'Management': return 60;
      case 'Employee': return 30;
      default: return 0;
    }
  };

  if (!hasAccess) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to access the permission system.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <CardTitle>Role-Based Permission System</CardTitle>
            </div>
            <CardDescription>
              Manage user roles and permissions across the system with secure access control.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>User Management</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Role Definitions</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Permission Matrix</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>User Management</span>
                <Badge variant="outline">{filteredUsers.length} users</Badge>
              </CardTitle>
              <CardDescription>
                Assign roles and manage user permissions across all stations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStation} onValueChange={setFilterStation}>
                  <SelectTrigger className="w-full md:w-48">
                    <Building className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by station" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Stations</SelectItem>
                    {STATIONS.map(station => (
                      <SelectItem key={station} value={station}>{station}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Station</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Permission Level</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const profile = userProfiles.find(p => p.user_id === user.id);
                      const role = profile?.role || 'Employee';
                      const station = profile?.station || 'MOBIL';
                      const permissionLevel = getPermissionLevel(role);
                      
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.name || user.email}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(role)}>
                              {role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{station}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {profile?.is_active ? (
                                <UserCheck className="h-4 w-4 text-green-600" />
                              ) : (
                                <UserX className="h-4 w-4 text-red-600" />
                              )}
                              <span className="text-sm">
                                {profile?.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={permissionLevel} className="w-16" />
                              <span className="text-sm text-gray-600">{permissionLevel}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setEditingRole(role);
                                    setEditingStation(station);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Edit User Permissions</DialogTitle>
                                  <DialogDescription>
                                    Modify role and station assignment for {user.email}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Select value={editingRole} onValueChange={setEditingRole}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Administrator">Administrator</SelectItem>
                                        <SelectItem value="Management">Management</SelectItem>
                                        <SelectItem value="Employee">Employee</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="station">Station Assignment</Label>
                                    <Select value={editingStation} onValueChange={setEditingStation}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select station" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {STATIONS.map(stationOption => (
                                          <SelectItem key={stationOption} value={stationOption}>
                                            {stationOption}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                      {editingRole === 'Management' 
                                        ? 'Management role allows oversight within assigned station(s).'
                                        : editingRole === 'Administrator'
                                        ? 'Administrator role provides full system access.'
                                        : 'Employee role restricts access to daily operations only.'
                                      }
                                    </AlertDescription>
                                  </Alert>

                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() => updateUserRole(user.id, editingRole, editingStation)}
                                      disabled={loading}
                                      className="flex-1"
                                    >
                                      <Save className="h-4 w-4 mr-1" />
                                      Save Changes
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedUser(null);
                                        setEditingRole('');
                                        setEditingStation('');
                                      }}
                                      className="flex-1"
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(ROLE_DEFINITIONS).map(([roleKey, roleData]) => (
              <motion.div
                key={roleKey}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{roleData.name}</span>
                      <Badge className={getRoleColor(roleKey)}>
                        {getPermissionLevel(roleKey)}%
                      </Badge>
                    </CardTitle>
                    <CardDescription>{roleData.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Permission Level</span>
                        <Progress value={getPermissionLevel(roleKey)} className="w-20" />
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Features: {Object.keys(roleData.permissions).length}
                      </div>
                      <div className="text-sm text-gray-600">
                        Full Access: {Object.values(roleData.permissions).filter(p => p.manage).length}
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
              <CardTitle className="flex items-center justify-between">
                <span>Permission Matrix</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPermissionDetails(!showPermissionDetails)}
                >
                  {showPermissionDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPermissionDetails ? 'Hide Details' : 'Show Details'}
                </Button>
              </CardTitle>
              <CardDescription>
                Detailed breakdown of permissions across all roles and features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Administrator</TableHead>
                      <TableHead>Management</TableHead>
                      <TableHead>Employee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.keys(ROLE_DEFINITIONS.Administrator.permissions).map((feature) => (
                      <TableRow key={feature}>
                        <TableCell className="font-medium capitalize">{feature}</TableCell>
                        {Object.keys(ROLE_DEFINITIONS).map((role) => {
                          const permissions = ROLE_DEFINITIONS[role].permissions[feature];
                          const hasFullAccess = permissions.manage;
                          const hasPartialAccess = permissions.view || permissions.create || permissions.edit;
                          
                          return (
                            <TableCell key={role}>
                              <div className="flex items-center space-x-1">
                                {hasFullAccess ? (
                                  <Badge className="bg-green-100 text-green-800">Full Access</Badge>
                                ) : hasPartialAccess ? (
                                  <Badge variant="outline">Limited</Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-800">No Access</Badge>
                                )}
                                {showPermissionDetails && (
                                  <div className="text-xs text-gray-500 ml-2">
                                    {permissions.view && 'V'}{permissions.create && 'C'}{permissions.edit && 'E'}{permissions.delete && 'D'}{permissions.manage && 'M'}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              
              {showPermissionDetails && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Permission Legend:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                    <div>V = View</div>
                    <div>C = Create</div>
                    <div>E = Edit</div>
                    <div>D = Delete</div>
                    <div>M = Manage</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleBasedPermissionSystem;
