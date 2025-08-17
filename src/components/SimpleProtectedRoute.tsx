import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSimpleAuth } from '@/components/SimpleAuthProvider';

interface SimpleProtectedRouteProps {
  children: React.ReactNode;
}

const SimpleProtectedRoute: React.FC<SimpleProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useSimpleAuth();

  if (!isAuthenticated) {
    return <Navigate to="/simple-login" replace />;
  }

  return <>{children}</>;
};

export default SimpleProtectedRoute;