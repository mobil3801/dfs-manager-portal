import { supabase, storage } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface UploadResult {
  success: boolean;
  filePath?: string;
  publicUrl?: string;
  error?: string;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

class SupabaseStorageService {
  private bucketName: string;

  constructor(bucketName: string = 'dfs-files') {
    this.bucketName = bucketName;
  }

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    file: File, 
    folder: string = 'general',
    options?: {
      upsert?: boolean;
      customFileName?: string;
    }
  ): Promise<UploadResult> {
    try {
      const fileName = options?.customFileName || this.generateFileName(file);
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await storage.upload(
        this.bucketName, 
        filePath, 
        file
      );

      if (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Upload Failed',
          description: error.message,
          variant: 'destructive'
        });
        return { success: false, error: error.message };
      }

      const publicUrl = storage.getPublicUrl(this.bucketName, filePath).publicUrl;

      toast({
        title: 'Upload Successful',
        description: `File uploaded successfully`
      });

      return {
        success: true,
        filePath,
        publicUrl
      };
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error?.message || 'Failed to upload file';
      
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    folder: string = 'general'
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadFile(file, folder);
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (successCount > 0) {
      toast({
        title: 'Upload Complete',
        description: `${successCount} files uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ''}`
      });
    }

    return results;
  }

  /**
   * Download a file from Supabase Storage
   */
  async downloadFile(filePath: string): Promise<Blob | null> {
    try {
      const { data, error } = await storage.download(this.bucketName, filePath);

      if (error) {
        console.error('Download error:', error);
        toast({
          title: 'Download Failed',
          description: error.message,
          variant: 'destructive'
        });
        return null;
      }

      return data;
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: error?.message || 'Failed to download file',
        variant: 'destructive'
      });
      return null;
    }
  }

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await storage.delete(this.bucketName, [filePath]);

      if (error) {
        console.error('Delete error:', error);
        toast({
          title: 'Delete Failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      toast({
        title: 'File Deleted',
        description: 'File deleted successfully'
      });

      return true;
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete Failed',
        description: error?.message || 'Failed to delete file',
        variant: 'destructive'
      });
      return false;
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultipleFiles(filePaths: string[]): Promise<boolean> {
    try {
      const { error } = await storage.delete(this.bucketName, filePaths);

      if (error) {
        console.error('Delete error:', error);
        toast({
          title: 'Delete Failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      toast({
        title: 'Files Deleted',
        description: `${filePaths.length} files deleted successfully`
      });

      return true;
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete Failed',
        description: error?.message || 'Failed to delete files',
        variant: 'destructive'
      });
      return false;
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(filePath: string): string {
    return storage.getPublicUrl(this.bucketName, filePath).publicUrl;
  }

  /**
   * Upload employee documents
   */
  async uploadEmployeeDocument(
    employeeId: string,
    file: File,
    documentType: string
  ): Promise<UploadResult> {
    const folder = `employees/${employeeId}`;
    const customFileName = `${documentType}_${Date.now()}.${file.name.split('.').pop()}`;
    
    return this.uploadFile(file, folder, { customFileName });
  }

  /**
   * Upload sales report documents/receipts
   */
  async uploadSalesDocument(
    reportId: string,
    file: File,
    documentType: string = 'receipt'
  ): Promise<UploadResult> {
    const folder = `sales-reports/${reportId}`;
    const customFileName = `${documentType}_${Date.now()}.${file.name.split('.').pop()}`;
    
    return this.uploadFile(file, folder, { customFileName });
  }

  /**
   * Upload delivery documents/invoices
   */
  async uploadDeliveryDocument(
    deliveryId: string,
    file: File,
    documentType: string = 'invoice'
  ): Promise<UploadResult> {
    const folder = `deliveries/${deliveryId}`;
    const customFileName = `${documentType}_${Date.now()}.${file.name.split('.').pop()}`;
    
    return this.uploadFile(file, folder, { customFileName });
  }

  /**
   * Upload license documents
   */
  async uploadLicenseDocument(
    licenseId: string,
    file: File,
    documentType: string = 'license'
  ): Promise<UploadResult> {
    const folder = `licenses/${licenseId}`;
    const customFileName = `${documentType}_${Date.now()}.${file.name.split('.').pop()}`;
    
    return this.uploadFile(file, folder, { customFileName });
  }

  /**
   * Upload profile pictures
   */
  async uploadProfilePicture(
    userId: string,
    file: File
  ): Promise<UploadResult> {
    const folder = `profiles`;
    const customFileName = `${userId}_profile.${file.name.split('.').pop()}`;
    
    return this.uploadFile(file, folder, { customFileName, upsert: true });
  }

  /**
   * Generate a unique filename
   */
  private generateFileName(file: File): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    return `${timestamp}_${random}.${extension}`;
  }

  /**
   * Validate file size and type
   */
  validateFile(
    file: File,
    options: {
      maxSize?: number; // in bytes
      allowedTypes?: string[];
    } = {}
  ): { valid: boolean; error?: string } {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = [] } = options; // Default 10MB

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
      };
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Compress image before upload
   */
  async compressImage(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const { width, height } = img;
        const maxDimension = 1920;
        
        let newWidth = width;
        let newHeight = height;
        
        if (width > maxDimension || height > maxDimension) {
          const aspectRatio = width / height;
          if (width > height) {
            newWidth = maxDimension;
            newHeight = maxDimension / aspectRatio;
          } else {
            newHeight = maxDimension;
            newWidth = maxDimension * aspectRatio;
          }
        }
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
}

// Export service instances for different buckets/purposes
export const fileStorageService = new SupabaseStorageService('dfs-files');
export const imageStorageService = new SupabaseStorageService('dfs-images');
export const documentStorageService = new SupabaseStorageService('dfs-documents');

export default SupabaseStorageService;