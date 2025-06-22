import React from 'react';
import { motion } from 'motion/react';
import { useDeviceAdaptive } from '@/contexts/DeviceAdaptiveContext';
import { useResponsiveUtils } from '@/hooks/use-responsive-utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  TouchpadOff,
  Hand,
  Eye,
  Zap } from
'lucide-react';

const ResponsiveDemo: React.FC = () => {
  const device = useDeviceAdaptive();
  const { getCardClasses, getAnimationConfig, breakpoints } = useResponsiveUtils();

  const deviceFeatures = [
  {
    icon: device.deviceType === 'mobile' ? Smartphone : device.deviceType === 'tablet' ? Tablet : Monitor,
    label: 'Device Type',
    value: device.deviceType.charAt(0).toUpperCase() + device.deviceType.slice(1),
    color: 'blue'
  },
  {
    icon: device.hasTouch ? Hand : TouchpadOff,
    label: 'Touch Support',
    value: device.hasTouch ? 'Enabled' : 'Mouse/Trackpad',
    color: device.hasTouch ? 'green' : 'gray'
  },
  {
    icon: Eye,
    label: 'Hover Support',
    value: device.supportsHover ? 'Yes' : 'No',
    color: device.supportsHover ? 'green' : 'gray'
  },
  {
    icon: Wifi,
    label: 'Connection',
    value: device.connectionType.charAt(0).toUpperCase() + device.connectionType.slice(1),
    color: device.connectionType === 'fast' ? 'green' : device.connectionType === 'slow' ? 'red' : 'gray'
  },
  {
    icon: Zap,
    label: 'Animations',
    value: device.prefersReducedMotion ? 'Reduced' : 'Enabled',
    color: device.prefersReducedMotion ? 'yellow' : 'green'
  }];


  return (
    <motion.div
      {...getAnimationConfig('fade')}
      className="space-y-6">

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Responsive Experience Active
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your experience is automatically optimized for your device
        </p>
      </div>

      <div className={`grid gap-4 ${device.isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
        {deviceFeatures.map((feature, index) =>
        <motion.div
          key={feature.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}>

            <Card className={getCardClasses()}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full bg-${feature.color}-100 text-${feature.color}-600`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {feature.label}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {feature.value}
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      <Card className={getCardClasses()}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Current Configuration
        </h3>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Screen Size:</span>
            <Badge>{device.screenSize.toUpperCase()}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Navigation:</span>
            <Badge>{device.preferredNavigation}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Card Size:</span>
            <Badge>{device.preferredCardSize}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Font Size:</span>
            <Badge>{device.optimalFontSize}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Touch Target:</span>
            <Badge>{device.touchTargetSize}px</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Viewport:</span>
            <Badge>{device.viewportWidth} × {device.viewportHeight}</Badge>
          </div>
        </div>
      </Card>

      {/* Breakpoint indicators */}
      <Card className={getCardClasses()}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Active Breakpoints
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(breakpoints).map(([key, isActive]) =>
          <Badge
            key={key}
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-green-100 text-green-800" : ""}>

              {key.replace('is', '')}
            </Badge>
          )}
        </div>
      </Card>

      <div className="text-center">
        <Button
          size={device.hasTouch ? "lg" : "default"}
          onClick={() => window.location.reload()}
          className={device.hasTouch ? "min-h-touch" : ""}>

          Refresh to Re-detect Device
        </Button>
      </div>
    </motion.div>);

};

export default ResponsiveDemo;