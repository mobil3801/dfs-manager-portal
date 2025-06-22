import { useDeviceAdaptive } from '@/contexts/DeviceAdaptiveContext';
import { useCallback, useMemo } from 'react';

export const useResponsiveUtils = () => {
  const device = useDeviceAdaptive();

  // Navigation utilities
  const getNavigationSpacing = useCallback(() => {
    switch (device.preferredNavigation) {
      case 'sidebar':
        return { paddingLeft: `${device.sidebarWidth}px` };
      case 'bottom':
        return {
          paddingTop: `${device.navigationHeight}px`,
          paddingBottom: '80px' // Bottom nav height
        };
      case 'top':
        return { paddingTop: `${device.navigationHeight}px` };
      default:
        return {};
    }
  }, [device.preferredNavigation, device.sidebarWidth, device.navigationHeight]);

  // Safe area utilities for mobile devices
  const getSafeAreaInsets = useCallback(() => {
    if (device.deviceType === 'mobile') {
      return {
        paddingTop: 'max(env(safe-area-inset-top), 1rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      };
    }
    return {};
  }, [device.deviceType]);

  // Responsive class utilities
  const getResponsiveClasses = useMemo(() => ({
    container: device.screenSize === 'xl' ? 'max-w-7xl' : 'max-w-6xl',
    padding: device.contentPadding,
    spacing: device.spacing,
    borderRadius: device.borderRadius,
    fontSize: {
      small: device.optimalFontSize === 'small' ? 'text-sm' : 'text-base',
      medium: device.optimalFontSize === 'large' ? 'text-lg' : 'text-base',
      large: device.optimalFontSize === 'large' ? 'text-xl' : 'text-lg'
    },
    touchTarget: device.hasTouch ? 'min-h-touch' : 'min-h-8',
    shadow: {
      none: '',
      subtle: 'shadow-sm',
      normal: 'shadow-md',
      strong: 'shadow-lg'
    }[device.shadowIntensity]
  }), [device]);

  // Animation utilities
  const getAnimationConfig = useCallback((type: 'fade' | 'slide' | 'scale' = 'fade') => {
    if (device.prefersReducedMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        transition: { duration: 0 }
      };
    }

    const duration = device.animationDuration / 1000;

    switch (type) {
      case 'slide':
        return {
          initial: { opacity: 0, x: device.isMobile ? 20 : 30 },
          animate: { opacity: 1, x: 0 },
          transition: { duration, ease: 'easeOut' }
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration, ease: 'easeOut' }
        };
      default:
        return {
          initial: { opacity: 0, y: device.isMobile ? 10 : 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration, ease: 'easeOut' }
        };
    }
  }, [device.prefersReducedMotion, device.animationDuration, device.isMobile]);

  // Grid utilities
  const getGridClasses = useCallback((cols: {mobile: number;tablet: number;desktop: number;}) => {
    const mobileClass = `grid-cols-${cols.mobile}`;
    const tabletClass = `md:grid-cols-${cols.tablet}`;
    const desktopClass = `lg:grid-cols-${cols.desktop}`;

    return `grid ${mobileClass} ${tabletClass} ${desktopClass} gap-4 ${device.isMobile ? 'gap-2' : ''} ${device.isDesktop ? 'gap-6' : ''}`;
  }, [device.isMobile, device.isDesktop]);

  // Button size utilities
  const getButtonSize = useCallback((size: 'sm' | 'md' | 'lg' = 'md') => {
    const baseSize = device.hasTouch ? 'lg' : size;
    return baseSize;
  }, [device.hasTouch]);

  // Card size utilities
  const getCardClasses = useCallback(() => {
    const baseClasses = `bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${device.borderRadius}`;
    const shadowClass = getResponsiveClasses.shadow;
    const paddingClass = device.preferredCardSize === 'compact' ? 'p-4' :
    device.preferredCardSize === 'large' ? 'p-8' : 'p-6';

    return `${baseClasses} ${shadowClass} ${paddingClass}`;
  }, [device.borderRadius, device.preferredCardSize, getResponsiveClasses.shadow]);

  // Form utilities
  const getFormClasses = useCallback(() => ({
    container: `space-y-${device.isMobile ? '4' : '6'}`,
    label: `block text-sm font-medium text-gray-700 dark:text-gray-300 mb-${device.isMobile ? '1' : '2'}`,
    input: `w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${device.hasTouch ? 'min-h-touch' : ''}`,
    button: `px-4 py-2 ${device.hasTouch ? 'min-h-touch' : ''} rounded-md font-medium transition-colors`
  }), [device.isMobile, device.hasTouch]);

  // Breakpoint utilities
  const breakpoints = useMemo(() => ({
    isMobile: device.viewportWidth < 768,
    isTablet: device.viewportWidth >= 768 && device.viewportWidth < 1024,
    isDesktop: device.viewportWidth >= 1024,
    isLargeDesktop: device.viewportWidth >= 1280,
    isXLDesktop: device.viewportWidth >= 1536
  }), [device.viewportWidth]);

  return {
    device,
    getNavigationSpacing,
    getSafeAreaInsets,
    getResponsiveClasses,
    getAnimationConfig,
    getGridClasses,
    getButtonSize,
    getCardClasses,
    getFormClasses,
    breakpoints
  };
};