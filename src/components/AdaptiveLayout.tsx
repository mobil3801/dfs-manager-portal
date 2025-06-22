import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useDeviceAdaptive } from '@/contexts/DeviceAdaptiveContext';
import AdaptiveNavigation from '@/components/AdaptiveNavigation';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({ children, className = '' }) => {
  const device = useDeviceAdaptive();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Calculate layout styles based on navigation type
  const getLayoutStyles = () => {
    const baseStyles: React.CSSProperties = {
      minHeight: '100vh',
      transition: 'all 300ms ease-in-out'
    };

    switch (device.preferredNavigation) {
      case 'sidebar':
        return {
          ...baseStyles,
          marginLeft: `${device.sidebarWidth}px`
        };
      case 'bottom':
        return {
          ...baseStyles,
          paddingTop: `${device.navigationHeight}px`,
          paddingBottom: '80px' // Bottom navigation height
        };
      case 'top':
        return {
          ...baseStyles,
          paddingTop: `${device.navigationHeight}px`
        };
      default:
        return baseStyles;
    }
  };

  // Get responsive content container classes
  const getContentContainerClasses = () => {
    const baseClasses = 'w-full mx-auto';
    const maxWidthClass = device.screenSize === 'xl' ? 'max-w-7xl' : 'max-w-6xl';

    return `${baseClasses} ${maxWidthClass} ${device.contentPadding} ${device.spacing}`;
  };

  // Calculate safe area styles for mobile devices
  const getSafeAreaStyles = (): React.CSSProperties => {
    if (device.deviceType === 'mobile') {
      return {
        paddingTop: 'max(env(safe-area-inset-top), 1rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      };
    }
    return {};
  };

  // Get animation props based on device capabilities
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

  // Handle scroll progress for mobile indicator
  useEffect(() => {
    if (!device.isMobile) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [device.isMobile]);

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      style={getSafeAreaStyles()}>

      <AdaptiveNavigation />
      
      <motion.main
        className={className}
        style={getLayoutStyles()}
        {...getAnimationProps()}>

        <div className={getContentContainerClasses()}>
          {children}
        </div>
        
        {/* Scroll indicator for mobile */}
        {device.isMobile && device.preferredNavigation === 'bottom' &&
        <div className="fixed bottom-24 right-4 w-1 h-16 bg-gray-200 dark:bg-gray-700 rounded-full opacity-50 pointer-events-none z-30">
            <motion.div
            className="w-full bg-blue-500 rounded-full origin-top"
            style={{ height: `${scrollProgress}%` }}
            transition={{ duration: 0.1 }} />

          </div>
        }

        {/* Back to top button for mobile */}
        {device.isMobile && scrollProgress > 20 &&
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-24 left-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg z-30 flex items-center justify-center"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top">

            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        }
      </motion.main>
    </div>);

};

export default AdaptiveLayout;