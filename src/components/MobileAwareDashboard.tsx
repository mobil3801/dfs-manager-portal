import React from 'react';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Wifi, 
  Battery, 
  Cpu, 
  HardDrive,
  Globe,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileAwareDashboard: React.FC = () => {
  const { deviceInfo, deviceOptimizations, deviceSpecs } = useMobileResponsive();

  const getDeviceIcon = () => {
    if (deviceInfo.isMobile) return <Smartphone className="h-5 w-5" />;
    if (deviceInfo.isTablet) return <Tablet className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  const getPerformanceColor = (perf: string) => {
    switch (perf) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getNetworkColor = (speed: string) => {
    switch (speed) {
      case 'fast': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'slow': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={cn(
      'grid gap-4 p-4',
      deviceInfo.isMobile ? 'grid-cols-1' : 
      deviceInfo.isTablet ? 'grid-cols-2' : 'grid-cols-3'
    )}>
      {/* Device Information Card */}
      <Card className={cn(
        'transition-all duration-200',
        deviceOptimizations.useIOSDesign && 'ios-card',
        deviceOptimizations.useAndroidDesign && 'android-card'
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            {getDeviceIcon()}
            <span>Device Info</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Type:</span>
            <Badge variant="outline">{deviceInfo.deviceType}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">OS:</span>
            <Badge variant="secondary">{deviceInfo.operatingSystem}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Browser:</span>
            <Badge variant="outline">{deviceInfo.browser}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Screen:</span>
            <span className="text-sm text-gray-600">
              {deviceInfo.screenWidth}×{deviceInfo.screenHeight}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Orientation:</span>
            <Badge variant="outline">{deviceInfo.orientation}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Touch:</span>
            <Badge variant={deviceInfo.touchSupport ? 'default' : 'secondary'}>
              {deviceInfo.touchSupport ? 'Yes' : 'No'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Performance Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            <span>Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">CPU Cores:</span>
            <Badge variant="outline">{deviceInfo.cores || 'Unknown'}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Memory:</span>
            <Badge variant="outline">{deviceInfo.memory ? `${deviceInfo.memory}GB` : 'Unknown'}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Performance:</span>
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', getPerformanceColor(deviceSpecs.performance))} />
              <span className="text-sm capitalize">{deviceSpecs.performance}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Network:</span>
            <span className={cn('text-sm capitalize', getNetworkColor(deviceSpecs.networkSpeed))}>
              {deviceSpecs.networkSpeed}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">WebGL:</span>
            <Badge variant={deviceInfo.supportsWebGL ? 'default' : 'secondary'}>
              {deviceInfo.supportsWebGL ? 'Yes' : 'No'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Optimizations Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <span>Optimizations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Reduced Motion:</span>
            <Badge variant={deviceOptimizations.reducedMotion ? 'default' : 'secondary'}>
              {deviceOptimizations.reducedMotion ? 'Yes' : 'No'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Dark Mode:</span>
            <Badge variant={deviceOptimizations.darkMode ? 'default' : 'secondary'}>
              {deviceOptimizations.darkMode ? 'Yes' : 'No'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Touch Targets:</span>
            <Badge variant="outline">{deviceOptimizations.touchTargetSize}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">iOS Design:</span>
            <Badge variant={deviceOptimizations.useIOSDesign ? 'default' : 'secondary'}>
              {deviceOptimizations.useIOSDesign ? 'Yes' : 'No'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Android Design:</span>
            <Badge variant={deviceOptimizations.useAndroidDesign ? 'default' : 'secondary'}>
              {deviceOptimizations.useAndroidDesign ? 'Yes' : 'No'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Haptic Feedback:</span>
            <Badge variant={deviceOptimizations.enableHapticFeedback ? 'default' : 'secondary'}>
              {deviceOptimizations.enableHapticFeedback ? 'Yes' : 'No'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Capabilities Card */}
      <Card className={deviceInfo.isMobile ? 'col-span-1' : 'col-span-2'}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <span>Device Capabilities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Service Worker:</span>
              <Badge variant={deviceInfo.supportsServiceWorker ? 'default' : 'secondary'}>
                {deviceInfo.supportsServiceWorker ? 'Yes' : 'No'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Push Notifications:</span>
              <Badge variant={deviceInfo.supportsPushNotifications ? 'default' : 'secondary'}>
                {deviceInfo.supportsPushNotifications ? 'Yes' : 'No'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cookies:</span>
              <Badge variant={deviceInfo.cookieEnabled ? 'default' : 'secondary'}>
                {deviceInfo.cookieEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Online Status:</span>
              <Badge variant={deviceInfo.onlineStatus ? 'default' : 'destructive'}>
                {deviceInfo.onlineStatus ? 'Online' : 'Offline'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">PWA Mode:</span>
              <Badge variant={deviceInfo.isStandalone ? 'default' : 'secondary'}>
                {deviceInfo.isStandalone ? 'Yes' : 'No'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Image Format:</span>
              <Badge variant="outline">{deviceSpecs.imageOptimization.toUpperCase()}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileAwareDashboard;