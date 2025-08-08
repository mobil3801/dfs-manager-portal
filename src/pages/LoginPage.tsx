import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SupabaseLoginPage from './SupabaseLoginPage';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

// Legacy login page that redirects to Supabase login
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSupabaseAuth();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Return the modern Supabase login page
  return <SupabaseLoginPage />;
};

export default LoginPage;