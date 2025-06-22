
import React from 'react';
import { motion } from 'motion/react';
import { useDeviceAdaptive } from '@/contexts/DeviceAdaptiveContext';
import AdaptiveNavigation from '@/components/AdaptiveNavigation';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({ children, className = '' }) => {
  const device = useDeviceAdaptive();

  const getLayoutClasses = () => {
    switch (device.preferredNavigation) {
      case 'sidebar':
        return 'ml-70'; // Account for sidebar width
      case 'bottom':
        return 'pt-16 pb-20'; // Account for header and bottom nav
      case 'top':
        return 'pt-16'; // Account for top navigation
      default:
        return '';
    }
  };

  const getContentPadding = () => {
    if (device.isMobile) return 'p-4';
    if (device.isTablet) return 'p-6';
    return 'p-8';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdaptiveNavigation />
      
      <motion.main
        className={`
          ${getLayoutClasses()}
          ${getContentPadding()}
          ${className}
          transition-all duration-300 ease-in-out
        `}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: device.animationDuration / 1000 }}
      >
        <div className={`
          max-w-7xl mx-auto
          ${device.isMobile ? 'space-y-4' : device.isTablet ? 'space-y-6' : 'space-y-8'}
        `}>
          {children}
        </div>
      </motion.main>
    </div>
  );
};

export default AdaptiveLayout;
