import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Settings, Unlock } from 'lucide-react';

const VisualEditBanner: React.FC = () => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Unlock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                Visual Editing Mode Enabled
              </h3>
              <p className="text-sm text-blue-700">
                All features are unlocked for full editing access
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Edit className="w-3 h-3 mr-1" />
              Full Access
            </Badge>
            <Badge variant="outline" className="border-blue-300 text-blue-700">
              <Eye className="w-3 h-3 mr-1" />
              Live Preview
            </Badge>
            <Badge variant="outline" className="border-indigo-300 text-indigo-700">
              <Settings className="w-3 h-3 mr-1" />
              Admin Mode
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>);

};

export default VisualEditBanner;