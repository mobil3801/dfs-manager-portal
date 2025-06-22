
import React from 'react';
import { Outlet } from 'react-router-dom';
import { DeviceAdaptiveProvider } from '@/contexts/DeviceAdaptiveContext';
import AdaptiveLayout from '@/components/AdaptiveLayout';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'motion/react';

const AdaptiveDashboardLayout: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}>

        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </motion.div>);

  }

  return (
    <DeviceAdaptiveProvider>
      <AdaptiveLayout>
        <Outlet />
      </AdaptiveLayout>
    </DeviceAdaptiveProvider>);

};

export default AdaptiveDashboardLayout;