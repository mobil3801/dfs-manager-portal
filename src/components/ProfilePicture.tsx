import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface ProfilePictureProps {
  imageId?: number | null;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallbackIcon?: boolean;
  previewFile?: File | null; // For instant preview of uploaded files
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  imageId,
  firstName = '',
  lastName = '',
  size = 'md',
  className = '',
  showFallbackIcon = true,
  previewFile = null
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Create preview URL for uploaded file
  useEffect(() => {
    if (previewFile) {
      const url = URL.createObjectURL(previewFile);
      setPreviewUrl(url);
      setImageLoaded(false);
      setImageError(false);

      // Cleanup URL when component unmounts or file changes
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
      setImageLoaded(false);
      setImageError(false);
    }
  }, [previewFile]);

  // Reset states when imageId changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [imageId]);

  // Generate initials from first and last name
  const getInitials = () => {
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}` || 'U';
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
      default:
        return 'w-10 h-10 text-sm';
    }
  };

  // Get image URL if imageId exists
  const getImageUrl = () => {
    if (!imageId) return undefined;
    // Add timestamp to prevent caching issues when image is updated
    return `${window.location.origin}/api/files/${imageId}?t=${Date.now()}`;
  };

  // Determine which image to show (preview takes priority)
  const imageToShow = previewUrl || getImageUrl();

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Handle image load error
  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
  };

  // Determine if we should show fallback
  const shouldShowFallback = !imageToShow || imageError || !imageLoaded;

  return (
    <Avatar className={`${getSizeClasses()} ${className}`}>
      {imageToShow &&
      <AvatarImage
        src={imageToShow}
        alt={`${firstName} ${lastName}`.trim() || 'Profile picture'}
        className="object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError} />


      }
      
      {/* Only show fallback when no image is available or image failed to load */}
      {shouldShowFallback &&
      <AvatarFallback
        className="bg-gray-100 text-gray-600 font-medium">


          {getInitials() !== 'U' ?
        getInitials() :
        showFallbackIcon ?
        <User
          className={
          size === 'sm' ? 'w-4 h-4' :
          size === 'lg' ? 'w-8 h-8' :
          size === 'xl' ? 'w-12 h-12' :
          'w-5 h-5'
          } /> :



        'U'
        }
        </AvatarFallback>
      }
    </Avatar>);

};

export default ProfilePicture;