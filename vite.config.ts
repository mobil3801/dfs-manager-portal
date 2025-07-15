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
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          
          // React Router
          if (id.includes('node_modules/react-router-dom/')) {
            return 'react-router';
          }
          
          // Radix UI components
          if (id.includes('node_modules/@radix-ui/')) {
            return 'radix-ui';
          }
          
          // Form handling
          if (id.includes('node_modules/react-hook-form/') || 
              id.includes('node_modules/@hookform/') || 
              id.includes('node_modules/zod/')) {
            return 'forms';
          }
          
          // Date utilities
          if (id.includes('node_modules/date-fns/')) {
            return 'date-utils';
          }
          
          // Icons
          if (id.includes('node_modules/lucide-react/')) {
            return 'icons';
          }
          
          // Charts
          if (id.includes('node_modules/recharts/')) {
            return 'charts';
          }
          
          // React Query
          if (id.includes('node_modules/@tanstack/react-query/')) {
            return 'react-query';
          }
          
          // Animation libraries
          if (id.includes('node_modules/motion/') || 
              id.includes('node_modules/framer-motion/')) {
            return 'animation';
          }
          
          // Utility libraries
          if (id.includes('node_modules/clsx/') || 
              id.includes('node_modules/class-variance-authority/') || 
              id.includes('node_modules/tailwind-merge/')) {
            return 'utils';
          }
          
          // Toast notifications
          if (id.includes('node_modules/sonner/')) {
            return 'toast';
          }
          
          // Command palette
          if (id.includes('node_modules/cmdk/')) {
            return 'command';
          }
          
          // File upload
          if (id.includes('node_modules/react-dropzone/')) {
            return 'file-upload';
          }
          
          // Other UI libraries
          if (id.includes('node_modules/input-otp/') || 
              id.includes('node_modules/react-day-picker/') || 
              id.includes('node_modules/embla-carousel-react/') || 
              id.includes('node_modules/react-resizable-panels/') || 
              id.includes('node_modules/vaul/')) {
            return 'ui-misc';
          }
          
          // All other node_modules
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
          
          // Group our own components by feature
          if (id.includes('/pages/Products/') || id.includes('/components/') && id.includes('Product')) {
            return 'products';
          }
          
          if (id.includes('/pages/Employees/') || id.includes('/components/') && id.includes('Employee')) {
            return 'employees';
          }
          
          if (id.includes('/pages/Sales/') || id.includes('/components/') && id.includes('Sales')) {
            return 'sales';
          }
          
          if (id.includes('/pages/Admin/') || id.includes('/components/') && id.includes('Admin')) {
            return 'admin';
          }
          
          if (id.includes('/ErrorBoundary/') || id.includes('ErrorBoundary')) {
            return 'error-handling';
          }
          
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }
        }
      }
    },
    // Increase chunk size warning limit to 1MB
    chunkSizeWarningLimit: 1000,
    // Enable gzip compression analysis
    reportCompressedSize: true,
    // Optimize CSS
    cssCodeSplit: true,
    // Sourcemap for production debugging (optional)
    sourcemap: mode === 'development'
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
    ]
  }
}));
