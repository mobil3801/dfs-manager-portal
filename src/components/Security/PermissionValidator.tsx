import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useEnhancedPermissions } from '@/hooks/use-enhanced-permissions';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface PermissionValidatorProps {
  children: ReactNode;
  module: string;
  action: 'view' | 'create' | 'edit' | 'delete';
  station?: string;
  fallbackComponent?: ReactNode;
  requireAllStations?: boolean;
}

interface PermissionGuardProps {
  children: ReactNode;
  requiredRole?: 'Administrator' | 'Management' | 'Employee';
  requiredPermissions?: {module: string;action: 'view' | 'create' | 'edit' | 'delete';}[];
  requiredStation?: string;
  requireAllStations?: boolean;
  fallbackComponent?: ReactNode;
}

const AccessDeniedCard: React.FC<{
  reason: string;
  suggestion?: string;
  showBackButton?: boolean;
}> = ({ reason, suggestion, showBackButton = true }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-[400px]">

      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-4">
          <Shield className="h-16 w-16 mx-auto text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Access Denied
            </h3>
            <p className="text-muted-foreground mb-4">
              {reason}
            </p>
            {suggestion &&
            <Alert className="text-left">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {suggestion}
                </AlertDescription>
              </Alert>
            }
          </div>
          {showBackButton &&
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mt-4">

              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          }
        </CardContent>
      </Card>
    </motion.div>);

};

export const PermissionValidator: React.FC<PermissionValidatorProps> = ({
  children,
  module,
  action,
  station,
  fallbackComponent,
  requireAllStations = false
}) => {
  const {
    hasPermission,
    hasStationAccess,
    hasAllStationsAccess,
    userRole,
    userStation,
    loading
  } = useEnhancedPermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Validating permissions...</p>
          </CardContent>
        </Card>
      </div>);

  }

  // Check module permission
  if (!hasPermission(module, action)) {
    const reason = `You don't have permission to ${action} ${module} data.`;
    const suggestion = `Contact your administrator to request ${action} access for the ${module} module.`;

    return fallbackComponent ||
    <AccessDeniedCard reason={reason} suggestion={suggestion} />;

  }

  // Check station access if station is specified
  if (station && !hasStationAccess(station)) {
    const reason = `You don't have access to ${station} station data.`;
    const suggestion = `Your current access is limited to ${userStation}. Contact your administrator for multi-station access.`;

    return fallbackComponent ||
    <AccessDeniedCard reason={reason} suggestion={suggestion} />;

  }

  // Check all stations access if required
  if (requireAllStations && !hasAllStationsAccess()) {
    const reason = "This feature requires access to all stations.";
    const suggestion = "Contact your administrator to request cross-station management privileges.";

    return fallbackComponent ||
    <AccessDeniedCard reason={reason} suggestion={suggestion} />;

  }

  return <>{children}</>;
};

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredRole,
  requiredPermissions = [],
  requiredStation,
  requireAllStations = false,
  fallbackComponent
}) => {
  const {
    userRole,
    hasPermission,
    hasStationAccess,
    hasAllStationsAccess,
    loading
  } = useEnhancedPermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>);

  }

  // Check role requirement
  if (requiredRole) {
    const roleHierarchy = { 'Employee': 1, 'Management': 2, 'Administrator': 3 };
    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      const reason = `This feature requires ${requiredRole} role or higher.`;
      const suggestion = `Your current role is ${userRole}. Contact your administrator for role upgrade.`;

      return fallbackComponent ||
      <AccessDeniedCard reason={reason} suggestion={suggestion} showBackButton={false} />;

    }
  }

  // Check specific permissions
  for (const permission of requiredPermissions) {
    if (!hasPermission(permission.module, permission.action)) {
      const reason = `Missing required permission: ${permission.action} access for ${permission.module}.`;
      const suggestion = "Contact your administrator to request the necessary permissions.";

      return fallbackComponent ||
      <AccessDeniedCard reason={reason} suggestion={suggestion} showBackButton={false} />;

    }
  }

  // Check station access
  if (requiredStation && !hasStationAccess(requiredStation)) {
    const reason = `Access denied for ${requiredStation} station.`;
    const suggestion = "Contact your administrator for station access permissions.";

    return fallbackComponent ||
    <AccessDeniedCard reason={reason} suggestion={suggestion} showBackButton={false} />;

  }

  // Check all stations requirement
  if (requireAllStations && !hasAllStationsAccess()) {
    const reason = "This feature requires access to all stations.";
    const suggestion = "Contact your administrator for cross-station access.";

    return fallbackComponent ||
    <AccessDeniedCard reason={reason} suggestion={suggestion} showBackButton={false} />;

  }

  return <>{children}</>;
};

// Higher-order component for permission protection
export const withPermissionValidation = <P extends object,>(
Component: React.ComponentType<P>,
validationProps: Omit<PermissionValidatorProps, 'children'>) =>
{
  return (props: P) =>
  <PermissionValidator {...validationProps}>
      <Component {...props} />
    </PermissionValidator>;

};

export default PermissionValidator;