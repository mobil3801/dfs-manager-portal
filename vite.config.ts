import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react()
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React ecosystem
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor';
          }
          
          // Radix UI components
          if (id.includes('@radix-ui')) {
            return 'ui-vendor';
          }
          
          // Charts and visualization
          if (id.includes('recharts')) {
            return 'charts-vendor';
          }
          
          // Data fetching
          if (id.includes('@tanstack/react-query')) {
            return 'data-vendor';
          }
          
          // Lucide icons
          if (id.includes('lucide-react')) {
            return 'icons-vendor';
          }
          
          // Utilities
          if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'utils-vendor';
          }
          
          // Animation libraries
          if (id.includes('motion') || id.includes('framer-motion')) {
            return 'animation-vendor';
          }
          
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod')) {
            return 'forms-vendor';
          }
          
          // File handling
          if (id.includes('react-dropzone')) {
            return 'file-vendor';
          }
          
          // Other large node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
    target: 'esnext'
  }
}));