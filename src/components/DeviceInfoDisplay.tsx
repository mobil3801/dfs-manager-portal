import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useEnhancedDeviceDetection, useDeviceOptimizations, useDeviceStyles } from '@/hooks/use-enhanced-device-detection';
import { useResponsiveLayout } from '@/contexts/ResponsiveLayoutContext';
import { Smartphone, Tablet, Monitor, Wifi, Battery, Cpu, Eye, Palette, Zap } from 'lucide-react';

interface DeviceInfoDisplayProps {
  showDetailed?: boolean;
  className?: string;
}

export default function DeviceInfoDisplay({ showDetailed = false, className = '' }: DeviceInfoDisplayProps) {
  const device = useEnhancedDeviceDetection();
  const optimizations = useDeviceOptimizations();
  const styles = useDeviceStyles();
  const { layoutConfig } = useResponsiveLayout();

  const DeviceIcon = device.deviceType === 'phone' ? Smartphone :
  device.deviceType === 'tablet' ? Tablet :
  Monitor;

  const formatDeviceInfo = () => {
    const info = [];
    if (device.brand !== 'Unknown') info.push(device.brand);
    if (device.model !== 'Unknown' && device.model !== 'Unknown Model') info.push(device.model);
    if (info.length === 0) info.push('Unknown Device');
    return info.join(' ');
  };

  const formatScreenInfo = () => {
    return `${device.screenWidth}×${device.screenHeight}${device.devicePixelRatio > 1 ? ` @${device.devicePixelRatio}x` : ''}`;
  };

  const formatOSInfo = () => {
    const parts = [];
    if (device.os !== 'Unknown') parts.push(device.os);
    if (device.osVersion !== 'Unknown') parts.push(device.osVersion);
    return parts.join(' ') || 'Unknown OS';
  };

  const formatBrowserInfo = () => {
    const parts = [];
    if (device.browser !== 'Unknown') parts.push(device.browser);
    if (device.browserVersion !== 'Unknown') parts.push(device.browserVersion);
    return parts.join(' ') || 'Unknown Browser';
  };

  const getDeviceTypeColor = () => {
    switch (device.deviceType) {
      case 'phone':return 'bg-blue-500';
      case 'tablet':return 'bg-purple-500';
      default:return 'bg-green-500';
    }
  };

  const getCapabilityBadges = () => {
    const badges = [];
    if (device.capabilities.supportsWebGL) badges.push({ label: 'WebGL', color: 'bg-green-500' });
    if (device.capabilities.supportsWebP) badges.push({ label: 'WebP', color: 'bg-blue-500' });
    if (device.capabilities.supportsIntersectionObserver) badges.push({ label: 'Intersection Observer', color: 'bg-purple-500' });
    if (device.capabilities.supportsPassiveEvents) badges.push({ label: 'Passive Events', color: 'bg-orange-500' });
    if (device.touchDevice) badges.push({ label: 'Touch', color: 'bg-pink-500' });
    if (device.capabilities.maxTouchPoints > 0) badges.push({ label: `${device.capabilities.maxTouchPoints} Touch Points`, color: 'bg-indigo-500' });
    return badges;
  };

  const getOptimizationBadges = () => {
    const badges = [];
    if (optimizations.useLazyLoading) badges.push({ label: 'Lazy Loading', icon: Zap });
    if (optimizations.useVirtualScrolling) badges.push({ label: 'Virtual Scrolling', icon: Eye });
    if (optimizations.reducedAnimations) badges.push({ label: 'Reduced Animations', icon: Palette });
    if (optimizations.compactLayout) badges.push({ label: 'Compact Layout', icon: Smartphone });
    if (optimizations.largeClickTargets) badges.push({ label: 'Large Targets', icon: Smartphone });
    if (optimizations.highDPIOptimizations) badges.push({ label: 'High DPI', icon: Monitor });
    if (optimizations.batteryOptimizations) badges.push({ label: 'Battery Saving', icon: Battery });
    return badges;
  };

  if (!showDetailed) {
    return (
      <div className={`flex items-center space-x-2 text-sm ${className}`}>
        <DeviceIcon className="h-4 w-4" />
        <span>{formatDeviceInfo()}</span>
        <Badge variant="outline" className="text-xs">
          {device.orientation}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {formatScreenInfo()}
        </Badge>
      </div>);

  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Device Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DeviceIcon className="h-5 w-5" />
            <span>Device Information</span>
          </CardTitle>
          <CardDescription>
            Detected device specifications and capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Device</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brand:</span>
                  <span>{device.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model:</span>
                  <span>{device.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline" className={`${getDeviceTypeColor()} text-white`}>
                    {device.deviceType}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Screen</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolution:</span>
                  <span>{formatScreenInfo()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Orientation:</span>
                  <span>{device.orientation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pixel Ratio:</span>
                  <span>{device.devicePixelRatio}x</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Operating System</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">OS:</span>
                  <span>{formatOSInfo()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Browser</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Browser:</span>
                  <span>{formatBrowserInfo()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cpu className="h-5 w-5" />
            <span>Device Capabilities</span>
          </CardTitle>
          <CardDescription>
            Supported features and technologies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {getCapabilityBadges().map((badge, index) =>
            <Badge key={index} variant="outline" className="text-xs">
                {badge.label}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Layout Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Layout Configuration</span>
          </CardTitle>
          <CardDescription>
            Applied layout settings for this device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Navigation</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">{layoutConfig.navigation}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Content Layout:</span>
                  <Badge variant="outline">{layoutConfig.contentLayout}</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Components</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cards:</span>
                  <Badge variant="outline">{layoutConfig.cardLayout}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tables:</span>
                  <Badge variant="outline">{layoutConfig.tableLayout}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Forms:</span>
                  <Badge variant="outline">{layoutConfig.formLayout}</Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Sizing</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buttons:</span>
                  <Badge variant="outline">{layoutConfig.buttonSize}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spacing:</span>
                  <Badge variant="outline">{layoutConfig.spacing}</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Animations</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level:</span>
                  <Badge variant="outline">{layoutConfig.animations}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Active Optimizations</span>
          </CardTitle>
          <CardDescription>
            Performance and usability optimizations applied
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {getOptimizationBadges().map((badge, index) =>
            <Badge key={index} variant="outline" className="text-xs flex items-center space-x-1">
                {badge.icon && <badge.icon className="h-3 w-3" />}
                <span>{badge.label}</span>
              </Badge>
            )}
          </div>
          {getOptimizationBadges().length === 0 &&
          <p className="text-sm text-muted-foreground">No specific optimizations applied</p>
          }
        </CardContent>
      </Card>
    </div>);

}