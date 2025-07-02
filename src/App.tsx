import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { GlobalErrorBoundary } from '@/components/ErrorBoundary';
import AppInitializer from '@/components/AppInitializer';

// Pages
import LoginPage from '@/pages/LoginPage';
import OnAuthSuccessPage from '@/pages/OnAuthSuccessPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import Dashboard from '@/pages/Dashboard';
import UserManagement from '@/pages/UserManagement';
import ProtectedRoute from '@/components/ProtectedRoute';

// Other existing pages
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
import { AlertSettingsPage } from '@/pages/Inventory/AlertSettings';
import GasDeliveryInventory from '@/pages/Inventory/GasDeliveryInventory';
import DeliveryForm from '@/pages/Delivery/DeliveryForm';
import DeliveryList from '@/pages/Delivery/DeliveryList';
import AppSettings from '@/pages/Settings/AppSettings';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppInitializer>
            <Router>
              <div className="App">
                <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/onauthsuccess" element={<OnAuthSuccessPage />} />
                <Route path="/resetpassword" element={<ResetPasswordPage />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/users" element={
                <ProtectedRoute requireAdmin>
                    <UserManagement />
                  </ProtectedRoute>
                } />
                
                <Route path="/products" element={
                <ProtectedRoute>
                    <ProductList />
                  </ProtectedRoute>
                } />
                
                <Route path="/products/new" element={
                <ProtectedRoute>
                    <ProductForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/products/:id" element={
                <ProtectedRoute>
                    <ProductForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/employees" element={
                <ProtectedRoute>
                    <EmployeeList />
                  </ProtectedRoute>
                } />
                
                <Route path="/employees/new" element={
                <ProtectedRoute>
                    <EmployeeForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/employees/:id" element={
                <ProtectedRoute>
                    <EmployeeForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/sales" element={
                <ProtectedRoute>
                    <SalesReportList />
                  </ProtectedRoute>
                } />
                
                <Route path="/sales/new" element={
                <ProtectedRoute>
                    <SalesReportForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/sales/:id" element={
                <ProtectedRoute>
                    <SalesReportForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/vendors" element={
                <ProtectedRoute>
                    <VendorList />
                  </ProtectedRoute>
                } />
                
                <Route path="/vendors/new" element={
                <ProtectedRoute>
                    <VendorForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/vendors/:id" element={
                <ProtectedRoute>
                    <VendorForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/orders" element={
                <ProtectedRoute>
                    <OrderList />
                  </ProtectedRoute>
                } />
                
                <Route path="/orders/new" element={
                <ProtectedRoute>
                    <OrderForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/orders/:id" element={
                <ProtectedRoute>
                    <OrderForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/licenses" element={
                <ProtectedRoute>
                    <LicenseList />
                  </ProtectedRoute>
                } />
                
                <Route path="/licenses/new" element={
                <ProtectedRoute>
                    <LicenseForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/licenses/:id" element={
                <ProtectedRoute>
                    <LicenseForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/salary" element={
                <ProtectedRoute>
                    <SalaryList />
                  </ProtectedRoute>
                } />
                
                <Route path="/salary/new" element={
                <ProtectedRoute>
                    <SalaryForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/salary/:id" element={
                <ProtectedRoute>
                    <SalaryForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/inventory/alerts" element={
                <ProtectedRoute>
                    <InventoryAlerts />
                  </ProtectedRoute>
                } />
                
                <Route path="/inventory/settings" element={
                <ProtectedRoute>
                    <AlertSettingsPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/inventory/gas" element={
                <ProtectedRoute>
                    <GasDeliveryInventory />
                  </ProtectedRoute>
                } />
                
                <Route path="/delivery" element={
                <ProtectedRoute>
                    <DeliveryList />
                  </ProtectedRoute>
                } />
                
                <Route path="/delivery/new" element={
                <ProtectedRoute>
                    <DeliveryForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/delivery/:id" element={
                <ProtectedRoute>
                    <DeliveryForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/settings" element={
                <ProtectedRoute>
                    <AppSettings />
                  </ProtectedRoute>
                } />
                
                {/* Default redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              
                <Toaster />
              </div>
            </Router>
          </AppInitializer>
        </AuthProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>);

}

export default App;