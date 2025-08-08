import * as React from "react";

// Device breakpoints
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const DESKTOP_BREAKPOINT = 1280;

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  orientation: 'portrait' | 'landscape';
  touchDevice: boolean;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = globalThis.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(globalThis.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(globalThis.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo>(() => {
    if (typeof globalThis === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        orientation: 'landscape',
        touchDevice: false
      };
    }

    const width = globalThis.innerWidth;
    return {
      isMobile: width < MOBILE_BREAKPOINT,
      isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
      isDesktop: width >= TABLET_BREAKPOINT,
      screenWidth: width,
      orientation: globalThis.innerHeight > globalThis.innerWidth ? 'portrait' : 'landscape',
      touchDevice: 'ontouchstart' in globalThis || navigator.maxTouchPoints > 0
    };
  });

  React.useEffect(() => {
    const updateDeviceInfo = () => {
      const width = globalThis.innerWidth;
      const height = globalThis.innerHeight;

      setDeviceInfo({
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
        isDesktop: width >= TABLET_BREAKPOINT,
        screenWidth: width,
        orientation: height > width ? 'portrait' : 'landscape',
        touchDevice: 'ontouchstart' in globalThis || navigator.maxTouchPoints > 0
      });
    };

    // Create media queries for different breakpoints
    const mobileQuery = globalThis.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const tabletQuery = globalThis.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`);
    const orientationQuery = globalThis.matchMedia('(orientation: portrait)');

    // Listen for changes
    mobileQuery.addEventListener('change', updateDeviceInfo);
    tabletQuery.addEventListener('change', updateDeviceInfo);
    orientationQuery.addEventListener('change', updateDeviceInfo);
    globalThis.addEventListener('resize', updateDeviceInfo);

    // Initial call
    updateDeviceInfo();

    return () => {
      mobileQuery.removeEventListener('change', updateDeviceInfo);
      tabletQuery.removeEventListener('change', updateDeviceInfo);
      orientationQuery.removeEventListener('change', updateDeviceInfo);
      globalThis.removeEventListener('resize', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

// Hook for responsive layout decisions - Updated for horizontal navigation only
export function useResponsiveLayout() {
  const device = useDeviceDetection();

  return {
    ...device,
    // Removed sidebar references - navigation is always horizontal at top
    showTopNavigation: true, // Always show top navigation
    showMobileMenu: device.isMobile, // Mobile uses slide-out menu
    compactHeader: device.isMobile || device.isTablet,
    stackedLayout: device.isMobile,
    columnsCount: device.isMobile ? 1 : device.isTablet ? 2 : 3,
    tableMode: device.isMobile ? 'cards' : 'table',
    navigationMode: device.isMobile ? 'mobile-sheet' : 'horizontal' // Always horizontal, mobile uses sheet
  };
}