export { ResponsiveLayoutProvider, useResponsiveLayout, useResponsiveNavigation, useResponsiveContent, useResponsiveAnimations } from '@/contexts/ResponsiveLayoutContext';
export { DeviceOptimizedContainer, DeviceOptimizedText, DeviceOptimizedButton } from '@/contexts/ResponsiveLayoutContext';
export { ResponsiveGrid, ResponsiveColumns, ResponsiveStack, ResponsiveCard, ResponsiveContainer } from './ResponsiveGrid';
export { ResponsiveNavigation, DeviceOptimizedNavigation } from './ResponsiveNavigation';
export { ResponsiveTable, tableActions } from './ResponsiveTable';
export { useEnhancedDeviceDetection, useDeviceOptimizations, useDeviceStyles } from '@/hooks/use-enhanced-device-detection';
export type { DeviceSpecs, DeviceOptimizations } from '@/hooks/use-enhanced-device-detection';