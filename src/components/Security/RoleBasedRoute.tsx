
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ArrowLeft, Home, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import useRolePermissions from '@/hooks/use-role-permissions';
import { motion } from 'motion/react';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'Administrator' | 'Management' | 'Employee';
  requiredPermission?: {
    feature: string;
    action: 'view' | 'create' | 'edit' | 'delete' | 'manage';
  };
  allowedStations?: string[];
  fallbackPath?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  allowedStations,
  fallbackPath = '/dashboard'
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const {
    rolePermissions,
    loading,
    hasPermission,
    canAccessStation,
    isAdmin,
    isManagement,
    isEmployee
  } = useRolePermissions();

  console.log('RoleBasedRoute: Checking access', {
    requiredRole,
    requiredPermission,
    allowedStations,
    userRole: rolePermissions?.role,
    userStation: rolePermissions?.station,
    currentPath: location.pathname
  });

  // Show loading state while permissions are being loaded
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-blue-500 animate-pulse" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Loading Permissions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Verifying your access rights...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole) {
    const roleHierarchy = {
      'Administrator': 3,
      'Management': 2,
      'Employee': 1
    };

    const userRoleLevel = roleHierarchy[rolePermissions?.role as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      return <AccessDenied reason="insufficient-role" requiredRole={requiredRole} />;
    }
  }

  // Check permission-based access
  if (requiredPermission) {
    if (!hasPermission(requiredPermission.feature, requiredPermission.action)) {
      return <AccessDenied reason="insufficient-permission" requiredPermission={requiredPermission} />;
    }
  }

  // Check station-based access
  if (allowedStations && allowedStations.length > 0) {
    const hasStationAccess = allowedStations.some(station => canAccessStation(station));
    if (!hasStationAccess) {
      return <AccessDenied reason="station-restricted" allowedStations={allowedStations} />;
    }
  }

  // All checks passed, render the component
  return <>{children}</>;
};

interface AccessDeniedProps {
  reason: 'insufficient-role' | 'insufficient-permission' | 'station-restricted';
  requiredRole?: string;
  requiredPermission?: { feature: string; action: string };
  allowedStations?: string[];
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  reason,
  requiredRole,
  requiredPermission,
  allowedStations
}) => {
  const location = useLocation();

  const getErrorMessage = () => {
    switch (reason) {
      case 'insufficient-role':
        return `This page requires ${requiredRole} role or higher.`;
      case 'insufficient-permission':
        return `You don't have permission to ${requiredPermission?.action} ${requiredPermission?.feature}.`;
      case 'station-restricted':
        return `Access restricted to: ${allowedStations?.join(', ')}.`;
      default:
        return 'Access denied. You don\'t have permission to view this page.';
    }
  };

  const getSuggestion = () => {
    switch (reason) {
      case 'insufficient-role':
        return 'Contact your administrator to upgrade your role.';
      case 'insufficient-permission':
        return 'Request additional permissions from your administrator.';
      case 'station-restricted':
        return 'Contact your administrator for station access.';
      default:
        return 'Contact your administrator for access.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {getErrorMessage()}
              </AlertDescription>
            </Alert>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <strong>Suggestion:</strong> {getSuggestion()}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center pt-2 border-t">
              Current page: {location.pathname}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RoleBasedRoute;
