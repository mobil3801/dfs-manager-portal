
import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { imageErrorService, type ImageLoadResult } from '@/services/imageErrorService';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | number | null;
  fallbackSrc?: string;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  showLoader?: boolean;
  showErrorIcon?: boolean;
  loadingClassName?: string;
  errorClassName?: string;
  onLoadSuccess?: (url: string) => void;
  onLoadError?: (error: string, retryCount: number) => void;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = '',
  className = '',
  fallbackSrc,
  maxRetries = 2,
  retryDelay = 1000,
  timeout = 10000,
  showLoader = true,
  showErrorIcon = true,
  loadingClassName = '',
  errorClassName = '',
  onLoadSuccess,
  onLoadError,
  ...props
}) => {
  const [imageState, setImageState] = useState<{
    status: 'loading' | 'success' | 'error';
    url?: string;
    error?: string;
    retryCount?: number;
  }>({ status: 'loading' });

  useEffect(() => {
    if (!src) {
      setImageState({ 
        status: 'error', 
        error: 'No image source provided' 
      });
      return;
    }

    const loadImage = async () => {
      setImageState({ status: 'loading' });

      try {
        // Get safe URL from the service
        const safeUrl = imageErrorService.getSafeImageUrl(src);
        
        if (!safeUrl) {
          setImageState({ 
            status: 'error', 
            error: 'Invalid image source' 
          });
          return;
        }

        // Load image with error handling
        const result: ImageLoadResult = await imageErrorService.loadImage({
          url: safeUrl,
          maxRetries,
          retryDelay,
          timeout
        });

        if (result.success && result.url) {
          setImageState({ 
            status: 'success', 
            url: result.url,
            retryCount: result.retryCount 
          });
          
          if (onLoadSuccess) {
            onLoadSuccess(result.url);
          }
        } else {
          setImageState({ 
            status: 'error', 
            error: result.error || 'Failed to load image',
            retryCount: result.retryCount 
          });
          
          if (onLoadError) {
            onLoadError(result.error || 'Failed to load image', result.retryCount || 0);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setImageState({ 
          status: 'error', 
          error: errorMessage 
        });
        
        if (onLoadError) {
          onLoadError(errorMessage, 0);
        }
      }
    };

    loadImage();
  }, [src, maxRetries, retryDelay, timeout, onLoadSuccess, onLoadError]);

  // Loading state
  if (imageState.status === 'loading') {
    if (!showLoader) return null;
    
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className,
          loadingClassName
        )}
        {...props}
      >
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  // Error state
  if (imageState.status === 'error') {
    // Try fallback image first
    if (fallbackSrc && fallbackSrc !== src) {
      return (
        <SafeImage
          {...props}
          src={fallbackSrc}
          className={className}
          fallbackSrc={undefined} // Prevent infinite fallback loop
          showLoader={showLoader}
          showErrorIcon={showErrorIcon}
          onLoadSuccess={onLoadSuccess}
          onLoadError={onLoadError}
        />
      );
    }

    // Show error state
    if (!showErrorIcon) return null;
    
    return (
      <div 
        className={cn(
          'flex flex-col items-center justify-center bg-red-50 text-red-400 p-4',
          className,
          errorClassName
        )}
        title={`Image load error: ${imageState.error}`}
        {...props}
      >
        <AlertCircle className="w-6 h-6 mb-1" />
        <span className="text-xs text-center">
          Failed to load
          {imageState.retryCount !== undefined && imageState.retryCount > 0 && (
            <span className="block text-xs opacity-75">
              (Retried {imageState.retryCount} times)
            </span>
          )}
        </span>
      </div>
    );
  }

  // Success state
  return (
    <img
      {...props}
      src={imageState.url}
      alt={alt}
      className={cn(className)}
      onError={(e) => {
        // Handle runtime errors (e.g., network issues after initial load)
        console.error('Runtime image error:', e);
        setImageState({ 
          status: 'error', 
          error: 'Runtime image error' 
        });
      }}
    />
  );
};

export default SafeImage;
