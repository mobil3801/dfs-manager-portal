// Bundle optimization utilities
// This file contains utilities to help reduce bundle size and improve performance

// Dynamic import helper for better code splitting
export const dynamicImport = <T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: T
): Promise<T> => {
  return importFn()
    .then(module => module.default)
    .catch(error => {
      console.error('Failed to load module:', error);
      if (fallback) {
        return fallback;
      }
      throw error;
    });
};

// Preload module function
export const preloadModule = (importFn: () => Promise<any>) => {
  try {
    importFn();
  } catch (error) {
    console.warn('Failed to preload module:', error);
  }
};

// Tree-shakeable feature flags
export const FEATURES = {
  // Core features - always enabled
  AUTHENTICATION: true,
  DASHBOARD: true,
  PRODUCTS: true,
  EMPLOYEES: true,
  SALES: true,
  
  // Optional features - can be disabled to reduce bundle size
  ADMIN_PANEL: true,
  USER_MANAGEMENT: true,
  SMS_MANAGEMENT: true,
  OVERFLOW_TESTING: process.env.NODE_ENV === 'development',
  PROFILE_PICTURE_DEMO: process.env.NODE_ENV === 'development',
  ERROR_MONITORING: true,
  AUDIT_LOGGING: true,
  
  // Development-only features
  AUTH_DEBUGGER: process.env.NODE_ENV === 'development',
  NAVIGATION_DEBUG: process.env.NODE_ENV === 'development',
} as const;

// Conditional import wrapper
export const conditionalImport = <T>(
  feature: keyof typeof FEATURES,
  importFn: () => Promise<{ default: T }>,
  fallback?: () => T
): Promise<T> | T => {
  if (FEATURES[feature]) {
    return dynamicImport(importFn);
  }
  
  if (fallback) {
    return fallback();
  }
  
  throw new Error(`Feature ${feature} is disabled`);
};

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis would run here in development mode');
    // This would typically integrate with webpack-bundle-analyzer or similar
  }
};

// Memory usage monitor
export const monitorMemoryUsage = () => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memInfo = (performance as any).memory;
    console.log('Memory usage:', {
      used: Math.round(memInfo.usedJSHeapSize / 1024 / 1024) + ' MB',
      total: Math.round(memInfo.totalJSHeapSize / 1024 / 1024) + ' MB',
      limit: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024) + ' MB'
    });
  }
};

// Performance metrics
export const measurePerformance = (name: string, fn: () => void) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  } else {
    fn();
  }
};

// Lazy component wrapper with error boundary
export const createLazyComponent = <T extends import('react').ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  displayName?: string
) => {
  const { lazy } = require('react');
  const LazyComponent = lazy(importFn);
  
  if (displayName) {
    LazyComponent.displayName = displayName;
  }
  
  return LazyComponent;
};

// Service worker registration for caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Resource prefetching
export const prefetchResource = (url: string) => {
  if (process.env.NODE_ENV === 'production') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }
};

// Critical CSS inlining helper
export const inlineCriticalCSS = (css: string) => {
  if (process.env.NODE_ENV === 'production') {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
};

export default {
  dynamicImport,
  preloadModule,
  conditionalImport,
  analyzeBundleSize,
  monitorMemoryUsage,
  measurePerformance,
  createLazyComponent,
  registerServiceWorker,
  prefetchResource,
  inlineCriticalCSS,
  FEATURES
};
