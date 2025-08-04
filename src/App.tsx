import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SimpleAuthProvider, useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { GlobalErrorBoundary } from '@/components/ErrorBoundary';
import SimpleLoginPage from '@/pages/SimpleLoginPage';
import SimpleSignupPage from '@/pages/SimpleSignupPage';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  }
});

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading DFS Manager Portal...</p>
      <p className="text-sm text-gray-500 mt-2">Initializing authentication system...</p>
    </div>
  </div>
);

// Page Loading Component for lazy-loaded components
const PageLoader = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
      <p className="text-gray-600">Loading page...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useSimpleAuth();

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main App Router Component
const AppRouter = () => {
  const { isInitialized } = useSimpleAuth();

  // Show loading during initial authentication setup
  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<SimpleLoginPage />} />
          <Route path="/signup" element={<SimpleSignupPage />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Other routes can be added here later */}
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GlobalErrorBoundary>
          <SimpleAuthProvider>
            <AppRouter />
          </SimpleAuthProvider>
        </GlobalErrorBoundary>
      </TooltipProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
