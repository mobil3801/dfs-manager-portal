// Responsive helper utility for optimal device-specific experiences
// Provides device detection, layout optimization, and responsive design utilities

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export interface ResponsiveConfig {
  breakpoints: ResponsiveBreakpoints;
  touchTargetSize: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  navigationHeight: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  sidebarWidth: {
    collapsed: number;
    expanded: number;
  };
  contentMaxWidth: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  spacing: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

// Default responsive configuration
export const defaultResponsiveConfig: ResponsiveConfig = {
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    wide: 1280
  },
  touchTargetSize: {
    mobile: 44,
    tablet: 40,
    desktop: 32
  },
  navigationHeight: {
    mobile: 56,
    tablet: 60,
    desktop: 64
  },
  sidebarWidth: {
    collapsed: 64,
    expanded: 280
  },
  contentMaxWidth: {
    mobile: 'max-w-full',
    tablet: 'max-w-4xl',
    desktop: 'max-w-6xl'
  },
  spacing: {
    mobile: 'space-y-4 px-4 py-4',
    tablet: 'space-y-6 px-6 py-6',
    desktop: 'space-y-8 px-8 py-8'
  }
};

/**
 * Enhanced device detection with comprehensive capabilities
 */
export const detectDevice = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const userAgent = navigator.userAgent;

  // Touch capabilities
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const supportsHover = window.matchMedia('(hover: hover)').matches;

  // Device type detection with enhanced logic
  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTabletUA = /iPad|Android(?!.*Mobile)|Tablet/i.test(userAgent);

  // Screen size classification
  const breakpoints = defaultResponsiveConfig.breakpoints;
  let screenSize: 'mobile' | 'tablet' | 'desktop' | 'wide' = 'desktop';

  if (width < breakpoints.mobile) screenSize = 'mobile';else
  if (width < breakpoints.tablet) screenSize = 'mobile';else
  if (width < breakpoints.desktop) screenSize = 'tablet';else
  if (width < breakpoints.wide) screenSize = 'desktop';else
  screenSize = 'wide';

  // Device classification with priority logic
  const isMobile = screenSize === 'mobile' || isMobileUA && !isTabletUA;
  const isTablet = screenSize === 'tablet' || isTabletUA && !isMobileUA;
  const isDesktop = screenSize === 'desktop' || screenSize === 'wide';

  // Device type for UI decisions
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (isMobile) deviceType = 'mobile';else
  if (isTablet) deviceType = 'tablet';

  // Orientation
  const orientation = height > width ? 'portrait' : 'landscape';

  // Performance indicators
  const connection = (navigator as any).connection;
  let connectionType: 'fast' | 'slow' | 'unknown' = 'unknown';
  if (connection) {
    const effectiveType = connection.effectiveType;
    connectionType = effectiveType === '4g' || connection.downlink > 10 ? 'fast' : 'slow';
  }

  // User preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return {
    isMobile,
    isTablet,
    isDesktop,
    hasTouch,
    supportsHover,
    orientation,
    screenSize,
    deviceType,
    width,
    height,
    connectionType,
    prefersReducedMotion,
    prefersDarkMode,
    devicePixelRatio: window.devicePixelRatio || 1,
    isHighDPI: (window.devicePixelRatio || 1) > 1
  };
};

/**
 * Get optimal navigation style based on device
 */
export const getOptimalNavigation = (device: ReturnType<typeof detectDevice>) => {
  if (device.isMobile) return 'bottom';
  if (device.isTablet) return 'top';
  return 'sidebar';
};

/**
 * Get responsive grid classes based on device and content type
 */
export const getResponsiveGrid = (
device: ReturnType<typeof detectDevice>,
contentType: 'cards' | 'list' | 'form' | 'table' = 'cards') =>
{
  const { isMobile, isTablet, screenSize } = device;

  const gridConfigs = {
    cards: {
      mobile: 'grid-cols-1',
      tablet: 'grid-cols-2 lg:grid-cols-3',
      desktop: 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    },
    list: {
      mobile: 'grid-cols-1',
      tablet: 'grid-cols-1',
      desktop: 'grid-cols-1'
    },
    form: {
      mobile: 'grid-cols-1',
      tablet: 'grid-cols-1 md:grid-cols-2',
      desktop: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    },
    table: {
      mobile: 'grid-cols-1',
      tablet: 'grid-cols-1',
      desktop: 'grid-cols-1'
    }
  };

  if (isMobile) return gridConfigs[contentType].mobile;
  if (isTablet) return gridConfigs[contentType].tablet;
  return gridConfigs[contentType].desktop;
};

/**
 * Get optimal spacing based on device
 */
export const getResponsiveSpacing = (device: ReturnType<typeof detectDevice>) => {
  const config = defaultResponsiveConfig.spacing;
  if (device.isMobile) return config.mobile;
  if (device.isTablet) return config.tablet;
  return config.desktop;
};

/**
 * Get optimal touch target size
 */
export const getTouchTargetSize = (device: ReturnType<typeof detectDevice>) => {
  const config = defaultResponsiveConfig.touchTargetSize;
  if (device.isMobile) return config.mobile;
  if (device.isTablet) return config.tablet;
  return config.desktop;
};

/**
 * Get navigation height based on device
 */
export const getNavigationHeight = (device: ReturnType<typeof detectDevice>) => {
  const config = defaultResponsiveConfig.navigationHeight;
  if (device.isMobile) return config.mobile;
  if (device.isTablet) return config.tablet;
  return config.desktop;
};

/**
 * Get content max width based on device
 */
export const getContentMaxWidth = (device: ReturnType<typeof detectDevice>) => {
  const config = defaultResponsiveConfig.contentMaxWidth;
  if (device.isMobile) return config.mobile;
  if (device.isTablet) return config.tablet;
  return config.desktop;
};

/**
 * Get animation duration based on device capabilities
 */
export const getAnimationDuration = (device: ReturnType<typeof detectDevice>) => {
  if (device.prefersReducedMotion) return 0;
  if (device.connectionType === 'slow') return 150;
  if (device.isMobile) return 250;
  return 300;
};

/**
 * Check if content should be simplified for device
 */
export const shouldSimplifyContent = (device: ReturnType<typeof detectDevice>) => {
  return device.isMobile || device.connectionType === 'slow' || device.prefersReducedMotion;
};

/**
 * Get optimal font size classes
 */
export const getOptimalFontSizes = (device: ReturnType<typeof detectDevice>) => {
  if (device.isMobile && device.screenSize === 'mobile') {
    return {
      heading: 'text-2xl',
      subheading: 'text-lg',
      body: 'text-sm',
      caption: 'text-xs'
    };
  }

  if (device.isDesktop && device.screenSize === 'wide') {
    return {
      heading: 'text-4xl',
      subheading: 'text-2xl',
      body: 'text-lg',
      caption: 'text-base'
    };
  }

  return {
    heading: 'text-3xl',
    subheading: 'text-xl',
    body: 'text-base',
    caption: 'text-sm'
  };
};

/**
 * Get layout styles for desktop navigation obstruction prevention
 */
export const getDesktopLayoutStyles = (device: ReturnType<typeof detectDevice>) => {
  if (device.isDesktop && getOptimalNavigation(device) === 'sidebar') {
    const sidebarWidth = defaultResponsiveConfig.sidebarWidth.expanded;
    return {
      marginLeft: `${sidebarWidth}px`,
      width: `calc(100% - ${sidebarWidth}px)`,
      paddingTop: '2rem',
      minHeight: 'calc(100vh - 2rem)'
    };
  }

  return {};
};

export default {
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
  getDesktopLayoutStyles,
  defaultResponsiveConfig
};