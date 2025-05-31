import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Settings, Unlock, Lock, X, RotateCcw, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVisualEdit } from '@/contexts/VisualEditContext';

interface VisualEditBannerProps {
  onEditModeChange?: (isEnabled: boolean) => void;
}

const VisualEditBanner: React.FC<VisualEditBannerProps> = ({ onEditModeChange }) => {
  const { isEditModeEnabled, setEditModeEnabled } = useVisualEdit();
  const { toast } = useToast();

  useEffect(() => {
    onEditModeChange?.(isEditModeEnabled);
  }, [onEditModeChange, isEditModeEnabled]);

  const toggleEditMode = () => {
    const newMode = !isEditModeEnabled;
    setEditModeEnabled(newMode);

    toast({
      title: newMode ? "Visual Edit Mode Enabled" : "Visual Edit Mode Disabled",
      description: newMode ?
      "Visual editing tools and AI assistance are available." :
      "Visual editing tools are hidden, but manual editing is still enabled.",
      duration: 3000
    });
  };

  const resetToDefaults = () => {
    setEditModeEnabled(true);
    toast({
      title: "Settings Reset",
      description: "Visual editing preferences have been reset to defaults.",
      duration: 2000
    });
  };

  return (
    <Card className={`transition-all duration-300 ${
    isEditModeEnabled ?
    'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
    'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'}`
    }>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isEditModeEnabled ?
            'bg-green-100' :
            'bg-blue-100'}`
            }>
              {isEditModeEnabled ?
              <Edit className="w-5 h-5 text-green-600" /> :

              <Settings className="w-5 h-5 text-blue-600" />
              }
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
              isEditModeEnabled ? 'text-green-900' : 'text-blue-900'}`
              }>
                {isEditModeEnabled ? 'Visual Editing Mode Enabled' : 'Standard Editing Mode'}
              </h3>
              <p className={`text-sm ${
              isEditModeEnabled ? 'text-green-700' : 'text-blue-700'}`
              }>
                {isEditModeEnabled ?
                'Visual editing tools and AI assistance are available' :
                'Standard manual editing is active'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isEditModeEnabled ?
            <>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Edit className="w-3 h-3 mr-1" />
                  Full Access
                </Badge>
                <Badge variant="outline" className="border-green-300 text-green-700">
                  <Eye className="w-3 h-3 mr-1" />
                  Live Preview
                </Badge>
                <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                  <Settings className="w-3 h-3 mr-1" />
                  Admin Mode
                </Badge>
              </> :

            <>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Settings className="w-3 h-3 mr-1" />
                  Standard
                </Badge>
                <Badge variant="outline" className="border-blue-300 text-blue-700">
                  <Edit className="w-3 h-3 mr-1" />
                  Manual Edit
                </Badge>
              </>
            }
            
            <div className="flex items-center space-x-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleEditMode}
                className={`h-8 px-3 ${
                isEditModeEnabled ?
                'text-green-700 hover:bg-green-100' :
                'text-blue-700 hover:bg-blue-100'}`
                }
                title={isEditModeEnabled ? 'Switch to standard mode' : 'Enable visual editing'}>

                {isEditModeEnabled ? <Settings className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToDefaults}
                className="h-8 px-3 text-gray-600 hover:bg-gray-100"
                title="Reset settings">

                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>);

};

export default VisualEditBanner;