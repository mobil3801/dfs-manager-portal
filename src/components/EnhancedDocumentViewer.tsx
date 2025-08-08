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
  WifiOff } from
'lucide-react';
import { fileService, FileServiceResponse } from '@/services/fileService';

interface EnhancedDocumentViewerProps {
  fileId: number | null;
  label: string;
  isAdminUser?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLabel?: boolean;
  autoRetry?: boolean;
}

interface DocumentState {
  url: string | null;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  isImageFile: boolean;
  imageLoaded: boolean;
  retryCount: number;
  isOnline: boolean;
}

const EnhancedDocumentViewer: React.FC<EnhancedDocumentViewerProps> = ({
  fileId,
  label,
  isAdminUser = false,
  size = 'lg',
  className = '',
  showLabel = true,
  autoRetry = true
}) => {
  const [state, setState] = useState<DocumentState>({
    url: null,
    isLoading: false,
    hasError: false,
    errorMessage: null,
    isImageFile: false,
    imageLoaded: false,
    retryCount: 0,
    isOnline: navigator.onLine
  });

  const { toast } = useToast();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setState((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState((prev) => ({ ...prev, isOnline: false }));

    globalThis.addEventListener('online', handleOnline);
    globalThis.addEventListener('offline', handleOffline);

    return () => {
      globalThis.removeEventListener('online', handleOnline);
      globalThis.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load document URL when component mounts or fileId changes
  useEffect(() => {
    if (fileId) {
      loadDocumentUrl(false);
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
      isOnline: navigator.onLine
    });
  };

  const loadDocumentUrl = async (forceRetry = false) => {
    if (!fileId) return;

    setState((prev) => ({
      ...prev,
      isLoading: true,
      hasError: false,
      errorMessage: null,
      imageLoaded: false
    }));

    try {
      console.log(`Loading document URL for file ${fileId}${forceRetry ? ' (retry)' : ''}`);

      const response: FileServiceResponse<string> = await fileService.getFileUrl(fileId, forceRetry);

      if (response.error) {
        throw new Error(response.error);
      }

      const documentUrl = response.data!;

      setState((prev) => ({
        ...prev,
        url: documentUrl,
        retryCount: response.retryCount || 0
      }));

      // Test if it's an image by trying to load it
      await testImageLoad(documentUrl);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Error loading document URL for file ${fileId}:`, errorMessage);

      setState((prev) => ({
        ...prev,
        hasError: true,
        errorMessage,
        isLoading: false
      }));

      // Show toast for critical errors
      if (!state.isOnline) {
        toast({
          title: 'Connection Error',
          description: 'You appear to be offline. Check your internet connection.',
          variant: 'destructive'
        });
      } else if (autoRetry && state.retryCount < 2) {
        setTimeout(() => {
          loadDocumentUrl(true);
        }, 2000);
      }
    }
  };

  const testImageLoad = (url: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        setState((prev) => ({
          ...prev,
          isImageFile: true,
          imageLoaded: true,
          isLoading: false
        }));
        resolve();
      };

      img.onerror = () => {
        setState((prev) => ({
          ...prev,
          isImageFile: false,
          imageLoaded: false,
          isLoading: false
        }));
        resolve();
      };

      // Set timeout for slow loading images
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isLoading: false
        }));
        resolve();
      }, 10000); // 10 second timeout

      img.src = url;
    });
  };

  const handleViewFullScreen = () => {
    if (state.url) {
      globalThis.open(state.url, '_blank');
    } else {
      toast({
        title: 'Error',
        description: 'Document URL not available',
        variant: 'destructive'
      });
    }
  };

  const handleDownload = async () => {
    if (!fileId) return;

    try {
      const response = await fileService.downloadFile(fileId, label);
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: 'Success',
        description: 'Document downloaded successfully'
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Failed to download document',
        variant: 'destructive'
      });
    }
  };

  const handleRetry = () => {
    fileService.clearCache(fileId || undefined);
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

  const getStatusInfo = () => {
    if (!state.isOnline) {
      return { color: 'text-red-500', icon: WifiOff, text: 'Offline' };
    }
    if (state.isLoading) {
      return { color: 'text-blue-500', icon: Loader2, text: 'Loading...' };
    }
    if (state.hasError) {
      return { color: 'text-red-500', icon: AlertCircle, text: 'Error' };
    }
    if (state.url) {
      return { color: 'text-green-500', icon: CheckCircle, text: 'Ready' };
    }
    return { color: 'text-gray-500', icon: FileText, text: 'No file' };
  };

  if (!fileId) {
    return null;
  }

  const statusInfo = getStatusInfo();

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
                <p className="text-sm font-medium text-red-800 mb-2">Unable to load document</p>
                <p className="text-xs text-red-600 mb-3 break-words">
                  {state.errorMessage || 'Unknown error occurred'}
                </p>
                
                <div className="flex flex-col gap-2">
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="text-xs">

                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry Load
                  </Button>
                  
                  {state.url &&
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewFullScreen}
                  className="text-xs">

                      <ExternalLink className="w-3 h-3 mr-1" />
                      Try Open
                    </Button>
                }
                </div>
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
            onError={() => setState((prev) => ({
              ...prev,
              hasError: true,
              errorMessage: 'Image failed to display properly'
            }))} />

          }

          {/* Success State - Non-Image */}
          {state.url && !state.isLoading && !state.hasError && (!state.isImageFile || !state.imageLoaded) &&
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

          {/* Document Label */}
          {showLabel &&
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {label}
            </div>
          }

          {/* Status Indicator */}
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-white bg-opacity-90 px-2 py-1 rounded text-xs">
            <statusInfo.icon className={`w-3 h-3 ${statusInfo.color}`} />
            <span className={statusInfo.color}>{statusInfo.text}</span>
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
            
            {isAdminUser &&
            <Button
              variant="secondary"
              size="sm"
              className="h-6 w-6 p-0 bg-green-500 bg-opacity-90 hover:bg-opacity-100 text-white shadow-sm"
              onClick={handleDownload}
              disabled={!fileId}>

                <Download className="w-3 h-3" />
              </Button>
            }

            {state.hasError &&
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
            <p className="text-sm font-medium text-gray-900 truncate">
              {label}
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {state.isImageFile && state.imageLoaded ? 'Image' : 'Document'}
              </Badge>
              
              {/* Connection Status */}
              {!state.isOnline &&
              <Badge variant="destructive" className="text-xs">
                  Offline
                </Badge>
              }
              
              {state.retryCount > 0 &&
              <Badge variant="secondary" className="text-xs">
                  Retry {state.retryCount}
                </Badge>
              }
              
              {isAdminUser &&
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={handleDownload}
                disabled={!fileId}>

                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              }
            </div>
          </div>
          
          {/* Additional Info */}
          {state.errorMessage &&
          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
              <strong>Error:</strong> {state.errorMessage}
            </div>
          }
          
          {state.url && !state.hasError &&
          <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
              <strong>Status:</strong> Document loaded successfully
              {state.retryCount > 0 && ` (after ${state.retryCount} retry attempts)`}
            </div>
          }
        </div>
      </CardContent>
    </Card>);

};

export default EnhancedDocumentViewer;