import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';

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
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router>
          <Routes>
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
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Router>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>);

}

export default App;