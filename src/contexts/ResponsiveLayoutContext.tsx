import React, { createContext, useContext, ReactNode } from 'react';
import { useEnhancedDeviceDetection, useDeviceOptimizations, useDeviceStyles, DeviceSpecs, DeviceOptimizations } from '@/hooks/use-enhanced-device-detection';

interface ResponsiveLayoutContextValue {
  device: DeviceSpecs;
  optimizations: DeviceOptimizations;
  styles: ReturnType<typeof useDeviceStyles>;
  layoutConfig: {
    navigation: 'horizontal' | 'mobile-drawer' | 'bottom-tabs';
    contentLayout: 'single-column' | 'two-column' | 'three-column' | 'grid';
    cardLayout: 'compact' | 'standard' | 'expanded';
    tableLayout: 'responsive-table' | 'card-list' | 'compact-table';
    formLayout: 'stacked' | 'inline' | 'grid';
    buttonSize: 'small' | 'medium' | 'large';
    spacing: 'tight' | 'normal' | 'loose';
    animations: 'none' | 'reduced' | 'full';
  };
}

const ResponsiveLayoutContext = createContext<ResponsiveLayoutContextValue | undefined>(undefined);

interface ResponsiveLayoutProviderProps {
  children: ReactNode;
}

export function ResponsiveLayoutProvider({ children }: ResponsiveLayoutProviderProps) {
  const device = useEnhancedDeviceDetection();
  const optimizations = useDeviceOptimizations();
  const styles = useDeviceStyles();

  // Generate layout configuration based on device
  const layoutConfig = React.useMemo(() => {
    const config = {
      // Navigation layout
      navigation: device.isMobile ? 'mobile-drawer' as const : 'horizontal' as const,
      
      // Content layout
      contentLayout: device.isMobile ? 'single-column' as const : 
                    device.isTablet ? 'two-column' as const : 
                    'three-column' as const,
      
      // Card layout
      cardLayout: device.isMobile ? 'compact' as const : 
                 device.isTablet ? 'standard' as const : 
                 'expanded' as const,
      
      // Table layout
      tableLayout: device.isMobile ? 'card-list' as const : 
                  device.isTablet ? 'compact-table' as const : 
                  'responsive-table' as const,
      
      // Form layout
      formLayout: device.isMobile ? 'stacked' as const : 
                 device.isTablet ? 'inline' as const : 
                 'grid' as const,
      
      // Button size
      buttonSize: optimizations.largeClickTargets ? 'large' as const : 
                 device.isMobile ? 'medium' as const : 
                 'medium' as const,
      
      // Spacing
      spacing: optimizations.compactLayout ? 'tight' as const : 
              device.isMobile ? 'normal' as const : 
              'loose' as const,
      
      // Animations
      animations: optimizations.reducedAnimations ? 'none' as const : 
                 device.isMobile ? 'reduced' as const : 
                 'full' as const,
    };

    // Device-specific overrides
    if (device.brand === 'Apple') {
      // iOS users expect certain UI patterns
      if (device.model.includes('iPhone')) {
        config.navigation = 'bottom-tabs';
        config.buttonSize = 'large';
      }
    }

    if (device.brand === 'Samsung') {
      // Samsung One UI optimizations
      config.cardLayout = 'standard';
      config.spacing = 'normal';
    }

    // Foldable device optimizations
    if (device.model.includes('Fold') || device.model.includes('Flip')) {
      config.contentLayout = 'two-column';
      config.cardLayout = 'compact';
    }

    // Small screen optimizations
    if (device.screenWidth < 375) {
      config.contentLayout = 'single-column';
      config.cardLayout = 'compact';
      config.spacing = 'tight';
      config.buttonSize = 'medium';
    }

    // Large screen optimizations
    if (device.screenWidth > 1400) {
      config.contentLayout = 'three-column';
      config.cardLayout = 'expanded';
      config.spacing = 'loose';
    }

    return config;
  }, [device, optimizations]);

  const value: ResponsiveLayoutContextValue = {
    device,
    optimizations,
    styles,
    layoutConfig,
  };

  return (
    <ResponsiveLayoutContext.Provider value={value}>
      {children}
    </ResponsiveLayoutContext.Provider>
  );
}

export function useResponsiveLayout() {
  const context = useContext(ResponsiveLayoutContext);
  if (context === undefined) {
    throw new Error('useResponsiveLayout must be used within a ResponsiveLayoutProvider');
  }
  return context;
}

// Utility hooks for specific layout aspects
export function useResponsiveNavigation() {
  const { device, layoutConfig } = useResponsiveLayout();
  
  return {
    type: layoutConfig.navigation,
    showMobileDrawer: device.isMobile && layoutConfig.navigation === 'mobile-drawer',
    showBottomTabs: layoutConfig.navigation === 'bottom-tabs',
    showHorizontalNav: layoutConfig.navigation === 'horizontal',
    compactHeader: device.isMobile || device.isTablet,
  };
}

export function useResponsiveContent() {
  const { device, layoutConfig, styles } = useResponsiveLayout();
  
  return {
    layout: layoutConfig.contentLayout,
    columns: layoutConfig.contentLayout === 'single-column' ? 1 : 
             layoutConfig.contentLayout === 'two-column' ? 2 : 3,
    cardLayout: layoutConfig.cardLayout,
    tableLayout: layoutConfig.tableLayout,
    formLayout: layoutConfig.formLayout,
    spacing: layoutConfig.spacing,
    containerClass: styles.container,
    textClass: styles.text,
    headingClass: styles.heading,
    buttonClass: styles.button,
    inputClass: styles.input,
    spacingClass: styles.spacing,
  };
}

export function useResponsiveAnimations() {
  const { layoutConfig, optimizations } = useResponsiveLayout();
  
  return {
    enabled: layoutConfig.animations !== 'none',
    reduced: layoutConfig.animations === 'reduced',
    full: layoutConfig.animations === 'full',
    shouldAnimate: (type: 'transition' | 'transform' | 'opacity') => {
      if (optimizations.reducedAnimations) return false;
      if (layoutConfig.animations === 'none') return false;
      if (layoutConfig.animations === 'reduced' && type === 'transform') return false;
      return true;
    },
  };
}

// Device-specific component wrappers
export function DeviceOptimizedContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { styles, device } = useResponsiveLayout();
  
  const deviceClasses = [
    styles.container,
    device.brand === 'Apple' && device.model.includes('iPhone') ? styles.safeArea || '' : '',
    device.brand === 'Samsung' ? styles.oneUI || '' : '',
    device.model.includes('Fold') ? styles.foldable || '' : '',
    device.screenWidth < 375 ? styles.compact || '' : '',
    className,
  ].filter(Boolean).join(' ');

  return <div className={deviceClasses}>{children}</div>;
}

export function DeviceOptimizedText({ children, className = '', variant = 'body' }: { 
  children: ReactNode; 
  className?: string; 
  variant?: 'heading' | 'body' | 'caption';
}) {
  const { styles, device } = useResponsiveLayout();
  
  const textClasses = [
    variant === 'heading' ? styles.heading : 
    variant === 'caption' ? 'text-xs' : 
    styles.text,
    device.devicePixelRatio >= 3 ? styles.highDPI || '' : '',
    className,
  ].filter(Boolean).join(' ');

  const Component = variant === 'heading' ? 'h2' : 'p';
  
  return <Component className={textClasses}>{children}</Component>;
}

export function DeviceOptimizedButton({ children, className = '', ...props }: { 
  children: ReactNode; 
  className?: string; 
  [key: string]: any;
}) {
  const { styles, layoutConfig } = useResponsiveLayout();
  
  const buttonClasses = [
    styles.button,
    layoutConfig.buttonSize === 'large' ? 'text-lg py-3' : 
    layoutConfig.buttonSize === 'small' ? 'text-sm py-1' : 
    'text-base py-2',
    className,
  ].filter(Boolean).join(' ');

  return <button className={buttonClasses} {...props}>{children}</button>;
}
