import React from 'react';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ResponsiveGrid from '@/components/ResponsiveGrid';
import MobileOptimizedCard from '@/components/MobileOptimizedCard';
import MobileOptimizedButton from '@/components/MobileOptimizedButton';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Zap, 
  Wifi, 
  Battery, 
  Settings 
} from 'lucide-react';

const MobileResponsivePage: React.FC = () => {
  const { deviceInfo, deviceOptimizations, deviceSpecs } = useMobileResponsive();

  const getDeviceIcon = () => {
    if (deviceInfo.isMobile) return <Smartphone className="h-6 w-6" />;
    if (deviceInfo.isTablet) return <Tablet className="h-6 w-6" />;
    return <Monitor className="h-6 w-6" />;
  };

  const testResponsiveFeatures = () => {
    // Test haptic feedback
    if (deviceOptimizations.enableHapticFeedback && (window as any).navigator?.vibrate) {
      (window as any).navigator.vibrate(100);
    }
    
    // Test orientation change
    if (screen.orientation && screen.orientation.lock) {
      console.log('Device supports orientation lock');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getDeviceIcon()}
          <h1 className="text-2xl font-bold text-gray-900">
            Mobile Responsive Dashboard
          </h1>
        </div>
        <Badge variant="outline" className="text-sm">
          {deviceInfo.operatingSystem} {deviceInfo.deviceType}
        </Badge>
      </div>

      <ResponsiveGrid
        mobileColumns={1}
        tabletColumns={2}
        desktopColumns={3}
        gap="md"
        className="mb-6"
      >
        <MobileOptimizedCard
          title="Device Detection"
          padding="md"
          shadow="sm"
          hover
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Screen Size:</span>
              <span className="text-sm text-gray-600">
                {deviceInfo.screenWidth}×{deviceInfo.screenHeight}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Orientation:</span>
              <Badge variant="outline">{deviceInfo.orientation}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Touch Support:</span>
              <Badge variant={deviceInfo.touchSupport ? "default" : "secondary"}>
                {deviceInfo.touchSupport ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Pixel Ratio:</span>
              <span className="text-sm text-gray-600">{deviceInfo.devicePixelRatio}x</span>
            </div>
          </div>
        </MobileOptimizedCard>

        <MobileOptimizedCard
          title="OS Optimizations"
          padding="md"
          shadow="sm"
          hover
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">iOS Design:</span>
              <Badge variant={deviceOptimizations.useIOSDesign ? "default" : "secondary"}>
                {deviceOptimizations.useIOSDesign ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Android Design:</span>
              <Badge variant={deviceOptimizations.useAndroidDesign ? "default" : "secondary"}>
                {deviceOptimizations.useAndroidDesign ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Haptic Feedback:</span>
              <Badge variant={deviceOptimizations.enableHapticFeedback ? "default" : "secondary"}>
                {deviceOptimizations.enableHapticFeedback ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Native Scrolling:</span>
              <Badge variant={deviceOptimizations.useNativeScrolling ? "default" : "secondary"}>
                {deviceOptimizations.useNativeScrolling ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </MobileOptimizedCard>

        <MobileOptimizedCard
          title="Performance Specs"
          padding="md"
          shadow="sm"
          hover
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Performance:</span>
              <Badge variant={
                deviceSpecs.performance === 'high' ? 'default' : 
                deviceSpecs.performance === 'medium' ? 'secondary' : 'destructive'
              }>
                {deviceSpecs.performance}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Network:</span>
              <Badge variant="outline">{deviceSpecs.networkSpeed}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Rendering:</span>
              <Badge variant="outline">{deviceSpecs.renderingCapability}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Image Format:</span>
              <Badge variant="outline">{deviceSpecs.imageOptimization.toUpperCase()}</Badge>
            </div>
          </div>
        </MobileOptimizedCard>
      </ResponsiveGrid>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Responsive Features Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MobileOptimizedButton
              onClick={testResponsiveFeatures}
              className="w-full"
              variant="default"
              mobileSize="lg"
            >
              Test Haptic Feedback
            </MobileOptimizedButton>
            
            <MobileOptimizedButton
              onClick={() => window.location.reload()}
              className="w-full"
              variant="outline"
              mobileSize="lg"
            >
              Refresh Detection
            </MobileOptimizedButton>
            
            <MobileOptimizedButton
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  document.documentElement.requestFullscreen();
                }
              }}
              className="w-full"
              variant="secondary"
              mobileSize="lg"
            >
              Toggle Fullscreen
            </MobileOptimizedButton>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Device Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Wifi className={`h-6 w-6 ${deviceInfo.onlineStatus ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <p className="text-sm font-medium">Network</p>
              <p className="text-xs text-gray-600">
                {deviceInfo.onlineStatus ? 'Online' : 'Offline'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Battery className={`h-6 w-6 ${deviceInfo.supportsServiceWorker ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
              <p className="text-sm font-medium">Service Worker</p>
              <p className="text-xs text-gray-600">
                {deviceInfo.supportsServiceWorker ? 'Supported' : 'Not Supported'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Settings className={`h-6 w-6 ${deviceInfo.supportsPushNotifications ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
              <p className="text-sm font-medium">Push Notifications</p>
              <p className="text-xs text-gray-600">
                {deviceInfo.supportsPushNotifications ? 'Supported' : 'Not Supported'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Zap className={`h-6 w-6 ${deviceInfo.supportsWebGL ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
              <p className="text-sm font-medium">WebGL</p>
              <p className="text-xs text-gray-600">
                {deviceInfo.supportsWebGL ? 'Supported' : 'Not Supported'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileResponsivePage;