import React, { useState, useEffect, useCallback } from 'react';
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
  CheckCircle,
  WifiOff,
  Wifi } from
'lucide-react';

interface RobustIDDocumentViewerProps {
  fileId: number | null;
  label: string;
  isAdminUser?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onDelete?: () => void;
  showDeleteButton?: boolean;
  documentType?: string;
  onRetrySuccess?: () => void;
}

const RobustIDDocumentViewer: React.FC<RobustIDDocumentViewerProps> = ({
  fileId,
  label,
  isAdminUser = false,
  size = 'lg',
  className = '',
  onDelete,
  showDeleteButton = false,
  documentType = 'Document',
  onRetrySuccess
}) => {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isImageFile, setIsImageFile] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [urlValidated, setUrlValidated] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const { toast } = useToast();

  // Format document ID for display
  const getDisplayId = () => {
    if (!fileId) return 'No ID';
    return `ID: ${fileId}`;
  };

  // Get clean document name for display
  const getCleanDocumentName = () => {
    let cleanName = label.replace(/https?:\/\/[^\s]+/g, '').trim();
    cleanName = cleanName.replace(/\.(jpg|jpeg|png|gif|pdf|doc|docx)$/i, '');

    if (!cleanName) {
      return `${documentType} ${fileId}`;
    }

    return cleanName;
  };

  // Test API connection
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      // Simple test to check if APIs are accessible
      const testResponse = (await Promise.race([
      globalThis.ezsite.apis.tablePage('26928', {
        PageNo: 1,
        PageSize: 1,
        Filters: []
      }),
      new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout')), 3000)
      )]
      )) as {error?: string;};

      const isConnected = !testResponse.error;
      setConnectionStatus(isConnected ? 'connected' : 'error');
      return isConnected;
    } catch (error) {
      console.error('[RobustIDDocumentViewer] Connection test failed:', error);
      setConnectionStatus('error');
      return false;
    }
  }, []);

  // Enhanced file URL loading with multiple strategies
  const loadDocumentUrl = useCallback(async (attemptNumber: number = 0): Promise<void> => {
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
      console.log(`[RobustIDDocumentViewer] Loading document URL for file ID: ${fileId} (attempt ${attemptNumber + 1})`);

      // First, test connection if unknown
      if (connectionStatus === 'unknown') {
        await testConnection();
      }

      // Strategy 1: Direct API call with timeout
      let response;
      try {
        response = (await Promise.race([
        globalThis.ezsite.apis.getUploadUrl(fileId),
        new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API request timeout')), 10000)
        )]
        )) as {data: string;error: string;};
      } catch (timeoutError) {
        console.warn(`[RobustIDDocumentViewer] Strategy 1 failed (timeout):`, timeoutError);
        throw new Error('Request timeout - please check your connection');
      }

      const { data: fileUrl, error } = response;

      if (error) {
        console.error(`[RobustIDDocumentViewer] API error for file ${fileId}:`, error);

        // Strategy 2: Try alternative approach via file_uploads table
        if (attemptNumber === 0) {
          console.log(`[RobustIDDocumentViewer] Trying alternative strategy for file ${fileId}`);

          try {
            const fileResponse = await globalThis.ezsite.apis.tablePage('26928', {
              PageNo: 1,
              PageSize: 1,
              Filters: [{ name: 'store_file_id', op: 'Equal', value: fileId }]
            });

            if (!fileResponse.error && fileResponse.data?.List?.length > 0) {
              const fileRecord = fileResponse.data.List[0];
              if (fileRecord.file_path || fileRecord.url) {
                const alternativeUrl = fileRecord.file_path || fileRecord.url;
                console.log(`[RobustIDDocumentViewer] Found alternative URL:`, alternativeUrl);
                setDocumentUrl(alternativeUrl);
                setUrlValidated(true);
                await validateAndTestImage(alternativeUrl);
                return;
              }
            }
          } catch (altError) {
            console.warn(`[RobustIDDocumentViewer] Alternative strategy failed:`, altError);
          }
        }

        throw new Error(`API Error: ${error}`);
      }

      if (!fileUrl || fileUrl.trim() === '') {
        console.error(`[RobustIDDocumentViewer] No URL returned for file ${fileId}`);
        throw new Error('No file URL returned from server');
      }

      // Validate URL format
      try {
        new URL(fileUrl);
      } catch (urlError) {
        console.error(`[RobustIDDocumentViewer] Invalid URL format:`, fileUrl);
        throw new Error('Invalid file URL format received');
      }

      console.log(`[RobustIDDocumentViewer] Successfully loaded URL for file ${fileId}:`, fileUrl);
      setDocumentUrl(fileUrl);
      setUrlValidated(true);
      setConnectionStatus('connected');

      // Test if it's an image and validate the URL
      await validateAndTestImage(fileUrl);

      // Success callback
      if (onRetrySuccess && attemptNumber > 0) {
        onRetrySuccess();
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error(`[RobustIDDocumentViewer] Error loading document URL for file ${fileId}:`, err);
      setHasError(true);
      setErrorMessage(errorMsg);
      setConnectionStatus('error');
      setIsLoading(false);

      // Auto-retry logic with exponential backoff (max 2 retries)
      if (attemptNumber < 2) {
        const retryDelay = Math.pow(2, attemptNumber) * 2000; // 2s, 4s, 8s
        console.log(`[RobustIDDocumentViewer] Scheduling retry for file ${fileId} in ${retryDelay}ms`);
        setTimeout(() => {
          setRetryCount(attemptNumber + 1);
          loadDocumentUrl(attemptNumber + 1);
        }, retryDelay);
      }
    }
  }, [fileId, connectionStatus, testConnection, onRetrySuccess]);

  // Load document URL when component mounts or fileId changes
  useEffect(() => {
    loadDocumentUrl(0);
  }, [loadDocumentUrl]);

  const validateAndTestImage = async (url: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        console.log(`[RobustIDDocumentViewer] Image validation timeout for: ${url}`);
        setIsImageFile(false);
        setImageLoaded(false);
        setIsLoading(false);
        resolve();
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);
        console.log(`[RobustIDDocumentViewer] File confirmed as image: ${url}`);
        setIsImageFile(true);
        setImageLoaded(true);
        setIsLoading(false);
        resolve();
      };

      img.onerror = (e) => {
        clearTimeout(timeout);
        console.log(`[RobustIDDocumentViewer] File is not an image or failed to load: ${url}`, e);
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
      globalThis.open(documentUrl, '_blank', 'noopener,noreferrer');
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
      const url = globalThis.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${getCleanDocumentName().replace(/\s+/g, '_')}_${fileId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      globalThis.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Document downloaded successfully'
      });
    } catch (error) {
      console.error('[RobustIDDocumentViewer] Error downloading document:', error);
      toast({
        title: 'Download Error',
        description: 'Failed to download document. Please try opening it in a new tab.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRetry = () => {
    console.log(`[RobustIDDocumentViewer] Manual retry triggered for file ${fileId}`);
    setRetryCount(0);
    setHasError(false);
    setErrorMessage('');
    setUrlValidated(false);
    loadDocumentUrl(0);
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    const isConnected = await testConnection();
    setIsLoading(false);

    toast({
      title: isConnected ? 'Connection OK' : 'Connection Failed',
      description: isConnected ?
      'API connection is working properly' :
      'Unable to connect to the API. Please check your network.',
      variant: isConnected ? 'default' : 'destructive'
    });

    if (isConnected && hasError) {
      handleManualRetry();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      toast({
        title: 'Document Removed',
        description: `${getCleanDocumentName()} has been marked for deletion.`,
        variant: 'destructive'
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
              {/* Connection Status */}
              {connectionStatus === 'connected' &&
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              }
              {connectionStatus === 'error' &&
              <Badge variant="destructive" className="text-xs">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </Badge>
              }
              {urlValidated && !hasError &&
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
                  onClick={handleManualRetry}
                  className="bg-white hover:bg-red-50 border-red-200">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Retry Load
                  </Button>
                  {connectionStatus === 'error' &&
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  className="bg-white hover:bg-blue-50 border-blue-200">
                      <Wifi className="w-4 h-4 mr-1" />
                      Test Connection
                    </Button>
                }
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
                console.error(`[RobustIDDocumentViewer] Runtime image error for: ${documentUrl}`);
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
                  Export
                </Button>
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>);

};

export default RobustIDDocumentViewer;