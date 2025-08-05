import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { Upload, User, Loader2, Edit3, Trash2, Eye, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface EnhancedEmployeeProfilePictureProps {
  employeeId: string;
  currentImageUrl?: string | null;
  employeeName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  allowEdit?: boolean;
  disabled?: boolean;
  showUploadButton?: boolean;
  onImageUpdate?: (newImageUrl: string | null) => void;
  className?: string;
}

const EnhancedEmployeeProfilePicture: React.FC<EnhancedEmployeeProfilePictureProps> = ({
  employeeId,
  currentImageUrl,
  employeeName = 'Employee',
  size = 'md',
  allowEdit = false,
  disabled = false,
  showUploadButton = false,
  onImageUpdate,
  className
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg'
  };

  const initials = employeeName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Load current profile picture
  React.useEffect(() => {
    if (employeeId && employeeId !== 'new') {
      loadCurrentProfilePicture();
    }
  }, [employeeId]);

  const loadCurrentProfilePicture = async () => {
    if (!employeeId || employeeId === 'new') return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('profile_image_url')
        .eq('id', employeeId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile picture:', error);
        return;
      }

      if (data?.profile_image_url) {
        setImageUrl(data.profile_image_url);
      }
    } catch (error) {
      console.error('Error loading profile picture:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !employeeId || employeeId === 'new') return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    await uploadProfilePicture(file);
  }, [employeeId]);

  const uploadProfilePicture = async (file: File) => {
    if (!employeeId || employeeId === 'new') {
      toast({
        title: "Cannot upload",
        description: "Please save the employee first before uploading a profile picture",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${employeeId}-${Date.now()}.${fileExt}`;
      const filePath = `employee-profiles/${fileName}`;

      // Delete old profile picture if exists
      if (imageUrl) {
        const oldPath = imageUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('employee-profiles')
            .remove([`employee-profiles/${oldPath}`]);
        }
      }

      // Upload new file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('employee-profiles')
        .getPublicUrl(filePath);

      // Update employee record
      const { error: updateError } = await supabase
        .from('employees')
        .update({ 
          profile_image_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      setImageUrl(publicUrl);
      onImageUpdate?.(publicUrl);

      toast({
        title: "Success",
        description: "Profile picture updated successfully"
      });

    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!employeeId || employeeId === 'new' || !imageUrl) return;

    try {
      setIsUploading(true);

      // Remove from storage
      const oldPath = imageUrl.split('/').pop();
      if (oldPath) {
        await supabase.storage
          .from('employee-profiles')
          .remove([`employee-profiles/${oldPath}`]);
      }

      // Update employee record
      const { error: updateError } = await supabase
        .from('employees')
        .update({ 
          profile_image_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      setImageUrl(null);
      onImageUpdate?.(null);

      toast({
        title: "Success",
        description: "Profile picture removed successfully"
      });

    } catch (error: any) {
      console.error('Error removing profile picture:', error);
      toast({
        title: "Remove failed",
        description: error.message || "Failed to remove profile picture",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (disabled || !allowEdit) return;
    fileInputRef.current?.click();
  };

  // Basic avatar display (for table view)
  if (!allowEdit && !showUploadButton) {
    return (
      <div className={cn("flex items-center", className)}>
        <Avatar className={sizeClasses[size]}>
          <AvatarImage 
            src={imageUrl || undefined} 
            alt={employeeName}
            className="object-cover"
          />
          <AvatarFallback className="bg-gray-100 text-gray-600">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center space-x-4">
        {/* Profile Picture Display */}
        <div className="relative">
          <Avatar className={cn(sizeClasses[size], "border-2 border-gray-200")}>
            {isLoading ? (
              <div className="flex items-center justify-center w-full h-full bg-gray-100">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <AvatarImage 
                  src={imageUrl || undefined} 
                  alt={employeeName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gray-100 text-gray-600">
                  {initials}
                </AvatarFallback>
              </>
            )}
          </Avatar>

          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {allowEdit && (
          <div className="flex items-center space-x-2">
            {/* Upload Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              disabled={disabled || isUploading}
              className="flex items-center space-x-1"
            >
              <Upload className="w-4 h-4" />
              <span>{imageUrl ? 'Change' : 'Upload'}</span>
            </Button>

            {/* Preview Button */}
            {imageUrl && (
              <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Profile Picture Preview</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center justify-center p-4">
                    <img 
                      src={imageUrl} 
                      alt={employeeName}
                      className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Remove Button */}
            {imageUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveProfilePicture}
                disabled={disabled || isUploading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Upload button for table view */}
        {showUploadButton && !allowEdit && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={triggerFileInput}
            disabled={disabled || isUploading}
            className="flex items-center space-x-1"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </Button>
        )}
      </div>

      {/* Status Indicators */}
      {allowEdit && (
        <div className="flex items-center space-x-2">
          {disabled && (
            <Badge variant="secondary" className="text-xs">
              Save employee first to enable upload
            </Badge>
          )}
          {isUploading && (
            <Badge className="text-xs bg-blue-500">
              Uploading...
            </Badge>
          )}
          {imageUrl && !isUploading && (
            <Badge variant="outline" className="text-xs text-green-600">
              Picture uploaded
            </Badge>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
};

export default EnhancedEmployeeProfilePicture;