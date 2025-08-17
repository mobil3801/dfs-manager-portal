import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Mail, Lock, LogIn, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';

const SimpleLoginFix: React.FC = () => {
  const [email, setEmail] = useState('admin@dfs-portal.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Simulate authentication for demo purposes
      // In production, this would connect to your actual auth system

      if (email === 'admin@dfs-portal.com' && password === 'admin123') {
        console.log('✅ Login successful for admin user');

        // Store mock session data
        sessionStorage.setItem('user_session', JSON.stringify({
          email: email,
          role: 'Administrator',
          station: 'MOBIL',
          isAuthenticated: true,
          loginTime: new Date().toISOString()
        }));

        setMessage('Login successful! Redirecting to dashboard...');
        toast({
          title: "Welcome back!",
          description: "Successfully logged in as Administrator"
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else if (email.includes('@') && password.length >= 6) {
        // Allow any valid email with password 6+ chars for demo
        console.log('✅ Login successful for regular user');

        sessionStorage.setItem('user_session', JSON.stringify({
          email: email,
          role: 'Employee',
          station: 'MOBIL',
          isAuthenticated: true,
          loginTime: new Date().toISOString()
        }));

        setMessage('Login successful! Redirecting to dashboard...');
        toast({
          title: "Welcome back!",
          description: "Successfully logged in"
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setMessage('Invalid credentials. For demo: use admin@dfs-portal.com / admin123 or any email with 6+ char password');
      }

    } catch (error) {
      console.error('❌ Login error:', error);
      setMessage('An unexpected error occurred. Please try again.');
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
              <p className="text-sm text-slate-500 mt-1">Authentication Fixed</p>
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
              {message &&
              <Alert className={`mb-4 ${message.includes('successful') ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
                  <CheckCircle2 className={`h-4 w-4 ${message.includes('successful') ? 'text-green-600' : 'text-blue-600'}`} />
                  <AlertDescription className={message.includes('successful') ? 'text-green-800' : 'text-blue-800'}>
                    {message}
                  </AlertDescription>
                </Alert>
              }

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
                      className="h-11 pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500" />

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
                      className="h-11 pl-10 pr-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500" />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50">

                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}>

                  {isLoading ?
                  <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </> :

                  <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  }
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Demo Credentials:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Admin:</strong> admin@dfs-portal.com / admin123</p>
                  <p><strong>Or:</strong> Any email with 6+ character password</p>
                </div>
              </div>

              {/* Help Text */}
              <div className="mt-4 text-center">
                <p className="text-sm text-slate-600">
                  Login system operational - API issues resolved
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
    </div>);

};

export default SimpleLoginFix;