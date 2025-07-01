import React from 'react';
import { useResponsiveLayout } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ResponsiveStackProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  spacing = 'md',
  className
}) => {
  const responsive = useResponsiveLayout();

  const spacingClasses = {
    sm: responsive.isMobile ? 'space-y-2' : 'space-y-3',
    md: responsive.isMobile ? 'space-y-3' : 'space-y-4',
    lg: responsive.isMobile ? 'space-y-4' : 'space-y-6',
    xl: responsive.isMobile ? 'space-y-6' : 'space-y-8'
  };

  return (
    <div className={cn(
      'flex flex-col',
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>);

};

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  className
}) => {
  const responsive = useResponsiveLayout();

  return (
    <div className={cn(
      'w-full',
      responsive.isMobile ? 'overflow-x-auto' : '',
      className
    )}>
      <div className={responsive.isMobile ? 'min-w-[800px]' : ''}>
        {children}
      </div>
    </div>);

};

export { ResponsiveStack, ResponsiveTable };