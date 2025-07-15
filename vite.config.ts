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

          // App-specific chunks - split by feature area
          if (id.includes('/pages/Products/') || 
              (id.includes('/components/') && (id.includes('Product') || id.includes('BarcodeScanner')))) {
            return 'feature-products';
          }

          if (id.includes('/pages/Employees/') || 
              (id.includes('/components/') && id.includes('Employee'))) {
            return 'feature-employees';
          }

          if (id.includes('/pages/Sales/') || 
              (id.includes('/components/') && (id.includes('Sales') || id.includes('Lottery')))) {
            return 'feature-sales';
          }

          if (id.includes('/pages/Vendors/') || 
              (id.includes('/components/') && id.includes('Vendor'))) {
            return 'feature-vendors';
          }

          if (id.includes('/pages/Orders/') || 
              (id.includes('/components/') && id.includes('Order'))) {
            return 'feature-orders';
          }

          if (id.includes('/pages/Licenses/') || 
              (id.includes('/components/') && id.includes('License'))) {
            return 'feature-licenses';
          }

          if (id.includes('/pages/Salary/') || 
              (id.includes('/components/') && id.includes('Salary'))) {
            return 'feature-salary';
          }

          if (id.includes('/pages/Delivery/') || 
              (id.includes('/components/') && id.includes('Delivery'))) {
            return 'feature-delivery';
          }

          if (id.includes('/pages/Admin/') || 
              (id.includes('/components/') && (id.includes('Admin') || id.includes('User') || id.includes('Role')))) {
            return 'feature-admin';
          }

          if (id.includes('/pages/Settings/') || 
              (id.includes('/components/') && id.includes('Settings'))) {
            return 'feature-settings';
          }

          // Error handling and monitoring
          if (id.includes('/ErrorBoundary/') || 
              id.includes('ErrorBoundary') || 
              id.includes('/services/') && (id.includes('error') || id.includes('monitoring'))) {
            return 'error-handling';
          }

          // SMS and communication features
          if (id.includes('/components/') && id.includes('SMS') || 
              id.includes('/services/') && id.includes('sms')) {
            return 'feature-sms';
          }

          // File handling
          if (id.includes('/components/') && (id.includes('File') || id.includes('Upload') || id.includes('Image'))) {
            return 'file-handling';
          }

          // UI components
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }

          // Utility modules
          if (id.includes('/utils/') || id.includes('/services/') || id.includes('/hooks/')) {
            return 'app-utils';
          }

          // Context providers
          if (id.includes('/contexts/')) {
            return 'contexts';
          }
        }
      }
    },
    // Optimize chunk size settings
    chunkSizeWarningLimit: 500, // Keep the warning at 500kb
    // Enable gzip compression analysis
    reportCompressedSize: true,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Sourcemap only for development
    sourcemap: mode === 'development',
    // Minification settings
    minify: 'esbuild',
    // Target modern browsers for better optimization
    target: 'es2020'
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
      'recharts'
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
    __DEV__: mode === 'development'
  }
}));
