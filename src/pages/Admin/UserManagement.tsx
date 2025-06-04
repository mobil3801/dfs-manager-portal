import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useBatchSelection } from '@/hooks/use-batch-selection';
import BatchActionBar from '@/components/BatchActionBar';
import BatchDeleteDialog from '@/components/BatchDeleteDialog';
import BatchEditDialog from '@/components/BatchEditDialog';
import UserPermissionManager from '@/components/UserPermissionManager';
import EnhancedUserPermissionManager from '@/components/EnhancedUserPermissionManager';
import ComprehensivePermissionDialog from '@/components/ComprehensivePermissionDialog';
import AccessDenied from '@/components/AccessDenied';
import useAdminAccess from '@/hooks/use-admin-access';
import CreateUserDialog from '@/components/CreateUserDialog';
import {
  Users,
  Plus,
  UserPlus,
  Edit3,
  Trash2,
  Search,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Phone,
  Calendar,
  Building2,
  Settings,
  Clock,
  Activity,
  Eye,
  FileText,
  AlertCircle,
  RefreshCw } from
'lucide-react';

interface User {
  ID: number;
  Name: string;
  Email: string;
  CreateTime: string;
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

const UserManagement: React.FC = () => {
  const { isAdmin } = useAdminAccess();
  const [users, setUsers] = useState<User[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStation, setSelectedStation] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBatchEditDialogOpen, setIsBatchEditDialogOpen] = useState(false);
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null);
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const { toast } = useToast();

  // Batch selection hook
  const batchSelection = useBatchSelection<UserProfile>();

  // Batch edit form data
  const [batchEditData, setBatchEditData] = useState({
    role: '',
    station: '',
    is_active: true
  });

  const roles = ['Administrator', 'Management', 'Employee'];
  const stations = ['MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'];

  const [formData, setFormData] = useState({
    user_id: 0,
    role: 'Employee',
    station: 'MOBIL',
    employee_id: '',
    phone: '',
    hire_date: '',
    is_active: true
  });

  // Generate random user ID
  const generateRandomUserId = () => {
    const randomId = Math.floor(Math.random() * 1000000) + 100000; // 6-digit random number
    return randomId;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchUserProfiles(), fetchUsers()]);
    setLoading(false);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast({
      title: "Success",
      description: "Data refreshed successfully"
    });
  };

  const fetchUsers = async () => {
    try {
      const { data: currentUser, error: userError } = await window.ezsite.apis.getUserInfo();
      if (userError) {
        console.log('User info not available:', userError);
        setUsers([]);
        return;
      }
      setUsers([currentUser]);
    } catch (error) {
      console.error('Error fetching current user info:', error);
      setUsers([]);
    }
  };

  const fetchUserProfiles = async () => {
    try {
      console.log('Fetching user profiles from table ID: 11725');
      const { data, error } = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });

      if (error) {
        console.error('API returned error:', error);
        throw error;
      }

      console.log('User profiles data received:', data);
      setUserProfiles(data?.List || []);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      toast({
        title: "Error",
        description: `Failed to fetch user profiles: ${error}`,
        variant: "destructive"
      });
      setUserProfiles([]);
    }
  };

  const handleCreateProfile = async () => {
    if (!formData.employee_id || !formData.phone) {
      toast({
        title: "Validation Error",
        description: "Employee ID and Phone are required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await window.ezsite.apis.tableCreate(11725, formData);
      if (error) throw error;

      toast({
        title: "Success",
        description: "User profile created successfully"
      });

      setIsAddDialogOpen(false);
      setFormData({
        user_id: generateRandomUserId(),
        role: 'Employee',
        station: 'MOBIL',
        employee_id: '',
        phone: '',
        hire_date: '',
        is_active: true
      });
      fetchUserProfiles();
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: `Failed to create user profile: ${error}`,
        variant: "destructive"
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!selectedUserProfile) return;

    if (!formData.employee_id || !formData.phone) {
      toast({
        title: "Validation Error",
        description: "Employee ID and Phone are required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await window.ezsite.apis.tableUpdate(11725, {
        id: selectedUserProfile.id,
        ...formData
      });
      if (error) throw error;

      toast({
        title: "Success",
        description: "User profile updated successfully"
      });

      setIsEditDialogOpen(false);
      setSelectedUserProfile(null);
      fetchUserProfiles();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: `Failed to update user profile: ${error}`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteProfile = async (profileId: number) => {
    if (!confirm('Are you sure you want to delete this user profile? This action cannot be undone.')) return;

    try {
      const { error } = await window.ezsite.apis.tableDelete(11725, { id: profileId });
      if (error) throw error;

      toast({
        title: "Success",
        description: "User profile deleted successfully"
      });

      fetchUserProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: "Error",
        description: `Failed to delete user profile: ${error}`,
        variant: "destructive"
      });
    }
  };

  // Batch operations
  const handleBatchEdit = () => {
    const selectedData = batchSelection.getSelectedData(filteredProfiles, (profile) => profile.id);
    if (selectedData.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select profiles to edit",
        variant: "destructive"
      });
      return;
    }
    setIsBatchEditDialogOpen(true);
  };

  const handleBatchDelete = () => {
    const selectedData = batchSelection.getSelectedData(filteredProfiles, (profile) => profile.id);
    if (selectedData.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select profiles to delete",
        variant: "destructive"
      });
      return;
    }
    setIsBatchDeleteDialogOpen(true);
  };

  const confirmBatchEdit = async () => {
    setBatchActionLoading(true);
    try {
      const selectedData = batchSelection.getSelectedData(filteredProfiles, (profile) => profile.id);
      const updates = selectedData.map((profile) => ({
        id: profile.id,
        ...(batchEditData.role && { role: batchEditData.role }),
        ...(batchEditData.station && { station: batchEditData.station }),
        is_active: batchEditData.is_active
      }));

      for (const update of updates) {
        const { error } = await window.ezsite.apis.tableUpdate(11725, update);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Updated ${selectedData.length} user profiles successfully`
      });

      setIsBatchEditDialogOpen(false);
      batchSelection.clearSelection();
      fetchUserProfiles();
    } catch (error) {
      console.error('Error in batch edit:', error);
      toast({
        title: "Error",
        description: `Failed to update profiles: ${error}`,
        variant: "destructive"
      });
    } finally {
      setBatchActionLoading(false);
    }
  };

  const confirmBatchDelete = async () => {
    setBatchActionLoading(true);
    try {
      const selectedData = batchSelection.getSelectedData(filteredProfiles, (profile) => profile.id);

      for (const profile of selectedData) {
        const { error } = await window.ezsite.apis.tableDelete(11725, { id: profile.id });
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Deleted ${selectedData.length} user profiles successfully`
      });

      setIsBatchDeleteDialogOpen(false);
      batchSelection.clearSelection();
      fetchUserProfiles();
    } catch (error) {
      console.error('Error in batch delete:', error);
      toast({
        title: "Error",
        description: `Failed to delete profiles: ${error}`,
        variant: "destructive"
      });
    } finally {
      setBatchActionLoading(false);
    }
  };

  const handleEditProfile = (profile: UserProfile) => {
    setSelectedUserProfile(profile);
    setFormData({
      user_id: profile.user_id,
      role: profile.role,
      station: profile.station,
      employee_id: profile.employee_id,
      phone: profile.phone,
      hire_date: profile.hire_date || '',
      is_active: profile.is_active
    });
    setIsEditDialogOpen(true);
  };

  const filteredProfiles = userProfiles.filter((profile) => {
    const matchesSearch =
    profile.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All' || profile.role === selectedRole;
    const matchesStation = selectedStation === 'All' || profile.station === selectedStation;

    return matchesSearch && matchesRole && matchesStation;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrator':return 'bg-red-100 text-red-800';
      case 'Management':return 'bg-blue-100 text-blue-800';
      case 'Employee':return 'bg-green-100 text-green-800';
      default:return 'bg-gray-100 text-gray-800';
    }
  };

  const getStationBadgeColor = (station: string) => {
    switch (station) {
      case 'MOBIL':return 'bg-purple-100 text-purple-800';
      case 'AMOCO ROSEDALE':return 'bg-orange-100 text-orange-800';
      case 'AMOCO BROOKLYN':return 'bg-teal-100 text-teal-800';
      default:return 'bg-gray-100 text-gray-800';
    }
  };

  const getPermissionSummary = (profile: UserProfile) => {
    try {
      if (!profile.detailed_permissions) return 'Basic access';
      const permissions = JSON.parse(profile.detailed_permissions);
      const contentAreas = [
      'dashboard', 'products', 'employees', 'sales_reports', 'vendors',
      'orders', 'licenses', 'salary', 'inventory', 'delivery', 'settings',
      'user_management', 'site_management', 'system_logs', 'security_settings'];


      const areasWithAccess = contentAreas.filter((area) =>
      permissions[area]?.view
      ).length;

      return `${areasWithAccess}/${contentAreas.length} areas`;
    } catch {
      return 'Basic access';
    }
  };

  // Check admin access first
  if (!isAdmin) {
    return (
      <AccessDenied
        feature="User Management"
        requiredRole="Administrator" />);

  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading user management...</div>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        </div>
        <Button
          onClick={refreshData}
          disabled={refreshing}
          variant="outline"
          className="flex items-center space-x-2">

          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profiles" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>User Profiles</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Permission Management</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-6">
          {/* User Action Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <Button
              onClick={() => setIsCreateUserDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700">

              <UserPlus className="w-4 h-4 mr-2" />
              Create New User
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              if (open) {
                // Generate new random user ID when opening dialog
                const newUserId = generateRandomUserId();
                setFormData((prev) => ({ ...prev, user_id: newUserId }));
              }
              setIsAddDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User Profile Only
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[85vh]">
                <DialogHeader>
                  <DialogTitle>Create User Profile</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(85vh-120px)] pr-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="user_id">User ID (Auto-generated)</Label>
                      <div className="relative">
                        <Input
                          id="user_id"
                          type="number"
                          value={formData.user_id}
                          readOnly
                          disabled
                          className="bg-gray-50 text-gray-700 cursor-not-allowed"
                          placeholder="Auto-generated ID" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-200"
                          onClick={() => {
                            const newUserId = generateRandomUserId();
                            setFormData((prev) => ({ ...prev, user_id: newUserId }));
                            toast({
                              title: "Success",
                              description: `New User ID generated: ${newUserId}`
                            });
                          }}
                          title="Generate new random User ID">

                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        User ID is automatically generated. Click the refresh icon to generate a new one.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
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
                      <Label htmlFor="station">Station</Label>
                      <Select value={formData.station} onValueChange={(value) => setFormData({ ...formData, station: value })}>
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
                      <Label htmlFor="employee_id">Employee ID *</Label>
                      <Input
                        id="employee_id"
                        value={formData.employee_id}
                        onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                        placeholder="Enter employee ID"
                        required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                        required />
                    </div>
                    <div>
                      <Label htmlFor="hire_date">Hire Date</Label>
                      <Input
                        id="hire_date"
                        type="date"
                        value={formData.hire_date}
                        onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                      <Label htmlFor="is_active">Active User</Label>
                    </div>
                    <Button onClick={handleCreateProfile} className="w-full">
                      Create Profile
                    </Button>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{userProfiles.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Administrators</p>
                    <p className="text-2xl font-bold">
                      {userProfiles.filter((p) => p.role === 'Administrator').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold">
                      {userProfiles.filter((p) => p.is_active).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <UserX className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Inactive Users</p>
                    <p className="text-2xl font-bold">
                      {userProfiles.filter((p) => !p.is_active).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by employee ID or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10" />
                </div>
                
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Roles</SelectItem>
                    {roles.map((role) =>
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                
                <Select value={selectedStation} onValueChange={setSelectedStation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by station" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Stations</SelectItem>
                    {stations.map((station) =>
                    <SelectItem key={station} value={station}>{station}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRole('All');
                    setSelectedStation('All');
                  }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Batch Action Bar */}
          <BatchActionBar
            selectedCount={batchSelection.selectedCount}
            onBatchEdit={handleBatchEdit}
            onBatchDelete={handleBatchDelete}
            onClearSelection={batchSelection.clearSelection}
            isLoading={batchActionLoading} />


          {/* User Profiles Table */}
          <Card>
            <CardHeader>
              <CardTitle>User Profiles ({filteredProfiles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={filteredProfiles.length > 0 && batchSelection.selectedCount === filteredProfiles.length}
                          onCheckedChange={() => batchSelection.toggleSelectAll(filteredProfiles, (profile) => profile.id)}
                          aria-label="Select all profiles" />

                      </TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Station</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Hire Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.length === 0 ?
                    <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          {userProfiles.length === 0 ? "No user profiles found. Create your first user profile to get started." : "No profiles match your current filters."}
                        </TableCell>
                      </TableRow> :

                    filteredProfiles.map((profile) =>
                    <TableRow key={profile.id} className={batchSelection.isSelected(profile.id) ? "bg-blue-50" : ""}>
                          <TableCell>
                            <Checkbox
                          checked={batchSelection.isSelected(profile.id)}
                          onCheckedChange={() => batchSelection.toggleItem(profile.id)}
                          aria-label={`Select profile ${profile.employee_id}`} />

                          </TableCell>
                          <TableCell className="font-medium">{profile.employee_id}</TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(profile.role)}>
                              {profile.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStationBadgeColor(profile.station)}>
                              {profile.station}
                            </Badge>
                          </TableCell>
                          <TableCell>{profile.phone}</TableCell>
                          <TableCell>{profile.hire_date ? new Date(profile.hire_date).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>
                            <Badge className={profile.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {profile.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getPermissionSummary(profile)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProfile(profile)}>
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <ComprehensivePermissionDialog
                            selectedUserId={profile.id}
                            trigger={
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 hover:text-blue-700"
                              title="Comprehensive Permission Management">

                                    <Shield className="w-4 h-4" />
                                  </Button>
                            } />

                              <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProfile(profile.id)}
                            className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                    )
                    }
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Edit User Profile & Permissions</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(90vh-120px)]">
                {/* Left Side - Edit Form */}
                <div className="lg:col-span-1">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit_role">Role</Label>
                        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
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
                        <Label htmlFor="edit_station">Station</Label>
                        <Select value={formData.station} onValueChange={(value) => setFormData({ ...formData, station: value })}>
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
                        <Label htmlFor="edit_employee_id">Employee ID *</Label>
                        <Input
                          id="edit_employee_id"
                          value={formData.employee_id}
                          onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                          required />
                      </div>
                      <div>
                        <Label htmlFor="edit_phone">Phone *</Label>
                        <Input
                          id="edit_phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required />
                      </div>
                      <div>
                        <Label htmlFor="edit_hire_date">Hire Date</Label>
                        <Input
                          id="edit_hire_date"
                          type="date"
                          value={formData.hire_date}
                          onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="edit_is_active"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                        <Label htmlFor="edit_is_active">Active User</Label>
                      </div>
                      <Button onClick={handleUpdateProfile} className="w-full">
                        Update Profile
                      </Button>
                      
                      {/* Quick Permission Management */}
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Quick Actions
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const permissionsTab = document.querySelector('[value="permissions"]') as HTMLElement;
                            if (permissionsTab) {
                              permissionsTab.click();
                            }
                          }}
                          className="w-full">

                          Manage Detailed Permissions
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </div>

                {/* Middle & Right Side - User Summary & Activity */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* User Summary */}
                  <div>
                    <ScrollArea className="h-full">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg mb-3 flex items-center">
                          <Eye className="w-5 h-5 mr-2 text-blue-600" />
                          User Summary
                        </h3>
                        <div className="space-y-3">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Employee ID</p>
                            <p className="font-medium">{selectedUserProfile?.employee_id || 'N/A'}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Current Role</p>
                            <Badge className={getRoleBadgeColor(selectedUserProfile?.role || '')}>
                              {selectedUserProfile?.role || 'N/A'}
                            </Badge>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Station Assignment</p>
                            <Badge className={getStationBadgeColor(selectedUserProfile?.station || '')}>
                              {selectedUserProfile?.station || 'N/A'}
                            </Badge>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Status</p>
                            <Badge className={selectedUserProfile?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {selectedUserProfile?.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Permissions Overview */}
                        <Separator />
                        <h4 className="font-semibold text-md flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-green-600" />
                          Permissions Overview
                        </h4>
                        <div className="space-y-2">
                          {(() => {
                            try {
                              const permissions = selectedUserProfile?.detailed_permissions ?
                              JSON.parse(selectedUserProfile.detailed_permissions) : {};
                              const areas = ['dashboard', 'products', 'employees', 'sales_reports', 'vendors', 'orders', 'licenses', 'salary'];

                              return areas.map((area) => {
                                const hasAccess = permissions[area]?.view;
                                return (
                                  <div key={area} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm capitalize">{area.replace('_', ' ')}</span>
                                    <Badge variant={hasAccess ? 'default' : 'secondary'}>
                                      {hasAccess ? 'Access' : 'No Access'}
                                    </Badge>
                                  </div>);
                              });
                            } catch {
                              return (
                                <div className="p-2 bg-gray-50 rounded text-sm text-gray-600">
                                  Basic permissions configured
                                </div>);
                            }
                          })()
                          }
                        </div>
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Recent Activity & Tips */}
                  <div>
                    <ScrollArea className="h-full">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg mb-3 flex items-center">
                          <Activity className="w-5 h-5 mr-2 text-orange-600" />
                          Recent Activity
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-600 mt-1" />
                            <div>
                              <p className="text-sm font-medium">Profile Updated</p>
                              <p className="text-xs text-gray-600">Last modified today</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                            <UserCheck className="w-4 h-4 text-green-600 mt-1" />
                            <div>
                              <p className="text-sm font-medium">Account Status</p>
                              <p className="text-xs text-gray-600">Currently {selectedUserProfile?.is_active ? 'active' : 'inactive'}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                            <Building2 className="w-4 h-4 text-purple-600 mt-1" />
                            <div>
                              <p className="text-sm font-medium">Station Assignment</p>
                              <p className="text-xs text-gray-600">Assigned to {selectedUserProfile?.station}</p>
                            </div>
                          </div>
                        </div>

                        <Separator />
                        
                        {/* Tips & Help */}
                        <h4 className="font-semibold text-md mb-3 flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-indigo-600" />
                          Tips & Help
                        </h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="w-4 h-4 text-yellow-600 mt-1" />
                              <div>
                                <p className="text-sm font-medium text-yellow-800">Role Changes</p>
                                <p className="text-xs text-yellow-700">Changing roles will affect user permissions immediately</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start space-x-2">
                              <Settings className="w-4 h-4 text-blue-600 mt-1" />
                              <div>
                                <p className="text-sm font-medium text-blue-800">Station Assignment</p>
                                <p className="text-xs text-blue-700">Users can only access data for their assigned station</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-start space-x-2">
                              <Phone className="w-4 h-4 text-green-600 mt-1" />
                              <div>
                                <p className="text-sm font-medium text-green-800">Contact Information</p>
                                <p className="text-xs text-green-700">Keep phone numbers updated for important notifications</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="permissions">
          <EnhancedUserPermissionManager />
        </TabsContent>
      </Tabs>

      {/* Batch Edit Dialog */}
      <BatchEditDialog
        isOpen={isBatchEditDialogOpen}
        onClose={() => setIsBatchEditDialogOpen(false)}
        onSave={confirmBatchEdit}
        selectedCount={batchSelection.selectedCount}
        isLoading={batchActionLoading}
        itemName="user profiles">

        <div className="space-y-4">
          <div>
            <Label htmlFor="batch_role">Role</Label>
            <Select value={batchEditData.role} onValueChange={(value) => setBatchEditData({ ...batchEditData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select role to update" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Keep existing roles</SelectItem>
                {roles.map((role) =>
                <SelectItem key={role} value={role}>{role}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="batch_station">Station</Label>
            <Select value={batchEditData.station} onValueChange={(value) => setBatchEditData({ ...batchEditData, station: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select station to update" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Keep existing stations</SelectItem>
                {stations.map((station) =>
                <SelectItem key={station} value={station}>{station}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="batch_is_active"
              checked={batchEditData.is_active}
              onCheckedChange={(checked) => setBatchEditData({ ...batchEditData, is_active: checked as boolean })} />

            <Label htmlFor="batch_is_active">Set all selected users as active</Label>
          </div>
        </div>
      </BatchEditDialog>

      {/* Batch Delete Dialog */}
      <BatchDeleteDialog
        isOpen={isBatchDeleteDialogOpen}
        onClose={() => setIsBatchDeleteDialogOpen(false)}
        onConfirm={confirmBatchDelete}
        selectedCount={batchSelection.selectedCount}
        isLoading={batchActionLoading}
        itemName="user profiles"
        selectedItems={batchSelection.getSelectedData(filteredProfiles, (profile) => profile.id).map((profile) => ({
          id: profile.id,
          name: `${profile.employee_id} - ${profile.role}`
        }))} />

      {/* Create New User Dialog */}
      <CreateUserDialog
        isOpen={isCreateUserDialogOpen}
        onClose={() => setIsCreateUserDialogOpen(false)}
        onUserCreated={() => {
          fetchData(); // Refresh both users and profiles
          toast({
            title: "Success",
            description: "New user account and profile created successfully"
          });
        }} />


    </div>);

};

export default UserManagement;