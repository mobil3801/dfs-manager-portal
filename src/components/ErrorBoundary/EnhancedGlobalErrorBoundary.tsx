import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<any>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class EnhancedGlobalErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Enhanced Global Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        console.error('Error in custom error handler:', handlerError);
      }
    }

    // Log error for monitoring
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Enhanced error logging
      const errorData = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        retryCount: this.state.retryCount
      };

      console.error('Detailed Error Information:', errorData);

      // Send to external logging service if available
      if (typeof window !== 'undefined' && (window as any).logError) {
        (window as any).logError(errorData);
      }
    } catch (logError) {
      console.warn('Failed to log error details:', logError);
    }
  };

  resetError = () => {
    if (this.state.retryCount >= this.maxRetries) {
      // Too many retries, redirect to a safe page
      window.location.href = '/login';
      return;
    }

    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorFallback;

      const severity = this.getSeverity(this.state.error);

      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          severity={severity}
          component="EnhancedGlobalErrorBoundary"
          showDetails={true}
          showNavigation={true}
          customMessage={this.getCustomMessage()} />);


    }

    return this.props.children;
  }

  private getSeverity = (error: Error): 'low' | 'medium' | 'high' | 'critical' => {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'medium';
    }

    if (errorMessage.includes('chunk') || errorMessage.includes('loading')) {
      return 'medium';
    }

    if (errorMessage.includes('auth') || errorMessage.includes('permission')) {
      return 'high';
    }

    if (this.state.retryCount >= 2) {
      return 'critical';
    }

    return 'medium';
  };

  private getCustomMessage = (): string | undefined => {
    if (this.state.retryCount >= this.maxRetries) {
      return 'Multiple errors occurred. You will be redirected to the login page for a fresh start.';
    }

    if (this.state.retryCount > 0) {
      return `This is retry attempt ${this.state.retryCount + 1} of ${this.maxRetries + 1}.`;
    }

    return undefined;
  };
}

export default EnhancedGlobalErrorBoundary;