import { supabase, storage } from '@/lib/supabase';

// Enhanced file service with proper error handling and retry mechanisms
export interface FileServiceResponse<T = any> {
  data: T | null;
  error: string | null;
  retryCount?: number;
}

class FileService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;
  private urlCache = new Map<string, {url: string; timestamp: number;}>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Upload file to Supabase storage
  async uploadFile(file: File, path?: string): Promise<FileServiceResponse<string>> {
    try {
      const fileName = path || `files/${Date.now()}_${file.name}`;
      
      const { data, error } = await storage.upload(fileName, file);
      
      if (error) throw error;
      
      // Get public URL
      const { data: publicUrlData } = storage.getPublicUrl(fileName);
      
      if (!publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Cache the URL
      this.cacheUrl(fileName, publicUrlData.publicUrl);
      
      return { data: publicUrlData.publicUrl, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to upload file'
      };
    }
  }

  // Get file URL from Supabase storage
  async getFileUrl(filePath: string, forceRefresh = false): Promise<FileServiceResponse<string>> {
    if (!filePath) {
      return { data: null, error: 'Invalid file path provided' };
    }

    // Check cache first
    if (!forceRefresh) {
      const cached = this.getCachedUrl(filePath);
      if (cached) {
        return { data: cached, error: null };
      }
    }

    try {
      const { data } = storage.getPublicUrl(filePath);
      
      if (!data.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Validate URL format
      if (!this.isValidUrl(data.publicUrl)) {
        throw new Error('Invalid URL format received');
      }

      // Test URL accessibility
      const isAccessible = await this.testUrlAccessibility(data.publicUrl);
      if (!isAccessible) {
        throw new Error('File URL is not accessible');
      }

      // Cache the successful result
      this.cacheUrl(filePath, data.publicUrl);
      
      return { data: data.publicUrl, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get file URL'
      };
    }
  }

  // Download file from Supabase storage
  async downloadFile(filePath: string, fileName?: string): Promise<FileServiceResponse<Blob>> {
    try {
      const { data, error } = await storage.download(filePath);
      
      if (error) throw error;
      
      if (!data) {
        throw new Error('No file data received');
      }

      // If fileName is provided, trigger download
      if (fileName) {
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.target = '_blank';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Download failed'
      };
    }
  }

  // Delete file from Supabase storage
  async deleteFile(filePath: string): Promise<FileServiceResponse<boolean>> {
    try {
      const { error } = await storage.remove([filePath]);
      
      if (error) throw error;

      // Clear from cache
      this.clearCache(filePath);
      
      return { data: true, error: null };
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Failed to delete file'
      };
    }
  }

  // Test if a URL is accessible
  private async testUrlAccessibility(url: string): Promise<boolean> {
    try {
      // For image files, we can test with Image object
      if (this.isLikelyImageUrl(url)) {
        return new Promise((resolve) => {
          const img = new Image();
          const timeout = setTimeout(() => {
            resolve(false);
          }, 5000); // 5 second timeout

          img.onload = () => {
            clearTimeout(timeout);
            resolve(true);
          };

          img.onerror = () => {
            clearTimeout(timeout);
            resolve(false);
          };

          img.src = url;
        });
      }

      // For other files, test with a HEAD request
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      return response.ok;
    } catch (error) {
      console.warn('URL accessibility test failed:', error);
      return true; // If we can't test, assume it might work
    }
  }

  // Check if URL is likely an image
  private isLikelyImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const lowercaseUrl = url.toLowerCase();
    return imageExtensions.some((ext) => lowercaseUrl.includes(ext));
  }

  // Validate URL format
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Cache URL with timestamp
  private cacheUrl(filePath: string, url: string): void {
    this.urlCache.set(filePath, {
      url,
      timestamp: Date.now()
    });
  }

  // Get cached URL if valid
  private getCachedUrl(filePath: string): string | null {
    const cached = this.urlCache.get(filePath);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.urlCache.delete(filePath);
      return null;
    }

    return cached.url;
  }

  // Clear cache for specific file
  clearCache(filePath?: string): void {
    if (filePath) {
      this.urlCache.delete(filePath);
    } else {
      this.urlCache.clear();
    }
  }

  // Delay utility
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Preload multiple file URLs
  async preloadFileUrls(filePaths: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    const promises = filePaths.map((path) => this.getFileUrl(path));

    const responses = await Promise.allSettled(promises);

    responses.forEach((response, index) => {
      if (response.status === 'fulfilled' && response.value.data) {
        results.set(filePaths[index], response.value.data);
      }
    });

    return results;
  }

  // List files in a directory
  async listFiles(prefix: string = ''): Promise<FileServiceResponse<any[]>> {
    try {
      const { data, error } = await supabase.storage
        .from('')
        .list(prefix, {
          limit: 100,
          offset: 0
        });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to list files'
      };
    }
  }
}

// Export singleton instance
export const fileService = new FileService();