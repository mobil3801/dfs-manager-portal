import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ProductImageUploadProps {
  productId?: string;
  currentImageUrl?: string;
  onImageUploaded?: (imageUrl: string) => void;
  onImageRemoved?: () => void;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  productId,
  currentImageUrl,
  onImageUploaded,
  onImageRemoved
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 5MB."
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an image file."
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !productId) return null;

    setIsUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `product-${productId}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('')
        .upload(filePath, imageFile);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('')
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;
      
      if (onImageUploaded) {
        onImageUploaded(imageUrl);
      }

      toast({
        title: "Success",
        description: "Image uploaded successfully."
      });

      return imageUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  return (
    <div className="space-y-4">
      <Label>Product Image</Label>
      
      {/* Current/Preview Image */}
      {imagePreview && (
        <div className="relative inline-block">
          <img
            src={imagePreview}
            alt="Product preview"
            className="w-32 h-32 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Upload Controls */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="product-image-upload"
          />
          <Label
            htmlFor="product-image-upload"
            className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <Upload className="w-4 h-4 mr-2" />
            Choose Image
          </Label>
        </div>

        {imageFile && productId && (
          <Button
            type="button"
            onClick={uploadImage}
            disabled={isUploading}
            size="sm">
            {isUploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </>
            )}
          </Button>
        )}
      </div>

      {/* Upload Instructions */}
      <p className="text-sm text-gray-500">
        Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
      </p>
    </div>
  );
};

export default ProductImageUpload;