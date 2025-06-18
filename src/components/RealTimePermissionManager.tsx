import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Users,
  Eye,
  Edit,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  XCircle,
  Settings,
  AlertTriangle,
  Database,
  RefreshCw,
  Package,
  FileText,
  Building2,
  Truck,
  DollarSign,
  UserCheck,
  BarChart3,
  Calendar,
  Bell,
  Map,
  Archive,
  CheckSquare
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

interface PagePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  print: boolean;
  approve?: boolean;
  bulk_operations?: boolean;
  advanced_features?: boolean;
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
  print: false,
  approve: false,
  bulk_operations: false,
  advanced_features: false
};

// Real system pages that actually exist in the project
const systemPages = {
  'Core Dashboard': [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      color: 'text-blue-600',
      route: '/dashboard',
      description: 'Main dashboard with analytics and quick access'
    }
  ],
  'Product Management': [
    {
      key: 'products',
      label: 'Product List',
      icon: Package,
      color: 'text-green-600',
      route: '/products',
      description: 'View and manage product inventory'
    },
    {
      key: 'product_form',
      label: 'Product Form',
      icon: Edit,
      color: 'text-green-500',
      route: '/products/new',
      description: 'Add and edit product records'
    }
  ],
  'Sales & Reports': [
    {
      key: 'sales_reports',
      label: 'Sales Reports',
      icon: FileText,
      color: 'text-orange-600',
      route: '/sales-reports',
      description: 'Daily sales reporting and enhanced print dialogs'
    },
    {
      key: 'sales_report_form',
      label: 'Sales Report Form',
      icon: Calendar,
      color: 'text-orange-500',
      route: '/sales-reports/new',
      description: 'Create daily sales reports'
    }
  ],
  'Human Resources': [
    {
      key: 'employees',
      label: 'Employee List',
      icon: Users,
      color: 'text-purple-600',
      route: '/employees',
      description: 'Employee records management'
    },
    {
      key: 'employee_form',
      label: 'Employee Form',
      icon: UserCheck,
      color: 'text-purple-500',
      route: '/employees/new',
      description: 'Add and edit employee records'
    },
    {
      key: 'salary',
      label: 'Salary Management',
      icon: DollarSign,
      color: 'text-yellow-600',
      route: '/salary',
      description: 'Payroll and salary records'
    },
    {
      key: 'salary_form',
      label: 'Salary Form',
      icon: Calendar,
      color: 'text-yellow-500',
      route: '/salary/new',
      description: 'Create salary records'
    }
  ],
  'Business Operations': [
    {
      key: 'vendors',
      label: 'Vendor List',
      icon: Building2,
      color: 'text-teal-600',
      route: '/vendors',
      description: 'Supplier relationships'
    },
    {
      key: 'vendor_form',
      label: 'Vendor Form',
      icon: Building2,
      color: 'text-teal-500',
      route: '/vendors/new',
      description: 'Add and edit vendors'
    },
    {
      key: 'orders',
      label: 'Order List',
      icon: Truck,
      color: 'text-indigo-600',
      route: '/orders',
      description: 'Purchase orders management'
    },
    {
      key: 'order_form',
      label: 'Order Form',
      icon: Archive,
      color: 'text-indigo-500',
      route: '/orders/new',
      description: 'Create purchase orders'
    }
  ],
  'Delivery & Inventory': [
    {
      key: 'delivery',
      label: 'Delivery List',
      icon: Truck,
      color: 'text-pink-600',
      route: '/delivery',
      description: 'Fuel delivery tracking'
    },
    {
      key: 'delivery_form',
      label: 'Delivery Form',
      icon: Map,
      color: 'text-pink-500',
      route: '/delivery/new',
      description: 'Create delivery records'
    },
    {
      key: 'inventory_alerts',
      label: 'Inventory Alerts',
      icon: Bell,
      color: 'text-red-600',
      route: '/inventory/alerts',
      description: 'Stock level alerts'
    },
    {
      key: 'alert_settings',
      label: 'Alert Settings',
      icon: Settings,
      color: 'text-red-500',
      route: '/inventory/settings',
      description: 'Configure inventory alerts'
    },
    {
      key: 'gas_delivery_inventory',
      label: 'Gas Delivery Inventory',
      icon: Database,
      color: 'text-cyan-600',
      route: '/inventory/gas-delivery',
      description: 'Gas tank monitoring'
    }
  ],
  'Licenses & Compliance': [
    {
      key: 'licenses',
      label: 'License List',
      icon: Shield,
      color: 'text-red-600',
      route: '/licenses',
      description: 'Business licenses and compliance'
    },
    {
      key: 'license_form',
      label: 'License Form',
      icon: CheckSquare,
      color: 'text-red-500',
      route: '/licenses/new',
      description: 'Add and edit licenses'
    }
  ],
  'System Administration': [
    {
      key: 'settings',
      label: 'App Settings',
      icon: Settings,
      color: 'text-gray-600',
      route: '/settings',
      description: 'Application configuration'
    },
    {
      key: 'user_management',
      label: 'User Management',
      icon: UserCheck,
      color: 'text-red-600',
      route: '/admin/users',
      description: 'User accounts and permissions'
    },
    {
      key: 'site_management',
      label: 'Site Management',
      icon: Building2,
      color: 'text-blue-600',
      route: '/admin/sites',
      description: 'Multi-station management'
    },
    {
      key: 'system_logs',
      label: 'System Logs',
      icon: FileText,
      color: 'text-gray-600',
      route: '/admin/logs',
      description: 'System activity logs'
    },
    {
      key: 'security_settings',
      label: 'Security Settings',
      icon: Shield,
      color: 'text-red-600',
      route: '/admin/security',
      description: 'Security policies'
    }
  ]
};

const permissionTypes = [
  { key: 'view', label: 'View', icon: Eye, description: 'Can view and access the page', color: 'text-blue-600' },
  { key: 'create', label: 'Create', icon: Plus, description: 'Can create new records', color: 'text-green-600' },
  { key: 'edit', label: 'Edit', icon: Edit, description: 'Can modify existing records', color: 'text-yellow-600' },
  { key: 'delete', label: 'Delete', icon: Trash2, description: 'Can delete records', color: 'text-red-600' },
  { key: 'export', label: 'Export', icon: FileText, description: 'Can export data', color: 'text-purple-600' },
  { key: 'print', label: 'Print', icon: Settings, description: 'Can print reports', color: 'text-indigo-600' }
];

const roleTemplates = {
  Administrator: {
    description: 'Full system access with all permissions',
    permissions: () => {
      const perms: DetailedPermissions = {};
      Object.values(systemPages).flat().forEach(page => {
        perms[page.key] = { ...defaultPagePermission };
        permissionTypes.forEach(type => {
          perms[page.key][type.key as keyof PagePermission] = true;
        });
      });
      return perms;
    }
  },
  Management: {
    description: 'Full operational access with limited admin features',
    permissions: () => {
      const perms: DetailedPermissions = {};
      Object.values(systemPages).flat().forEach(page => {
        perms[page.key] = { ...defaultPagePermission };
        if (!['user_management', 'system_logs', 'security_settings'].includes(page.key)) {
          permissionTypes.forEach(type => {
            perms[page.key][type.key as keyof PagePermission] = true;
          });
        } else {
          perms[page.key].view = true;
          perms[page.key].export = true;
        }
      });
      return perms;
    }
  },
  Employee: {
    description: 'Basic operational access for daily tasks',
    permissions: () => {
      const perms: DetailedPermissions = {};
      const employeePages = ['dashboard', 'sales_reports', 'sales_report_form', 'delivery', 'delivery_form'];
      Object.values(systemPages).flat().forEach(page => {
        perms[page.key] = { ...defaultPagePermission };
        if (employeePages.includes(page.key)) {
          perms[page.key].view = true;
          perms[page.key].create = true;
          perms[page.key].edit = true;
          perms[page.key].print = true;
        } else if (['products', 'inventory_alerts', 'gas_delivery_inventory'].includes(page.key)) {
          perms[page.key].view = true;
        }
      });
      return perms;
    }
  }
};

const RealTimePermissionManager: React.FC = () => {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<DetailedPermissions>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('Custom');
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
      setLoading(true);
      console.log('Fetching user profiles for permission management...');
      
      const { data, error } = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });

      if (error) {
        console.error('Error fetching user profiles:', error);
        throw error;
      }

      console.log('User profiles fetched:', data?.List?.length || 0);
      setUserProfiles(data?.List || []);
      
      // Auto-select first user if none selected
      if (!selectedUser && data?.List?.length > 0) {
        setSelectedUser(data.List[0]);
      }
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      toast({
        title: "Error",
        description: `Failed to fetch user profiles: ${error}`,
        variant: "destructive"
      });
      setUserProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchUserProfiles();
    setRefreshing(false);
    toast({
      title: "Success",
      description: "User data refreshed successfully"
    });
  };

  const loadUserPermissions = (user: UserProfile) => {
    try {
      if (user.detailed_permissions && user.detailed_permissions.trim() !== '' && user.detailed_permissions !== '{}') {
        const existingPermissions = JSON.parse(user.detailed_permissions);
        setPermissions(existingPermissions);
        setActiveTemplate('Custom');
        console.log('Loaded existing permissions for user:', user.employee_id);
      } else {
        // Apply default role template
        applyRoleTemplate(user.role, false);
        console.log('Applied default role template for user:', user.employee_id, 'Role:', user.role);
      }
    } catch (error) {
      console.error('Error parsing permissions for user:', user.employee_id, error);
      applyRoleTemplate(user.role, false);
    }
  };

  const handleUserSelect = (userId: string) => {
    const user = userProfiles.find(u => u.id.toString() === userId);
    if (user) {
      setSelectedUser(user);
      console.log('Selected user for permission management:', user.employee_id);
    }
  };

  const handlePermissionChange = (pageKey: string, permissionType: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [pageKey]: {
        ...(prev[pageKey] || defaultPagePermission),
        [permissionType]: value
      }
    }));
    setActiveTemplate('Custom');
    console.log('Permission changed:', pageKey, permissionType, value);
  };

  const applyRoleTemplate = (role: string, showToast: boolean = true) => {
    const template = roleTemplates[role as keyof typeof roleTemplates];
    if (template) {
      const newPermissions = template.permissions();
      setPermissions(newPermissions);
      setActiveTemplate(role);
      console.log('Applied role template:', role);
      
      if (showToast) {
        toast({
          title: "Template Applied",
          description: `${role} permission template has been applied`
        });
      }
    } else {
      // Initialize with empty permissions for unknown roles
      const emptyPermissions: DetailedPermissions = {};
      Object.values(systemPages).flat().forEach(page => {
        emptyPermissions[page.key] = { ...defaultPagePermission };
      });
      setPermissions(emptyPermissions);
      setActiveTemplate('Custom');
      
      if (showToast) {
        toast({
          title: "Custom Template",
          description: "Initialize custom permissions for this role"
        });
      }
    }
  };

  const savePermissions = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "No user selected",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      console.log('Saving permissions for user:', selectedUser.employee_id);
      
      const { error } = await window.ezsite.apis.tableUpdate(11725, {
        id: selectedUser.id,
        detailed_permissions: JSON.stringify(permissions)
      });

      if (error) {
        console.error('Error saving permissions:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: `Permissions updated successfully for ${selectedUser.employee_id}`
      });

      // Update local state
      setUserProfiles(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, detailed_permissions: JSON.stringify(permissions) }
          : user
      ));

      console.log('Permissions saved successfully');
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
      const userPermissions = user.detailed_permissions && user.detailed_permissions.trim() !== '' 
        ? JSON.parse(user.detailed_permissions) 
        : {};

      const totalPages = Object.values(systemPages).flat().length;
      const pagesWithAccess = Object.values(systemPages).flat().filter(page => 
        userPermissions[page.key]?.view
      ).length;

      return {
        summary: `${pagesWithAccess}/${totalPages}`,
        hasAccess: pagesWithAccess > 0,
        pagesWithAccess,
        totalPages
      };
    } catch {
      return {
        summary: '0/0',
        hasAccess: false,
        pagesWithAccess: 0,
        totalPages: 0
      };
    }
  };

  const handleBulkPermissionChange = (groupName: string, action: 'grant_all' | 'revoke_all' | 'view_only') => {
    const groupPages = systemPages[groupName as keyof typeof systemPages] || [];
    const newPermissions = { ...permissions };

    groupPages.forEach(page => {
      const newPagePermissions = { ...defaultPagePermission };

      switch (action) {
        case 'grant_all':
          permissionTypes.forEach(type => {
            newPagePermissions[type.key as keyof PagePermission] = true;
          });
          break;
        case 'view_only':
          newPagePermissions.view = true;
          newPagePermissions.export = true;
          break;
        case 'revoke_all':
          // All permissions remain false
          break;
      }

      newPermissions[page.key] = newPagePermissions;
    });

    setPermissions(newPermissions);
    setActiveTemplate('Custom');
    
    toast({
      title: "Bulk Update",
      description: `${action.replace('_', ' ')} applied to ${groupName}`
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-lg">Loading permission management...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Real-Time Permission Management</h2>
            <p className="text-sm text-green-600 font-medium">✓ Live Database Connected - Real User Permissions</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {userProfiles.length} Users
          </Badge>
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Select User & Apply Role Templates</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user-select">Select User</Label>
              <Select onValueChange={handleUserSelect} value={selectedUser?.id.toString() || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user to manage permissions" />
                </SelectTrigger>
                <SelectContent>
                  {userProfiles.map(user => {
                    const summary = getPermissionSummary(user);
                    return (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{user.employee_id} - {user.role}</span>
                          <Badge variant="outline" className="ml-2">
                            {summary.summary}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedUser && (
              <div className="space-y-2">
                <Label>Role Templates</Label>
                <div className="flex space-x-2">
                  {Object.entries(roleTemplates).map(([role, template]) => (
                    <Button
                      key={role}
                      variant={activeTemplate === role ? "default" : "outline"}
                      size="sm"
                      onClick={() => applyRoleTemplate(role)}
                      title={template.description}>
                      {role}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected User Info */}
          {selectedUser && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>{selectedUser.employee_id}</strong> - {selectedUser.role} at {selectedUser.station}
                    <br />
                    <span className="text-sm text-gray-600">Template: {activeTemplate}</span>
                  </div>
                  <div className="text-right">
                    <Badge className={selectedUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Permission Management */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
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
                {Object.entries(systemPages).map(([groupName, pages]) => (
                  <Card key={groupName} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{groupName}</CardTitle>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkPermissionChange(groupName, 'view_only')}
                            className="text-blue-600">
                            <Eye className="w-3 h-3 mr-1" />
                            View Only
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkPermissionChange(groupName, 'grant_all')}
                            className="text-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Full Access
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkPermissionChange(groupName, 'revoke_all')}
                            className="text-red-600">
                            <XCircle className="w-3 h-3 mr-1" />
                            No Access
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pages.map(page => {
                          const pagePermissions = permissions[page.key] || defaultPagePermission;
                          return (
                            <div key={page.key} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <page.icon className={`w-5 h-5 ${page.color}`} />
                                  <div>
                                    <h4 className="font-medium">{page.label}</h4>
                                    <p className="text-xs text-gray-500">{page.description}</p>
                                    {page.route && (
                                      <p className="text-xs text-blue-500">Route: {page.route}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                {permissionTypes.map(type => (
                                  <div key={type.key} className="flex items-center space-x-2 p-2 border rounded">
                                    <Switch
                                      checked={pagePermissions[type.key as keyof PagePermission] || false}
                                      onCheckedChange={(checked) =>
                                        handlePermissionChange(page.key, type.key, checked)
                                      }
                                      id={`${page.key}-${type.key}`}
                                    />
                                    <Label
                                      htmlFor={`${page.key}-${type.key}`}
                                      className="text-xs cursor-pointer flex items-center space-x-1">
                                      <type.icon className={`w-3 h-3 ${type.color}`} />
                                      <span>{type.label}</span>
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="matrix-view">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold bg-white border min-w-48">Page</th>
                        {permissionTypes.map(type => (
                          <th key={type.key} className="text-center p-3 font-semibold min-w-20 bg-white border">
                            <div className="flex flex-col items-center space-y-1">
                              <type.icon className={`w-4 h-4 ${type.color}`} />
                              <span className="text-xs">{type.label}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(systemPages).map(([groupName, pages]) => (
                        <React.Fragment key={groupName}>
                          <tr className="bg-gray-100">
                            <td colSpan={permissionTypes.length + 1} className="p-2 font-semibold text-sm border">
                              {groupName}
                            </td>
                          </tr>
                          {pages.map(page => {
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
                                {permissionTypes.map(type => (
                                  <td key={type.key} className="text-center p-3 border">
                                    <Switch
                                      checked={pagePermissions[type.key as keyof PagePermission] || false}
                                      onCheckedChange={(checked) =>
                                        handlePermissionChange(page.key, type.key, checked)
                                      }
                                    />
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>

            {/* Permission Summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-blue-600" />
                Real-Time Permission Controls & Button Access
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-2">Button Controls:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• <strong>View:</strong> Controls page access and navigation visibility</li>
                    <li>• <strong>Create:</strong> Controls "Add" and "Create New" buttons</li>
                    <li>• <strong>Edit:</strong> Controls "Edit" and modification buttons</li>
                    <li>• <strong>Delete:</strong> Controls delete actions and buttons</li>
                    <li>• <strong>Export:</strong> Controls data export functionality</li>
                    <li>• <strong>Print:</strong> Controls enhanced print dialogs</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">Current Configuration:</p>
                  <Badge variant="outline" className="mb-2">{activeTemplate}</Badge>
                  <p className="text-gray-600 text-xs">
                    {roleTemplates[activeTemplate as keyof typeof roleTemplates]?.description || 'Custom permissions configured'}
                  </p>
                  {selectedUser && (() => {
                    const summary = getPermissionSummary(selectedUser);
                    return (
                      <p className="text-xs text-green-600 mt-2">
                        Access to {summary.pagesWithAccess} out of {summary.totalPages} pages
                      </p>
                    );
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimePermissionManager;