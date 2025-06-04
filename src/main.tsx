import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeMemoryLeakDetection } from './utils/memoryLeakIntegration';
import { setupInvalidCharacterErrorMonitor } from './utils/errorPreventionHelper';

// Global error handler for Performance API errors
const originalError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  // Check for Performance API related errors
  if (typeof message === 'string' && (
  message.includes('getEntriesByType is not a function') ||
  message.includes('performance') ||
  message.includes('PerformanceEntry'))) {
    console.warn('Performance API error detected (handled):', message);
    // Don't let Performance API errors crash the app
    return true;
  }

  // Call original error handler if it exists
  if (originalError) {
    return originalError(message, source, lineno, colno, error);
  }

  return false;
};

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason &&
  typeof event.reason.message === 'string' && (
  event.reason.message.includes('getEntriesByType') ||
  event.reason.message.includes('performance'))) {
    console.warn('Performance API promise rejection (handled):', event.reason);
    event.preventDefault();
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

createRoot(document.getElementById("root")!).render(<App />);