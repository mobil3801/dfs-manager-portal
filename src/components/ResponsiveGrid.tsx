import React from 'react';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
  gap?: 'sm' | 'md' | 'lg';
  equalHeight?: boolean;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  gap = 'md',
  equalHeight = false,
}) => {
  const { deviceInfo } = useMobileResponsive();

  const getGridClasses = () => {
    const classes = ['grid'];
    
    // Determine columns based on device
    if (deviceInfo.isMobile) {
      classes.push(`grid-cols-${mobileColumns}`);
    } else if (deviceInfo.isTablet) {
      classes.push(`grid-cols-${tabletColumns}`);
    } else {
      classes.push(`grid-cols-${desktopColumns}`);
    }
    
    // Add gap classes
    switch (gap) {
      case 'sm':
        classes.push('gap-2');
        break;
      case 'md':
        classes.push('gap-4');
        break;
      case 'lg':
        classes.push('gap-6');
        break;
    }
    
    // Add equal height if requested
    if (equalHeight) {
      classes.push('auto-rows-fr');
    }
    
    return classes.join(' ');
  };

  return (
    <div className={cn(getGridClasses(), className)}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;