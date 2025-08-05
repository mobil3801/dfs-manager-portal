import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VendorErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface VendorErrorBoundaryProps {
  children: React.ReactNode;
}

class VendorErrorBoundary extends React.Component<VendorErrorBoundaryProps, VendorErrorBoundaryState> {
  constructor(props: VendorErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): VendorErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Vendor Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return <VendorErrorFallback 
        error={this.state.error} 
        onReset={this.handleReset} 
      />;
    }

    return this.props.children;
  }
}

interface VendorErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const VendorErrorFallback: React.FC<VendorErrorFallbackProps> = ({ error, onReset }) => {
  const navigate = useNavigate();

  const getErrorMessage = () => {
    if (error?.message?.includes('relation "vendors" does not exist')) {
      return {
        title: 'Database Setup Required',
        description: 'The vendors table hasn\'t been created yet. Please contact your administrator to set up the database.',
        type: 'database' as const
      };
    }

    if (error?.message?.includes('JWT')) {
      return {
        title: 'Authentication Error',
        description: 'Your session has expired. Please try logging in again.',
        type: 'auth' as const
      };
    }

    if (error?.message?.includes('network')) {
      return {
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please check your internet connection and try again.',
        type: 'network' as const
      };
    }

    return {
      title: 'Vendor System Error',
      description: 'An unexpected error occurred in the vendor management system. Please try again or contact support if the problem persists.',
      type: 'general' as const
    };
  };

  const errorDetails = getErrorMessage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <span>{errorDetails.title}</span>
              </CardTitle>
              <CardDescription>
                {errorDetails.description}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Error Details</h4>
                <p className="text-sm text-red-700">
                  {error?.message || 'Unknown error occurred'}
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <Button onClick={onReset} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                {errorDetails.type === 'database' && (
                  <Button onClick={() => navigate('/admin/site-management')} variant="outline">
                    Database Setup
                  </Button>
                )}
                
                {errorDetails.type === 'auth' && (
                  <Button onClick={() => navigate('/login')} variant="outline">
                    Re-login
                  </Button>
                )}
              </div>
            </div>

            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                Technical Details (for developers)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto">
                <div><strong>Error:</strong> {error?.name}</div>
                <div><strong>Message:</strong> {error?.message}</div>
                <div><strong>Stack:</strong></div>
                <pre className="whitespace-pre-wrap">{error?.stack}</pre>
              </div>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorErrorBoundary;