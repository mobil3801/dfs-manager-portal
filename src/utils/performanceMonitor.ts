import { useEffect } from 'react';

/**
 * Performance monitoring utilities for tracking bundle size and loading times
 */

export const performanceMonitor = {
  // Track route loading times
  trackRouteLoad: (routeName: string) => {
    const startTime = performance.now();
    
    return {
      end: () => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        // Log performance metrics in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Route ${routeName} loaded in ${loadTime.toFixed(2)}ms`);
        }
        
        // You can send this to analytics service in production
        return loadTime;
      }
    };
  },

  // Track bundle size impact
  trackBundleSize: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (entries.length > 0) {
        const timing = entries[0];
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Page load time: ${loadTime.toFixed(2)}ms`);
        }
        
        return loadTime;
      }
    }
    return 0;
  },

  // Get memory usage (if available)
  getMemoryUsage: () => {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  },

  // Track lazy loading performance
  trackLazyLoad: (componentName: string) => {
    const startTime = performance.now();
    
    return {
      loaded: () => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Lazy component ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
        }
        
        return loadTime;
      }
    };
  }
};

// Hook for tracking component performance
export const usePerformanceTracker = (componentName: string) => {
  const startTime = performance.now();
  
  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Component ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    }
  }, [componentName, startTime]);
};

export default performanceMonitor;
