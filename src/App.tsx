import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import RealTimeDataProvider from '@/components/RealTimeDataProvider';
import { getAutoCleanupService } from '@/services/autoCleanupService';
import { GlobalErrorBoundary } from './components/ErrorBoundary';
import EnhancedGlobalErrorBoundary from './components/ErrorBoundary/EnhancedGlobalErrorBoundary';
import InvalidCharacterErrorBoundary from './components/ErrorBoundary/InvalidCharacterErrorBoundary';
import InvariantErrorRecovery from './components/ErrorBoundary/InvariantErrorRecovery';

import DashboardLayout from './components/Layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import EmployeeList from './pages/Employees/EmployeeList';
import EmployeeForm from './pages/Employees/EmployeeForm';
import SalesReportList from './pages/Sales/SalesReportList';
import SalesReportForm from './pages/Sales/SalesReportForm';
import VendorList from './pages/Vendors/VendorList';
import VendorForm from './pages/Vendors/VendorForm';
import OrderList from './pages/Orders/OrderList';
import OrderForm from './pages/Orders/OrderForm';
import LicenseList from './pages/Licenses/LicenseList';
import LicenseForm from './pages/Licenses/LicenseForm';
import SalaryList from './pages/Salary/SalaryList';
import SalaryForm from './pages/Salary/SalaryForm';
import InventoryAlerts from './pages/Inventory/InventoryAlerts';
import AlertSettings from './pages/Inventory/AlertSettings';
import GasDeliveryInventory from './pages/Inventory/GasDeliveryInventory';
import DeliveryList from './pages/Delivery/DeliveryList';
import DeliveryForm from './pages/Delivery/DeliveryForm';
import AppSettings from './pages/Settings/AppSettings';
import AdminPanel from './pages/Admin/AdminPanel';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import SiteManagement from './pages/Admin/SiteManagement';
import SystemLogs from './pages/Admin/SystemLogs';
import SecuritySettings from './pages/Admin/SecuritySettings';
import SMSAlertManagement from './pages/Admin/SMSAlertManagement';
import ErrorRecoveryPage from './pages/Admin/ErrorRecoveryPage';
import MemoryMonitoring from './pages/Admin/MemoryMonitoring';
import DatabaseMonitoring from './pages/Admin/DatabaseMonitoring';
import AuditMonitoring from './pages/Admin/AuditMonitoring';
import DatabaseAutoSyncPage from './pages/Admin/DatabaseAutoSync';
import SupabaseConnectionTestPage from './pages/Admin/SupabaseConnectionTest';
import DevelopmentMonitoringPage from './pages/Admin/DevelopmentMonitoring';
import RoleTestingPage from './pages/Admin/RoleTestingPage';
import AdvancedRealTimeFeatures from './pages/Admin/AdvancedRealTimeFeatures';
import RealtimeManagement from './pages/Admin/RealtimeManagement';
import ErrorMonitoringPage from './pages/Admin/ErrorMonitoringPage';
import InvalidCharacterErrorDemo from './components/InvalidCharacterErrorDemo';
import MemoryMonitoringDashboard from './components/MemoryMonitoringDashboard';
import SessionManagerDashboard from './components/SessionManagerDashboard';
import IntelligentCacheManager from './components/IntelligentCacheManager';
import LoginPage from './pages/LoginPage';
import OnAuthSuccessPage from './pages/OnAuthSuccessPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFound from './pages/NotFound';

// Create a client with memory-optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: parseInt(import.meta.env.VITE_CACHE_DURATION_MINUTES || '15') * 60 * 1000,
      cacheTime: parseInt(import.meta.env.VITE_DATA_RETENTION_MINUTES || '30') * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

// Initialize auto cleanup service
const autoCleanupService = getAutoCleanupService();

// Make query client available globally for cleanup
(window as any).reactQueryClient = queryClient;

function App() {
  // Setup memory management
  React.useEffect(() => {
    // Global error handler for memory issues
    const handleMemoryError = (error: ErrorEvent) => {
      if (error.message.includes('out of memory') || error.message.includes('Maximum call stack')) {
        console.error('Memory error detected, forcing cleanup:', error);
        autoCleanupService.forceCleanup();
      }
    };
    
    window.addEventListener('error', handleMemoryError);
    
    // Global unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('memory') || event.reason?.message?.includes('heap')) {
        console.error('Memory-related promise rejection:', event.reason);
        autoCleanupService.forceCleanup();
      }
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleMemoryError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  return (
    <InvariantErrorRecovery autoRecover={true} maxRetries={3}>
      <EnhancedGlobalErrorBoundary>
        <GlobalErrorBoundary>
          <InvalidCharacterErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SupabaseAuthProvider>
            <AuthProvider>
              <RealTimeDataProvider>
                <TooltipProvider>
                  <Router>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/onauthsuccess" element={<OnAuthSuccessPage />} />
                      <Route path="/resetpassword" element={<ResetPasswordPage />} />
                      
                      {/* Protected routes */}
                      <Route path="/" element={<DashboardLayout />}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        
                        {/* Products routes */}
                        <Route path="products" element={<ProductList />} />
                        <Route path="products/new" element={<ProductForm />} />
                        <Route path="products/edit/:id" element={<ProductForm />} />
                        
                        {/* Employees routes */}
                        <Route path="employees" element={<EmployeeList />} />
                        <Route path="employees/new" element={<EmployeeForm />} />
                        <Route path="employees/edit/:id" element={<EmployeeForm />} />
                        
                        {/* Sales routes */}
                        <Route path="sales" element={<SalesReportList />} />
                        <Route path="sales/new" element={<SalesReportForm />} />
                        <Route path="sales/edit/:id" element={<SalesReportForm />} />
                        
                        {/* Vendors routes */}
                        <Route path="vendors" element={<VendorList />} />
                        <Route path="vendors/new" element={<VendorForm />} />
                        <Route path="vendors/edit/:id" element={<VendorForm />} />
                        
                        {/* Orders routes */}
                        <Route path="orders" element={<OrderList />} />
                        <Route path="orders/new" element={<OrderForm />} />
                        <Route path="orders/edit/:id" element={<OrderForm />} />
                        
                        {/* Licenses routes */}
                        <Route path="licenses" element={<LicenseList />} />
                        <Route path="licenses/new" element={<LicenseForm />} />
                        <Route path="licenses/edit/:id" element={<LicenseForm />} />
                        
                        {/* Salary routes */}
                        <Route path="salary" element={<SalaryList />} />
                        <Route path="salary/new" element={<SalaryForm />} />
                        <Route path="salary/:id" element={<SalaryForm />} />
                        <Route path="salary/:id/edit" element={<SalaryForm />} />
                        
                        {/* Inventory routes */}
                        <Route path="inventory/alerts" element={<InventoryAlerts />} />
                        <Route path="inventory/settings" element={<AlertSettings />} />
                        
                        {/* Gas Delivery routes */}
                        <Route path="gas-delivery" element={<GasDeliveryInventory />} />
                        
                        {/* Delivery routes */}
                        <Route path="delivery" element={<DeliveryList />} />
                        <Route path="delivery/new" element={<DeliveryForm />} />
                        <Route path="delivery/edit/:id" element={<DeliveryForm />} />
                        
                        {/* Settings routes */}
                        <Route path="settings" element={<AppSettings />} />
                        
                        {/* Admin routes */}
                        <Route path="admin" element={<AdminPanel />} />
                        <Route path="admin/dashboard" element={<AdminDashboard />} />
                        <Route path="admin/user-management" element={<UserManagement />} />
                        <Route path="admin/site-management" element={<SiteManagement />} />
                        <Route path="admin/system-logs" element={<SystemLogs />} />
                        <Route path="admin/security-settings" element={<SecuritySettings />} />
                        <Route path="admin/sms-alert-management" element={<SMSAlertManagement />} />
                        <Route path="admin/error-recovery" element={<ErrorRecoveryPage />} />
                        <Route path="admin/memory-monitoring" element={<MemoryMonitoring />} />
                        <Route path="admin/database-monitoring" element={<DatabaseMonitoring />} />
                        <Route path="admin/audit-monitoring" element={<AuditMonitoring />} />
                        <Route path="admin/database-autosync" element={<DatabaseAutoSyncPage />} />
                        <Route path="admin/supabase-test" element={<SupabaseConnectionTestPage />} />
                        <Route path="admin/development-monitoring" element={<DevelopmentMonitoringPage />} />
                        <Route path="admin/role-testing" element={<RoleTestingPage />} />
                        <Route path="admin/advanced-realtime" element={<AdvancedRealTimeFeatures />} />
                        <Route path="admin/realtime-management" element={<RealtimeManagement />} />
                        <Route path="admin/error-monitoring" element={<ErrorMonitoringPage />} />
                        <Route path="admin/memory-dashboard" element={<MemoryMonitoringDashboard />} />
                        <Route path="admin/session-manager" element={<SessionManagerDashboard />} />
                        <Route path="admin/cache-manager" element={<IntelligentCacheManager />} />
                        <Route path="admin/invalid-character-demo" element={<InvalidCharacterErrorDemo />} />
                      </Route>
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Router>
                  <Toaster />
                </TooltipProvider>
              </RealTimeDataProvider>
            </AuthProvider>
          </SupabaseAuthProvider>
        </QueryClientProvider>
          </InvalidCharacterErrorBoundary>
        </GlobalErrorBoundary>
      </EnhancedGlobalErrorBoundary>
    </InvariantErrorRecovery>);

}

export default App;