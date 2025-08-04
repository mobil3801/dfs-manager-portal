import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const AuthenticationFix: React.FC = () => {
  const { isAuthenticated, isInitialized, user } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isInitialized) {
      return; // Wait for auth to initialize
    }

    console.log('🔄 AuthenticationFix checking route:', location.pathname);
    console.log('🔄 Authentication status:', { isAuthenticated, user: !!user });

    // Define public routes that don't require authentication
    const publicRoutes = [
    '/login',
    '/supabase-login',
    '/legacy-login',
    '/onauthsuccess',
    '/resetpassword',
    '/admin-setup',
    '/admin-debug',
    '/admin-emergency-fix',
    '/admin-fix-success',
    '/critical-error-fix',
    '/upsert-fix',
    '/admin-fix',
    '/emergency-fix'];


    const isPublicRoute = publicRoutes.some((route) =>
    location.pathname === route || location.pathname.startsWith(route)
    );

    if (isAuthenticated && isPublicRoute && location.pathname !== '/onauthsuccess') {
      // User is authenticated but on a public route (except auth success), redirect to dashboard
      console.log('✅ Authenticated user on public route, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    } else if (!isAuthenticated && !isPublicRoute) {
      // User is not authenticated but trying to access protected route
      console.log('❌ Unauthenticated user on protected route, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isInitialized, location.pathname, navigate, user]);

  // This component doesn't render anything
  return null;
};

export default AuthenticationFix;