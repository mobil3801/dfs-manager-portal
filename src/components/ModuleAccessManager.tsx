import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useModuleAccess } from '@/contexts/ModuleAccessContext';
import { Loader2, Shield, Edit, Plus, Trash2 } from 'lucide-react';

const ModuleAccessManager: React.FC = () => {
  const { moduleAccess, loading, error, updateModuleAccess } = useModuleAccess();

  const handleToggle = async (moduleId: number, field: string, value: boolean) => {
    await updateModuleAccess(moduleId, { [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading module access settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-5 w-5 text-blue-600" />
        <h2 className="text-2xl font-bold">Module Access Control</h2>
      </div>
      
      <p className="text-gray-600">
        Control which CRUD operations are available for each module. When disabled, users won't see the corresponding action buttons.
      </p>

      <div className="grid gap-4">
        {moduleAccess.map((module) => (
          <Card key={module.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{module.display_name}</span>
                <Badge variant="outline">{module.module_name}</Badge>
              </CardTitle>
              <CardDescription>
                Control access to {module.display_name} module operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Plus className="h-4 w-4 text-green-600" />
                    <Label htmlFor={`create-${module.id}`} className="text-sm font-medium">
                      Create Access
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`create-${module.id}`}
                      checked={module.create_enabled}
                      onCheckedChange={(checked) => 
                        handleToggle(module.id, 'create_enabled', checked)
                      }
                    />
                    <span className="text-sm text-gray-600">
                      {module.create_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Edit className="h-4 w-4 text-blue-600" />
                    <Label htmlFor={`edit-${module.id}`} className="text-sm font-medium">
                      Edit Access
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`edit-${module.id}`}
                      checked={module.edit_enabled}
                      onCheckedChange={(checked) => 
                        handleToggle(module.id, 'edit_enabled', checked)
                      }
                    />
                    <span className="text-sm text-gray-600">
                      {module.edit_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Trash2 className="h-4 w-4 text-red-600" />
                    <Label htmlFor={`delete-${module.id}`} className="text-sm font-medium">
                      Delete Access
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`delete-${module.id}`}
                      checked={module.delete_enabled}
                      onCheckedChange={(checked) => 
                        handleToggle(module.id, 'delete_enabled', checked)
                      }
                    />
                    <span className="text-sm text-gray-600">
                      {module.delete_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex flex-wrap gap-2">
                <Badge variant={module.create_enabled ? 'default' : 'secondary'}>
                  Create: {module.create_enabled ? 'ON' : 'OFF'}
                </Badge>
                <Badge variant={module.edit_enabled ? 'default' : 'secondary'}>
                  Edit: {module.edit_enabled ? 'ON' : 'OFF'}
                </Badge>
                <Badge variant={module.delete_enabled ? 'default' : 'secondary'}>
                  Delete: {module.delete_enabled ? 'ON' : 'OFF'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModuleAccessManager;
