import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, RefreshCw, X, Eye } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getErrorStats, clearErrorLog } from '@/utils/globalErrorHandler';

interface ErrorMonitoringWidgetProps {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  minimizable?: boolean;
}

const ErrorMonitoringWidget: React.FC<ErrorMonitoringWidgetProps> = ({
  className = '',
  position = 'bottom-right',
  minimizable = true
}) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [errorStats, setErrorStats] = useState({
    totalErrors: 0,
    recentErrors: 0,
    errorRate: 0,
    lastError: null as any
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      try {
        const stats = getErrorStats();
        setErrorStats(stats);
        
        // Show widget if there are recent errors
        setIsVisible(stats.recentErrors > 0 || stats.totalErrors > 0);
      } catch (error) {
        console.warn('Error updating error stats:', error);
      }
    };

    // Update immediately
    updateStats();

    // Update every 10 seconds
    const interval = setInterval(updateStats, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleClearErrors = () => {
    try {
      clearErrorLog();
      setErrorStats({
        totalErrors: 0,
        recentErrors: 0,
        errorRate: 0,
        lastError: null
      });
    } catch (error) {
      console.warn('Error clearing error log:', error);
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };

  const getSeverityColor = () => {
    if (errorStats.recentErrors === 0) return 'text-green-600 bg-green-50 border-green-200';
    if (errorStats.recentErrors < 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (errorStats.recentErrors < 5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  if (!isVisible && minimizable) {
    return null;
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-40 max-w-sm ${className}`}>
      <Card className={`${getSeverityColor()} border-2 shadow-lg`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {errorStats.recentErrors === 0 ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              Error Monitor
            </CardTitle>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                {errorStats.recentErrors}
              </Badge>
              {minimizable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-6 w-6 p-0">
                  <Eye className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <Collapsible open={!isMinimized} onOpenChange={setIsMinimized}>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Total Errors:</span>
                    <span className="ml-1">{errorStats.totalErrors}</span>
                  </div>
                  <div>
                    <span className="font-medium">Recent:</span>
                    <span className="ml-1">{errorStats.recentErrors}</span>
                  </div>
                  <div>
                    <span className="font-medium">Error Rate:</span>
                    <span className="ml-1">{errorStats.errorRate.toFixed(1)}/min</span>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className="ml-1">
                      {errorStats.recentErrors === 0 ? 'Healthy' : 'Issues Found'}
                    </span>
                  </div>
                </div>

                {errorStats.lastError && (
                  <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
                    <div className="font-medium mb-1">Last Error:</div>
                    <div className="text-gray-700 truncate">
                      {errorStats.lastError.error?.message || 'Unknown error'}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      {new Date(errorStats.lastError.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearErrors}
                    className="text-xs h-7 flex-1">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="text-xs h-7 flex-1">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};

export default ErrorMonitoringWidget;