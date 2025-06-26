import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import optimized memory management
import { enableOptimizedMemoryManagement } from './utils/optimized-memory-management';

// Performance monitoring setup
const startTime = performance.now();

// Enable optimized memory management
const cleanupMemoryManagement = enableOptimizedMemoryManagement();

// Enhanced error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);

  // Prevent infinite error loops
  if (event.error?.message?.includes('ResizeObserver') ||
  event.error?.message?.includes('Non-Error promise rejection')) {
    event.preventDefault();
    return false;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);

  // Prevent infinite loops from promise rejections
  if (typeof event.reason === 'string' && (
  event.reason.includes('ResizeObserver') ||
  event.reason.includes('fetch'))) {
    event.preventDefault();
    return false;
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  cleanupMemoryManagement();
});

// Initialize React app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log initialization time
const endTime = performance.now();
console.log(`🚀 App initialized in ${Math.round(endTime - startTime)}ms`);

// Performance monitoring
if (process.env.NODE_ENV === 'development') {
  // Monitor for slow renders
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 100) {
            console.warn(`🐌 Slow operation detected: ${entry.name} (${Math.round(entry.duration)}ms)`);
          }
        }
      });

      observer.observe({ entryTypes: ['measure', 'navigation'] });
    } catch (error) {
      console.warn('Performance observer setup failed:', error);
    }
  }
}