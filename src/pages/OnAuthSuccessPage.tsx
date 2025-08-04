import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const OnAuthSuccessPage = () => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [countdown, setCountdown] = useState(3);

  const {
    isAuthenticated,
    isLoading,
    refreshUserProfile,
    user,
    isInitialized
  } = useSupabaseAuth();

  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        console.log('🔄 Processing authentication success...');

        // Wait for auth to initialize
        if (!isInitialized) {
          return;
        }

        // Small delay to ensure auth state is settled
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (isAuthenticated && user) {
          console.log('✅ User authenticated successfully:', user.id);
          setStatus('success');

          // Refresh user profile to ensure we have latest data
          await refreshUserProfile();

          // Start countdown for redirect
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate('/dashboard', { replace: true });
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
        } else if (!isLoading && isInitialized) {
          // Auth failed or user not found
          console.log('❌ Authentication verification failed');
          setStatus('error');
          setErrorMessage('Authentication verification failed. Please try signing in again.');
        }
      } catch (error) {
        console.error('❌ Error processing auth success:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      }
    };

    handleAuthSuccess();
  }, [isAuthenticated, isLoading, isInitialized, user, navigate, refreshUserProfile]);

  // If already authenticated, redirect immediately
  if (isAuthenticated && status === 'success') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRetry = () => {
    setStatus('verifying');
    setErrorMessage('');
    window.location.reload();
  };

  const handleManualRedirect = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="mb-4">
              <img
                src="https://cdn.ezsite.ai/AutoDev/19016/c533e5f9-97eb-43d2-8be6-bcdff5709bba.png"
                alt="DFS Manager Portal"
                className="w-16 h-16 mx-auto rounded-lg shadow-md" />

            </div>
            <CardTitle className="text-2xl">
              {status === 'verifying' && 'Verifying Authentication'}
              {status === 'success' && 'Welcome to DFS Manager!'}
              {status === 'error' && 'Authentication Error'}
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center">
            {status === 'verifying' &&
            <div className="space-y-4">
                <div className="flex justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                </div>
                <p className="text-gray-600">
                  Please wait while we verify your authentication...
                </p>
                <div className="text-sm text-gray-500">
                  This usually takes just a few seconds
                </div>
              </div>
            }

            {status === 'success' &&
            <div className="space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    Authentication successful! You're being redirected to your dashboard.
                  </p>
                  <div className="text-lg font-semibold text-blue-600">
                    Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                  </div>
                </div>
                <Button
                onClick={handleManualRedirect}
                className="w-full bg-blue-600 hover:bg-blue-700">

                  Go to Dashboard Now
                </Button>
              </div>
            }

            {status === 'error' &&
            <div className="space-y-4">
                <div className="flex justify-center">
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </div>
                
                <Alert variant="destructive">
                  <AlertDescription>
                    {errorMessage || 'Authentication verification failed'}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Button
                  onClick={handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700">

                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  
                  <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="w-full">

                    Back to Login
                  </Button>
                </div>
              </div>
            }

            {/* Status Info */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg text-left">
              <div className="text-xs text-gray-600 space-y-1">
                <div>Status: <span className="font-medium capitalize">{status}</span></div>
                <div>Authenticated: <span className="font-medium">{isAuthenticated ? 'Yes' : 'No'}</span></div>
                <div>Loading: <span className="font-medium">{isLoading ? 'Yes' : 'No'}</span></div>
                <div>Initialized: <span className="font-medium">{isInitialized ? 'Yes' : 'No'}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

};

export default OnAuthSuccessPage;