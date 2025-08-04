import React from 'react';
import SimpleSupabaseLogin from '@/components/SimpleSupabaseLogin';

type AuthMode = 'login' | 'register' | 'forgot-password';

const LoginPage: React.FC = () => {
  return <SimpleSupabaseLogin />;
};

export default LoginPage;