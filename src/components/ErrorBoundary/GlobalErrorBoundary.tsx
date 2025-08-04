import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '@/utils/globalErrorHandler';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<any>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Global Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    this.setState({
      error,
      errorInfo,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // Log error safely
    try {
      logError(error, 'GlobalErrorBoundary');
    } catch (loggerError) {
      console.warn('Failed to log error:', loggerError);
    }

    // Report to external service if available
    if (typeof window !== 'undefined' && (window as any).reportError) {
      try {
        (window as any).reportError({
          error: error.toString(),
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          errorId: this.state.errorId,
          url: window.location.href,
          timestamp: new Date().toISOString()
        });
      } catch (reportError) {
        console.warn('Failed to report error:', reportError);
      }
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-xl border border-red-100 p-8 text-center">
              {/* Error Icon */}
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />

                </svg>
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                System Error
              </h1>
              
              {/* Error Description */}
              <p className="text-gray-600 mb-6">
                Something went wrong while loading the application. 
                Please try refreshing the page or contact support if the problem persists.
              </p>

              {/* Error ID */}
              <div className="mb-6 p-3 bg-gray-50 rounded border text-xs text-gray-500">
                Error ID: {this.state.errorId}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.resetError}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">

                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
                
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200">

                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go to Dashboard
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200">

                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Page
                </button>
              </div>

              {/* Development Info */}
              {process.env.NODE_ENV === 'development' &&
              <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Technical Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono text-gray-600 max-h-40 overflow-y-auto">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack &&
                  <div className="mb-2">
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                      </div>
                  }
                    {this.state.errorInfo?.componentStack &&
                  <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                      </div>
                  }
                  </div>
                </details>
              }
            </div>
          </div>
        </div>);

    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;