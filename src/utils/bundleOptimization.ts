// Bundle optimization utilities
import React from 'react';

// Dynamic import helper with better error handling
export const dynamicImport = async <T>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
): Promise<{ default: T }> => {
  try {
    const module = await importFn();
    return module;
  } catch (error) {
    console.error(`Failed to load component ${componentName}:`, error);
    throw error;
  }
};

// Preload module for better performance
export const preloadModule = (importFn: () => Promise<any>) => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      importFn().catch(() => {
        // Silently fail preloading
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      importFn().catch(() => {
        // Silently fail preloading
      });
    }, 100);
  }
};

// Feature flags for conditional loading
export const FEATURES = {
  MONACO_EDITOR: process.env.NODE_ENV === 'development' || window.location.pathname.includes('/admin'),
  CHARTS: true,
  ANIMATIONS: true,
  TESTING_COMPONENTS: process.env.NODE_ENV === 'development',
  PERFORMANCE_MONITORING: true
} as const;

// Conditional import based on features
export const conditionalImport = async <T>(
  importFn: () => Promise<{ default: T }>,
  feature: keyof typeof FEATURES,
  fallback?: T
): Promise<{ default: T }> => {
  if (!FEATURES[feature]) {
    if (fallback) {
      return { default: fallback };
    }
    throw new Error(`Feature ${feature} is disabled`);
  }
  return dynamicImport(importFn, feature);
};

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          console.log('Bundle loading metrics:', {
            loadTime: entry.loadEventEnd - entry.loadEventStart,
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            transferSize: (entry as any).transferSize || 'N/A'
          });
        }
      });
    });
    observer.observe({ entryTypes: ['navigation'] });
  }
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memoryInfo = (performance as any).memory;
    console.log('Memory usage:', {
      used: `${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    });
  }
};

// Performance measurement utility
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${(end - start).toFixed(2)}ms`);
};

// Create lazy component with preloading
export const createLazyComponent = <T>(
  importFn: () => Promise<{ default: T }>,
  componentName: string,
  preloadCondition?: () => boolean
) => {
  const LazyComponent = React.lazy(() => dynamicImport(importFn, componentName));
  
  // Add preload method
  (LazyComponent as any).preload = () => {
    if (!preloadCondition || preloadCondition()) {
      preloadModule(importFn);
    }
  };
  
  return LazyComponent;
};

// Service worker registration for caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Resource hints for better loading
export const prefetchResource = (url: string) => {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }
};

// Critical CSS inlining (placeholder for build-time optimization)
export const inlineCriticalCSS = () => {
  // This would be implemented at build time
  // For now, just ensure critical styles are loaded first
  console.log('Critical CSS optimization placeholder');
};

// Initialize all optimizations
export const initializeOptimizations = () => {
  if (typeof window !== 'undefined') {
    analyzeBundleSize();
    registerServiceWorker();
    
    // Monitor memory usage in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(monitorMemoryUsage, 30000); // Every 30 seconds
    }
  }
};

export default {
  dynamicImport,
  preloadModule,
  conditionalImport,
  createLazyComponent,
  initializeOptimizations,
  FEATURES
};
