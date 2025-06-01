import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Users,
  Database,
  FileText,
  Package,
  Truck,
  DollarSign,
  UserCheck,
  Settings,
  BarChart3,
  Building2,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Plus,
  Trash2,
  Save,
  Search,
  Copy,
  RotateCcw,
  AlertTriangle,
  Lock,
  Unlock } from
'lucide-react';

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

interface PagePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  print: boolean;
}

interface DetailedPermissions {
  [key: string]: PagePermission;
}

const defaultPagePermission: PagePermission = {
  view: false,
  create: false,
  edit: false,
  delete: false,
  export: false,
  print: false
};

// Define all pages with their categories and descriptions
const pageGroups = {
  'Core Operations': [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'text-blue-600', description: 'Main overview and analytics dashboard' },
  { key: 'products', label: 'Products Management', icon: Package, color: 'text-green-600', description: 'Manage inventory, pricing, and product information' },
  { key: 'sales_reports', label: 'Sales Reports', icon: FileText, color: 'text-orange-600', description: 'Daily sales reporting and analytics' }],

  'Human Resources': [
  { key: 'employees', label: 'Employee Management', icon: Users, color: 'text-purple-600', description: 'Manage employee records and information' },
  { key: 'salary', label: 'Salary Management', icon: DollarSign, color: 'text-yellow-600', description: 'Payroll processing and salary records' }],

  'Business Operations': [
  { key: 'vendors', label: 'Vendor Management', icon: Building2, color: 'text-teal-600', description: 'Manage supplier relationships and contacts' },
  { key: 'orders', label: 'Order Management', icon: Truck, color: 'text-indigo-600', description: 'Purchase orders and inventory ordering' },
  { key: 'delivery', label: 'Delivery Management', icon: Truck, color: 'text-pink-600', description: 'Fuel delivery tracking and management' }],

  'Compliance & Licensing': [
  { key: 'licenses', label: 'Licenses & Certificates', icon: Shield, color: 'text-red-600', description: 'Business licenses and regulatory compliance' }],

  'Inventory & Operations': [
  { key: 'inventory', label: 'Inventory Management', icon: Database, color: 'text-cyan-600', description: 'Stock levels, alerts, and gas tank monitoring' }],

  'System Administration': [
  { key: 'settings', label: 'App Settings', icon: Settings, color: 'text-gray-600', description: 'Application configuration and preferences' },
  { key: 'user_management', label: 'User Management', icon: UserCheck, color: 'text-red-600', description: 'User accounts and access control' },
  { key: 'site_management', label: 'Site Management', icon: Building2, color: 'text-blue-600', description: 'Multi-station configuration and management' },
  { key: 'system_logs', label: 'System Logs', icon: FileText, color: 'text-gray-600', description: 'System activity and audit trails' },
  { key: 'security_settings', label: 'Security Settings', icon: Shield, color: 'text-red-600', description: 'Security policies and authentication settings' }]

};

const permissionTypes = [
{ key: 'view', label: 'View', icon: Eye, description: 'Can view and access the content', color: 'text-blue-600' },
{ key: 'create', label: 'Create/Add', icon: Plus, description: 'Can create new records using Add buttons', color: 'text-green-600' },
{ key: 'edit', label: 'Edit', icon: Edit, description: 'Can modify existing records using Edit buttons', color: 'text-yellow-600' },
{ key: 'delete', label: 'Delete', icon: Trash2, description: 'Can delete records', color: 'text-red-600' },
{ key: 'export', label: 'Export', icon: FileText, description: 'Can export data to files', color: 'text-purple-600' },
{ key: 'print', label: 'Print', icon: FileText, description: 'Can print reports and documents', color: 'text-indigo-600' }];


const roleTemplates = {
  Administrator: 'Full access to all pages and actions including system administration',
  Management: 'Access to operational pages with limited system administration',
  Employee: 'Basic access to daily operational pages and reports',
  'Station Manager': 'Full access to station operations with limited system access',
  Cashier: 'Access to sales reporting and basic inventory viewing',
  'Custom': 'Manually configure specific permissions per page'
};

const EnhancedUserPermissionManager: React.FC = () => {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<DetailedPermissions>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [activeTemplate, setActiveTemplate] = useState<string>('Custom');
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfiles();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadUserPermissions(selectedUser);
    }
  }, [selectedUser]);

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
      setUserProfiles(data?.List || []);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      toast({
        title: "Error",
        description: `Failed to fetch user profiles: ${error}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = (user: UserProfile) => {
    try {
      if (user.detailed_permissions) {
        const existingPermissions = JSON.parse(user.detailed_permissions);
        setPermissions(existingPermissions);
        setActiveTemplate('Custom');
      } else {
        // Initialize with default permissions based on role
        applyRoleTemplate(user.role, false);
      }
    } catch (error) {
      console.error('Error parsing permissions:', error);
      applyRoleTemplate(user.role, false);
    }
  };

  const handleUserSelect = (userId: string) => {
    const user = userProfiles.find((u) => u.id.toString() === userId);
    if (user) {
      setSelectedUser(user);
    }
  };

  const handlePermissionChange = (pageKey: string, permissionType: string, value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [pageKey]: {
        ...(prev[pageKey] || defaultPagePermission),
        [permissionType]: value
      }
    }));
    setActiveTemplate('Custom');
  };

  const handleBulkPermissionChange = (pageKey: string, action: 'grant_all' | 'revoke_all' | 'view_only') => {
    const newPagePermissions = { ...defaultPagePermission };

    switch (action) {
      case 'grant_all':
        permissionTypes.forEach((type) => {
          newPagePermissions[type.key as keyof PagePermission] = true;
        });
        break;
      case 'view_only':
        newPagePermissions.view = true;
        break;
      case 'revoke_all':
        // All permissions remain false
        break;
    }

    setPermissions((prev) => ({
      ...prev,
      [pageKey]: newPagePermissions
    }));
    setActiveTemplate('Custom');
  };

  const handleGroupPermissionChange = (groupName: string, action: 'grant_all' | 'revoke_all' | 'view_only') => {
    const groupPages = pageGroups[groupName as keyof typeof pageGroups] || [];
    const newPermissions = { ...permissions };

    groupPages.forEach((page) => {
      const newPagePermissions = { ...defaultPagePermission };

      switch (action) {
        case 'grant_all':
          permissionTypes.forEach((type) => {
            newPagePermissions[type.key as keyof PagePermission] = true;
          });
          break;
        case 'view_only':
          newPagePermissions.view = true;
          break;
        case 'revoke_all':
          // All permissions remain false
          break;
      }

      newPermissions[page.key] = newPagePermissions;
    });

    setPermissions(newPermissions);
    setActiveTemplate('Custom');
  };

  const applyRoleTemplate = (role: string, showToast: boolean = true) => {
    let newPermissions: DetailedPermissions = {};

    // Initialize all pages with default permissions
    Object.values(pageGroups).flat().forEach((page) => {
      newPermissions[page.key] = { ...defaultPagePermission };
    });

    switch (role) {
      case 'Administrator':
        // Full access to everything
        Object.keys(newPermissions).forEach((pageKey) => {
          permissionTypes.forEach((type) => {
            newPermissions[pageKey][type.key as keyof PagePermission] = true;
          });
        });
        break;

      case 'Management':
        // Full access to operations, limited admin access
        const managementPages = ['dashboard', 'products', 'employees', 'sales_reports', 'vendors', 'orders', 'delivery', 'licenses', 'inventory', 'salary'];
        managementPages.forEach((pageKey) => {
          if (newPermissions[pageKey]) {
            permissionTypes.forEach((type) => {
              newPermissions[pageKey][type.key as keyof PagePermission] = true;
            });
          }
        });
        // Limited admin access
        const limitedAdminPages = ['settings', 'user_management'];
        limitedAdminPages.forEach((pageKey) => {
          if (newPermissions[pageKey]) {
            newPermissions[pageKey].view = true;
            newPermissions[pageKey].edit = true;
          }
        });
        break;

      case 'Station Manager':
        // Full operational access for station management
        const stationManagerPages = ['dashboard', 'products', 'sales_reports', 'delivery', 'inventory'];
        stationManagerPages.forEach((pageKey) => {
          if (newPermissions[pageKey]) {
            permissionTypes.forEach((type) => {
              newPermissions[pageKey][type.key as keyof PagePermission] = true;
            });
          }
        });
        // View access to other operational areas
        const viewOnlyPages = ['employees', 'vendors', 'orders', 'licenses', 'salary'];
        viewOnlyPages.forEach((pageKey) => {
          if (newPermissions[pageKey]) {
            newPermissions[pageKey].view = true;
            newPermissions[pageKey].export = true;
            newPermissions[pageKey].print = true;
          }
        });
        break;

      case 'Employee':
        // Basic operational access
        const employeePages = ['dashboard', 'sales_reports', 'delivery'];
        employeePages.forEach((pageKey) => {
          if (newPermissions[pageKey]) {
            newPermissions[pageKey].view = true;
            newPermissions[pageKey].create = true;
            newPermissions[pageKey].edit = true;
          }
        });
        // View-only access to products and inventory
        const employeeViewPages = ['products', 'inventory'];
        employeeViewPages.forEach((pageKey) => {
          if (newPermissions[pageKey]) {
            newPermissions[pageKey].view = true;
          }
        });
        break;

      case 'Cashier':
        // Sales and basic inventory access
        newPermissions['dashboard'].view = true;
        newPermissions['sales_reports'].view = true;
        newPermissions['sales_reports'].create = true;
        newPermissions['sales_reports'].edit = true;
        newPermissions['sales_reports'].print = true;
        newPermissions['products'].view = true;
        newPermissions['inventory'].view = true;
        break;

      default:
        // Custom or unknown role - minimal access
        newPermissions['dashboard'].view = true;
        break;
    }

    setPermissions(newPermissions);
    setActiveTemplate(role);

    if (showToast) {
      toast({
        title: "Template Applied",
        description: `${role} permission template has been applied`
      });
    }
  };

  const copyPermissionsFromUser = async (sourceUserId: number) => {
    const sourceUser = userProfiles.find((u) => u.id === sourceUserId);
    if (sourceUser && sourceUser.detailed_permissions) {
      try {
        const sourcePermissions = JSON.parse(sourceUser.detailed_permissions);
        setPermissions(sourcePermissions);
        setActiveTemplate('Custom');
        toast({
          title: "Permissions Copied",
          description: `Permissions copied from ${sourceUser.employee_id}`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy permissions",
          variant: "destructive"
        });
      }
    }
  };

  const resetPermissions = () => {
    const resetPerms: DetailedPermissions = {};
    Object.values(pageGroups).flat().forEach((page) => {
      resetPerms[page.key] = { ...defaultPagePermission };
    });
    setPermissions(resetPerms);
    setActiveTemplate('Custom');
    toast({
      title: "Permissions Reset",
      description: "All permissions have been reset to default (no access)"
    });
  };

  const savePermissions = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const { error } = await window.ezsite.apis.tableUpdate(11725, {
        id: selectedUser.id,
        detailed_permissions: JSON.stringify(permissions)
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User permissions updated successfully"
      });

      // Update local state
      setUserProfiles((prev) => prev.map((user) =>
      user.id === selectedUser.id ?
      { ...user, detailed_permissions: JSON.stringify(permissions) } :
      user
      ));
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        title: "Error",
        description: `Failed to save permissions: ${error}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getPermissionSummary = (user: UserProfile) => {
    try {
      const userPermissions = user.detailed_permissions ?
      JSON.parse(user.detailed_permissions) :
      {};

      const totalPages = Object.values(pageGroups).flat().length;
      const pagesWithAccess = Object.values(pageGroups).flat().filter((page) =>
      userPermissions[page.key]?.view
      ).length;

      return `${pagesWithAccess}/${totalPages} pages`;
    } catch {
      return '0 pages';
    }
  };

  const filteredUsers = userProfiles.filter((user) => {
    const matchesSearch =
    user.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading permission management...</div>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enhanced User Permission Management</h1>
            <p className="text-gray-600">Assign detailed page-based permissions with Add/Edit button controls</p>
          </div>
        </div>
      </div>

      {/* User Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Select User & Apply Templates</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
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
                <SelectItem value="Administrator">Administrator</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
                <SelectItem value="Employee">Employee</SelectItem>
                <SelectItem value="Station Manager">Station Manager</SelectItem>
                <SelectItem value="Cashier">Cashier</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={handleUserSelect} value={selectedUser?.id.toString() || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user to manage permissions" />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers.map((user) =>
                <SelectItem key={user.id} value={user.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{user.employee_id} - {user.role}</span>
                      <Badge variant="outline" className="ml-2">
                        {getPermissionSummary(user)}
                      </Badge>
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected User Info */}
          {selectedUser &&
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.employee_id}</h3>
                  <p className="text-sm text-gray-600">
                    Role: {selectedUser.role} | Station: {selectedUser.station}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    User ID: {selectedUser.user_id} | Phone: {selectedUser.phone}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <Badge className={selectedUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="text-xs text-gray-500">
                    Current: {activeTemplate}
                  </div>
                </div>
              </div>
            </div>
          }

          {/* Role Templates */}
          {selectedUser &&
          <div className="space-y-3">
              <Label className="text-sm font-medium">Quick Permission Templates</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {Object.entries(roleTemplates).map(([role, description]) =>
              <Button
                key={role}
                variant={activeTemplate === role ? "default" : "outline"}
                size="sm"
                onClick={() => applyRoleTemplate(role)}
                className="text-xs h-auto py-2 px-3 flex flex-col items-center space-y-1"
                title={description}>

                    <span className="font-medium">{role}</span>
                  </Button>
              )}
              </div>
              
              {/* Advanced Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Select onValueChange={(value) => copyPermissionsFromUser(parseInt(value))}>
                  <SelectTrigger className="w-auto">
                    <Copy className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Copy from user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {userProfiles.filter((u) => u.id !== selectedUser.id).map((user) =>
                  <SelectItem key={user.id} value={user.id.toString()}>
                        {user.employee_id} ({user.role})
                      </SelectItem>
                  )}
                  </SelectContent>
                </Select>
                
                <Button
                variant="outline"
                size="sm"
                onClick={resetPermissions}
                className="text-red-600 hover:text-red-700">

                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All
                </Button>
              </div>
            </div>
          }
        </CardContent>
      </Card>

      {/* Permission Management */}
      {selectedUser &&
      <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Page-Based Permissions for {selectedUser.employee_id}</span>
              </CardTitle>
              <Button
              onClick={savePermissions}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700">

                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Permissions'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="by-groups" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="by-groups">By Page Groups</TabsTrigger>
                <TabsTrigger value="matrix-view">Matrix View</TabsTrigger>
              </TabsList>

              <TabsContent value="by-groups" className="space-y-6">
                {Object.entries(pageGroups).map(([groupName, pages]) =>
              <Card key={groupName} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{groupName}</CardTitle>
                        <div className="flex space-x-2">
                          <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGroupPermissionChange(groupName, 'view_only')}
                        className="text-blue-600">

                            <Eye className="w-3 h-3 mr-1" />
                            View Only
                          </Button>
                          <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGroupPermissionChange(groupName, 'grant_all')}
                        className="text-green-600">

                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Full Access
                          </Button>
                          <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGroupPermissionChange(groupName, 'revoke_all')}
                        className="text-red-600">

                            <XCircle className="w-3 h-3 mr-1" />
                            No Access
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pages.map((page) => {
                      const pagePermissions = permissions[page.key] || defaultPagePermission;
                      return (
                        <div key={page.key} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <page.icon className={`w-5 h-5 ${page.color}`} />
                                  <div>
                                    <h4 className="font-medium">{page.label}</h4>
                                    <p className="text-xs text-gray-500">{page.description}</p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBulkPermissionChange(page.key, 'view_only')}
                                className="text-blue-600 text-xs px-2 py-1">

                                    View Only
                                  </Button>
                                  <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBulkPermissionChange(page.key, 'grant_all')}
                                className="text-green-600 text-xs px-2 py-1">

                                    <CheckCircle2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBulkPermissionChange(page.key, 'revoke_all')}
                                className="text-red-600 text-xs px-2 py-1">

                                    <XCircle className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                {permissionTypes.map((type) =>
                            <div key={type.key} className="flex items-center space-x-2 p-2 border rounded">
                                    <Switch
                                checked={pagePermissions[type.key as keyof PagePermission]}
                                onCheckedChange={(checked) =>
                                handlePermissionChange(page.key, type.key, checked)
                                }
                                id={`${page.key}-${type.key}`} />

                                    <Label
                                htmlFor={`${page.key}-${type.key}`}
                                className="text-xs cursor-pointer flex items-center space-x-1">

                                      <type.icon className={`w-3 h-3 ${type.color}`} />
                                      <span>{type.label}</span>
                                    </Label>
                                  </div>
                            )}
                              </div>
                            </div>);

                    })}
                      </div>
                    </CardContent>
                  </Card>
              )}
              </TabsContent>

              <TabsContent value="matrix-view">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold bg-white border">Page</th>
                        {permissionTypes.map((type) =>
                      <th key={type.key} className="text-center p-3 font-semibold min-w-20 bg-white border">
                            <div className="flex flex-col items-center space-y-1">
                              <type.icon className={`w-4 h-4 ${type.color}`} />
                              <span className="text-xs">{type.label}</span>
                            </div>
                          </th>
                      )}
                        <th className="text-center p-3 font-semibold bg-white border">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(pageGroups).map(([groupName, pages]) =>
                    <React.Fragment key={groupName}>
                          <tr className="bg-gray-100">
                            <td colSpan={permissionTypes.length + 2} className="p-2 font-semibold text-sm border">
                              {groupName}
                            </td>
                          </tr>
                          {pages.map((page) => {
                        const pagePermissions = permissions[page.key] || defaultPagePermission;
                        return (
                          <tr key={page.key} className="border-b hover:bg-gray-50">
                                <td className="p-3 border">
                                  <div className="flex items-center space-x-3">
                                    <page.icon className={`w-4 h-4 ${page.color}`} />
                                    <div>
                                      <span className="font-medium text-sm">{page.label}</span>
                                      <p className="text-xs text-gray-500">{page.description}</p>
                                    </div>
                                  </div>
                                </td>
                                {permissionTypes.map((type) =>
                            <td key={type.key} className="text-center p-3 border">
                                    <Switch
                                checked={pagePermissions[type.key as keyof PagePermission]}
                                onCheckedChange={(checked) =>
                                handlePermissionChange(page.key, type.key, checked)
                                } />

                                  </td>
                            )}
                                <td className="text-center p-3 border">
                                  <div className="flex space-x-1 justify-center">
                                    <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBulkPermissionChange(page.key, 'grant_all')}
                                  className="text-green-600 hover:text-green-700"
                                  title="Grant all permissions">

                                      <CheckCircle2 className="w-3 h-3" />
                                    </Button>
                                    <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBulkPermissionChange(page.key, 'revoke_all')}
                                  className="text-red-600 hover:text-red-700"
                                  title="Revoke all permissions">

                                      <XCircle className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>);

                      })}
                        </React.Fragment>
                    )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>

            {/* Permission Summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-blue-600" />
                Permission Summary & Guidelines
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-2">Add/Edit Button Controls:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• <strong>Create/Add:</strong> Controls access to "Add" buttons throughout the system</li>
                    <li>• <strong>Edit:</strong> Controls access to "Edit" buttons and modification features</li>
                    <li>• <strong>Delete:</strong> Controls access to delete actions and buttons</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">Current Template:</p>
                  <Badge variant="outline" className="mb-2">{activeTemplate}</Badge>
                  <p className="text-gray-600 text-xs">
                    {roleTemplates[activeTemplate as keyof typeof roleTemplates] || 'Custom permissions configured'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      }
    </div>);

};

export default EnhancedUserPermissionManager;