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
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle,
  WifiOff,
  Clock } from
'lucide-react';

interface FixedDocumentViewerProps {
  fileId: number | null;
  label: string;
  isAdminUser?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showRetryButton?: boolean;
}

interface DocumentState {
  url: string | null;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  isImageFile: boolean;
  imageLoaded: boolean;
  retryCount: number;
  lastAttempt: Date | null;
}

const FixedDocumentViewer: React.FC<FixedDocumentViewerProps> = ({
  fileId,
  label,
  isAdminUser = false,
  size = 'lg',
  className = '',
  showRetryButton = true
}) => {
  const [state, setState] = useState<DocumentState>({
    url: null,
    isLoading: false,
    hasError: false,
    errorMessage: null,
    isImageFile: false,
    imageLoaded: false,
    retryCount: 0,
    lastAttempt: null
  });

  const { toast } = useToast();

  // Load document URL when component mounts or fileId changes
  useEffect(() => {
    if (fileId && fileId > 0) {
      loadDocumentUrl();
    } else {
      resetState();
    }
  }, [fileId]);

  const resetState = () => {
    setState({
      url: null,
      isLoading: false,
      hasError: false,
      errorMessage: null,
      isImageFile: false,
      imageLoaded: false,
      retryCount: 0,
      lastAttempt: null
    });
  };

  const loadDocumentUrl = async (isRetry = false) => {
    if (!fileId || fileId <= 0) return;

    setState((prev) => ({
      ...prev,
      isLoading: true,
      hasError: false,
      errorMessage: null,
      imageLoaded: false,
      lastAttempt: new Date(),
      retryCount: isRetry ? prev.retryCount + 1 : 0
    }));

    try {
      console.log(`[FixedDocumentViewer] Loading URL for file ${fileId}${isRetry ? ` (retry ${state.retryCount + 1})` : ''}`);

      // Step 1: Get the file URL from the API
      const urlResponse = await window.ezsite.apis.getUploadUrl(fileId);

      if (urlResponse.error) {
        throw new Error(`API Error: ${urlResponse.error}`);
      }

      if (!urlResponse.data) {
        throw new Error('No file URL returned from server');
      }

      const documentUrl = urlResponse.data;
      console.log(`[FixedDocumentViewer] Got URL for file ${fileId}: ${documentUrl.substring(0, 50)}...`);

      // Step 2: Update state with URL
      setState((prev) => ({
        ...prev,
        url: documentUrl
      }));

      // Step 3: Test if it's an image
      await testImageLoad(documentUrl);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`[FixedDocumentViewer] Error loading file ${fileId}:`, errorMessage);

      setState((prev) => ({
        ...prev,
        hasError: true,
        errorMessage,
        isLoading: false
      }));

      // Don't show toast for retry attempts
      if (!isRetry) {
        toast({
          title: 'Document Load Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  };

  const testImageLoad = (url: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      let resolved = false;

      const handleLoad = () => {
        if (!resolved) {
          resolved = true;
          console.log(`[FixedDocumentViewer] Image loaded successfully for file ${fileId}`);
          setState((prev) => ({
            ...prev,
            isImageFile: true,
            imageLoaded: true,
            isLoading: false
          }));
          resolve();
        }
      };

      const handleError = (e: any) => {
        if (!resolved) {
          resolved = true;
          console.log(`[FixedDocumentViewer] Image load failed for file ${fileId}:`, e);
          setState((prev) => ({
            ...prev,
            isImageFile: false,
            imageLoaded: false,
            isLoading: false
          }));
          resolve();
        }
      };

      // Set timeout for image loading
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.log(`[FixedDocumentViewer] Image load timeout for file ${fileId}`);
          setState((prev) => ({
            ...prev,
            isImageFile: false,
            imageLoaded: false,
            isLoading: false
          }));
          resolve();
        }
      }, 8000); // 8 second timeout

      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = url;
    });
  };

  const handleViewFullScreen = () => {
    if (state.url) {
      window.open(state.url, '_blank');
    } else {
      toast({
        title: 'Error',
        description: 'Document URL not available',
        variant: 'destructive'
      });
    }
  };

  const handleDownload = async () => {
    if (!state.url) {
      toast({
        title: 'Download Error',
        description: 'Document URL not available',
        variant: 'destructive'
      });
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = state.url;
      link.download = label || 'document';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: 'Document download started'
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download document',
        variant: 'destructive'
      });
    }
  };

  const handleRetry = () => {
    console.log(`[FixedDocumentViewer] Manual retry triggered for file ${fileId}`);
    loadDocumentUrl(true);
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

  const getStatusColor = () => {
    if (state.isLoading) return 'text-blue-500';
    if (state.hasError) return 'text-red-500';
    if (state.url) return 'text-green-500';
    return 'text-gray-500';
  };

  const getStatusText = () => {
    if (state.isLoading) return 'Loading...';
    if (state.hasError) return 'Error';
    if (state.url) return 'Ready';
    return 'No file';
  };

  if (!fileId || fileId <= 0) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Document</h3>
          <p className="text-sm text-gray-500">No file ID provided</p>
        </CardContent>
      </Card>);

  }

  return (
    <Card className={`overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-0">
        {/* Preview Area */}
        <div className={`relative w-full bg-gray-50 border-b aspect-[3/2] ${getSizeClasses()}`}>
          
          {/* Loading State */}
          {state.isLoading &&
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                <span className="text-sm text-gray-600">Loading document...</span>
                {state.retryCount > 0 &&
              <p className="text-xs text-gray-500 mt-1">Retry attempt {state.retryCount}</p>
              }
              </div>
            </div>
          }

          {/* Error State */}
          {state.hasError && !state.isLoading &&
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
              <div className="text-center p-4 max-w-xs">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-red-800 mb-2">Unable to load</p>
                <p className="text-xs text-red-600 mb-3 break-words">
                  ID: {fileId}
                </p>
                <p className="text-xs text-red-500 mb-3">
                  {state.errorMessage || 'Unknown error occurred'}
                </p>
                
                {showRetryButton &&
              <div className="flex flex-col gap-2">
                    <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="text-xs">

                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry Load
                    </Button>
                  </div>
              }
              </div>
            </div>
          }

          {/* Success State - Image */}
          {state.url && !state.isLoading && !state.hasError && state.isImageFile && state.imageLoaded &&
          <img
            src={state.url}
            alt={label}
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300 cursor-pointer bg-white"
            onClick={handleViewFullScreen}
            onError={(e) => {
              console.error(`[FixedDocumentViewer] Image display error for file ${fileId}:`, e);
              setState((prev) => ({
                ...prev,
                hasError: true,
                errorMessage: 'Image failed to display properly'
              }));
            }} />

          }

          {/* Success State - Non-Image */}
          {state.url && !state.isLoading && !state.hasError && (!state.isImageFile || !state.imageLoaded) &&
          <div
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={handleViewFullScreen}>

              <div className="text-center p-4">
                <FileText className="w-16 h-16 text-blue-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-blue-800">Document File</p>
                <p className="text-xs text-blue-600 mt-1">Click to view</p>
                <p className="text-xs text-blue-500 mt-1">ID: {fileId}</p>
              </div>
            </div>
          }

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
              disabled={!state.url}>

              <Eye className="w-3 h-3" />
            </Button>
            
            {isAdminUser && state.url &&
            <Button
              variant="secondary"
              size="sm"
              className="h-6 w-6 p-0 bg-green-500 bg-opacity-90 hover:bg-opacity-100 text-white shadow-sm"
              onClick={handleDownload}>

                <Download className="w-3 h-3" />
              </Button>
            }

            {state.hasError && showRetryButton &&
            <Button
              variant="secondary"
              size="sm"
              className="h-6 w-6 p-0 bg-orange-500 bg-opacity-90 hover:bg-opacity-100 text-white shadow-sm"
              onClick={handleRetry}>

                <RefreshCw className="w-3 h-3" />
              </Button>
            }
          </div>
        </div>

        {/* Document Info */}
        <div className="p-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {label}
              </p>
              <p className="text-xs text-gray-500">
                ID: {fileId}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">
                {state.isImageFile && state.imageLoaded ? 'Image' : 'Document'}
              </Badge>
              
              <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
                {state.isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                {state.hasError && <AlertCircle className="w-3 h-3" />}
                {state.url && !state.hasError && !state.isLoading && <CheckCircle className="w-3 h-3" />}
                <span className="text-xs">{getStatusText()}</span>
              </div>
              
              {state.retryCount > 0 &&
              <Badge variant="secondary" className="text-xs">
                  Retry {state.retryCount}
                </Badge>
              }
              
              {isAdminUser && state.url &&
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={handleDownload}>

                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              }
            </div>
          </div>
          
          {/* Status Details */}
          {state.lastAttempt &&
          <div className="mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Last attempt: {state.lastAttempt.toLocaleTimeString()}</span>
              </div>
            </div>
          }
          
          {state.errorMessage &&
          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
              <strong>Error:</strong> {state.errorMessage}
            </div>
          }
          
          {state.url && !state.hasError &&
          <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
              <strong>Status:</strong> Document loaded successfully
              {state.retryCount > 0 && ` after ${state.retryCount} retry attempts`}
            </div>
          }
        </div>
      </CardContent>
    </Card>);

};

export default FixedDocumentViewer;