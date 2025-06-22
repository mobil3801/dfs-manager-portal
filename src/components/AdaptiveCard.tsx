
import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeviceAdaptive } from '@/contexts/DeviceAdaptiveContext';

interface AdaptiveCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const AdaptiveCard: React.FC<AdaptiveCardProps> = ({
  title,
  description,
  children,
  className = '',
  hoverable = true,
  clickable = false,
  onClick
}) => {
  const device = useDeviceAdaptive();

  const cardSize = device.preferredCardSize;
  const shouldAnimate = device.connectionType !== 'slow';

  const sizeClasses = {
    compact: 'p-3',
    normal: 'p-4',
    large: 'p-6'
  };

  const titleSizeClasses = {
    compact: 'text-sm',
    normal: 'text-base',
    large: 'text-lg'
  };

  const CardWrapper = motion(Card);

  return (
    <CardWrapper
      className={`
        ${className}
        ${clickable ? 'cursor-pointer' : ''}
        ${device.hasTouch ? 'touch-manipulation' : ''}
        transition-all duration-200
      `}
      onClick={onClick}
      whileHover={
      shouldAnimate && hoverable && !device.hasTouch ?
      { scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' } :
      {}
      }
      whileTap={shouldAnimate ? { scale: 0.98 } : {}}
      initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: device.animationDuration / 1000 }}>

      {(title || description) &&
      <CardHeader className={sizeClasses[cardSize]}>
          {title &&
        <CardTitle className={titleSizeClasses[cardSize]}>
              {title}
            </CardTitle>
        }
          {description &&
        <CardDescription className={device.optimalFontSize === 'large' ? 'text-base' : 'text-sm'}>
              {description}
            </CardDescription>
        }
        </CardHeader>
      }
      <CardContent className={sizeClasses[cardSize]}>
        {children}
      </CardContent>
    </CardWrapper>);

};

export default AdaptiveCard;