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
      <div className="container mx-auto py-8" data-id="x2c5kxxy4" data-path="src/pages/AdminUserManagement.tsx">
        <Alert variant="destructive" data-id="25bn6dyvu" data-path="src/pages/AdminUserManagement.tsx">
          <AlertTriangle className="h-4 w-4" data-id="nr2wr7dv4" data-path="src/pages/AdminUserManagement.tsx" />
          <AlertDescription data-id="b4qvd3v5o" data-path="src/pages/AdminUserManagement.tsx">
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
    <div className="container mx-auto py-8 space-y-8" data-id="esdd3diqd" data-path="src/pages/AdminUserManagement.tsx">
      {/* Header */}
      <div className="flex justify-between items-center" data-id="0oeywzt36" data-path="src/pages/AdminUserManagement.tsx">
        <div data-id="okmvul5h5" data-path="src/pages/AdminUserManagement.tsx">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-id="gz9no8265" data-path="src/pages/AdminUserManagement.tsx">User Management</h1>
          <p className="text-gray-600" data-id="km91tncdi" data-path="src/pages/AdminUserManagement.tsx">
            Manage users, roles, and permissions for DFS Manager Portal
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} data-id="041coo85b" data-path="src/pages/AdminUserManagement.tsx">
          <DialogTrigger asChild data-id="kv30oo79n" data-path="src/pages/AdminUserManagement.tsx">
            <Button data-id="rhrlfrhx9" data-path="src/pages/AdminUserManagement.tsx">
              <UserPlus className="h-4 w-4 mr-2" data-id="9wx2bxiz2" data-path="src/pages/AdminUserManagement.tsx" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent data-id="s25m0x313" data-path="src/pages/AdminUserManagement.tsx">
            <DialogHeader data-id="bblpkgzzg" data-path="src/pages/AdminUserManagement.tsx">
              <DialogTitle data-id="onnwd8alw" data-path="src/pages/AdminUserManagement.tsx">Create New User</DialogTitle>
              <DialogDescription data-id="srd99me53" data-path="src/pages/AdminUserManagement.tsx">
                Add a new user to the DFS Manager Portal and assign their role.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4" data-id="69q57n9cj" data-path="src/pages/AdminUserManagement.tsx">
              <div className="space-y-2" data-id="b490zt5nr" data-path="src/pages/AdminUserManagement.tsx">
                <Label htmlFor="email" data-id="lqig0jkf9" data-path="src/pages/AdminUserManagement.tsx">Email Address</Label>
                <div className="relative" data-id="9xijpdnka" data-path="src/pages/AdminUserManagement.tsx">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" data-id="7fr1k7q8c" data-path="src/pages/AdminUserManagement.tsx" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="pl-10" data-id="zxql06lgx" data-path="src/pages/AdminUserManagement.tsx" />

                </div>
              </div>

              <div className="space-y-2" data-id="vynmz8jj4" data-path="src/pages/AdminUserManagement.tsx">
                <Label htmlFor="role" data-id="rus8yww76" data-path="src/pages/AdminUserManagement.tsx">Role</Label>
                <Select value={newUserRole} onValueChange={handleRoleChange} data-id="cwjuy3nn7" data-path="src/pages/AdminUserManagement.tsx">
                  <SelectTrigger data-id="1tysc602k" data-path="src/pages/AdminUserManagement.tsx">
                    <SelectValue placeholder="Select a role" data-id="94gxcnj7q" data-path="src/pages/AdminUserManagement.tsx" />
                  </SelectTrigger>
                  <SelectContent data-id="m8jjxwzh4" data-path="src/pages/AdminUserManagement.tsx">
                    <SelectItem value="Employee" data-id="zon6ttc7h" data-path="src/pages/AdminUserManagement.tsx">Employee</SelectItem>
                    <SelectItem value="Management" data-id="xdhlk86pc" data-path="src/pages/AdminUserManagement.tsx">Management</SelectItem>
                    <SelectItem value="Administrator" data-id="dhieqx731" data-path="src/pages/AdminUserManagement.tsx">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2" data-id="jwf72au4d" data-path="src/pages/AdminUserManagement.tsx">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-id="zwhf3fz4j" data-path="src/pages/AdminUserManagement.tsx">
                  Cancel
                </Button>
                <Button onClick={handleCreateUser} disabled={isLoading} data-id="ryts1r2kk" data-path="src/pages/AdminUserManagement.tsx">
                  {isLoading ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Admin Info */}
      <Alert data-id="qgh9kjs7i" data-path="src/pages/AdminUserManagement.tsx">
        <Shield className="h-4 w-4" data-id="259vn992g" data-path="src/pages/AdminUserManagement.tsx" />
        <AlertDescription data-id="p9jfwfvs4" data-path="src/pages/AdminUserManagement.tsx">
          <strong data-id="rod5wr9ap" data-path="src/pages/AdminUserManagement.tsx">Admin Access Granted:</strong> You are logged in as {userProfile?.email} with {userProfile?.role} privileges. 
          You can assign administrative roles to other users through this interface.
        </AlertDescription>
      </Alert>

      {/* Users Table */}
      <Card data-id="oivfw2cbv" data-path="src/pages/AdminUserManagement.tsx">
        <CardHeader data-id="ivxwh3xxm" data-path="src/pages/AdminUserManagement.tsx">
          <CardTitle className="flex items-center" data-id="vpm7w3tai" data-path="src/pages/AdminUserManagement.tsx">
            <Users className="h-5 w-5 mr-2" data-id="zmg4pm6q3" data-path="src/pages/AdminUserManagement.tsx" />
            System Users
          </CardTitle>
          <CardDescription data-id="mgoe63x5j" data-path="src/pages/AdminUserManagement.tsx">
            Manage user accounts and their access levels
          </CardDescription>
        </CardHeader>
        <CardContent data-id="2pcdz9k4w" data-path="src/pages/AdminUserManagement.tsx">
          <Table data-id="xi1ddky9k" data-path="src/pages/AdminUserManagement.tsx">
            <TableHeader data-id="ezz5tfu96" data-path="src/pages/AdminUserManagement.tsx">
              <TableRow data-id="t3b6cap2o" data-path="src/pages/AdminUserManagement.tsx">
                <TableHead data-id="0hkxfgzla" data-path="src/pages/AdminUserManagement.tsx">Email</TableHead>
                <TableHead data-id="o9r22a35f" data-path="src/pages/AdminUserManagement.tsx">Role</TableHead>
                <TableHead data-id="ko2h2o229" data-path="src/pages/AdminUserManagement.tsx">Role Code</TableHead>
                <TableHead data-id="i1ayusxou" data-path="src/pages/AdminUserManagement.tsx">Status</TableHead>
                <TableHead data-id="jgxui4mrq" data-path="src/pages/AdminUserManagement.tsx">Station Access</TableHead>
                <TableHead data-id="wnznjzxtp" data-path="src/pages/AdminUserManagement.tsx">Created</TableHead>
                <TableHead data-id="mtp51szkm" data-path="src/pages/AdminUserManagement.tsx">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody data-id="o3eyauzsj" data-path="src/pages/AdminUserManagement.tsx">
              {users.map((user) =>
              <TableRow key={user.id} data-id="edzlugsdv" data-path="src/pages/AdminUserManagement.tsx">
                  <TableCell className="font-medium" data-id="gpblbdpcx" data-path="src/pages/AdminUserManagement.tsx">{user.email}</TableCell>
                  <TableCell data-id="1ceqkwzar" data-path="src/pages/AdminUserManagement.tsx">
                    <Badge className={getRoleBadgeColor(user.role)} data-id="y5qt2d02o" data-path="src/pages/AdminUserManagement.tsx">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell data-id="69eh32n7g" data-path="src/pages/AdminUserManagement.tsx">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded" data-id="4tewa415f" data-path="src/pages/AdminUserManagement.tsx">
                      {user.role_code}
                    </code>
                  </TableCell>
                  <TableCell data-id="pxdeogtuk" data-path="src/pages/AdminUserManagement.tsx">
                    {user.is_active ?
                  <Badge className="bg-green-100 text-green-800" data-id="5qdu7u5hv" data-path="src/pages/AdminUserManagement.tsx">
                        <Check className="h-3 w-3 mr-1" data-id="0in3ypy6z" data-path="src/pages/AdminUserManagement.tsx" />
                        Active
                      </Badge> :

                  <Badge className="bg-red-100 text-red-800" data-id="7j6h0jywo" data-path="src/pages/AdminUserManagement.tsx">
                        <X className="h-3 w-3 mr-1" data-id="qe7q2druq" data-path="src/pages/AdminUserManagement.tsx" />
                        Inactive
                      </Badge>
                  }
                  </TableCell>
                  <TableCell data-id="fz9gvlrzh" data-path="src/pages/AdminUserManagement.tsx">{user.station}</TableCell>
                  <TableCell data-id="104p68n34" data-path="src/pages/AdminUserManagement.tsx">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell data-id="4l59gs53n" data-path="src/pages/AdminUserManagement.tsx">
                    <Button variant="ghost" size="sm" data-id="51zl0r9l8" data-path="src/pages/AdminUserManagement.tsx">
                      <Edit className="h-4 w-4" data-id="17g1wyh80" data-path="src/pages/AdminUserManagement.tsx" />
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card data-id="9k9cp8yhs" data-path="src/pages/AdminUserManagement.tsx">
        <CardHeader data-id="luys3ktz8" data-path="src/pages/AdminUserManagement.tsx">
          <CardTitle data-id="v4jiqa636" data-path="src/pages/AdminUserManagement.tsx">How to Give Admin Access to Other Employees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" data-id="pok88v845" data-path="src/pages/AdminUserManagement.tsx">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-id="pgoubqjlk" data-path="src/pages/AdminUserManagement.tsx">
            <div className="space-y-2" data-id="t5khjmbuk" data-path="src/pages/AdminUserManagement.tsx">
              <h4 className="font-semibold text-gray-900" data-id="rxpmfat1d" data-path="src/pages/AdminUserManagement.tsx">Step 1: Add New User</h4>
              <p className="text-sm text-gray-600" data-id="0gbva09is" data-path="src/pages/AdminUserManagement.tsx">
                Click the "Add User" button above and enter the employee's email address.
              </p>
            </div>
            <div className="space-y-2" data-id="k8ps8rci0" data-path="src/pages/AdminUserManagement.tsx">
              <h4 className="font-semibold text-gray-900" data-id="ua8zx5el6" data-path="src/pages/AdminUserManagement.tsx">Step 2: Assign Role</h4>
              <p className="text-sm text-gray-600" data-id="u4cvjpyz1" data-path="src/pages/AdminUserManagement.tsx">
                Select "Administrator" role to grant full admin access, or "Management" for limited access.
              </p>
            </div>
            <div className="space-y-2" data-id="93wkcwz5b" data-path="src/pages/AdminUserManagement.tsx">
              <h4 className="font-semibold text-gray-900" data-id="8jf5p63e0" data-path="src/pages/AdminUserManagement.tsx">Step 3: User Login</h4>
              <p className="text-sm text-gray-600" data-id="fea6mh48l" data-path="src/pages/AdminUserManagement.tsx">
                The user can now log in with their email and any password. Admin users will see the Admin Panel.
              </p>
            </div>
            <div className="space-y-2" data-id="j75pnm6vm" data-path="src/pages/AdminUserManagement.tsx">
              <h4 className="font-semibold text-gray-900" data-id="dfr4nu00o" data-path="src/pages/AdminUserManagement.tsx">Step 4: Verify Access</h4>
              <p className="text-sm text-gray-600" data-id="qymv34c2i" data-path="src/pages/AdminUserManagement.tsx">
                Admin users will see an "Admin Panel" option in the navigation menu after logging in.
              </p>
            </div>
          </div>
          
          <Alert data-id="cf4sxjhfs" data-path="src/pages/AdminUserManagement.tsx">
            <AlertTriangle className="h-4 w-4" data-id="l19rtbs2b" data-path="src/pages/AdminUserManagement.tsx" />
            <AlertDescription data-id="36b120usy" data-path="src/pages/AdminUserManagement.tsx">
              <strong data-id="kd5o3c04k" data-path="src/pages/AdminUserManagement.tsx">Demo Mode:</strong> This is a demonstration system. In production, users would need to be properly registered and authenticated through your database system.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>);

};

export default AdminUserManagement;