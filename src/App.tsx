import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { GlobalErrorBoundary } from './components/ErrorBoundary';
import InvalidCharacterErrorBoundary from './components/ErrorBoundary/InvalidCharacterErrorBoundary';

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
import InvalidCharacterErrorDemo from './components/InvalidCharacterErrorDemo';
import LoginPage from './pages/LoginPage';
import OnAuthSuccessPage from './pages/OnAuthSuccessPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <GlobalErrorBoundary>
      <InvalidCharacterErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SupabaseAuthProvider>
            <AuthProvider>
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
              <Route path="inventory/settings" element={<AppSettings />} />
              
              {/* Gas Delivery routes */}
              <Route path="gas-delivery" element={<GasDeliveryInventory />} />
              
              {/* Delivery routes */}
              <Route path="delivery" element={<DeliveryList />} />
              <Route path="delivery/new" element={<DeliveryForm />} />
              <Route path="delivery/edit/:id" element={<DeliveryForm />} />
              
              {/* Admin routes */}
              <Route path="admin/users" element={<UserManagement />} />
              <Route path="admin/site" element={<SiteManagement />} />
              <Route path="admin/logs" element={<SystemLogs />} />
              <Route path="admin/security" element={<SecuritySettings />} />
              <Route path="admin/sms-alerts" element={<SMSAlertManagement />} />
              <Route path="admin/error-recovery" element={<ErrorRecoveryPage />} />
              <Route path="admin/memory-monitoring" element={<MemoryMonitoring />} />
              <Route path="admin/database-monitoring" element={<DatabaseMonitoring />} />
              <Route path="admin/audit-monitoring" element={<AuditMonitoring />} />
              <Route path="admin/database-autosync" element={<DatabaseAutoSyncPage />} />
              <Route path="admin/supabase-test" element={<SupabaseConnectionTestPage />} />
              <Route path="admin/development-monitoring" element={<DevelopmentMonitoringPage />} />
              <Route path="admin/invalid-character-demo" element={<InvalidCharacterErrorDemo />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
              </Router>
              <Toaster />
              </TooltipProvider>
            </AuthProvider>
          </SupabaseAuthProvider>
        </QueryClientProvider>
      </InvalidCharacterErrorBoundary>
    </GlobalErrorBoundary>);


}

export default App;