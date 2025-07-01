import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Shield,
  Save,
  Eye,
  Edit3,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  Lock,
  Unlock } from
'lucide-react';

interface ComprehensivePermissionDialogProps {
  selectedUserId?: number;
  trigger?: React.ReactNode;
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

const CONTENT_AREAS = [
{ name: 'dashboard', displayName: 'Dashboard', description: 'Main dashboard access and overview' },
{ name: 'products', displayName: 'Products', description: 'Product inventory and management' },
{ name: 'employees', displayName: 'Employees', description: 'Employee information and records' },
{ name: 'sales_reports', displayName: 'Sales Reports', description: 'Sales data and reporting' },
{ name: 'vendors', displayName: 'Vendors', description: 'Vendor management and contracts' },
{ name: 'orders', displayName: 'Orders', description: 'Order processing and tracking' },
{ name: 'licenses', displayName: 'Licenses', description: 'License management and renewals' },
{ name: 'salary', displayName: 'Salary', description: 'Payroll and salary management' },
{ name: 'inventory', displayName: 'Inventory', description: 'Stock management and alerts' },
{ name: 'delivery', displayName: 'Delivery', description: 'Delivery tracking and logistics' },
{ name: 'settings', displayName: 'Settings', description: 'Application settings and configuration' },
{ name: 'user_management', displayName: 'User Management', description: 'User accounts and permissions' },
{ name: 'site_management', displayName: 'Site Management', description: 'Site administration and setup' },
{ name: 'system_logs', displayName: 'System Logs', description: 'System monitoring and audit logs' },
{ name: 'security_settings', displayName: 'Security Settings', description: 'Security policies and access control' }];


const PERMISSION_TEMPLATES = {
  'Administrator': {
    name: 'Full Administrator',
    description: 'Complete access to all areas with full permissions',
    permissions: Object.fromEntries(
      CONTENT_AREAS.map((area) => [area.name, { view: true, edit: true, create: true, delete: true }])
    )
  },
  'Management': {
    name: 'Management',
    description: 'Management level access with most permissions except system administration',
    permissions: Object.fromEntries(
      CONTENT_AREAS.map((area) => [
      area.name,
      {
        view: true,
        edit: !['user_management', 'system_logs', 'security_settings'].includes(area.name),
        create: !['user_management', 'system_logs', 'security_settings'].includes(area.name),
        delete: !['user_management', 'system_logs', 'security_settings', 'employees'].includes(area.name)
      }]
      )
    )
  },
  'Employee': {
    name: 'Standard Employee',
    description: 'Basic employee access with limited edit permissions',
    permissions: Object.fromEntries(
      CONTENT_AREAS.map((area) => [
      area.name,
      {
        view: !['user_management', 'system_logs', 'security_settings', 'salary'].includes(area.name),
        edit: ['products', 'sales_reports', 'inventory', 'delivery'].includes(area.name),
        create: ['sales_reports', 'delivery'].includes(area.name),
        delete: false
      }]
      )
    )
  },
  'Read Only': {
    name: 'Read Only Access',
    description: 'View-only access to basic areas',
    permissions: Object.fromEntries(
      CONTENT_AREAS.map((area) => [
      area.name,
      {
        view: ['dashboard', 'products', 'sales_reports', 'inventory'].includes(area.name),
        edit: false,
        create: false,
        delete: false
      }]
      )
    )
  }
};

const ComprehensivePermissionDialog: React.FC<ComprehensivePermissionDialogProps> = ({
  selectedUserId,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<Record<string, any>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && selectedUserId) {
      fetchUserData();
    }
  }, [isOpen, selectedUserId]);

  const fetchUserData = async () => {
    if (!selectedUserId) return;

    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage(11725, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'id',
        IsAsc: true,
        Filters: [{ name: 'id', op: 'Equal', value: selectedUserId }]
      });

      if (error) throw error;

      const userData = data?.List?.[0];
      if (userData) {
        setUser(userData);
        const userPermissions = parsePermissions(userData.detailed_permissions);
        setPermissions(userPermissions);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load user data: ${error}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const parsePermissions = (permissionString: string) => {
    try {
      return JSON.parse(permissionString || '{}');
    } catch {
      return {};
    }
  };

  const handlePermissionChange = (area: string, permission: string, value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [area]: {
        ...prev[area],
        [permission]: value
      }
    }));
  };

  const applyTemplate = (templateKey: string) => {
    const template = PERMISSION_TEMPLATES[templateKey as keyof typeof PERMISSION_TEMPLATES];
    if (template) {
      setPermissions(template.permissions);
      setSelectedTemplate(templateKey);
      toast({
        title: "Template Applied",
        description: `${template.name} permissions have been applied`
      });
    }
  };

  const handleSavePermissions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await window.ezsite.apis.tableUpdate(11725, {
        id: user.id,
        detailed_permissions: JSON.stringify(permissions)
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comprehensive permissions updated successfully"
      });

      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update permissions: ${error}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPermissionSummary = () => {
    const totalAreas = CONTENT_AREAS.length;
    const areasWithView = CONTENT_AREAS.filter((area) => permissions[area.name]?.view).length;
    const areasWithEdit = CONTENT_AREAS.filter((area) => permissions[area.name]?.edit).length;
    const areasWithCreate = CONTENT_AREAS.filter((area) => permissions[area.name]?.create).length;
    const areasWithDelete = CONTENT_AREAS.filter((area) => permissions[area.name]?.delete).length;

    return { totalAreas, areasWithView, areasWithEdit, areasWithCreate, areasWithDelete };
  };

  const summary = getPermissionSummary();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger &&
      <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      }
      
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Comprehensive Permission Management</span>
            {user &&
            <Badge variant="outline">{user.employee_id}</Badge>
            }
          </DialogTitle>
        </DialogHeader>

        {loading ?
        <div className="flex items-center justify-center py-12">
            <div className="text-lg">Loading permission data...</div>
          </div> :
        user ?
        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* User Info and Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-600">Employee ID</Label>
                      <p className="font-medium">{user.employee_id}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Role</Label>
                      <Badge className={
                    user.role === 'Administrator' ? 'bg-red-100 text-red-800' :
                    user.role === 'Management' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                    }>
                        {user.role}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-gray-600">Station</Label>
                      <p className="font-medium">{user.station}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Status</Label>
                      <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Permission Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">View: {summary.areasWithView}/{summary.totalAreas}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Edit3 className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Edit: {summary.areasWithEdit}/{summary.totalAreas}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Plus className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Create: {summary.areasWithCreate}/{summary.totalAreas}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Delete: {summary.areasWithDelete}/{summary.totalAreas}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Templates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Quick Permission Templates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {Object.entries(PERMISSION_TEMPLATES).map(([key, template]) =>
                <Button
                  key={key}
                  variant={selectedTemplate === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyTemplate(key)}
                  className="text-left h-auto p-3 flex flex-col items-start space-y-1">
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-gray-500 text-left">{template.description}</div>
                    </Button>
                )}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Permissions */}
            <Card className="flex-1 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Detailed Permissions</CardTitle>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <ScrollArea className="h-64">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-48">Content Area</TableHead>
                        <TableHead className="text-center w-20">
                          <div className="flex flex-col items-center">
                            <Eye className="w-4 h-4 mb-1" />
                            <span className="text-xs">View</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-center w-20">
                          <div className="flex flex-col items-center">
                            <Edit3 className="w-4 h-4 mb-1" />
                            <span className="text-xs">Edit</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-center w-20">
                          <div className="flex flex-col items-center">
                            <Plus className="w-4 h-4 mb-1" />
                            <span className="text-xs">Create</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-center w-20">
                          <div className="flex flex-col items-center">
                            <Trash2 className="w-4 h-4 mb-1" />
                            <span className="text-xs">Delete</span>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {CONTENT_AREAS.map((area) =>
                    <TableRow key={area.name}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{area.displayName}</div>
                              <div className="text-xs text-gray-500">{area.description}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                          checked={permissions[area.name]?.view || false}
                          onCheckedChange={(checked) =>
                          handlePermissionChange(area.name, 'view', checked as boolean)
                          } />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                          checked={permissions[area.name]?.edit || false}
                          onCheckedChange={(checked) =>
                          handlePermissionChange(area.name, 'edit', checked as boolean)
                          } />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                          checked={permissions[area.name]?.create || false}
                          onCheckedChange={(checked) =>
                          handlePermissionChange(area.name, 'create', checked as boolean)
                          } />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                          checked={permissions[area.name]?.delete || false}
                          onCheckedChange={(checked) =>
                          handlePermissionChange(area.name, 'delete', checked as boolean)
                          } />
                          </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
              onClick={handleSavePermissions}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Save Comprehensive Permissions
              </Button>
            </div>
          </div> :

        <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="text-gray-500">No user selected</p>
            </div>
          </div>
        }
      </DialogContent>
    </Dialog>);

};

export default ComprehensivePermissionDialog;