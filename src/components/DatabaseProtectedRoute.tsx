import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDatabaseAuth } from '@/contexts/DatabaseAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
  requiredPermission?: string;
}

const DatabaseProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  requiredPermission
}) => {
  const { user, profile, loading } = useDatabaseAuth();
  const location = useLocation();

  // Show loading while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to login if user is not active
  if (requireAuth && user && !user.is_active) {
    return <Navigate to="/login" state={{ from: location, error: 'Account is deactivated' }} replace />;
  }

  // Check role requirements
  if (requiredRole && profile && profile.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500">Required role: {requiredRole}</p>
          <p className="text-sm text-gray-500">Your role: {profile?.role || 'Unknown'}</p>
        </div>
      </div>
    );
  }

  // Check specific permission requirements
  if (requiredPermission && profile) {
    try {
      const permissions = profile.detailed_permissions ? JSON.parse(profile.detailed_permissions) : {};
      if (!permissions[requiredPermission]) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">You don't have permission to access this feature.</p>
              <p className="text-sm text-gray-500">Required permission: {requiredPermission}</p>
            </div>
          </div>
        );
      }
    } catch (error) {
      console.error('Error parsing permissions:', error);
    }
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default DatabaseProtectedRoute;
