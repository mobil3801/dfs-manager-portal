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
  RefreshCw,
  ExternalLink,
  CheckCircle } from
'lucide-react';

interface EnhancedLiveIDDocumentViewerProps {
  fileId: number | null;
  label: string;
  isAdminUser?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onDelete?: () => void;
  showDeleteButton?: boolean;
  documentType?: string;
}

const EnhancedLiveIDDocumentViewer: React.FC<EnhancedLiveIDDocumentViewerProps> = ({
  fileId,
  label,
  isAdminUser = false,
  size = 'lg',
  className = '',
  onDelete,
  showDeleteButton = false,
  documentType = 'Document'
}) => {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isImageFile, setIsImageFile] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [urlValidated, setUrlValidated] = useState(false);
  const { toast } = useToast();

  // Format document ID for display
  const getDisplayId = () => {
    try {
      if (!fileId || fileId === null || fileId === undefined) {
        return 'No ID';
      }
      // Format the file ID properly for display
      return `ID: ${fileId}`;
    } catch (error) {
      console.error('[EnhancedLiveIDDocumentViewer] Error in getDisplayId:', error);
      return 'ID: Error';
    }
  };

  // Get clean document name for display
  const getCleanDocumentName = () => {
    try {
      if (!label || typeof label !== 'string') {
        return `${documentType} ${fileId || 'Unknown'}`;
      }

      // Remove any URLs or file extensions from the label
      let cleanName = label.replace(/https?:\/\/[^\s]+/g, '').trim();
      cleanName = cleanName.replace(/\.(jpg|jpeg|png|gif|pdf|doc|docx)$/i, '');

      if (!cleanName) {
        return `${documentType} ${fileId || 'Unknown'}`;
      }

      return cleanName;
    } catch (error) {
      console.error('[EnhancedLiveIDDocumentViewer] Error in getCleanDocumentName:', error);
      return `${documentType} Document`;
    }
  };

  // Load document URL when component mounts or fileId changes
  useEffect(() => {
    const loadDocumentUrl = async () => {
      if (!fileId) {
        setDocumentUrl(null);
        setIsImageFile(false);
        setImageLoaded(false);
        setHasError(false);
        setErrorMessage('');
        setUrlValidated(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);
      setImageLoaded(false);
      setErrorMessage('');
      setUrlValidated(false);

      try {
        console.log(`[EnhancedLiveIDDocumentViewer] Loading document URL for file ID: ${fileId}`);

        // Get the file URL from the API with enhanced error handling
        const response = (await Promise.race([
        window.ezsite.apis.getUploadUrl(fileId),
        new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 15000)
        )]
        )) as {data: string;error: string;};

        const { data: fileUrl, error } = response;

        if (error) {
          console.error(`[EnhancedLiveIDDocumentViewer] API error for file ${fileId}:`, error);
          throw new Error(`API Error: ${error}`);
        }

        if (!fileUrl || fileUrl.trim() === '') {
          console.error(`[EnhancedLiveIDDocumentViewer] No URL returned for file ${fileId}`);
          throw new Error('No file URL returned from server');
        }

        console.log(`[EnhancedLiveIDDocumentViewer] Successfully loaded URL for file ${fileId}:`, fileUrl);
        setDocumentUrl(fileUrl);
        setUrlValidated(true);

        // Test if it's an image and validate the URL
        await validateAndTestImage(fileUrl);

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error(`[EnhancedLiveIDDocumentViewer] Error loading document URL for file ${fileId}:`, err);
        setHasError(true);
        setErrorMessage(errorMsg);
        setIsLoading(false);

        // Auto-retry logic with exponential backoff
        if (retryCount < 2) {
          const retryDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          setTimeout(() => {
            console.log(`[EnhancedLiveIDDocumentViewer] Auto-retrying for file ${fileId} (attempt ${retryCount + 1})`);
            setRetryCount((prev) => prev + 1);
          }, retryDelay);
        }
      }
    };

    loadDocumentUrl();
  }, [fileId, retryCount]);

  const validateAndTestImage = async (url: string): Promise<void> => {
    return new Promise((resolve) => {
      // First, validate the URL format
      try {
        new URL(url);
      } catch {
        console.log(`[EnhancedLiveIDDocumentViewer] Invalid URL format: ${url}`);
        setIsImageFile(false);
        setImageLoaded(false);
        setIsLoading(false);
        resolve();
        return;
      }

      const img = new Image();
      const timeout = setTimeout(() => {
        console.log(`[EnhancedLiveIDDocumentViewer] Image load timeout for: ${url}`);
        setIsImageFile(false);
        setImageLoaded(false);
        setIsLoading(false);
        resolve();
      }, 8000);

      img.onload = () => {
        clearTimeout(timeout);
        console.log(`[EnhancedLiveIDDocumentViewer] File confirmed as image: ${url}`);
        setIsImageFile(true);
        setImageLoaded(true);
        setIsLoading(false);
        resolve();
      };

      img.onerror = (e) => {
        clearTimeout(timeout);
        console.log(`[EnhancedLiveIDDocumentViewer] File is not an image or failed to load: ${url}`, e);
        setIsImageFile(false);
        setImageLoaded(false);
        setIsLoading(false);
        resolve();
      };

      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  };

  const handleViewFullScreen = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = async () => {
    if (!documentUrl || !fileId) return;

    try {
      setIsLoading(true);

      const response = await fetch(documentUrl, {
        method: 'GET',
        headers: {
          'Accept': '*/*'
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${getCleanDocumentName().replace(/\s+/g, '_')}_${fileId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Document downloaded successfully"
      });
    } catch (error) {
      console.error('[EnhancedLiveIDDocumentViewer] Error downloading document:', error);
      toast({
        title: "Download Error",
        description: "Failed to download document. Please try opening it in a new tab.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    console.log(`[EnhancedLiveIDDocumentViewer] Manual retry triggered for file ${fileId}`);
    setRetryCount(0);
    setHasError(false);
    setErrorMessage('');
    setUrlValidated(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      toast({
        title: "Document Removed",
        description: `${getCleanDocumentName()} has been marked for deletion.`,
        variant: "destructive"
      });
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':return 'h-24';
      case 'md':return 'h-32';
      case 'lg':return 'h-48';
      case 'xl':return 'h-80';
      default:return 'h-48';
    }
  };

  // If no file ID, don't render anything
  if (!fileId) {
    return null;
  }

  return (
    <Card className={`overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-0">
        {/* Document Type Header */}
        <div className="bg-blue-50 border-b border-blue-200 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Document Type: {documentType}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {urlValidated &&
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              }
              <Badge variant="outline" className="text-xs">
                {getDisplayId()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className={`relative w-full bg-gray-50 border-b ${getSizeClasses()}`}>
          {/* Loading State */}
          {isLoading &&
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                <span className="text-sm text-gray-600">Loading document...</span>
                {retryCount > 0 &&
              <p className="text-xs text-gray-500 mt-1">Retry attempt {retryCount}</p>
              }
              </div>
            </div>
          }

          {/* Error State */}
          {hasError && !isLoading &&
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
              <div className="text-center max-w-full">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-600 mb-2">Unable to load document</p>
                <p className="text-xs text-red-500 mb-1">{getDisplayId()}</p>
                {errorMessage &&
              <p className="text-xs text-red-500 mb-3 max-w-xs mx-auto break-words">
                    {errorMessage}
                  </p>
              }
                <div className="flex flex-col space-y-2">
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="bg-white hover:bg-red-50 border-red-200">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Retry Load
                  </Button>
                  {documentUrl &&
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewFullScreen}
                  className="bg-white hover:bg-blue-50 border-blue-200">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Try Open
                    </Button>
                }
                </div>
              </div>
            </div>
          }

          {/* Successful Document Display */}
          {documentUrl && !isLoading && !hasError &&
          <>
              {isImageFile && imageLoaded ?
            <img
              src={documentUrl}
              alt={getCleanDocumentName()}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300 cursor-pointer bg-white"
              onClick={handleViewFullScreen}
              onError={() => {
                console.error(`[EnhancedLiveIDDocumentViewer] Runtime image error for: ${documentUrl}`);
                setHasError(true);
                setErrorMessage('Image failed to display');
              }} /> :


            <div
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={handleViewFullScreen}>
                  <div className="text-center p-4">
                    <FileText className="w-16 h-16 text-blue-500 mx-auto mb-3" />
                    <p className="text-sm font-medium text-blue-800">Document File</p>
                    <p className="text-xs text-blue-600 mt-1">Click to view full size</p>
                  </div>
                </div>
            }
            </>
          }

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex space-x-1">
            <Button
              variant="secondary"
              size="sm"
              className="h-6 w-6 p-0 bg-white bg-opacity-90 hover:bg-opacity-100 shadow-sm"
              onClick={handleViewFullScreen}
              disabled={!documentUrl}>
              <Eye className="w-3 h-3" />
            </Button>
            
            {isAdminUser &&
            <Button
              variant="secondary"
              size="sm"
              className="h-6 w-6 p-0 bg-green-500 bg-opacity-90 hover:bg-opacity-100 text-white shadow-sm"
              onClick={handleDownload}
              disabled={!documentUrl || isLoading}>
                <Download className="w-3 h-3" />
              </Button>
            }

            {showDeleteButton &&
            <Button
              variant="secondary"
              size="sm"
              className="h-6 w-6 p-0 bg-red-500 bg-opacity-90 hover:bg-opacity-100 text-white shadow-sm"
              onClick={handleDelete}>
                <X className="w-3 h-3" />
              </Button>
            }
          </div>
        </div>

        {/* Document Info */}
        <div className="p-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getCleanDocumentName()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {getDisplayId()}
              </p>
            </div>
            <div className="flex items-center space-x-2 ml-2">
              <Badge variant="outline" className="text-xs">
                {isImageFile ? 'Image' : 'Document'}
              </Badge>
              {hasError &&
              <Badge variant="destructive" className="text-xs">
                  Error
                </Badge>
              }
              {urlValidated && !hasError &&
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  ✓ Live
                </Badge>
              }
              {isAdminUser &&
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={handleDownload}
                disabled={!documentUrl || isLoading}>
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>);

};

export default EnhancedLiveIDDocumentViewer;