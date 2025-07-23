
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
    timeout: number
  ): Promise<ImageLoadResult> {
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
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get a safe image URL that handles API proxy issues
   */
  getSafeImageUrl(imageId: number | string | null, baseUrl?: string): string | null {
    if (!imageId) return null;

    const origin = baseUrl || window.location.origin;
    
    // Handle different imageId formats
    if (typeof imageId === 'string') {
      // If it's already a complete URL, check if it's problematic
      if (imageId.startsWith('http')) {
        // Check if it's a problematic API proxy URL
        if (imageId.includes('api.ezsite.ai/file/')) {
          // Extract the actual file URL from the proxy
          const match = imageId.match(/api\.ezsite\.ai\/file\/(https?:\/\/.+)/);
          if (match) {
            return match[1]; // Return the actual file URL
          }
        }
        return imageId;
      }
      
      // If it's a file ID string, treat it as a number
      const numericId = parseInt(imageId, 10);
      if (!isNaN(numericId)) {
        return `${origin}/api/files/${numericId}?t=${Date.now()}`;
      }
    }

    if (typeof imageId === 'number' && imageId > 0) {
      return `${origin}/api/files/${imageId}?t=${Date.now()}`;
    }

    return null;
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
    const promises = urls.map(url => this.loadImage({ url }));
    return Promise.all(promises);
  }
}

export const imageErrorService = ImageErrorService.getInstance();
export type { ImageLoadOptions, ImageLoadResult };
