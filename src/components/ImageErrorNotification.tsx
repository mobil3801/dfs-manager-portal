import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, X, RefreshCw } from 'lucide-react';
import { imageErrorService } from '@/services/imageErrorService';
import { useToast } from '@/hooks/use-toast';

interface ErrorReport {
  id: string;
  url: string;
  timestamp: number;
  error: string;
}

interface ImageErrorNotificationProps {
  className?: string;
  autoHide?: boolean;
  hideDelay?: number;
}

const ImageErrorNotification: React.FC<ImageErrorNotificationProps> = ({
  className = '',
  autoHide = true,
  hideDelay = 10000 // 10 seconds
}) => {
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkForErrors = () => {
      try {
        // Get image errors from the service if available
        if (imageErrorService && typeof imageErrorService.getRecentErrors === 'function') {
          const imageErrors = imageErrorService.getRecentErrors();
          const recentErrors = imageErrors.filter((error: any) =>
            Date.now() - error.timestamp < 60000 // Errors from last minute
          );

          if (recentErrors.length > 0 && !isVisible) {
            setErrors(recentErrors);
            setIsVisible(true);

            // Auto-hide after delay
            if (autoHide) {
              setTimeout(() => {
                setIsVisible(false);
              }, hideDelay);
            }
          }
        }
      } catch (error) {
        console.warn('Error checking for image errors:', error);
      }
    };

    // Check immediately
    checkForErrors();

    // Check periodically
    const interval = setInterval(checkForErrors, 5000);

    return () => clearInterval(interval);
  }, [autoHide, hideDelay, isVisible]);

  const handleRetryAll = async () => {
    setIsRetrying(true);

    try {
      const uniqueUrls = [...new Set(errors.map((error) => error.url).filter(Boolean))];
      const results = await Promise.allSettled(
        uniqueUrls.map((url) => 
          imageErrorService.loadImage ? 
          imageErrorService.loadImage({ url: url!, maxRetries: 1 }) :
          Promise.resolve({ success: false })
        )
      );

      const successful = results.filter((result) =>
        result.status === 'fulfilled' && (result.value as any).success
      ).length;

      if (successful > 0) {
        toast({
          title: 'Images recovered',
          description: `Successfully loaded ${successful} out of ${uniqueUrls.length} images`
        });

        // Hide notification after successful retry
        setIsVisible(false);
      } else {
        toast({
          title: 'Retry failed',
          description: 'Images are still not accessible',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Retry error',
        description: 'Failed to retry image loading',
        variant: 'destructive'
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      if (imageErrorService && typeof imageErrorService.clearErrors === 'function') {
        imageErrorService.clearErrors();
      }
    } catch (error) {
      console.warn('Error clearing image errors:', error);
    }
  };

  if (!isVisible || errors.length === 0) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-orange-800">
                  Image Loading Issues
                </span>
                <Badge variant="secondary" className="text-xs">
                  {errors.length} errors
                </Badge>
              </div>
              <p className="text-sm text-orange-700 mb-3">
                Some images failed to load. This may be due to network issues or broken links.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRetryAll}
                  disabled={isRetrying}
                  className="text-xs h-7">
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry All
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-xs h-7 text-orange-600 hover:text-orange-700">
                  <X className="w-3 h-3 mr-1" />
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ImageErrorNotification;