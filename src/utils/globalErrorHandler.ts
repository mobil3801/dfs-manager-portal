/**
 * Global error handling utilities for the application
 */

// Global error tracking
let errorCount = 0;
let lastErrorTime = 0;
const maxErrorsPerMinute = 5;

interface ErrorLogEntry {
  timestamp: number;
  error: Error;
  context?: string;
  url: string;
  userAgent: string;
}

const errorLog: ErrorLogEntry[] = [];

/**
 * Global error handler for unhandled promises and errors
 */
export const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    logError(error, 'UnhandledPromiseRejection');
    
    // Prevent the default browser behavior
    event.preventDefault();
  });

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global JavaScript error:', event.error);
    
    const error = event.error || new Error(event.message);
    logError(error, 'GlobalJavaScriptError');
  });

  // Handle resource loading errors (images, scripts, etc.)
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      console.warn('Resource loading error:', event.target);
      // Don't log resource errors as critical errors
    }
  }, true);
};

/**
 * Log errors with rate limiting and context
 */
export const logError = (error: Error, context = 'Unknown') => {
  const now = Date.now();
  
  // Rate limiting: don't log too many errors
  if (now - lastErrorTime < 60000) { // Within 1 minute
    if (errorCount >= maxErrorsPerMinute) {
      console.warn('Error rate limit reached, suppressing error logging');
      return;
    }
    errorCount++;
  } else {
    errorCount = 1;
    lastErrorTime = now;
  }

  const errorEntry: ErrorLogEntry = {
    timestamp: now,
    error,
    context,
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  errorLog.push(errorEntry);

  // Keep only the last 50 errors
  if (errorLog.length > 50) {
    errorLog.shift();
  }

  // Log to console with additional context
  console.group(`🚨 Error in ${context}`);
  console.error('Error:', error);
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
  console.error('Context:', context);
  console.error('URL:', window.location.href);
  console.error('Timestamp:', new Date(now).toISOString());
  console.groupEnd();

  // Send to external logging service if available
  if (typeof window !== 'undefined' && (window as any).sendErrorToLoggingService) {
    try {
      (window as any).sendErrorToLoggingService(errorEntry);
    } catch (loggingError) {
      console.warn('Failed to send error to logging service:', loggingError);
    }
  }
};

/**
 * Get error statistics
 */
export const getErrorStats = () => {
  const recentErrors = errorLog.filter(entry => 
    Date.now() - entry.timestamp < 300000 // Last 5 minutes
  );

  return {
    totalErrors: errorLog.length,
    recentErrors: recentErrors.length,
    errorRate: recentErrors.length / 5, // errors per minute
    lastError: errorLog[errorLog.length - 1]
  };
};

/**
 * Clear error log
 */
export const clearErrorLog = () => {
  errorLog.length = 0;
  errorCount = 0;
  lastErrorTime = 0;
};

/**
 * Safe function wrapper that catches and logs errors
 */
export const safeExecute = <T extends (...args: any[]) => any>(
  fn: T,
  context: string,
  fallback?: any
): ((...args: Parameters<T>) => ReturnType<T> | typeof fallback) => {
  return (...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), context);
      return fallback;
    }
  };
};

/**
 * Safe async function wrapper
 */
export const safeAsyncExecute = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string,
  fallback?: any
): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | typeof fallback>) => {
  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), context);
      return fallback;
    }
  };
};

/**
 * Initialize global error handling
 */
export const initializeErrorHandling = () => {
  setupGlobalErrorHandlers();
  
  // Expose error utilities globally for debugging
  if (typeof window !== 'undefined') {
    (window as any).errorUtils = {
      getErrorStats,
      clearErrorLog,
      logError
    };
  }
  
  console.log('Global error handling initialized');
};

export default {
  setupGlobalErrorHandlers,
  logError,
  getErrorStats,
  clearErrorLog,
  safeExecute,
  safeAsyncExecute,
  initializeErrorHandling
};