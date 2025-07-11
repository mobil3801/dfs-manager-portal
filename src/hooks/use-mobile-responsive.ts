import { useState, useEffect } from 'react';

export interface MobileDeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  touchSupport: boolean;
  devicePixelRatio: number;
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  connection?: string;
  memory?: number;
  cores?: number;
  // Enhanced OS detection
  operatingSystem: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Unknown';
  browser: 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Opera' | 'Unknown';
  deviceType: 'iPhone' | 'iPad' | 'Android Phone' | 'Android Tablet' | 'Desktop' | 'Unknown';
  isStandalone: boolean; // PWA detection
  supportsWebGL: boolean;
  supportsServiceWorker: boolean;
  supportsPushNotifications: boolean;
  cookieEnabled: boolean;
  onlineStatus: boolean;
}

export interface MobileOptimizations {
  reducedMotion: boolean;
  highContrast: boolean;
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  touchTargetSize: 'small' | 'medium' | 'large';
  // OS-specific optimizations
  useNativeScrolling: boolean;
  enableHapticFeedback: boolean;
  optimizeForSafari: boolean;
  useAndroidDesign: boolean;
  useIOSDesign: boolean;
}

export interface MobileSpecs {
  performance: 'low' | 'medium' | 'high';
  networkSpeed: 'slow' | 'medium' | 'fast';
  storageAvailable: number;
  ramAvailable: number;
  // Enhanced performance metrics
  renderingCapability: 'basic' | 'standard' | 'advanced';
  animationPerformance: 'disabled' | 'reduced' | 'full';
  imageOptimization: 'webp' | 'jpeg' | 'png';
}

const detectOperatingSystem = (userAgent: string): MobileDeviceInfo['operatingSystem'] => {
  if (/iPad|iPhone|iPod/.test(userAgent)) return 'iOS';
  if (/Android/.test(userAgent)) return 'Android';
  if (/Windows/.test(userAgent)) return 'Windows';
  if (/Mac OS X/.test(userAgent)) return 'macOS';
  if (/Linux/.test(userAgent)) return 'Linux';
  return 'Unknown';
};

const detectBrowser = (userAgent: string): MobileDeviceInfo['browser'] => {
  if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) return 'Chrome';
  if (/Firefox/.test(userAgent)) return 'Firefox';
  if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return 'Safari';
  if (/Edge/.test(userAgent)) return 'Edge';
  if (/Opera/.test(userAgent)) return 'Opera';
  return 'Unknown';
};

const detectDeviceType = (userAgent: string, width: number): MobileDeviceInfo['deviceType'] => {
  if (/iPad/.test(userAgent)) return 'iPad';
  if (/iPhone/.test(userAgent)) return 'iPhone';
  if (/Android/.test(userAgent)) {
    return width < 768 ? 'Android Phone' : 'Android Tablet';
  }
  if (width < 768) return 'Android Phone'; // Assume mobile if small screen
  return 'Desktop';
};

const checkWebGLSupport = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
};

const checkImageFormatSupport = (): MobileSpecs['imageOptimization'] => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 'png';
  
  // Check WebP support
  canvas.width = 1;
  canvas.height = 1;
  const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  
  return webpSupported ? 'webp' : 'jpeg';
};

export const useMobileResponsive = () => {
  const [deviceInfo, setDeviceInfo] = useState<MobileDeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1920,
    screenHeight: 1080,
    orientation: 'landscape',
    touchSupport: false,
    devicePixelRatio: 1,
    userAgent: '',
    platform: '',
    language: 'en',
    timezone: 'UTC',
    operatingSystem: 'Unknown',
    browser: 'Unknown',
    deviceType: 'Desktop',
    isStandalone: false,
    supportsWebGL: false,
    supportsServiceWorker: false,
    supportsPushNotifications: false,
    cookieEnabled: false,
    onlineStatus: true,
  });

  const [deviceOptimizations, setDeviceOptimizations] = useState<MobileOptimizations>({
    reducedMotion: false,
    highContrast: false,
    darkMode: false,
    fontSize: 'medium',
    touchTargetSize: 'medium',
    useNativeScrolling: false,
    enableHapticFeedback: false,
    optimizeForSafari: false,
    useAndroidDesign: false,
    useIOSDesign: false,
  });

  const [deviceSpecs, setDeviceSpecs] = useState<MobileSpecs>({
    performance: 'medium',
    networkSpeed: 'medium',
    storageAvailable: 0,
    ramAvailable: 0,
    renderingCapability: 'standard',
    animationPerformance: 'full',
    imageOptimization: 'jpeg',
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;

      // Enhanced device type detection
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      // OS and browser detection
      const operatingSystem = detectOperatingSystem(userAgent);
      const browser = detectBrowser(userAgent);
      const deviceType = detectDeviceType(userAgent, width);

      // Touch support detection
      const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Orientation detection
      const orientation = width > height ? 'landscape' : 'portrait';

      // PWA detection
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

      // Feature detection
      const supportsWebGL = checkWebGLSupport();
      const supportsServiceWorker = 'serviceWorker' in navigator;
      const supportsPushNotifications = 'PushManager' in window && 'Notification' in window;
      const cookieEnabled = navigator.cookieEnabled;
      const onlineStatus = navigator.onLine;

      // Connection info
      const connection = (navigator as any).connection?.effectiveType;

      // Memory info
      const memory = (navigator as any).deviceMemory;

      // Hardware concurrency (CPU cores)
      const cores = navigator.hardwareConcurrency;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation,
        touchSupport,
        devicePixelRatio: window.devicePixelRatio,
        userAgent,
        platform,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        connection,
        memory,
        cores,
        operatingSystem,
        browser,
        deviceType,
        isStandalone,
        supportsWebGL,
        supportsServiceWorker,
        supportsPushNotifications,
        cookieEnabled,
        onlineStatus,
      });

      // Enhanced device optimizations based on OS and capabilities
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
      const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

      // OS-specific optimizations
      const useNativeScrolling = operatingSystem === 'iOS' || operatingSystem === 'Android';
      const enableHapticFeedback = operatingSystem === 'iOS' && touchSupport;
      const optimizeForSafari = browser === 'Safari' && operatingSystem === 'iOS';
      const useAndroidDesign = operatingSystem === 'Android';
      const useIOSDesign = operatingSystem === 'iOS';

      setDeviceOptimizations({
        reducedMotion,
        highContrast,
        darkMode,
        fontSize: isMobile ? 'small' : 'medium',
        touchTargetSize: touchSupport ? 'large' : 'medium',
        useNativeScrolling,
        enableHapticFeedback,
        optimizeForSafari,
        useAndroidDesign,
        useIOSDesign,
      });

      // Enhanced device specs estimation
      const performance = cores && cores >= 4 ? 'high' : cores && cores >= 2 ? 'medium' : 'low';
      const networkSpeed = connection === '4g' ? 'fast' : connection === '3g' ? 'medium' : 'slow';
      const storageAvailable = (navigator as any).storage?.estimate ? 0 : 0;
      const ramAvailable = memory || 0;

      // Enhanced performance metrics
      const renderingCapability = supportsWebGL && performance === 'high' ? 'advanced' : 
                                 supportsWebGL ? 'standard' : 'basic';
      const animationPerformance = reducedMotion ? 'disabled' : 
                                  performance === 'low' ? 'reduced' : 'full';
      const imageOptimization = checkImageFormatSupport();

      setDeviceSpecs({
        performance,
        networkSpeed,
        storageAvailable,
        ramAvailable,
        renderingCapability,
        animationPerformance,
        imageOptimization,
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    window.addEventListener('online', updateDeviceInfo);
    window.addEventListener('offline', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
      window.removeEventListener('online', updateDeviceInfo);
      window.removeEventListener('offline', updateDeviceInfo);
    };
  }, []);

  return { deviceInfo, deviceOptimizations, deviceSpecs };
};

export const useMobileOptimizations = () => {
  const { deviceOptimizations } = useMobileResponsive();
  return deviceOptimizations;
};

export const useMobileStyles = () => {
  const { deviceInfo, deviceOptimizations } = useMobileResponsive();
  
  const getResponsiveClasses = (mobileClass: string, tabletClass: string, desktopClass: string) => {
    if (deviceInfo.isMobile) return mobileClass;
    if (deviceInfo.isTablet) return tabletClass;
    return desktopClass;
  };

  const getTouchTargetSize = () => {
    switch (deviceOptimizations.touchTargetSize) {
      case 'large': return 'min-h-12 min-w-12';
      case 'medium': return 'min-h-10 min-w-10';
      case 'small': return 'min-h-8 min-w-8';
      default: return 'min-h-10 min-w-10';
    }
  };

  const getFontSize = () => {
    switch (deviceOptimizations.fontSize) {
      case 'large': return 'text-lg';
      case 'medium': return 'text-base';
      case 'small': return 'text-sm';
      default: return 'text-base';
    }
  };

  const getOSSpecificClasses = () => {
    const classes = [];
    
    if (deviceOptimizations.useIOSDesign) {
      classes.push('ios-design');
    }
    
    if (deviceOptimizations.useAndroidDesign) {
      classes.push('android-design');
    }
    
    if (deviceOptimizations.useNativeScrolling) {
      classes.push('native-scrolling');
    }
    
    if (deviceOptimizations.optimizeForSafari) {
      classes.push('safari-optimized');
    }
    
    return classes.join(' ');
  };

  return {
    getResponsiveClasses,
    getTouchTargetSize,
    getFontSize,
    getOSSpecificClasses,
    deviceInfo,
    deviceOptimizations,
  };
};