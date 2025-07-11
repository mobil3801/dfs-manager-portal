import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ModuleAccessProvider } from '@/contexts/ModuleAccessContext';
import { ResponsiveLayoutProvider } from '@/contexts/ResponsiveLayoutContext';
import { GlobalErrorBoundary } from '@/components/ErrorBoundary';
import AuthDebugger from '@/components/AuthDebugger';


// Layout
import DashboardLayout from '@/components/Layout/DashboardLayout';

// Pages
import Dashboard from '@/pages/Dashboard';
import LoginPage from '@/pages/LoginPage';
import OnAuthSuccessPage from '@/pages/OnAuthSuccessPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import NotFound from '@/pages/NotFound';

// Feature Pages
import ProductList from '@/pages/Products/ProductList';
import ProductForm from '@/pages/Products/ProductForm';
import EmployeeList from '@/pages/Employees/EmployeeList';
import EmployeeForm from '@/pages/Employees/EmployeeForm';
import SalesReportList from '@/pages/Sales/SalesReportList';
import SalesReportForm from '@/pages/Sales/SalesReportForm';
import VendorList from '@/pages/Vendors/VendorList';
import VendorForm from '@/pages/Vendors/VendorForm';
import OrderList from '@/pages/Orders/OrderList';
import OrderForm from '@/pages/Orders/OrderForm';
import LicenseList from '@/pages/Licenses/LicenseList';
import LicenseForm from '@/pages/Licenses/LicenseForm';
import SalaryList from '@/pages/Salary/SalaryList';
import SalaryForm from '@/pages/Salary/SalaryForm';
import DeliveryList from '@/pages/Delivery/DeliveryList';
import DeliveryForm from '@/pages/Delivery/DeliveryForm';
import AppSettings from '@/pages/Settings/AppSettings';

// Admin Pages
import AdminPanel from '@/pages/Admin/AdminPanel';
import UserManagement from '@/pages/Admin/UserManagement';
import SiteManagement from '@/pages/Admin/SiteManagement';
import SystemLogs from '@/pages/Admin/SystemLogs';
import SecuritySettings from '@/pages/Admin/SecuritySettings';
import SMSManagement from '@/pages/Admin/SMSManagement';
import UserValidationTestPage from '@/pages/Admin/UserValidationTestPage';
import AuthDiagnosticPage from '@/pages/AuthDiagnosticPage';
import ModuleAccessPage from '@/pages/Admin/ModuleAccessPage';
import ProfilePictureDemo from '@/components/ProfilePictureDemo';
import DeviceInfoDisplay from '@/components/DeviceInfoDisplay';

import DatabaseMonitoring from '@/pages/Admin/DatabaseMonitoring';
import AuditMonitoring from '@/pages/Admin/AuditMonitoring';

const DeviceInfoDemo = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Device Detection Demo</h1>
      <p className="mt-2 text-gray-600">
        This page demonstrates the enhanced device detection and responsive layout system.
      </p>
    </div>
    <DeviceInfoDisplay showDetailed={true} />
  </div>
);

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
const LoadingSpinner = () =>
<div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading DFS Manager Portal...</p>
      <p className="text-sm text-gray-500 mt-2">Initializing authentication system...</p>
    </div>
  </div>;


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
  const { isInitialized } = useAuth();

  // Show loading during initial authentication setup
  if (!isInitialized) {
    return <LoadingSpinner />;
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
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            
            {/* Employees */}
            <Route path="employees" element={<EmployeeList />} />
            <Route path="employees/new" element={<EmployeeForm />} />
            <Route path="employees/:id/edit" element={<EmployeeForm />} />
            
            {/* Sales */}
            <Route path="sales" element={<SalesReportList />} />
            <Route path="sales/new" element={<SalesReportForm />} />
            <Route path="sales/:id/edit" element={<SalesReportForm />} />
            
            {/* Vendors */}
            <Route path="vendors" element={<VendorList />} />
            <Route path="vendors/new" element={<VendorForm />} />
            <Route path="vendors/:id/edit" element={<VendorForm />} />
            
            {/* Orders */}
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/new" element={<OrderForm />} />
            <Route path="orders/:id/edit" element={<OrderForm />} />
            
            {/* Licenses */}
            <Route path="licenses" element={<LicenseList />} />
            <Route path="licenses/new" element={<LicenseForm />} />
            <Route path="licenses/:id/edit" element={<LicenseForm />} />
            
            {/* Salary */}
            <Route path="salary" element={<SalaryList />} />
            <Route path="salary/new" element={<SalaryForm />} />
            <Route path="salary/:id/edit" element={<SalaryForm />} />
            
            {/* Delivery */}
            <Route path="delivery" element={<DeliveryList />} />
            <Route path="delivery/new" element={<DeliveryForm />} />
            <Route path="delivery/:id/edit" element={<DeliveryForm />} />
            
            {/* Settings */}
            <Route path="settings" element={<AppSettings />} />
            
            {/* Profile Picture Demo */}
            <Route path="profile-picture-demo" element={<ProfilePictureDemo />} />
            
            {/* Device Info Demo */}
            <Route path="device-info" element={<DeviceInfoDemo />} />
            
            {/* Admin Routes */}
            <Route path="admin" element={<AdminPanel />} />
            <Route path="admin/users" element={<UserManagement />} />
            <Route path="admin/sites" element={<SiteManagement />} />
            <Route path="admin/logs" element={<SystemLogs />} />
            <Route path="admin/security" element={<SecuritySettings />} />
            <Route path="admin/sms" element={<SMSManagement />} />
            <Route path="admin/user-validation" element={<UserValidationTestPage />} />
            <Route path="admin/auth-diagnostic" element={<AuthDiagnosticPage />} />
            <Route path="admin/module-access" element={<ModuleAccessPage />} />

            <Route path="admin/database" element={<DatabaseMonitoring />} />
            <Route path="admin/audit" element={<AuditMonitoring />} />
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
              <ResponsiveLayoutProvider>
                <AppRouter />
              </ResponsiveLayoutProvider>
            </ModuleAccessProvider>
          </AuthProvider>
        </GlobalErrorBoundary>
      </TooltipProvider>
      <Toaster />
    </QueryClientProvider>);

}

export default App;