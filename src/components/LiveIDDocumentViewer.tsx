import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Clock,
  Wifi,
  WifiOff } from
'lucide-react';

interface LiveIDDocumentViewerProps {
  fileId: number | null;
  label: string;
  documentType?: string;
  isAdminUser?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onDelete?: () => void;
  showDeleteButton?: boolean;
  onRetrySuccess?: () => void;
}

const LiveIDDocumentViewer: React.FC<LiveIDDocumentViewerProps> = ({
  fileId,
  label,
  documentType = 'Document',
  isAdminUser = false,
  size = 'lg',
  className = '',
  onDelete,
  showDeleteButton = false,
  onRetrySuccess
}) => {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isImageFile, setIsImageFile] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastSuccessfulLoad, setLastSuccessfulLoad] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const { toast } = useToast();

  const maxRetries = 3;
  const retryDelays = [1000, 2000, 4000]; // Progressive backoff

  // Format file ID for live display
  const getDisplayId = useCallback(() => {
    if (!fileId) return 'No ID';
    return `ID: ${fileId}`;
  }, [fileId]);

  // Get clean document name for display
  const getCleanDocumentName = useCallback(() => {
    let cleanName = label.replace(/https?:\/\/[^\s]+/g, '').trim();
    cleanName = cleanName.replace(/\.(jpg|jpeg|png|gif|pdf|doc|docx)$/i, '');
    return cleanName || `${documentType} ${fileId}`;
  }, [label, documentType, fileId]);

  // Test API connectivity
  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!fileId) return false;

    try {
      setConnectionStatus('testing');
      console.log(`[LiveIDDocumentViewer] Testing connection for file ${fileId}...`);

      const response = (await Promise.race([
      globalThis.ezsite.apis.getUploadUrl(fileId),
      new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout')), 8000)
      )]
      )) as {data?: string;error?: string;};

      const success = !response.error && response.data && response.data.trim() !== '';
      setConnectionStatus(success ? 'connected' : 'failed');

      console.log(`[LiveIDDocumentViewer] Connection test for file ${fileId}:`, success ? 'PASS' : 'FAIL');
      return success;
    } catch (error) {
      console.error(`[LiveIDDocumentViewer] Connection test failed for file ${fileId}:`, error);
      setConnectionStatus('failed');
      return false;
    }
  }, [fileId]);

  // Load document with retry logic
  const loadDocument = useCallback(async (attemptNumber = 0): Promise<void> => {
    if (!fileId) {
      setDocumentUrl(null);
      setIsImageFile(false);
      setImageLoaded(false);
      setHasError(false);
      setErrorMessage('');
      setConnectionStatus('failed');
      return;
    }

    if (attemptNumber === 0) {
      setIsLoading(true);
      setHasError(false);
      setImageLoaded(false);
      setErrorMessage('');
    }

    try {
      console.log(`[LiveIDDocumentViewer] Loading document (attempt ${attemptNumber + 1}/${maxRetries + 1}) for file ID: ${fileId}`);

      // Test connection first
      const connectionOk = await testConnection();
      if (!connectionOk && attemptNumber === 0) {
        throw new Error('Connection test failed - API not responding');
      }

      // Get the file URL from the API
      const response = (await Promise.race([
      globalThis.ezsite.apis.getUploadUrl(fileId),
      new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
      )]
      )) as {data: string;error: string;};

      const { data: fileUrl, error } = response;

      if (error) {
        console.error(`[LiveIDDocumentViewer] API error for file ${fileId}:`, error);
        throw new Error(`API Error: ${error}`);
      }

      if (!fileUrl || fileUrl.trim() === '') {
        console.error(`[LiveIDDocumentViewer] Empty URL returned for file ${fileId}`);
        throw new Error('No file URL returned from server');
      }

      console.log(`[LiveIDDocumentViewer] Successfully loaded URL for file ${fileId}:`, fileUrl);
      setDocumentUrl(fileUrl);
      setLastSuccessfulLoad(new Date());
      setConnectionStatus('connected');

      // Test if it's a valid image
      await validateImageUrl(fileUrl);

      setHasError(false);
      setRetryCount(0);

      if (onRetrySuccess && attemptNumber > 0) {
        onRetrySuccess();
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error(`[LiveIDDocumentViewer] Error loading document (attempt ${attemptNumber + 1}) for file ${fileId}:`, err);

      setHasError(true);
      setErrorMessage(errorMsg);
      setConnectionStatus('failed');

      // Auto-retry with exponential backoff
      if (attemptNumber < maxRetries) {
        const delay = retryDelays[attemptNumber] || 4000;
        console.log(`[LiveIDDocumentViewer] Retrying in ${delay}ms...`);

        setTimeout(() => {
          setRetryCount(attemptNumber + 1);
          loadDocument(attemptNumber + 1);
        }, delay);
        return;
      } else {
        console.error(`[LiveIDDocumentViewer] All retry attempts exhausted for file ${fileId}`);
      }
    } finally {
      if (attemptNumber === 0 || attemptNumber >= maxRetries) {
        setIsLoading(false);
      }
    }
  }, [fileId, onRetrySuccess, testConnection]);

  // Validate image URL
  const validateImageUrl = useCallback(async (url: string): Promise<void> => {
    return new Promise((resolve) => {
      try {
        new URL(url);
      } catch {
        console.log(`[LiveIDDocumentViewer] Invalid URL format: ${url}`);
        setIsImageFile(false);
        setImageLoaded(false);
        resolve();
        return;
      }

      const img = new Image();
      const timeout = setTimeout(() => {
        console.log(`[LiveIDDocumentViewer] Image validation timeout for: ${url}`);
        setIsImageFile(false);
        setImageLoaded(false);
        resolve();
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);
        console.log(`[LiveIDDocumentViewer] Image validated successfully: ${url}`);
        setIsImageFile(true);
        setImageLoaded(true);
        resolve();
      };

      img.onerror = (e) => {
        clearTimeout(timeout);
        console.log(`[LiveIDDocumentViewer] Not an image or failed to load: ${url}`, e);
        setIsImageFile(false);
        setImageLoaded(false);
        resolve();
      };

      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  }, []);

  // Load document when component mounts or fileId changes
  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const handleViewFullScreen = () => {
    if (documentUrl) {
      globalThis.open(documentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = async () => {
    if (!documentUrl || !fileId) return;

    try {
      setIsLoading(true);
      const response = await fetch(documentUrl);

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
        title: "Success",
        description: "Document downloaded successfully"
      });
    } catch (error) {
      console.error('[LiveIDDocumentViewer] Download error:', error);
      toast({
        title: "Download Error",
        description: "Failed to download document. Please try opening it in a new tab.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRetry = () => {
    console.log(`[LiveIDDocumentViewer] Manual retry triggered for file ${fileId}`);
    setRetryCount(0);
    loadDocument();
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

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':return <Wifi className="w-3 h-3 text-green-600" />;
      case 'failed':return <WifiOff className="w-3 h-3 text-red-600" />;
      case 'testing':return <Clock className="w-3 h-3 text-yellow-600 animate-pulse" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':return 'Live';
      case 'failed':return 'Offline';
      case 'testing':return 'Checking...';
    }
  };

  // Don't render if no file ID
  if (!fileId) {
    return null;
  }

  return (
    <Card className={`overflow-hidden shadow-sm hover:shadow-md transition-all ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-900 truncate">
            {getCleanDocumentName()}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge
              variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
              className="text-xs flex items-center space-x-1">

              {getConnectionStatusIcon()}
              <span>{getConnectionStatusText()}</span>
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getDisplayId()}
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Document Type: {documentType}</span>
          {lastSuccessfulLoad &&
          <span>Updated: {lastSuccessfulLoad.toLocaleTimeString()}</span>
          }
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className={`relative w-full bg-gray-50 ${getSizeClasses()}`}>
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
                <p className="text-sm text-red-600 mb-2">Unable to load</p>
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
                  {documentUrl &&
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewFullScreen}
                  className="bg-white hover:bg-blue-50 border-blue-200">

                      <ExternalLink className="w-4 h-4 mr-1" />
                      Test Connection
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
                console.error(`[LiveIDDocumentViewer] Image display error for: ${documentUrl}`);
                setHasError(true);
                setErrorMessage('Image failed to display');
              }} /> :


            <div
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={handleViewFullScreen}>

                  <div className="text-center p-4">
                    <FileText className="w-16 h-16 text-blue-500 mx-auto mb-3" />
                    <p className="text-sm font-medium text-blue-800">Document Ready</p>
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

        {/* Document Footer */}
        <div className="p-3 bg-white border-t">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600">
                {getDisplayId()} • {documentType}
              </p>
            </div>
            <div className="flex items-center space-x-2 ml-2">
              <Badge
                variant={connectionStatus === 'connected' ? 'secondary' : 'destructive'}
                className="text-xs">

                {connectionStatus === 'connected' ? '✓ Live' : '✗ Error'}
              </Badge>
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

export default LiveIDDocumentViewer;