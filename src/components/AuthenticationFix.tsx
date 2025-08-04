import React, { useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthenticationFix: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is authenticated but on login page, redirect to dashboard
    if (isAuthenticated && !isLoading && user) {
      if (location.pathname === '/login' || location.pathname === '/supabase-login') {
        console.log('✅ User authenticated, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, location.pathname, navigate]);

  return null; // This component doesn't render anything
};

export default AuthenticationFix;