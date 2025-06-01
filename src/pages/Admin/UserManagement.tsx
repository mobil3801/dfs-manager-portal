import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Search,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Phone,
  Calendar,
  Building2 } from
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
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStation, setSelectedStation] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    fetchUsers();
    fetchUserProfiles();
  }, []);

  const fetchUsers = async () => {
    try {
      // Get user info to see if current user has admin access
      const { data: currentUser, error: userError } = await window.ezsite.apis.getUserInfo();
      if (userError) throw userError;

      // This would typically fetch all users - for now we'll show current user
      setUsers([currentUser]);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    }
  };

  const fetchUserProfiles = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;
      setUserProfiles(data.List || []);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user profiles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    try {
      const { error } = await window.ezsite.apis.tableCreate(11725, formData);
      if (error) throw error;

      toast({
        title: "Success",
        description: "User profile created successfully"
      });

      setIsAddDialogOpen(false);
      setFormData({
        user_id: 0,
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
        description: "Failed to create user profile",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!selectedUserProfile) return;

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
        description: "Failed to update user profile",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProfile = async (profileId: number) => {
    if (!confirm('Are you sure you want to delete this user profile?')) return;

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
        description: "Failed to delete user profile",
        variant: "destructive"
      });
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
      hire_date: profile.hire_date,
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
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add User Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create User Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user_id">User ID</Label>
                <Input
                  id="user_id"
                  type="number"
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: parseInt(e.target.value) || 0 })}
                  placeholder="Enter user ID" />

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
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  placeholder="Enter employee ID" />

              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number" />

              </div>
              <div>
                <Label htmlFor="hire_date">Hire Date</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })} />

              </div>
              <Button onClick={handleCreateProfile} className="w-full">
                Create Profile
              </Button>
            </div>
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
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) =>
                <TableRow key={profile.id}>
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
                    <TableCell>{new Date(profile.hire_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={profile.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {profile.is_active ? 'Active' : 'Inactive'}
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
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
          </DialogHeader>
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
              <Label htmlFor="edit_employee_id">Employee ID</Label>
              <Input
                id="edit_employee_id"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })} />

            </div>
            <div>
              <Label htmlFor="edit_phone">Phone</Label>
              <Input
                id="edit_phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

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
          </div>
        </DialogContent>
      </Dialog>
    </div>);

};

export default UserManagement;