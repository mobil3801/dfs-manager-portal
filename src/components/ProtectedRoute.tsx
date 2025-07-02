import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string;
  showLoading?: boolean;
}

const LoadingSpinner = () =>
<div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
      <p className="text-sm text-gray-500 mt-2">Authenticating user...</p>
    </div>
  </div>;


const AuthError = ({ error, onRetry }: {error: string;onRetry: () => void;}) =>
<div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full text-center">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="space-y-2">
          <button
          onClick={onRetry}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Try Again
          </button>
          <button
          onClick={() => window.location.href = '/login'}
          className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
            Go to Login
          </button>
        </div>
      </div>
    </div>
  </div>;


const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireRole,
  showLoading = true
}) => {
  const {
    isAuthenticated,
    isLoading,
    authError,
    isInitialized,
    refreshUserData,
    userProfile,
    hasPermission
  } = useEnhancedAuth();

  // Show loading while initializing
  if (!isInitialized || isLoading && showLoading) {
    return <LoadingSpinner />;
  }

  // Show error if there's a critical authentication error
  if (authError && authError.includes('Failed to load user data')) {
    return <AuthError error={authError} onRetry={refreshUserData} />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if requireRole is specified
  if (requireRole && userProfile) {
    // Admin has access to everything
    if (userProfile.role === 'Administrator') {
      return <>{children}</>;
    }

    // Check specific role requirement
    if (requireRole === 'Admin' && userProfile.role !== 'Administrator') {
      return <Navigate to="/dashboard" replace />;
    }

    if (requireRole === 'Manager' &&
    !['Administrator', 'Management'].includes(userProfile.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;