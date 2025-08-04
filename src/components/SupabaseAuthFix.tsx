import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Mail, Lock, LogIn, AlertCircle, CheckCircle2, Database } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';

// Direct Supabase integration without using the problematic lib
const SUPABASE_URL = 'https://nehhjsiuhthflfwkfequ.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5laGhqc2l1aHRoZmxmd2tmZXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTMxNzUsImV4cCI6MjA2ODU4OTE3NX0.N5_BFIRPavCz0f-C7GxOGFnNfhE9dALJmhxYzxhqCwQ';

const SupabaseAuthFix: React.FC = () => {
  const [email, setEmail] = useState('admin@dfs-portal.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Test database connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?select=count&limit=1`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setConnectionStatus('connected');
          setMessage('✅ Database connection verified');
          setMessageType('success');
        } else {
          setConnectionStatus('failed');
          setMessage('❌ Database connection failed - using fallback authentication');
          setMessageType('error');
        }
      } catch (error) {
        setConnectionStatus('failed');
        setMessage('❌ Connection test failed - using fallback authentication');
        setMessageType('error');
      }
    };
    
    testConnection();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setMessage('Please enter both email and password');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      console.log('🔐 Attempting Supabase authentication...');
      
      // Try direct Supabase auth API call
      const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      });

      const authData = await authResponse.json();

      if (!authResponse.ok) {
        console.error('❌ Auth failed:', authData);
        
        let errorMessage = 'Login failed';
        if (authData.error_description) {
          switch (authData.error_description) {
            case 'Invalid login credentials':
              errorMessage = 'Invalid email or password. Please check your credentials.';
              break;
            case 'Email not confirmed':
              errorMessage = 'Please check your email and verify your account first.';
              break;
            default:
              errorMessage = authData.error_description;
          }
        }
        
        setMessage(errorMessage);
        setMessageType('error');
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      if (authData.access_token) {
        console.log('✅ Authentication successful');
        
        // Try to get or create user profile
        try {
          const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.${authData.user.id}`, {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${authData.access_token}`,
              'Content-Type': 'application/json'
            }
          });

          if (profileResponse.ok) {
            const profiles = await profileResponse.json();
            
            if (profiles.length === 0) {
              // Create default profile
              await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
                method: 'POST',
                headers: {
                  'apikey': SUPABASE_ANON_KEY,
                  'Authorization': `Bearer ${authData.access_token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  user_id: authData.user.id,
                  role: email.includes('admin') ? 'Administrator' : 'Employee',
                  station: 'MOBIL',
                  employee_id: '',
                  phone: '',
                  hire_date: new Date().toISOString(),
                  is_active: true,
                  detailed_permissions: {}
                })
              });
            }
          }
        } catch (profileError) {
          console.warn('Profile setup failed, but login successful:', profileError);
        }

        setMessage('Login successful! Redirecting...');
        setMessageType('success');
        toast({
          title: "Welcome back!",
          description: "Successfully logged in"
        });

        // Store auth data for the session
        sessionStorage.setItem('supabase_auth', JSON.stringify(authData));
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }

    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setMessage(errorMessage);
      setMessageType('error');
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md">
          {/* Logo and Company Name */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center">
              <div className="mb-4 transform hover:scale-105 transition-transform duration-200">
                <Logo className="mb-4" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                DFS Manager Portal
              </h1>
              <p className="text-slate-600 font-medium">Gas Station Management System</p>
              <div className="flex items-center mt-2 text-sm">
                <Database className={`w-4 h-4 mr-2 ${connectionStatus === 'connected' ? 'text-green-500' : connectionStatus === 'failed' ? 'text-red-500' : 'text-yellow-500'}`} />
                <span className={connectionStatus === 'connected' ? 'text-green-600' : connectionStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'}>
                  {connectionStatus === 'connected' ? 'Database Connected' : 
                   connectionStatus === 'failed' ? 'Connection Issues' : 'Testing Connection...'}
                </span>
              </div>
            </div>
          </div>

          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-slate-800">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center text-slate-600">
                Enter your credentials to access the portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {message && (
                <Alert className={`mb-4 ${messageType === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  {messageType === 'success' ? 
                    <CheckCircle2 className="h-4 w-4 text-green-600" /> : 
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  }
                  <AlertDescription className={messageType === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11 pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11 pl-10 pr-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  Direct Supabase Authentication
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Status: {connectionStatus === 'connected' ? '✅ Connected' : connectionStatus === 'failed' ? '⚠️ Fallback Mode' : '🔄 Testing...'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-slate-500">
            <p>&copy; 2024 DFS Management Systems. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseAuthFix;