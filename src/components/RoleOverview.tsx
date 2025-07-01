import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  Shield,
  Eye,
  Edit3,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Info,
  Users,
  Building2,
  Crown,
  UserCheck,
  FileText } from
'lucide-react';

interface RoleOverviewProps {
  trigger?: React.ReactNode;
}

const ROLE_DETAILS = {
  'Administrator': {
    name: 'Administrator',
    icon: '👑',
    description: 'Complete system control with unrestricted access',
    color: 'bg-red-100 text-red-800 border-red-200',
    headerColor: 'bg-red-50',
    features: [
    'Full access to all system areas',
    'User management and role assignment',
    'System configuration and security settings',
    'Complete audit trail access',
    'Advanced reporting and analytics',
    'Database management capabilities'],

    bestFor: [
    'System administrators',
    'IT managers',
    'Business owners',
    'Technical support leads'],

    permissions: {
      dashboard: { view: true, edit: true, create: true, delete: true },
      products: { view: true, edit: true, create: true, delete: true },
      employees: { view: true, edit: true, create: true, delete: true },
      sales_reports: { view: true, edit: true, create: true, delete: true },
      vendors: { view: true, edit: true, create: true, delete: true },
      orders: { view: true, edit: true, create: true, delete: true },
      licenses: { view: true, edit: true, create: true, delete: true },
      salary: { view: true, edit: true, create: true, delete: true },
      inventory: { view: true, edit: true, create: true, delete: true },
      delivery: { view: true, edit: true, create: true, delete: true },
      settings: { view: true, edit: true, create: true, delete: true },
      user_management: { view: true, edit: true, create: true, delete: true },
      site_management: { view: true, edit: true, create: true, delete: true },
      system_logs: { view: true, edit: true, create: true, delete: true },
      security_settings: { view: true, edit: true, create: true, delete: true }
    }
  },
  'Management': {
    name: 'Management',
    icon: '👔',
    description: 'Supervisory access with business operation control',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    headerColor: 'bg-blue-50',
    features: [
    'Business operations management',
    'Staff oversight and scheduling',
    'Financial reporting access',
    'Inventory and vendor management',
    'Limited user management',
    'Performance analytics'],

    bestFor: [
    'Store managers',
    'Operations supervisors',
    'Department heads',
    'Assistant managers'],

    permissions: {
      dashboard: { view: true, edit: true, create: true, delete: true },
      products: { view: true, edit: true, create: true, delete: true },
      employees: { view: true, edit: true, create: true, delete: false },
      sales_reports: { view: true, edit: true, create: true, delete: true },
      vendors: { view: true, edit: true, create: true, delete: true },
      orders: { view: true, edit: true, create: true, delete: true },
      licenses: { view: true, edit: true, create: true, delete: true },
      salary: { view: true, edit: true, create: true, delete: true },
      inventory: { view: true, edit: true, create: true, delete: true },
      delivery: { view: true, edit: true, create: true, delete: true },
      settings: { view: true, edit: true, create: false, delete: false },
      user_management: { view: true, edit: false, create: false, delete: false },
      site_management: { view: true, edit: false, create: false, delete: false },
      system_logs: { view: true, edit: false, create: false, delete: false },
      security_settings: { view: false, edit: false, create: false, delete: false }
    }
  },
  'Employee': {
    name: 'Employee',
    icon: '👤',
    description: 'Operational access for day-to-day tasks',
    color: 'bg-green-100 text-green-800 border-green-200',
    headerColor: 'bg-green-50',
    features: [
    'Daily operations management',
    'Sales reporting and tracking',
    'Inventory updates',
    'Order processing',
    'Product information access',
    'Delivery management'],

    bestFor: [
    'Store clerks',
    'Shift supervisors',
    'Sales associates',
    'Inventory staff'],

    permissions: {
      dashboard: { view: true, edit: false, create: false, delete: false },
      products: { view: true, edit: true, create: false, delete: false },
      employees: { view: false, edit: false, create: false, delete: false },
      sales_reports: { view: true, edit: true, create: true, delete: false },
      vendors: { view: true, edit: false, create: false, delete: false },
      orders: { view: true, edit: true, create: true, delete: false },
      licenses: { view: true, edit: false, create: false, delete: false },
      salary: { view: false, edit: false, create: false, delete: false },
      inventory: { view: true, edit: true, create: false, delete: false },
      delivery: { view: true, edit: true, create: true, delete: false },
      settings: { view: false, edit: false, create: false, delete: false },
      user_management: { view: false, edit: false, create: false, delete: false },
      site_management: { view: false, edit: false, create: false, delete: false },
      system_logs: { view: false, edit: false, create: false, delete: false },
      security_settings: { view: false, edit: false, create: false, delete: false }
    }
  },
  'Read Only': {
    name: 'Read Only',
    icon: '👁️',
    description: 'View-only access for monitoring and reporting',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    headerColor: 'bg-gray-50',
    features: [
    'Dashboard monitoring',
    'Product catalog viewing',
    'Sales report access',
    'Inventory status checking',
    'Order status tracking',
    'Basic system information'],

    bestFor: [
    'Auditors',
    'Temporary staff',
    'Consultants',
    'Trainees'],

    permissions: {
      dashboard: { view: true, edit: false, create: false, delete: false },
      products: { view: true, edit: false, create: false, delete: false },
      employees: { view: false, edit: false, create: false, delete: false },
      sales_reports: { view: true, edit: false, create: false, delete: false },
      vendors: { view: false, edit: false, create: false, delete: false },
      orders: { view: true, edit: false, create: false, delete: false },
      licenses: { view: false, edit: false, create: false, delete: false },
      salary: { view: false, edit: false, create: false, delete: false },
      inventory: { view: true, edit: false, create: false, delete: false },
      delivery: { view: false, edit: false, create: false, delete: false },
      settings: { view: false, edit: false, create: false, delete: false },
      user_management: { view: false, edit: false, create: false, delete: false },
      site_management: { view: false, edit: false, create: false, delete: false },
      system_logs: { view: false, edit: false, create: false, delete: false },
      security_settings: { view: false, edit: false, create: false, delete: false }
    }
  }
};

const CONTENT_AREAS = [
{ name: 'dashboard', displayName: 'Dashboard' },
{ name: 'products', displayName: 'Products' },
{ name: 'employees', displayName: 'Employees' },
{ name: 'sales_reports', displayName: 'Sales Reports' },
{ name: 'vendors', displayName: 'Vendors' },
{ name: 'orders', displayName: 'Orders' },
{ name: 'licenses', displayName: 'Licenses' },
{ name: 'salary', displayName: 'Salary' },
{ name: 'inventory', displayName: 'Inventory' },
{ name: 'delivery', displayName: 'Delivery' },
{ name: 'settings', displayName: 'Settings' },
{ name: 'user_management', displayName: 'User Management' },
{ name: 'site_management', displayName: 'Site Management' },
{ name: 'system_logs', displayName: 'System Logs' },
{ name: 'security_settings', displayName: 'Security Settings' }];


const PermissionIcon: React.FC<{hasPermission: boolean;}> = ({ hasPermission }) => {
  return hasPermission ?
  <CheckCircle className="w-4 h-4 text-green-600" /> :

  <XCircle className="w-4 h-4 text-gray-300" />;

};

const RoleOverview: React.FC<RoleOverviewProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = React.useState(false);

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
            <Star className="w-5 h-5" />
            <span>Role Reference Guide</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 pr-4">
            {/* Introduction */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-1">Role-Based Access Control</h3>
                    <p className="text-blue-700 text-sm">
                      Our system uses predefined roles to simplify permission management. Each role comes with 
                      carefully configured permissions optimized for different job functions. Choose the role 
                      that best matches the user's responsibilities.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role Details */}
            {Object.entries(ROLE_DETAILS).map(([key, role]) =>
            <Card key={key} className={`border-2 ${role.color.includes('border') ? '' : 'border-gray-200'}`}>
                <CardHeader className={role.headerColor}>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="text-2xl">{role.icon}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{role.name}</span>
                        <Badge className={role.color}>{role.name}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Features */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center space-x-2">
                        <Star className="w-4 h-4" />
                        <span>Key Features</span>
                      </h4>
                      <ul className="space-y-2">
                        {role.features.map((feature, index) =>
                      <li key={index} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                      )}
                      </ul>
                    </div>

                    {/* Best For */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Best For</span>
                      </h4>
                      <ul className="space-y-2">
                        {role.bestFor.map((position, index) =>
                      <li key={index} className="flex items-start space-x-2 text-sm">
                            <UserCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>{position}</span>
                          </li>
                      )}
                      </ul>
                    </div>
                  </div>

                  <Separator />

                  {/* Permission Matrix */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Permission Matrix</span>
                    </h4>
                    <div className="overflow-x-auto">
                      <div className="grid grid-cols-5 gap-2 text-xs mb-2 font-medium">
                        <div>Content Area</div>
                        <div className="text-center">View</div>
                        <div className="text-center">Edit</div>
                        <div className="text-center">Create</div>
                        <div className="text-center">Delete</div>
                      </div>
                      <div className="space-y-1">
                        {CONTENT_AREAS.map((area) => {
                        const permissions = role.permissions[area.name as keyof typeof role.permissions];
                        return (
                          <div key={area.name} className="grid grid-cols-5 gap-2 text-xs py-1 border-b border-gray-100">
                              <div className="font-medium">{area.displayName}</div>
                              <div className="text-center">
                                <PermissionIcon hasPermission={permissions.view} />
                              </div>
                              <div className="text-center">
                                <PermissionIcon hasPermission={permissions.edit} />
                              </div>
                              <div className="text-center">
                                <PermissionIcon hasPermission={permissions.create} />
                              </div>
                              <div className="text-center">
                                <PermissionIcon hasPermission={permissions.delete} />
                              </div>
                            </div>);

                      })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Permission Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Permission Types</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">View</div>
                      <div className="text-xs text-gray-500">Read access to information</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Edit3 className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="font-medium text-sm">Edit</div>
                      <div className="text-xs text-gray-500">Modify existing records</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Plus className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-medium text-sm">Create</div>
                      <div className="text-xs text-gray-500">Add new records</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <div>
                      <div className="font-medium text-sm">Delete</div>
                      <div className="text-xs text-gray-500">Remove records</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close Guide
          </Button>
        </div>
      </DialogContent>
    </Dialog>);

};

export default RoleOverview;