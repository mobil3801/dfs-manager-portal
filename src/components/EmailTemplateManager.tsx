import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Send, 
  Copy, 
  Save, 
  FileText,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

interface EmailVariable {
  name: string;
  description: string;
  example: string;
}

const EmailTemplateManager: React.FC = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<EmailTemplate>>({});
  const [previewData, setPreviewData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    employee_id: 'EMP-123456',
    role: 'Employee',
    station: 'MOBIL',
    phone: '(555) 123-4567',
    portal_url: window.location.origin
  });

  // Available email variables with descriptions
  const availableVariables: EmailVariable[] = [
    { name: 'firstName', description: 'User first name', example: 'John' },
    { name: 'lastName', description: 'User last name', example: 'Doe' },
    { name: 'email', description: 'User email address', example: 'john.doe@example.com' },
    { name: 'employee_id', description: 'Employee ID', example: 'EMP-123456' },
    { name: 'role', description: 'User role', example: 'Administrator' },
    { name: 'station', description: 'Assigned station', example: 'MOBIL' },
    { name: 'phone', description: 'Phone number', example: '(555) 123-4567' },
    { name: 'portal_url', description: 'Portal access URL', example: window.location.origin },
    { name: 'password', description: 'Temporary password', example: 'TempPass123!' },
    { name: 'hire_date', description: 'Employee hire date', example: '2024-01-15' },
    { name: 'company_name', description: 'Company name', example: 'DFS Manager Portal' },
    { name: 'support_email', description: 'Support contact email', example: 'support@ezsite.ai' }
  ];

  const templateTypes = ['Administrator', 'Management', 'Employee', 'Welcome', 'Password Reset', 'System Alert'];

  useEffect(() => {
    initializeTemplates();
  }, []);

  const initializeTemplates = () => {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: 'admin_welcome',
        name: 'Administrator Welcome Email',
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
    </table>
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
    <a href="{portal_url}" style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Access Portal</a>
  </div>

  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
    <p>Best regards,<br>DFS Manager Portal Team</p>
  </div>
</div>`,
        variables: ['firstName', 'lastName', 'email', 'employee_id', 'role', 'station', 'portal_url'],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'management_welcome',
        name: 'Management Welcome Email',
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
    </table>
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
    <a href="{portal_url}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Access Portal</a>
  </div>

  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
    <p>Best regards,<br>DFS Manager Portal Team</p>
  </div>
</div>`,
        variables: ['firstName', 'lastName', 'email', 'employee_id', 'role', 'station', 'portal_url'],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'employee_welcome',
        name: 'Employee Welcome Email',
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
    </table>
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
    <a href="{portal_url}" style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Access Portal</a>
  </div>

  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
    <p>Best regards,<br>DFS Manager Portal Team</p>
  </div>
</div>`,
        variables: ['firstName', 'lastName', 'email', 'employee_id', 'role', 'station', 'portal_url'],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'password_reset',
        name: 'Password Reset Email',
        type: 'Password Reset',
        subject: 'DFS Manager Portal - Password Reset Request',
        content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #f59e0b; margin: 0;">DFS Manager Portal</h1>
    <h2 style="color: #374151; margin-top: 10px;">Password Reset Request</h2>
  </div>
  
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
    <h3 style="margin: 0 0 10px 0;">Password Reset Requested</h3>
    <p style="margin: 0; opacity: 0.9;">We received a request to reset your password for {email}</p>
  </div>

  <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
    <h4 style="color: #92400e; margin-top: 0;">Security Information:</h4>
    <ul style="color: #92400e; margin-bottom: 0; padding-left: 20px;">
      <li>If you didn't request this reset, you can safely ignore this email</li>
      <li>This link will expire in 24 hours for security</li>
      <li>You can only use this link once</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="{portal_url}/resetpassword?token={reset_token}" style="background-color: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password</a>
  </div>

  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
    <p>If you have questions, contact support at {support_email}</p>
    <p>Best regards,<br>DFS Manager Portal Team</p>
  </div>
</div>`,
        variables: ['email', 'portal_url', 'reset_token', 'support_email'],
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    setTemplates(defaultTemplates);
    setSelectedTemplate(defaultTemplates[0]);
  };

  const handleCreateTemplate = () => {
    setEditingTemplate({
      name: '',
      type: 'Employee',
      subject: '',
      content: '',
      variables: [],
      isActive: true
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate.name || !editingTemplate.subject || !editingTemplate.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const extractedVariables = extractVariablesFromContent(editingTemplate.content || '');
    const newTemplate: EmailTemplate = {
      id: editingTemplate.id || generateTemplateId(),
      name: editingTemplate.name!,
      type: editingTemplate.type!,
      subject: editingTemplate.subject!,
      content: editingTemplate.content!,
      variables: extractedVariables,
      isActive: editingTemplate.isActive !== false,
      createdAt: editingTemplate.createdAt || new Date().toISOString()
    };

    if (editingTemplate.id) {
      // Update existing template
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? newTemplate : t));
      toast({
        title: "Success",
        description: "Template updated successfully"
      });
    } else {
      // Create new template
      setTemplates(prev => [...prev, newTemplate]);
      toast({
        title: "Success",
        description: "Template created successfully"
      });
    }

    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingTemplate({});
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(templates[0] || null);
      }
      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
    }
  };

  const extractVariablesFromContent = (content: string): string[] => {
    const regex = /{(\w+)}/g;
    const matches = content.match(regex);
    if (!matches) return [];
    
    return [...new Set(matches.map(match => match.slice(1, -1)))];
  };

  const generateTemplateId = (): string => {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = editingTemplate.content || '';
      const newContent = currentContent.substring(0, start) + `{${variable}}` + currentContent.substring(end);
      
      setEditingTemplate(prev => ({ ...prev, content: newContent }));
      
      // Reset cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variable.length + 2;
        textarea.focus();
      }, 0);
    }
  };

  const getTemplatePreview = (template: EmailTemplate) => {
    if (!template) return '';
    
    let preview = template.content;
    Object.entries(previewData).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      preview = preview.replace(regex, value);
    });
    
    return preview;
  };

  const sendTestEmail = async (template: EmailTemplate) => {
    try {
      const emailContent = getTemplatePreview(template);
      
      const { error } = await window.ezsite.apis.sendEmail({
        from: 'support@ezsite.ai',
        to: [previewData.email],
        subject: template.subject,
        html: emailContent
      });

      if (error) throw error;

      // Update last used timestamp
      setTemplates(prev => prev.map(t => 
        t.id === template.id 
          ? { ...t, lastUsed: new Date().toISOString() }
          : t
      ));

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

  const copyTemplateContent = (template: EmailTemplate) => {
    navigator.clipboard.writeText(template.content).then(() => {
      toast({
        title: "Content Copied",
        description: "Template content copied to clipboard"
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Mail className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Email Template Manager</h1>
        </div>
        <Button onClick={handleCreateTemplate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Templates ({templates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    <Badge variant={template.isActive ? 'default' : 'secondary'}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {template.type}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTemplate(template);
                        }}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {template.lastUsed && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last used: {new Date(template.lastUsed).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Template Details and Preview */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTemplate && (
            <>
              {/* Template Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedTemplate.name}</span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyTemplateContent(selectedTemplate)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendTestEmail(selectedTemplate)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Test Send
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditTemplate(selectedTemplate)}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Template Type</Label>
                        <Badge className="mt-1">{selectedTemplate.type}</Badge>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Badge 
                          variant={selectedTemplate.isActive ? 'default' : 'secondary'}
                          className="mt-1"
                        >
                          {selectedTemplate.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Subject</Label>
                      <Input value={selectedTemplate.subject} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label>Variables ({selectedTemplate.variables.length})</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedTemplate.variables.map((variable) => (
                          <Badge key={variable} variant="outline">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Data Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="preview-role">Role</Label>
                      <Select 
                        value={previewData.role} 
                        onValueChange={(value) => setPreviewData({...previewData, role: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {templateTypes.slice(0, 3).map((role) => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>Email Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                    <div 
                      className="max-w-full"
                      dangerouslySetInnerHTML={{ __html: getTemplatePreview(selectedTemplate) }}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Template Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingTemplate({});
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen ? 'Create New Template' : 'Edit Template'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template Form */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Template Name *</Label>
                  <Input
                    id="template-name"
                    value={editingTemplate.name || ''}
                    onChange={(e) => setEditingTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="template-type">Template Type *</Label>
                  <Select
                    value={editingTemplate.type || ''}
                    onValueChange={(value) => setEditingTemplate(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="template-subject">Subject *</Label>
                <Input
                  id="template-subject"
                  value={editingTemplate.subject || ''}
                  onChange={(e) => setEditingTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter email subject"
                />
              </div>
              
              <div>
                <Label htmlFor="template-content">Email Content (HTML) *</Label>
                <Textarea
                  id="template-content"
                  value={editingTemplate.content || ''}
                  onChange={(e) => setEditingTemplate(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter HTML email content"
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="template-active"
                  checked={editingTemplate.isActive !== false}
                  onChange={(e) => setEditingTemplate(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <Label htmlFor="template-active">Template is active</Label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setEditingTemplate({});
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </div>

            {/* Available Variables */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Available Variables</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableVariables.map((variable) => (
                    <div key={variable.name} className="p-2 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer"
                          onClick={() => insertVariable(variable.name)}
                        >
                          {variable.name}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => insertVariable(variable.name)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600">{variable.description}</p>
                      <p className="text-xs text-gray-500 italic">Ex: {variable.example}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Click on variable badges or use the + button to insert them into your template content.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplateManager;