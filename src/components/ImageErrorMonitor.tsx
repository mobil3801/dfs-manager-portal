
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  RefreshCw,
  Image,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff } from
'lucide-react';
import globalErrorHandler from '@/utils/globalErrorHandler';
import { imageErrorService } from '@/services/imageErrorService';
import { useToast } from '@/hooks/use-toast';

interface ImageErrorMonitorProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxErrors?: number;
}

const ImageErrorMonitor: React.FC<ImageErrorMonitorProps> = ({
  className = '',
  autoRefresh = true,
  refreshInterval = 30000,
  maxErrors = 10
}) => {
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    updateErrors();

    if (autoRefresh) {
      const interval = setInterval(updateErrors, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const updateErrors = () => {
    const imageErrors = globalErrorHandler.getImageErrors();
    setErrors(imageErrors.slice(0, maxErrors));
  };

  const handleClearErrors = async () => {
    setIsClearing(true);
    try {
      globalErrorHandler.clearErrors();
      imageErrorService.clearCache();
      setErrors([]);
      toast({
        title: 'Errors cleared',
        description: 'All image loading errors have been cleared'
      });
    } catch (error) {
      toast({
        title: 'Clear failed',
        description: 'Failed to clear errors',
        variant: 'destructive'
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleRetryImage = async (url: string) => {
    try {
      const result = await imageErrorService.loadImage({
        url,
        maxRetries: 1
      });

      if (result.success) {
        toast({
          title: 'Retry successful',
          description: 'Image loaded successfully'
        });
        updateErrors();
      } else {
        toast({
          title: 'Retry failed',
          description: result.error || 'Image still cannot be loaded',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Retry error',
        description: 'Failed to retry image loading',
        variant: 'destructive'
      });
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = (status: number) => {
    if (status === 0) return 'bg-red-100 text-red-800';
    if (status >= 400) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSeverityIcon = (status: number) => {
    if (status === 0) return <XCircle className="h-4 w-4 text-red-600" />;
    if (status >= 400) return <AlertCircle className="h-4 w-4 text-orange-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  if (errors.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Image className="h-4 w-4" />
            Image Loading Status
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
              All OK
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>No image loading errors detected</span>
          </div>
        </CardContent>
      </Card>);

  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Image className="h-4 w-4" />
          Image Loading Issues
          <Badge variant="destructive" className="ml-auto">
            {errors.length} errors
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}>

            {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errors.length} image{errors.length > 1 ? 's' : ''} failed to load. 
            This may be due to network issues or broken file links.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant="outline"
            onClick={updateErrors}>

            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClearErrors}
            disabled={isClearing}>

            {isClearing ?
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> :

            <XCircle className="h-4 w-4 mr-2" />
            }
            Clear All
          </Button>
        </div>

        {isExpanded &&
        <div className="space-y-3">
            <h4 className="text-sm font-medium">Recent Errors:</h4>
            {errors.map((error, index) =>
          <div
            key={`${error.url}-${error.timestamp}-${index}`}
            className="p-3 border rounded-lg bg-red-50">

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getSeverityIcon(error.status || 0)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {error.url?.split('/').pop() || 'Unknown file'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {error.url}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                      variant="secondary"
                      className={`text-xs ${getStatusColor(error.status || 0)}`}>

                          Status: {error.status || 'Network Error'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(error.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {error.url &&
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRetryImage(error.url!)}
                className="text-xs px-2 py-1">

                      Retry
                    </Button>
              }
                </div>
                
                {error.message &&
            <p className="text-xs text-red-600 mt-2 bg-red-100 p-2 rounded">
                    {error.message}
                  </p>
            }
              </div>
          )}
          </div>
        }
      </CardContent>
    </Card>);

};

export default ImageErrorMonitor;