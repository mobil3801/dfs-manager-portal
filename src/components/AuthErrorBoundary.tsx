import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Shield, Home, LogIn } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRecovering: boolean;
}

class AuthErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
    isRecovering: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
      hasError: true
    });

    // Log the error for monitoring
    this.logAuthError(error, errorInfo);

    // Attempt automatic recovery for auth-related errors
    if (this.isAuthRelatedError(error)) {
      this.attemptAutoRecovery();
    }
  }

  private isAuthRelatedError(error: Error): boolean {
    const authErrorPatterns = [
    'authentication',
    'login',
    'auth',
    'token',
    'session',
    'ezsite',
    'getUserInfo',
    'not available'];


    const errorMessage = error.message.toLowerCase();
    const errorStack = error.stack?.toLowerCase() || '';

    return authErrorPatterns.some((pattern) =>
    errorMessage.includes(pattern) || errorStack.includes(pattern)
    );
  }

  private logAuthError(error: Error, errorInfo: ErrorInfo) {
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount
    };

    console.error('Authentication Error Report:', errorReport);

    // In a real application, you would send this to your error tracking service
    // Example: errorTrackingService.logError(errorReport);
  }

  private attemptAutoRecovery = async () => {
    if (this.state.retryCount >= this.maxRetries) {
      console.log('Max retry attempts reached, manual intervention required');
      return;
    }

    this.setState({ isRecovering: true });

    try {
      console.log(`Attempting automatic recovery (${this.state.retryCount + 1}/${this.maxRetries})`);

      // Wait a moment before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Try to reinitialize the authentication system
      if (window.ezsite?.apis) {
        // Test if the API is responsive
        await window.ezsite.apis.getUserInfo();
      }

      // If we get here, the service might be working again
      this.handleRetry();

    } catch (recoveryError) {
      console.error('Auto recovery failed:', recoveryError);

      this.setState((prevState) => ({
        retryCount: prevState.retryCount + 1,
        isRecovering: false
      }));

      // Try again after a longer delay
      if (this.state.retryCount < this.maxRetries - 1) {
        this.retryTimeout = setTimeout(() => {
          this.attemptAutoRecovery();
        }, 5000);
      }
    }
  };

  private handleRetry = () => {
    // Clear any existing timeout
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false
    });
  };

  private handleForceReload = () => {
    window.location.reload();
  };

  private handleGoToLogin = () => {
    window.location.href = '/login';
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI for authentication errors
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isAuthError = this.state.error ? this.isAuthRelatedError(this.state.error) : false;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-2xl w-full">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-6 w-6" />
                  {isAuthError ? 'Authentication System Error' : 'Application Error'}
                </CardTitle>
                <CardDescription>
                  {isAuthError ?
                  'The authentication system encountered an error and needs to be restored.' :
                  'An unexpected error occurred. Please try refreshing the page.'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Error Message */}
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error:</strong> {this.state.error?.message || 'Unknown error occurred'}
                  </AlertDescription>
                </Alert>

                {/* Recovery Status */}
                {this.state.isRecovering &&
                <Alert>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                      Attempting to recover the authentication system... 
                      (Attempt {this.state.retryCount + 1} of {this.maxRetries})
                    </AlertDescription>
                  </Alert>
                }

                {/* Retry Information */}
                {this.state.retryCount > 0 && !this.state.isRecovering &&
                <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Automatic recovery attempts: {this.state.retryCount} of {this.maxRetries}
                      {this.state.retryCount >= this.maxRetries && ' (Max attempts reached)'}
                    </AlertDescription>
                  </Alert>
                }

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={this.handleRetry}
                    disabled={this.state.isRecovering}
                    className="flex-1">

                    {this.state.isRecovering ?
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> :

                    <RefreshCw className="h-4 w-4 mr-2" />
                    }
                    Try Again
                  </Button>

                  <Button
                    onClick={this.handleForceReload}
                    variant="outline"
                    className="flex-1">

                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Page
                  </Button>
                </div>

                {isAuthError &&
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                    onClick={this.handleGoToLogin}
                    variant="outline"
                    className="flex-1">

                      <LogIn className="h-4 w-4 mr-2" />
                      Go to Login
                    </Button>

                    <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="flex-1">

                      <Home className="h-4 w-4 mr-2" />
                      Go to Home
                    </Button>
                  </div>
                }

                {/* Technical Details (collapsible) */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                    <div className="space-y-2">
                      <div>
                        <strong>Error Name:</strong> {this.state.error?.name || 'Unknown'}
                      </div>
                      <div>
                        <strong>Error Message:</strong> {this.state.error?.message || 'Unknown'}
                      </div>
                      <div>
                        <strong>Timestamp:</strong> {new Date().toISOString()}
                      </div>
                      <div>
                        <strong>User Agent:</strong> {navigator.userAgent}
                      </div>
                      <div>
                        <strong>URL:</strong> {window.location.href}
                      </div>
                      {this.state.error?.stack &&
                      <div>
                          <strong>Stack Trace:</strong>
                          <pre className="mt-1 whitespace-pre-wrap text-xs">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      }
                    </div>
                  </div>
                </details>
              </CardContent>
            </Card>
          </div>
        </div>);

    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;