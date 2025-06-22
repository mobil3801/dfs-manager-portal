import React, { createContext, useContext, ReactNode } from 'react';
import { useEnhancedDeviceDetection, DeviceInfo } from '@/hooks/use-enhanced-device-detection';

interface DeviceAdaptiveContextValue extends DeviceInfo {
  // UI preferences based on device
  preferredCardSize: 'compact' | 'normal' | 'large';
  preferredNavigation: 'sidebar' | 'bottom' | 'top';
  shouldShowTooltips: boolean;
  optimalFontSize: 'small' | 'medium' | 'large';
  touchTargetSize: number;
  animationDuration: number;
  sidebarWidth: number;
  contentPadding: string;
  spacing: string;
  borderRadius: string;
  shadowIntensity: 'none' | 'subtle' | 'normal' | 'strong';
}

const DeviceAdaptiveContext = createContext<DeviceAdaptiveContextValue | undefined>(undefined);

interface DeviceAdaptiveProviderProps {
  children: ReactNode;
}

export const DeviceAdaptiveProvider: React.FC<DeviceAdaptiveProviderProps> = ({ children }) => {
  const deviceInfo = useEnhancedDeviceDetection();

  // Calculate UI preferences based on device with enhanced logic
  const getUIPreferences = (device: DeviceInfo) => {
    // Card size based on screen real estate and device type
    let preferredCardSize: 'compact' | 'normal' | 'large' = 'normal';
    if (device.isMobile || device.screenSize === 'small') preferredCardSize = 'compact';
    else if (device.isDesktop && device.screenSize === 'xl') preferredCardSize = 'large';

    // Navigation style based on device capabilities and screen size
    let preferredNavigation: 'sidebar' | 'bottom' | 'top' = 'sidebar';
    if (device.isMobile) preferredNavigation = 'bottom';
    else if (device.isTablet || device.screenSize === 'medium') preferredNavigation = 'top';

    // Tooltips only on devices that support hover
    const shouldShowTooltips = device.supportsHover && !device.hasTouch;

    // Font size based on device and user preferences
    let optimalFontSize: 'small' | 'medium' | 'large' = 'medium';
    if (device.isMobile && device.screenSize === 'small') optimalFontSize = 'small';
    else if (device.isDesktop && device.screenSize === 'xl') optimalFontSize = 'large';

    // Touch targets follow accessibility guidelines
    const touchTargetSize = device.hasTouch ? 44 : 32; // 44px minimum for touch accessibility

    // Animation duration based on connection and user preferences
    let animationDuration = 300;
    if (device.prefersReducedMotion) animationDuration = 0;
    else if (device.connectionType === 'slow') animationDuration = 150;
    else if (device.deviceType === 'mobile') animationDuration = 250;

    // Sidebar width based on screen size
    const sidebarWidth = device.screenSize === 'xl' ? 280 : 256;

    // Content padding based on device type
    let contentPadding = 'p-6';
    if (device.isMobile) contentPadding = 'p-4';
    else if (device.isDesktop && device.screenSize === 'xl') contentPadding = 'p-8';

    // Spacing between elements
    let spacing = 'space-y-6';
    if (device.isMobile) spacing = 'space-y-4';
    else if (device.isDesktop && device.screenSize === 'xl') spacing = 'space-y-8';

    // Border radius based on device
    let borderRadius = 'rounded-lg';
    if (device.isMobile) borderRadius = 'rounded-md';
    else if (device.isDesktop) borderRadius = 'rounded-xl';

    // Shadow intensity based on device capabilities
    let shadowIntensity: 'none' | 'subtle' | 'normal' | 'strong' = 'normal';
    if (device.connectionType === 'slow' || device.prefersReducedMotion) shadowIntensity = 'subtle';
    else if (device.isHighDPI && device.isDesktop) shadowIntensity = 'strong';
    else if (device.isMobile) shadowIntensity = 'subtle';

    return {
      preferredCardSize,
      preferredNavigation,
      shouldShowTooltips,
      optimalFontSize,
      touchTargetSize,
      animationDuration,
      sidebarWidth,
      contentPadding,
      spacing,
      borderRadius,
      shadowIntensity,
    };
  };

  const uiPreferences = getUIPreferences(deviceInfo);

  const contextValue: DeviceAdaptiveContextValue = {
    ...deviceInfo,
    ...uiPreferences,
  };

  return (
    <DeviceAdaptiveContext.Provider value={contextValue}>
      {children}
    </DeviceAdaptiveContext.Provider>
  );
};

export const useDeviceAdaptive = (): DeviceAdaptiveContextValue => {
  const context = useContext(DeviceAdaptiveContext);
  if (!context) {
    throw new Error('useDeviceAdaptive must be used within a DeviceAdaptiveProvider');
  }
  return context;
};