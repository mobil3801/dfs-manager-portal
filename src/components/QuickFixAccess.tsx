import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink } from 'lucide-react';

const QuickFixAccess: React.FC = () => {
  const goToFix = () => {
    window.location.href = '/emergency-fix';
  };

  const goToAdminFix = () => {
    window.location.href = '/admin-fix';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="border-red-500 bg-red-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="font-medium text-red-800">Critical Errors Detected</p>
          </div>
          <div className="space-y-2">
            <Button 
              onClick={goToFix}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Emergency Fix
            </Button>
            <Button 
              onClick={goToAdminFix}
              variant="outline"
              size="sm"
              className="w-full border-red-300 text-red-700 hover:bg-red-50"
            >
              Direct Admin Fix
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickFixAccess;