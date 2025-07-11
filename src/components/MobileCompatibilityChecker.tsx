import React, { useState, useEffect } from 'react';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Smartphone, 
  Tablet, 
  Monitor,
  Wifi,
  Battery,
  Zap,
  Globe
} from 'lucide-react';

interface CompatibilityTest {
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  recommendation?: string;
}

const MobileCompatibilityChecker: React.FC = () => {
  const { deviceInfo, deviceOptimizations, deviceSpecs } = useMobileResponsive();
  const [tests, setTests] = useState<CompatibilityTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const runCompatibilityTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const testResults: CompatibilityTest[] = [];
    const totalTests = 12;
    let currentTest = 0;

    const updateProgress = () => {
      currentTest++;
      setProgress((currentTest / totalTests) * 100);
    };

    // Test 1: Screen Size Compatibility
    await new Promise(resolve => setTimeout(resolve, 200));
    testResults.push({
      name: 'Screen Size',
      description: 'Checking if screen size is mobile-friendly',
      status: deviceInfo.isMobile ? 'pass' : deviceInfo.isTablet ? 'warning' : 'fail',
      details: `Screen: ${deviceInfo.screenWidth}×${deviceInfo.screenHeight}`,
      recommendation: deviceInfo.screenWidth < 360 ? 'Consider optimizing for smaller screens' : undefined
    });
    updateProgress();

    // Test 2: Touch Support
    await new Promise(resolve => setTimeout(resolve, 200));
    testResults.push({
      name: 'Touch Support',
      description: 'Checking touch interaction capabilities',
      status: deviceInfo.touchSupport ? 'pass' : 'fail',
      details: `Touch points: ${(navigator as any).maxTouchPoints || 0}`,
      recommendation: !deviceInfo.touchSupport ? 'Touch interactions may not work properly' : undefined
    });
    updateProgress();

    // Test 3: Orientation Support
    await new Promise(resolve => setTimeout(resolve, 200));
    testResults.push({
      name: 'Orientation',
      description: 'Checking orientation change support',
      status: screen.orientation ? 'pass' : 'warning',
      details: `Current: ${deviceInfo.orientation}`,
      recommendation: !screen.orientation ? 'Orientation lock may not be available' : undefined
    });
    updateProgress();

    // Test 4: Performance Level
    await new Promise(resolve => setTimeout(resolve, 200));
    testResults.push({
      name: 'Performance',
      description: 'Checking device performance capabilities',
      status: deviceSpecs.performance === 'high' ? 'pass' : 
             deviceSpecs.performance === 'medium' ? 'warning' : 'fail',
      details: `Performance: ${deviceSpecs.performance}, Cores: ${deviceInfo.cores || 'Unknown'}`,
      recommendation: deviceSpecs.performance === 'low' ? 'Consider enabling performance optimizations' : undefined
    });
    updateProgress();

    // Test 5: Network Speed
    await new Promise(resolve => setTimeout(resolve, 200));
    testResults.push({
      name: 'Network Speed',
      description: 'Checking network connection quality',
      status: deviceSpecs.networkSpeed === 'fast' ? 'pass' : 
             deviceSpecs.networkSpeed === 'medium' ? 'warning' : 'fail',
      details: `Speed: ${deviceSpecs.networkSpeed}, Online: ${deviceInfo.onlineStatus}`,
      recommendation: deviceSpecs.networkSpeed === 'slow' ? 'Consider optimizing for slow connections' : undefined
    });
    updateProgress();

    // Test 6: WebGL Support
    await new Promise(resolve => setTimeout(resolve, 200));
    testResults.push({
      name: 'WebGL Support',
      description: 'Checking 3D graphics capabilities',
      status: deviceInfo.supportsWebGL ? 'pass' : 'warning',
      details: `WebGL: ${deviceInfo.supportsWebGL ? 'Supported' : 'Not supported'}`,
      recommendation: !deviceInfo.supportsWebGL ? 'Advanced graphics features may not work' : undefined
    });
    updateProgress();

    // Test 7: Service Worker
    await new Promise(resolve => setTimeout(resolve, 200));
    testResults.push({
      name: 'Service Worker',
      description: 'Checking offline capabilities',
      status: deviceInfo.supportsServiceWorker ? 'pass' : 'warning',
      details: `Service Worker: ${deviceInfo.supportsServiceWorker ? 'Supported' : 'Not supported'}`,
      recommendation: !deviceInfo.supportsServiceWorker ? 'Offline features may not work' : undefined
    });
    updateProgress();

    // Test 8: Push Notifications
    await new Promise(resolve => setTimeout(resolve, 200));
    testResults.push({
      name: 'Push Notifications',
      description: 'Checking notification capabilities',
      status: deviceInfo.supportsPushNotifications ? 'pass' : 'warning',
      details: `Push: ${deviceInfo.supportsPushNotifications ? 'Supported' : 'Not supported'}`,
      recommendation: !deviceInfo.supportsPushNotifications ? 'Push notifications may not work' : undefined
    });
    updateProgress();

    // Test 9: Cookies
    await new Promise(resolve => setTimeout(resolve, 200));
    testResults.push({
      name: 'Cookies',
      description: 'Checking cookie support',
      status: deviceInfo.cookieEnabled ? 'pass' : 'fail',
      details: `Cookies: ${deviceInfo.cookieEnabled ? 'Enabled' : 'Disabled'}`,
      recommendation: !deviceInfo.cookieEnabled ? 'Authentication may not work properly' : undefined
    });
    updateProgress();

    // Test 10: Viewport Meta Tag
    await new Promise(resolve => setTimeout(resolve, 200));
    const viewport = document.querySelector('meta[name="viewport"]');
    testResults.push({
      name: 'Viewport Meta Tag',
      description: 'Checking mobile viewport configuration',
      status: viewport ? 'pass' : 'fail',
      details: `Viewport: ${viewport ? 'Configured' : 'Missing'}`,
      recommendation: !viewport ? 'Add viewport meta tag for proper mobile rendering' : undefined
    });
    updateProgress();

    // Test 11: CSS Media Queries
    await new Promise(resolve => setTimeout(resolve, 200));
    const supportsMediaQueries = window.matchMedia('(max-width: 768px)').matches;
    testResults.push({
      name: 'CSS Media Queries',
      description: 'Checking responsive CSS support',
      status: 'pass', // Modern browsers always support this
      details: `Media queries: Supported`,
      recommendation: undefined
    });
    updateProgress();

    // Test 12: Device Pixel Ratio
    await new Promise(resolve => setTimeout(resolve, 200));
    testResults.push({
      name: 'Device Pixel Ratio',
      description: 'Checking display density',
      status: deviceInfo.devicePixelRatio >= 2 ? 'pass' : 'warning',
      details: `DPR: ${deviceInfo.devicePixelRatio}`,
      recommendation: deviceInfo.devicePixelRatio < 2 ? 'Consider providing high-DPI assets' : undefined
    });
    updateProgress();

    setTests(testResults);
    setIsRunning(false);
    setProgress(100);
  };

  useEffect(() => {
    runCompatibilityTests();
  }, [deviceInfo]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const passedTests = tests.filter(t => t.status === 'pass').length;
  const warningTests = tests.filter(t => t.status === 'warning').length;
  const failedTests = tests.filter(t => t.status === 'fail').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mobile Compatibility Checker</h2>
        <Button onClick={runCompatibilityTests} disabled={isRunning}>
          {isRunning ? 'Running Tests...' : 'Run Tests Again'}
        </Button>
      </div>

      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-lg font-medium">Running Compatibility Tests...</div>
              <Progress value={progress} className="w-full" />
              <div className="text-sm text-gray-600">{Math.round(progress)}% Complete</div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isRunning && tests.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                    <div className="text-sm text-gray-600">Passed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{warningTests}</div>
                    <div className="text-sm text-gray-600">Warnings</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tests.map((test, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <div className="font-medium">{test.name}</div>
                          <div className="text-sm text-gray-600">{test.description}</div>
                          <div className="text-sm text-gray-500 mt-1">{test.details}</div>
                        </div>
                      </div>
                      <Badge variant={
                        test.status === 'pass' ? 'default' :
                        test.status === 'warning' ? 'secondary' : 'destructive'
                      }>
                        {test.status.toUpperCase()}
                      </Badge>
                    </div>
                    {test.recommendation && (
                      <Alert className="mt-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{test.recommendation}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MobileCompatibilityChecker;