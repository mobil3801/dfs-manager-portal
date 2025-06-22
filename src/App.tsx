import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { DeviceAdaptiveProvider } from '@/contexts/DeviceAdaptiveContext';
import { GlobalErrorBoundary } from '@/components/ErrorBoundary';
import AuthDebugger from '@/components/AuthDebugger';

// Layout Components
import AdaptiveDashboardLayout from '@/components/Layout/AdaptiveDashboardLayout';

// Pages
import Dashboard from '@/pages/Dashboard';
import LoginPage from '@/pages/LoginPage';
import OnAuthSuccessPage from '@/pages/OnAuthSuccessPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import NotFound from '@/pages/NotFound';

// Product Pages
import ProductList from '@/pages/Products/ProductList';
import ProductForm from '@/pages/Products/ProductForm';

// Employee Pages
import EmployeeList from '@/pages/Employees/EmployeeList';
import EmployeeForm from '@/pages/Employees/EmployeeForm';

// Sales Pages
import SalesReportList from '@/pages/Sales/SalesReportList';
import SalesReportForm from '@/pages/Sales/SalesReportForm';

// Vendor Pages
import VendorList from '@/pages/Vendors/VendorList';
import VendorForm from '@/pages/Vendors/VendorForm';

// Order Pages
import OrderList from '@/pages/Orders/OrderList';
import OrderForm from '@/pages/Orders/OrderForm';

// License Pages
import LicenseList from '@/pages/Licenses/LicenseList';
import LicenseForm from '@/pages/Licenses/LicenseForm';

// Salary Pages
import SalaryList from '@/pages/Salary/SalaryList';
import SalaryForm from '@/pages/Salary/SalaryForm';

// Inventory Pages
import InventoryAlerts from '@/pages/Inventory/InventoryAlerts';
import AlertSettings from '@/pages/Inventory/AlertSettings';
import GasDeliveryInventory from '@/pages/Inventory/GasDeliveryInventory';

// Delivery Pages
import DeliveryList from '@/pages/Delivery/DeliveryList';
import DeliveryForm from '@/pages/Delivery/DeliveryForm';

// Settings Pages
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

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DeviceAdaptiveProvider>
          <AuthProvider>
            <GlobalErrorBoundary>
              <Router>
                <div className="App">
                  <AuthDebugger />
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/onauthsuccess" element={<OnAuthSuccessPage />} />
                    <Route path="/resetpassword" element={<ResetPasswordPage />} />
                    
                    {/* Protected Routes with Adaptive Layout */}
                    <Route path="/" element={<AdaptiveDashboardLayout />}>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      
                      {/* Product Routes */}
                      <Route path="products" element={<ProductList />} />
                      <Route path="products/new" element={<ProductForm />} />
                      <Route path="products/:id/edit" element={<ProductForm />} />
                      
                      {/* Employee Routes */}
                      <Route path="employees" element={<EmployeeList />} />
                      <Route path="employees/new" element={<EmployeeForm />} />
                      <Route path="employees/:id/edit" element={<EmployeeForm />} />
                      
                      {/* Sales Routes */}
                      <Route path="sales" element={<SalesReportList />} />
                      <Route path="sales/new" element={<SalesReportForm />} />
                      <Route path="sales/:id/edit" element={<SalesReportForm />} />
                      
                      {/* Vendor Routes */}
                      <Route path="vendors" element={<VendorList />} />
                      <Route path="vendors/new" element={<VendorForm />} />
                      <Route path="vendors/:id/edit" element={<VendorForm />} />
                      
                      {/* Order Routes */}
                      <Route path="orders" element={<OrderList />} />
                      <Route path="orders/new" element={<OrderForm />} />
                      <Route path="orders/:id/edit" element={<OrderForm />} />
                      
                      {/* License Routes */}
                      <Route path="licenses" element={<LicenseList />} />
                      <Route path="licenses/new" element={<LicenseForm />} />
                      <Route path="licenses/:id/edit" element={<LicenseForm />} />
                      
                      {/* Salary Routes */}
                      <Route path="salary" element={<SalaryList />} />
                      <Route path="salary/new" element={<SalaryForm />} />
                      <Route path="salary/:id/edit" element={<SalaryForm />} />
                      
                      {/* Inventory Routes */}
                      <Route path="inventory/alerts" element={<InventoryAlerts />} />
                      <Route path="inventory/settings" element={<AlertSettings />} />
                      <Route path="inventory/gas-delivery" element={<GasDeliveryInventory />} />
                      
                      {/* Delivery Routes */}
                      <Route path="delivery" element={<DeliveryList />} />
                      <Route path="delivery/new" element={<DeliveryForm />} />
                      <Route path="delivery/:id/edit" element={<DeliveryForm />} />
                      
                      {/* Settings Routes */}
                      <Route path="settings" element={<AppSettings />} />
                      
                      {/* Admin Routes */}
                      <Route path="admin" element={<AdminPanel />} />
                      <Route path="admin/users" element={<UserManagement />} />
                      <Route path="admin/sites" element={<SiteManagement />} />
                      <Route path="admin/logs" element={<SystemLogs />} />
                      <Route path="admin/security" element={<SecuritySettings />} />
                      <Route path="admin/sms-alerts" element={<SMSAlertManagement />} />
                      <Route path="admin/database" element={<DatabaseMonitoring />} />
                      <Route path="admin/audit" element={<AuditMonitoring />} />
                    </Route>
                    
                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                </div>
              </Router>
            </GlobalErrorBoundary>
          </AuthProvider>
        </DeviceAdaptiveProvider>
      </TooltipProvider>
    </QueryClientProvider>);

};

export default App;