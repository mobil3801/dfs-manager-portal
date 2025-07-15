import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ModuleAccessProvider } from '@/contexts/ModuleAccessContext';
import { GlobalErrorBoundary } from '@/components/ErrorBoundary';
import AuthDebugger from '@/components/AuthDebugger';

// Layout - Keep as direct import since it's needed for all routes
import DashboardLayout from '@/components/Layout/DashboardLayout';

// Core pages - Keep as direct imports for immediate loading
import LoginPage from '@/pages/LoginPage';
import OnAuthSuccessPage from '@/pages/OnAuthSuccessPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/Dashboard';

// Use optimized loading components
import { LoadingSpinner, PageLoadingSpinner } from '@/components/LoadingComponents/OptimizedSpinners';

// Use the enhanced lazy routes
import { LazyRoutes, preloadRoutes, preloadBasedOnRole } from '@/routes/lazyRoutes';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000 // 10 minutes
    }
  }
});

// Error Display Component
const AuthError = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full text-center">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="space-y-2">
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Optimized lazy route wrapper
const LazyRouteWrapper = ({ 
  component: Component, 
  routeName 
}: { 
  component: React.ComponentType<any>, 
  routeName: string 
}) => (
  <Suspense fallback={<PageLoadingSpinner route={routeName} compact />}>
    <Component />
  </Suspense>
);

// Enhanced Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, authError, isInitialized, refreshUserData, user } = useAuth();

  // Preload routes based on user role once authenticated
  React.useEffect(() => {
    if (isAuthenticated && user?.role) {
      preloadBasedOnRole(user.role);
    }
  }, [isAuthenticated, user?.role]);

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return <LoadingSpinner message="Loading DFS Manager Portal..." />;
  }

  // Show error if there's a critical authentication error
  if (authError && authError.includes('Failed to load user data')) {
    return <AuthError error={authError} onRetry={refreshUserData} />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main App Router Component
const AppRouter = () => {
  const { isInitialized } = useAuth();

  // Preload critical routes on app initialization
  React.useEffect(() => {
    if (isInitialized) {
      // Delay preloading to not interfere with initial load
      setTimeout(preloadRoutes, 2000);
    }
  }, [isInitialized]);

  // Show loading during initial authentication setup
  if (!isInitialized) {
    return <LoadingSpinner message="Initializing authentication system..." />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onauthsuccess" element={<OnAuthSuccessPage />} />
          <Route path="/resetpassword" element={<ResetPasswordPage />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Feature Routes with Lazy Loading */}
            <Route path="products" element={<LazyRouteWrapper component={LazyRoutes.ProductList} routeName="Products" />} />
            <Route path="products/new" element={<LazyRouteWrapper component={LazyRoutes.ProductForm} routeName="New Product" />} />
            <Route path="products/:id/edit" element={<LazyRouteWrapper component={LazyRoutes.ProductForm} routeName="Edit Product" />} />
            
            <Route path="employees" element={<LazyRouteWrapper component={LazyRoutes.EmployeeList} routeName="Employees" />} />
            <Route path="employees/new" element={<LazyRouteWrapper component={LazyRoutes.EmployeeForm} routeName="New Employee" />} />
            <Route path="employees/:id/edit" element={<LazyRouteWrapper component={LazyRoutes.EmployeeForm} routeName="Edit Employee" />} />
            
            <Route path="sales" element={<LazyRouteWrapper component={LazyRoutes.SalesReportList} routeName="Sales Reports" />} />
            <Route path="sales/new" element={<LazyRouteWrapper component={LazyRoutes.SalesReportForm} routeName="New Sales Report" />} />
            <Route path="sales/:id/edit" element={<LazyRouteWrapper component={LazyRoutes.SalesReportForm} routeName="Edit Sales Report" />} />
            
            <Route path="vendors" element={<LazyRouteWrapper component={LazyRoutes.VendorList} routeName="Vendors" />} />
            <Route path="vendors/new" element={<LazyRouteWrapper component={LazyRoutes.VendorForm} routeName="New Vendor" />} />
            <Route path="vendors/:id/edit" element={<LazyRouteWrapper component={LazyRoutes.VendorForm} routeName="Edit Vendor" />} />
            
            <Route path="orders" element={<LazyRouteWrapper component={LazyRoutes.OrderList} routeName="Orders" />} />
            <Route path="orders/new" element={<LazyRouteWrapper component={LazyRoutes.OrderForm} routeName="New Order" />} />
            <Route path="orders/:id/edit" element={<LazyRouteWrapper component={LazyRoutes.OrderForm} routeName="Edit Order" />} />
            
            <Route path="licenses" element={<LazyRouteWrapper component={LazyRoutes.LicenseList} routeName="Licenses" />} />
            <Route path="licenses/new" element={<LazyRouteWrapper component={LazyRoutes.LicenseForm} routeName="New License" />} />
            <Route path="licenses/:id/edit" element={<LazyRouteWrapper component={LazyRoutes.LicenseForm} routeName="Edit License" />} />
            
            <Route path="salary" element={<LazyRouteWrapper component={LazyRoutes.SalaryList} routeName="Salary Records" />} />
            <Route path="salary/new" element={<LazyRouteWrapper component={LazyRoutes.SalaryForm} routeName="New Salary Record" />} />
            <Route path="salary/:id/edit" element={<LazyRouteWrapper component={LazyRoutes.SalaryForm} routeName="Edit Salary Record" />} />
            
            <Route path="delivery" element={<LazyRouteWrapper component={LazyRoutes.DeliveryList} routeName="Delivery Records" />} />
            <Route path="delivery/new" element={<LazyRouteWrapper component={LazyRoutes.DeliveryForm} routeName="New Delivery Record" />} />
            <Route path="delivery/:id/edit" element={<LazyRouteWrapper component={LazyRoutes.DeliveryForm} routeName="Edit Delivery Record" />} />
            
            <Route path="settings" element={<LazyRouteWrapper component={LazyRoutes.AppSettings} routeName="Settings" />} />
            
            {/* Admin Routes */}
            <Route path="admin" element={<LazyRouteWrapper component={LazyRoutes.AdminPanel} routeName="Admin Panel" />} />
            <Route path="admin/users" element={<LazyRouteWrapper component={LazyRoutes.UserManagement} routeName="User Management" />} />
            <Route path="admin/sites" element={<LazyRouteWrapper component={LazyRoutes.SiteManagement} routeName="Site Management" />} />
            <Route path="admin/logs" element={<LazyRouteWrapper component={LazyRoutes.SystemLogs} routeName="System Logs" />} />
            <Route path="admin/security" element={<LazyRouteWrapper component={LazyRoutes.SecuritySettings} routeName="Security Settings" />} />
            <Route path="admin/sms" element={<LazyRouteWrapper component={LazyRoutes.SMSManagement} routeName="SMS Management" />} />
            <Route path="admin/user-validation" element={<LazyRouteWrapper component={LazyRoutes.UserValidationTestPage} routeName="User Validation Test" />} />
            <Route path="admin/auth-diagnostic" element={<LazyRouteWrapper component={LazyRoutes.AuthDiagnosticPage} routeName="Auth Diagnostic" />} />
            <Route path="admin/module-access" element={<LazyRouteWrapper component={LazyRoutes.ModuleAccessPage} routeName="Module Access" />} />
            <Route path="admin/navigation-debug" element={<LazyRouteWrapper component={LazyRoutes.NavigationDebugPage} routeName="Navigation Debug" />} />
            <Route path="admin/database" element={<LazyRouteWrapper component={LazyRoutes.DatabaseMonitoring} routeName="Database Monitoring" />} />
            <Route path="admin/audit" element={<LazyRouteWrapper component={LazyRoutes.AuditMonitoring} routeName="Audit Monitoring" />} />
            
            {/* Demo/Testing Routes */}
            <Route path="profile-picture-demo" element={<LazyRouteWrapper component={LazyRoutes.ProfilePictureDemo} routeName="Profile Picture Demo" />} />
            <Route path="overflow-test" element={<LazyRouteWrapper component={LazyRoutes.OverflowTestPage} routeName="Overflow Test" />} />
            <Route path="overflow-testing" element={<LazyRouteWrapper component={LazyRoutes.OverflowTestingPage} routeName="Overflow Testing" />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Auth Debugger - Only show in development */}
        {process.env.NODE_ENV === 'development' && <AuthDebugger />}
      </div>
    </Router>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GlobalErrorBoundary>
          <AuthProvider>
            <ModuleAccessProvider>
              <AppRouter />
            </ModuleAccessProvider>
          </AuthProvider>
        </GlobalErrorBoundary>
      </TooltipProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
