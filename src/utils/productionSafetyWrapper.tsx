import React from 'react';

/**
 * Production Safety Wrapper - Disables debug components in production
 */

interface DebugWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | null;
  condition?: boolean;
}

export const DebugWrapper: React.FC<DebugWrapperProps> = ({ 
  children, 
  fallback = null,
  condition = process.env.NODE_ENV === 'development' 
}) => {
  // Only render debug components in development or when condition is true
  if (!condition) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Disable numbered debug overlays and development scripts
 */
export const isProductionEnvironment = () => {
  return process.env.NODE_ENV === 'production' || 
         import.meta.env.PROD === true ||
         window.location.hostname !== 'localhost';
};

/**
 * Safe console methods that are disabled in production
 */
export const debugConsole = {
  log: (...args: any[]) => {
    if (!isProductionEnvironment()) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (!isProductionEnvironment()) {
      console.warn(...args);
    }
  },
  debug: (...args: any[]) => {
    if (!isProductionEnvironment()) {
      console.debug(...args);
    }
  },
  info: (...args: any[]) => {
    // Info logs allowed in production for important information
    console.info(...args);
  },
  error: (...args: any[]) => {
    // Error logs always allowed
    console.error(...args);
  }
};

/**
 * Production-safe error boundary that doesn't show stack traces to users
 */
interface ProductionSafeErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ProductionSafeErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ProductionSafeErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ProductionSafeErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details in development
    if (!isProductionEnvironment()) {
      debugConsole.error('Error caught by boundary:', error, errorInfo);
    } else {
      // In production, only log essential error information
      console.error('Application error occurred:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      if (isProductionEnvironment()) {
        // Production: Show user-friendly error message
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full text-center">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-red-600 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
                <p className="text-gray-600 mb-4">
                  We're experiencing a temporary issue. Please refresh the page or try again later.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh Page
                  </button>
                  <button
                    onClick={() => this.setState({ hasError: false })}
                    className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        // Development: Show detailed error information
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-2xl w-full">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-red-600 mb-4">Development Error</h3>
                <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                  <h4 className="font-medium text-red-800">Error Message:</h4>
                  <p className="text-red-700 font-mono text-sm mt-1">
                    {this.state.error?.message || 'Unknown error'}
                  </p>
                </div>
                {this.state.error?.stack && (
                  <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-4">
                    <h4 className="font-medium text-gray-800 mb-2">Stack Trace:</h4>
                    <pre className="text-xs text-gray-600 overflow-auto max-h-64">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        );
      }
    }

    return this.props.children;
  }
}

export default {
  DebugWrapper,
  isProductionEnvironment,
  debugConsole,
  ProductionSafeErrorBoundary
};