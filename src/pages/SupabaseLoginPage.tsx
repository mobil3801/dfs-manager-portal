import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

const SupabaseLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<'signin' | 'signup'>('signin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    isAuthenticated,
    isLoading,
    authError,
    signIn,
    signUp,
    clearError,
    isInitialized
  } = useSupabaseAuth();

  const navigate = useNavigate();

  // Clear error when switching modes
  useEffect(() => {
    clearError();
  }, [loginMode, clearError]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading DFS Manager Portal...</p>
        </div>
      </div>);

  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      let success = false;

      if (loginMode === 'signin') {
        success = await signIn(email, password);
        if (success) {
          navigate('/dashboard', { replace: true });
        }
      } else {
        success = await signUp(email, password);
        if (success) {
          // Stay on login page to show verification message
          setLoginMode('signin');
          setPassword('');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <img
              src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png"
              alt="DFS Manager Portal"
              className="w-16 h-16 mx-auto rounded-lg shadow-md" />

          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DFS Manager Portal</h1>
          <p className="text-gray-600">Secure access to your dashboard</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">
              {loginMode === 'signin' ? 'Sign In' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs value={loginMode} onValueChange={(value) => setLoginMode(value as 'signin' | 'signup')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
              </TabsList>

              {/* Error Alert */}
              {authError &&
              <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              }

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isSubmitting} />

                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        disabled={isSubmitting} />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        disabled={isSubmitting}>

                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting || !email || !password}>

                    {isSubmitting ?
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </> :

                    'Sign In'
                    }
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isSubmitting} />

                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                        disabled={isSubmitting} />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        disabled={isSubmitting}>

                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting || !email || password.length < 6}>

                    {isSubmitting ?
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </> :

                    'Create Account'
                    }
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Access</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Admin: admin@dfsmanager.com / admin123</p>
                <p>Manager: manager@dfsmanager.com / manager123</p>
                <p>Employee: employee@dfsmanager.com / employee123</p>
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              <button
                type="button"
                onClick={() => navigate('/resetpassword')}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                disabled={isSubmitting}>

                Forgot your password?
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>DFS Manager Portal - Secure Gas Station Management</p>
        </div>
      </div>
    </div>);

};

export default SupabaseLoginPage;