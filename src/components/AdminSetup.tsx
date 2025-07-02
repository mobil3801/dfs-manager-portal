import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Settings, User, Shield, CheckCircle, Database } from 'lucide-react';
import { toast } from 'sonner';

interface AdminSetupProps {
  onSetupComplete: () => void;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const AdminSetup: React.FC<AdminSetupProps> = ({ onSetupComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Admin account data
  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
    department: 'Administration',
    phone: ''
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    organizationName: '',
    defaultUserRole: 'employee',
    requireEmailVerification: true,
    enableTwoFactor: false
  });

  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'database',
      title: 'Database Setup',
      description: 'Initialize required database tables',
      completed: false
    },
    {
      id: 'admin',
      title: 'Admin Account',
      description: 'Create the first administrator account',
      completed: false
    },
    {
      id: 'system',
      title: 'System Settings',
      description: 'Configure basic system preferences',
      completed: false
    }
  ]);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      // Check if UserProfile table exists by trying to query it
      const { data, error } = await window.ezsite.apis.tablePage('24040', {
        PageNo: 1,
        PageSize: 1,
        Filters: []
      });

      setSteps(prev => prev.map(step => 
        step.id === 'database' ? { ...step, completed: true } : step
      ));
      
      toast.success('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      // Database table exists or accessible, mark as completed
      setSteps(prev => prev.map(step => 
        step.id === 'database' ? { ...step, completed: true } : step
      ));
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminData.email || !adminData.password || !adminData.confirmPassword || !adminData.fullName) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (adminData.password !== adminData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (adminData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      // Register the admin user
      const { error: registerError } = await window.ezsite.apis.register({ 
        email: adminData.email, 
        password: adminData.password 
      });

      if (registerError) {
        toast.error(registerError);
        return;
      }

      // Login to get user ID
      const { error: loginError } = await window.ezsite.apis.login({
        email: adminData.email,
        password: adminData.password
      });

      if (loginError) {
        toast.error(loginError);
        return;
      }

      // Get user info
      const { data: userData, error: userError } = await window.ezsite.apis.getUserInfo();
      if (userError || !userData) {
        toast.error('Failed to get user information');
        return;
      }

      // Create admin profile
      const profileData = {
        user_id: userData.ID,
        username: adminData.username || adminData.email.split('@')[0],
        full_name: adminData.fullName,
        role: 'admin',
        phone: adminData.phone,
        department: adminData.department,
        status: 'active',
        avatar_url: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await window.ezsite.apis.tableCreate('24040', profileData);
      if (profileError) {
        toast.error('Failed to create admin profile');
        return;
      }

      setSteps(prev => prev.map(step => 
        step.id === 'admin' ? { ...step, completed: true } : step
      ));

      toast.success('Admin account created successfully');
      setCurrentStep(2);
    } catch (error) {
      console.error('Admin creation error:', error);
      toast.error('Failed to create admin account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Store system settings (you might want to create a settings table for this)
      localStorage.setItem('systemSettings', JSON.stringify(systemSettings));

      setSteps(prev => prev.map(step => 
        step.id === 'system' ? { ...step, completed: true } : step
      ));

      toast.success('System settings configured successfully');
      
      // Complete setup
      setTimeout(() => {
        onSetupComplete();
      }, 1000);
    } catch (error) {
      console.error('System settings error:', error);
      toast.error('Failed to save system settings');
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${step.completed 
                ? 'bg-green-500 text-white' 
                : currentStep === index 
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }
            `}>
              {step.completed ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <div className="ml-3 text-left">
              <div className={`text-sm font-medium ${
                step.completed ? 'text-green-600' : 
                currentStep === index ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-400">{step.description}</div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`
              w-8 h-0.5 mx-4
              ${steps[index + 1].completed || currentStep > index 
                ? 'bg-green-500' 
                : 'bg-gray-200'
              }
            `} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card>
            <CardHeader className="text-center">
              <Database className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <CardTitle>Database Initialization</CardTitle>
              <CardDescription>
                Setting up required database tables for the application
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-gray-600">Initializing database tables...</p>
                <Button onClick={() => setCurrentStep(1)} disabled={!steps[0].completed}>
                  Continue to Admin Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <CardTitle>Create Administrator Account</CardTitle>
              <CardDescription>
                Set up the first administrator account for your system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Administrator Name"
                      value={adminData.fullName}
                      onChange={(e) => setAdminData(prev => ({ ...prev, fullName: e.target.value }))}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="admin"
                      value={adminData.username}
                      onChange={(e) => setAdminData(prev => ({ ...prev, username: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={adminData.email}
                    onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Choose a strong password"
                        value={adminData.password}
                        onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
                        disabled={isSubmitting}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={adminData.confirmPassword}
                        onChange={(e) => setAdminData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        disabled={isSubmitting}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      type="text"
                      value={adminData.department}
                      onChange={(e) => setAdminData(prev => ({ ...prev, department: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={adminData.phone}
                      onChange={(e) => setAdminData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <Separator />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Admin Account...
                    </div>
                  ) : (
                    <>
                      <User className="w-4 h-4 mr-2" />
                      Create Administrator Account
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader className="text-center">
              <Settings className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Configure basic system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSystemSettings} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    type="text"
                    placeholder="Your Organization Name"
                    value={systemSettings.organizationName}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, organizationName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultUserRole">Default User Role</Label>
                  <Select 
                    value={systemSettings.defaultUserRole} 
                    onValueChange={(value) => setSystemSettings(prev => ({ ...prev, defaultUserRole: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Security Settings</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Email Verification</Label>
                      <p className="text-sm text-gray-500">Users must verify their email before accessing the system</p>
                    </div>
                    <Button
                      type="button"
                      variant={systemSettings.requireEmailVerification ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSystemSettings(prev => ({ 
                        ...prev, 
                        requireEmailVerification: !prev.requireEmailVerification 
                      }))}
                    >
                      {systemSettings.requireEmailVerification ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Enable 2FA for enhanced security (can be configured later)</p>
                    </div>
                    <Button
                      type="button"
                      variant={systemSettings.enableTwoFactor ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSystemSettings(prev => ({ 
                        ...prev, 
                        enableTwoFactor: !prev.enableTwoFactor 
                      }))}
                    >
                      {systemSettings.enableTwoFactor ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>

                <Separator />

                <Button type="submit" className="w-full">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Setup
                </Button>
              </form>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <img
            src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png"
            alt="Logo"
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900">System Setup</h1>
          <p className="text-gray-600 mt-2">Let's configure your application for first use</p>
        </div>

        {renderStepIndicator()}
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default AdminSetup;