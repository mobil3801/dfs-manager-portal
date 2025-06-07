import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Save,
  AlertTriangle,
  Hash,
  Type
} from 'lucide-react';

interface SMSTemplate {
  id: number;
  template_name: string;
  template_type: string;
  message_content: string;
  is_active: boolean;
  priority_level: string;
  character_count: number;
  created_by: number;
  variables?: string;
  usage_count?: number;
  last_used?: string;
}

const SMSTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SMSTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<SMSTemplate | null>(null);
  const { toast } = useToast();

  const [newTemplate, setNewTemplate] = useState({
    template_name: '',
    template_type: 'License Expiry',
    message_content: '',
    is_active: true,
    priority_level: 'Medium',
    variables: 'license_name,station,expiry_date,days_remaining'
  });

  const templateTypes = [
    'License Expiry',
    'Inventory Alert',
    'System Notification',
    'Employee Alert',
    'Custom'
  ];

  const priorityLevels = ['Low', 'Medium', 'High', 'Critical'];

  const defaultTemplates = {
    'License Expiry': 'ALERT: License \'{license_name}\' for {station} expires on {expiry_date}. Only {days_remaining} days remaining. Please renew immediately.',
    'Inventory Alert': 'INVENTORY ALERT: {product_name} at {station} is running low. Current stock: {current_stock}. Please reorder soon.',
    'System Notification': 'SYSTEM: {notification_message} - {timestamp}',
    'Employee Alert': 'EMPLOYEE ALERT: {message} for {employee_name} at {station}. Please take appropriate action.',
    'Custom': 'Your custom message here...'
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage('12641', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;
      setTemplates(data.List || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load SMS templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    try {
      const characterCount = newTemplate.message_content.length;
      
      const { error } = await window.ezsite.apis.tableCreate('12641', {
        ...newTemplate,
        character_count: characterCount,
        created_by: 1 // This should be the current user ID
      });

      if (error) throw error;

      toast({
        title: "✅ Template Created",
        description: `SMS template "${newTemplate.template_name}" has been created successfully.`
      });

      setShowCreateDialog(false);
      setNewTemplate({
        template_name: '',
        template_type: 'License Expiry',
        message_content: '',
        is_active: true,
        priority_level: 'Medium',
        variables: 'license_name,station,expiry_date,days_remaining'
      });
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create SMS template",
        variant: "destructive"
      });
    }
  };

  const updateTemplate = async (template: SMSTemplate) => {
    try {
      const characterCount = template.message_content.length;
      
      const { error } = await window.ezsite.apis.tableUpdate('12641', {
        ID: template.id,
        template_name: template.template_name,
        template_type: template.template_type,
        message_content: template.message_content,
        is_active: template.is_active,
        priority_level: template.priority_level,
        character_count: characterCount
      });

      if (error) throw error;

      toast({
        title: "✅ Template Updated",
        description: `SMS template "${template.template_name}" has been updated successfully.`
      });

      setEditingTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "Failed to update SMS template",
        variant: "destructive"
      });
    }
  };

  const deleteTemplate = async (template: SMSTemplate) => {
    if (!confirm(`Are you sure you want to delete the template "${template.template_name}"?`)) {
      return;
    }

    try {
      const { error } = await window.ezsite.apis.tableDelete('12641', {
        ID: template.id
      });

      if (error) throw error;

      toast({
        title: "Template Deleted",
        description: `Template "${template.template_name}" has been deleted.`
      });

      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  const duplicateTemplate = async (template: SMSTemplate) => {
    try {
      const { error } = await window.ezsite.apis.tableCreate('12641', {
        template_name: `${template.template_name} (Copy)`,
        template_type: template.template_type,
        message_content: template.message_content,
        is_active: false, // Start as inactive
        priority_level: template.priority_level,
        character_count: template.character_count,
        created_by: 1
      });

      if (error) throw error;

      toast({
        title: "✅ Template Duplicated",
        description: `Template "${template.template_name}" has been duplicated.`
      });

      loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive"
      });
    }
  };

  const toggleTemplateStatus = async (template: SMSTemplate) => {
    try {
      const { error } = await window.ezsite.apis.tableUpdate('12641', {
        ID: template.id,
        is_active: !template.is_active
      });

      if (error) throw error;

      toast({
        title: template.is_active ? "Template Deactivated" : "Template Activated",
        description: `Template "${template.template_name}" has been ${template.is_active ? 'deactivated' : 'activated'}.`
      });

      loadTemplates();
    } catch (error) {
      console.error('Error toggling template status:', error);
      toast({
        title: "Error",
        description: "Failed to update template status",
        variant: "destructive"
      });
    }
  };

  const previewMessage = (template: SMSTemplate) => {
    setPreviewTemplate(template);
    setShowPreviewDialog(true);
  };

  const generatePreview = (template: SMSTemplate) => {
    let preview = template.message_content;
    
    // Replace variables with sample data
    const sampleData = {
      license_name: 'Business Operating License',
      station: 'MOBIL',
      expiry_date: '2024-02-15',
      days_remaining: '7',
      product_name: 'Premium Gasoline',
      current_stock: '150',
      notification_message: 'System maintenance scheduled',
      timestamp: new Date().toLocaleString(),
      employee_name: 'John Smith',
      message: 'Shift schedule updated'
    };
    
    Object.entries(sampleData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    
    return preview;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      'Low': 'bg-gray-100 text-gray-800',
      'Medium': 'bg-blue-100 text-blue-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {priority}
      </Badge>
    );
  };

  const getCharacterCountColor = (count: number) => {
    if (count <= 160) return 'text-green-600';
    if (count <= 320) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <MessageSquare className="w-6 h-6 mr-2" />
            SMS Template Manager
          </h2>
          <p className="text-gray-600">Create and manage SMS message templates for automated alerts</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create SMS Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.template_name}
                    onChange={(e) => setNewTemplate({...newTemplate, template_name: e.target.value})}
                    placeholder="e.g., License Expiry Alert"
                  />
                </div>
                
                <div>
                  <Label htmlFor="template-type">Template Type</Label>
                  <Select 
                    value={newTemplate.template_type} 
                    onValueChange={(value) => {
                      setNewTemplate({
                        ...newTemplate, 
                        template_type: value,
                        message_content: defaultTemplates[value as keyof typeof defaultTemplates] || ''
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={newTemplate.priority_level} onValueChange={(value) => setNewTemplate({...newTemplate, priority_level: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="message-content">Message Content</Label>
                <Textarea
                  id="message-content"
                  value={newTemplate.message_content}
                  onChange={(e) => setNewTemplate({...newTemplate, message_content: e.target.value})}
                  placeholder="Enter your SMS message template..."
                  rows={4}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    Available variables: {license_name}, {station}, {expiry_date}, {days_remaining}
                  </p>
                  <span className={`text-sm ${getCharacterCountColor(newTemplate.message_content.length)}`}>
                    {newTemplate.message_content.length}/160 characters
                  </span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="variables">Template Variables</Label>
                <Input
                  id="variables"
                  value={newTemplate.variables}
                  onChange={(e) => setNewTemplate({...newTemplate, variables: e.target.value})}
                  placeholder="Comma-separated list of variables"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newTemplate.is_active}
                  onCheckedChange={(checked) => setNewTemplate({...newTemplate, is_active: checked})}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              
              {newTemplate.message_content && (
                <div className="border-t pt-4">
                  <Label>Preview</Label>
                  <div className="bg-gray-50 p-3 rounded border text-sm">
                    {generatePreview({ ...newTemplate, id: 0, character_count: 0, created_by: 0 })}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button
                  onClick={createTemplate}
                  disabled={!newTemplate.template_name || !newTemplate.message_content}
                  className="flex-1"
                >
                  Create Template
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">Loading templates...</div>
            </CardContent>
          </Card>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
                <p className="text-gray-500">Create your first SMS template to get started.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-medium">{template.template_name}</h3>
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{template.template_type}</Badge>
                      {getPriorityBadge(template.priority_level)}
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <p className="text-sm text-gray-700 font-mono">{template.message_content}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Hash className="w-4 h-4 mr-1" />
                        {template.character_count} characters
                      </span>
                      <span className="flex items-center">
                        <Type className="w-4 h-4 mr-1" />
                        {template.template_type}
                      </span>
                      {template.character_count > 160 && (
                        <span className="flex items-center text-orange-600">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Multiple SMS segments
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => previewMessage(template)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicateTemplate(template)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleTemplateStatus(template)}
                    >
                      {template.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTemplate(template)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Template Dialog */}
      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit SMS Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-template-name">Template Name</Label>
                  <Input
                    id="edit-template-name"
                    value={editingTemplate.template_name}
                    onChange={(e) => setEditingTemplate({...editingTemplate, template_name: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-template-type">Template Type</Label>
                  <Select 
                    value={editingTemplate.template_type} 
                    onValueChange={(value) => setEditingTemplate({...editingTemplate, template_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                <Label htmlFor="edit-priority">Priority Level</Label>
                <Select value={editingTemplate.priority_level} onValueChange={(value) => setEditingTemplate({...editingTemplate, priority_level: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-message-content">Message Content</Label>
                <Textarea
                  id="edit-message-content"
                  value={editingTemplate.message_content}
                  onChange={(e) => setEditingTemplate({...editingTemplate, message_content: e.target.value})}
                  rows={4}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    Available variables: {license_name}, {station}, {expiry_date}, {days_remaining}
                  </p>
                  <span className={`text-sm ${getCharacterCountColor(editingTemplate.message_content.length)}`}>
                    {editingTemplate.message_content.length}/160 characters
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={editingTemplate.is_active}
                  onCheckedChange={(checked) => setEditingTemplate({...editingTemplate, is_active: checked})}
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
              
              {editingTemplate.message_content && (
                <div className="border-t pt-4">
                  <Label>Preview</Label>
                  <div className="bg-gray-50 p-3 rounded border text-sm">
                    {generatePreview(editingTemplate)}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => updateTemplate(editingTemplate)}
                  disabled={!editingTemplate.template_name || !editingTemplate.message_content}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Dialog */}
      {previewTemplate && (
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Template Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium">{previewTemplate.template_name}</p>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm">{generatePreview(previewTemplate)}</p>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                <p>Character Count: {previewTemplate.character_count}</p>
                <p>SMS Segments: {Math.ceil(previewTemplate.character_count / 160)}</p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setShowPreviewDialog(false)}
              >
                Close Preview
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{templates.length}</div>
              <p className="text-sm text-gray-600">Total Templates</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Type className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{templates.filter(t => t.is_active).length}</div>
              <p className="text-sm text-gray-600">Active Templates</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {templates.filter(t => t.template_type === 'License Expiry').length}
              </div>
              <p className="text-sm text-gray-600">License Templates</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Hash className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {Math.round(templates.reduce((sum, t) => sum + t.character_count, 0) / templates.length) || 0}
              </div>
              <p className="text-sm text-gray-600">Avg. Characters</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SMSTemplateManager;
