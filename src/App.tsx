import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ModuleAccessProvider } from '@/contexts/ModuleAccessContext';
import { GlobalErrorBoundary } from '@/components/ErrorBoundary';
import AuthDebugger from '@/components/AuthDebugger';
import { preloadCriticalRoutes, preloadAdminRoutes } from '@/utils/preloadRoutes';

// Layout
import DashboardLayout from '@/components/Layout/DashboardLayout';

// Core Pages (loaded immediately)
import Dashboard from '@/pages/Dashboard';
import LoginPage from '@/pages/LoginPage';
import OnAuthSuccessPage from '@/pages/OnAuthSuccessPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import NotFound from '@/pages/NotFound';

// Lazy-loaded Feature Pages
const ProductList = React.lazy(() => import('@/pages/Products/ProductList'));
const ProductForm = React.lazy(() => import('@/pages/Products/ProductForm'));
const EmployeeList = React.lazy(() => import('@/pages/Employees/EmployeeList'));
const EmployeeForm = React.lazy(() => import('@/pages/Employees/EmployeeForm'));
const SalesReportList = React.lazy(() => import('@/pages/Sales/SalesReportList'));
const SalesReportForm = React.lazy(() => import('@/pages/Sales/SalesReportForm'));
const VendorList = React.lazy(() => import('@/pages/Vendors/VendorList'));
const VendorForm = React.lazy(() => import('@/pages/Vendors/VendorForm'));
const OrderList = React.lazy(() => import('@/pages/Orders/OrderList'));
const OrderForm = React.lazy(() => import('@/pages/Orders/OrderForm'));
const LicenseList = React.lazy(() => import('@/pages/Licenses/LicenseList'));
const LicenseForm = React.lazy(() => import('@/pages/Licenses/LicenseForm'));
const SalaryList = React.lazy(() => import('@/pages/Salary/SalaryList'));
const SalaryForm = React.lazy(() => import('@/pages/Salary/SalaryForm'));
const DeliveryList = React.lazy(() => import('@/pages/Delivery/DeliveryList'));
const DeliveryForm = React.lazy(() => import('@/pages/Delivery/DeliveryForm'));
const AppSettings = React.lazy(() => import('@/pages/Settings/AppSettings'));

// Lazy-loaded Admin Pages
const AdminPanel = React.lazy(() => import('@/pages/Admin/AdminPanel'));
const UserManagement = React.lazy(() => import('@/pages/Admin/UserManagement'));
const SiteManagement = React.lazy(() => import('@/pages/Admin/SiteManagement'));
const SystemLogs = React.lazy(() => import('@/pages/Admin/SystemLogs'));
const SecuritySettings = React.lazy(() => import('@/pages/Admin/SecuritySettings'));
const SMSManagement = React.lazy(() => import('@/pages/Admin/SMSManagement'));
const UserValidationTestPage = React.lazy(() => import('@/pages/Admin/UserValidationTestPage'));
const AuthDiagnosticPage = React.lazy(() => import('@/pages/AuthDiagnosticPage'));
const ModuleAccessPage = React.lazy(() => import('@/pages/Admin/ModuleAccessPage'));
const NavigationDebugPage = React.lazy(() => import('@/pages/Admin/NavigationDebugPage'));
const ProfilePictureDemo = React.lazy(() => import('@/components/ProfilePictureDemo'));
const OverflowTestPage = React.lazy(() => import('@/pages/OverflowTestPage'));
const OverflowTestingPage = React.lazy(() => import('@/pages/OverflowTestingPage'));
const FileUploadTestPage = React.lazy(() => import('@/components/FileUploadTestPage'));
const DatabaseMonitoring = React.lazy(() => import('@/pages/Admin/DatabaseMonitoring'));
const AuditMonitoring = React.lazy(() => import('@/pages/Admin/AuditMonitoring'));

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: false,
      refetchOnReconnect: 'always'
    },
    mutations: {
      retry: 1
    }
  }
});

// Loading Spinner Component
const LoadingSpinner = () =>
<div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading DFS Manager Portal...</p>
      <p className="text-sm text-gray-500 mt-2">Initializing authentication system...</p>
    </div>
  </div>;

// Page Loading Component for lazy-loaded routes
const PageLoading = () =>
<div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading page...</p>
    </div>
  </div>;

// Lazy Route Wrapper Component
const LazyRoute = ({ children }: {children: React.ReactNode;}) =>
<Suspense fallback={<PageLoading />}>
    {children}
  </Suspense>;



// Error Display Component
const AuthError = ({ error, onRetry }: {error: string;onRetry: () => void;}) =>
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
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">

            Try Again
          </button>
          <button
          onClick={() => window.location.href = '/login'}
          className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">

            Go to Login
          </button>
        </div>
      </div>
    </div>
  </div>;


// Protected Route Component with improved error handling
const ProtectedRoute: React.FC<{children: React.ReactNode;}> = ({ children }) => {
  const { isAuthenticated, isLoading, authError, isInitialized, refreshUserData } = useAuth();

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return <LoadingSpinner />;
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
  const { isInitialized, user } = useAuth();

  // Show loading during initial authentication setup
  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  // Preload critical routes after authentication
  React.useEffect(() => {
    if (isInitialized && user) {
      preloadCriticalRoutes();

      // Preload admin routes if user has admin access
      if (user.role === 'admin' || user.role === 'super_admin') {
        preloadAdminRoutes();
      }
    }
  }, [isInitialized, user]);

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
            
            {/* Products */}
            <Route path="products" element={<LazyRoute><ProductList /></LazyRoute>} />
            <Route path="products/new" element={<LazyRoute><ProductForm /></LazyRoute>} />
            <Route path="products/:id/edit" element={<LazyRoute><ProductForm /></LazyRoute>} />
            
            {/* Employees */}
            <Route path="employees" element={<LazyRoute><EmployeeList /></LazyRoute>} />
            <Route path="employees/new" element={<LazyRoute><EmployeeForm /></LazyRoute>} />
            <Route path="employees/:id/edit" element={<LazyRoute><EmployeeForm /></LazyRoute>} />
            
            {/* Sales */}
            <Route path="sales" element={<LazyRoute><SalesReportList /></LazyRoute>} />
            <Route path="sales/new" element={<LazyRoute><SalesReportForm /></LazyRoute>} />
            <Route path="sales/:id/edit" element={<LazyRoute><SalesReportForm /></LazyRoute>} />
            
            {/* Vendors */}
            <Route path="vendors" element={<LazyRoute><VendorList /></LazyRoute>} />
            <Route path="vendors/new" element={<LazyRoute><VendorForm /></LazyRoute>} />
            <Route path="vendors/:id/edit" element={<LazyRoute><VendorForm /></LazyRoute>} />
            
            {/* Orders */}
            <Route path="orders" element={<LazyRoute><OrderList /></LazyRoute>} />
            <Route path="orders/new" element={<LazyRoute><OrderForm /></LazyRoute>} />
            <Route path="orders/:id/edit" element={<LazyRoute><OrderForm /></LazyRoute>} />
            
            {/* Licenses */}
            <Route path="licenses" element={<LazyRoute><LicenseList /></LazyRoute>} />
            <Route path="licenses/new" element={<LazyRoute><LicenseForm /></LazyRoute>} />
            <Route path="licenses/:id/edit" element={<LazyRoute><LicenseForm /></LazyRoute>} />
            
            {/* Salary */}
            <Route path="salary" element={<LazyRoute><SalaryList /></LazyRoute>} />
            <Route path="salary/new" element={<LazyRoute><SalaryForm /></LazyRoute>} />
            <Route path="salary/:id/edit" element={<LazyRoute><SalaryForm /></LazyRoute>} />
            
            {/* Delivery */}
            <Route path="delivery" element={<LazyRoute><DeliveryList /></LazyRoute>} />
            <Route path="delivery/new" element={<LazyRoute><DeliveryForm /></LazyRoute>} />
            <Route path="delivery/:id/edit" element={<LazyRoute><DeliveryForm /></LazyRoute>} />
            
            {/* Settings */}
            <Route path="settings" element={<LazyRoute><AppSettings /></LazyRoute>} />
            
            {/* Profile Picture Demo */}
            <Route path="profile-picture-demo" element={<LazyRoute><ProfilePictureDemo /></LazyRoute>} />
            <Route path="overflow-test" element={<LazyRoute><OverflowTestPage /></LazyRoute>} />
            <Route path="overflow-testing" element={<LazyRoute><OverflowTestingPage /></LazyRoute>} />
            <Route path="file-upload-test" element={<LazyRoute><FileUploadTestPage /></LazyRoute>} />
            
            {/* Admin Routes */}
            <Route path="admin" element={<LazyRoute><AdminPanel /></LazyRoute>} />
            <Route path="admin/users" element={<LazyRoute><UserManagement /></LazyRoute>} />
            <Route path="admin/sites" element={<LazyRoute><SiteManagement /></LazyRoute>} />
            <Route path="admin/logs" element={<LazyRoute><SystemLogs /></LazyRoute>} />
            <Route path="admin/security" element={<LazyRoute><SecuritySettings /></LazyRoute>} />
            <Route path="admin/sms" element={<LazyRoute><SMSManagement /></LazyRoute>} />
            <Route path="admin/user-validation" element={<LazyRoute><UserValidationTestPage /></LazyRoute>} />
            <Route path="auth-diagnostic" element={<LazyRoute><AuthDiagnosticPage /></LazyRoute>} />
            <Route path="admin/module-access" element={<LazyRoute><ModuleAccessPage /></LazyRoute>} />
            <Route path="admin/navigation-debug" element={<LazyRoute><NavigationDebugPage /></LazyRoute>} />

            <Route path="admin/database" element={<LazyRoute><DatabaseMonitoring /></LazyRoute>} />
            <Route path="admin/audit" element={<LazyRoute><AuditMonitoring /></LazyRoute>} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Auth Debugger - Only show in development or for debugging */}
        <AuthDebugger />
      </div>
    </Router>);

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
    </QueryClientProvider>);

}

export default App;