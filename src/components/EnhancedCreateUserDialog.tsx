import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  User, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Eye, 
  EyeOff, 
  Building2, 
  Mail,
  Phone,
  Calendar,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UserSecurityValidator from '@/components/UserSecurityValidator';
import { userSecurityService } from '@/services/userSecurityService';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedCreateUserDialogProps {
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

const EnhancedCreateUserDialog: React.FC<EnhancedCreateUserDialogProps> = ({ 
  isOpen, 
  onClose, 
  onUserCreated 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentTab, setCurrentTab] = useState('basic');
  
  // Security validation state
  const [securityValidation, setSecurityValidation] = useState({
    isValid: false,
    errors: [] as string[],
    warnings: [] as string[]
  });

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

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecurityValidationChange = (isValid: boolean, errors: string[], warnings: string[]) => {
    setSecurityValidation({ isValid, errors, warnings });
  };

  const generatePassword = () => {
    const length = 12;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleInputChange('password', password);
  };

  const validateBasicForm = (): string | null => {
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
    // Validate basic form
    const basicValidation = validateBasicForm();
    if (basicValidation) {
      toast({
        title: "Validation Error",
        description: basicValidation,
        variant: "destructive"
      });
      return;
    }

    // Check security validation
    if (!securityValidation.isValid) {
      toast({
        title: "Security Validation Failed",
        description: "Please resolve all security issues before creating the user",
        variant: "destructive"
      });
      setCurrentTab('security');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting secure user creation process...');

      // Final security validation before creation
      const finalValidation = await userSecurityService.validateUser(formData);
      if (!finalValidation.isValid) {
        throw new Error(`Security validation failed: ${finalValidation.errors.join(', ')}`);
      }

      // Step 1: Register user with authentication system
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

      // Step 2: Get the newly created user info with retries
      let userInfo;
      let retryCount = 0;
      const maxRetries = 5;

      while (retryCount < maxRetries) {
        try {
          const { data, error: userInfoError } = await window.ezsite.apis.getUserInfo();
          if (!userInfoError && data) {
            userInfo = data;
            break;
          }
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.log(`Retry ${retryCount + 1} failed:`, error);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (!userInfo) {
        console.error('Failed to get user info after registration');
        throw new Error('User was created but profile setup failed. Please try to create the profile manually.');
      }

      console.log('Retrieved user info:', userInfo);

      // Step 3: Create secure user profile
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
          sales_reports: { 
            view: true, 
            create: formData.role !== 'Employee', 
            edit: formData.role !== 'Employee', 
            delete: false 
          },
          vendors: { view: formData.role !== 'Employee', create: false, edit: false, delete: false },
          orders: { 
            view: formData.role !== 'Employee', 
            create: formData.role !== 'Employee', 
            edit: formData.role !== 'Employee', 
            delete: false 
          },
          licenses: { view: formData.role !== 'Employee', create: false, edit: false, delete: false },
          salary: { 
            view: formData.role === 'Administrator', 
            create: formData.role === 'Administrator', 
            edit: formData.role === 'Administrator', 
            delete: false 
          },
          inventory: { 
            view: true, 
            create: formData.role !== 'Employee', 
            edit: formData.role !== 'Employee', 
            delete: false 
          },
          delivery: { 
            view: formData.role !== 'Employee', 
            create: formData.role !== 'Employee', 
            edit: formData.role !== 'Employee', 
            delete: false 
          },
          settings: { 
            view: formData.role === 'Administrator', 
            create: false, 
            edit: formData.role === 'Administrator', 
            delete: false 
          },
          user_management: { 
            view: formData.role === 'Administrator', 
            create: formData.role === 'Administrator', 
            edit: formData.role === 'Administrator', 
            delete: formData.role === 'Administrator' 
          },
          site_management: { 
            view: formData.role === 'Administrator', 
            create: formData.role === 'Administrator', 
            edit: formData.role === 'Administrator', 
            delete: formData.role === 'Administrator' 
          },
          system_logs: { view: formData.role === 'Administrator', create: false, edit: false, delete: false },
          security_settings: { 
            view: formData.role === 'Administrator', 
            create: false, 
            edit: formData.role === 'Administrator', 
            delete: false 
          }
        })
      };

      console.log('Creating secure user profile with data:', profileData);
      const { error: profileError } = await window.ezsite.apis.tableCreate(11725, profileData);

      if (profileError) {
        console.error('Profile creation failed:', profileError);
        throw new Error(`Failed to create user profile: ${profileError}`);
      }

      console.log('User profile created successfully');

      // Step 4: Audit the user creation
      await userSecurityService.auditUserOperation(
        'CREATE',
        formData,
        user?.ID || 0,
        'SUCCESS'
      );

      // Step 5: Send secure welcome email
      try {
        const stationDisplay = formData.station === 'ALL' ? 'All Stations' : formData.station;
        const securityRecommendations = userSecurityService.getSecurityRecommendations(formData.role, formData.station);
        
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">🔐 Secure Account Created - DFS Manager Portal</h2>
            <p>Hello ${formData.firstName} ${formData.lastName},</p>
            <p>Your secure account has been successfully created for the DFS Manager Portal with enhanced security validation.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">🛡️ Secure Account Details:</h3>
              <p><strong>Email:</strong> ${formData.email}</p>
              <p><strong>Employee ID:</strong> ${formData.employee_id}</p>
              <p><strong>Role:</strong> ${formData.role}</p>
              <p><strong>Station Access:</strong> ${stationDisplay}</p>
              <p><strong>Hire Date:</strong> ${new Date(formData.hire_date).toLocaleDateString()}</p>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <h4 style="color: #92400e; margin-top: 0;">🔑 Login Information:</h4>
              <p style="color: #92400e; margin-bottom: 0;"><strong>Temporary Password:</strong> ${formData.password}</p>
              <p style="color: #92400e; font-size: 14px;"><em>Please change your password after your first login for security purposes.</em></p>
            </div>
            
            <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 20px 0;">
              <h4 style="color: #166534; margin-top: 0;">🛡️ Security Features:</h4>
              <ul style="color: #166534; margin: 0;">
                <li>✅ Email uniqueness verified</li>
                <li>✅ Role conflicts checked</li>
                <li>✅ Secure employee ID generated</li>
                <li>✅ Admin account protection active</li>
              </ul>
            </div>
            
            ${securityRecommendations.length > 0 ? `
            <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
              <h4 style="color: #1e40af; margin-top: 0;">📋 Security Recommendations:</h4>
              <ul style="color: #1e40af;">
                ${securityRecommendations.map(rec => `<li>${rec}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            <p>Portal Access: <a href="${window.location.origin}" style="color: #2563eb;">${window.location.origin}</a></p>
            
            <p>If you have any questions or need assistance, please contact your administrator.</p>
            
            <p>Best regards,<br>DFS Manager Portal Security Team</p>
          </div>
        `;

        await window.ezsite.apis.sendEmail({
          from: 'security@dfs-portal.com',
          to: [formData.email],
          subject: '🔐 Secure Account Created - DFS Manager Portal',
          html: emailContent
        });

        console.log('Secure welcome email sent successfully');
      } catch (emailError) {
        console.warn('Failed to send welcome email:', emailError);
      }

      const stationText = formData.station === 'ALL' ? 'all stations' : formData.station;
      toast({
        title: "✅ Secure User Created",
        description: `User account created successfully for ${formData.firstName} ${formData.lastName} with validated access to ${stationText}. Security checks passed.`
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
      console.error('Error creating secure user:', error);
      
      // Audit the failed creation
      await userSecurityService.auditUserOperation(
        'CREATE',
        formData,
        user?.ID || 0,
        'FAILED',
        error instanceof Error ? error.message : 'Unknown error'
      );

      toast({
        title: "❌ User Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create secure user account",
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

  const canProceedToSecurity = () => {
    return formData.email && formData.role && formData.station && formData.employee_id;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Create Secure User Account</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Enhanced Security
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Basic Info</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              disabled={!canProceedToSecurity()}
              className="flex items-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>Security Validation</span>
              {securityValidation.isValid && (
                <CheckCircle className="w-3 h-3 text-green-600" />
              )}
              {securityValidation.errors.length > 0 && (
                <AlertTriangle className="w-3 h-3 text-red-600" />
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="review"
              disabled={!securityValidation.isValid}
              className="flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Review & Create</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
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
                      placeholder="user@dfs-portal.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Enter secure password"
                        required
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generatePassword}
                        disabled={loading}
                      >
                        Generate Secure Password
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
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Doe"
                      required
                      disabled={loading}
                    />
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
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="hire_date">Hire Date</Label>
                    <Input
                      id="hire_date"
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => handleInputChange('hire_date', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={() => setCurrentTab('security')}
                disabled={!canProceedToSecurity() || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next: Security Validation
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <UserSecurityValidator
              userData={{
                email: formData.email,
                role: formData.role,
                station: formData.station,
                employee_id: formData.employee_id
              }}
              isUpdate={false}
              onValidationChange={handleSecurityValidationChange}
              onDataChange={(field, value) => handleInputChange(field as keyof UserFormData, value)}
            />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentTab('basic')} disabled={loading}>
                Back: Basic Info
              </Button>
              <Button
                onClick={() => setCurrentTab('review')}
                disabled={!securityValidation.isValid || loading}
                className="bg-green-600 hover:bg-green-700"
              >
                Next: Review & Create
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Review User Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                      <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                      <p className="font-medium">{formData.phone}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Role</Label>
                      <Badge className="ml-2">{formData.role}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Station Access</Label>
                      <Badge variant="outline" className="ml-2">
                        {formData.station === 'ALL' ? 'ALL STATIONS' : formData.station}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Employee ID</Label>
                      <p className="font-medium">{formData.employee_id}</p>
                    </div>
                  </div>
                </div>

                <Alert className="mt-6 border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    All security validations passed. User account is ready for creation with enhanced security features.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentTab('security')} disabled={loading}>
                Back: Security Validation
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={loading || !securityValidation.isValid}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Secure User...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Create Secure User Account
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedCreateUserDialog;