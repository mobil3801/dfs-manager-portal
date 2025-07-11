import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ModuleAccessProvider } from '@/contexts/ModuleAccessContext';
import { GlobalErrorBoundary } from '@/components/ErrorBoundary';
import AuthDebugger from '@/components/AuthDebugger';
import { setupIntelligentPreloading, RoutePreloader } from '@/utils/lazyRoutes';
import OptimizedLoader, { SmartSkeleton } from '@/components/OptimizedLoader';

// Layout
import DashboardLayout from '@/components/Layout/DashboardLayout';

// Core Pages (loaded immediately)
import Dashboard from '@/pages/Dashboard';
import LoginPage from '@/pages/LoginPage';
import OnAuthSuccessPage from '@/pages/OnAuthSuccessPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import NotFound from '@/pages/NotFound';

// Optimized lazy loading with better error handling
const createOptimizedLazyRoute = (importFn: () => Promise<any>, componentName: string) => {
  return React.lazy(async () => {
    try {
      const module = await importFn();
      return module;
    } catch (error) {
      console.error(`Failed to load ${componentName}:`, error);
      // Return a fallback component
      return {
        default: () =>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Failed to load {componentName}
              </h2>
              <p className="text-gray-600 mb-4">
                Please try refreshing the page or contact support if the problem persists.
              </p>
              <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">

                Refresh Page
              </button>
            </div>
          </div>

      };
    }
  });
};

// Lazy-loaded Feature Pages with optimized loading
const ProductList = createOptimizedLazyRoute(() => import('@/pages/Products/ProductList'), 'ProductList');
const ProductForm = createOptimizedLazyRoute(() => import('@/pages/Products/ProductForm'), 'ProductForm');
const EmployeeList = createOptimizedLazyRoute(() => import('@/pages/Employees/EmployeeList'), 'EmployeeList');
const EmployeeForm = createOptimizedLazyRoute(() => import('@/pages/Employees/EmployeeForm'), 'EmployeeForm');
const SalesReportList = createOptimizedLazyRoute(() => import('@/pages/Sales/SalesReportList'), 'SalesReportList');
const SalesReportForm = createOptimizedLazyRoute(() => import('@/pages/Sales/SalesReportForm'), 'SalesReportForm');
const VendorList = createOptimizedLazyRoute(() => import('@/pages/Vendors/VendorList'), 'VendorList');
const VendorForm = createOptimizedLazyRoute(() => import('@/pages/Vendors/VendorForm'), 'VendorForm');
const OrderList = createOptimizedLazyRoute(() => import('@/pages/Orders/OrderList'), 'OrderList');
const OrderForm = createOptimizedLazyRoute(() => import('@/pages/Orders/OrderForm'), 'OrderForm');
const LicenseList = createOptimizedLazyRoute(() => import('@/pages/Licenses/LicenseList'), 'LicenseList');
const LicenseForm = createOptimizedLazyRoute(() => import('@/pages/Licenses/LicenseForm'), 'LicenseForm');
const SalaryList = createOptimizedLazyRoute(() => import('@/pages/Salary/SalaryList'), 'SalaryList');
const SalaryForm = createOptimizedLazyRoute(() => import('@/pages/Salary/SalaryForm'), 'SalaryForm');
const DeliveryList = createOptimizedLazyRoute(() => import('@/pages/Delivery/DeliveryList'), 'DeliveryList');
const DeliveryForm = createOptimizedLazyRoute(() => import('@/pages/Delivery/DeliveryForm'), 'DeliveryForm');
const AppSettings = createOptimizedLazyRoute(() => import('@/pages/Settings/AppSettings'), 'AppSettings');

// Lazy-loaded Admin Pages with optimized loading
const AdminPanel = createOptimizedLazyRoute(() => import('@/pages/Admin/AdminPanel'), 'AdminPanel');
const UserManagement = createOptimizedLazyRoute(() => import('@/pages/Admin/UserManagement'), 'UserManagement');
const SiteManagement = createOptimizedLazyRoute(() => import('@/pages/Admin/SiteManagement'), 'SiteManagement');
const SystemLogs = createOptimizedLazyRoute(() => import('@/pages/Admin/SystemLogs'), 'SystemLogs');
const SecuritySettings = createOptimizedLazyRoute(() => import('@/pages/Admin/SecuritySettings'), 'SecuritySettings');
const SMSManagement = createOptimizedLazyRoute(() => import('@/pages/Admin/SMSManagement'), 'SMSManagement');
const UserValidationTestPage = createOptimizedLazyRoute(() => import('@/pages/Admin/UserValidationTestPage'), 'UserValidationTestPage');
const AuthDiagnosticPage = createOptimizedLazyRoute(() => import('@/pages/AuthDiagnosticPage'), 'AuthDiagnosticPage');
const ModuleAccessPage = createOptimizedLazyRoute(() => import('@/pages/Admin/ModuleAccessPage'), 'ModuleAccessPage');
const NavigationDebugPage = createOptimizedLazyRoute(() => import('@/pages/Admin/NavigationDebugPage'), 'NavigationDebugPage');
const ProfilePictureDemo = createOptimizedLazyRoute(() => import('@/components/ProfilePictureDemo'), 'ProfilePictureDemo');
const OverflowTestPage = createOptimizedLazyRoute(() => import('@/pages/OverflowTestPage'), 'OverflowTestPage');
const OverflowTestingPage = createOptimizedLazyRoute(() => import('@/pages/OverflowTestingPage'), 'OverflowTestingPage');
const FileUploadTestPage = createOptimizedLazyRoute(() => import('@/components/FileUploadTestPage'), 'FileUploadTestPage');
const DatabaseMonitoring = createOptimizedLazyRoute(() => import('@/pages/Admin/DatabaseMonitoring'), 'DatabaseMonitoring');
const AuditMonitoring = createOptimizedLazyRoute(() => import('@/pages/Admin/AuditMonitoring'), 'AuditMonitoring');

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

// Enhanced Loading Components
const LoadingSpinner = () =>
<div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading DFS Manager Portal...</p>
      <p className="text-sm text-gray-500 mt-2">Initializing authentication system...</p>
    </div>
  </div>;


// Enhanced page loading with component-specific skeletons
const EnhancedPageLoading = ({ componentName }: {componentName?: string;}) =>
<div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <OptimizedLoader
      componentName={componentName}
      showProgress={true}
      showRetry={true}
      slowLoadingTimeout={3000}
      onRetry={() => window.location.reload()} />

    </div>
  </div>;


// Optimized Lazy Route Wrapper
const OptimizedLazyRoute = ({
  children,
  componentName



}: {children: React.ReactNode;componentName?: string;}) =>
<Suspense fallback={<EnhancedPageLoading componentName={componentName} />}>
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

  // Setup intelligent preloading after authentication
  React.useEffect(() => {
    if (isInitialized && user) {
      setupIntelligentPreloading();

      // Preload based on user role
      if (user.role === 'admin' || user.role === 'super_admin') {
        RoutePreloader.preloadAdminRoutes();
      }

      // Preload common routes
      RoutePreloader.preloadDashboardRoutes();
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
            <Route path="products" element={<OptimizedLazyRoute componentName="ProductList"><ProductList /></OptimizedLazyRoute>} />
            <Route path="products/new" element={<OptimizedLazyRoute componentName="ProductForm"><ProductForm /></OptimizedLazyRoute>} />
            <Route path="products/:id/edit" element={<OptimizedLazyRoute componentName="ProductForm"><ProductForm /></OptimizedLazyRoute>} />
            
            {/* Employees */}
            <Route path="employees" element={<OptimizedLazyRoute componentName="EmployeeList"><EmployeeList /></OptimizedLazyRoute>} />
            <Route path="employees/new" element={<OptimizedLazyRoute componentName="EmployeeForm"><EmployeeForm /></OptimizedLazyRoute>} />
            <Route path="employees/:id/edit" element={<OptimizedLazyRoute componentName="EmployeeForm"><EmployeeForm /></OptimizedLazyRoute>} />
            
            {/* Sales */}
            <Route path="sales" element={<OptimizedLazyRoute componentName="SalesReportList"><SalesReportList /></OptimizedLazyRoute>} />
            <Route path="sales/new" element={<OptimizedLazyRoute componentName="SalesReportForm"><SalesReportForm /></OptimizedLazyRoute>} />
            <Route path="sales/:id/edit" element={<OptimizedLazyRoute componentName="SalesReportForm"><SalesReportForm /></OptimizedLazyRoute>} />
            
            {/* Vendors */}
            <Route path="vendors" element={<OptimizedLazyRoute componentName="VendorList"><VendorList /></OptimizedLazyRoute>} />
            <Route path="vendors/new" element={<OptimizedLazyRoute componentName="VendorForm"><VendorForm /></OptimizedLazyRoute>} />
            <Route path="vendors/:id/edit" element={<OptimizedLazyRoute componentName="VendorForm"><VendorForm /></OptimizedLazyRoute>} />
            
            {/* Orders */}
            <Route path="orders" element={<OptimizedLazyRoute componentName="OrderList"><OrderList /></OptimizedLazyRoute>} />
            <Route path="orders/new" element={<OptimizedLazyRoute componentName="OrderForm"><OrderForm /></OptimizedLazyRoute>} />
            <Route path="orders/:id/edit" element={<OptimizedLazyRoute componentName="OrderForm"><OrderForm /></OptimizedLazyRoute>} />
            
            {/* Licenses */}
            <Route path="licenses" element={<OptimizedLazyRoute componentName="LicenseList"><LicenseList /></OptimizedLazyRoute>} />
            <Route path="licenses/new" element={<OptimizedLazyRoute componentName="LicenseForm"><LicenseForm /></OptimizedLazyRoute>} />
            <Route path="licenses/:id/edit" element={<OptimizedLazyRoute componentName="LicenseForm"><LicenseForm /></OptimizedLazyRoute>} />
            
            {/* Salary */}
            <Route path="salary" element={<OptimizedLazyRoute componentName="SalaryList"><SalaryList /></OptimizedLazyRoute>} />
            <Route path="salary/new" element={<OptimizedLazyRoute componentName="SalaryForm"><SalaryForm /></OptimizedLazyRoute>} />
            <Route path="salary/:id/edit" element={<OptimizedLazyRoute componentName="SalaryForm"><SalaryForm /></OptimizedLazyRoute>} />
            
            {/* Delivery */}
            <Route path="delivery" element={<OptimizedLazyRoute componentName="DeliveryList"><DeliveryList /></OptimizedLazyRoute>} />
            <Route path="delivery/new" element={<OptimizedLazyRoute componentName="DeliveryForm"><DeliveryForm /></OptimizedLazyRoute>} />
            <Route path="delivery/:id/edit" element={<OptimizedLazyRoute componentName="DeliveryForm"><DeliveryForm /></OptimizedLazyRoute>} />
            
            {/* Settings */}
            <Route path="settings" element={<OptimizedLazyRoute componentName="AppSettings"><AppSettings /></OptimizedLazyRoute>} />
            
            {/* Test Pages */}
            <Route path="profile-picture-demo" element={<OptimizedLazyRoute componentName="ProfilePictureDemo"><ProfilePictureDemo /></OptimizedLazyRoute>} />
            <Route path="overflow-test" element={<OptimizedLazyRoute componentName="OverflowTestPage"><OverflowTestPage /></OptimizedLazyRoute>} />
            <Route path="overflow-testing" element={<OptimizedLazyRoute componentName="OverflowTestingPage"><OverflowTestingPage /></OptimizedLazyRoute>} />
            <Route path="file-upload-test" element={<OptimizedLazyRoute componentName="FileUploadTestPage"><FileUploadTestPage /></OptimizedLazyRoute>} />
            
            {/* Admin Routes */}
            <Route path="admin" element={<OptimizedLazyRoute componentName="AdminPanel"><AdminPanel /></OptimizedLazyRoute>} />
            <Route path="admin/users" element={<OptimizedLazyRoute componentName="UserManagement"><UserManagement /></OptimizedLazyRoute>} />
            <Route path="admin/sites" element={<OptimizedLazyRoute componentName="SiteManagement"><SiteManagement /></OptimizedLazyRoute>} />
            <Route path="admin/logs" element={<OptimizedLazyRoute componentName="SystemLogs"><SystemLogs /></OptimizedLazyRoute>} />
            <Route path="admin/security" element={<OptimizedLazyRoute componentName="SecuritySettings"><SecuritySettings /></OptimizedLazyRoute>} />
            <Route path="admin/sms" element={<OptimizedLazyRoute componentName="SMSManagement"><SMSManagement /></OptimizedLazyRoute>} />
            <Route path="admin/user-validation" element={<OptimizedLazyRoute componentName="UserValidationTestPage"><UserValidationTestPage /></OptimizedLazyRoute>} />
            <Route path="auth-diagnostic" element={<OptimizedLazyRoute componentName="AuthDiagnosticPage"><AuthDiagnosticPage /></OptimizedLazyRoute>} />
            <Route path="admin/module-access" element={<OptimizedLazyRoute componentName="ModuleAccessPage"><ModuleAccessPage /></OptimizedLazyRoute>} />
            <Route path="admin/navigation-debug" element={<OptimizedLazyRoute componentName="NavigationDebugPage"><NavigationDebugPage /></OptimizedLazyRoute>} />
            <Route path="admin/database" element={<OptimizedLazyRoute componentName="DatabaseMonitoring"><DatabaseMonitoring /></OptimizedLazyRoute>} />
            <Route path="admin/audit" element={<OptimizedLazyRoute componentName="AuditMonitoring"><AuditMonitoring /></OptimizedLazyRoute>} />
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