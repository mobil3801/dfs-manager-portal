import React from 'react';
import { motion } from 'motion/react';
import { useIsMobile } from '@/hooks/use-mobile';
import LayoutContainer from './LayoutContainer';

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  showHeader?: boolean;
  headerActions?: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  title,
  subtitle,
  className = '',
  maxWidth = '6xl',
  padding = 'lg',
  spacing = 'lg',
  showHeader = true,
  headerActions
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <LayoutContainer
        maxWidth={maxWidth}
        padding={padding}
        spacing={spacing}
        className="min-h-full"
      >
        {/* Page Header */}
        {showHeader && (title || subtitle || headerActions) && (
          <motion.div
            className="mb-8 border-b border-gray-200 pb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex-1">
                {title && (
                  <h1 className={`font-bold text-gray-900 ${
                    isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'
                  }`}>
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className={`text-gray-600 mt-2 ${
                    isMobile ? 'text-sm' : 'text-base lg:text-lg'
                  }`}>
                    {subtitle}
                  </p>
                )}
              </div>
              {headerActions && (
                <div className="flex-shrink-0">
                  {headerActions}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Page Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </LayoutContainer>
    </div>
  );
};

export default PageWrapper;