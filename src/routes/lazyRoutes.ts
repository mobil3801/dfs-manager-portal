import { lazy, ComponentType } from 'react';

// Enhanced lazy loading with better chunk naming and preloading
const createLazyComponent = (importFn: () => Promise<{default: ComponentType<any>;}>, chunkName: string) => {
  const LazyComponent = lazy(importFn);
  // Add chunk name for better debugging
  (LazyComponent as any).displayName = `Lazy(${chunkName})`;
  
  // Add preload method
  (LazyComponent as any).preload = () => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        importFn().catch(() => {
          // Silently fail preloading
        });
      });
    } else {
      setTimeout(() => {
        importFn().catch(() => {
          // Silently fail preloading
        });
      }, 100);
    }
  };
  
  return LazyComponent;
};

// Core feature pages with proper chunk naming and granular splitting
export const LazyRoutes = {
  // Product Management - Split into list and form
  ProductList: createLazyComponent(
    () => import('@/pages/Products/ProductList'),
    'ProductList'
  ),
  ProductForm: createLazyComponent(
    () => import('@/pages/Products/ProductForm'),
    'ProductForm'
  ),

  // Employee Management - Split into list and form
  EmployeeList: createLazyComponent(
    () => import('@/pages/Employees/EmployeeList'),
    'EmployeeList'
  ),
  EmployeeForm: createLazyComponent(
    () => import('@/pages/Employees/EmployeeForm'),
    'EmployeeForm'
  ),

  // Sales Management - Split into list and form
  SalesReportList: createLazyComponent(
    () => import('@/pages/Sales/SalesReportList'),
    'SalesReportList'
  ),
  SalesReportForm: createLazyComponent(
    () => import('@/pages/Sales/SalesReportForm'),
    'SalesReportForm'
  ),

  // Vendor Management - Split into list and form
  VendorList: createLazyComponent(
    () => import('@/pages/Vendors/VendorList'),
    'VendorList'
  ),
  VendorForm: createLazyComponent(
    () => import('@/pages/Vendors/VendorForm'),
    'VendorForm'
  ),

  // Order Management - Split into list and form
  OrderList: createLazyComponent(
    () => import('@/pages/Orders/OrderList'),
    'OrderList'
  ),
  OrderForm: createLazyComponent(
    () => import('@/pages/Orders/OrderForm'),
    'OrderForm'
  ),

  // License Management - Split into list and form
  LicenseList: createLazyComponent(
    () => import('@/pages/Licenses/LicenseList'),
    'LicenseList'
  ),
  LicenseForm: createLazyComponent(
    () => import('@/pages/Licenses/LicenseForm'),
    'LicenseForm'
  ),

  // Salary Management - Split into list and form
  SalaryList: createLazyComponent(
    () => import('@/pages/Salary/SalaryList'),
    'SalaryList'
  ),
  SalaryForm: createLazyComponent(
    () => import('@/pages/Salary/SalaryForm'),
    'SalaryForm'
  ),

  // Delivery Management - Split into list and form
  DeliveryList: createLazyComponent(
    () => import('@/pages/Delivery/DeliveryList'),
    'DeliveryList'
  ),
  DeliveryForm: createLazyComponent(
    () => import('@/pages/Delivery/DeliveryForm'),
    'DeliveryForm'
  ),

  // Settings - Single page
  AppSettings: createLazyComponent(
    () => import('@/pages/Settings/AppSettings'),
    'AppSettings'
  ),

  // Admin Pages - Split into logical groups for better loading
  AdminPanel: createLazyComponent(
    () => import('@/pages/Admin/AdminPanel'),
    'AdminPanel'
  ),
  AdminDashboard: createLazyComponent(
    () => import('@/pages/Admin/AdminDashboard'),
    'AdminDashboard'
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
  EasyRoleManagement: createLazyComponent(
    () => import('@/pages/Admin/EasyRoleManagement'),
    'EasyRoleManagement'
  ),
  
  // Monitoring and Testing Pages - Separate chunk for admin tools
  DatabaseMonitoring: createLazyComponent(
    () => import('@/pages/Admin/DatabaseMonitoring'),
    'DatabaseMonitoring'
  ),
  AuditMonitoring: createLazyComponent(
    () => import('@/pages/Admin/AuditMonitoring'),
    'AuditMonitoring'
  ),
  DevelopmentMonitoring: createLazyComponent(
    () => import('@/pages/Admin/DevelopmentMonitoring'),
    'DevelopmentMonitoring'
  ),
  ErrorRecoveryPage: createLazyComponent(
    () => import('@/pages/Admin/ErrorRecoveryPage'),
    'ErrorRecoveryPage'
  ),
  MemoryMonitoring: createLazyComponent(
    () => import('@/pages/Admin/MemoryMonitoring'),
    'MemoryMonitoring'
  ),
  ErrorMonitoringPage: createLazyComponent(
    () => import('@/pages/Admin/ErrorMonitoringPage'),
    'ErrorMonitoringPage'
  ),
  
  // Testing and Debug Pages - Separate chunk for development tools
  UserValidationTestPage: createLazyComponent(
    () => import('@/pages/Admin/UserValidationTestPage'),
    'UserValidationTestPage'
  ),
  RoleTestingPage: createLazyComponent(
    () => import('@/pages/Admin/RoleTestingPage'),
    'RoleTestingPage'
  ),
  LoginTestPage: createLazyComponent(
    () => import('@/pages/Admin/LoginTestPage'),
    'LoginTestPage'
  ),
  NavigationDebugPage: createLazyComponent(
    () => import('@/pages/Admin/NavigationDebugPage'),
    'NavigationDebugPage'
  ),
  
  // Utility Pages
  ModuleAccessPage: createLazyComponent(
    () => import('@/pages/Admin/ModuleAccessPage'),
    'ModuleAccessPage'
  ),
  AuthDiagnosticPage: createLazyComponent(
    () => import('@/pages/AuthDiagnosticPage'),
    'AuthDiagnosticPage'
  ),
  AdminSetupPage: createLazyComponent(
    () => import('@/pages/AdminSetupPage'),
    'AdminSetupPage'
  ),

  // Demo/Testing Pages - Load only when needed (development)
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

// Intelligent preloading strategy based on criticality
export const preloadRoutes = () => {
  // Preload only the most commonly accessed routes
  const criticalRoutes = [
    LazyRoutes.ProductList,
    LazyRoutes.EmployeeList,
    LazyRoutes.SalesReportList
  ];

  criticalRoutes.forEach((route) => {
    if (route.preload) {
      route.preload();
    }
  });
};

// Preload routes based on user role with priority
export const preloadBasedOnRole = (userRole: string) => {
  const roleBasedRoutes: Record<string, Array<{route: keyof typeof LazyRoutes, priority: number}>> = {
    'Administrator': [
      { route: 'AdminPanel', priority: 1 },
      { route: 'UserManagement', priority: 2 },
      { route: 'SiteManagement', priority: 3 },
      { route: 'SystemLogs', priority: 4 },
      { route: 'SecuritySettings', priority: 5 }
    ],
    'Management': [
      { route: 'ProductList', priority: 1 },
      { route: 'EmployeeList', priority: 2 },
      { route: 'SalesReportList', priority: 3 },
      { route: 'VendorList', priority: 4 },
      { route: 'OrderList', priority: 5 }
    ],
    'Employee': [
      { route: 'ProductList', priority: 1 },
      { route: 'SalesReportList', priority: 2 },
      { route: 'DeliveryList', priority: 3 }
    ]
  };

  const routesToPreload = roleBasedRoutes[userRole] || [];
  
  // Sort by priority and preload with delays
  routesToPreload
    .sort((a, b) => a.priority - b.priority)
    .forEach(({ route }, index) => {
      setTimeout(() => {
        const routeComponent = LazyRoutes[route];
        if (routeComponent?.preload) {
          routeComponent.preload();
        }
      }, index * 100); // Stagger preloading
    });
};

// Conditional preloading based on time of day (for shift-based operations)
export const preloadBasedOnTime = () => {
  const hour = new Date().getHours();

  // Business hours - preload core functionality
  if (hour >= 6 && hour <= 22) {
    LazyRoutes.ProductList.preload?.();
    LazyRoutes.SalesReportList.preload?.();
    LazyRoutes.EmployeeList.preload?.();
  }

  // Off hours - preload admin functionality
  if (hour >= 23 || hour <= 5) {
    LazyRoutes.AdminPanel.preload?.();
    LazyRoutes.SystemLogs.preload?.();
    LazyRoutes.DatabaseMonitoring.preload?.();
  }
};

// Route groups for better organization and preloading
export const RouteGroups = {
  // Core business operations
  core: ['ProductList', 'EmployeeList', 'SalesReportList'] as const,
  
  // Administrative functions
  admin: ['AdminPanel', 'UserManagement', 'SiteManagement', 'SystemLogs', 'SecuritySettings'] as const,
  
  // Management operations
  management: ['VendorList', 'OrderList', 'LicenseList', 'SalaryList', 'DeliveryList'] as const,
  
  // Forms (heavier components)
  forms: ['ProductForm', 'EmployeeForm', 'SalesReportForm', 'VendorForm', 'OrderForm'] as const,
  
  // Settings and configuration
  settings: ['AppSettings', 'SMSManagement', 'ModuleAccessPage', 'EasyRoleManagement'] as const,
  
  // Development and testing tools
  testing: ['ProfilePictureDemo', 'OverflowTestPage', 'OverflowTestingPage', 'UserValidationTestPage'] as const,
  
  // Monitoring and analytics
  monitoring: ['DatabaseMonitoring', 'AuditMonitoring', 'ErrorMonitoringPage', 'MemoryMonitoring'] as const,
  
  // Debug and diagnostic tools
  debug: ['NavigationDebugPage', 'AuthDiagnosticPage', 'LoginTestPage', 'RoleTestingPage'] as const
} as const;

// Preload entire route groups with staggered loading
export const preloadRouteGroup = (groupName: keyof typeof RouteGroups, delay: number = 100) => {
  const group = RouteGroups[groupName];
  group.forEach((routeName, index) => {
    setTimeout(() => {
      const route = LazyRoutes[routeName];
      if (route?.preload) {
        route.preload();
      }
    }, index * delay);
  });
};

// Smart preloading based on navigation patterns
export const preloadOnMouseEnter = (routeName: keyof typeof LazyRoutes) => {
  const route = LazyRoutes[routeName];
  if (route?.preload) {
    route.preload();
  }
};

// Preload next likely routes based on current route
export const preloadNextLikelyRoutes = (currentRoute: string) => {
  const navigationPatterns: Record<string, Array<keyof typeof LazyRoutes>> = {
    'ProductList': ['ProductForm', 'SalesReportList'],
    'EmployeeList': ['EmployeeForm', 'SalaryList'],
    'SalesReportList': ['SalesReportForm', 'ProductList'],
    'VendorList': ['VendorForm', 'OrderList'],
    'OrderList': ['OrderForm', 'VendorList'],
    'AdminPanel': ['UserManagement', 'SiteManagement'],
    'UserManagement': ['SecuritySettings', 'EasyRoleManagement']
  };

  const nextRoutes = navigationPatterns[currentRoute] || [];
  nextRoutes.forEach((routeName, index) => {
    setTimeout(() => {
      const route = LazyRoutes[routeName];
      if (route?.preload) {
        route.preload();
      }
    }, (index + 1) * 200); // Stagger preloading
  });
};

// Initialize preloading strategies
export const initializePreloading = (userRole?: string) => {
  // Always preload critical routes
  preloadRoutes();
  
  // Role-based preloading
  if (userRole) {
    preloadBasedOnRole(userRole);
  }
  
  // Time-based preloading
  preloadBasedOnTime();
  
  // Preload core group with higher priority
  setTimeout(() => {
    preloadRouteGroup('core', 50);
  }, 1000);
};

export default LazyRoutes;
