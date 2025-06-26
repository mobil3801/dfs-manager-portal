
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ArrowLeft, Home, AlertTriangle, Users, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import useRolePermissions from '@/hooks/use-role-permissions';
import { motion } from 'motion/react';

interface RouteProtectionProps {
  children: React.ReactNode;
  requiredRole?: 'Administrator' | 'Management' | 'Employee';
  requiredPermission?: {
    feature: string;
    action: 'view' | 'create' | 'edit' | 'delete' | 'manage';
  };
  allowedStations?: string[];
  fallbackPath?: string;
  customMessage?: string;
}

const RouteProtection: React.FC<RouteProtectionProps> = ({
  children,
  requiredRole,
  requiredPermission,
  allowedStations,
  fallbackPath = '/dashboard',
  customMessage
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

  console.log('RouteProtection: Checking access', {
    requiredRole,
    requiredPermission,
    allowedStations,
    userRole: rolePermissions?.role,
    userStation: rolePermissions?.station,
    currentPath: location.pathname,
    loading
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
      return (
        <AccessDeniedPage 
          reason="insufficient-role" 
          requiredRole={requiredRole}
          currentRole={rolePermissions?.role}
          customMessage={customMessage}
        />
      );
    }
  }

  // Check permission-based access
  if (requiredPermission) {
    if (!hasPermission(requiredPermission.feature, requiredPermission.action)) {
      return (
        <AccessDeniedPage 
          reason="insufficient-permission" 
          requiredPermission={requiredPermission}
          currentRole={rolePermissions?.role}
          customMessage={customMessage}
        />
      );
    }
  }

  // Check station-based access
  if (allowedStations && allowedStations.length > 0) {
    const hasStationAccess = allowedStations.some(station => canAccessStation(station));
    if (!hasStationAccess) {
      return (
        <AccessDeniedPage 
          reason="station-restricted" 
          allowedStations={allowedStations}
          currentStation={rolePermissions?.station}
          customMessage={customMessage}
        />
      );
    }
  }

  // All checks passed, render the component
  return <>{children}</>;
};

interface AccessDeniedPageProps {
  reason: 'insufficient-role' | 'insufficient-permission' | 'station-restricted';
  requiredRole?: string;
  currentRole?: string;
  requiredPermission?: { feature: string; action: string };
  allowedStations?: string[];
  currentStation?: string;
  customMessage?: string;
}

const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  reason,
  requiredRole,
  currentRole,
  requiredPermission,
  allowedStations,
  currentStation,
  customMessage
}) => {
  const location = useLocation();

  const getErrorMessage = () => {
    if (customMessage) return customMessage;
    
    switch (reason) {
      case 'insufficient-role':
        return `This page requires ${requiredRole} role or higher. You currently have ${currentRole} access.`;
      case 'insufficient-permission':
        return `You don't have permission to ${requiredPermission?.action} ${requiredPermission?.feature}.`;
      case 'station-restricted':
        return `Access restricted to: ${allowedStations?.join(', ')}. Your current station: ${currentStation}.`;
      default:
        return 'Access denied. You don\'t have permission to view this page.';
    }
  };

  const getSuggestion = () => {
    switch (reason) {
      case 'insufficient-role':
        return 'Contact your administrator to upgrade your role permissions.';
      case 'insufficient-permission':
        return 'Request additional feature permissions from your administrator.';
      case 'station-restricted':
        return 'Contact your administrator for station access or switch to an allowed station.';
      default:
        return 'Contact your administrator for access.';
    }
  };

  const getActionIcon = () => {
    switch (reason) {
      case 'insufficient-role':
        return <Users className="h-8 w-8 text-red-600" />;
      case 'insufficient-permission':
        return <Shield className="h-8 w-8 text-red-600" />;
      case 'station-restricted':
        return <Settings className="h-8 w-8 text-red-600" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-red-600" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-lg w-full"
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              {getActionIcon()}
            </div>
            <CardTitle className="text-2xl text-gray-900">Access Denied</CardTitle>
            <CardDescription className="text-base">
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {getErrorMessage()}
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What can you do?</h4>
              <p className="text-sm text-blue-800">{getSuggestion()}</p>
            </div>

            {/* Role and Permission Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-gray-900">Your Current Access:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Role: <span className="font-medium">{currentRole || 'Not Assigned'}</span></div>
                <div>• Station: <span className="font-medium">{currentStation || 'Not Assigned'}</span></div>
                {requiredRole && (
                  <div>• Required Role: <span className="font-medium text-red-600">{requiredRole}</span></div>
                )}
                {requiredPermission && (
                  <div>• Required Permission: <span className="font-medium text-red-600">
                    {requiredPermission.action} {requiredPermission.feature}
                  </span></div>
                )}
              </div>
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

            <div className="text-xs text-gray-500 text-center pt-4 border-t">
              <div>Current page: {location.pathname}</div>
              <div className="mt-1">If you believe this is an error, please contact your administrator.</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RouteProtection;
