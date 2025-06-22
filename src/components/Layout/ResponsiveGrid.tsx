import React from 'react';
import { motion } from 'motion/react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    large?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  equalHeight?: boolean;
  staggerChildren?: boolean;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  columns = { mobile: 1, tablet: 2, desktop: 3, large: 4 },
  gap = 'md',
  equalHeight = false,
  staggerChildren = false
}) => {
  const isMobile = useIsMobile();

  // Gap classes
  const gapClasses = {
    'sm': 'gap-3',
    'md': 'gap-4 md:gap-6',
    'lg': 'gap-6 md:gap-8',
    'xl': 'gap-8 md:gap-10'
  };

  // Generate responsive grid classes
  const getGridClasses = () => {
    const mobile = columns.mobile || 1;
    const tablet = columns.tablet || 2;
    const desktop = columns.desktop || 3;
    const large = columns.large || 4;

    return `grid grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop} xl:grid-cols-${large}`;
  };

  // Animation variants for stagger effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerChildren ? 0.1 : 0,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  };

  const gridClasses = `
    ${getGridClasses()}
    ${gapClasses[gap]}
    ${equalHeight ? 'auto-rows-fr' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <motion.div
      className={gridClasses}
      variants={staggerChildren ? containerVariants : undefined}
      initial={staggerChildren ? 'hidden' : undefined}
      animate={staggerChildren ? 'visible' : undefined}>

      {React.Children.map(children, (child, index) => {
        if (staggerChildren) {
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className={equalHeight ? 'h-full' : ''}>

              {child}
            </motion.div>);

        }
        return (
          <div
            key={index}
            className={equalHeight ? 'h-full' : ''}>

            {child}
          </div>);

      })}
    </motion.div>);

};

// Pre-configured grid components for common layouts
export const CardsGrid: React.FC<{children: React.ReactNode;className?: string;}> = ({
  children,
  className = ''
}) =>
<ResponsiveGrid
  columns={{ mobile: 1, tablet: 2, desktop: 3, large: 4 }}
  gap="lg"
  equalHeight
  staggerChildren
  className={className}>

    {children}
  </ResponsiveGrid>;


export const DashboardGrid: React.FC<{children: React.ReactNode;className?: string;}> = ({
  children,
  className = ''
}) =>
<ResponsiveGrid
  columns={{ mobile: 1, tablet: 2, desktop: 2, large: 3 }}
  gap="xl"
  equalHeight
  staggerChildren
  className={className}>

    {children}
  </ResponsiveGrid>;


export const ListGrid: React.FC<{children: React.ReactNode;className?: string;}> = ({
  children,
  className = ''
}) =>
<ResponsiveGrid
  columns={{ mobile: 1, tablet: 1, desktop: 1, large: 1 }}
  gap="md"
  staggerChildren
  className={className}>

    {children}
  </ResponsiveGrid>;


export const FormGrid: React.FC<{children: React.ReactNode;className?: string;}> = ({
  children,
  className = ''
}) =>
<ResponsiveGrid
  columns={{ mobile: 1, tablet: 2, desktop: 2, large: 2 }}
  gap="md"
  className={className}>

    {children}
  </ResponsiveGrid>;


export default ResponsiveGrid;