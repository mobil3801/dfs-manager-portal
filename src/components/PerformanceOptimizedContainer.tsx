
import React, { Suspense, lazy, useEffect } from 'react';
import { motion } from 'motion/react';
import { useDeviceAdaptive } from '@/contexts/DeviceAdaptiveContext';

interface PerformanceOptimizedContainerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  preloadOnHover?: boolean;
  className?: string;
}

const PerformanceOptimizedContainer: React.FC<PerformanceOptimizedContainerProps> = ({
  children,
  fallback,
  preloadOnHover = false,
  className = ''
}) => {
  const device = useDeviceAdaptive();

  const defaultFallback =
  <motion.div
    className="flex items-center justify-center p-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}>

      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-600">Loading...</span>
      </div>
    </motion.div>;


  // Disable heavy animations on slow connections
  useEffect(() => {
    if (device.connectionType === 'slow') {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
    } else {
      document.documentElement.style.setProperty('--animation-duration', '0.3s');
    }
  }, [device.connectionType]);

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <motion.div
        className={className}
        initial={device.connectionType !== 'slow' ? { opacity: 0, y: 10 } : { opacity: 1 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: device.connectionType === 'slow' ? 0.1 : device.animationDuration / 1000
        }}>

        {children}
      </motion.div>
    </Suspense>);

};

export default PerformanceOptimizedContainer;