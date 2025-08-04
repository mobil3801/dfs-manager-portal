import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const SimpleAuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect if authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onauthsuccess`
          }
        });
        if (error) throw error;
        setError('Check your email for verification link');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img
            src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png"
            alt="DFS Manager Portal"
            style={{ width: '60px', height: '60px', borderRadius: '8px', marginBottom: '15px' }} />

          <h1 style={{ color: '#333', marginBottom: '10px' }}>DFS Manager Portal</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            {mode === 'signin' ? 'Sign in to your account' : 'Create new account'}
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '4px' }}>
            <button
              type="button"
              onClick={() => setMode('signin')}
              style={{
                flex: 1,
                padding: '8px 16px',
                backgroundColor: mode === 'signin' ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: mode === 'signin' ? 'bold' : 'normal'
              }}>

              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              style={{
                flex: 1,
                padding: '8px 16px',
                backgroundColor: mode === 'signup' ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: mode === 'signup' ? 'bold' : 'normal'
              }}>

              Sign Up
            </button>
          </div>
        </div>

        {error &&
        <div style={{
          backgroundColor: mode === 'signup' && error.includes('email') ? '#e7f5e7' : '#ffe7e7',
          color: mode === 'signup' && error.includes('email') ? '#2d5a2d' : '#d63031',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
            {error}
          </div>
        }

        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email" />

          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === 'signup' ? 6 : 1}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder={mode === 'signup' ? 'Create password (min 6 chars)' : 'Enter your password'} />

          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: mode === 'signin' ? '#667eea' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}>

            {isLoading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '12px'
        }}>
          <strong>Demo Accounts:</strong>
          <div style={{ marginTop: '5px', lineHeight: '1.4' }}>
            Admin: admin@dfsmanager.com / admin123<br />
            Manager: manager@dfsmanager.com / manager123<br />
            Employee: employee@dfsmanager.com / employee123
          </div>
        </div>
      </div>
    </div>);

};

export default SimpleAuthPage;