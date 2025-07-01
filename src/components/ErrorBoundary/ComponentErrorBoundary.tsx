import React, { Component, ReactNode } from 'react';
import { ErrorLogger } from '@/services/errorLogger';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: ReactNode;
  componentName?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  fallback?: React.ComponentType<any>;
  minHeight?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ComponentErrorBoundary extends Component<Props, State> {
  private errorLogger: ErrorLogger;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
    this.errorLogger = ErrorLogger.getInstance();
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { componentName = 'Component', severity = 'medium' } = this.props;
    
    // Log the error with specified severity
    this.errorLogger.log(
      error,
      severity,
      componentName,
      errorInfo,
      {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    );

    this.setState({
      error,
      errorInfo
    });

    // In development, log to console for easier debugging
    if (process.env.NODE_ENV === 'development') {
      console.group(`🛡️ Component Error Boundary Caught Error in ${componentName}`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const { componentName = 'Component', severity = 'medium', fallback, minHeight } = this.props;

      // Custom fallback component
      if (fallback) {
        const FallbackComponent = fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.handleReset}
            errorInfo={this.state.errorInfo}
          />
        );
      }

      // Default fallback UI
      return (
        <div 
          className="p-4 bg-gray-50 rounded-lg border border-gray-200" 
          style={{ minHeight: minHeight || 'auto' }}
        >
          <ErrorFallback
            error={this.state.error}
            resetError={this.handleReset}
            severity={severity}
            component={componentName}
            customMessage={`An error occurred in the ${componentName} component. You can try refreshing this section or continue using other parts of the application.`}
            showNavigation={false}
            customActions={
              <div className="flex space-x-2">
                <button
                  onClick={this.handleReset}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Retry Component
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ComponentErrorBoundary;
