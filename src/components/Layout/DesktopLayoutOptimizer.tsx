import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface DesktopLayoutOptimizerProps {
  children: React.ReactNode;
  className?: string;
}

const DesktopLayoutOptimizer: React.FC<DesktopLayoutOptimizerProps> = ({
  children,
  className = ''
}) => {
  const [viewportDimensions, setViewportDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080
  });

  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  useEffect(() => {
    // Calculate scrollbar width
    const calculateScrollbarWidth = () => {
      const outer = document.createElement('div');
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll';
      outer.style.msOverflowStyle = 'scrollbar';
      document.body.appendChild(outer);

      const inner = document.createElement('div');
      outer.appendChild(inner);

      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
      outer.parentNode?.removeChild(outer);

      return scrollbarWidth;
    };

    setScrollbarWidth(calculateScrollbarWidth());

    const handleResize = () => {
      setViewportDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop layout optimization styles
  const getOptimizedStyles = (): React.CSSProperties => {
    const isDesktop = viewportDimensions.width >= 1024;
    
    if (!isDesktop) return {};

    // Desktop-specific optimizations
    return {
      // Ensure full viewport utilization
      width: '100%',
      minHeight: '100vh',
      // Account for scrollbar in calculations
      maxWidth: `calc(100vw - ${scrollbarWidth}px)`,
      // Prevent horizontal overflow
      overflowX: 'hidden',
      // Optimize layout for larger screens
      display: 'flex',
      flexDirection: 'column',
      // Ensure content starts properly positioned
      position: 'relative',
      zIndex: 1
    };
  };

  // Content area optimization
  const getContentStyles = (): React.CSSProperties => {
    const isDesktop = viewportDimensions.width >= 1024;
    const isLargeDesktop = viewportDimensions.width >= 1440;
    const isUltraWide = viewportDimensions.width >= 1920;

    if (!isDesktop) return {};

    return {
      // Responsive max-width for different screen sizes
      maxWidth: isUltraWide ? '1800px' : isLargeDesktop ? '1200px' : '960px',
      margin: '0 auto',
      padding: isLargeDesktop ? '2rem' : '1.5rem',
      // Ensure proper spacing
      width: '100%',
      // Optimize for reading and interaction
      lineHeight: '1.6',
      // Prevent content from touching edges
      boxSizing: 'border-box'
    };
  };

  // Grid optimization for desktop
  const getGridClasses = () => {
    const isDesktop = viewportDimensions.width >= 1024;
    const isLargeDesktop = viewportDimensions.width >= 1440;
    const isUltraWide = viewportDimensions.width >= 1920;

    if (!isDesktop) return '';

    // Responsive grid system
    if (isUltraWide) return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';
    if (isLargeDesktop) return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
    return 'grid-cols-1 lg:grid-cols-2';
  };

  return (
    <motion.div
      className={`desktop-layout-optimizer ${className}`}
      style={getOptimizedStyles()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Desktop Navigation Spacer - prevents content overlap */}
      {viewportDimensions.width >= 1024 && (
        <div 
          className="desktop-nav-spacer"
          style={{
            height: '4px', // Minimal spacer
            width: '100%',
            flexShrink: 0
          }}
        />
      )}

      {/* Optimized Content Container */}
      <div 
        className="desktop-content-container flex-1"
        style={getContentStyles()}
      >
        {/* Grid Wrapper for responsive layouts */}
        <div className={`w-full ${getGridClasses()}`}>
          {children}
        </div>
      </div>

      {/* Desktop Footer Spacer */}
      {viewportDimensions.width >= 1024 && (
        <div 
          className="desktop-footer-spacer"
          style={{
            height: '2rem',
            width: '100%',
            flexShrink: 0
          }}
        />
      )}

      {/* Viewport Information (Development Helper - remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none z-50"
          style={{ fontSize: '10px' }}
        >
          {viewportDimensions.width} × {viewportDimensions.height}
          {scrollbarWidth > 0 && ` | SB: ${scrollbarWidth}px`}
        </div>
      )}
    </motion.div>
  );
};

export default DesktopLayoutOptimizer;