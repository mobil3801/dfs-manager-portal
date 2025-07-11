import React, { useEffect } from 'react';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';
import { cn } from '@/lib/utils';

interface MobileOptimizedAppProps {
  children: React.ReactNode;
}

const MobileOptimizedApp: React.FC<MobileOptimizedAppProps> = ({ children }) => {
  const { deviceInfo, deviceOptimizations, deviceSpecs } = useMobileResponsive();

  useEffect(() => {
    // Apply OS-specific optimizations to document
    const applyOptimizations = () => {
      const html = document.documentElement;
      const body = document.body;

      // Remove existing classes
      html.classList.remove('ios', 'android', 'windows', 'macos', 'linux');
      html.classList.remove('mobile', 'tablet', 'desktop');
      html.classList.remove('touch', 'no-touch');
      html.classList.remove('chrome', 'firefox', 'safari', 'edge', 'opera');

      // Add OS classes
      html.classList.add(deviceInfo.operatingSystem.toLowerCase());
      
      // Add device type classes
      if (deviceInfo.isMobile) html.classList.add('mobile');
      if (deviceInfo.isTablet) html.classList.add('tablet');
      if (deviceInfo.isDesktop) html.classList.add('desktop');
      
      // Add touch support classes
      html.classList.add(deviceInfo.touchSupport ? 'touch' : 'no-touch');
      
      // Add browser classes
      html.classList.add(deviceInfo.browser.toLowerCase());

      // Apply iOS-specific optimizations
      if (deviceOptimizations.useIOSDesign) {
        html.classList.add('ios-design');
        body.style.webkitOverflowScrolling = 'touch';
        body.style.webkitTouchCallout = 'none';
        body.style.webkitUserSelect = 'none';
        body.style.webkitTapHighlightColor = 'transparent';
      }

      // Apply Android-specific optimizations
      if (deviceOptimizations.useAndroidDesign) {
        html.classList.add('android-design');
        body.style.scrollBehavior = 'smooth';
      }

      // Apply Safari-specific optimizations
      if (deviceOptimizations.optimizeForSafari) {
        html.classList.add('safari-optimized');
        // Fix Safari viewport issues
        const metaViewport = document.querySelector('meta[name="viewport"]');
        if (metaViewport) {
          metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
        }
      }

      // Apply performance optimizations
      if (deviceSpecs.performance === 'low') {
        html.classList.add('low-performance');
        // Disable animations for low-performance devices
        const style = document.createElement('style');
        style.textContent = `
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        `;
        document.head.appendChild(style);
      }

      // Apply reduced motion settings
      if (deviceOptimizations.reducedMotion) {
        html.classList.add('reduced-motion');
      }

      // Apply dark mode class
      if (deviceOptimizations.darkMode) {
        html.classList.add('dark');
      }

      // Apply high contrast settings
      if (deviceOptimizations.highContrast) {
        html.classList.add('high-contrast');
      }

      // Set CSS custom properties for responsive design
      html.style.setProperty('--screen-width', `${deviceInfo.screenWidth}px`);
      html.style.setProperty('--screen-height', `${deviceInfo.screenHeight}px`);
      html.style.setProperty('--device-pixel-ratio', deviceInfo.devicePixelRatio.toString());
      html.style.setProperty('--touch-target-size', deviceOptimizations.touchTargetSize === 'large' ? '48px' : '40px');
      
      // Set font size based on device
      html.style.setProperty('--base-font-size', 
        deviceOptimizations.fontSize === 'small' ? '14px' : 
        deviceOptimizations.fontSize === 'large' ? '18px' : '16px'
      );
    };

    applyOptimizations();

    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(applyOptimizations, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, [deviceInfo, deviceOptimizations, deviceSpecs]);

  // Add haptic feedback for iOS devices
  const addHapticFeedback = () => {
    if (deviceOptimizations.enableHapticFeedback && (window as any).navigator?.vibrate) {
      (window as any).navigator.vibrate(10);
    }
  };

  const containerClasses = cn(
    'mobile-optimized-app',
    {
      'ios-container': deviceOptimizations.useIOSDesign,
      'android-container': deviceOptimizations.useAndroidDesign,
      'safari-container': deviceOptimizations.optimizeForSafari,
      'touch-enabled': deviceInfo.touchSupport,
      'mobile-layout': deviceInfo.isMobile,
      'tablet-layout': deviceInfo.isTablet,
      'desktop-layout': deviceInfo.isDesktop,
      'reduced-motion': deviceOptimizations.reducedMotion,
      'high-contrast': deviceOptimizations.highContrast,
      'dark-mode': deviceOptimizations.darkMode,
      'low-performance': deviceSpecs.performance === 'low',
      'native-scrolling': deviceOptimizations.useNativeScrolling,
    }
  );

  return (
    <div 
      className={containerClasses}
      onClick={addHapticFeedback}
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: deviceOptimizations.useNativeScrolling ? 'auto' : 'hidden',
      }}
    >
      {children}
    </div>
  );
};

export default MobileOptimizedApp;