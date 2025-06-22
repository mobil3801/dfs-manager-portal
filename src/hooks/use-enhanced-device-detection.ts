import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  orientation: 'portrait' | 'landscape';
  screenSize: 'small' | 'medium' | 'large' | 'xl';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browserName: string;
  platform: string;
  connectionType: 'fast' | 'slow' | 'unknown';
  viewportHeight: number;
  viewportWidth: number;
  devicePixelRatio: number;
  isHighDPI: boolean;
  supportsHover: boolean;
  prefersReducedMotion: boolean;
  navigationHeight: number;
}

export const useEnhancedDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    hasTouch: false,
    orientation: 'landscape',
    screenSize: 'large',
    deviceType: 'desktop',
    browserName: 'unknown',
    platform: 'unknown',
    connectionType: 'unknown',
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth,
    devicePixelRatio: window.devicePixelRatio || 1,
    isHighDPI: false,
    supportsHover: false,
    prefersReducedMotion: false,
    navigationHeight: 64
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Touch detection
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Hover support detection
      const supportsHover = window.matchMedia('(hover: hover)').matches;

      // High DPI detection
      const devicePixelRatio = window.devicePixelRatio || 1;
      const isHighDPI = devicePixelRatio > 1;

      // Reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Enhanced screen size classification with better breakpoints
      let screenSize: 'small' | 'medium' | 'large' | 'xl' = 'large';
      if (width < 640) screenSize = 'small';else
      if (width < 768) screenSize = 'medium';else
      if (width < 1024) screenSize = 'large';else
      screenSize = 'xl';

      // Enhanced device type detection
      const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTabletUA = /iPad|Android(?!.*Mobile)|Tablet/i.test(userAgent) ||
      hasTouch && width >= 768 && width <= 1024;

      // Better device classification
      const isMobile = (width <= 767 || isMobileUA) && !isTabletUA;
      const isTablet = width >= 768 && width <= 1024 || isTabletUA;
      const isDesktop = width > 1024 && !isMobileUA && !isTabletUA;

      // Device type priority with enhanced logic
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (isMobile || hasTouch && width <= 767) deviceType = 'mobile';else
      if (isTablet || hasTouch && width <= 1024) deviceType = 'tablet';

      // Orientation with better detection
      const orientation = height > width ? 'portrait' : 'landscape';

      // Enhanced browser detection
      let browserName = 'unknown';
      if (userAgent.includes('Edg/')) browserName = 'edge';else
      if (userAgent.includes('Chrome/')) browserName = 'chrome';else
      if (userAgent.includes('Firefox/')) browserName = 'firefox';else
      if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) browserName = 'safari';

      // Enhanced platform detection
      let platform = 'unknown';
      if (userAgent.includes('Win')) platform = 'windows';else
      if (userAgent.includes('Mac')) platform = 'mac';else
      if (userAgent.includes('Linux')) platform = 'linux';else
      if (userAgent.includes('Android')) platform = 'android';else
      if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) platform = 'ios';

      // Enhanced connection type estimation
      const connection = (navigator as any).connection;
      let connectionType: 'fast' | 'slow' | 'unknown' = 'unknown';
      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;

        if (effectiveType === '4g' || downlink > 10) connectionType = 'fast';else
        if (effectiveType === '3g' || effectiveType === 'slow-2g' || downlink < 1.5) connectionType = 'slow';else
        connectionType = 'fast'; // Default to fast for unknown good connections
      }

      // Calculate appropriate navigation height based on device
      let navigationHeight = 64; // Default desktop
      if (deviceType === 'mobile') navigationHeight = 56;else
      if (deviceType === 'tablet') navigationHeight = 60;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        hasTouch,
        orientation,
        screenSize,
        deviceType,
        browserName,
        platform,
        connectionType,
        viewportHeight: height,
        viewportWidth: width,
        devicePixelRatio,
        isHighDPI,
        supportsHover,
        prefersReducedMotion,
        navigationHeight
      });
    };

    // Initial detection
    detectDevice();

    // Listen for changes with debouncing
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(detectDevice, 150);
    };

    const handleOrientationChange = () => {
      // Delay to allow viewport to adjust
      setTimeout(detectDevice, 200);
    };

    // Enhanced event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Listen for reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => detectDevice();
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

  return deviceInfo;
};