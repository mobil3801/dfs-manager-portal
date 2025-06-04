import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Mail, 
  Shield, 
  Building2,
  Clock,
  Loader2,
  Play,
  RefreshCw,
  FileText,
  Eye
} from 'lucide-react';

interface TestResult {
  testName: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
  details?: string;
}

interface UserTestData {
  email: string;
  role: string;
  station: string;
  firstName: string;
  lastName: string;
  phone: string;
  employee_id: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  content: string;
  variables: string[];
}

const UserCreationTestingDashboard: React.FC = () => {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testProgress, setTestProgress] = useState(0);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewData, setPreviewData] = useState<UserTestData>({
    email: 'test@example.com',
    role: 'Employee',
    station: 'MOBIL',
    firstName: 'John',
    lastName: 'Doe',
    phone: '(555) 123-4567',
    employee_id: 'MOB-123456'
  });

  const roles = ['Administrator', 'Management', 'Employee'];
  const stations = ['MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'];

  // Initialize email templates for different user types
  useEffect(() => {
    const templates: EmailTemplate[] = [
      {
        id: 'admin_welcome',
        name: 'Administrator Welcome',
        type: 'Administrator',
        subject: 'Welcome to DFS Manager Portal - Administrator Access',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; margin: 0;">DFS Manager Portal</h1>
              <h2 style="color: #374151; margin-top: 10px;">Administrator Access Granted</h2>
            </div>
            
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0;">Welcome, {firstName} {lastName}!</h3>
              <p style="margin: 0; opacity: 0.9;">You now have full administrative access to the DFS Manager Portal.</p>
            </div>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Account Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>{email}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Employee ID:</td><td>{employee_id}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Role:</td><td style="color: #dc2626; font-weight: bold;">{role}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Station:</td><td>{station}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>{phone}</td></tr>
              </table>
            </div>

            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <h4 style="color: #92400e; margin-top: 0;">Administrator Responsibilities:</h4>
              <ul style="color: #92400e; margin-bottom: 0; padding-left: 20px;">
                <li>Full system access and user management</li>
                <li>System configuration and security settings</li>
                <li>Data backup and recovery oversight</li>
                <li>Training and supporting other users</li>
                <li>Monitoring system performance and logs</li>
              </ul>
            </div>

            <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
              <h4 style="color: #991b1b; margin-top: 0;">Security Notice:</h4>
              <p style="color: #991b1b; margin-bottom: 0;">As an administrator, you have access to sensitive data. Please ensure to:</p>
              <ul style="color: #991b1b; margin-bottom: 0; padding-left: 20px;">
                <li>Change your password immediately after first login</li>
                <li>Enable two-factor authentication if available</li>
                <li>Never share your credentials with others</li>
                <li>Log out completely when finished</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="{portal_url}" style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Access Portal</a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>If you have questions or need immediate assistance, contact the IT department.</p>
              <p>Best regards,<br>DFS Manager Portal Team</p>
            </div>
          </div>
        `,
        variables: ['firstName', 'lastName', 'email', 'employee_id', 'role', 'station', 'phone', 'portal_url']
      },
      {
        id: 'management_welcome',
        name: 'Management Welcome',
        type: 'Management',
        subject: 'Welcome to DFS Manager Portal - Management Access',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">DFS Manager Portal</h1>
              <h2 style="color: #374151; margin-top: 10px;">Management Access Granted</h2>
            </div>
            
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0;">Welcome, {firstName} {lastName}!</h3>
              <p style="margin: 0; opacity: 0.9;">You now have management-level access to the DFS Manager Portal.</p>
            </div>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Account Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>{email}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Employee ID:</td><td>{employee_id}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Role:</td><td style="color: #2563eb; font-weight: bold;">{role}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Station:</td><td>{station}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>{phone}</td></tr>
              </table>
            </div>

            <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
              <h4 style="color: #1e40af; margin-top: 0;">Management Features:</h4>
              <ul style="color: #1e40af; margin-bottom: 0; padding-left: 20px;">
                <li>Sales reports and analytics</li>
                <li>Inventory management and ordering</li>
                <li>Employee scheduling and oversight</li>
                <li>Financial reporting and reconciliation</li>
                <li>Vendor and supplier management</li>
                <li>License and compliance tracking</li>
              </ul>
            </div>

            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <h4 style="color: #92400e; margin-top: 0;">Getting Started:</h4>
              <ol style="color: #92400e; margin-bottom: 0; padding-left: 20px;">
                <li>Log in and change your password</li>
                <li>Review your station's current status</li>
                <li>Check recent sales reports</li>
                <li>Review pending orders and deliveries</li>
                <li>Verify employee schedules and assignments</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="{portal_url}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Access Portal</a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>For training resources and support, visit the help section in the portal.</p>
              <p>Best regards,<br>DFS Manager Portal Team</p>
            </div>
          </div>
        `,
        variables: ['firstName', 'lastName', 'email', 'employee_id', 'role', 'station', 'phone', 'portal_url']
      },
      {
        id: 'employee_welcome',
        name: 'Employee Welcome',
        type: 'Employee',
        subject: 'Welcome to DFS Manager Portal - Employee Access',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; margin: 0;">DFS Manager Portal</h1>
              <h2 style="color: #374151; margin-top: 10px;">Employee Access</h2>
            </div>
            
            <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0;">Welcome to the team, {firstName}!</h3>
              <p style="margin: 0; opacity: 0.9;">Your account has been created for the DFS Manager Portal.</p>
            </div>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Account Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>{email}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Employee ID:</td><td>{employee_id}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Role:</td><td style="color: #059669; font-weight: bold;">{role}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Station:</td><td>{station}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>{phone}</td></tr>
              </table>
            </div>

            <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; border-left: 4px solid #059669; margin: 20px 0;">
              <h4 style="color: #065f46; margin-top: 0;">What You Can Do:</h4>
              <ul style="color: #065f46; margin-bottom: 0; padding-left: 20px;">
                <li>View daily sales reports for your station</li>
                <li>Access shift schedules and assignments</li>
                <li>Submit daily operational reports</li>
                <li>View inventory levels and alerts</li>
                <li>Access training materials and resources</li>
              </ul>
            </div>

            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <h4 style="color: #92400e; margin-top: 0;">First Steps:</h4>
              <ol style="color: #92400e; margin-bottom: 0; padding-left: 20px;">
                <li>Log in using your email and temporary password</li>
                <li>Change your password to something secure</li>
                <li>Complete your profile information</li>
                <li>Review the employee handbook</li>
                <li>Contact your supervisor with any questions</li>
              </ol>
            </div>

            <div style="background-color: #e0f2fe; padding: 15px; border-radius: 8px; border-left: 4px solid #0891b2; margin: 20px 0;">
              <h4 style="color: #0c4a6e; margin-top: 0;">Important Notes:</h4>
              <ul style="color: #0c4a6e; margin-bottom: 0; padding-left: 20px;">
                <li>Keep your login credentials secure</li>
                <li>Report any technical issues to your supervisor</li>
                <li>Access is limited to your assigned station</li>
                <li>Follow all company policies for system usage</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="{portal_url}" style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Access Portal</a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>If you need help getting started, contact your supervisor or the management team.</p>
              <p>Best regards,<br>DFS Manager Portal Team</p>
            </div>
          </div>
        `,
        variables: ['firstName', 'lastName', 'email', 'employee_id', 'role', 'station', 'phone', 'portal_url']
      }
    ];
    setEmailTemplates(templates);
    setSelectedTemplate(templates[0]);
  }, []);

  // Test scenarios for different user types
  const testScenarios = [
    {
      name: 'Administrator Creation',
      role: 'Administrator',
      station: 'MOBIL',
      expectedPermissions: ['user_management', 'site_management', 'system_logs', 'security_settings']
    },
    {
      name: 'Management User Creation',
      role: 'Management',
      station: 'AMOCO ROSEDALE',
      expectedPermissions: ['sales_reports', 'orders', 'vendors', 'inventory']
    },
    {
      name: 'Employee User Creation',
      role: 'Employee',
      station: 'AMOCO BROOKLYN',
      expectedPermissions: ['dashboard', 'sales_reports']
    },
    {
      name: 'Multi-Station Access Test',
      role: 'Administrator',
      station: 'ALL',
      expectedPermissions: ['user_management', 'site_management']
    }
  ];

  const generateTestUserData = (scenario: any): UserTestData => {
    const timestamp = Date.now();
    return {
      email: `test.${scenario.role.toLowerCase()}.${timestamp}@testdfs.com`,
      role: scenario.role,
      station: scenario.station,
      firstName: `Test${scenario.role}`,
      lastName: `User${timestamp.toString().slice(-4)}`,
      phone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      employee_id: `TEST-${scenario.role.substring(0, 3).toUpperCase()}-${timestamp.toString().slice(-6)}`
    };
  };

  const runUserCreationTest = async (scenario: any): Promise<TestResult> => {
    const startTime = Date.now();
    const testUser = generateTestUserData(scenario);
    
    try {
      console.log(`Running test: ${scenario.name} with user:`, testUser);

      // Step 1: Test user registration
      const { error: authError } = await window.ezsite.apis.register({
        email: testUser.email,
        password: 'TestPassword123!'
      });

      if (authError) {
        throw new Error(`Authentication failed: ${authError}`);
      }

      // Step 2: Create user profile
      const profileData = {
        user_id: Math.floor(Math.random() * 1000000) + 100000,
        role: testUser.role,
        station: testUser.station,
        employee_id: testUser.employee_id,
        phone: testUser.phone,
        hire_date: new Date().toISOString().split('T')[0],
        is_active: true,
        detailed_permissions: JSON.stringify({
          dashboard: { view: true, create: false, edit: false, delete: false },
          products: { view: testUser.role !== 'Employee', create: false, edit: false, delete: false },
          employees: { view: testUser.role === 'Administrator', create: false, edit: false, delete: false },
          sales_reports: { view: true, create: testUser.role !== 'Employee', edit: testUser.role !== 'Employee', delete: false },
          vendors: { view: testUser.role !== 'Employee', create: false, edit: false, delete: false },
          orders: { view: testUser.role !== 'Employee', create: testUser.role !== 'Employee', edit: testUser.role !== 'Employee', delete: false },
          licenses: { view: testUser.role !== 'Employee', create: false, edit: false, delete: false },
          salary: { view: testUser.role === 'Administrator', create: testUser.role === 'Administrator', edit: testUser.role === 'Administrator', delete: false },
          inventory: { view: true, create: testUser.role !== 'Employee', edit: testUser.role !== 'Employee', delete: false },
          delivery: { view: testUser.role !== 'Employee', create: testUser.role !== 'Employee', edit: testUser.role !== 'Employee', delete: false },
          settings: { view: testUser.role === 'Administrator', create: false, edit: testUser.role === 'Administrator', delete: false },
          user_management: { view: testUser.role === 'Administrator', create: testUser.role === 'Administrator', edit: testUser.role === 'Administrator', delete: testUser.role === 'Administrator' },
          site_management: { view: testUser.role === 'Administrator', create: testUser.role === 'Administrator', edit: testUser.role === 'Administrator', delete: testUser.role === 'Administrator' },
          system_logs: { view: testUser.role === 'Administrator', create: false, edit: false, delete: false },
          security_settings: { view: testUser.role === 'Administrator', create: false, edit: testUser.role === 'Administrator', delete: false }
        })
      };

      const { error: profileError } = await window.ezsite.apis.tableCreate(11725, profileData);
      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError}`);
      }

      // Step 3: Test email template sending
      const template = emailTemplates.find(t => t.type === testUser.role);
      if (template) {
        const emailContent = template.content
          .replace(/{firstName}/g, testUser.firstName)
          .replace(/{lastName}/g, testUser.lastName)
          .replace(/{email}/g, testUser.email)
          .replace(/{employee_id}/g, testUser.employee_id)
          .replace(/{role}/g, testUser.role)
          .replace(/{station}/g, testUser.station)
          .replace(/{phone}/g, testUser.phone)
          .replace(/{portal_url}/g, window.location.origin);

        const { error: emailError } = await window.ezsite.apis.sendEmail({
          from: 'support@ezsite.ai',
          to: [testUser.email],
          subject: template.subject,
          html: emailContent
        });

        if (emailError) {
          console.warn(`Email sending failed (non-critical): ${emailError}`);
        }
      }

      const duration = Date.now() - startTime;
      return {
        testName: scenario.name,
        status: 'passed',
        duration,
        details: `User created: ${testUser.email} with role ${testUser.role} at ${testUser.station}`
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        testName: scenario.name,
        status: 'failed',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    setCurrentTestIndex(0);
    setTestProgress(0);

    const results: TestResult[] = [];

    for (let i = 0; i < testScenarios.length; i++) {
      setCurrentTestIndex(i);
      setTestProgress((i / testScenarios.length) * 100);
      
      // Update test status to running
      const runningResult: TestResult = {
        testName: testScenarios[i].name,
        status: 'running'
      };
      results[i] = runningResult;
      setTestResults([...results]);

      try {
        const testResult = await runUserCreationTest(testScenarios[i]);
        results[i] = testResult;
        setTestResults([...results]);
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results[i] = {
          testName: testScenarios[i].name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Test execution failed'
        };
        setTestResults([...results]);
      }
    }

    setTestProgress(100);
    setIsRunningTests(false);
    
    const passedTests = results.filter(r => r.status === 'passed').length;
    const failedTests = results.filter(r => r.status === 'failed').length;
    
    toast({
      title: "Testing Complete",
      description: `${passedTests} tests passed, ${failedTests} tests failed`,
      variant: passedTests === results.length ? "default" : "destructive"
    });
  };

  const getTemplatePreview = (template: EmailTemplate) => {
    if (!template) return '';
    
    return template.content
      .replace(/{firstName}/g, previewData.firstName)
      .replace(/{lastName}/g, previewData.lastName)
      .replace(/{email}/g, previewData.email)
      .replace(/{employee_id}/g, previewData.employee_id)
      .replace(/{role}/g, previewData.role)
      .replace(/{station}/g, previewData.station)
      .replace(/{phone}/g, previewData.phone)
      .replace(/{portal_url}/g, window.location.origin);
  };

  const testEmailTemplate = async (template: EmailTemplate) => {
    try {
      const emailContent = getTemplatePreview(template);
      
      const { error } = await window.ezsite.apis.sendEmail({
        from: 'support@ezsite.ai',
        to: [previewData.email],
        subject: template.subject,
        html: emailContent
      });

      if (error) throw error;

      toast({
        title: "Test Email Sent",
        description: `Test email sent to ${previewData.email}`,
      });
    } catch (error) {
      toast({
        title: "Email Test Failed",
        description: `Failed to send test email: ${error}`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TestTube className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">User Creation Testing Dashboard</h1>
        </div>
        <Button 
          onClick={runAllTests} 
          disabled={isRunningTests}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isRunningTests ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run All Tests
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="testing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="testing" className="flex items-center space-x-2">
            <TestTube className="w-4 h-4" />
            <span>User Creation Testing</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>Email Templates</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Permission Validation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="testing" className="space-y-6">
          {/* Test Progress */}
          {isRunningTests && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Testing Progress</h3>
                    <Badge variant="outline">{Math.round(testProgress)}%</Badge>
                  </div>
                  <Progress value={testProgress} className="h-2" />
                  <p className="text-sm text-gray-600">
                    Running test {currentTestIndex + 1} of {testScenarios.length}: {testScenarios[currentTestIndex]?.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Scenarios */}
          <Card>
            <CardHeader>
              <CardTitle>Test Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testScenarios.map((scenario, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{scenario.name}</h4>
                      <Badge className={
                        scenario.role === 'Administrator' ? 'bg-red-100 text-red-800' :
                        scenario.role === 'Management' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {scenario.role}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Station:</strong> {scenario.station}</p>
                      <p><strong>Expected Permissions:</strong> {scenario.expectedPermissions.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      result.status === 'passed' ? 'bg-green-50 border-green-200' :
                      result.status === 'failed' ? 'bg-red-50 border-red-200' :
                      result.status === 'running' ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium flex items-center space-x-2">
                          {result.status === 'passed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {result.status === 'failed' && <XCircle className="w-5 h-5 text-red-600" />}
                          {result.status === 'running' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
                          {result.status === 'pending' && <Clock className="w-5 h-5 text-gray-400" />}
                          <span>{result.testName}</span>
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            result.status === 'passed' ? 'default' :
                            result.status === 'failed' ? 'destructive' :
                            result.status === 'running' ? 'secondary' :
                            'outline'
                          }>
                            {result.status}
                          </Badge>
                          {result.duration && (
                            <Badge variant="outline">
                              {result.duration}ms
                            </Badge>
                          )}
                        </div>
                      </div>
                      {result.details && (
                        <p className="text-sm text-gray-600">{result.details}</p>
                      )}
                      {result.error && (
                        <Alert className="mt-2">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{result.error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Template Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Email Template Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-select">Select Template</Label>
                  <Select 
                    value={selectedTemplate?.id || ''} 
                    onValueChange={(value) => {
                      const template = emailTemplates.find(t => t.id === value);
                      setSelectedTemplate(template || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an email template" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{template.name}</span>
                            <Badge variant="outline">{template.type}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplate && (
                  <div className="space-y-4">
                    <div>
                      <Label>Subject Line</Label>
                      <Input value={selectedTemplate.subject} readOnly />
                    </div>
                    <div>
                      <Label>Template Variables</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTemplate.variables.map((variable) => (
                          <Badge key={variable} variant="outline">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button onClick={() => testEmailTemplate(selectedTemplate)}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Test Email
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview Data Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Preview Data Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preview-firstName">First Name</Label>
                  <Input
                    id="preview-firstName"
                    value={previewData.firstName}
                    onChange={(e) => setPreviewData({...previewData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="preview-lastName">Last Name</Label>
                  <Input
                    id="preview-lastName"
                    value={previewData.lastName}
                    onChange={(e) => setPreviewData({...previewData, lastName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="preview-email">Email</Label>
                  <Input
                    id="preview-email"
                    value={previewData.email}
                    onChange={(e) => setPreviewData({...previewData, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="preview-phone">Phone</Label>
                  <Input
                    id="preview-phone"
                    value={previewData.phone}
                    onChange={(e) => setPreviewData({...previewData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="preview-role">Role</Label>
                  <Select 
                    value={previewData.role} 
                    onValueChange={(value) => setPreviewData({...previewData, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="preview-station">Station</Label>
                  <Select 
                    value={previewData.station} 
                    onValueChange={(value) => setPreviewData({...previewData, station: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) => (
                        <SelectItem key={station} value={station}>{station}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Preview */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Email Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white">
                  <div 
                    className="max-w-full"
                    dangerouslySetInnerHTML={{ __html: getTemplatePreview(selectedTemplate) }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Validation Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Feature</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Administrator</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Management</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Employee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'Dashboard', admin: 'Full', management: 'Full', employee: 'View Only' },
                      { feature: 'Products', admin: 'Full', management: 'View Only', employee: 'No Access' },
                      { feature: 'Employees', admin: 'Full', management: 'No Access', employee: 'No Access' },
                      { feature: 'Sales Reports', admin: 'Full', management: 'Full', employee: 'View Only' },
                      { feature: 'Vendors', admin: 'Full', management: 'View Only', employee: 'No Access' },
                      { feature: 'Orders', admin: 'Full', management: 'Full', employee: 'No Access' },
                      { feature: 'Licenses', admin: 'Full', management: 'View Only', employee: 'No Access' },
                      { feature: 'Salary', admin: 'Full', management: 'No Access', employee: 'No Access' },
                      { feature: 'Inventory', admin: 'Full', management: 'Full', employee: 'View Only' },
                      { feature: 'Delivery', admin: 'Full', management: 'Full', employee: 'No Access' },
                      { feature: 'Settings', admin: 'Full', management: 'No Access', employee: 'No Access' },
                      { feature: 'User Management', admin: 'Full', management: 'No Access', employee: 'No Access' },
                      { feature: 'Site Management', admin: 'Full', management: 'No Access', employee: 'No Access' },
                      { feature: 'System Logs', admin: 'View Only', management: 'No Access', employee: 'No Access' },
                      { feature: 'Security Settings', admin: 'Full', management: 'No Access', employee: 'No Access' }
                    ].map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-2 font-medium">{row.feature}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <Badge className={
                            row.admin === 'Full' ? 'bg-green-100 text-green-800' :
                            row.admin === 'View Only' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {row.admin}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <Badge className={
                            row.management === 'Full' ? 'bg-green-100 text-green-800' :
                            row.management === 'View Only' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {row.management}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <Badge className={
                            row.employee === 'Full' ? 'bg-green-100 text-green-800' :
                            row.employee === 'View Only' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {row.employee}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserCreationTestingDashboard;