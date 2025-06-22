
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
    connectionType: 'unknown'
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Touch detection
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Screen size classification
      let screenSize: 'small' | 'medium' | 'large' | 'xl' = 'large';
      if (width < 640) screenSize = 'small';
      else if (width < 768) screenSize = 'medium';
      else if (width < 1024) screenSize = 'large';
      else screenSize = 'xl';
      
      // Device type detection
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTabletUA = /iPad|Android(?!.*Mobile)/i.test(userAgent);
      
      const isMobile = (width <= 768 || isMobileUA) && !isTabletUA;
      const isTablet = (width > 768 && width <= 1024) || isTabletUA;
      const isDesktop = width > 1024 && !isMobileUA && !isTabletUA;
      
      // Device type priority
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (isMobile) deviceType = 'mobile';
      else if (isTablet) deviceType = 'tablet';
      
      // Orientation
      const orientation = height > width ? 'portrait' : 'landscape';
      
      // Browser detection
      let browserName = 'unknown';
      if (userAgent.includes('Chrome')) browserName = 'chrome';
      else if (userAgent.includes('Firefox')) browserName = 'firefox';
      else if (userAgent.includes('Safari')) browserName = 'safari';
      else if (userAgent.includes('Edge')) browserName = 'edge';
      
      // Platform detection
      let platform = 'unknown';
      if (userAgent.includes('Windows')) platform = 'windows';
      else if (userAgent.includes('Mac')) platform = 'mac';
      else if (userAgent.includes('Linux')) platform = 'linux';
      else if (userAgent.includes('Android')) platform = 'android';
      else if (userAgent.includes('iOS')) platform = 'ios';
      
      // Connection type estimation
      const connection = (navigator as any).connection;
      let connectionType: 'fast' | 'slow' | 'unknown' = 'unknown';
      if (connection) {
        const effectiveType = connection.effectiveType;
        connectionType = ['4g', 'fast'].includes(effectiveType) ? 'fast' : 'slow';
      }
      
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
        connectionType
      });
    };

    // Initial detection
    detectDevice();

    // Listen for changes
    const handleResize = () => detectDevice();
    const handleOrientationChange = () => setTimeout(detectDevice, 100);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
};
