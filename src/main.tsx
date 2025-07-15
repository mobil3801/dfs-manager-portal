import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeMemoryLeakDetection } from './utils/memoryLeakIntegration';
import { setupInvalidCharacterErrorMonitor } from './utils/errorPreventionHelper';

// Initialize performance monitoring
initializeMemoryLeakDetection();
setupInvalidCharacterErrorMonitor();

// Initialize bundle optimizations
const initializeBundleOptimizations = async () => {
  // Dynamic import for bundle optimization utilities
  const { initializeOptimizations } = await import('./utils/bundleOptimization');
  initializeOptimizations();
};

// Initialize optimizations after app starts
initializeBundleOptimizations();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
