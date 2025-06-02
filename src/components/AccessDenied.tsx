import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccessDeniedProps {
  feature?: string;
  requiredRole?: string;
  showBackButton?: boolean;
  className?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  feature = 'this feature',
  requiredRole = 'Administrator',
  showBackButton = true,
  className = ''
}) => {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center justify-center min-h-64 ${className}`}>
      <Card className="max-w-md w-full border-2 border-red-200 bg-red-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-100 rounded-full">
              <Shield className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-red-800 flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            Access Denied
          </CardTitle>
          <CardDescription className="text-red-700">
            You don't have permission to access {feature}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-red-100 p-4 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-800">Administrator Access Required</span>
            </div>
            <p className="text-sm text-red-700">
              This feature requires {requiredRole} privileges for security and compliance reasons.
            </p>
          </div>
          
          <div className="space-y-2">
            <Badge variant="destructive" className="w-full py-2">
              Current Role: Non-Administrator
            </Badge>
            <Badge variant="outline" className="w-full py-2 border-red-300 text-red-700">
              Required Role: {requiredRole}
            </Badge>
          </div>

          <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
            <p className="font-medium mb-1">Need access?</p>
            <p>Contact your system administrator to request {requiredRole} privileges.</p>
          </div>

          {showBackButton && (
            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full border-red-300 text-red-700 hover:bg-red-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;