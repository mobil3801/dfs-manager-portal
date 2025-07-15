import { lazy, ComponentType } from 'react';

// Enhanced lazy loading with better chunk naming and preloading
const createLazyComponent = (importFn: () => Promise<{ default: ComponentType<any> }>, chunkName: string) => {
  const LazyComponent = lazy(importFn);
  // Add chunk name for better debugging
  (LazyComponent as any).displayName = `Lazy(${chunkName})`;
  return LazyComponent;
};

// Core feature pages with proper chunk naming
export const LazyRoutes = {
  // Product Management
  ProductList: createLazyComponent(
    () => import('@/pages/Products/ProductList'), 
    'ProductList'
  ),
  ProductForm: createLazyComponent(
    () => import('@/pages/Products/ProductForm'), 
    'ProductForm'
  ),

  // Employee Management
  EmployeeList: createLazyComponent(
    () => import('@/pages/Employees/EmployeeList'), 
    'EmployeeList'
  ),
  EmployeeForm: createLazyComponent(
    () => import('@/pages/Employees/EmployeeForm'), 
    'EmployeeForm'
  ),

  // Sales Management
  SalesReportList: createLazyComponent(
    () => import('@/pages/Sales/SalesReportList'), 
    'SalesReportList'
  ),
  SalesReportForm: createLazyComponent(
    () => import('@/pages/Sales/SalesReportForm'), 
    'SalesReportForm'
  ),

  // Vendor Management
  VendorList: createLazyComponent(
    () => import('@/pages/Vendors/VendorList'), 
    'VendorList'
  ),
  VendorForm: createLazyComponent(
    () => import('@/pages/Vendors/VendorForm'), 
    'VendorForm'
  ),

  // Order Management
  OrderList: createLazyComponent(
    () => import('@/pages/Orders/OrderList'), 
    'OrderList'
  ),
  OrderForm: createLazyComponent(
    () => import('@/pages/Orders/OrderForm'), 
    'OrderForm'
  ),

  // License Management
  LicenseList: createLazyComponent(
    () => import('@/pages/Licenses/LicenseList'), 
    'LicenseList'
  ),
  LicenseForm: createLazyComponent(
    () => import('@/pages/Licenses/LicenseForm'), 
    'LicenseForm'
  ),

  // Salary Management
  SalaryList: createLazyComponent(
    () => import('@/pages/Salary/SalaryList'), 
    'SalaryList'
  ),
  SalaryForm: createLazyComponent(
    () => import('@/pages/Salary/SalaryForm'), 
    'SalaryForm'
  ),

  // Delivery Management
  DeliveryList: createLazyComponent(
    () => import('@/pages/Delivery/DeliveryList'), 
    'DeliveryList'
  ),
  DeliveryForm: createLazyComponent(
    () => import('@/pages/Delivery/DeliveryForm'), 
    'DeliveryForm'
  ),

  // Settings
  AppSettings: createLazyComponent(
    () => import('@/pages/Settings/AppSettings'), 
    'AppSettings'
  ),

  // Admin Pages - Heavy components that should be loaded separately
  AdminPanel: createLazyComponent(
    () => import('@/pages/Admin/AdminPanel'), 
    'AdminPanel'
  ),
  UserManagement: createLazyComponent(
    () => import('@/pages/Admin/UserManagement'), 
    'UserManagement'
  ),
  SiteManagement: createLazyComponent(
    () => import('@/pages/Admin/SiteManagement'), 
    'SiteManagement'
  ),
  SystemLogs: createLazyComponent(
    () => import('@/pages/Admin/SystemLogs'), 
    'SystemLogs'
  ),
  SecuritySettings: createLazyComponent(
    () => import('@/pages/Admin/SecuritySettings'), 
    'SecuritySettings'
  ),
  SMSManagement: createLazyComponent(
    () => import('@/pages/Admin/SMSManagement'), 
    'SMSManagement'
  ),
  UserValidationTestPage: createLazyComponent(
    () => import('@/pages/Admin/UserValidationTestPage'), 
    'UserValidationTestPage'
  ),
  AuthDiagnosticPage: createLazyComponent(
    () => import('@/pages/AuthDiagnosticPage'), 
    'AuthDiagnosticPage'
  ),
  ModuleAccessPage: createLazyComponent(
    () => import('@/pages/Admin/ModuleAccessPage'), 
    'ModuleAccessPage'
  ),
  NavigationDebugPage: createLazyComponent(
    () => import('@/pages/Admin/NavigationDebugPage'), 
    'NavigationDebugPage'
  ),
  DatabaseMonitoring: createLazyComponent(
    () => import('@/pages/Admin/DatabaseMonitoring'), 
    'DatabaseMonitoring'
  ),
  AuditMonitoring: createLazyComponent(
    () => import('@/pages/Admin/AuditMonitoring'), 
    'AuditMonitoring'
  ),

  // Demo/Testing Pages - Load only when needed
  ProfilePictureDemo: createLazyComponent(
    () => import('@/components/ProfilePictureDemo'), 
    'ProfilePictureDemo'
  ),
  OverflowTestPage: createLazyComponent(
    () => import('@/pages/OverflowTestPage'), 
    'OverflowTestPage'
  ),
  OverflowTestingPage: createLazyComponent(
    () => import('@/pages/OverflowTestingPage'), 
    'OverflowTestingPage'
  )
} as const;

// Intelligent preloading strategy
export const preloadRoutes = () => {
  // Preload only the most commonly accessed routes
  const criticalRoutes = [
    LazyRoutes.ProductList,
    LazyRoutes.EmployeeList,
    LazyRoutes.SalesReportList
  ];

  criticalRoutes.forEach(route => {
    if (route.preload) {
      route.preload();
    }
  });
};

// Preload routes based on user navigation patterns
export const preloadBasedOnRole = (userRole: string) => {
  const roleBasedRoutes: Record<string, Array<keyof typeof LazyRoutes>> = {
    'Administrator': ['AdminPanel', 'UserManagement', 'SiteManagement', 'SystemLogs'],
    'Management': ['ProductList', 'EmployeeList', 'SalesReportList', 'VendorList'],
    'Employee': ['ProductList', 'SalesReportList', 'DeliveryList']
  };

  const routesToPreload = roleBasedRoutes[userRole] || [];
  routesToPreload.forEach(routeName => {
    const route = LazyRoutes[routeName];
    if (route?.preload) {
      route.preload();
    }
  });
};

// Conditional preloading based on time of day (for shift-based operations)
export const preloadBasedOnTime = () => {
  const hour = new Date().getHours();
  
  // Business hours - preload core functionality
  if (hour >= 6 && hour <= 22) {
    LazyRoutes.ProductList.preload?.();
    LazyRoutes.SalesReportList.preload?.();
  }
  
  // Off hours - preload admin functionality
  if (hour >= 23 || hour <= 5) {
    LazyRoutes.AdminPanel.preload?.();
    LazyRoutes.SystemLogs.preload?.();
  }
};

// Route groups for better organization and preloading
export const RouteGroups = {
  core: ['ProductList', 'EmployeeList', 'SalesReportList'] as const,
  admin: ['AdminPanel', 'UserManagement', 'SiteManagement', 'SystemLogs', 'SecuritySettings'] as const,
  management: ['VendorList', 'OrderList', 'LicenseList', 'SalaryList', 'DeliveryList'] as const,
  settings: ['AppSettings', 'SMSManagement', 'ModuleAccessPage'] as const,
  testing: ['ProfilePictureDemo', 'OverflowTestPage', 'OverflowTestingPage'] as const,
  monitoring: ['DatabaseMonitoring', 'AuditMonitoring', 'NavigationDebugPage'] as const
} as const;

// Preload entire route groups
export const preloadRouteGroup = (groupName: keyof typeof RouteGroups) => {
  const group = RouteGroups[groupName];
  group.forEach(routeName => {
    const route = LazyRoutes[routeName];
    if (route?.preload) {
      route.preload();
    }
  });
};

export default LazyRoutes;
