import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Simple imports to avoid complexity
import HomePage from '@/pages/HomePage';
import SupabaseLoginPage from '@/pages/SupabaseLoginPage';
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<SupabaseLoginPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </TooltipProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;