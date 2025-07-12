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
          // Core React ecosystem - bundle together for better caching
          if (id.includes('react/jsx-runtime') ||
          id.includes('react/jsx-dev-runtime') ||
          id.includes('react-dom/client') ||
          id.includes('react-dom/server') ||
          id.includes('react/') ||
          id.includes('react-dom/') ||
          id.includes('scheduler/')) {
            return 'react-vendor';
          }

          if (id.includes('react-router')) {
            return 'react-router';
          }

          // State management
          if (id.includes('@tanstack/react-query')) {
            return 'react-query';
          }

          // Radix UI - group by functionality
          if (id.includes('@radix-ui/react-dialog') ||
          id.includes('@radix-ui/react-popover') ||
          id.includes('@radix-ui/react-tooltip') ||
          id.includes('@radix-ui/react-dropdown-menu') ||
          id.includes('@radix-ui/react-menubar') ||
          id.includes('@radix-ui/react-context-menu') ||
          id.includes('@radix-ui/react-alert-dialog') ||
          id.includes('@radix-ui/react-hover-card')) {
            return 'radix-overlays';
          }

          if (id.includes('@radix-ui/react-select') ||
          id.includes('@radix-ui/react-checkbox') ||
          id.includes('@radix-ui/react-radio-group') ||
          id.includes('@radix-ui/react-slider') ||
          id.includes('@radix-ui/react-switch') ||
          id.includes('@radix-ui/react-label')) {
            return 'radix-forms';
          }

          if (id.includes('@radix-ui/react-accordion') ||
          id.includes('@radix-ui/react-collapsible') ||
          id.includes('@radix-ui/react-tabs') ||
          id.includes('@radix-ui/react-separator') ||
          id.includes('@radix-ui/react-aspect-ratio') ||
          id.includes('@radix-ui/react-scroll-area')) {
            return 'radix-layout';
          }

          if (id.includes('@radix-ui')) {
            return 'radix-misc';
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
          if (id.includes('react-hook-form') ||
          id.includes('@hookform/resolvers') ||
          id.includes('zod')) {
            return 'forms';
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
          if (id.includes('clsx') ||
          id.includes('tailwind-merge') ||
          id.includes('class-variance-authority')) {
            return 'ui-utils';
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

          // Large admin pages - split them
          if (id.includes('src/pages/Admin/UserManagement')) {
            return 'admin-users';
          }

          if (id.includes('src/pages/Sales/SalesReportForm')) {
            return 'sales-form';
          }

          if (id.includes('src/pages/Products/ProductForm')) {
            return 'products-form';
          }

          // Group smaller admin pages
          if (id.includes('src/pages/Admin/')) {
            return 'admin-pages';
          }

          // Group business pages
          if (id.includes('src/pages/Sales/') ||
          id.includes('src/pages/Products/') ||
          id.includes('src/pages/Employees/') ||
          id.includes('src/pages/Licenses/') ||
          id.includes('src/pages/Vendors/') ||
          id.includes('src/pages/Orders/') ||
          id.includes('src/pages/Salary/') ||
          id.includes('src/pages/Delivery/')) {
            return 'business-pages';
          }

          // Settings and common pages
          if (id.includes('src/pages/')) {
            return 'common-pages';
          }

          // Component chunking - group by functionality
          if (id.includes('src/components/ErrorBoundary/')) {
            return 'error-boundary';
          }

          if (id.includes('src/components/') && (
          id.includes('UserPermissionManager') ||
          id.includes('RoleBasedDashboard') ||
          id.includes('ComprehensivePermissionDialog') ||
          id.includes('RoleTesting/'))) {
            return 'permissions';
          }

          if (id.includes('src/components/') && (
          id.includes('SMS') ||
          id.includes('Email') ||
          id.includes('Alert'))) {
            return 'communications';
          }

          if (id.includes('src/components/') && (
          id.includes('FileUpload') ||
          id.includes('ProfilePicture') ||
          id.includes('ImageCompression'))) {
            return 'file-components';
          }

          if (id.includes('src/components/') && (
          id.includes('SalesChart') ||
          id.includes('StationSalesBoxes') ||
          id.includes('ComprehensiveDashboard'))) {
            return 'chart-components';
          }

          if (id.includes('src/components/') && (
          id.includes('Print') ||
          id.includes('Export') ||
          id.includes('Report'))) {
            return 'report-components';
          }

          if (id.includes('src/components/') && (
          id.includes('Navigation') ||
          id.includes('Overflow') ||
          id.includes('TopNavigation'))) {
            return 'navigation-components';
          }

          if (id.includes('src/components/') && (
          id.includes('Memory') ||
          id.includes('Performance') ||
          id.includes('Monitoring'))) {
            return 'monitoring-components';
          }

          if (id.includes('src/components/')) {
            return 'common-components';
          }

          // Services, utilities, hooks, contexts - group together
          if (id.includes('src/services/') ||
          id.includes('src/utils/') ||
          id.includes('src/hooks/') ||
          id.includes('src/contexts/')) {
            return 'app-core';
          }

          // Smaller vendor packages - group together
          if (id.includes('sonner') ||
          id.includes('cmdk') ||
          id.includes('input-otp') ||
          id.includes('vaul') ||
          id.includes('embla-carousel') ||
          id.includes('next-themes') ||
          id.includes('react-resizable-panels') ||
          id.includes('react-day-picker') ||
          id.includes('@dnd-kit')) {
            return 'vendor-misc';
          }

          // Catch-all for remaining vendor packages
          if (id.includes('node_modules')) {
            return 'vendor-other';
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
        passes: 3, // Increased passes for better compression
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        // Additional aggressive optimizations
        arrows: true,
        booleans: true,
        collapse_vars: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
        keep_fargs: false,
        loops: true,
        negate_iife: true,
        properties: true,
        reduce_vars: true,
        sequences: true,
        unused: true,
        conditionals: true,
        comparisons: true,
        inline: true,
        hoist_funs: true,
        hoist_vars: true,
        reduce_funcs: true,
        merge_vars: true,
        cascade: true,
        side_effects: true,
        pure_getters: true,
        global_defs: {
          __DEV__: mode === 'development'
        }
      },
      mangle: {
        safari10: true,
        properties: {
          regex: /^_/
        },
        toplevel: true
      },
      format: {
        comments: false
      }
    },

    // Reduced chunk size limit for better performance
    chunkSizeWarningLimit: 200,

    // CSS optimization
    cssCodeSplit: true,
    cssMinify: true,

    // Optimize assets
    assetsInlineLimit: 4096, // Increased for better performance

    // Source maps for debugging
    sourcemap: mode === 'development',

    // Optimize module resolution
    modulePreload: {
      polyfill: true
    },

    // Enable tree shaking
    emptyOutDir: true,

    // Additional optimizations
    reportCompressedSize: false, // Disable for faster builds
    write: true,

    // Improve build performance
    commonjsOptions: {
      transformMixedEsModules: true
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
    'clsx',
    'tailwind-merge',
    'class-variance-authority',
    'react-hook-form',
    '@hookform/resolvers',
    'zod'],

    exclude: ['@dnd-kit/core'],
    esbuildOptions: {
      target: 'es2020',
      define: {
        global: 'globalThis'
      }
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
    },
    // Additional optimizations
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    logOverride: {
      'this-is-undefined-in-esm': 'silent'
    }
  },

  // Plugin optimizations
  define: {
    __DEV__: mode === 'development',
    'process.env.NODE_ENV': JSON.stringify(mode),
    global: 'globalThis'
  },

  // Worker optimizations
  worker: {
    format: 'es'
  },

  // Preview optimizations
  preview: {
    port: 4173,
    strictPort: true
  },

  // Experimental features
  experimental: {
    renderBuiltUrl: (filename) => {
      return `/${filename}`;
    }
  }
}));