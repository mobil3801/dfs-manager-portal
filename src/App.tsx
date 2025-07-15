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

// Lazy load feature pages for code splitting
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

// Lazy load admin pages
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
const DatabaseMonitoring = React.lazy(() => import('@/pages/Admin/DatabaseMonitoring'));
const AuditMonitoring = React.lazy(() => import('@/pages/Admin/AuditMonitoring'));

// Lazy load demo/testing pages
const ProfilePictureDemo = React.lazy(() => import('@/components/ProfilePictureDemo'));
const OverflowTestPage = React.lazy(() => import('@/pages/OverflowTestPage'));
const OverflowTestingPage = React.lazy(() => import('@/pages/OverflowTestingPage'));

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

// Enhanced Loading Spinner Component
const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
      <p className="text-sm text-gray-500 mt-2">Please wait...</p>
    </div>
  </div>
);

// Page Loading Component for lazy loaded routes
const PageLoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-gray-600 text-sm">Loading page...</p>
    </div>
  </div>
);

// Error Display Component
const AuthError = ({ error, onRetry }: {error: string; onRetry: () => void;}) => (
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

// Protected Route Component with improved error handling
const ProtectedRoute: React.FC<{children: React.ReactNode;}> = ({ children }) => {
  const { isAuthenticated, isLoading, authError, isInitialized, refreshUserData } = useAuth();

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
            
            {/* Products */}
            <Route path="products" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <ProductList />
              </Suspense>
            } />
            <Route path="products/new" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <ProductForm />
              </Suspense>
            } />
            <Route path="products/:id/edit" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <ProductForm />
              </Suspense>
            } />
            
            {/* Employees */}
            <Route path="employees" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <EmployeeList />
              </Suspense>
            } />
            <Route path="employees/new" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <EmployeeForm />
              </Suspense>
            } />
            <Route path="employees/:id/edit" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <EmployeeForm />
              </Suspense>
            } />
            
            {/* Sales */}
            <Route path="sales" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <SalesReportList />
              </Suspense>
            } />
            <Route path="sales/new" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <SalesReportForm />
              </Suspense>
            } />
            <Route path="sales/:id/edit" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <SalesReportForm />
              </Suspense>
            } />
            
            {/* Vendors */}
            <Route path="vendors" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <VendorList />
              </Suspense>
            } />
            <Route path="vendors/new" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <VendorForm />
              </Suspense>
            } />
            <Route path="vendors/:id/edit" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <VendorForm />
              </Suspense>
            } />
            
            {/* Orders */}
            <Route path="orders" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <OrderList />
              </Suspense>
            } />
            <Route path="orders/new" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <OrderForm />
              </Suspense>
            } />
            <Route path="orders/:id/edit" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <OrderForm />
              </Suspense>
            } />
            
            {/* Licenses */}
            <Route path="licenses" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <LicenseList />
              </Suspense>
            } />
            <Route path="licenses/new" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <LicenseForm />
              </Suspense>
            } />
            <Route path="licenses/:id/edit" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <LicenseForm />
              </Suspense>
            } />
            
            {/* Salary */}
            <Route path="salary" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <SalaryList />
              </Suspense>
            } />
            <Route path="salary/new" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <SalaryForm />
              </Suspense>
            } />
            <Route path="salary/:id/edit" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <SalaryForm />
              </Suspense>
            } />
            
            {/* Delivery */}
            <Route path="delivery" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <DeliveryList />
              </Suspense>
            } />
            <Route path="delivery/new" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <DeliveryForm />
              </Suspense>
            } />
            <Route path="delivery/:id/edit" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <DeliveryForm />
              </Suspense>
            } />
            
            {/* Settings */}
            <Route path="settings" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <AppSettings />
              </Suspense>
            } />
            
            {/* Demo/Testing Pages */}
            <Route path="profile-picture-demo" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <ProfilePictureDemo />
              </Suspense>
            } />
            <Route path="overflow-test" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <OverflowTestPage />
              </Suspense>
            } />
            <Route path="overflow-testing" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <OverflowTestingPage />
              </Suspense>
            } />
            
            {/* Admin Routes */}
            <Route path="admin" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <AdminPanel />
              </Suspense>
            } />
            <Route path="admin/users" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <UserManagement />
              </Suspense>
            } />
            <Route path="admin/sites" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <SiteManagement />
              </Suspense>
            } />
            <Route path="admin/logs" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <SystemLogs />
              </Suspense>
            } />
            <Route path="admin/security" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <SecuritySettings />
              </Suspense>
            } />
            <Route path="admin/sms" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <SMSManagement />
              </Suspense>
            } />
            <Route path="admin/user-validation" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <UserValidationTestPage />
              </Suspense>
            } />
            <Route path="admin/auth-diagnostic" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <AuthDiagnosticPage />
              </Suspense>
            } />
            <Route path="admin/module-access" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <ModuleAccessPage />
              </Suspense>
            } />
            <Route path="admin/navigation-debug" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <NavigationDebugPage />
              </Suspense>
            } />
            <Route path="admin/database" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <DatabaseMonitoring />
              </Suspense>
            } />
            <Route path="admin/audit" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <AuditMonitoring />
              </Suspense>
            } />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Auth Debugger - Only show in development or for debugging */}
        <AuthDebugger />
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
