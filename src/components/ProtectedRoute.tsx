import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requireAdmin?: boolean;
  requiredPermission?: {
    module: string;
    action: string;
  };
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requireAdmin = false,
  requiredPermission
}) => {
  const { user, userProfile, isLoading, hasPermission, isAdmin, isActive } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user account is active
  if (!isActive()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-yellow-600 mb-2">Account Inactive</h1>
          <p className="text-gray-600 mb-4">
            Your account has been deactivated. Please contact an administrator to reactivate your account.
          </p>
          <p className="text-sm text-gray-500">
            Status: {userProfile?.status || 'Unknown'}
          </p>
        </div>
      </div>
    );
  }

  // Check for admin requirement
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You need administrator privileges to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Current role: {userProfile?.role || 'Unknown'}
          </p>
        </div>
      </div>
    );
  }

  // Check for specific role requirement
  if (requiredRole && userProfile?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You need the '{requiredRole}' role to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Current role: {userProfile?.role || 'Unknown'}
          </p>
        </div>
      </div>
    );
  }

  // Check for specific permission requirement
  if (requiredPermission && !hasPermission(requiredPermission.module, requiredPermission.action)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Insufficient Permissions</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to {requiredPermission.action} {requiredPermission.module}.
          </p>
          <p className="text-sm text-gray-500">
            Current role: {userProfile?.role || 'Unknown'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;