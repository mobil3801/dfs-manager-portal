import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Settings, Unlock, Lock, X, RotateCcw, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VisualEditBannerProps {
  onEditModeChange?: (isEnabled: boolean) => void;
}

const VisualEditBanner: React.FC<VisualEditBannerProps> = ({ onEditModeChange }) => {
  const [editMode, setEditMode] = useState(() => {
    return localStorage.getItem('visualEditMode') === 'true';
  });
  const [showBanner, setShowBanner] = useState(() => {
    return localStorage.getItem('showVisualEditBanner') !== 'false';
  });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('visualEditMode', editMode.toString());
    localStorage.setItem('showVisualEditBanner', showBanner.toString());
    onEditModeChange?.(editMode);
  }, [editMode, showBanner, onEditModeChange]);

  const toggleEditMode = () => {
    const newMode = !editMode;
    setEditMode(newMode);

    toast({
      title: newMode ? "Visual Edit Mode Enabled" : "Visual Edit Mode Disabled",
      description: newMode ?
      "You can now make changes through AI assistance and visual editing tools." :
      "Manual editing has been restricted. Use AI assistance to modify content.",
      duration: 3000
    });
  };

  const resetToDefaults = () => {
    setEditMode(true);
    setShowBanner(true);
    toast({
      title: "Settings Reset",
      description: "Visual editing preferences have been reset to defaults.",
      duration: 2000
    });
  };

  const hideBanner = () => {
    setShowBanner(false);
    toast({
      title: "Banner Hidden",
      description: "You can re-enable the banner from the settings menu.",
      duration: 2000
    });
  };

  if (!showBanner) {
    return null;
  }

  return (
    <Card className={`transition-all duration-300 ${
    editMode ?
    'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
    'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'}`
    }>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            editMode ?
            'bg-green-100' :
            'bg-orange-100'}`
            }>
              {editMode ?
              <Unlock className="w-5 h-5 text-green-600" /> :

              <Lock className="w-5 h-5 text-orange-600" />
              }
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
              editMode ? 'text-green-900' : 'text-orange-900'}`
              }>
                {editMode ? 'Visual Editing Mode Enabled' : 'Manual Editing Restricted'}
              </h3>
              <p className={`text-sm ${
              editMode ? 'text-green-700' : 'text-orange-700'}`
              }>
                {editMode ?
                'All features are unlocked for full editing access' :
                'Manual modifications blocked - use AI assistance for changes'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {editMode ?
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
                <Badge variant="destructive" className="bg-orange-100 text-orange-800">
                  <Lock className="w-3 h-3 mr-1" />
                  Restricted
                </Badge>
                <Badge variant="outline" className="border-orange-300 text-orange-700">
                  <Settings className="w-3 h-3 mr-1" />
                  AI Only
                </Badge>
              </>
            }
            
            <div className="flex items-center space-x-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleEditMode}
                className={`h-8 px-3 ${
                editMode ?
                'text-green-700 hover:bg-green-100' :
                'text-orange-700 hover:bg-orange-100'}`
                }
                title={editMode ? 'Disable editing' : 'Enable editing'}>

                {editMode ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToDefaults}
                className="h-8 px-3 text-gray-600 hover:bg-gray-100"
                title="Reset settings">

                <RotateCcw className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={hideBanner}
                className="h-8 px-3 text-gray-600 hover:bg-gray-100"
                title="Hide banner">

                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>);

};

export default VisualEditBanner;