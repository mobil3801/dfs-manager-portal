import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import error handling utilities but don't let them crash initialization
import { initializeMemoryLeakDetection } from './utils/memoryLeakIntegration';
import { setupGlobalErrorHandlers } from './utils/globalErrorHandler';

// Safe initialization function
const safeInitialize = async () => {
  try {
    // Initialize error handling first
    setupGlobalErrorHandlers();
    console.log('✅ Global error handlers initialized');
  } catch (error) {
    console.warn('⚠️ Failed to initialize global error handlers:', error);
  }

  try {
    // Initialize memory leak detection
    initializeMemoryLeakDetection();
    console.log('✅ Memory leak detection initialized');
  } catch (error) {
    console.warn('⚠️ Failed to initialize memory leak detection:', error);
  }

  try {
    // Initialize React app
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root element not found');
    }

    const root = createRoot(container);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    console.log('✅ React application initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize React application:', error);
    
    // Show fallback UI
    const container = document.getElementById('root');
    if (container) {
      container.innerHTML = `
        <div style="
          min-height: 100vh; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        ">
          <div style="
            background: white; 
            padding: 2rem; 
            border-radius: 0.5rem; 
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); 
            text-align: center; 
            max-width: 400px; 
            width: 90%;
          ">
            <div style="margin-bottom: 1rem;">
              <svg style="
                width: 48px; 
                height: 48px; 
                color: #dc2626; 
                margin: 0 auto;
              " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h1 style="
              font-size: 1.5rem; 
              font-weight: bold; 
              color: #1f2937; 
              margin-bottom: 0.5rem;
            ">Application Error</h1>
            <p style="
              color: #6b7280; 
              margin-bottom: 1.5rem; 
              line-height: 1.5;
            ">
              The DFS Manager Portal could not load properly. This might be due to network issues or a temporary problem.
            </p>
            <button onclick="window.location.reload()" style="
              background: #3b82f6; 
              color: white; 
              padding: 0.75rem 1.5rem; 
              border: none; 
              border-radius: 0.375rem; 
              font-weight: 500; 
              cursor: pointer; 
              transition: background-color 0.2s;
            " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
              Reload Application
            </button>
            <div style="
              margin-top: 1rem; 
              padding-top: 1rem; 
              border-top: 1px solid #e5e7eb; 
              font-size: 0.875rem; 
              color: #9ca3af;
            ">
              DFS Manager Portal v1.0
            </div>
          </div>
        </div>
      `;
    }
  }
};

// Handle uncaught errors during initialization
window.addEventListener('error', (event) => {
  console.error('Global error during initialization:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection during initialization:', event.reason);
  event.preventDefault();
});

// Initialize the application
safeInitialize().catch((error) => {
  console.error('Critical initialization error:', error);
});