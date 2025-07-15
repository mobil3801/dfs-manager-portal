import { lazy } from 'react';

// Lazy load all feature pages to reduce initial bundle size
export const LazyRoutes = {
  // Product Management
  ProductList: lazy(() => import('@/pages/Products/ProductList')),
  ProductForm: lazy(() => import('@/pages/Products/ProductForm')),
  
  // Employee Management
  EmployeeList: lazy(() => import('@/pages/Employees/EmployeeList')),
  EmployeeForm: lazy(() => import('@/pages/Employees/EmployeeForm')),
  
  // Sales Management
  SalesReportList: lazy(() => import('@/pages/Sales/SalesReportList')),
  SalesReportForm: lazy(() => import('@/pages/Sales/SalesReportForm')),
  
  // Vendor Management
  VendorList: lazy(() => import('@/pages/Vendors/VendorList')),
  VendorForm: lazy(() => import('@/pages/Vendors/VendorForm')),
  
  // Order Management
  OrderList: lazy(() => import('@/pages/Orders/OrderList')),
  OrderForm: lazy(() => import('@/pages/Orders/OrderForm')),
  
  // License Management
  LicenseList: lazy(() => import('@/pages/Licenses/LicenseList')),
  LicenseForm: lazy(() => import('@/pages/Licenses/LicenseForm')),
  
  // Salary Management
  SalaryList: lazy(() => import('@/pages/Salary/SalaryList')),
  SalaryForm: lazy(() => import('@/pages/Salary/SalaryForm')),
  
  // Delivery Management
  DeliveryList: lazy(() => import('@/pages/Delivery/DeliveryList')),
  DeliveryForm: lazy(() => import('@/pages/Delivery/DeliveryForm')),
  
  // Settings
  AppSettings: lazy(() => import('@/pages/Settings/AppSettings')),
  
  // Admin Pages
  AdminPanel: lazy(() => import('@/pages/Admin/AdminPanel')),
  UserManagement: lazy(() => import('@/pages/Admin/UserManagement')),
  SiteManagement: lazy(() => import('@/pages/Admin/SiteManagement')),
  SystemLogs: lazy(() => import('@/pages/Admin/SystemLogs')),
  SecuritySettings: lazy(() => import('@/pages/Admin/SecuritySettings')),
  SMSManagement: lazy(() => import('@/pages/Admin/SMSManagement')),
  UserValidationTestPage: lazy(() => import('@/pages/Admin/UserValidationTestPage')),
  AuthDiagnosticPage: lazy(() => import('@/pages/AuthDiagnosticPage')),
  ModuleAccessPage: lazy(() => import('@/pages/Admin/ModuleAccessPage')),
  NavigationDebugPage: lazy(() => import('@/pages/Admin/NavigationDebugPage')),
  DatabaseMonitoring: lazy(() => import('@/pages/Admin/DatabaseMonitoring')),
  AuditMonitoring: lazy(() => import('@/pages/Admin/AuditMonitoring')),
  
  // Demo/Testing Pages
  ProfilePictureDemo: lazy(() => import('@/components/ProfilePictureDemo')),
  OverflowTestPage: lazy(() => import('@/pages/OverflowTestPage')),
  OverflowTestingPage: lazy(() => import('@/pages/OverflowTestingPage')),
} as const;

// Preload critical routes that are commonly accessed
export const preloadRoutes = () => {
  // Preload dashboard-related routes
  LazyRoutes.ProductList.preload?.();
  LazyRoutes.EmployeeList.preload?.();
  LazyRoutes.SalesReportList.preload?.();
};

// Route groups for better organization
export const RouteGroups = {
  core: ['ProductList', 'EmployeeList', 'SalesReportList'],
  admin: ['AdminPanel', 'UserManagement', 'SiteManagement'],
  management: ['VendorList', 'OrderList', 'LicenseList', 'SalaryList', 'DeliveryList'],
  settings: ['AppSettings'],
  testing: ['ProfilePictureDemo', 'OverflowTestPage', 'OverflowTestingPage']
} as const;

export default LazyRoutes;
