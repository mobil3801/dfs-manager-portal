import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';
import { cn } from '@/lib/utils';

interface MobileOptimizedButtonProps extends ButtonProps {
  enableHapticFeedback?: boolean;
  mobileSize?: 'sm' | 'default' | 'lg';
}

const MobileOptimizedButton = React.forwardRef<
  HTMLButtonElement,
  MobileOptimizedButtonProps
>(({ className, enableHapticFeedback = true, mobileSize, onClick, ...props }, ref) => {
  const { deviceInfo, deviceOptimizations } = useMobileResponsive();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Add haptic feedback for mobile devices
    if (enableHapticFeedback && deviceOptimizations.enableHapticFeedback && (window as any).navigator?.vibrate) {
      (window as any).navigator.vibrate(10);
    }

    // Call the original onClick handler
    if (onClick) {
      onClick(event);
    }
  };

  const getMobileClasses = () => {
    if (!deviceInfo.isMobile) return '';
    
    const classes = [];
    
    // Touch target size optimization
    if (deviceOptimizations.touchTargetSize === 'large') {
      classes.push('min-h-12 min-w-12 px-4 py-3');
    } else if (deviceOptimizations.touchTargetSize === 'medium') {
      classes.push('min-h-10 min-w-10 px-3 py-2');
    }
    
    // Mobile size override
    if (mobileSize === 'lg') {
      classes.push('min-h-14 min-w-14 px-6 py-4 text-lg');
    } else if (mobileSize === 'sm') {
      classes.push('min-h-8 min-w-8 px-2 py-1 text-sm');
    }
    
    // OS-specific styling
    if (deviceOptimizations.useIOSDesign) {
      classes.push('ios-button');
    } else if (deviceOptimizations.useAndroidDesign) {
      classes.push('android-button');
    }
    
    return classes.join(' ');
  };

  return (
    <Button
      ref={ref}
      className={cn(
        getMobileClasses(),
        'transition-all duration-200 active:scale-95',
        deviceOptimizations.reducedMotion && 'transition-none active:scale-100',
        className
      )}
      onClick={handleClick}
      {...props}
    />
  );
});

MobileOptimizedButton.displayName = 'MobileOptimizedButton';

export default MobileOptimizedButton;