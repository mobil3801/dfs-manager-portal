
/**
 * Global error handler for catching and handling image loading errors
 */

interface ErrorReport {
  type: string;
  url?: string;
  status?: number;
  timestamp: number;
  message?: string;
}

class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errors: ErrorReport[] = [];
  private maxErrors = 100;

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  init() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'unhandledrejection',
        message: event.reason?.message || String(event.reason),
        timestamp: Date.now()
      });
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'error',
        url: event.filename,
        message: event.message,
        timestamp: Date.now()
      });
    });

    // Intercept fetch requests to handle image loading errors
    this.interceptFetch();
  }

  private interceptFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Check if this is an image request that failed
        const url = typeof args[0] === 'string' ? args[0] : args[0].url;
        
        if (response.status === 0 || !response.ok) {
          // Check if URL looks like an image or file request
          if (this.isImageOrFileRequest(url)) {
            this.handleError({
              type: 'fetch',
              url: url,
              status: response.status,
              timestamp: Date.now(),
              message: `Fetch failed for ${url}`
            });
          }
        }
        
        return response;
      } catch (error) {
        const url = typeof args[0] === 'string' ? args[0] : args[0].url;
        
        if (this.isImageOrFileRequest(url)) {
          this.handleError({
            type: 'fetch',
            url: url,
            status: 0,
            timestamp: Date.now(),
            message: error instanceof Error ? error.message : 'Network error'
          });
        }
        
        throw error;
      }
    };
  }

  private isImageOrFileRequest(url: string): boolean {
    return (
      url.includes('/api/files/') ||
      url.includes('/file/') ||
      url.includes('api.ezsite.ai/file/') ||
      url.match(/\.(jpg|jpeg|png|gif|webp|svg|pdf|doc|docx)$/i) !== null
    );
  }

  private handleError(error: ErrorReport) {
    console.warn('Global error caught:', error);
    
    // Add to error log
    this.errors.unshift(error);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Handle specific error types
    if (error.type === 'fetch' && error.url) {
      this.handleImageLoadError(error);
    }
  }

  private handleImageLoadError(error: ErrorReport) {
    // Check if this is the specific S3/API proxy error from the user report
    if (error.url && error.url.includes('api.ezsite.ai/file/')) {
      console.warn('Detected problematic API proxy image URL:', error.url);
      
      // Try to extract the actual file URL
      const match = error.url.match(/api\.ezsite\.ai\/file\/(https?:\/\/.+)/);
      if (match) {
        const actualUrl = match[1];
        console.log('Extracted actual URL:', actualUrl);
        
        // You could emit an event here to notify components to try the direct URL
        this.emitImageFallback(error.url, actualUrl);
      }
    }
  }

  private emitImageFallback(originalUrl: string, fallbackUrl: string) {
    // Emit a custom event that components can listen to
    window.dispatchEvent(new CustomEvent('imageFallback', {
      detail: { originalUrl, fallbackUrl }
    }));
  }

  getRecentErrors(limit = 10): ErrorReport[] {
    return this.errors.slice(0, limit);
  }

  getImageErrors(): ErrorReport[] {
    return this.errors.filter(error => 
      error.type === 'fetch' && this.isImageOrFileRequest(error.url || '')
    );
  }

  clearErrors() {
    this.errors = [];
  }
}

export const globalErrorHandler = GlobalErrorHandler.getInstance();
export type { ErrorReport };
