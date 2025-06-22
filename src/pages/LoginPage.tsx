
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'motion/react';
import { useEnhancedDeviceDetection } from '@/hooks/use-enhanced-device-detection';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const device = useEnhancedDeviceDetection();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast({
          title: 'Welcome back!',
          description: 'You have been successfully logged in.',
        });
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    fontSize: device.isMobile ? '16px' : '14px', // Prevents zoom on iOS
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: device.connectionType === 'slow' ? 0.2 : 0.5,
          ease: "easeOut"
        }}
        className={`w-full ${device.isMobile ? 'max-w-sm' : device.isTablet ? 'max-w-md' : 'max-w-lg'}`}
      >
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className={`text-center ${device.isMobile ? 'pb-4' : 'pb-6'}`}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <Logo />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className={`${device.optimalFontSize === 'large' ? 'text-3xl' : 'text-2xl'} font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent`}>
                Welcome Back
              </CardTitle>
              <CardDescription className={`mt-2 ${device.optimalFontSize === 'large' ? 'text-base' : 'text-sm'}`}>
                Sign in to access your DFS Manager dashboard
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className={device.isMobile ? 'px-4 pb-4' : 'px-6 pb-6'}>
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden"
                >
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className={device.optimalFontSize === 'large' ? 'text-base' : 'text-sm'}>
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`pl-10 ${device.hasTouch ? 'min-h-[44px]' : 'min-h-[40px]'} transition-all duration-200 focus:ring-2 focus:ring-blue-500`}
                    style={inputStyle}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={device.optimalFontSize === 'large' ? 'text-base' : 'text-sm'}>
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`pl-10 pr-10 ${device.hasTouch ? 'min-h-[44px]' : 'min-h-[40px]'} transition-all duration-200 focus:ring-2 focus:ring-blue-500`}
                    style={inputStyle}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 ${device.hasTouch ? 'p-2' : 'p-1'}`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <motion.div
                whileHover={device.hasTouch ? {} : { scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className={`w-full ${device.hasTouch ? 'min-h-[48px]' : 'min-h-[44px]'} bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </motion.div>

              <div className="text-center">
                <Link
                  to="/resetpassword"
                  className={`text-blue-600 hover:text-blue-800 transition-colors ${device.optimalFontSize === 'large' ? 'text-base' : 'text-sm'} ${device.hasTouch ? 'py-2 px-1' : ''}`}
                >
                  Forgot your password?
                </Link>
              </div>
            </motion.form>

            <Separator className="my-6" />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <p className={`text-gray-600 dark:text-gray-400 ${device.optimalFontSize === 'large' ? 'text-base' : 'text-sm'}`}>
                Need help accessing your account?
              </p>
              <p className={`text-gray-500 dark:text-gray-500 ${device.optimalFontSize === 'large' ? 'text-sm' : 'text-xs'} mt-1`}>
                Contact your system administrator
              </p>
            </motion.div>

            {/* Device-specific help text */}
            {device.isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
              >
                <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                  💡 For the best mobile experience, consider adding this site to your home screen
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6"
        >
          <p className={`text-gray-500 dark:text-gray-400 ${device.optimalFontSize === 'large' ? 'text-sm' : 'text-xs'}`}>
            © 2024 DFS Manager. All rights reserved.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-400 mt-1">
              Device: {device.deviceType} • {device.screenSize} • {device.hasTouch ? 'Touch' : 'Mouse'}
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
