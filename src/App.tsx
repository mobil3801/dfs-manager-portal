import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ModuleAccessProvider } from '@/contexts/ModuleAccessContext';
import { Toaster } from '@/components/ui/toaster';
import GlobalErrorBoundary from '@/components/ErrorBoundary/GlobalErrorBoundary';
import PerformanceMonitoringSystem from '@/components/PerformanceMonitoringSystem';

// Page imports
import LoginPage from '@/pages/LoginPage';
import OnAuthSuccessPage from '@/pages/OnAuthSuccessPage';
import Dashboard from '@/pages/Dashboard';
import HomePage from '@/pages/HomePage';
import NotFound from '@/pages/NotFound';

// Products
import ProductList from '@/pages/Products/ProductList';
import ProductForm from '@/pages/Products/ProductForm';

// Sales Reports
import SalesReportList from '@/pages/Sales/SalesReportList';
import SalesReportForm from '@/pages/Sales/SalesReportForm';

// Employees
import EmployeeList from '@/pages/Employees/EmployeeList';
import EmployeeForm from '@/pages/Employees/EmployeeForm';

// Licenses
import LicenseList from '@/pages/Licenses/LicenseList';
import LicenseForm from '@/pages/Licenses/LicenseForm';

// Deliveries
import DeliveryList from '@/pages/Delivery/DeliveryList';
import DeliveryForm from '@/pages/Delivery/DeliveryForm';

// Orders
import OrderList from '@/pages/Orders/OrderList';
import OrderForm from '@/pages/Orders/OrderForm';

// Vendors
import VendorList from '@/pages/Vendors/VendorList';
import VendorForm from '@/pages/Vendors/VendorForm';

// Salary
import SalaryList from '@/pages/Salary/SalaryList';
import SalaryForm from '@/pages/Salary/SalaryForm';

// Admin
import AdminDashboard from '@/pages/Admin/AdminDashboard';
import UserManagement from '@/pages/Admin/UserManagement';
import SecuritySettings from '@/pages/Admin/SecuritySettings';
import SystemLogs from '@/pages/Admin/SystemLogs';
import SMSManagement from '@/pages/Admin/SMSManagement';
import SiteManagement from '@/pages/Admin/SiteManagement';
import ErrorMonitoringPage from '@/pages/Admin/ErrorMonitoringPage';
import MemoryMonitoring from '@/pages/Admin/MemoryMonitoring';
import NavigationDebugPage from '@/pages/Admin/NavigationDebugPage';
import DevelopmentMonitoring from '@/pages/Admin/DevelopmentMonitoring';
import DatabaseMonitoring from '@/pages/Admin/DatabaseMonitoring';
import AuditMonitoring from '@/pages/Admin/AuditMonitoring';
import ModuleAccessPage from '@/pages/Admin/ModuleAccessPage';
import RoleTestingPage from '@/pages/Admin/RoleTestingPage';
import UserValidationTestPage from '@/pages/Admin/UserValidationTestPage';
import RoleManagementPage from '@/pages/Admin/RoleManagementPage';
import EasyRoleManagement from '@/pages/Admin/EasyRoleManagement';
import AlertSettings from '@/pages/Admin/AlertSettings';
import AdminSetupPage from '@/pages/Admin/AdminSetupPage';
import ComprehensiveAdminPanel from '@/pages/Admin/ComprehensiveAdminPanel';

// Settings
import AppSettings from '@/pages/Settings/AppSettings';

// Test & Debug Pages
import SupabaseTestPage from '@/pages/SupabaseTestPage';
import SupabaseLoginPage from '@/pages/SupabaseLoginPage';
import DocumentSolutionPage from '@/pages/DocumentSolutionPage';
import IDDocumentSolutionPage from '@/pages/IDDocumentSolutionPage';
import DocumentViewerTestPage from '@/pages/DocumentViewerTestPage';
import EnhancedIDDocumentTestPage from '@/pages/EnhancedIDDocumentTestPage';
import DocumentLoadingDebugPage from '@/pages/DocumentLoadingDebugPage';
import IDFileDebugPage from '@/pages/IDFileDebugPage';
import EmployeeTestPage from '@/pages/EmployeeTestPage';
import OverflowTestPage from '@/pages/OverflowTestPage';
import OverflowTestingPage from '@/pages/OverflowTestingPage';
import AuthDiagnosticPage from '@/pages/AuthDiagnosticPage';
import AdminDebugPage from '@/pages/AdminDebugPage';
import AdminEmergencyFixPage from '@/pages/AdminEmergencyFixPage';
import AdminFixSuccessPage from '@/pages/AdminFixSuccessPage';
import CriticalErrorFixPage from '@/pages/CriticalErrorFixPage';
import TestProductsPage from '@/pages/TestProductsPage';
import AuthFlowTestPage from '@/pages/AuthFlowTestPage';

// Layout Components
import DashboardLayout from '@/components/Layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <ModuleAccessProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/onauthsuccess" element={<OnAuthSuccessPage />} />
                <Route path="/supabase-login" element={<SupabaseLoginPage />} />
                <Route path="/supabase-test" element={<SupabaseTestPage />} />
                
                {/* Test & Debug Routes (temporarily public for development) */}
                <Route path="/test-products" element={<TestProductsPage />} />
                <Route path="/document-solution" element={<DocumentSolutionPage />} />
                <Route path="/id-document-solution" element={<IDDocumentSolutionPage />} />
                <Route path="/document-viewer-test" element={<DocumentViewerTestPage />} />
                <Route path="/enhanced-id-test" element={<EnhancedIDDocumentTestPage />} />
                <Route path="/document-loading-debug" element={<DocumentLoadingDebugPage />} />
                <Route path="/id-file-debug" element={<IDFileDebugPage />} />
                <Route path="/employee-test" element={<EmployeeTestPage />} />
                <Route path="/overflow-test" element={<OverflowTestPage />} />
                <Route path="/overflow-testing" element={<OverflowTestingPage />} />
                <Route path="/auth-diagnostic" element={<AuthDiagnosticPage />} />
                <Route path="/admin-debug" element={<AdminDebugPage />} />
                <Route path="/admin-emergency-fix" element={<AdminEmergencyFixPage />} />
                <Route path="/admin-fix-success" element={<AdminFixSuccessPage />} />
                <Route path="/critical-error-fix" element={<CriticalErrorFixPage />} />
                <Route path="/auth-flow-test" element={<AuthFlowTestPage />} />

                {/* Protected Routes */}
                <Route path="/" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <HomePage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Products Routes */}
                <Route path="/products" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <ProductList />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/products/new" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <ProductForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/products/:id/edit" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <ProductForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Sales Routes */}
                <Route path="/sales" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <SalesReportList />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/sales/new" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <SalesReportForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/sales/:id/edit" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <SalesReportForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Employee Routes */}
                <Route path="/employees" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <EmployeeList />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/employees/new" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <EmployeeForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/employees/:id/edit" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <EmployeeForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* License Routes */}
                <Route path="/licenses" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <LicenseList />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/licenses/new" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <LicenseForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/licenses/:id/edit" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <LicenseForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Delivery Routes */}
                <Route path="/deliveries" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <DeliveryList />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/deliveries/new" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <DeliveryForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/deliveries/:id/edit" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <DeliveryForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Order Routes */}
                <Route path="/orders" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <OrderList />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/orders/new" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <OrderForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/orders/:id/edit" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <OrderForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Vendor Routes */}
                <Route path="/vendors" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <VendorList />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/vendors/new" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <VendorForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/vendors/:id/edit" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <VendorForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Salary Routes */}
                <Route path="/salary" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <SalaryList />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/salary/new" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <SalaryForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/salary/:id/edit" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <SalaryForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <AdminDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/comprehensive" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <ComprehensiveAdminPanel />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <UserManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/security" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <SecuritySettings />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/logs" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <SystemLogs />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/sms" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <SMSManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/site" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <SiteManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/errors" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <ErrorMonitoringPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/memory" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <MemoryMonitoring />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/navigation" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <NavigationDebugPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/development" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <DevelopmentMonitoring />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/database" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <DatabaseMonitoring />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/audit" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <AuditMonitoring />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/modules" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <ModuleAccessPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/role-testing" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <RoleTestingPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/validation-test" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <UserValidationTestPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/roles" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <RoleManagementPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/easy-roles" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <EasyRoleManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/alerts" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <AlertSettings />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/setup" element={
                <ProtectedRoute requireAdmin>
                    <DashboardLayout>
                      <AdminSetupPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Settings Routes */}
                <Route path="/settings" element={
                <ProtectedRoute>
                    <DashboardLayout>
                      <AppSettings />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
            <PerformanceMonitoringSystem />
          </Router>
        </ModuleAccessProvider>
      </AuthProvider>
    </GlobalErrorBoundary>);

}

export default App;