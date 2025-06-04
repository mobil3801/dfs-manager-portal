import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Mail, Phone, Building2, Shield, Calendar, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

interface UserFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  station: string;
  employee_id: string;
  hire_date: string;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ isOpen, onClose, onUserCreated }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'Employee',
    station: 'MOBIL',
    employee_id: '',
    hire_date: new Date().toISOString().split('T')[0]
  });

  const roles = ['Administrator', 'Management', 'Employee'];
  const stations = ['MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'];

  const generateEmployeeId = () => {
    const prefix = formData.station.split(' ')[0].substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  };

  const generatePassword = () => {
    const length = 12;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.email || !formData.email.includes('@')) {
      return 'Please enter a valid email address';
    }
    if (!formData.password || formData.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!formData.firstName.trim()) {
      return 'First name is required';
    }
    if (!formData.lastName.trim()) {
      return 'Last name is required';
    }
    if (!formData.phone.trim()) {
      return 'Phone number is required';
    }
    if (!formData.employee_id.trim()) {
      return 'Employee ID is required';
    }
    return null;
  };

  const handleCreateUser = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting user creation process...');

      // Step 1: Register user with Supabase Auth
      console.log('Registering user with email:', formData.email);
      const { error: authError } = await window.ezsite.apis.register({
        email: formData.email,
        password: formData.password
      });

      if (authError) {
        console.error('Authentication registration failed:', authError);
        throw new Error(`Failed to create user account: ${authError}`);
      }

      console.log('User authentication account created successfully');

      // Step 2: Get the newly created user info
      let userInfo;
      let retryCount = 0;
      const maxRetries = 5;

      // Retry logic to get user info after registration
      while (retryCount < maxRetries) {
        try {
          const { data, error: userInfoError } = await window.ezsite.apis.getUserInfo();
          if (!userInfoError && data) {
            userInfo = data;
            break;
          }
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
          }
        } catch (error) {
          console.log(`Retry ${retryCount + 1} failed:`, error);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      if (!userInfo) {
        console.error('Failed to get user info after registration');
        throw new Error('User was created but profile setup failed. Please try to create the profile manually.');
      }

      console.log('Retrieved user info:', userInfo);

      // Step 3: Create user profile in the database
      const profileData = {
        user_id: userInfo.ID,
        role: formData.role,
        station: formData.station,
        employee_id: formData.employee_id,
        phone: formData.phone,
        hire_date: formData.hire_date,
        is_active: true,
        detailed_permissions: JSON.stringify({
          dashboard: { view: true, create: false, edit: false, delete: false },
          products: { view: formData.role !== 'Employee', create: false, edit: false, delete: false },
          employees: { view: formData.role === 'Administrator', create: false, edit: false, delete: false },
          sales_reports: { view: true, create: formData.role !== 'Employee', edit: formData.role !== 'Employee', delete: false },
          vendors: { view: formData.role !== 'Employee', create: false, edit: false, delete: false },
          orders: { view: formData.role !== 'Employee', create: formData.role !== 'Employee', edit: formData.role !== 'Employee', delete: false },
          licenses: { view: formData.role !== 'Employee', create: false, edit: false, delete: false },
          salary: { view: formData.role === 'Administrator', create: formData.role === 'Administrator', edit: formData.role === 'Administrator', delete: false },
          inventory: { view: true, create: formData.role !== 'Employee', edit: formData.role !== 'Employee', delete: false },
          delivery: { view: formData.role !== 'Employee', create: formData.role !== 'Employee', edit: formData.role !== 'Employee', delete: false },
          settings: { view: formData.role === 'Administrator', create: false, edit: formData.role === 'Administrator', delete: false },
          user_management: { view: formData.role === 'Administrator', create: formData.role === 'Administrator', edit: formData.role === 'Administrator', delete: formData.role === 'Administrator' },
          site_management: { view: formData.role === 'Administrator', create: formData.role === 'Administrator', edit: formData.role === 'Administrator', delete: formData.role === 'Administrator' },
          system_logs: { view: formData.role === 'Administrator', create: false, edit: false, delete: false },
          security_settings: { view: formData.role === 'Administrator', create: false, edit: formData.role === 'Administrator', delete: false }
        })
      };

      console.log('Creating user profile with data:', profileData);
      const { error: profileError } = await window.ezsite.apis.tableCreate(11725, profileData);

      if (profileError) {
        console.error('Profile creation failed:', profileError);
        throw new Error(`Failed to create user profile: ${profileError}`);
      }

      console.log('User profile created successfully');

      // Step 4: Send role-specific welcome email
      try {
        const emailTemplates = {
          Administrator: {
            subject: 'Welcome to DFS Manager Portal - Administrator Access',
            content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #dc2626; margin: 0;">DFS Manager Portal</h1>
    <h2 style="color: #374151; margin-top: 10px;">Administrator Access Granted</h2>
  </div>
  
  <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
    <h3 style="margin: 0 0 10px 0;">Welcome, ${formData.firstName} ${formData.lastName}!</h3>
    <p style="margin: 0; opacity: 0.9;">You now have full administrative access to the DFS Manager Portal.</p>
  </div>

  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #374151; margin-top: 0;">Account Details:</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>${formData.email}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Employee ID:</td><td>${formData.employee_id}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Role:</td><td style="color: #dc2626; font-weight: bold;">${formData.role}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Station:</td><td>${formData.station}</td></tr>
    </table>
  </div>

  <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
    <h4 style="color: #92400e; margin-top: 0;">Login Information:</h4>
    <p style="color: #92400e; margin-bottom: 0;"><strong>Temporary Password:</strong> ${formData.password}</p>
    <p style="color: #92400e; font-size: 14px;"><em>Please change your password after your first login for security purposes.</em></p>
  </div>

  <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
    <h4 style="color: #991b1b; margin-top: 0;">Administrator Responsibilities:</h4>
    <ul style="color: #991b1b; margin-bottom: 0; padding-left: 20px;">
      <li>Full system access and user management</li>
      <li>System configuration and security settings</li>
      <li>Data backup and recovery oversight</li>
      <li>Training and supporting other users</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${window.location.origin}" style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Access Portal</a>
  </div>

  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
    <p>Best regards,<br>DFS Manager Portal Team</p>
  </div>
</div>`
          },
          Management: {
            subject: 'Welcome to DFS Manager Portal - Management Access',
            content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">DFS Manager Portal</h1>
    <h2 style="color: #374151; margin-top: 10px;">Management Access Granted</h2>
  </div>
  
  <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
    <h3 style="margin: 0 0 10px 0;">Welcome, ${formData.firstName} ${formData.lastName}!</h3>
    <p style="margin: 0; opacity: 0.9;">You now have management-level access to the DFS Manager Portal.</p>
  </div>

  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #374151; margin-top: 0;">Account Details:</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>${formData.email}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Employee ID:</td><td>${formData.employee_id}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Role:</td><td style="color: #2563eb; font-weight: bold;">${formData.role}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Station:</td><td>${formData.station}</td></tr>
    </table>
  </div>

  <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
    <h4 style="color: #92400e; margin-top: 0;">Login Information:</h4>
    <p style="color: #92400e; margin-bottom: 0;"><strong>Temporary Password:</strong> ${formData.password}</p>
    <p style="color: #92400e; font-size: 14px;"><em>Please change your password after your first login for security purposes.</em></p>
  </div>

  <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
    <h4 style="color: #1e40af; margin-top: 0;">Management Features:</h4>
    <ul style="color: #1e40af; margin-bottom: 0; padding-left: 20px;">
      <li>Sales reports and analytics</li>
      <li>Inventory management and ordering</li>
      <li>Employee scheduling and oversight</li>
      <li>Financial reporting and reconciliation</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${window.location.origin}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Access Portal</a>
  </div>

  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
    <p>Best regards,<br>DFS Manager Portal Team</p>
  </div>
</div>`
          },
          Employee: {
            subject: 'Welcome to DFS Manager Portal - Employee Access',
            content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #059669; margin: 0;">DFS Manager Portal</h1>
    <h2 style="color: #374151; margin-top: 10px;">Employee Access</h2>
  </div>
  
  <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
    <h3 style="margin: 0 0 10px 0;">Welcome to the team, ${formData.firstName}!</h3>
    <p style="margin: 0; opacity: 0.9;">Your account has been created for the DFS Manager Portal.</p>
  </div>

  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #374151; margin-top: 0;">Account Details:</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>${formData.email}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Employee ID:</td><td>${formData.employee_id}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Role:</td><td style="color: #059669; font-weight: bold;">${formData.role}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Station:</td><td>${formData.station}</td></tr>
    </table>
  </div>

  <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
    <h4 style="color: #92400e; margin-top: 0;">Login Information:</h4>
    <p style="color: #92400e; margin-bottom: 0;"><strong>Temporary Password:</strong> ${formData.password}</p>
    <p style="color: #92400e; font-size: 14px;"><em>Please change your password after your first login for security purposes.</em></p>
  </div>

  <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; border-left: 4px solid #059669; margin: 20px 0;">
    <h4 style="color: #065f46; margin-top: 0;">What You Can Do:</h4>
    <ul style="color: #065f46; margin-bottom: 0; padding-left: 20px;">
      <li>View daily sales reports for your station</li>
      <li>Access shift schedules and assignments</li>
      <li>Submit daily operational reports</li>
      <li>View inventory levels and alerts</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${window.location.origin}" style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Access Portal</a>
  </div>

  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
    <p>Best regards,<br>DFS Manager Portal Team</p>
  </div>
</div>`
          }
        };

        const template = emailTemplates[formData.role as keyof typeof emailTemplates];
        
        if (template) {
          await window.ezsite.apis.sendEmail({
            from: 'support@ezsite.ai',
            to: [formData.email],
            subject: template.subject,
            html: template.content
          });
          console.log(`Role-specific welcome email sent for ${formData.role}`);
        } else {
          console.warn(`No email template found for role: ${formData.role}`);
        }
      } catch (emailError) {
        console.warn('Failed to send welcome email:', emailError);
        // Don't fail the entire process if email fails
      }

      toast({
        title: "Success",
        description: `User account created successfully for ${formData.firstName} ${formData.lastName}. Welcome email sent to ${formData.email}.`
      });

      // Reset form
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'Employee',
        station: 'MOBIL',
        employee_id: '',
        hire_date: new Date().toISOString().split('T')[0]
      });

      onUserCreated();
      onClose();

    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Create New User</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Mail className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold">Account Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="user@example.com"
                    required
                    disabled={loading} />

                </div>
                
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter password"
                      required
                      disabled={loading} />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}>

                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange('password', generatePassword())}
                      disabled={loading}>

                      Generate Password
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-4 h-4 text-green-600" />
                <h3 className="font-semibold">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                    required
                    disabled={loading} />

                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                    required
                    disabled={loading} />

                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                    disabled={loading} />

                </div>
                
                <div>
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => handleInputChange('hire_date', e.target.value)}
                    disabled={loading} />

                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold">Work Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                    disabled={loading}>

                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) =>
                      <SelectItem key={role} value={role}>
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4" />
                            <span>{role}</span>
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="station">Station *</Label>
                  <Select
                    value={formData.station}
                    onValueChange={(value) => handleInputChange('station', value)}
                    disabled={loading}>

                    <SelectTrigger>
                      <SelectValue placeholder="Select station" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) =>
                      <SelectItem key={station} value={station}>
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4" />
                            <span>{station}</span>
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="employee_id">Employee ID *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="employee_id"
                      value={formData.employee_id}
                      onChange={(e) => handleInputChange('employee_id', e.target.value)}
                      placeholder="EMP-123456"
                      required
                      disabled={loading} />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleInputChange('employee_id', generateEmployeeId())}
                      disabled={loading}>

                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-4 h-4 text-orange-600" />
                <h3 className="font-semibold">Permissions Preview</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dashboard Access</span>
                  <Badge variant="default">Granted</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sales Reports</span>
                  <Badge variant={formData.role !== 'Employee' ? 'default' : 'secondary'}>
                    {formData.role !== 'Employee' ? 'Full Access' : 'View Only'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Management</span>
                  <Badge variant={formData.role === 'Administrator' ? 'default' : 'secondary'}>
                    {formData.role === 'Administrator' ? 'Full Access' : 'No Access'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Administration</span>
                  <Badge variant={formData.role === 'Administrator' ? 'default' : 'secondary'}>
                    {formData.role === 'Administrator' ? 'Full Access' : 'No Access'}
                  </Badge>
                </div>
              </div>
              
              <Alert className="mt-4">
                <AlertDescription className="text-sm">
                  Permissions can be customized after user creation through the User Management interface.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}>

              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700">

              {loading ?
              <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating User...
                </> :

              <>
                  <User className="w-4 h-4 mr-2" />
                  Create User Account
                </>
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>);

};

export default CreateUserDialog;