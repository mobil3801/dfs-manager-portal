// Enhanced file service with proper error handling and retry mechanisms
export interface FileServiceResponse<T = any> {
  data: T | null;
  error: string | null;
  retryCount?: number;
}

class FileService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;
  private urlCache = new Map<number, { url: string; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Get file URL with caching and retry logic
  async getFileUrl(fileId: number, forceRefresh = false): Promise<FileServiceResponse<string>> {
    if (!fileId || fileId <= 0) {
      return { data: null, error: 'Invalid file ID provided' };
    }

    // Check cache first
    if (!forceRefresh) {
      const cached = this.getCachedUrl(fileId);
      if (cached) {
        return { data: cached, error: null };
      }
    }

    let lastError: string | null = null;
    let retryCount = 0;

    while (retryCount < this.MAX_RETRIES) {
      try {
        console.log(`Attempting to get URL for file ${fileId} (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
        
        const response = await window.ezsite.apis.getUploadUrl(fileId);
        
        if (response.error) {
          throw new Error(response.error);
        }

        if (!response.data) {
          throw new Error('No file URL returned from server');
        }

        // Validate URL format
        const url = response.data;
        if (!this.isValidUrl(url)) {
          throw new Error('Invalid URL format received from server');
        }

        // Test URL accessibility
        const isAccessible = await this.testUrlAccessibility(url);
        if (!isAccessible) {
          throw new Error('File URL is not accessible');
        }

        // Cache the successful result
        this.cacheUrl(fileId, url);
        console.log(`Successfully retrieved and cached URL for file ${fileId}`);
        
        return { data: url, error: null, retryCount };
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error(`Attempt ${retryCount + 1} failed for file ${fileId}:`, lastError);
        
        retryCount++;
        
        if (retryCount < this.MAX_RETRIES) {
          console.log(`Retrying in ${this.RETRY_DELAY}ms...`);
          await this.delay(this.RETRY_DELAY);
        }
      }
    }

    return { 
      data: null, 
      error: lastError || 'Failed to get file URL after multiple attempts',
      retryCount 
    };
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
      return false; // If we can't test, assume it might work
    }
  }

  // Check if URL is likely an image
  private isLikelyImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const lowercaseUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowercaseUrl.includes(ext));
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
  private cacheUrl(fileId: number, url: string): void {
    this.urlCache.set(fileId, {
      url,
      timestamp: Date.now()
    });
  }

  // Get cached URL if valid
  private getCachedUrl(fileId: number): string | null {
    const cached = this.urlCache.get(fileId);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.urlCache.delete(fileId);
      return null;
    }

    return cached.url;
  }

  // Clear cache for specific file
  clearCache(fileId?: number): void {
    if (fileId) {
      this.urlCache.delete(fileId);
    } else {
      this.urlCache.clear();
    }
  }

  // Delay utility
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Preload multiple file URLs
  async preloadFileUrls(fileIds: number[]): Promise<Map<number, string>> {
    const results = new Map<number, string>();
    const promises = fileIds.map(id => this.getFileUrl(id));
    
    const responses = await Promise.allSettled(promises);
    
    responses.forEach((response, index) => {
      if (response.status === 'fulfilled' && response.value.data) {
        results.set(fileIds[index], response.value.data);
      }
    });

    return results;
  }

  // Get file info with enhanced error handling
  async getFileInfo(fileId: number): Promise<FileServiceResponse<any>> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(26928, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
          { name: 'store_file_id', op: 'Equal', value: fileId }
        ]
      });

      if (error) throw new Error(error);
      
      const fileInfo = data?.List?.[0];
      if (!fileInfo) {
        throw new Error('File not found in database');
      }

      return { data: fileInfo, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get file info'
      };
    }
  }

  // Download file with proper error handling
  async downloadFile(fileId: number, fileName?: string): Promise<FileServiceResponse<boolean>> {
    try {
      const urlResponse = await this.getFileUrl(fileId);
      if (urlResponse.error) {
        throw new Error(urlResponse.error);
      }

      const url = urlResponse.data!;
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `file_${fileId}`;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { data: true, error: null };
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Download failed'
      };
    }
  }
}

// Export singleton instance
export const fileService = new FileService();
