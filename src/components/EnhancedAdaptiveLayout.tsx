import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useDeviceAdaptive } from '@/contexts/DeviceAdaptiveContext';
import AdaptiveNavigation from '@/components/AdaptiveNavigation';

interface EnhancedAdaptiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  maxWidth?: 'full' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl';
}

const EnhancedAdaptiveLayout: React.FC<EnhancedAdaptiveLayoutProps> = ({
  children,
  className = '',
  padding = 'medium',
  maxWidth = '6xl'
}) => {
  const device = useDeviceAdaptive();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Enhanced layout styles based on navigation type with proper spacing
  const getLayoutStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      minHeight: '100vh',
      transition: 'all 300ms ease-in-out',
      position: 'relative',
      zIndex: 1
    };

    switch (device.preferredNavigation) {
      case 'sidebar':
        return {
          ...baseStyles,
          // Fixed sidebar spacing - ensure content doesn't overlap
          marginLeft: `${device.sidebarWidth + 16}px`, // Sidebar width + margin
          width: `calc(100% - ${device.sidebarWidth + 32}px)`, // Account for both margins
          paddingLeft: '1rem',
          paddingRight: '1rem',
          paddingTop: '2rem',
          paddingBottom: '2rem'
        };
      case 'bottom':
        return {
          ...baseStyles,
          // Header spacing for mobile with safe area
          paddingTop: `${device.navigationHeight + 20}px`,
          // Bottom navigation spacing with extra margin
          paddingBottom: '100px', // 80px nav + 20px margin
          paddingLeft: '1rem',
          paddingRight: '1rem'
        };
      case 'top':
        return {
          ...baseStyles,
          // Top navigation spacing with proper margin
          paddingTop: `${device.navigationHeight + 32}px`, // Increased padding
          paddingLeft: '1rem',
          paddingRight: '1rem',
          paddingBottom: '2rem'
        };
      default:
        return {
          ...baseStyles,
          padding: '2rem'
        };
    }
  };

  // Enhanced content container classes with responsive max-width
  const getContentContainerClasses = () => {
    const baseClasses = 'w-full mx-auto';

    // Max width based on prop and device
    const maxWidthClasses = {
      'full': 'max-w-full',
      'sm': 'max-w-sm',
      'md': 'max-w-md',
      'lg': 'max-w-lg',
      'xl': 'max-w-xl',
      '2xl': 'max-w-2xl',
      '4xl': 'max-w-4xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl'
    };

    // Auto-adjust max width based on device
    let finalMaxWidth = maxWidth;
    if (device.isMobile && ['6xl', '7xl'].includes(maxWidth)) finalMaxWidth = '4xl';
    if (device.isTablet && maxWidth === '7xl') finalMaxWidth = '6xl';

    // Enhanced padding based on device and navigation
    const paddingClasses = {
      'none': '',
      'small': device.isMobile ? 'px-3 py-3' : 'px-6 py-6',
      'medium': device.isMobile ? 'px-4 py-4' : device.isTablet ? 'px-8 py-8' : 'px-12 py-12',
      'large': device.isMobile ? 'px-6 py-6' : device.isTablet ? 'px-12 py-12' : 'px-16 py-16'
    };

    // Enhanced spacing for better visual hierarchy
    const spacingClass = device.isMobile ? 'space-y-6' :
      device.isTablet ? 'space-y-8' : 'space-y-10';

    return `${baseClasses} ${maxWidthClasses[finalMaxWidth]} ${paddingClasses[padding]} ${spacingClass}`;
  };

  // Enhanced safe area styles for mobile devices
  const getSafeAreaStyles = (): React.CSSProperties => {
    if (device.deviceType === 'mobile') {
      return {
        paddingTop: 'max(env(safe-area-inset-top), 0px)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
        paddingLeft: 'max(env(safe-area-inset-left), 0px)',
        paddingRight: 'max(env(safe-area-inset-right), 0px)'
      };
    }
    return {};
  };

  // Enhanced animation props with better device optimization
  const getAnimationProps = () => {
    if (device.prefersReducedMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        transition: { duration: 0 }
      };
    }

    const baseAnimation = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: {
        duration: device.animationDuration / 1000,
        ease: 'easeOut'
      }
    };

    // Add vertical slide for non-mobile devices
    if (!device.isMobile && device.connectionType !== 'slow') {
      return {
        ...baseAnimation,
        initial: { ...baseAnimation.initial, y: 20 },
        animate: { ...baseAnimation.animate, y: 0 }
      };
    }

    return baseAnimation;
  };

  // Enhanced scroll progress for mobile
  useEffect(() => {
    if (!device.isMobile) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? scrollTop / docHeight * 100 : 0;
          setScrollProgress(Math.min(100, Math.max(0, progress)));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [device.isMobile]);

  // Desktop-specific container styles to prevent navigation obstruction
  const getDesktopContainerStyles = (): React.CSSProperties => {
    if (device.isDesktop && device.preferredNavigation === 'sidebar') {
      return {
        // Prevent content from going behind sidebar
        marginLeft: `${device.sidebarWidth}px`,
        width: `calc(100% - ${device.sidebarWidth}px)`,
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1
      };
    }
    return {};
  };

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      style={{
        ...getSafeAreaStyles(),
        ...getDesktopContainerStyles()
      }}
    >
      <AdaptiveNavigation />
      
      <motion.main
        className={`relative ${className}`}
        style={getLayoutStyles()}
        {...getAnimationProps()}
      >
        <div className={getContentContainerClasses()}>
          {children}
        </div>
        
        {/* Enhanced scroll indicator for mobile */}
        {device.isMobile && device.preferredNavigation === 'bottom' && (
          <div className="fixed bottom-32 right-4 w-1 h-16 bg-gray-200 dark:bg-gray-700 rounded-full opacity-50 pointer-events-none z-30">
            <motion.div
              className="w-full bg-blue-500 rounded-full origin-top"
              style={{ height: `${scrollProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        )}

        {/* Enhanced back to top button for mobile */}
        {device.isMobile && scrollProgress > 20 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-32 left-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg z-30 flex items-center justify-center"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        )}
      </motion.main>
    </div>
  );
};

export default EnhancedAdaptiveLayout;