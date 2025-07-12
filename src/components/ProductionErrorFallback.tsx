import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ProductionErrorFallbackProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  resetError?: () => void;
}

const ProductionErrorFallback: React.FC<ProductionErrorFallbackProps> = ({
  error,
  resetError
}) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full p-6 text-center">
        <div className="mb-6">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600">
            We're sorry, but something unexpected happened. Our team has been notified and is working to fix this.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && error &&
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-left">
            <h3 className="font-medium text-red-800 mb-2">Error Details:</h3>
            <pre className="text-xs text-red-700 overflow-auto">
              {error.message}
            </pre>
          </div>
        }

        <div className="space-y-3">
          <Button
            onClick={resetError || handleReload}
            className="w-full"
            variant="default">

            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button
            onClick={handleHome}
            variant="outline"
            className="w-full">

            <Home className="w-4 h-4 mr-2" />
            Go to Homepage
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            If this problem persists, please contact support.
          </p>
        </div>
      </Card>
    </div>);

};

export default ProductionErrorFallback;