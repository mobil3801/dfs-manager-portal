
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { GlobalErrorBoundary } from '@/components/ErrorBoundary';

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
import InventoryAlerts from '@/pages/Inventory/InventoryAlerts';
import AlertSettings from '@/pages/Inventory/AlertSettings';
import GasDeliveryInventory from '@/pages/Inventory/GasDeliveryInventory';
import DeliveryList from '@/pages/Delivery/DeliveryList';
import DeliveryForm from '@/pages/Delivery/DeliveryForm';
import AppSettings from '@/pages/Settings/AppSettings';

// Admin Pages
import AdminPanel from '@/pages/Admin/AdminPanel';
import UserManagement from '@/pages/Admin/UserManagement';
import SiteManagement from '@/pages/Admin/SiteManagement';
import SystemLogs from '@/pages/Admin/SystemLogs';
import SecuritySettings from '@/pages/Admin/SecuritySettings';
import SMSAlertManagement from '@/pages/Admin/SMSAlertManagement';
import DatabaseMonitoring from '@/pages/Admin/DatabaseMonitoring';
import AuditMonitoring from '@/pages/Admin/AuditMonitoring';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await window.ezsite.apis.getUserInfo();
        setIsAuthenticated(!response.error);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <GlobalErrorBoundary>
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
                    
                    {/* Inventory */}
                    <Route path="inventory/alerts" element={<InventoryAlerts />} />
                    <Route path="inventory/settings" element={<AlertSettings />} />
                    <Route path="inventory/gas-delivery" element={<GasDeliveryInventory />} />
                    
                    {/* Delivery */}
                    <Route path="delivery" element={<DeliveryList />} />
                    <Route path="delivery/new" element={<DeliveryForm />} />
                    <Route path="delivery/:id/edit" element={<DeliveryForm />} />
                    
                    {/* Settings */}
                    <Route path="settings" element={<AppSettings />} />
                    
                    {/* Admin Routes */}
                    <Route path="admin" element={<AdminPanel />} />
                    <Route path="admin/users" element={<UserManagement />} />
                    <Route path="admin/sites" element={<SiteManagement />} />
                    <Route path="admin/logs" element={<SystemLogs />} />
                    <Route path="admin/security" element={<SecuritySettings />} />
                    <Route path="admin/sms" element={<SMSAlertManagement />} />
                    <Route path="admin/database" element={<DatabaseMonitoring />} />
                    <Route path="admin/audit" element={<AuditMonitoring />} />
                  </Route>
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
          </GlobalErrorBoundary>
        </AuthProvider>
      </TooltipProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
