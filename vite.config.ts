import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React ecosystem - split further
          if (id.includes('react/jsx-runtime') || id.includes('react/jsx-dev-runtime')) {
            return 'react-jsx';
          }
          
          if (id.includes('react-dom/client') || id.includes('react-dom/server')) {
            return 'react-dom';
          }
          
          if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler/')) {
            return 'react-core';
          }
          
          if (id.includes('react-router')) {
            return 'react-router';
          }
          
          // State management
          if (id.includes('@tanstack/react-query')) {
            return 'react-query';
          }
          
          // Radix UI - more granular splitting
          if (id.includes('@radix-ui/react-dialog') || 
              id.includes('@radix-ui/react-popover') || 
              id.includes('@radix-ui/react-tooltip')) {
            return 'radix-dialog';
          }
          
          if (id.includes('@radix-ui/react-dropdown-menu') ||
              id.includes('@radix-ui/react-menubar') ||
              id.includes('@radix-ui/react-context-menu')) {
            return 'radix-menu';
          }
          
          if (id.includes('@radix-ui/react-alert-dialog') ||
              id.includes('@radix-ui/react-hover-card')) {
            return 'radix-alert';
          }
          
          if (id.includes('@radix-ui/react-navigation-menu')) {
            return 'radix-navigation';
          }
          
          if (id.includes('@radix-ui/react-select')) {
            return 'radix-select';
          }
          
          if (id.includes('@radix-ui/react-checkbox') ||
              id.includes('@radix-ui/react-radio-group') ||
              id.includes('@radix-ui/react-slider') ||
              id.includes('@radix-ui/react-switch')) {
            return 'radix-form';
          }
          
          if (id.includes('@radix-ui/react-label')) {
            return 'radix-label';
          }
          
          if (id.includes('@radix-ui/react-accordion') ||
              id.includes('@radix-ui/react-collapsible') ||
              id.includes('@radix-ui/react-tabs')) {
            return 'radix-layout';
          }
          
          if (id.includes('@radix-ui/react-separator') ||
              id.includes('@radix-ui/react-aspect-ratio') ||
              id.includes('@radix-ui/react-scroll-area')) {
            return 'radix-misc';
          }
          
          if (id.includes('@radix-ui/react-toast') ||
              id.includes('@radix-ui/react-progress')) {
            return 'radix-feedback';
          }
          
          if (id.includes('@radix-ui/react-avatar')) {
            return 'radix-avatar';
          }
          
          if (id.includes('@radix-ui/react-toggle')) {
            return 'radix-toggle';
          }
          
          if (id.includes('@radix-ui')) {
            return 'radix-core';
          }
          
          // Charts and visualization
          if (id.includes('recharts')) {
            return 'charts';
          }
          
          // Icons
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          
          // Form handling
          if (id.includes('react-hook-form')) {
            return 'react-hook-form';
          }
          
          if (id.includes('@hookform/resolvers')) {
            return 'hookform-resolvers';
          }
          
          if (id.includes('zod')) {
            return 'zod';
          }
          
          // Animation libraries
          if (id.includes('motion') || id.includes('framer-motion')) {
            return 'animation';
          }
          
          // Date utilities
          if (id.includes('date-fns')) {
            return 'date-utils';
          }
          
          // UI utilities
          if (id.includes('clsx')) {
            return 'clsx';
          }
          
          if (id.includes('tailwind-merge')) {
            return 'tailwind-merge';
          }
          
          if (id.includes('class-variance-authority')) {
            return 'cva';
          }
          
          // File handling
          if (id.includes('react-dropzone')) {
            return 'file-handling';
          }
          
          // Internationalization
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n';
          }
          
          // Development tools
          if (id.includes('@monaco-editor')) {
            return 'dev-tools';
          }
          
          // Application pages - split by major features
          if (id.includes('src/pages/Admin/UserManagement')) {
            return 'page-admin-users';
          }
          
          if (id.includes('src/pages/Admin/') && 
              (id.includes('SiteManagement') || 
               id.includes('SystemLogs') || 
               id.includes('SecuritySettings'))) {
            return 'page-admin-management';
          }
          
          if (id.includes('src/pages/Admin/') && 
              (id.includes('SMSManagement') || 
               id.includes('UserValidationTestPage') || 
               id.includes('NavigationDebugPage'))) {
            return 'page-admin-testing';
          }
          
          if (id.includes('src/pages/Admin/') && 
              (id.includes('DatabaseMonitoring') || 
               id.includes('AuditMonitoring'))) {
            return 'page-admin-monitoring';
          }
          
          if (id.includes('src/pages/Admin/')) {
            return 'page-admin-common';
          }
          
          if (id.includes('src/pages/Sales/SalesReportForm')) {
            return 'page-sales-form';
          }
          
          if (id.includes('src/pages/Sales/')) {
            return 'page-sales';
          }
          
          if (id.includes('src/pages/Products/ProductForm')) {
            return 'page-products-form';
          }
          
          if (id.includes('src/pages/Products/')) {
            return 'page-products';
          }
          
          if (id.includes('src/pages/Employees/')) {
            return 'page-employees';
          }
          
          if (id.includes('src/pages/Licenses/')) {
            return 'page-licenses';
          }
          
          if (id.includes('src/pages/Vendors/') || 
              id.includes('src/pages/Orders/')) {
            return 'page-business';
          }
          
          if (id.includes('src/pages/Salary/') || 
              id.includes('src/pages/Delivery/')) {
            return 'page-operations';
          }
          
          if (id.includes('src/pages/Settings/')) {
            return 'page-settings';
          }
          
          if (id.includes('src/pages/')) {
            return 'page-common';
          }
          
          // Component chunking - more granular
          if (id.includes('src/components/ErrorBoundary/')) {
            return 'comp-error-boundary';
          }
          
          if (id.includes('src/components/') && 
              (id.includes('UserPermissionManager') || 
               id.includes('RoleBasedDashboard') || 
               id.includes('ComprehensivePermissionDialog'))) {
            return 'comp-permissions';
          }
          
          if (id.includes('src/components/') && 
              (id.includes('SMS') || 
               id.includes('Email') || 
               id.includes('Alert'))) {
            return 'comp-communications';
          }
          
          if (id.includes('src/components/') && 
              (id.includes('FileUpload') || 
               id.includes('ProfilePicture') || 
               id.includes('ImageCompression'))) {
            return 'comp-files';
          }
          
          if (id.includes('src/components/') && 
              (id.includes('SalesChart') || 
               id.includes('StationSalesBoxes') || 
               id.includes('ComprehensiveDashboard'))) {
            return 'comp-charts';
          }
          
          if (id.includes('src/components/') && 
              (id.includes('Print') || 
               id.includes('Export') || 
               id.includes('Report'))) {
            return 'comp-reports';
          }
          
          if (id.includes('src/components/') && 
              (id.includes('Navigation') || 
               id.includes('Overflow') || 
               id.includes('TopNavigation'))) {
            return 'comp-navigation';
          }
          
          if (id.includes('src/components/') && 
              (id.includes('Memory') || 
               id.includes('Performance') || 
               id.includes('Monitoring'))) {
            return 'comp-monitoring';
          }
          
          if (id.includes('src/components/Layout/')) {
            return 'comp-layout';
          }
          
          if (id.includes('src/components/RoleTesting/')) {
            return 'comp-role-testing';
          }
          
          if (id.includes('src/components/UserValidation/')) {
            return 'comp-user-validation';
          }
          
          if (id.includes('src/components/SalesReportSections/')) {
            return 'comp-sales-sections';
          }
          
          if (id.includes('src/components/')) {
            return 'comp-common';
          }
          
          // Services chunking
          if (id.includes('src/services/')) {
            return 'services';
          }
          
          // Utilities chunking
          if (id.includes('src/utils/')) {
            return 'utils';
          }
          
          // Hooks chunking
          if (id.includes('src/hooks/')) {
            return 'hooks';
          }
          
          // Contexts chunking
          if (id.includes('src/contexts/')) {
            return 'contexts';
          }
          
          // Misc vendor packages
          if (id.includes('sonner')) {
            return 'sonner';
          }
          
          if (id.includes('cmdk')) {
            return 'cmdk';
          }
          
          if (id.includes('input-otp')) {
            return 'input-otp';
          }
          
          if (id.includes('vaul')) {
            return 'vaul';
          }
          
          // Carousel
          if (id.includes('embla-carousel')) {
            return 'carousel';
          }
          
          // Theme
          if (id.includes('next-themes')) {
            return 'theme';
          }
          
          // Panels
          if (id.includes('react-resizable-panels')) {
            return 'panels';
          }
          
          // Calendar
          if (id.includes('react-day-picker')) {
            return 'calendar';
          }
          
          // DnD
          if (id.includes('@dnd-kit')) {
            return 'dnd';
          }
          
          // Catch-all for remaining vendor packages
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
        
        // Optimize chunk generation
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name;
          if (name.includes('react') || 
              name.includes('radix') || 
              name.includes('vendor')) {
            return 'assets/vendor/[name]-[hash].js';
          }
          
          if (name.includes('page-') || 
              name.includes('comp-')) {
            return 'assets/app/[name]-[hash].js';
          }
          
          if (name.includes('charts') || 
              name.includes('icons') || 
              name.includes('forms') || 
              name.includes('animation')) {
            return 'assets/lib/[name]-[hash].js';
          }
          
          return 'assets/[name]-[hash].js';
        },
        
        // Optimize asset naming
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/styles/[name]-[hash].css';
          }
          if (assetInfo.name?.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)) {
            return 'assets/images/[name]-[hash].[ext]';
          }
          if (assetInfo.name?.match(/\.(woff|woff2|eot|ttf|otf)$/)) {
            return 'assets/fonts/[name]-[hash].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        },
        
        // Entry point naming
        entryFileNames: 'assets/app/[name]-[hash].js'
      }
    },
    
    // Optimizations for better performance
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
        passes: 2,
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true
      },
      mangle: {
        safari10: true,
        properties: {
          regex: /^_/
        }
      },
      format: {
        comments: false
      }
    },
    
    // Chunk size limit
    chunkSizeWarningLimit: 400,
    
    // CSS optimization
    cssCodeSplit: true,
    cssMinify: true,
    
    // Optimize assets
    assetsInlineLimit: 2048,
    
    // Source maps for debugging
    sourcemap: mode === 'development',
    
    // Optimize module resolution
    modulePreload: {
      polyfill: true
    },
    
    // Enable tree shaking
    emptyOutDir: true
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      'clsx',
      'tailwind-merge'
    ],
    exclude: ['@dnd-kit/core'],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  
  // Experimental features for better performance
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
    minifyIdentifiers: mode === 'production',
    minifySyntax: mode === 'production',
    minifyWhitespace: mode === 'production',
    target: 'es2020',
    supported: {
      'top-level-await': true
    }
  },
  
  // Plugin optimizations
  define: {
    __DEV__: mode === 'development'
  }
}));
