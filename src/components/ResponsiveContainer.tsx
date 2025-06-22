import React from 'react';
import { motion } from 'motion/react';
import { useDeviceAdaptive } from '@/contexts/DeviceAdaptiveContext';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  enableScrollIndicator?: boolean;
  fullHeight?: boolean;
  noPadding?: boolean;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  enableScrollIndicator = false,
  fullHeight = false,
  noPadding = false,
}) => {
  const device = useDeviceAdaptive();

  // Get container classes based on device type
  const getContainerClasses = () => {
    const baseClasses = 'w-full mx-auto';
    const heightClass = fullHeight ? 'min-h-full' : '';
    const paddingClass = noPadding ? '' : device.contentPadding;
    const spacingClass = noPadding ? '' : device.spacing;
    
    // Max width based on screen size
    let maxWidthClass = 'max-w-6xl';
    if (device.screenSize === 'xl') maxWidthClass = 'max-w-7xl';
    else if (device.screenSize === 'small') maxWidthClass = 'max-w-sm';
    else if (device.screenSize === 'medium') maxWidthClass = 'max-w-4xl';

    return `${baseClasses} ${maxWidthClass} ${heightClass} ${paddingClass} ${spacingClass}`;
  };

  // Get animation properties
  const getAnimationProps = () => {
    if (device.prefersReducedMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        transition: { duration: 0 }
      };
    }

    return {
      initial: { opacity: 0, y: device.isMobile ? 10 : 20 },
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: device.animationDuration / 1000,
        ease: 'easeOut'
      }
    };
  };

  return (
    <motion.div
      className={`${getContainerClasses()} ${className}`}
      {...getAnimationProps()}
    >
      {children}
      
      {/* Optional scroll indicator for mobile */}
      {enableScrollIndicator && device.isMobile && (
        <div className="fixed bottom-24 right-4 z-30">
          <div className="w-1 h-16 bg-gray-200 dark:bg-gray-700 rounded-full opacity-50">
            <motion.div
              className="w-full bg-blue-500 rounded-full"
              initial={{ height: '0%' }}
              animate={{ height: '60%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ResponsiveContainer;