import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Zap, Database, Upload, Shield } from 'lucide-react';
import { deploymentConfig, checkEasySitePlatformReadiness } from '@/utils/deploymentConfig';

const EasySiteDeploymentStatus = () => {
  const [readiness, setReadiness] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const status = checkEasySitePlatformReadiness();
      setReadiness(status);
    } catch (error) {
      console.error('Error checking deployment status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ?
    <CheckCircle className="h-4 w-4 text-green-500" /> :

    <XCircle className="h-4 w-4 text-red-500" />;

  };

  const getStatusBadge = (status: boolean) => {
    return status ?
    <Badge variant="default" className="bg-green-100 text-green-800">Ready</Badge> :

    <Badge variant="destructive">Not Ready</Badge>;

  };

  if (!readiness) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2">Checking deployment status...</span>
        </CardContent>
      </Card>);

  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            EasySite Platform Deployment Status
          </CardTitle>
          <CardDescription>
            Project: {deploymentConfig.platform.projectName} | Token: {deploymentConfig.platform.projectToken}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {readiness.allReady ?
              <CheckCircle className="h-6 w-6 text-green-500" /> :

              <AlertCircle className="h-6 w-6 text-orange-500" />
              }
              <span className="font-semibold">
                Overall Status: {readiness.allReady ? 'Deployment Ready' : 'Issues Detected'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {readiness.readinessScore.toFixed(0)}% Ready
              </span>
              {getStatusBadge(readiness.allReady)}
            </div>
          </div>

          {/* Platform Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Platform Details</h4>
              <div className="space-y-1 text-sm">
                <div>Platform: <span className="font-mono">{readiness.platform}</span></div>
                <div>Project: <span className="font-mono">{readiness.projectInfo.name}</span></div>
                <div>Token: <span className="font-mono text-xs">{readiness.projectInfo.token}</span></div>
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Application Info</h4>
              <div className="space-y-1 text-sm">
                <div>Version: <span className="font-mono">{deploymentConfig.appVersion}</span></div>
                <div>Environment: <span className="font-mono">{deploymentConfig.appEnvironment}</span></div>
                <div>Production: <span className="font-mono">{deploymentConfig.isProduction ? 'Yes' : 'No'}</span></div>
              </div>
            </div>
          </div>

          {/* Feature Checks */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-3">Feature Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(readiness.checks.authentication)}
                  {getStatusBadge(readiness.checks.authentication)}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Database</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(readiness.checks.database)}
                  {getStatusBadge(readiness.checks.database)}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">File Upload</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(readiness.checks.fileUpload)}
                  {getStatusBadge(readiness.checks.fileUpload)}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">APIs</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(readiness.checks.apis)}
                  {getStatusBadge(readiness.checks.apis)}
                </div>
              </div>
            </div>
          </div>

          {/* Enabled Features */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-3">Enabled Features</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(deploymentConfig.features).map(([feature, enabled]) =>
              <Badge
                key={feature}
                variant={enabled ? "default" : "secondary"}
                className={enabled ? "bg-green-100 text-green-800" : ""}>

                  {feature.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={checkStatus}
              disabled={isChecking}
              size="sm">

              {isChecking ? 'Checking...' : 'Refresh Status'}
            </Button>
            {readiness.allReady &&
            <Badge variant="default" className="bg-green-100 text-green-800 px-3 py-1">
                ✅ Ready for Production
              </Badge>
            }
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default EasySiteDeploymentStatus;