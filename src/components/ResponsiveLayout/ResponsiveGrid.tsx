import React, { ReactNode } from 'react';
import { useResponsiveLayout } from '@/contexts/ResponsiveLayoutContext';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  minItemWidth?: number;
  maxColumns?: number;
  gap?: 'sm' | 'md' | 'lg';
  autoFit?: boolean;
}

export function ResponsiveGrid({
  children,
  className = '',
  minItemWidth = 280,
  maxColumns = 4,
  gap = 'md',
  autoFit = true
}: ResponsiveGridProps) {
  const { device, layoutConfig } = useResponsiveLayout();

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const gridClasses = React.useMemo(() => {
    if (device.isMobile) {
      return 'grid grid-cols-1';
    }

    if (device.isTablet) {
      return 'grid grid-cols-2 lg:grid-cols-3';
    }

    if (autoFit) {
      return `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${Math.min(maxColumns, 4)}`;
    }

    return `grid grid-cols-${layoutConfig.contentLayout === 'single-column' ? 1 :
    layoutConfig.contentLayout === 'two-column' ? 2 : 3}`;
  }, [device, layoutConfig, autoFit, maxColumns]);

  return (
    <div
      className={cn(
        gridClasses,
        gapClasses[gap],
        className
      )}
      style={autoFit ? {
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr))`
      } : undefined}>

      {children}
    </div>);

}

interface ResponsiveColumnsProps {
  children: ReactNode;
  className?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export function ResponsiveColumns({
  children,
  className = '',
  columns = { mobile: 1, tablet: 2, desktop: 3 }
}: ResponsiveColumnsProps) {
  const { device } = useResponsiveLayout();

  const columnClasses = React.useMemo(() => {
    const cols = device.isMobile ? columns.mobile :
    device.isTablet ? columns.tablet :
    columns.desktop;

    return `grid grid-cols-${cols}`;
  }, [device, columns]);

  return (
    <div className={cn(columnClasses, 'gap-4', className)}>
      {children}
    </div>);

}

interface ResponsiveStackProps {
  children: ReactNode;
  className?: string;
  direction?: 'vertical' | 'horizontal' | 'responsive';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  spacing?: 'tight' | 'normal' | 'loose';
}

export function ResponsiveStack({
  children,
  className = '',
  direction = 'responsive',
  align = 'stretch',
  justify = 'start',
  spacing = 'normal'
}: ResponsiveStackProps) {
  const { device, layoutConfig } = useResponsiveLayout();

  const stackClasses = React.useMemo(() => {
    const baseClasses = ['flex'];

    // Direction
    if (direction === 'vertical') {
      baseClasses.push('flex-col');
    } else if (direction === 'horizontal') {
      baseClasses.push('flex-row');
    } else {
      // Responsive direction
      baseClasses.push(device.isMobile ? 'flex-col' : 'flex-row');
    }

    // Alignment
    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch'
    };
    baseClasses.push(alignClasses[align]);

    // Justify
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around'
    };
    baseClasses.push(justifyClasses[justify]);

    // Spacing
    const spacingClasses = {
      tight: device.isMobile ? 'gap-1' : 'gap-2',
      normal: device.isMobile ? 'gap-2' : 'gap-4',
      loose: device.isMobile ? 'gap-4' : 'gap-6'
    };
    baseClasses.push(spacingClasses[spacing || layoutConfig.spacing]);

    return baseClasses.join(' ');
  }, [device, direction, align, justify, spacing, layoutConfig.spacing]);

  return (
    <div className={cn(stackClasses, className)}>
      {children}
    </div>);

}

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'expanded';
  interactive?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveCard({
  children,
  className = '',
  variant,
  interactive = false,
  padding
}: ResponsiveCardProps) {
  const { device, layoutConfig, styles } = useResponsiveLayout();

  const cardClasses = React.useMemo(() => {
    const baseClasses = ['rounded-lg border bg-card text-card-foreground shadow-sm'];

    // Variant
    const cardVariant = variant || layoutConfig.cardLayout;
    if (cardVariant === 'compact') {
      baseClasses.push('p-3');
    } else if (cardVariant === 'expanded') {
      baseClasses.push('p-8');
    } else {
      baseClasses.push('p-6');
    }

    // Custom padding override
    if (padding) {
      baseClasses.pop(); // Remove default padding
      const paddingClasses = {
        sm: 'p-2',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8'
      };
      baseClasses.push(paddingClasses[padding]);
    }

    // Interactive
    if (interactive) {
      baseClasses.push('cursor-pointer hover:shadow-md transition-shadow');
    }

    // Device-specific adjustments
    if (device.brand === 'Samsung') {
      baseClasses.push('rounded-xl'); // Samsung One UI prefers more rounded corners
    }

    if (device.isMobile && device.screenWidth < 375) {
      baseClasses.push('mx-2'); // Extra margin on very small screens
    }

    return baseClasses.join(' ');
  }, [device, layoutConfig, variant, interactive, padding]);

  return (
    <div className={cn(cardClasses, className)}>
      {children}
    </div>);

}

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  center?: boolean;
  padding?: boolean;
}

export function ResponsiveContainer({
  children,
  className = '',
  maxWidth = 'xl',
  center = true,
  padding = true
}: ResponsiveContainerProps) {
  const { device, styles } = useResponsiveLayout();

  const containerClasses = React.useMemo(() => {
    const baseClasses = ['w-full'];

    // Max width
    if (maxWidth !== 'full') {
      baseClasses.push(`max-w-${maxWidth}`);
    }

    // Center
    if (center) {
      baseClasses.push('mx-auto');
    }

    // Padding
    if (padding) {
      baseClasses.push(styles.container);
    }

    return baseClasses.join(' ');
  }, [maxWidth, center, padding, styles.container]);

  return (
    <div className={cn(containerClasses, className)}>
      {children}
    </div>);

}