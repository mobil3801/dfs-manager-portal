import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { User, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfilePictureProps {
  imageId?: number | string | null;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showFallbackIcon?: boolean;
  previewFile?: File | null; // For instant preview of uploaded files
  showLoadingState?: boolean;
  enableHover?: boolean;
  rounded?: 'full' | 'md' | 'lg' | 'xl';
  alt?: string;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  imageId,
  firstName = '',
  lastName = '',
  size = 'md',
  className = '',
  showFallbackIcon = true,
  previewFile = null,
  showLoadingState = true,
  enableHover = false,
  rounded = 'full',
  alt
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  // Create preview URL for uploaded file
  useEffect(() => {
    if (previewFile) {
      const url = URL.createObjectURL(previewFile);
      setPreviewUrl(url);
      setImageLoaded(false);
      setImageError(false);
      setIsLoading(true);

      // Cleanup URL when component unmounts or file changes
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
      setImageLoaded(false);
      setImageError(false);
      setIsLoading(false);
    }
  }, [previewFile]);

  // Reset states when imageId changes
  useEffect(() => {
    if (imageId) {
      setIsLoading(true);
      setImageLoaded(false);
      setImageError(false);
      setRetryCount(0);
    } else {
      setIsLoading(false);
      setImageLoaded(false);
      setImageError(false);
    }
  }, [imageId]);

  // Generate initials from first and last name
  const getInitials = () => {
    if (!firstName && !lastName) return 'U';

    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();

    if (firstInitial && lastInitial) {
      return `${firstInitial}${lastInitial}`;
    }

    return firstInitial || lastInitial || 'U';
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-xs';
      case 'md':
        return 'w-10 h-10 text-sm';
      case 'lg':
        return 'w-16 h-16 text-lg';
      case 'xl':
        return 'w-24 h-24 text-xl';
      case '2xl':
        return 'w-32 h-32 text-2xl';
      default:
        return 'w-10 h-10 text-sm';
    }
  };

  // Get rounded classes
  const getRoundedClasses = () => {
    switch (rounded) {
      case 'md':
        return 'rounded-md';
      case 'lg':
        return 'rounded-lg';
      case 'xl':
        return 'rounded-xl';
      case 'full':
      default:
        return 'rounded-full';
    }
  };

  // Get image URL if imageId exists
  const getImageUrl = () => {
    if (!imageId) return undefined;

    // Convert to string for consistent handling
    const imageIdStr = String(imageId);

    // Check if imageId is already a full URL
    if (imageIdStr.startsWith('http://') || imageIdStr.startsWith('https://')) {
      // If it's already a full URL, use it directly
      return imageIdStr;
    }

    // Check if it's a valid file ID (numeric)
    if (/^\d+$/.test(imageIdStr)) {
      // Add timestamp to prevent caching issues when image is updated
      const timestamp = Date.now();
      const baseUrl = window.location.origin;
      return `${baseUrl}/api/files/${imageIdStr}?t=${timestamp}`;
    }

    // If it's neither a URL nor a numeric ID, treat it as an invalid image
    return undefined;
  };

  // Determine which image to show (preview takes priority)
  const imageToShow = previewUrl || getImageUrl();

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    setIsLoading(false);
  };

  // Handle image load error with retry logic
  const handleImageError = () => {
    setImageLoaded(false);
    setIsLoading(false);

    if (retryCount < maxRetries && imageId) {
      // Retry loading the image after a short delay
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        setImageError(false);
        setIsLoading(true);
      }, 1000 + retryCount * 500); // Progressive delay
    } else {
      setImageError(true);
    }
  };

  // Handle image load start
  const handleImageLoadStart = () => {
    if (showLoadingState) {
      setIsLoading(true);
    }
  };

  // Determine if we should show fallback
  const shouldShowFallback = !imageToShow || imageError || !imageLoaded && !isLoading;

  // Get fallback icon size
  const getFallbackIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'md':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      case 'xl':
        return 'w-8 h-8';
      case '2xl':
        return 'w-12 h-12';
      default:
        return 'w-4 h-4';
    }
  };

  // Generate alt text
  const getAltText = () => {
    if (alt) return alt;
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim() || 'Profile picture';
    }
    return 'Profile picture';
  };

  const avatarClasses = cn(
    getSizeClasses(),
    getRoundedClasses(),
    'border-2 border-gray-200 transition-all duration-200',
    enableHover && 'hover:border-blue-300 hover:shadow-md cursor-pointer',
    className
  );

  const fallbackClasses = cn(
    'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 font-medium',
    'flex items-center justify-center',
    imageError && 'bg-red-50 text-red-400'
  );

  return (
    <div className="relative inline-block">
      <Avatar className={avatarClasses}>
        {/* Loading skeleton overlay */}
        {isLoading && showLoadingState &&
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full">
            <Loader2 className={cn(getFallbackIconSize(), 'animate-spin text-gray-400')} />
          </div>
        }

        {/* Main image */}
        {imageToShow &&
        <AvatarImage
          src={imageToShow}
          alt={getAltText()}
          className={cn(
            'object-cover transition-opacity duration-200',
            isLoading && showLoadingState && 'opacity-0',
            imageLoaded && 'opacity-100'
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onLoadStart={handleImageLoadStart} />


        }

        {/* Fallback content */}
        {shouldShowFallback &&
        <AvatarFallback className={fallbackClasses}>
            {imageError ?
          <div className="flex flex-col items-center justify-center space-y-1">
                <AlertCircle className={getFallbackIconSize()} />
                {size === 'xl' || size === '2xl' ?
            <span className="text-xs text-center">Error</span> :
            null}
              </div> :
          getInitials() !== 'U' ?
          <span className="font-semibold tracking-wider">
                {getInitials()}
              </span> :
          showFallbackIcon ?
          <User className={getFallbackIconSize()} /> :

          <span className="font-semibold">U</span>
          }
          </AvatarFallback>
        }
      </Avatar>

      {/* Loading indicator for large sizes */}
      {isLoading && showLoadingState && (size === 'xl' || size === '2xl') &&
      <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
          <Loader2 className="w-3 h-3 animate-spin text-white" />
        </div>
      }

      {/* Error indicator */}
      {imageError && (size === 'xl' || size === '2xl') &&
      <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1">
          <AlertCircle className="w-3 h-3 text-white" />
        </div>
      }

      {/* Preview indicator */}
      {previewFile &&
      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
        </div>
      }
    </div>);

};

export default ProfilePicture;