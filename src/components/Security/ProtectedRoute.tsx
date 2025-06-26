import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useEnhancedPermissions } from '@/hooks/use-enhanced-permissions';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionValidator } from './PermissionValidator';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: {
    module: string;
    action: 'view' | 'create' | 'edit' | 'delete';
  };
  requiredRole?: 'Administrator' | 'Management' | 'Employee';
  requiredStation?: string;
  requireAllStations?: boolean;
  redirectTo?: string;
}

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4 p-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  requiredStation,
  requireAllStations = false,
  redirectTo = '/login'
}) => {
  const { isAuthenticated } = useAuth();
  const { 
    userRole, 
    hasPermission, 
    hasStationAccess, 
    hasAllStationsAccess, 
    loading 
  } = useEnhancedPermissions();
  const location = useLocation();

  // Show loading state while checking permissions
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole) {
    const roleHierarchy = { 'Employee': 1, 'Management': 2, 'Administrator': 3 };
    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole];
    
    if (userLevel < requiredLevel) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check specific permission
  if (requiredPermission) {
    if (!hasPermission(requiredPermission.module, requiredPermission.action)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check station access
  if (requiredStation && !hasStationAccess(requiredStation)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check all stations requirement
  if (requireAllStations && !hasAllStationsAccess()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If using PermissionValidator, wrap the children
  if (requiredPermission) {
    return (
      <PermissionValidator
        module={requiredPermission.module}
        action={requiredPermission.action}
        station={requiredStation}
        requireAllStations={requireAllStations}
      >
        {children}
      </PermissionValidator>
    );
  }

  return <>{children}</>;
};

// Higher-order component for route protection
export const withRouteProtection = <P extends object>(
  Component: React.ComponentType<P>,
  protectionProps: Omit<ProtectedRouteProps, 'children'>
) => {
  return (props: P) => (
    <ProtectedRoute {...protectionProps}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

export default ProtectedRoute;