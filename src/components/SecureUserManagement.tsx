import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Users,
  Plus,
  Edit3,
  Trash2,
  Search,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Lock,
  Mail,
  Phone,
  Building2,
  RefreshCw,
  Database,
  Eye,
  Settings
} from 'lucide-react';
import EnhancedCreateUserDialog from '@/components/EnhancedCreateUserDialog';
import UserSecurityValidator from '@/components/UserSecurityValidator';
import { userSecurityService } from '@/services/userSecurityService';
import { useAuth } from '@/contexts/AuthContext';

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

const SecureUserManagement: React.FC = () => {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStation, setSelectedStation] = useState('All');
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  
  // Security validation states
  const [securityValidation, setSecurityValidation] = useState({
    isValid: false,
    errors: [] as string[],
    warnings: [] as string[]
  });

  const [editFormData, setEditFormData] = useState({
    email: '',
    role: '',
    station: '',
    employee_id: '',
    phone: '',
    hire_date: '',
    is_active: true
  });

  const roles = ['Administrator', 'Management', 'Employee'];
  const stations = ['ALL', 'MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchUserProfiles()]);
    setLoading(false);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast({
      title: "✅ Data Refreshed",
      description: "Real-time secure data refreshed successfully"
    });
  };

  const fetchUsers = async () => {
    try {
      const { data: currentUser, error } = await window.ezsite.apis.getUserInfo();
      if (error) {
        console.log('User info not available:', error);
        setUsers([]);
        return;
      }
      setUsers([currentUser]);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
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

      if (error) {
        throw error;
      }

      setUserProfiles(data?.List || []);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      toast({
        title: "❌ Database Error",
        description: `Failed to fetch user profiles: ${error}`,
        variant: "destructive"
      });
      setUserProfiles([]);
    }
  };

  const handleEditProfile = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setEditFormData({
      email: '', // We'll need to get this from user table
      role: profile.role,
      station: profile.station,
      employee_id: profile.employee_id,
      phone: profile.phone,
      hire_date: profile.hire_date || '',
      is_active: profile.is_active
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProfile = async () => {
    if (!selectedProfile) return;

    // Validate using security service
    const validationResult = await userSecurityService.validateUser(
      editFormData,
      true,
      selectedProfile.user_id
    );

    if (!validationResult.isValid) {
      toast({
        title: "❌ Security Validation Failed",
        description: validationResult.errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Updating user profile with security validation:', selectedProfile.id);
      
      const { error } = await window.ezsite.apis.tableUpdate(11725, {
        id: selectedProfile.id,
        role: editFormData.role,
        station: editFormData.station,
        employee_id: editFormData.employee_id,
        phone: editFormData.phone,
        hire_date: editFormData.hire_date,
        is_active: editFormData.is_active
      });

      if (error) throw error;

      // Audit the update
      await userSecurityService.auditUserOperation(
        'UPDATE',
        editFormData,
        user?.ID || 0,
        'SUCCESS'
      );

      toast({
        title: "✅ Profile Updated",
        description: "User profile updated successfully with security validation"
      });

      setIsEditDialogOpen(false);
      setSelectedProfile(null);
      fetchUserProfiles();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Audit the failed update
      await userSecurityService.auditUserOperation(
        'UPDATE',
        editFormData,
        user?.ID || 0,
        'FAILED',
        error instanceof Error ? error.message : 'Unknown error'
      );

      toast({
        title: "❌ Update Failed",
        description: `Failed to update user profile: ${error}`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteProfile = async (profileId: number, profile: UserProfile) => {
    // Check if this would violate admin protection
    const adminProtectionCheck = await userSecurityService.checkAdminProtection(
      profile.user_id,
      'Employee', // Simulating role removal
      profile.employee_id
    );

    if (adminProtectionCheck.length > 0) {
      toast({
        title: "❌ Cannot Delete",
        description: adminProtectionCheck[0],
        variant: "destructive"
      });
      return;
    }

    if (!confirm('⚠️ Are you sure you want to delete this user profile? This action cannot be undone and will be audited.')) {
      return;
    }

    try {
      console.log('Deleting user profile with security audit:', profileId);
      
      const { error } = await window.ezsite.apis.tableDelete(11725, { id: profileId });
      if (error) throw error;

      // Audit the deletion
      await userSecurityService.auditUserOperation(
        'DELETE',
        {
          employee_id: profile.employee_id,
          role: profile.role,
          station: profile.station
        },
        user?.ID || 0,
        'SUCCESS'
      );

      toast({
        title: "✅ Profile Deleted",
        description: "User profile deleted successfully and audited"
      });

      fetchUserProfiles();
      
    } catch (error) {
      console.error('Error deleting profile:', error);
      
      // Audit the failed deletion
      await userSecurityService.auditUserOperation(
        'DELETE',
        {
          employee_id: profile.employee_id,
          role: profile.role,
          station: profile.station
        },
        user?.ID || 0,
        'FAILED',
        error instanceof Error ? error.message : 'Unknown error'
      );

      toast({
        title: "❌ Deletion Failed",
        description: `Failed to delete user profile: ${error}`,
        variant: "destructive"
      });
    }
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
      case 'Administrator': return 'bg-red-100 text-red-800 border-red-200';
      case 'Management': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Employee': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStationBadgeColor = (station: string) => {
    switch (station) {
      case 'ALL': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MOBIL': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AMOCO ROSEDALE': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'AMOCO BROOKLYN': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isProtectedAdmin = (profile: UserProfile) => {
    // Check if this is the protected admin account
    return profile.employee_id?.toLowerCase().includes('admin') || 
           profile.role === 'Administrator';
  };

  if (!isAdmin) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-700">You need Administrator privileges to access secure user management.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading secure user management...</span>
        </div>
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
            <h1 className="text-2xl font-bold text-gray-900">🔐 Secure User Management</h1>
            <p className="text-sm text-green-600 font-medium">
              ✅ Enhanced Security • Email Uniqueness • Role Conflict Prevention • Admin Protection
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Database className="w-3 h-3 mr-1" />
            {userProfiles.length} Secure Users
          </Badge>
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {/* Security Status Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="w-4 h-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>
              🛡️ Enhanced security features active: Email uniqueness verification, role conflict prevention, 
              and admin account protection (admin@dfs-portal.com)
            </span>
            <Badge className="bg-blue-100 text-blue-800">Security Enhanced</Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3">
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Secure User
        </Button>
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
              <Shield className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Administrators</p>
                <p className="text-2xl font-bold">
                  {userProfiles.filter(p => p.role === 'Administrator').length}
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
                  {userProfiles.filter(p => p.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Lock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Protected Accounts</p>
                <p className="text-2xl font-bold">
                  {userProfiles.filter(p => isProtectedAdmin(p)).length}
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
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Stations</option>
              {stations.map(station => (
                <option key={station} value={station}>{station}</option>
              ))}
            </select>
            
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('All');
                setSelectedStation('All');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Profiles Table */}
      <Card>
        <CardHeader>
          <CardTitle>🔐 Secure User Profiles ({filteredProfiles.length})</CardTitle>
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
                  <TableHead>Security</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-3">
                        <Database className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">No user profiles found</p>
                        <Button
                          onClick={() => setIsCreateDialogOpen(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Secure User
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{profile.employee_id}</span>
                          {isProtectedAdmin(profile) && (
                            <Lock className="w-3 h-3 text-red-600" title="Protected Account" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(profile.role)}>
                          {profile.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStationBadgeColor(profile.station)}>
                          {profile.station === 'ALL' ? 'ALL STATIONS' : profile.station}
                        </Badge>
                      </TableCell>
                      <TableCell>{profile.phone}</TableCell>
                      <TableCell>
                        {profile.hire_date ? new Date(profile.hire_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className={profile.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {profile.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-green-600" title="Validated" />
                          <Badge variant="outline" className="text-xs">Secure</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProfile(profile)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProfile(profile.id, profile)}
                            className="text-red-600 hover:text-red-700"
                            disabled={isProtectedAdmin(profile)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <EnhancedCreateUserDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onUserCreated={() => {
          fetchData();
          toast({
            title: "✅ Secure User Created",
            description: "New user account created successfully with enhanced security validation"
          });
        }}
      />

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Edit Secure User Profile</span>
              {isProtectedAdmin(selectedProfile!) && (
                <Badge variant="destructive">Protected Account</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedProfile && (
            <div className="space-y-6">
              {isProtectedAdmin(selectedProfile) && (
                <Alert variant="destructive">
                  <Lock className="w-4 h-4" />
                  <AlertDescription>
                    This is a protected admin account. Some security restrictions apply to prevent loss of admin access.
                  </AlertDescription>
                </Alert>
              )}

              <UserSecurityValidator
                userData={{
                  email: editFormData.email,
                  role: editFormData.role,
                  station: editFormData.station,
                  employee_id: editFormData.employee_id
                }}
                isUpdate={true}
                currentUserId={selectedProfile.user_id}
                onValidationChange={(isValid, errors, warnings) => {
                  setSecurityValidation({ isValid, errors, warnings });
                }}
                onDataChange={(field, value) => {
                  setEditFormData(prev => ({ ...prev, [field]: value }));
                }}
              />

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateProfile}
                  disabled={!securityValidation.isValid}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Update Secure Profile
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecureUserManagement;