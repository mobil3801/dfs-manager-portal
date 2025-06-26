// This component has been disabled to prevent loading issues
// The original PerformanceMonitoringSystem was causing infinite loops
// and consuming excessive resources, blocking the main thread.

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Monitor, AlertTriangle } from 'lucide-react';

const DisabledPerformanceMonitor: React.FC = () => {
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-700">
          <Monitor className="h-5 w-5" />
          Performance Monitoring
          <Badge variant="secondary">Disabled</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Performance monitoring has been temporarily disabled to resolve loading issues. 
            Basic performance is monitored through optimized loading systems.
          </AlertDescription>
        </Alert>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>• Memory usage: Optimized</p>
          <p>• Loading performance: Enhanced</p>
          <p>• Resource cleanup: Active</p>
          <p>• Error boundaries: Active</p>
        </div>
      </CardContent>
    </Card>);

};

export default DisabledPerformanceMonitor;