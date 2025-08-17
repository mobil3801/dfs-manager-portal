import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2, LogIn, UserPlus, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const SimpleSupabaseLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check current session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsInitializing(true);
        console.log('🔍 Checking existing session...');

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session check error:', error);
          setError(null); // Don't show session errors to user
          return;
        }

        if (session?.user) {
          console.log('✅ Found existing session for:', session.user.email);
          setUser(session.user);

          // Auto-redirect if user is already logged in
          const from = (location.state as any)?.from?.pathname || '/dashboard';
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1000);
        } else {
          console.log('ℹ️ No existing session found');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError(null); // Don't show initialization errors to user
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setError(null);

          // Show success message
          toast({
            title: 'Login Successful',
            description: `Welcome back, ${session.user.email}!`
          });

          // Redirect after short delay
          const from = (location.state as any)?.from?.pathname || '/dashboard';
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1000);

        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          console.log('👋 User signed out');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location, toast]);

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Attempting login for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        console.error('❌ Login error:', error);

        // Handle specific error cases
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the verification link before logging in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a moment and try again.';
        }

        setError(errorMessage);
        toast({
          title: 'Login Failed',
          description: errorMessage,
          variant: 'destructive'
        });
        return;
      }

      if (data.user) {
        console.log('✅ Login successful:', data.user.email);
        // Success handled by auth state change listener
      }

    } catch (error: any) {
      console.error('💥 Unexpected login error:', error);
      const errorMessage = error?.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Login Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📝 Attempting sign up for:', email);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onauthsuccess`
        }
      });

      if (error) {
        console.error('❌ Sign up error:', error);

        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long.';
        }

        setError(errorMessage);
        toast({
          title: 'Sign Up Failed',
          description: errorMessage,
          variant: 'destructive'
        });
        return;
      }

      console.log('✅ Sign up successful');
      toast({
        title: 'Account Created',
        description: 'Please check your email to verify your account before logging in.'
      });

      // Switch to login mode after successful signup
      setIsSignUp(false);
      setPassword('');

    } catch (error: any) {
      console.error('💥 Unexpected sign up error:', error);
      const errorMessage = error?.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Sign Up Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      console.log('🚪 Logging out user...');

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }

      setUser(null);
      setError(null);

      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.'
      });

    } catch (error: any) {
      console.error('💥 Logout error:', error);
      toast({
        title: 'Logout Error',
        description: error?.message || 'Failed to logout properly.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Initializing authentication...</p>
          </CardContent>
        </Card>
      </div>);

  }

  // If user is already logged in, show welcome screen
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Welcome Back!
            </CardTitle>
            <p className="text-gray-600 mt-2">
              You are successfully logged in as
            </p>
            <Badge variant="secondary" className="mt-2">
              {user.email}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full"
              size="lg"
              disabled={isLoading}>

              Go to Dashboard
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
              size="lg"
              disabled={isLoading}>

              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <img
              src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png"
              alt="DFS Manager"
              className="w-12 h-12 object-contain" />

          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            DFS Manager Portal
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            {error &&
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            }
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null); // Clear error when user types
                }}
                required
                disabled={isLoading}
                className="transition-colors" />

            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null); // Clear error when user types
                  }}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="pr-10 transition-colors" />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50">

                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email || !password}
              size="lg">

              {isLoading ?
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </> :

              <>
                  {isSignUp ?
                <UserPlus className="mr-2 h-4 w-4" /> :

                <LogIn className="mr-2 h-4 w-4" />
                }
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              }
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setPassword(''); // Clear password when switching modes
              }}
              disabled={isLoading}>

              {isSignUp ?
              'Already have an account? Sign in' :
              "Don't have an account? Sign up"
              }
            </Button>
          </div>

          {/* Quick Test Account Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 text-center">
              <strong>For Testing:</strong> Create a test account or use your existing credentials
            </p>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default SimpleSupabaseLogin;