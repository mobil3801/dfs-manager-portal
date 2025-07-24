
import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { imageErrorService } from '@/services/imageErrorService';
import { cn } from '@/lib/utils';

interface ImageLoadingFallbackProps {
  src: string | number | null;
  alt?: string;
  className?: string;
  fallbackText?: string;
  showRetry?: boolean;
  onRetrySuccess?: (url: string) => void;
  onRetryFailed?: (error: string) => void;
}

const ImageLoadingFallback: React.FC<ImageLoadingFallbackProps> = ({
  src,
  alt = 'Image',
  className = '',
  fallbackText = 'Failed to load image',
  showRetry = true,
  onRetrySuccess,
  onRetryFailed
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for global image fallback events
    const handleImageFallback = (event: CustomEvent) => {
      const { originalUrl, fallbackUrl } = event.detail;
      const currentUrl = imageErrorService.getSafeImageUrl(src);

      if (currentUrl === originalUrl) {
        console.log('Received fallback suggestion:', fallbackUrl);
        setImageUrl(fallbackUrl);
        if (onRetrySuccess) {
          onRetrySuccess(fallbackUrl);
        }
      }
    };

    window.addEventListener('imageFallback', handleImageFallback as EventListener);
    return () => {
      window.removeEventListener('imageFallback', handleImageFallback as EventListener);
    };
  }, [src, onRetrySuccess]);

  const handleRetry = async () => {
    if (!src) return;

    setIsRetrying(true);
    setError(null);

    try {
      const safeUrl = imageErrorService.getSafeImageUrl(src);
      if (!safeUrl) {
        throw new Error('Invalid image source');
      }

      // Clear cache for this URL first
      imageErrorService.clearCache(safeUrl);

      const result = await imageErrorService.loadImage({
        url: safeUrl,
        maxRetries: 2,
        retryDelay: 1000
      });

      if (result.success && result.url) {
        setImageUrl(result.url);
        setRetryCount((prev) => prev + 1);
        if (onRetrySuccess) {
          onRetrySuccess(result.url);
        }
      } else {
        const errorMsg = result.error || 'Failed to load image';
        setError(errorMsg);
        if (onRetryFailed) {
          onRetryFailed(errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Network error';
      setError(errorMsg);
      if (onRetryFailed) {
        onRetryFailed(errorMsg);
      }
    } finally {
      setIsRetrying(false);
    }
  };

  // If we successfully loaded or got a fallback URL, render the image
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={cn('transition-opacity duration-200', className)}
        onError={() => {
          setImageUrl(null);
          setError('Image failed to load after retry');
        }} />);


  }

  // Render fallback UI
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-lg',
      'text-gray-500 text-center space-y-3',
      className
    )}>
      <AlertCircle className="w-12 h-12 text-gray-400" />
      
      <div className="space-y-2">
        <p className="text-sm font-medium">{fallbackText}</p>
        {error &&
        <p className="text-xs text-red-500">{error}</p>
        }
        {retryCount > 0 &&
        <p className="text-xs text-gray-400">
            Attempted {retryCount} time{retryCount > 1 ? 's' : ''}
          </p>
        }
      </div>

      {showRetry &&
      <Button
        variant="outline"
        size="sm"
        onClick={handleRetry}
        disabled={isRetrying}
        className="mt-2">

          {isRetrying ?
        <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Retrying...
            </> :

        <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </>
        }
        </Button>
      }

      {!showRetry &&
      <Alert className="mt-2">
          <ImageIcon className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Image cannot be displayed. Please contact support if this issue persists.
          </AlertDescription>
        </Alert>
      }
    </div>);

};

export default ImageLoadingFallback;