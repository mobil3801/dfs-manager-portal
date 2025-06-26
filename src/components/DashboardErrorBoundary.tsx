import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🚨 Dashboard Error Boundary caught error:', error);
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 Dashboard Error Boundary - Error details:', {
      error: error.message,
      stack: error.stack,
      errorInfo
    });

    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    console.log('🔄 Dashboard Error Boundary - Retrying...');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-600">Dashboard Error</CardTitle>
              <CardDescription>
                Something went wrong while loading the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <strong>Error:</strong> {this.state.error?.message || 'Unknown error occurred'}
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default">

                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/login'}
                  variant="outline"
                  className="w-full">

                  Go to Login
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' &&
              <details className="text-xs bg-gray-100 p-2 rounded">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Debug Information
                  </summary>
                  <div className="mt-2 whitespace-pre-wrap text-gray-600">
                    {this.state.error?.stack}
                  </div>
                </details>
              }
            </CardContent>
          </Card>
        </div>);

    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;