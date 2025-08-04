import React, { useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthenticationFix: React.FC = () => {
  const { isAuthenticated, isLoading, user, isInitialized } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only run when fully initialized
    if (!isInitialized || isLoading) return;

    // If user is authenticated but on login page, redirect to dashboard
    if (isAuthenticated && user) {
      const loginPaths = ['/login', '/supabase-login', '/legacy-login'];
      if (loginPaths.includes(location.pathname)) {
        console.log('✅ User authenticated, redirecting to dashboard from:', location.pathname);
        navigate('/dashboard', { replace: true });
        return;
      }
    }

    // If user is not authenticated and on protected route, redirect to login
    if (!isAuthenticated && !user) {
      const publicPaths = [
        '/login', '/supabase-login', '/legacy-login', 
        '/onauthsuccess', '/resetpassword', 
        '/admin-setup', '/admin-debug', '/admin-emergency-fix', 
        '/admin-fix-success', '/critical-error-fix', '/emergency-fix'
      ];
      
      if (!publicPaths.includes(location.pathname)) {
        console.log('🔒 User not authenticated, redirecting to login from:', location.pathname);
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, isInitialized, location.pathname, navigate]);

  return null; // This component doesn't render anything
};

export default AuthenticationFix;