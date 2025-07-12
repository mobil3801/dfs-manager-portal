import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, XCircle, ExternalLink } from 'lucide-react';
import { checkEasySitePlatformReadiness, deploymentConfig } from '@/utils/deploymentConfig';

interface DeploymentStatus {
  checks: Record<string, boolean>;
  allReady: boolean;
  readinessScore: number;
  platform: string;
  projectInfo: {
    name: string;
    token: string;
  };
}

const EasySiteDeploymentStatus: React.FC = () => {
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = () => {
    const status = checkEasySitePlatformReadiness();
    setDeploymentStatus(status);
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkStatus();
    
    // Auto-refresh status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!deploymentStatus) {
    return (
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Checking deployment status...</span>
        </div>
      </Card>
    );
  }

  const getStatusIcon = (isReady: boolean) => {
    if (isReady) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getOverallStatusIcon = () => {
    if (deploymentStatus.allReady) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (deploymentStatus.readinessScore >= 70) {
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getOverallStatusColor = () => {
    if (deploymentStatus.allReady) return 'green';
    if (deploymentStatus.readinessScore >= 70) return 'yellow';
    return 'red';
  };

  return (
    <Card className="p-6 bg-white shadow-sm">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getOverallStatusIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                EasySite Deployment Status
              </h3>
              <p className="text-sm text-gray-500">
                {deploymentStatus.projectInfo.name} • Project Token: {deploymentStatus.projectInfo.token}
              </p>
            </div>
          </div>
          <Badge
            variant={getOverallStatusColor() === 'green' ? 'default' : 
                   getOverallStatusColor() === 'yellow' ? 'secondary' : 'destructive'}
          >
            {Math.round(deploymentStatus.readinessScore)}% Ready
          </Badge>
        </div>

        {/* Status Checks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(deploymentStatus.checks).map(([check, isReady]) => (
            <div key={check} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {check.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(isReady)}
                <span className="text-xs text-gray-500">
                  {isReady ? 'Ready' : 'Not Ready'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Platform Info */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Platform:</span>
              <span className="ml-2 font-medium">{deploymentStatus.platform}</span>
            </div>
            <div>
              <span className="text-gray-500">Environment:</span>
              <span className="ml-2 font-medium">{deploymentConfig.appEnvironment}</span>
            </div>
            <div>
              <span className="text-gray-500">Version:</span>
              <span className="ml-2 font-medium">{deploymentConfig.appVersion}</span>
            </div>
            <div>
              <span className="text-gray-500">Production:</span>
              <span className="ml-2 font-medium">{deploymentConfig.isProduction ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-gray-500">
            Last checked: {lastChecked?.toLocaleTimeString()}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={checkStatus}>
              Refresh Status
            </Button>
            {deploymentStatus.allReady && (
              <Button size="sm" className="text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                View Live Site
              </Button>
            )}
          </div>
        </div>

        {/* Warning for incomplete deployment */}
        {!deploymentStatus.allReady && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Deployment Incomplete</p>
                <p className="text-yellow-700 mt-1">
                  Some EasySite platform features may not be available until all checks pass.
                  The application will continue to function with reduced capabilities.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EasySiteDeploymentStatus;