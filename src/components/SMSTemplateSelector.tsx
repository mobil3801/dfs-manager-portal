import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileText, Copy, CheckCircle } from 'lucide-react';

interface SMSTemplate {
  id: number;
  template_name: string;
  template_type: string;
  message_content: string;
  is_active: boolean;
  priority_level: string;
  character_count: number;
}

interface SMSTemplateSelectorProps {
  onTemplateSelect: (message: string) => void;
}

const SMSTemplateSelector: React.FC<SMSTemplateSelectorProps> = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage('12641', {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'template_name',
        IsAsc: true,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      });

      if (error) throw error;
      setTemplates(data?.List || []);
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

  const useTemplate = (templateId: string) => {
    const template = templates.find(t => t.id.toString() === templateId);
    if (template) {
      // Remove placeholders for preview
      let message = template.message_content;
      message = message.replace(/\{[^}]+\}/g, '[PLACEHOLDER]');
      
      onTemplateSelect(template.message_content);
      toast({
        title: "Template Applied",
        description: `Applied template: ${template.template_name}`
      });
    }
  };

  const quickTemplates = [
    {
      name: 'Business Hours',
      message: 'Hello! Our business hours are Monday-Friday 8AM-6PM, Saturday 9AM-4PM. We are closed on Sundays. Thank you!'
    },
    {
      name: 'Emergency Contact',
      message: 'This is an urgent message from DFS Manager. Please contact us immediately at [PHONE]. Thank you.'
    },
    {
      name: 'Payment Reminder',
      message: 'Reminder: Your payment is due soon. Please contact us to arrange payment. Thank you for your business!'
    },
    {
      name: 'Service Update',
      message: 'Service Update: We are currently experiencing [ISSUE]. We apologize for any inconvenience and are working to resolve this quickly.'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Message Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Saved Templates */}
        {templates.length > 0 && (
          <div className="space-y-2">
            <Label>Saved Templates</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a saved template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{template.template_name}</span>
                      <div className="flex items-center space-x-1 ml-2">
                        <Badge variant="outline" className="text-xs">
                          {template.template_type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {template.character_count} chars
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <Button 
                onClick={() => useTemplate(selectedTemplate)}
                size="sm"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Use Selected Template
              </Button>
            )}
          </div>
        )}

        {/* Quick Templates */}
        <div className="space-y-2">
          <Label>Quick Templates</Label>
          <div className="grid grid-cols-1 gap-2">
            {quickTemplates.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onTemplateSelect(template.message)}
                className="justify-start text-left h-auto p-3"
              >
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-xs">
                      {template.message.substring(0, 50)}...
                    </div>
                  </div>
                  <Copy className="w-4 h-4 flex-shrink-0" />
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-3">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Templates help ensure consistent messaging</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SMSTemplateSelector;