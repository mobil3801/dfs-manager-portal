import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';
import { cn } from '@/lib/utils';

interface MobileOptimizedCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  title,
  children,
  className,
  padding = 'md',
  shadow = 'sm',
  hover = false,
  clickable = false,
  onClick,
}) => {
  const { deviceInfo, deviceOptimizations } = useMobileResponsive();

  const handleClick = () => {
    if (clickable && onClick) {
      // Add haptic feedback for mobile devices
      if (deviceOptimizations.enableHapticFeedback && (window as any).navigator?.vibrate) {
        (window as any).navigator.vibrate(10);
      }
      onClick();
    }
  };

  const getCardClasses = () => {
    const classes = [];
    
    // Mobile-specific padding
    if (deviceInfo.isMobile) {
      switch (padding) {
        case 'sm':
          classes.push('p-3');
          break;
        case 'md':
          classes.push('p-4');
          break;
        case 'lg':
          classes.push('p-6');
          break;
      }
    } else {
      switch (padding) {
        case 'sm':
          classes.push('p-4');
          break;
        case 'md':
          classes.push('p-6');
          break;
        case 'lg':
          classes.push('p-8');
          break;
      }
    }
    
    // Shadow classes
    switch (shadow) {
      case 'sm':
        classes.push('shadow-sm');
        break;
      case 'md':
        classes.push('shadow-md');
        break;
      case 'lg':
        classes.push('shadow-lg');
        break;
    }
    
    // Hover and clickable states
    if (hover || clickable) {
      classes.push('transition-all duration-200');
      if (!deviceOptimizations.reducedMotion) {
        classes.push('hover:shadow-md hover:scale-105');
      }
    }
    
    if (clickable) {
      classes.push('cursor-pointer active:scale-95');
      if (deviceOptimizations.reducedMotion) {
        classes.push('active:scale-100');
      }
    }
    
    // OS-specific styling
    if (deviceOptimizations.useIOSDesign) {
      classes.push('ios-card');
    } else if (deviceOptimizations.useAndroidDesign) {
      classes.push('android-card');
    }
    
    return classes.join(' ');
  };

  return (
    <Card 
      className={cn(getCardClasses(), className)}
      onClick={handleClick}
    >
      {title && (
        <CardHeader className={cn(
          deviceInfo.isMobile ? 'pb-3' : 'pb-4'
        )}>
          <CardTitle className={cn(
            deviceInfo.isMobile ? 'text-lg' : 'text-xl'
          )}>
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? 'pt-0' : ''}>
        {children}
      </CardContent>
    </Card>
  );
};

export default MobileOptimizedCard;