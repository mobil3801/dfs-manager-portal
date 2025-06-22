
import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useDeviceAdaptive } from '@/contexts/DeviceAdaptiveContext';

interface TouchOptimizedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  disabled?: boolean;
}

export const TouchOptimizedButton: React.FC<TouchOptimizedButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  className = '',
  disabled = false
}) => {
  const device = useDeviceAdaptive();

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      <Button
        variant={variant}
        onClick={onClick}
        disabled={disabled}
        className={`
          ${device.hasTouch ? 'min-h-[44px] min-w-[44px] px-6' : 'min-h-[36px]'}
          ${device.hasTouch ? 'text-base' : 'text-sm'}
          touch-manipulation
          ${className}
        `}
        style={{
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {children}
      </Button>
    </motion.div>
  );
};

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = ''
}) => {
  const device = useDeviceAdaptive();

  if (!device.hasTouch) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={`${className} touch-manipulation`}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100 && onSwipeRight) {
          onSwipeRight();
        } else if (info.offset.x < -100 && onSwipeLeft) {
          onSwipeLeft();
        }
      }}
      whileDrag={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  );
};

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className = ''
}) => {
  const device = useDeviceAdaptive();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);

  if (!device.hasTouch) {
    return <div className={className}>{children}</div>;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  };

  return (
    <motion.div
      className={`${className} touch-manipulation`}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.3}
      onDrag={(_, info) => {
        if (info.offset.y > 0) {
          setPullDistance(Math.min(info.offset.y, 100));
        }
      }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 80 && !isRefreshing) {
          handleRefresh();
        } else {
          setPullDistance(0);
        }
      }}
      style={{
        transform: `translateY(${Math.min(pullDistance / 2, 50)}px)`,
      }}
    >
      {pullDistance > 50 && (
        <motion.div
          className="flex items-center justify-center py-4 text-blue-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          <span>{isRefreshing ? 'Refreshing...' : 'Release to refresh'}</span>
        </motion.div>
      )}
      {children}
    </motion.div>
  );
};
