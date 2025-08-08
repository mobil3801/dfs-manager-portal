
import { supabase } from '@/lib/supabase';

/**
 * Service for handling image loading errors with fallbacks and retry mechanisms
 */

interface ImageLoadOptions {
  url: string;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  fallbackImage?: string;
}

interface ImageLoadResult {
  success: boolean;
  url?: string;
  error?: string;
  retryCount?: number;
}

class ImageErrorService {
  private static instance: ImageErrorService;
  private cache = new Map<string, ImageLoadResult>();
  private loadingPromises = new Map<string, Promise<ImageLoadResult>>();

  static getInstance(): ImageErrorService {
    if (!ImageErrorService.instance) {
      ImageErrorService.instance = new ImageErrorService();
    }
    return ImageErrorService.instance;
  }

  /**
   * Load image with error handling and retry mechanism
   */
  async loadImage(options: ImageLoadOptions): Promise<ImageLoadResult> {
    const { url, maxRetries = 3, retryDelay = 1000, timeout = 10000 } = options;

    // Check cache first
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Start loading
    const loadPromise = this.attemptImageLoad(url, maxRetries, retryDelay, timeout);
    this.loadingPromises.set(url, loadPromise);

    try {
      const result = await loadPromise;
      this.cache.set(url, result);
      return result;
    } finally {
      this.loadingPromises.delete(url);
    }
  }

  private async attemptImageLoad(
  url: string,
  maxRetries: number,
  retryDelay: number,
  timeout: number)
  : Promise<ImageLoadResult> {
    let lastError: string = '';

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.loadSingleImage(url, timeout);
        if (result.success) {
          return { ...result, retryCount: attempt };
        }
        lastError = result.error || 'Unknown error';
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Network error';
      }

      // Wait before retry (except on last attempt)
      if (attempt < maxRetries) {
        await this.delay(retryDelay * (attempt + 1));
      }
    }

    return {
      success: false,
      error: `Failed to load image after ${maxRetries + 1} attempts: ${lastError}`,
      retryCount: maxRetries + 1
    };
  }

  private loadSingleImage(url: string, timeout: number): Promise<ImageLoadResult> {
    return new Promise((resolve) => {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        resolve({
          success: false,
          error: 'Image load timeout'
        });
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        resolve({
          success: true,
          url: url
        });
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        resolve({
          success: false,
          error: 'Image failed to load'
        });
      };

      img.src = url;
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get safe image URL, handling Supabase Storage and legacy URLs
   */
  getSafeImageUrl(imageId: number | string | null, baseUrl?: string): string | null {
    if (!imageId) return null;

    // Handle different imageId formats
    if (typeof imageId === 'string') {
      // If it's already a complete URL, check if it's problematic
      if (imageId.startsWith('http')) {
        // Check if it's a legacy EZSite proxy URL that needs conversion
        if (imageId.includes('api.ezsite.ai/file/')) {
          // Extract the actual file URL from the proxy
          const match = imageId.match(/api\.ezsite\.ai\/file\/(https?:\/\/.+)/);
          if (match) {
            return match[1]; // Return the actual file URL
          }
        }
        return imageId;
      }

      // If it's a Supabase Storage path, get public URL
      if (imageId.includes('/')) {
        const { data } = supabase.storage.from('documents').getPublicUrl(imageId);
        return data.publicUrl;
      }

      // If it's a file ID string, treat it as a number for legacy support
      const numericId = parseInt(imageId, 10);
      if (!isNaN(numericId)) {
        // Return placeholder for now - would need async call to get from Supabase
        return `/api/files/${numericId}?t=${Date.now()}`;
      }
    }

    if (typeof imageId === 'number' && imageId > 0) {
      // Return placeholder for now - would need async call to get from Supabase
      return `/api/files/${imageId}?t=${Date.now()}`;
    }

    return null;
  }

  /**
   * Get image URL from Supabase file record (async version)
   */
  async getImageUrlFromFileRecord(fileId: number): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('file_uploads')
        .select('file_path, bucket_name')
        .eq('id', fileId)
        .single();

      if (error || !data) {
        return null;
      }

      const bucket = data.bucket_name || 'documents';
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.file_path);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error getting file URL from record:', error);
      return null;
    }
  }

  /**
   * Upload file to Supabase Storage
   */
  async uploadFile(file: File, path: string, bucket: string = 'documents'): Promise<{ url: string | null; error: string | null }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        return { url: null, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      
      // Record file upload in database
      const { error: dbError } = await supabase
        .from('file_uploads')
        .insert({
          file_name: path.split('/').pop(),
          original_name: file.name,
          file_path: path,
          file_size: file.size,
          file_type: file.type,
          mime_type: file.type,
          bucket_name: bucket
        });

      if (dbError) {
        console.warn('Failed to record file upload in database:', dbError);
      }

      return { url: urlData.publicUrl, error: null };
    } catch (error) {
      return { url: null, error: error instanceof Error ? error.message : 'Upload failed' };
    }
  }

  /**
   * Get fallback image URL
   */
  getFallbackImageUrl(): string {
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f3f4f6"/>
        <circle cx="100" cy="80" r="25" fill="#d1d5db"/>
        <path d="M65 120 Q100 95 135 120 L135 160 Q100 135 65 160 Z" fill="#d1d5db"/>
      </svg>
    `)}`;
  }

  /**
   * Clear cache for a specific URL or all URLs
   */
  clearCache(url?: string): void {
    if (url) {
      this.cache.delete(url);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Preload images
   */
  async preloadImages(urls: string[]): Promise<ImageLoadResult[]> {
    const promises = urls.map((url) => this.loadImage({ url }));
    return Promise.all(promises);
  }
}

export const imageErrorService = ImageErrorService.getInstance();
export type { ImageLoadOptions, ImageLoadResult };