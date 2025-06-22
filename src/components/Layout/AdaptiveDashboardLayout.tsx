import React from 'react';
import { Outlet } from 'react-router-dom';
import { DeviceAdaptiveProvider } from '@/contexts/DeviceAdaptiveContext';
import EnhancedAdaptiveLayout from '@/components/EnhancedAdaptiveLayout';
import EnhancedDashboardLayout from '@/components/Layout/EnhancedDashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'motion/react';
import { useIsMobile } from '@/hooks/use-mobile';

const AdaptiveDashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </motion.div>
    );
  }

  // Use enhanced layout for desktop, adaptive for mobile
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EnhancedDashboardLayout />
      </div>
    );
  }

  // Mobile view with adaptive layout
  return (
    <DeviceAdaptiveProvider>
      <EnhancedAdaptiveLayout padding="small" maxWidth="full">
        <Outlet />
      </EnhancedAdaptiveLayout>
    </DeviceAdaptiveProvider>
  );
};

export default AdaptiveDashboardLayout;