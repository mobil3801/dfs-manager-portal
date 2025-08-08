
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'

// Pages
import LoginPage from '@/pages/LoginPage'
import OnAuthSuccessPage from '@/pages/OnAuthSuccessPage'
import Dashboard from '@/pages/Dashboard'
import HomePage from '@/pages/HomePage'
import AdminSetupPage from '@/pages/AdminSetupPage'

// Admin Pages
import AdminPanel from '@/pages/Admin/AdminPanel'
import UserManagement from '@/pages/Admin/UserManagement'
import SMSManagement from '@/pages/Admin/SMSManagement'

// Core Pages
import EmployeeList from '@/pages/Employees/EmployeeList'
import EmployeeForm from '@/pages/Employees/EmployeeForm'
import ProductList from '@/pages/Products/ProductList'
import ProductForm from '@/pages/Products/ProductForm'
import SalesReportList from '@/pages/Sales/SalesReportList'
import SalesReportForm from '@/pages/Sales/SalesReportForm'
import DeliveryList from '@/pages/Delivery/DeliveryList'
import DeliveryForm from '@/pages/Delivery/DeliveryForm'
import LicenseList from '@/pages/Licenses/LicenseList'
import LicenseForm from '@/pages/Licenses/LicenseForm'

import NotFound from '@/pages/NotFound'
import { Loader2 } from 'lucide-react'

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <HomePage />
                  </PublicRoute>
                } 
              />

              {/* Auth success handler */}
              <Route path="/onauthsuccess" element={<OnAuthSuccessPage />} />

              {/* Setup route */}
              <Route 
                path="/admin-setup" 
                element={
                  <ProtectedRoute>
                    <AdminSetupPage />
                  </ProtectedRoute>
                } 
              />

              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Employee Management */}
              <Route 
                path="/employees" 
                element={
                  <ProtectedRoute>
                    <EmployeeList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employees/new" 
                element={
                  <ProtectedRoute>
                    <EmployeeForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employees/:id/edit" 
                element={
                  <ProtectedRoute>
                    <EmployeeForm />
                  </ProtectedRoute>
                } 
              />

              {/* Product Management */}
              <Route 
                path="/products" 
                element={
                  <ProtectedRoute>
                    <ProductList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/products/new" 
                element={
                  <ProtectedRoute>
                    <ProductForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/products/:id/edit" 
                element={
                  <ProtectedRoute>
                    <ProductForm />
                  </ProtectedRoute>
                } 
              />

              {/* Sales Reports */}
              <Route 
                path="/sales" 
                element={
                  <ProtectedRoute>
                    <SalesReportList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sales/new" 
                element={
                  <ProtectedRoute>
                    <SalesReportForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sales/:id/edit" 
                element={
                  <ProtectedRoute>
                    <SalesReportForm />
                  </ProtectedRoute>
                } 
              />

              {/* Deliveries */}
              <Route 
                path="/deliveries" 
                element={
                  <ProtectedRoute>
                    <DeliveryList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/deliveries/new" 
                element={
                  <ProtectedRoute>
                    <DeliveryForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/deliveries/:id/edit" 
                element={
                  <ProtectedRoute>
                    <DeliveryForm />
                  </ProtectedRoute>
                } 
              />

              {/* Licenses */}
              <Route 
                path="/licenses" 
                element={
                  <ProtectedRoute>
                    <LicenseList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/licenses/new" 
                element={
                  <ProtectedRoute>
                    <LicenseForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/licenses/:id/edit" 
                element={
                  <ProtectedRoute>
                    <LicenseForm />
                  </ProtectedRoute>
                } 
              />

              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/sms" 
                element={
                  <AdminRoute>
                    <SMSManagement />
                  </AdminRoute>
                } 
              />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
