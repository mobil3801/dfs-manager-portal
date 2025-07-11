import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface OptimizedLoaderProps {
  /** Custom loading message */
  message?: string;
  /** Show progress indicator */
  showProgress?: boolean;
  /** Component name being loaded */
  componentName?: string;
  /** Timeout for slow loading detection */
  slowLoadingTimeout?: number;
  /** Show retry button after timeout */
  showRetry?: boolean;
  /** Retry callback */
  onRetry?: () => void;
}

export default function OptimizedLoader({ 
  message = "Loading...",
  showProgress = true,
  componentName,
  slowLoadingTimeout = 5000,
  showRetry = false,
  onRetry
}: OptimizedLoaderProps) {
  const [isSlowLoading, setIsSlowLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    let slowLoadingTimer: NodeJS.Timeout;

    if (showProgress) {
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);
    }

    if (slowLoadingTimeout) {
      slowLoadingTimer = setTimeout(() => {
        setIsSlowLoading(true);
      }, slowLoadingTimeout);
    }

    return () => {
      if (progressTimer) clearInterval(progressTimer);
      if (slowLoadingTimer) clearTimeout(slowLoadingTimer);
    };
  }, [showProgress, slowLoadingTimeout]);

  const handleRetry = () => {
    setIsSlowLoading(false);
    setProgress(0);
    onRetry?.();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center space-y-4">
        {/* Loading Icon */}
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>

        {/* Loading Message */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">
            {message}
          </h3>
          
          {componentName && (
            <p className="text-sm text-gray-500">
              Loading {componentName}...
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Slow Loading Warning */}
        {isSlowLoading && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-yellow-800">
                  Taking longer than expected
                </p>
                <p className="text-sm text-yellow-700">
                  This component is loading slowly. This might be due to a slow network connection.
                </p>
              </div>
            </div>
            
            {showRetry && (
              <button
                onClick={handleRetry}
                className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Loading
              </button>
            )}
          </div>
        )}

        {/* Loading Tips */}
        {isSlowLoading && (
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p>💡 Loading tips:</p>
            <ul className="text-left space-y-1">
              <li>• Check your internet connection</li>
              <li>• Clear browser cache if issues persist</li>
              <li>• Try refreshing the page</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Skeleton loader for specific components
 */
export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

/**
 * Form skeleton loader
 */
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <div className="h-10 bg-gray-200 rounded animate-pulse w-20" />
        <div className="h-10 bg-gray-200 rounded animate-pulse w-20" />
      </div>
    </div>
  );
}

/**
 * Dashboard skeleton loader
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3 mb-2" />
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>
      
      {/* Chart */}
      <div className="h-64 bg-gray-200 rounded animate-pulse" />
      
      {/* Recent Items */}
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Smart skeleton loader that adapts to component type
 */
export function SmartSkeleton({ componentName }: { componentName?: string }) {
  if (componentName?.includes('List') || componentName?.includes('Table')) {
    return <TableSkeleton />;
  }
  
  if (componentName?.includes('Form')) {
    return <FormSkeleton />;
  }
  
  if (componentName?.includes('Dashboard')) {
    return <DashboardSkeleton />;
  }
  
  return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
      <div className="h-32 bg-gray-200 rounded animate-pulse" />
      <div className="h-16 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}