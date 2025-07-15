import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ModuleAccessProvider } from '@/contexts/ModuleAccessContext';
import { GlobalErrorBoundary } from '@/components/ErrorBoundary';
import AuthDebugger from '@/components/AuthDebugger';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import OnAuthSuccessPage from '@/pages/OnAuthSuccessPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/Dashboard';
import { LoadingComponents } from '@/components/LoadingComponents/OptimizedSpinners';
import { LazyRoutes, initializePreloading } from '@/routes/lazyRoutes';

// Create a query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 1
    }
  }
});

// Optimized loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingComponents.PageLoadingSpinner />
  </div>
);

// Route wrapper with error boundary
const RouteWrapper = ({ children }: { children: React.ReactNode }) => (
  <GlobalErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </GlobalErrorBoundary>
);

function App() {
  useEffect(() => {
    // Initialize preloading strategies
    initializePreloading();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ModuleAccessProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <GlobalErrorBoundary>
                  <AuthDebugger />
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/onauthsuccess" element={<OnAuthSuccessPage />} />
                    <Route path="/resetpassword" element={<ResetPasswordPage />} />
                    
                    {/* Protected routes wrapped in DashboardLayout */}
                    <Route path="/" element={<DashboardLayout />}>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      
                      {/* Product Management */}
                      <Route 
                        path="products" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.ProductList />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="products/new" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.ProductForm />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="products/:id" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.ProductForm />
                          </RouteWrapper>
                        } 
                      />
                      
                      {/* Employee Management */}
                      <Route 
                        path="employees" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.EmployeeList />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="employees/new" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.EmployeeForm />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="employees/:id" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.EmployeeForm />
                          </RouteWrapper>
                        } 
                      />
                      
                      {/* Sales Management */}
                      <Route 
                        path="sales" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.SalesReportList />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="sales/new" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.SalesReportForm />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="sales/:id" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.SalesReportForm />
                          </RouteWrapper>
                        } 
                      />
                      
                      {/* Vendor Management */}
                      <Route 
                        path="vendors" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.VendorList />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="vendors/new" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.VendorForm />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="vendors/:id" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.VendorForm />
                          </RouteWrapper>
                        } 
                      />
                      
                      {/* Order Management */}
                      <Route 
                        path="orders" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.OrderList />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="orders/new" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.OrderForm />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="orders/:id" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.OrderForm />
                          </RouteWrapper>
                        } 
                      />
                      
                      {/* License Management */}
                      <Route 
                        path="licenses" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.LicenseList />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="licenses/new" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.LicenseForm />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="licenses/:id" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.LicenseForm />
                          </RouteWrapper>
                        } 
                      />
                      
                      {/* Salary Management */}
                      <Route 
                        path="salary" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.SalaryList />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="salary/new" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.SalaryForm />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="salary/:id" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.SalaryForm />
                          </RouteWrapper>
                        } 
                      />
                      
                      {/* Delivery Management */}
                      <Route 
                        path="delivery" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.DeliveryList />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="delivery/new" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.DeliveryForm />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="delivery/:id" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.DeliveryForm />
                          </RouteWrapper>
                        } 
                      />
                      
                      {/* Settings */}
                      <Route 
                        path="settings" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.AppSettings />
                          </RouteWrapper>
                        } 
                      />
                      
                      {/* Admin Routes */}
                      <Route 
                        path="admin" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.AdminPanel />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="admin/dashboard" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.AdminDashboard />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="admin/users" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.UserManagement />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="admin/sites" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.SiteManagement />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="admin/logs" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.SystemLogs />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="admin/security" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.SecuritySettings />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="admin/sms" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.SMSManagement />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="admin/roles" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.EasyRoleManagement />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="admin/modules" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.ModuleAccessPage />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="admin/monitoring/database" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.DatabaseMonitoring />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="admin/monitoring/audit" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.AuditMonitoring />
                          </RouteWrapper>
                        } 
                      />
                      
                      {/* Development/Testing Routes */}
                      <Route 
                        path="admin/test/validation" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.UserValidationTestPage />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="admin/test/navigation" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.NavigationDebugPage />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="admin/test/overflow" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.OverflowTestingPage />
                          </RouteWrapper>
                        } 
                      />
                      
                      {/* Utility Routes */}
                      <Route 
                        path="auth-diagnostic" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.AuthDiagnosticPage />
                          </RouteWrapper>
                        } 
                      />
                      <Route 
                        path="admin-setup" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.AdminSetupPage />
                          </RouteWrapper>
                        } 
                      />
                      
                      {/* Demo Routes (Development Only) */}
                      <Route 
                        path="demo/profile-picture" 
                        element={
                          <RouteWrapper>
                            <LazyRoutes.ProfilePictureDemo />
                          </RouteWrapper>
                        } 
                      />
                    </Route>
                    
                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </GlobalErrorBoundary>
              </div>
              <Toaster />
            </Router>
          </ModuleAccessProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
