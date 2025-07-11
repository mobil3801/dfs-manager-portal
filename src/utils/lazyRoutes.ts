import { lazy, ComponentType } from 'react';

/**
 * Lazy route loader with error handling and preloading
 */
export function createLazyRoute<T extends ComponentType<any>>(
importFn: () => Promise<{default: T;}>,
componentName: string)
: T {
  const LazyComponent = lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
      // Return a fallback component
      return {
        default: (() => {
          const React = require('react');
          return React.createElement('div', { className: "flex items-center justify-center p-8" },
          React.createElement('div', { className: "text-center" },
          React.createElement('p', { className: "text-red-600 mb-2" }, `Failed to load ${componentName}`),
          React.createElement('button', {
            onClick: () => window.location.reload(),
            className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          }, 'Retry')
          )
          );
        }) as T
      };
    }
  });

  // Set display name for debugging
  LazyComponent.displayName = `LazyRoute(${componentName})`;

  return LazyComponent;
}

/**
 * Preload a route component
 */
export function preloadRoute(importFn: () => Promise<any>): void {
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.as = 'script';

  // Use a timeout to avoid blocking the main thread
  setTimeout(() => {
    importFn().catch((error) => {
      console.warn('Failed to preload route:', error);
    });
  }, 100);
}

/**
 * Lazy route definitions with optimized imports
 */
export const LazyRoutes = {
  // Core pages
  HomePage: createLazyRoute(
    () => import('../pages/HomePage'),
    'HomePage'
  ),

  LoginPage: createLazyRoute(
    () => import('../pages/LoginPage'),
    'LoginPage'
  ),

  Dashboard: createLazyRoute(
    () => import('../pages/Dashboard'),
    'Dashboard'
  ),

  NotFound: createLazyRoute(
    () => import('../pages/NotFound'),
    'NotFound'
  ),

  // Product pages
  ProductList: createLazyRoute(
    () => import('../pages/Products/ProductList'),
    'ProductList'
  ),

  ProductForm: createLazyRoute(
    () => import('../pages/Products/ProductForm'),
    'ProductForm'
  ),

  // Employee pages
  EmployeeList: createLazyRoute(
    () => import('../pages/Employees/EmployeeList'),
    'EmployeeList'
  ),

  EmployeeForm: createLazyRoute(
    () => import('../pages/Employees/EmployeeForm'),
    'EmployeeForm'
  ),

  // Sales pages
  SalesReportList: createLazyRoute(
    () => import('../pages/Sales/SalesReportList'),
    'SalesReportList'
  ),

  SalesReportForm: createLazyRoute(
    () => import('../pages/Sales/SalesReportForm'),
    'SalesReportForm'
  ),

  // Vendor pages
  VendorList: createLazyRoute(
    () => import('../pages/Vendors/VendorList'),
    'VendorList'
  ),

  VendorForm: createLazyRoute(
    () => import('../pages/Vendors/VendorForm'),
    'VendorForm'
  ),

  // Order pages
  OrderList: createLazyRoute(
    () => import('../pages/Orders/OrderList'),
    'OrderList'
  ),

  OrderForm: createLazyRoute(
    () => import('../pages/Orders/OrderForm'),
    'OrderForm'
  ),

  // License pages
  LicenseList: createLazyRoute(
    () => import('../pages/Licenses/LicenseList'),
    'LicenseList'
  ),

  LicenseForm: createLazyRoute(
    () => import('../pages/Licenses/LicenseForm'),
    'LicenseForm'
  ),

  // Salary pages
  SalaryList: createLazyRoute(
    () => import('../pages/Salary/SalaryList'),
    'SalaryList'
  ),

  SalaryForm: createLazyRoute(
    () => import('../pages/Salary/SalaryForm'),
    'SalaryForm'
  ),

  // Delivery pages
  DeliveryList: createLazyRoute(
    () => import('../pages/Delivery/DeliveryList'),
    'DeliveryList'
  ),

  DeliveryForm: createLazyRoute(
    () => import('../pages/Delivery/DeliveryForm'),
    'DeliveryForm'
  ),

  // Settings pages
  AppSettings: createLazyRoute(
    () => import('../pages/Settings/AppSettings'),
    'AppSettings'
  ),

  // Admin pages - split into smaller chunks
  AdminPanel: createLazyRoute(
    () => import('../pages/Admin/AdminPanel'),
    'AdminPanel'
  ),

  UserManagement: createLazyRoute(
    () => import('../pages/Admin/UserManagement'),
    'UserManagement'
  ),

  SiteManagement: createLazyRoute(
    () => import('../pages/Admin/SiteManagement'),
    'SiteManagement'
  ),

  SystemLogs: createLazyRoute(
    () => import('../pages/Admin/SystemLogs'),
    'SystemLogs'
  ),

  SecuritySettings: createLazyRoute(
    () => import('../pages/Admin/SecuritySettings'),
    'SecuritySettings'
  ),

  DatabaseMonitoring: createLazyRoute(
    () => import('../pages/Admin/DatabaseMonitoring'),
    'DatabaseMonitoring'
  ),

  AuditMonitoring: createLazyRoute(
    () => import('../pages/Admin/AuditMonitoring'),
    'AuditMonitoring'
  ),

  SMSManagement: createLazyRoute(
    () => import('../pages/Admin/SMSManagement'),
    'SMSManagement'
  ),

  // Test pages
  UserValidationTestPage: createLazyRoute(
    () => import('../pages/Admin/UserValidationTestPage'),
    'UserValidationTestPage'
  ),

  NavigationDebugPage: createLazyRoute(
    () => import('../pages/Admin/NavigationDebugPage'),
    'NavigationDebugPage'
  ),

  AuthDiagnosticPage: createLazyRoute(
    () => import('../pages/AuthDiagnosticPage'),
    'AuthDiagnosticPage'
  ),

  OverflowTestPage: createLazyRoute(
    () => import('../pages/OverflowTestPage'),
    'OverflowTestPage'
  ),

  OverflowTestingPage: createLazyRoute(
    () => import('../pages/OverflowTestingPage'),
    'OverflowTestingPage'
  ),

  FileUploadTestPage: createLazyRoute(
    () => import('../components/FileUploadTestPage'),
    'FileUploadTestPage'
  ),

  // Other pages
  OnAuthSuccessPage: createLazyRoute(
    () => import('../pages/OnAuthSuccessPage'),
    'OnAuthSuccessPage'
  ),

  ResetPasswordPage: createLazyRoute(
    () => import('../pages/ResetPasswordPage'),
    'ResetPasswordPage'
  ),

  AdminSetupPage: createLazyRoute(
    () => import('../pages/AdminSetupPage'),
    'AdminSetupPage'
  ),

  ModuleAccessPage: createLazyRoute(
    () => import('../pages/Admin/ModuleAccessPage'),
    'ModuleAccessPage'
  ),

  EasyRoleManagement: createLazyRoute(
    () => import('../pages/Admin/EasyRoleManagement'),
    'EasyRoleManagement'
  )
};

/**
 * Route preloading based on user navigation patterns
 */
export class RoutePreloader {
  private static preloadedRoutes = new Set<string>();

  static preloadDashboardRoutes() {
    if (this.preloadedRoutes.has('dashboard')) return;

    this.preloadedRoutes.add('dashboard');
    preloadRoute(() => import('../pages/Products/ProductList'));
    preloadRoute(() => import('../pages/Sales/SalesReportList'));
    preloadRoute(() => import('../pages/Employees/EmployeeList'));
  }

  static preloadAdminRoutes() {
    if (this.preloadedRoutes.has('admin')) return;

    this.preloadedRoutes.add('admin');
    preloadRoute(() => import('../pages/Admin/UserManagement'));
    preloadRoute(() => import('../pages/Admin/SiteManagement'));
    preloadRoute(() => import('../pages/Admin/SystemLogs'));
  }

  static preloadFormRoutes() {
    if (this.preloadedRoutes.has('forms')) return;

    this.preloadedRoutes.add('forms');
    preloadRoute(() => import('../pages/Products/ProductForm'));
    preloadRoute(() => import('../pages/Employees/EmployeeForm'));
    preloadRoute(() => import('../pages/Sales/SalesReportForm'));
  }

  static preloadTestRoutes() {
    if (this.preloadedRoutes.has('test')) return;

    this.preloadedRoutes.add('test');
    preloadRoute(() => import('../pages/Admin/UserValidationTestPage'));
    preloadRoute(() => import('../pages/Admin/NavigationDebugPage'));
    preloadRoute(() => import('../pages/OverflowTestingPage'));
  }
}

/**
 * Intelligent route preloading based on user behavior
 */
export function setupIntelligentPreloading() {
  // Preload likely next routes based on current route
  const currentPath = window.location.pathname;

  if (currentPath === '/dashboard') {
    RoutePreloader.preloadDashboardRoutes();
  } else if (currentPath.startsWith('/admin')) {
    RoutePreloader.preloadAdminRoutes();
  } else if (currentPath.includes('/list')) {
    RoutePreloader.preloadFormRoutes();
  }

  // Preload routes on hover (for navigation links)
  document.addEventListener('mouseover', (e) => {
    const link = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement;
    if (link && link.href.startsWith(window.location.origin)) {
      const path = new URL(link.href).pathname;

      if (path.startsWith('/admin') && !RoutePreloader.preloadedRoutes.has('admin')) {
        RoutePreloader.preloadAdminRoutes();
      } else if (path.includes('/form') && !RoutePreloader.preloadedRoutes.has('forms')) {
        RoutePreloader.preloadFormRoutes();
      }
    }
  });
}