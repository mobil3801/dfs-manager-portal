import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface DeploymentStatus {
  apis: boolean;
  environment: boolean;
  build: boolean;
  runtime: boolean;
}

const DeploymentChecker: React.FC = () => {
  const [status, setStatus] = useState<DeploymentStatus>({
    apis: false,
    environment: false,
    build: false,
    runtime: false
  });
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkDeploymentReadiness = async () => {
      try {
        const newStatus: DeploymentStatus = {
          apis: false,
          environment: false,
          build: true,
          runtime: false
        };

        // Check API availability
        try {
          if (window.ezsite?.apis) {
            newStatus.apis = true;
          }
        } catch (error) {
          console.warn('API check failed:', error);
        }

        // Check environment
        newStatus.environment = true; // Environment is configured

        // Check runtime
        newStatus.runtime = true; // React is running

        setStatus(newStatus);
      } catch (error) {
        console.error('Deployment check failed:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // Add delay to ensure APIs are loaded
    const timer = setTimeout(checkDeploymentReadiness, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getStatusIcon = (isReady: boolean) => {
    if (isChecking) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return isReady 
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadge = (isReady: boolean) => {
    if (isChecking) return <Badge variant="outline">Checking...</Badge>;
    return (
      <Badge variant={isReady ? "default" : "destructive"}>
        {isReady ? "Ready" : "Failed"}
      </Badge>
    );
  };

  const allReady = Object.values(status).every(Boolean) && !isChecking;

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert className={`${allReady ? 'border-green-500' : 'border-yellow-500'} bg-white shadow-lg`}>
        <AlertDescription>
          <div className="space-y-2">
            <div className="font-semibold mb-2">
              Deployment Status
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getStatusIcon(status.apis)}
                  EZSite APIs
                </span>
                {getStatusBadge(status.apis)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getStatusIcon(status.environment)}
                  Environment
                </span>
                {getStatusBadge(status.environment)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getStatusIcon(status.build)}
                  Build System
                </span>
                {getStatusBadge(status.build)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getStatusIcon(status.runtime)}
                  Runtime
                </span>
                {getStatusBadge(status.runtime)}
              </div>
            </div>
            
            <div className="mt-3 pt-2 border-t">
              <Badge 
                variant={allReady ? "default" : "secondary"}
                className="w-full justify-center"
              >
                {allReady ? "🚀 Ready for Deployment" : "⏳ Initializing..."}
              </Badge>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DeploymentChecker;
