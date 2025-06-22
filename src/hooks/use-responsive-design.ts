import { useState, useEffect } from 'react';
import { 
  detectDevice, 
  getOptimalNavigation, 
  getResponsiveGrid, 
  getResponsiveSpacing,
  getTouchTargetSize,
  getNavigationHeight,
  getContentMaxWidth,
  getAnimationDuration,
  shouldSimplifyContent,
  getOptimalFontSizes,
  getDesktopLayoutStyles
} from '@/utils/responsiveHelper';

/**
 * Enhanced responsive design hook with automatic device detection
 * and optimal layout suggestions
 */
export const useResponsiveDesign = () => {
  const [device, setDevice] = useState(() => detectDevice());

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setDevice(detectDevice());
      }, 150);
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        setDevice(detectDevice());
      }, 200);
    };

    // Listen for changes
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Listen for reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => setDevice(detectDevice());
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMotionChange);
    }

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMotionChange);
      }
    };
  }, []);

  // Computed responsive properties
  const optimalNavigation = getOptimalNavigation(device);
  const responsiveSpacing = getResponsiveSpacing(device);
  const touchTargetSize = getTouchTargetSize(device);
  const navigationHeight = getNavigationHeight(device);
  const contentMaxWidth = getContentMaxWidth(device);
  const animationDuration = getAnimationDuration(device);
  const simplifyContent = shouldSimplifyContent(device);
  const fontSizes = getOptimalFontSizes(device);
  const desktopLayoutStyles = getDesktopLayoutStyles(device);

  // Responsive grid helper
  const getGrid = (contentType: 'cards' | 'list' | 'form' | 'table' = 'cards') => {
    return getResponsiveGrid(device, contentType);
  };

  // Responsive classes helper
  const getResponsiveClasses = () => {
    return {
      container: `${contentMaxWidth} ${responsiveSpacing} mx-auto`,
      grid: getGrid(),
      text: fontSizes,
      spacing: responsiveSpacing,
      navigation: `h-${navigationHeight}`,
      touchTarget: `min-h-[${touchTargetSize}px]`
    };
  };

  // Layout configuration
  const layoutConfig = {
    shouldUseSidebar: device.isDesktop && optimalNavigation === 'sidebar',
    shouldUseBottomNav: device.isMobile && optimalNavigation === 'bottom',
    shouldUseTopNav: device.isTablet && optimalNavigation === 'top',
    shouldShowMobileOptimizations: device.isMobile,
    shouldShowDesktopOptimizations: device.isDesktop,
    shouldReduceAnimations: device.prefersReducedMotion || simplifyContent
  };

  // Performance optimizations
  const performanceConfig = {
    enableAnimations: !device.prefersReducedMotion && device.connectionType !== 'slow',
    enableHoverEffects: device.supportsHover,
    enableGestures: device.hasTouch,
    prioritizeSpeed: device.connectionType === 'slow' || device.isMobile
  };

  return {
    // Device information
    device,
    
    // Computed properties
    optimalNavigation,
    responsiveSpacing,
    touchTargetSize,
    navigationHeight,
    contentMaxWidth,
    animationDuration,
    simplifyContent,
    fontSizes,
    desktopLayoutStyles,
    
    // Helper functions
    getGrid,
    getResponsiveClasses,
    
    // Configuration objects
    layoutConfig,
    performanceConfig,
    
    // Quick access properties
    isMobile: device.isMobile,
    isTablet: device.isTablet,
    isDesktop: device.isDesktop,
    hasTouch: device.hasTouch,
    supportsHover: device.supportsHover,
    prefersReducedMotion: device.prefersReducedMotion,
    connectionType: device.connectionType
  };
};

export default useResponsiveDesign;
