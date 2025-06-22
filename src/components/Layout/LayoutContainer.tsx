import React from 'react';
import { motion } from 'motion/react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'transparent' | 'white' | 'gray';
  shadow?: boolean;
  rounded?: boolean;
}

const LayoutContainer: React.FC<LayoutContainerProps> = ({
  children,
  className = '',
  maxWidth = '6xl',
  padding = 'md',
  spacing = 'md',
  background = 'transparent',
  shadow = false,
  rounded = false
}) => {
  const isMobile = useIsMobile();

  // Max-width classes
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-none'
  };

  // Responsive padding classes
  const paddingClasses = {
    'none': '',
    'sm': isMobile ? 'p-2' : 'p-4',
    'md': isMobile ? 'p-4' : 'p-6',
    'lg': isMobile ? 'p-6' : 'p-8',
    'xl': isMobile ? 'p-8' : 'p-12'
  };

  // Spacing between child elements
  const spacingClasses = {
    'none': '',
    'sm': 'space-y-2',
    'md': 'space-y-4',
    'lg': 'space-y-6',
    'xl': 'space-y-8'
  };

  // Background classes
  const backgroundClasses = {
    'transparent': 'bg-transparent',
    'white': 'bg-white dark:bg-gray-800',
    'gray': 'bg-gray-50 dark:bg-gray-900'
  };

  // Additional styling
  const shadowClass = shadow ? 'shadow-lg dark:shadow-gray-900/20' : '';
  const roundedClass = rounded ? 'rounded-xl' : '';

  // Desktop-specific optimizations
  const getDesktopStyles = (): React.CSSProperties => {
    if (isMobile) return {};

    return {
      // Ensure proper spacing from navigation
      marginTop: '0',
      marginBottom: '0',
      // Prevent content from being too wide on large screens
      minHeight: 'auto',
      // Optimize for desktop viewing
      lineHeight: '1.6'
    };
  };

  const containerClasses = `
    w-full mx-auto
    ${maxWidthClasses[maxWidth]}
    ${paddingClasses[padding]}
    ${spacingClasses[spacing]}
    ${backgroundClasses[background]}
    ${shadowClass}
    ${roundedClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <motion.div
      className={containerClasses}
      style={getDesktopStyles()}
      initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
};

// Pre-configured layout containers for common use cases
export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <LayoutContainer
    maxWidth="6xl"
    padding="lg"
    spacing="lg"
    className={className}
  >
    {children}
  </LayoutContainer>
);

export const ContentContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <LayoutContainer
    maxWidth="4xl"
    padding="md"
    spacing="md"
    background="white"
    shadow
    rounded
    className={className}
  >
    {children}
  </LayoutContainer>
);

export const FormContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <LayoutContainer
    maxWidth="2xl"
    padding="lg"
    spacing="md"
    background="white"
    shadow
    rounded
    className={className}
  >
    {children}
  </LayoutContainer>
);

export const ListContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <LayoutContainer
    maxWidth="7xl"
    padding="md"
    spacing="sm"
    className={className}
  >
    {children}
  </LayoutContainer>
);

export default LayoutContainer;