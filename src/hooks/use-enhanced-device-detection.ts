import * as React from 'react';

// Enhanced device detection with brand and model identification
export interface DeviceSpecs {
  brand: string;
  model: string;
  os: string;
  osVersion: string;
  browser: string;
  browserVersion: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  orientation: 'portrait' | 'landscape';
  touchDevice: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: 'phone' | 'tablet' | 'desktop';
  capabilities: {
    supportsWebGL: boolean;
    supportsWebP: boolean;
    supportsIntersectionObserver: boolean;
    supportsPassiveEvents: boolean;
    maxTouchPoints: number;
  };
}

export interface DeviceOptimizations {
  useLazyLoading: boolean;
  useVirtualScrolling: boolean;
  reducedAnimations: boolean;
  compactLayout: boolean;
  largeClickTargets: boolean;
  highDPIOptimizations: boolean;
  batteryOptimizations: boolean;
}

// Device brand and model detection patterns
const DEVICE_PATTERNS = {
  iPhone: {
    pattern: /iPhone/i,
    models: {
      'iPhone 15 Pro Max': /iPhone16,2/,
      'iPhone 15 Pro': /iPhone16,1/,
      'iPhone 15 Plus': /iPhone15,5/,
      'iPhone 15': /iPhone15,4/,
      'iPhone 14 Pro Max': /iPhone15,3/,
      'iPhone 14 Pro': /iPhone15,2/,
      'iPhone 14 Plus': /iPhone14,8/,
      'iPhone 14': /iPhone14,7/,
      'iPhone 13 Pro Max': /iPhone14,3/,
      'iPhone 13 Pro': /iPhone14,2/,
      'iPhone 13 mini': /iPhone14,4/,
      'iPhone 13': /iPhone14,5/,
      'iPhone 12 Pro Max': /iPhone13,4/,
      'iPhone 12 Pro': /iPhone13,3/,
      'iPhone 12 mini': /iPhone13,1/,
      'iPhone 12': /iPhone13,2/,
      'iPhone SE (3rd gen)': /iPhone14,6/,
      'iPhone 11 Pro Max': /iPhone12,5/,
      'iPhone 11 Pro': /iPhone12,3/,
      'iPhone 11': /iPhone12,1/,
      'iPhone XS Max': /iPhone11,4|iPhone11,6/,
      'iPhone XS': /iPhone11,2/,
      'iPhone XR': /iPhone11,8/,
      'iPhone X': /iPhone10,3|iPhone10,6/,
      'iPhone 8 Plus': /iPhone10,2|iPhone10,5/,
      'iPhone 8': /iPhone10,1|iPhone10,4/,
      'iPhone 7 Plus': /iPhone9,2|iPhone9,4/,
      'iPhone 7': /iPhone9,1|iPhone9,3/,
      'iPhone SE': /iPhone8,4/,
      'iPhone 6s Plus': /iPhone8,2/,
      'iPhone 6s': /iPhone8,1/,
      'iPhone 6 Plus': /iPhone7,1/,
      'iPhone 6': /iPhone7,2/,
    }
  },
  Samsung: {
    pattern: /Samsung|SM-/i,
    models: {
      'Galaxy S24 Ultra': /SM-S928/,
      'Galaxy S24+': /SM-S926/,
      'Galaxy S24': /SM-S921/,
      'Galaxy S23 Ultra': /SM-S918/,
      'Galaxy S23+': /SM-S916/,
      'Galaxy S23': /SM-S911/,
      'Galaxy S22 Ultra': /SM-S908/,
      'Galaxy S22+': /SM-S906/,
      'Galaxy S22': /SM-S901/,
      'Galaxy Note 20 Ultra': /SM-N986/,
      'Galaxy Note 20': /SM-N981/,
      'Galaxy A54': /SM-A546/,
      'Galaxy A34': /SM-A346/,
      'Galaxy A14': /SM-A146/,
      'Galaxy Z Fold 5': /SM-F946/,
      'Galaxy Z Flip 5': /SM-F731/,
      'Galaxy Z Fold 4': /SM-F936/,
      'Galaxy Z Flip 4': /SM-F721/,
    }
  },
  Google: {
    pattern: /Pixel/i,
    models: {
      'Pixel 8 Pro': /Pixel 8 Pro/,
      'Pixel 8': /Pixel 8/,
      'Pixel 7 Pro': /Pixel 7 Pro/,
      'Pixel 7': /Pixel 7/,
      'Pixel 6 Pro': /Pixel 6 Pro/,
      'Pixel 6': /Pixel 6/,
      'Pixel 5': /Pixel 5/,
      'Pixel 4a': /Pixel 4a/,
      'Pixel 4': /Pixel 4/,
      'Pixel 3': /Pixel 3/,
    }
  },
  OnePlus: {
    pattern: /OnePlus/i,
    models: {
      'OnePlus 12': /OnePlus12/,
      'OnePlus 11': /OnePlus11/,
      'OnePlus 10 Pro': /OnePlus10Pro/,
      'OnePlus 9 Pro': /OnePlus9Pro/,
      'OnePlus 9': /OnePlus9/,
      'OnePlus 8T': /OnePlus8T/,
      'OnePlus 8 Pro': /OnePlus8Pro/,
      'OnePlus 8': /OnePlus8/,
      'OnePlus Nord': /OnePlusNord/,
    }
  },
  Xiaomi: {
    pattern: /Xiaomi|Mi |Redmi/i,
    models: {
      'Mi 14 Ultra': /2405CPX3DG/,
      'Mi 14': /2401FPN6DG/,
      'Mi 13 Ultra': /2304FPN6DG/,
      'Mi 13': /2211133G/,
      'Mi 12 Ultra': /2203121C/,
      'Mi 12': /2201123G/,
      'Redmi Note 13': /2312DRA50G/,
      'Redmi Note 12': /2211133G/,
      'Redmi 12': /2306EPN60G/,
    }
  },
  Huawei: {
    pattern: /Huawei|Honor/i,
    models: {
      'P60 Pro': /ALN-L29/,
      'P50 Pro': /JAD-L29/,
      'Mate 60 Pro': /BNE-L29/,
      'Mate 50 Pro': /DCO-L29/,
      'Nova 12': /BON-L29/,
      'Honor 90': /REA-L29/,
      'Honor Magic 5': /PXD-L29/,
    }
  },
  Oppo: {
    pattern: /Oppo/i,
    models: {
      'Find X7 Ultra': /PHZ110/,
      'Find X6 Pro': /PHB110/,
      'Reno 11 Pro': /RMX3896/,
      'Reno 10 Pro': /RMX3663/,
      'A98': /RMX3834/,
      'A78': /RMX3781/,
    }
  },
  Vivo: {
    pattern: /Vivo/i,
    models: {
      'X100 Pro': /V2309A/,
      'X90 Pro': /V2252A/,
      'V29 Pro': /V2250/,
      'V27 Pro': /V2158/,
      'Y100': /V2237/,
      'Y36': /V2351/,
    }
  }
};

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export function useEnhancedDeviceDetection(): DeviceSpecs {
  const [deviceSpecs, setDeviceSpecs] = React.useState<DeviceSpecs>(() => {
    if (typeof window === 'undefined') {
      return {
        brand: 'Unknown',
        model: 'Unknown',
        os: 'Unknown',
        osVersion: 'Unknown',
        browser: 'Unknown',
        browserVersion: 'Unknown',
        screenWidth: 1920,
        screenHeight: 1080,
        devicePixelRatio: 1,
        orientation: 'landscape',
        touchDevice: false,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        deviceType: 'desktop',
        capabilities: {
          supportsWebGL: false,
          supportsWebP: false,
          supportsIntersectionObserver: false,
          supportsPassiveEvents: false,
          maxTouchPoints: 0,
        }
      };
    }

    return detectDevice();
  });

  React.useEffect(() => {
    const updateDeviceSpecs = () => {
      setDeviceSpecs(detectDevice());
    };

    const resizeObserver = new ResizeObserver(updateDeviceSpecs);
    resizeObserver.observe(document.body);

    window.addEventListener('orientationchange', updateDeviceSpecs);
    window.addEventListener('resize', updateDeviceSpecs);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', updateDeviceSpecs);
      window.removeEventListener('resize', updateDeviceSpecs);
    };
  }, []);

  return deviceSpecs;
}

function detectDevice(): DeviceSpecs {
  const userAgent = navigator.userAgent;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Detect brand and model
  const { brand, model } = detectBrandAndModel(userAgent);
  
  // Detect OS
  const { os, osVersion } = detectOS(userAgent);
  
  // Detect browser
  const { browser, browserVersion } = detectBrowser(userAgent);
  
  // Device classification
  const isMobile = screenWidth < MOBILE_BREAKPOINT;
  const isTablet = screenWidth >= MOBILE_BREAKPOINT && screenWidth < TABLET_BREAKPOINT;
  const isDesktop = screenWidth >= TABLET_BREAKPOINT;
  
  let deviceType: 'phone' | 'tablet' | 'desktop' = 'desktop';
  if (isMobile) deviceType = 'phone';
  else if (isTablet) deviceType = 'tablet';
  
  // Detect capabilities
  const capabilities = detectCapabilities();
  
  return {
    brand,
    model,
    os,
    osVersion,
    browser,
    browserVersion,
    screenWidth,
    screenHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    orientation: screenHeight > screenWidth ? 'portrait' : 'landscape',
    touchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
    capabilities
  };
}

function detectBrandAndModel(userAgent: string): { brand: string; model: string } {
  // Check for iPhone first
  if (DEVICE_PATTERNS.iPhone.pattern.test(userAgent)) {
    for (const [modelName, pattern] of Object.entries(DEVICE_PATTERNS.iPhone.models)) {
      if (pattern.test(userAgent)) {
        return { brand: 'Apple', model: modelName };
      }
    }
    return { brand: 'Apple', model: 'iPhone' };
  }

  // Check other brands
  for (const [brandName, brandData] of Object.entries(DEVICE_PATTERNS)) {
    if (brandName === 'iPhone') continue; // Already checked
    
    if (brandData.pattern.test(userAgent)) {
      for (const [modelName, pattern] of Object.entries(brandData.models)) {
        if (pattern.test(userAgent)) {
          return { brand: brandName, model: modelName };
        }
      }
      return { brand: brandName, model: 'Unknown Model' };
    }
  }

  // Fallback detection
  if (/Android/i.test(userAgent)) {
    return { brand: 'Android', model: 'Unknown Model' };
  }
  if (/iPad/i.test(userAgent)) {
    return { brand: 'Apple', model: 'iPad' };
  }
  if (/iPod/i.test(userAgent)) {
    return { brand: 'Apple', model: 'iPod' };
  }

  return { brand: 'Unknown', model: 'Unknown' };
}

function detectOS(userAgent: string): { os: string; osVersion: string } {
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    const match = userAgent.match(/OS (\d+)[_.](\d+)[_.]?(\d+)?/);
    if (match) {
      return { os: 'iOS', osVersion: `${match[1]}.${match[2]}${match[3] ? '.' + match[3] : ''}` };
    }
    return { os: 'iOS', osVersion: 'Unknown' };
  }

  if (/Android/i.test(userAgent)) {
    const match = userAgent.match(/Android (\d+(?:\.\d+)*)/);
    if (match) {
      return { os: 'Android', osVersion: match[1] };
    }
    return { os: 'Android', osVersion: 'Unknown' };
  }

  if (/Windows/i.test(userAgent)) {
    return { os: 'Windows', osVersion: 'Unknown' };
  }

  if (/Mac OS/i.test(userAgent)) {
    const match = userAgent.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
    if (match) {
      return { os: 'macOS', osVersion: match[1].replace(/_/g, '.') };
    }
    return { os: 'macOS', osVersion: 'Unknown' };
  }

  if (/Linux/i.test(userAgent)) {
    return { os: 'Linux', osVersion: 'Unknown' };
  }

  return { os: 'Unknown', osVersion: 'Unknown' };
}

function detectBrowser(userAgent: string): { browser: string; browserVersion: string } {
  if (/Chrome/i.test(userAgent) && !/Edge/i.test(userAgent)) {
    const match = userAgent.match(/Chrome\/(\d+(?:\.\d+)*)/);
    return { browser: 'Chrome', browserVersion: match ? match[1] : 'Unknown' };
  }

  if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    const match = userAgent.match(/Version\/(\d+(?:\.\d+)*)/);
    return { browser: 'Safari', browserVersion: match ? match[1] : 'Unknown' };
  }

  if (/Firefox/i.test(userAgent)) {
    const match = userAgent.match(/Firefox\/(\d+(?:\.\d+)*)/);
    return { browser: 'Firefox', browserVersion: match ? match[1] : 'Unknown' };
  }

  if (/Edge/i.test(userAgent)) {
    const match = userAgent.match(/Edge\/(\d+(?:\.\d+)*)/);
    return { browser: 'Edge', browserVersion: match ? match[1] : 'Unknown' };
  }

  return { browser: 'Unknown', browserVersion: 'Unknown' };
}

function detectCapabilities() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  return {
    supportsWebGL: !!gl,
    supportsWebP: (() => {
      const elem = document.createElement('canvas');
      return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })(),
    supportsIntersectionObserver: 'IntersectionObserver' in window,
    supportsPassiveEvents: (() => {
      let passiveSupported = false;
      try {
        const options = {
          get passive() {
            passiveSupported = true;
            return false;
          }
        };
        window.addEventListener('test', null as any, options);
        window.removeEventListener('test', null as any, options);
      } catch (err) {
        passiveSupported = false;
      }
      return passiveSupported;
    })(),
    maxTouchPoints: navigator.maxTouchPoints || 0,
  };
}

// Hook for device-specific optimizations
export function useDeviceOptimizations(): DeviceOptimizations {
  const device = useEnhancedDeviceDetection();

  return React.useMemo(() => {
    const isLowEndDevice = device.devicePixelRatio < 2 && device.screenWidth < 375;
    const isHighEndDevice = device.devicePixelRatio >= 3 && device.screenWidth >= 414;
    
    return {
      useLazyLoading: device.isMobile || isLowEndDevice,
      useVirtualScrolling: device.isMobile && device.screenWidth < 375,
      reducedAnimations: isLowEndDevice || (device.brand === 'Android' && parseFloat(device.osVersion) < 8),
      compactLayout: device.isMobile || device.screenWidth < 375,
      largeClickTargets: device.touchDevice,
      highDPIOptimizations: device.devicePixelRatio >= 2,
      batteryOptimizations: device.isMobile && isLowEndDevice,
    };
  }, [device]);
}

// Hook for device-specific styling
export function useDeviceStyles() {
  const device = useEnhancedDeviceDetection();
  const optimizations = useDeviceOptimizations();

  return React.useMemo(() => {
    const baseStyles = {
      // Base responsive classes
      container: device.isMobile ? 'px-4 py-2' : device.isTablet ? 'px-6 py-3' : 'px-8 py-4',
      text: device.isMobile ? 'text-sm' : 'text-base',
      heading: device.isMobile ? 'text-lg' : device.isTablet ? 'text-xl' : 'text-2xl',
      button: optimizations.largeClickTargets ? 'min-h-[44px] px-4' : 'min-h-[36px] px-3',
      input: optimizations.largeClickTargets ? 'min-h-[44px]' : 'min-h-[36px]',
      spacing: device.isMobile ? 'space-y-2' : device.isTablet ? 'space-y-3' : 'space-y-4',
    };

    // Device-specific adjustments
    const deviceSpecificStyles = {
      // iPhone specific
      ...(device.brand === 'Apple' && device.model.includes('iPhone') && {
        safeArea: 'pb-safe-area-inset-bottom pt-safe-area-inset-top',
        notchHandling: device.model.includes('iPhone X') || device.model.includes('iPhone 11') || 
                      device.model.includes('iPhone 12') || device.model.includes('iPhone 13') ||
                      device.model.includes('iPhone 14') || device.model.includes('iPhone 15'),
      }),
      
      // Samsung specific
      ...(device.brand === 'Samsung' && {
        oneUI: 'rounded-lg', // Samsung's One UI prefers rounded corners
        edgeHandling: device.model.includes('Edge') ? 'px-2' : '',
      }),
      
      // Foldable devices
      ...(device.model.includes('Fold') && {
        foldable: 'max-w-sm mx-auto', // Optimize for folded state
      }),
      
      // Small screens
      ...(device.screenWidth < 375 && {
        compact: 'text-xs px-2 py-1',
      }),
      
      // High DPI screens
      ...(device.devicePixelRatio >= 3 && {
        highDPI: 'text-sm leading-relaxed',
      }),
    };

    return { ...baseStyles, ...deviceSpecificStyles };
  }, [device, optimizations]);
}
