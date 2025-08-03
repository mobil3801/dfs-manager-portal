import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import RoleSelector from '@/components/RoleSelector';
import { UserPlus, Mail, User, Shield, AlertCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role_id: number;
  roles: {
    id: number;
    role_name: string;
    role_code: string;
    description: string;
  };
  created_at: string;
  updated_at: string;
}

const UserRoleManager: React.FC = () => {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role_id: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchUserProfiles();
  }, []);

  const fetchUserProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.
      from('user_profiles').
      select(`
          *,
          roles (
            id,
            role_name,
            role_code,
            description
          )
        `).
      order('created_at', { ascending: false });

      if (error) throw error;
      setUserProfiles(data || []);
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

  const createUser = async () => {
    try {
      if (!newUser.email || !newUser.password || !newUser.full_name || !newUser.role_id) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.full_name
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase.
        from('user_profiles').
        insert([{
          id: authData.user.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role_id: parseInt(newUser.role_id),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

        if (profileError) throw profileError;

        toast({
          title: "Success",
          description: "User created successfully"
        });

        setNewUser({ email: '', password: '', full_name: '', role_id: '' });
        setIsCreateDialogOpen(false);
        await fetchUserProfiles();
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive"
      });
    }
  };

  const updateUserRole = async (userId: string, roleId: string) => {
    try {
      const { error } = await supabase.
      from('user_profiles').
      update({
        role_id: parseInt(roleId),
        updated_at: new Date().toISOString()
      }).
      eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully"
      });

      await fetchUserProfiles();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeColor = (roleCode: string) => {
    switch (roleCode) {
      case 'Administrator':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Employee':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>);

  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Role Management</h2>
          <p className="text-muted-foreground">Manage users and their role assignments</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user with role assignment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com" />

              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••" />

              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="John Doe" />

              </div>
              <RoleSelector
                label="Role"
                value={newUser.role_id}
                onValueChange={(value) => setNewUser({ ...newUser, role_id: value })}
                placeholder="Select a role" />

              <Button onClick={createUser} className="w-full">
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            All Users
          </CardTitle>
          <CardDescription>
            View and manage all user role assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead className="w-[250px]">Change Role</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userProfiles.map((userProfile) =>
                <TableRow key={userProfile.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">
                          {userProfile.full_name || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        {userProfile.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {userProfile.roles ?
                    <Badge className={getRoleBadgeColor(userProfile.roles.role_code)}>
                          {userProfile.roles.role_name}
                        </Badge> :

                    <Badge variant="outline" className="text-amber-600 border-amber-200">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          No Role
                        </Badge>
                    }
                    </TableCell>
                    <TableCell>
                      <RoleSelector
                      value={userProfile.role_id?.toString()}
                      onValueChange={(value) => updateUserRole(userProfile.id, value)}
                      placeholder="Select role"
                      className="w-full" />

                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(userProfile.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {userProfiles.length === 0 &&
          <div className="text-center py-6">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="text-muted-foreground">No users found</div>
            </div>
          }
        </CardContent>
      </Card>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Role Permissions:</strong>
          <br />
          • <strong>Administrator:</strong> Full system access with all permissions
          <br />
          • <strong>Manager:</strong> Management level access with most permissions
          <br />
          • <strong>Employee:</strong> Basic employee access with limited permissions
        </AlertDescription>
      </Alert>
    </div>);

};

export default UserRoleManager;