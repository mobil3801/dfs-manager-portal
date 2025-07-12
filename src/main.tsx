import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeMemoryLeakDetection } from './utils/memoryLeakIntegration';
import { setupInvalidCharacterErrorMonitor } from './utils/errorPreventionHelper';
import { logDeploymentInfo } from './utils/deploymentConfig';

// Performance API Polyfill for environments that don't support it
if (typeof window !== 'undefined' && !window.performance) {
  console.warn('Performance API not available, providing minimal polyfill');
  (window as any).performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByType: () => [],
    memory: null
  };
} else if (typeof window !== 'undefined' && window.performance && !(window.performance as any).getEntriesByType) {
  console.warn('Performance.getEntriesByType not available, providing polyfill');
  (window.performance as any).getEntriesByType = () => [];
}

// Enhanced global error handler for Performance API errors
const originalError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  // Check for Performance API related errors
  if (typeof message === 'string' && (
  message.includes('getEntriesByType is not a function') ||
  message.includes('getEntriesByType is not defined') ||
  message.includes('performance') ||
  message.includes('PerformanceEntry') ||
  message.includes('usedJSHeapSize') ||
  message.includes('totalJSHeapSize') ||
  message.includes('jsHeapSizeLimit'))) {
    console.warn('Performance API error detected and handled:', message);
    // Prevent Performance API errors from crashing the app
    return true;
  }

  // Handle general memory monitoring errors
  if (error && error.stack && (
  error.stack.includes('performance') ||
  error.stack.includes('memory') ||
  error.stack.includes('getEntriesByType'))) {
    console.warn('Memory monitoring error detected and handled:', error);
    return true;
  }

  // Call original error handler if it exists
  if (originalError) {
    return originalError(message, source, lineno, colno, error);
  }

  return false;
};

// Enhanced global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason) {
    const reason = event.reason;
    const reasonStr = typeof reason === 'string' ? reason :
    reason.message || reason.toString();

    if (reasonStr.includes('getEntriesByType') ||
    reasonStr.includes('performance') ||
    reasonStr.includes('memory') ||
    reasonStr.includes('PerformanceEntry') ||
    reasonStr.includes('usedJSHeapSize')) {
      console.warn('Performance/Memory API promise rejection handled:', reason);
      event.preventDefault();
    }
  }
});

// Initialize memory leak detection with error handling
try {
  initializeMemoryLeakDetection();
} catch (error) {
  console.warn('Memory leak detection initialization failed:', error);
}

// Initialize InvalidCharacterError monitoring
try {
  setupInvalidCharacterErrorMonitor();
} catch (error) {
  console.warn('Invalid character error monitoring initialization failed:', error);
}

// Log deployment information
try {
  logDeploymentInfo();
} catch (error) {
  console.warn('Deployment info logging failed:', error);
}

// Create and render the application
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(<App />);
  console.log('✅ DFS Manager Portal initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize application:', error);

  // Fallback error display
  document.body.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f9fafb;
      font-family: system-ui, -apple-system, sans-serif;
      padding: 20px;
    ">
      <div style="
        max-width: 400px;
        text-align: center;
        background: white;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      ">
        <div style="color: #ef4444; font-size: 48px; margin-bottom: 20px;">⚠️</div>
        <h1 style="color: #111827; margin-bottom: 16px; font-size: 20px;">Application Failed to Load</h1>
        <p style="color: #6b7280; margin-bottom: 24px; line-height: 1.5;">
          We're sorry, but the DFS Manager Portal failed to initialize. Please try refreshing the page.
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            background: #3b82f6;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
          "
        >
          Refresh Page
        </button>
      </div>
    </div>
  `;
}