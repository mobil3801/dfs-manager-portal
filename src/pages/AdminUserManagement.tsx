import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Users,
  UserPlus,
  Settings,
  Shield,
  Check,
  X,
  AlertTriangle,
  Mail,
  Edit } from
'lucide-react';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { useToast } from '@/hooks/use-toast';

const AdminUserManagement = () => {
  const { userProfile, isAdmin, assignRole } = useSimpleAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Employee');
  const [newUserRoleCode, setNewUserRoleCode] = useState('GeneralUser');
  const [isLoading, setIsLoading] = useState(false);

  // Mock users data - in real app this would come from database
  const [users, setUsers] = useState([
  {
    id: '1',
    email: userProfile?.email || 'admin@dfs-portal.com',
    role: 'Administrator',
    role_code: 'Administrator',
    is_active: true,
    created_at: new Date().toISOString(),
    station: 'All Stations'
  }]
  );

  if (!isAdmin()) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access Denied. You need administrator privileges to access user management.
          </AlertDescription>
        </Alert>
      </div>);

  }

  const handleCreateUser = async () => {
    if (!newUserEmail) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Assign role using auth context
      const result = await assignRole(newUserEmail, newUserRole, newUserRoleCode);

      if (result.success) {
        // Add user to local state (in real app this would sync with database)
        const newUser = {
          id: (users.length + 1).toString(),
          email: newUserEmail,
          role: newUserRole,
          role_code: newUserRoleCode,
          is_active: true,
          created_at: new Date().toISOString(),
          station: 'All Stations'
        };

        setUsers([...users, newUser]);
        setNewUserEmail('');
        setNewUserRole('Employee');
        setNewUserRoleCode('GeneralUser');
        setIsDialogOpen(false);

        toast({
          title: "User Created",
          description: `Successfully created user ${newUserEmail} with ${newUserRole} role`
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create user",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (role: string) => {
    setNewUserRole(role);
    setNewUserRoleCode(role === 'Administrator' ? 'Administrator' : 'GeneralUser');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrator':
        return 'bg-red-100 text-red-800';
      case 'Management':
      case 'Manager':
        return 'bg-blue-100 text-blue-800';
      case 'Employee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">
            Manage users, roles, and permissions for DFS Manager Portal
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the DFS Manager Portal and assign their role.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="pl-10" />

                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUserRole} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Admin Info */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Admin Access Granted:</strong> You are logged in as {userProfile?.email} with {userProfile?.role} privileges. 
          You can assign administrative roles to other users through this interface.
        </AlertDescription>
      </Alert>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            System Users
          </CardTitle>
          <CardDescription>
            Manage user accounts and their access levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Role Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Station Access</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) =>
              <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {user.role_code}
                    </code>
                  </TableCell>
                  <TableCell>
                    {user.is_active ?
                  <Badge className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge> :

                  <Badge className="bg-red-100 text-red-800">
                        <X className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                  }
                  </TableCell>
                  <TableCell>{user.station}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Give Admin Access to Other Employees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Step 1: Add New User</h4>
              <p className="text-sm text-gray-600">
                Click the "Add User" button above and enter the employee's email address.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Step 2: Assign Role</h4>
              <p className="text-sm text-gray-600">
                Select "Administrator" role to grant full admin access, or "Management" for limited access.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Step 3: User Login</h4>
              <p className="text-sm text-gray-600">
                The user can now log in with their email and any password. Admin users will see the Admin Panel.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Step 4: Verify Access</h4>
              <p className="text-sm text-gray-600">
                Admin users will see an "Admin Panel" option in the navigation menu after logging in.
              </p>
            </div>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Mode:</strong> This is a demonstration system. In production, users would need to be properly registered and authenticated through your database system.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>);

};

export default AdminUserManagement;