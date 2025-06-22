
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
}

const DeviceAdaptiveContext = createContext<DeviceAdaptiveContextValue | undefined>(undefined);

interface DeviceAdaptiveProviderProps {
  children: ReactNode;
}

export const DeviceAdaptiveProvider: React.FC<DeviceAdaptiveProviderProps> = ({ children }) => {
  const deviceInfo = useEnhancedDeviceDetection();

  // Calculate UI preferences based on device
  const getUIPreferences = (device: DeviceInfo) => {
    const preferredCardSize = device.isMobile ? 'compact' : device.isTablet ? 'normal' : 'large';
    const preferredNavigation = device.isMobile ? 'bottom' : device.isTablet ? 'top' : 'sidebar';
    const shouldShowTooltips = !device.hasTouch; // Hide tooltips on touch devices
    const optimalFontSize = device.isMobile ? 'medium' : device.screenSize === 'xl' ? 'large' : 'medium';
    const touchTargetSize = device.hasTouch ? 44 : 32; // 44px recommended for touch
    const animationDuration = device.connectionType === 'slow' ? 150 : 300;

    return {
      preferredCardSize,
      preferredNavigation,
      shouldShowTooltips,
      optimalFontSize,
      touchTargetSize,
      animationDuration,
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
