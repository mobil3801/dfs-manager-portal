import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core - keep small and separate
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }

          // React Router - commonly used
          if (id.includes('node_modules/react-router-dom/')) {
            return 'react-router';
          }

          // Large UI component library - split into smaller chunks
          if (id.includes('node_modules/@radix-ui/')) {
            // Further split Radix UI components
            if (id.includes('react-dialog') || id.includes('react-dropdown-menu') || id.includes('react-popover')) {
              return 'radix-overlay';
            }
            if (id.includes('react-select') || id.includes('react-checkbox') || id.includes('react-radio-group')) {
              return 'radix-forms';
            }
            if (id.includes('react-tabs') || id.includes('react-accordion') || id.includes('react-collapsible')) {
              return 'radix-layout';
            }
            return 'radix-ui';
          }

          // Form handling libraries
          if (id.includes('node_modules/react-hook-form/') ||
          id.includes('node_modules/@hookform/') ||
          id.includes('node_modules/zod/')) {
            return 'forms';
          }

          // Date utilities - can be large
          if (id.includes('node_modules/date-fns/')) {
            return 'date-utils';
          }

          // Icons - split from main bundle
          if (id.includes('node_modules/lucide-react/')) {
            return 'icons';
          }

          // Charts - only loaded when needed
          if (id.includes('node_modules/recharts/')) {
            return 'charts';
          }

          // React Query - commonly used
          if (id.includes('node_modules/@tanstack/react-query/')) {
            return 'react-query';
          }

          // Animation libraries - split as they can be large
          if (id.includes('node_modules/motion/') ||
          id.includes('node_modules/framer-motion/')) {
            return 'animation';
          }

          // Utility libraries - keep together but separate
          if (id.includes('node_modules/clsx/') ||
          id.includes('node_modules/class-variance-authority/') ||
          id.includes('node_modules/tailwind-merge/')) {
            return 'utils';
          }

          // Toast notifications
          if (id.includes('node_modules/sonner/')) {
            return 'toast';
          }

          // Command palette - only used in specific places
          if (id.includes('node_modules/cmdk/')) {
            return 'command';
          }

          // File upload - only used in specific forms
          if (id.includes('node_modules/react-dropzone/')) {
            return 'file-upload';
          }

          // Other specialized UI libraries
          if (id.includes('node_modules/input-otp/') ||
          id.includes('node_modules/react-day-picker/') ||
          id.includes('node_modules/embla-carousel-react/') ||
          id.includes('node_modules/react-resizable-panels/') ||
          id.includes('node_modules/vaul/')) {
            return 'ui-specialized';
          }

          // Internationalization
          if (id.includes('node_modules/i18next/') ||
          id.includes('node_modules/react-i18next/')) {
            return 'i18n';
          }

          // DnD Kit - only used in specific components
          if (id.includes('node_modules/@dnd-kit/')) {
            return 'dnd-kit';
          }

          // Monaco Editor - large, only used in admin
          if (id.includes('node_modules/@monaco-editor/')) {
            return 'monaco-editor';
          }

          // All other node_modules
          if (id.includes('node_modules/')) {
            return 'vendor';
          }

          // App-specific chunks - more granular splitting
          
          // Main dashboard and core features
          if (id.includes('/pages/Dashboard.tsx') || id.includes('/pages/HomePage.tsx')) {
            return 'core-dashboard';
          }

          // Authentication pages
          if (id.includes('/pages/LoginPage.tsx') || id.includes('/pages/ResetPasswordPage.tsx') || id.includes('/pages/OnAuthSuccessPage.tsx')) {
            return 'auth-pages';
          }

          // Product management - split forms from lists
          if (id.includes('/pages/Products/ProductList.tsx') || 
              id.includes('/components/ProductLogs.tsx') || 
              id.includes('/components/ProductCards.tsx') ||
              id.includes('/components/ProductSearchBar.tsx')) {
            return 'products-list';
          }
          
          if (id.includes('/pages/Products/ProductForm.tsx') || 
              id.includes('/components/BarcodeScanner.tsx') ||
              id.includes('/components/ProductSelectionDialog.tsx')) {
            return 'products-form';
          }

          // Employee management
          if (id.includes('/pages/Employees/EmployeeList.tsx')) {
            return 'employees-list';
          }
          if (id.includes('/pages/Employees/EmployeeForm.tsx')) {
            return 'employees-form';
          }

          // Sales management - split reports from forms
          if (id.includes('/pages/Sales/SalesReportList.tsx')) {
            return 'sales-reports';
          }
          if (id.includes('/pages/Sales/SalesReportForm.tsx') || 
              id.includes('/components/SalesReportSections/')) {
            return 'sales-form';
          }

          // Vendor management
          if (id.includes('/pages/Vendors/VendorList.tsx')) {
            return 'vendors-list';
          }
          if (id.includes('/pages/Vendors/VendorForm.tsx')) {
            return 'vendors-form';
          }

          // Order management
          if (id.includes('/pages/Orders/OrderList.tsx')) {
            return 'orders-list';
          }
          if (id.includes('/pages/Orders/OrderForm.tsx')) {
            return 'orders-form';
          }

          // License management
          if (id.includes('/pages/Licenses/LicenseList.tsx')) {
            return 'licenses-list';
          }
          if (id.includes('/pages/Licenses/LicenseForm.tsx')) {
            return 'licenses-form';
          }

          // Salary management
          if (id.includes('/pages/Salary/SalaryList.tsx')) {
            return 'salary-list';
          }
          if (id.includes('/pages/Salary/SalaryForm.tsx')) {
            return 'salary-form';
          }

          // Delivery management
          if (id.includes('/pages/Delivery/DeliveryList.tsx')) {
            return 'delivery-list';
          }
          if (id.includes('/pages/Delivery/DeliveryForm.tsx')) {
            return 'delivery-form';
          }

          // Settings
          if (id.includes('/pages/Settings/AppSettings.tsx')) {
            return 'settings';
          }

          // Admin pages - split into separate chunks
          if (id.includes('/pages/Admin/AdminPanel.tsx') || 
              id.includes('/pages/Admin/AdminDashboard.tsx')) {
            return 'admin-dashboard';
          }

          if (id.includes('/pages/Admin/UserManagement.tsx') || 
              id.includes('/components/EnhancedUserManagementWithValidation.tsx') ||
              id.includes('/components/UserPermissionManager.tsx') ||
              id.includes('/components/RealTimePermissionManager.tsx')) {
            return 'admin-users';
          }

          if (id.includes('/pages/Admin/SiteManagement.tsx') || 
              id.includes('/components/StationEditDialog.tsx')) {
            return 'admin-sites';
          }

          if (id.includes('/pages/Admin/SystemLogs.tsx') || 
              id.includes('/pages/Admin/AuditMonitoring.tsx') ||
              id.includes('/components/AuditLogViewer.tsx')) {
            return 'admin-logs';
          }

          if (id.includes('/pages/Admin/SecuritySettings.tsx') || 
              id.includes('/components/ComprehensivePermissionDialog.tsx')) {
            return 'admin-security';
          }

          if (id.includes('/pages/Admin/SMSManagement.tsx') || 
              id.includes('/components/SMSServiceManager.tsx') ||
              id.includes('/components/SMSTestManager.tsx') ||
              id.includes('/components/ClickSendServiceManager.tsx')) {
            return 'admin-sms';
          }

          if (id.includes('/pages/Admin/DatabaseMonitoring.tsx') || 
              id.includes('/components/DatabaseConnectionMonitor.tsx') ||
              id.includes('/components/DatabasePerformanceMonitor.tsx')) {
            return 'admin-monitoring';
          }

          if (id.includes('/pages/Admin/NavigationDebugPage.tsx') || 
              id.includes('/pages/Admin/UserValidationTestPage.tsx') ||
              id.includes('/pages/OverflowTestingPage.tsx') ||
              id.includes('/pages/OverflowTestPage.tsx')) {
            return 'admin-testing';
          }

          // Error handling and monitoring
          if (id.includes('/components/ErrorBoundary/') ||
              id.includes('/components/ErrorAnalyticsDashboard.tsx') ||
              id.includes('/components/ErrorMonitoringWidget.tsx') ||
              id.includes('/services/errorLogger.tsx') ||
              id.includes('/services/enhancedErrorLogger.tsx')) {
            return 'error-handling';
          }

          // Memory and performance monitoring
          if (id.includes('/components/MemoryLeakDashboard.tsx') ||
              id.includes('/components/PerformanceMonitoringSystem.tsx') ||
              id.includes('/services/memoryLeakMonitor.tsx') ||
              id.includes('/utils/memoryLeakIntegration.tsx')) {
            return 'performance-monitoring';
          }

          // File handling components
          if (id.includes('/components/EnhancedFileUpload.tsx') ||
              id.includes('/components/FileDisplay.tsx') ||
              id.includes('/components/DatabaseFileUpload.tsx') ||
              id.includes('/components/ProfilePicture.tsx') ||
              id.includes('/utils/imageCompression.tsx')) {
            return 'file-handling';
          }

          // Print dialogs and reports
          if (id.includes('/components/PrintDialog.tsx') ||
              id.includes('/components/SalesReportPrintDialog.tsx') ||
              id.includes('/components/EnhancedSalesReportPrintDialog.tsx') ||
              id.includes('/components/DeliveryReportDialog.tsx') ||
              id.includes('/components/EnhancedDeliveryPrintDialog.tsx')) {
            return 'print-reports';
          }

          // Charts and analytics
          if (id.includes('/components/SalesChart.tsx') ||
              id.includes('/components/ComprehensiveDashboard.tsx') ||
              id.includes('/utils/analytics-')) {
            return 'analytics';
          }

          // UI components - split into logical groups
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }

          // Navigation components
          if (id.includes('/components/TopNavigation.tsx') ||
              id.includes('/components/OverflowNavigation.tsx') ||
              id.includes('/components/NavigationDebugger.tsx') ||
              id.includes('/components/Layout/')) {
            return 'navigation';
          }

          // Form components
          if (id.includes('/components/ExpenseFormDialog.tsx') ||
              id.includes('/components/CreateUserDialog.tsx') ||
              id.includes('/components/DraftManagementDialog.tsx')) {
            return 'form-dialogs';
          }

          // Utility modules
          if (id.includes('/utils/') || id.includes('/services/') || id.includes('/hooks/')) {
            return 'app-utils';
          }

          // Context providers
          if (id.includes('/contexts/')) {
            return 'contexts';
          }

          // Remaining components - group by size and usage
          if (id.includes('/components/') && id.includes('Demo')) {
            return 'demo-components';
          }

          if (id.includes('/components/') && (id.includes('Test') || id.includes('Debug'))) {
            return 'debug-components';
          }

          // Small utility components
          if (id.includes('/components/')) {
            return 'misc-components';
          }
        }
      }
    },
    // Optimize chunk size settings
    chunkSizeWarningLimit: 300, // Lower warning threshold to catch issues earlier
    // Enable gzip compression analysis
    reportCompressedSize: true,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Sourcemap only for development
    sourcemap: mode === 'development',
    // Minification settings
    minify: 'esbuild',
    // Target modern browsers for better optimization
    target: 'es2020',
    // Add tree shaking optimizations
    external: (id) => {
      // Externalize very large libraries that might not be used
      if (id.includes('@monaco-editor/react') && process.env.NODE_ENV === 'production') {
        return false; // Keep internal for now, but consider CDN in future
      }
      return false;
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      'date-fns',
      'recharts',
      'clsx',
      'tailwind-merge',
      'class-variance-authority'
    ],
    // Exclude heavy dependencies from optimization
    exclude: [
      '@monaco-editor/react',
      'motion',
      'framer-motion'
    ]
  },
  // Define constants for better tree shaking
  define: {
    __DEV__: mode === 'development',
    __PROD__: mode === 'production'
  },
  // Additional performance optimizations
  esbuild: {
    // Remove console logs in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    // Enable legal comments only in development
    legalComments: mode === 'development' ? 'inline' : 'none'
  }
}));
