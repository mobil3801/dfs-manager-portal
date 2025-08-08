import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Mail, Lock, UserPlus, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useConsolidatedAuth } from '@/contexts/ConsolidatedAuthContext';

type AuthMode = 'login' | 'register' | 'forgot-password';

// Form validation schemas
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long').max(100, 'Full name is too long'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long').max(128, 'Password is too long'),
  confirmPassword: z.string().min(6, 'Password confirmation is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address')
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const CleanLoginPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');

  const { login, register, resetPassword, clearError, authError, isAuthenticated, isLoading } = useConsolidatedAuth();
  const navigate = useNavigate();

  // Form configurations
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' }
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '', confirmPassword: '', fullName: '' }
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
    defaultValues: { email: '' }
  });

  // Get current form based on auth mode
  const getCurrentForm = () => {
    switch (authMode) {
      case 'login':
        return loginForm;
      case 'register':
        return registerForm;
      case 'forgot-password':
        return forgotPasswordForm;
      default:
        return loginForm;
    }
  };

  const form = getCurrentForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Clear messages and reset forms when switching modes
  useEffect(() => {
    setMessage('');
    clearError();
    setIsSubmitting(false);
    
    // Reset form states to prevent corruption
    loginForm.reset({ email: '', password: '' });
    registerForm.reset({ email: '', password: '', confirmPassword: '', fullName: '' });
    forgotPasswordForm.reset({ email: '' });
    
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [authMode, clearError, loginForm, registerForm, forgotPasswordForm]);

  // Display auth errors from context
  useEffect(() => {
    if (authError) {
      setMessage(authError);
      setMessageType('error');
    }
  }, [authError]);

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setMessage('');
    clearError();

    try {
      const success = await resetPassword(data.email);
      if (success) {
        setMessage('Password reset link has been sent to your email address');
        setMessageType('success');
        setTimeout(() => {
          setAuthMode('login');
        }, 3000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage('Failed to send reset email. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (data: any) => {
    // Clear previous state
    setMessage('');
    clearError();

    if (authMode === 'forgot-password') {
      return handleForgotPassword(data as ForgotPasswordFormData);
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        const loginData = data as LoginFormData;
        const success = await login(loginData.email, loginData.password);
        if (success) {
          // Navigation handled by useEffect above
          return;
        }
      } else if (authMode === 'register') {
        const registerData = data as RegisterFormData;
        const success = await register(registerData.email, registerData.password, registerData.fullName);
        if (success) {
          setMessage('Account created successfully! Please check your email for verification.');
          setMessageType('success');
          setTimeout(() => {
            setAuthMode('login');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setMessage('An unexpected error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeSwitch = (mode: AuthMode) => {
    if (isSubmitting) return; // Prevent mode switching during submission
    setAuthMode(mode);
  };

  const getFormTitle = () => {
    switch (authMode) {
      case 'login':
        return 'Welcome Back';
      case 'register':
        return 'Create Account';
      case 'forgot-password':
        return 'Reset Password';
      default:
        return 'Sign In';
    }
  };

  const getFormDescription = () => {
    switch (authMode) {
      case 'login':
        return 'Enter your credentials to access the portal';
      case 'register':
        return 'Create a new account to get started';
      case 'forgot-password':
        return 'Enter your email to receive a password reset link';
      default:
        return '';
    }
  };

  const getSubmitButtonText = () => {
    if (isSubmitting || isLoading) return 'Please wait...';
    switch (authMode) {
      case 'login':
        return 'Sign In';
      case 'register':
        return 'Create Account';
      case 'forgot-password':
        return 'Send Reset Link';
      default:
        return 'Submit';
    }
  };

  const getSubmitButtonIcon = () => {
    if (isSubmitting || isLoading) return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
    switch (authMode) {
      case 'login':
        return <LogIn className="mr-2 h-4 w-4" />;
      case 'register':
        return <UserPlus className="mr-2 h-4 w-4" />;
      case 'forgot-password':
        return <Mail className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };

  const isFormDisabled = isSubmitting || isLoading;

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
            </div>
          </div>

          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-slate-800">
                {getFormTitle()}
              </CardTitle>
              <CardDescription className="text-center text-slate-600">
                {getFormDescription()}
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

              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
                {/* Full Name Field (Register only) */}
                {authMode === 'register' && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-700 font-medium">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      autoComplete="name"
                      {...form.register('fullName')}
                      disabled={isFormDisabled}
                      className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      aria-describedby={form.formState.errors.fullName ? "fullName-error" : undefined}
                    />
                    {form.formState.errors.fullName && (
                      <p id="fullName-error" className="text-sm text-red-600" role="alert">
                        {form.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      {...form.register('email')}
                      disabled={isFormDisabled}
                      className="h-11 pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      aria-describedby={form.formState.errors.email ? "email-error" : undefined}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p id="email-error" className="text-sm text-red-600" role="alert">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                {authMode !== 'forgot-password' && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                        {...form.register('password')}
                        disabled={isFormDisabled}
                        className="h-11 pl-10 pr-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        aria-describedby={form.formState.errors.password ? "password-error" : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isFormDisabled}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {form.formState.errors.password && (
                      <p id="password-error" className="text-sm text-red-600" role="alert">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Confirm Password Field */}
                {authMode === 'register' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        {...form.register('confirmPassword')}
                        disabled={isFormDisabled}
                        className="h-11 pl-10 pr-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        aria-describedby={form.formState.errors.confirmPassword ? "confirmPassword-error" : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isFormDisabled}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                        aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {form.formState.errors.confirmPassword && (
                      <p id="confirmPassword-error" className="text-sm text-red-600" role="alert">
                        {form.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Forgot Password Link */}
                {authMode === 'login' && (
                  <div className="text-right">
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-blue-600 hover:text-blue-800 text-sm"
                      disabled={isFormDisabled}
                      onClick={() => handleModeSwitch('forgot-password')}
                    >
                      Forgot password?
                    </Button>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isFormDisabled || !form.formState.isValid}
                >
                  {getSubmitButtonIcon()}
                  {getSubmitButtonText()}
                </Button>
              </form>

              {/* Auth Mode Switcher */}
              <div className="mt-6">
                <Separator className="my-4" />
                <div className="text-center space-y-2">
                  {authMode === 'login' && (
                    <div>
                      <span className="text-sm text-slate-600">Don't have an account? </span>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-800"
                        disabled={isFormDisabled}
                        onClick={() => handleModeSwitch('register')}
                      >
                        Sign up
                      </Button>
                    </div>
                  )}

                  {authMode === 'register' && (
                    <div>
                      <span className="text-sm text-slate-600">Already have an account? </span>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-800"
                        disabled={isFormDisabled}
                        onClick={() => handleModeSwitch('login')}
                      >
                        Sign in
                      </Button>
                    </div>
                  )}

                  {authMode === 'forgot-password' && (
                    <div>
                      <span className="text-sm text-slate-600">Remember your password? </span>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-800"
                        disabled={isFormDisabled}
                        onClick={() => handleModeSwitch('login')}
                      >
                        Sign in
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-slate-500">
            <p>&copy; 2024 DFS Management Systems. All rights reserved.</p>
            <p className="mt-1">Secure authentication powered by Supabase</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanLoginPage;
