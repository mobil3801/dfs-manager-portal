import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Eye,
  Download,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  X,
  RefreshCw
} from 'lucide-react';

interface ImprovedIDDocumentViewerProps {
  fileId: number | null;
  label: string;
  isAdminUser?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

const ImprovedIDDocumentViewer: React.FC<ImprovedIDDocumentViewerProps> = ({
  fileId,
  label,
  isAdminUser = false,
  size = 'lg',
  className = '',
  onDelete,
  showDeleteButton = false
}) => {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isImageFile, setIsImageFile] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  // Load document URL when component mounts or fileId changes
  useEffect(() => {
    const loadDocumentUrl = async () => {
      if (!fileId) {
        setDocumentUrl(null);
        setIsImageFile(false);
        setImageLoaded(false);
        setHasError(false);
        setErrorMessage('');
        return;
      }

      setIsLoading(true);
      setHasError(false);
      setImageLoaded(false);
      setErrorMessage('');

      try {
        console.log(`[ImprovedIDDocumentViewer] Loading document URL for file ID: ${fileId}`);
        
        // Get the file URL from the API
        const { data: fileUrl, error } = await window.ezsite.apis.getUploadUrl(fileId);

        if (error) {
          console.error(`[ImprovedIDDocumentViewer] API error for file ${fileId}:`, error);
          throw new Error(error);
        }

        if (!fileUrl) {
          console.error(`[ImprovedIDDocumentViewer] No URL returned for file ${fileId}`);
          throw new Error('No file URL returned from server');
        }

        console.log(`[ImprovedIDDocumentViewer] Successfully loaded URL for file ${fileId}:`, fileUrl);
        setDocumentUrl(fileUrl);

        // Test if it's an image by trying to load it
        await testImageLoad(fileUrl);

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error(`[ImprovedIDDocumentViewer] Error loading document URL for file ${fileId}:`, err);
        setHasError(true);
        setErrorMessage(errorMsg);
        setIsLoading(false);

        // Auto-retry once after a delay for network errors
        if (retryCount < 1 && (errorMsg.includes('network') || errorMsg.includes('timeout'))) {
          setTimeout(() => {
            console.log(`[ImprovedIDDocumentViewer] Auto-retrying for file ${fileId}`);
            setRetryCount(prev => prev + 1);
          }, 2000);
        }
      }
    };

    loadDocumentUrl();
  }, [fileId, retryCount]);

  const testImageLoad = (url: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      
      // Set a timeout for image loading
      const timeout = setTimeout(() => {
        console.log(`[ImprovedIDDocumentViewer] Image load timeout for: ${url}`);
        setIsImageFile(false);
        setImageLoaded(false);
        setIsLoading(false);
        resolve();
      }, 10000); // 10 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        console.log(`[ImprovedIDDocumentViewer] File confirmed as image: ${url}`);
        setIsImageFile(true);
        setImageLoaded(true);
        setIsLoading(false);
        resolve();
      };

      img.onerror = (e) => {
        clearTimeout(timeout);
        console.log(`[ImprovedIDDocumentViewer] File is not an image or failed to load: ${url}`, e);
        setIsImageFile(false);
        setImageLoaded(false);
        setIsLoading(false);
        resolve();
      };

      // Add CORS settings for cross-origin images
      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  };

  const handleViewFullScreen = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  const handleDownload = async () => {
    if (!documentUrl || !fileId) return;

    try {
      // Create a proper download link
      const response = await fetch(documentUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${label.replace(/\s+/g, '_')}_document`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Document downloaded successfully"
      });
    } catch (error) {
      console.error('[ImprovedIDDocumentViewer] Error downloading document:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive"
      });
    }
  };

  const handleRetry = () => {
    console.log(`[ImprovedIDDocumentViewer] Manual retry triggered for file ${fileId}`);
    setRetryCount(0);
    setHasError(false);
    setErrorMessage('');
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      toast({
        title: "Document Removed",
        description: `${label} has been marked for deletion and will be permanently removed.`,
        variant: "destructive"
      });
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-24';
      case 'md': return 'h-32';
      case 'lg': return 'h-48';
      case 'xl': return 'h-80';
      default: return 'h-48';
    }
  };

  // If no file ID, don't render anything
  if (!fileId) {
    return null;
  }

  return (
    <Card className={`overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-0">
        {/* Preview Area with Enhanced Error Handling */}
        <div className={`relative w-full bg-gray-50 border-b aspect-[3/2] ${getSizeClasses()}`}>
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-600">Loading document...</span>
                {retryCount > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Retry attempt {retryCount}</p>
                )}
              </div>
            </div>
          )}

          {/* Error State with Enhanced Retry Option */}
          {hasError && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
              <div className="text-center max-w-full">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-600 mb-2">Unable to load document</p>
                <p className="text-xs text-red-500 mb-1">ID: {fileId}</p>
                {errorMessage && (
                  <p className="text-xs text-red-500 mb-3 max-w-xs mx-auto break-words">
                    {errorMessage}
                  </p>
                )}
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="bg-white hover:bg-red-50 border-red-200"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Retry Load
                  </Button>
                  {documentUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewFullScreen}
                      className="bg-white hover:bg-blue-50 border-blue-200"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Try Open
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Successful Document Display */}
          {documentUrl && !isLoading && !hasError && (
            <>
              {isImageFile && imageLoaded ? (
                <img
                  src={documentUrl}
                  alt={label}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300 cursor-pointer bg-white"
                  onClick={handleViewFullScreen}
                  onError={() => {
                    console.error(`[ImprovedIDDocumentViewer] Runtime image error for: ${documentUrl}`);
                    setHasError(true);
                    setErrorMessage('Image failed to display');
                  }}
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={handleViewFullScreen}
                >
                  <div className="text-center p-4">
                    <FileText className="w-16 h-16 text-blue-500 mx-auto mb-3" />
                    <p className="text-sm font-medium text-blue-800">Document File</p>
                    <p className="text-xs text-blue-600 mt-1">Click to view full size</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Document Label */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            {label}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex space-x-1">
            <Button
              variant="secondary"
              size="sm"
              className="h-6 w-6 p-0 bg-white bg-opacity-90 hover:bg-opacity-100 shadow-sm"
              onClick={handleViewFullScreen}
              disabled={!documentUrl}
            >
              <Eye className="w-3 h-3" />
            </Button>
            
            {isAdminUser && (
              <Button
                variant="secondary"
                size="sm"
                className="h-6 w-6 p-0 bg-green-500 bg-opacity-90 hover:bg-opacity-100 text-white shadow-sm"
                onClick={handleDownload}
                disabled={!documentUrl}
              >
                <Download className="w-3 h-3" />
              </Button>
            )}

            {showDeleteButton && (
              <Button
                variant="secondary"
                size="sm"
                className="h-6 w-6 p-0 bg-red-500 bg-opacity-90 hover:bg-opacity-100 text-white shadow-sm"
                onClick={handleDelete}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Document Info */}
        <div className="p-3 bg-white">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 truncate">
              {label}
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {isImageFile ? 'Image' : 'Document'}
              </Badge>
              {hasError && (
                <Badge variant="destructive" className="text-xs">
                  Error
                </Badge>
              )}
              {isAdminUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={handleDownload}
                  disabled={!documentUrl}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImprovedIDDocumentViewer;