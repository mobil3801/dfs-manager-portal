/**
 * Error Prevention Helper
 * Provides monitoring and prevention for common JavaScript errors
 */

interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: number;
  type: 'InvalidCharacterError' | 'SyntaxError' | 'TypeError' | 'ReferenceError' | 'Other';
  handled: boolean;
}

class ErrorPreventionHelper {
  private errorLog: ErrorInfo[] = [];
  private maxErrorLog = 50;
  private isInitialized = false;

  constructor() {
    // Bind methods to preserve context
    this.handleError = this.handleError.bind(this);
    this.handlePromiseRejection = this.handlePromiseRejection.bind(this);
  }

  /**
   * Determine error type from error message
   */
  private getErrorType(error: any): ErrorInfo['type'] {
    if (!error) return 'Other';
    
    const message = typeof error === 'string' ? error : error.message || error.toString();
    
    if (message.includes('Invalid character') || message.includes('InvalidCharacterError')) {
      return 'InvalidCharacterError';
    }
    if (message.includes('Unexpected token') || message.includes('SyntaxError')) {
      return 'SyntaxError';
    }
    if (message.includes('is not a function') || message.includes('TypeError')) {
      return 'TypeError';
    }
    if (message.includes('is not defined') || message.includes('ReferenceError')) {
      return 'ReferenceError';
    }
    
    return 'Other';
  }

  /**
   * Log error information
   */
  private logError(error: any, type: ErrorInfo['type'], handled: boolean = false): void {
    try {
      const errorInfo: ErrorInfo = {
        message: typeof error === 'string' ? error : error.message || error.toString(),
        stack: error.stack,
        timestamp: Date.now(),
        type,
        handled
      };

      this.errorLog.push(errorInfo);

      // Keep only the last N errors
      if (this.errorLog.length > this.maxErrorLog) {
        this.errorLog = this.errorLog.slice(-this.maxErrorLog);
      }

      // Log to console for debugging
      if (handled) {
        console.warn(`Handled ${type}:`, errorInfo.message);
      } else {
        console.error(`Unhandled ${type}:`, errorInfo.message);
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  /**
   * Handle global errors
   */
  private handleError(event: ErrorEvent): boolean {
    try {
      const error = event.error || event.message;
      const errorType = this.getErrorType(error);
      
      // Check if this is an error we should handle
      if (this.shouldHandleError(error, errorType)) {
        this.logError(error, errorType, true);
        return true; // Prevent default error handling
      }
      
      this.logError(error, errorType, false);
      return false; // Allow default error handling
    } catch (handlerError) {
      console.error('Error in error handler:', handlerError);
      return false;
    }
  }

  /**
   * Handle unhandled promise rejections
   */
  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    try {
      const error = event.reason;
      const errorType = this.getErrorType(error);
      
      if (this.shouldHandleError(error, errorType)) {
        this.logError(error, errorType, true);
        event.preventDefault(); // Prevent unhandled rejection
      } else {
        this.logError(error, errorType, false);
      }
    } catch (handlerError) {
      console.error('Error in promise rejection handler:', handlerError);
    }
  }

  /**
   * Determine if error should be handled
   */
  private shouldHandleError(error: any, errorType: ErrorInfo['type']): boolean {
    const message = typeof error === 'string' ? error : error.message || error.toString();
    
    // Handle specific error patterns
    const handleablePatterns = [
      'Invalid character',
      'InvalidCharacterError',
      'Unexpected token',
      'JSON.parse',
      'getEntriesByType is not a function',
      'performance',
      'memory',
      'PerformanceEntry',
      'usedJSHeapSize',
      'totalJSHeapSize',
      'jsHeapSizeLimit'
    ];
    
    return handleablePatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Sanitize input to prevent InvalidCharacterError
   */
  public sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return String(input || '');
    }
    
    try {
      // Remove or replace invalid characters
      return input
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters
        .replace(/[\uFFFE\uFFFF]/g, '') // Remove non-characters
        .trim();
    } catch (error) {
      console.warn('Error sanitizing input:', error);
      return '';
    }
  }

  /**
   * Safe JSON parse with error handling
   */
  public safeJsonParse(jsonString: string, defaultValue: any = null): any {
    try {
      if (typeof jsonString !== 'string') {
        return defaultValue;
      }
      
      const sanitized = this.sanitizeInput(jsonString);
      return JSON.parse(sanitized);
    } catch (error) {
      console.warn('JSON parse error:', error);
      return defaultValue;
    }
  }

  /**
   * Safe string operation
   */
  public safeStringOperation(operation: () => string, defaultValue: string = ''): string {
    try {
      const result = operation();
      return this.sanitizeInput(result);
    } catch (error) {
      console.warn('String operation error:', error);
      return defaultValue;
    }
  }

  /**
   * Initialize error monitoring
   */
  public initialize(): void {
    if (this.isInitialized) {
      return;
    }

    try {
      // Only initialize in browser environment
      if (typeof window === 'undefined') {
        console.log('Error prevention helper skipped - not in browser environment');
        return;
      }

      // Set up global error handler
      window.addEventListener('error', this.handleError);
      
      // Set up unhandled promise rejection handler
      window.addEventListener('unhandledrejection', this.handlePromiseRejection);

      // Cleanup on page unload
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });

      this.isInitialized = true;
      console.log('Error prevention helper initialized successfully');
    } catch (error) {
      console.error('Failed to initialize error prevention helper:', error);
    }
  }

  /**
   * Cleanup event listeners
   */
  public cleanup(): void {
    try {
      if (typeof window !== 'undefined') {
        window.removeEventListener('error', this.handleError);
        window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
      }
      this.isInitialized = false;
      console.log('Error prevention helper cleaned up');
    } catch (error) {
      console.error('Failed to cleanup error prevention helper:', error);
    }
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): { total: number; byType: Record<string, number>; recent: ErrorInfo[] } {
    const byType: Record<string, number> = {};
    
    this.errorLog.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
    });

    return {
      total: this.errorLog.length,
      byType,
      recent: [...this.errorLog].slice(-10) // Last 10 errors
    };
  }

  /**
   * Clear error log
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Check if initialized
   */
  public isActive(): boolean {
    return this.isInitialized;
  }
}

// Create singleton instance
const errorPreventionHelper = new ErrorPreventionHelper();

/**
 * Setup InvalidCharacterError monitoring
 */
export function setupInvalidCharacterErrorMonitor(): void {
  try {
    errorPreventionHelper.initialize();
  } catch (error) {
    console.warn('Failed to setup InvalidCharacterError monitoring:', error);
  }
}

/**
 * Get error prevention helper instance
 */
export function getErrorPreventionHelper(): ErrorPreventionHelper {
  return errorPreventionHelper;
}

/**
 * Utility functions for safe operations
 */
export const safeOperations = {
  sanitizeInput: (input: string) => errorPreventionHelper.sanitizeInput(input),
  safeJsonParse: (jsonString: string, defaultValue?: any) => 
    errorPreventionHelper.safeJsonParse(jsonString, defaultValue),
  safeStringOperation: (operation: () => string, defaultValue?: string) => 
    errorPreventionHelper.safeStringOperation(operation, defaultValue)
};

export default errorPreventionHelper;
