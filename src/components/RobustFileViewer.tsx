import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle,
  WifiOff,
  X } from
'lucide-react';
import { fileService } from '@/services/fileService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RobustFileViewerProps {
  fileIds: (number | null)[];
  labels: string[];
  isAdminUser?: boolean;
  className?: string;
  title?: string;
  showPreviewDialog?: boolean;
}

interface FileState {
  id: number;
  label: string;
  url: string | null;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  isImageFile: boolean;
  imageLoaded: boolean;
  retryCount: number;
}

const RobustFileViewer: React.FC<RobustFileViewerProps> = ({
  fileIds,
  labels,
  isAdminUser = false,
  className = '',
  title = 'Documents',
  showPreviewDialog = true
}) => {
  const [files, setFiles] = useState<FileState[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [previewFile, setPreviewFile] = useState<FileState | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    globalThis.addEventListener('online', handleOnline);
    globalThis.addEventListener('offline', handleOffline);

    return () => {
      globalThis.removeEventListener('online', handleOnline);
      globalThis.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize files when fileIds or labels change
  useEffect(() => {
    const validFiles = fileIds.
    map((id, index) => ({
      id: id || 0,
      label: labels[index] || `Document ${index + 1}`,
      url: null,
      isLoading: false,
      hasError: false,
      errorMessage: null,
      isImageFile: false,
      imageLoaded: false,
      retryCount: 0
    })).
    filter((file) => file.id > 0);

    setFiles(validFiles);
  }, [fileIds, labels]);

  // Load all file URLs
  useEffect(() => {
    if (files.length > 0) {
      loadAllFiles();
    }
  }, [files.length]);

  const loadAllFiles = async () => {
    const filesToLoad = files.filter((f) => !f.url && !f.isLoading);
    if (filesToLoad.length === 0) return;

    // Update loading states
    setFiles((prev) => prev.map((file) =>
    filesToLoad.some((f) => f.id === file.id) ?
    { ...file, isLoading: true, hasError: false, errorMessage: null } :
    file
    ));

    // Load files in parallel
    const loadPromises = filesToLoad.map(async (file) => {
      try {
        const response = await fileService.getFileUrl(file.id);

        if (response.error) {
          throw new Error(response.error);
        }

        const url = response.data!;

        // Test if it's an image
        const isImage = await testImageLoad(url);

        return {
          id: file.id,
          url,
          isImageFile: isImage,
          imageLoaded: isImage,
          hasError: false,
          errorMessage: null,
          retryCount: response.retryCount || 0
        };
      } catch (error) {
        return {
          id: file.id,
          url: null,
          isImageFile: false,
          imageLoaded: false,
          hasError: true,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          retryCount: 0
        };
      }
    });

    try {
      const results = await Promise.allSettled(loadPromises);

      setFiles((prev) => prev.map((file) => {
        const resultIndex = filesToLoad.findIndex((f) => f.id === file.id);
        if (resultIndex === -1) return file;

        const result = results[resultIndex];
        if (result.status === 'fulfilled') {
          return {
            ...file,
            ...result.value,
            isLoading: false
          };
        } else {
          return {
            ...file,
            isLoading: false,
            hasError: true,
            errorMessage: 'Failed to load file'
          };
        }
      }));
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const testImageLoad = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => resolve(false), 5000);

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
  };

  const handleRetry = async (fileId: number) => {
    fileService.clearCache(fileId);

    setFiles((prev) => prev.map((file) =>
    file.id === fileId ?
    { ...file, isLoading: true, hasError: false, errorMessage: null } :
    file
    ));

    try {
      const response = await fileService.getFileUrl(fileId, true);

      if (response.error) {
        throw new Error(response.error);
      }

      const url = response.data!;
      const isImage = await testImageLoad(url);

      setFiles((prev) => prev.map((file) =>
      file.id === fileId ?
      {
        ...file,
        url,
        isImageFile: isImage,
        imageLoaded: isImage,
        hasError: false,
        errorMessage: null,
        isLoading: false,
        retryCount: response.retryCount || 0
      } :
      file
      ));
    } catch (error) {
      setFiles((prev) => prev.map((file) =>
      file.id === fileId ?
      {
        ...file,
        isLoading: false,
        hasError: true,
        errorMessage: error instanceof Error ? error.message : 'Retry failed'
      } :
      file
      ));
    }
  };

  const handleViewFullScreen = (file: FileState) => {
    if (file.url) {
      globalThis.open(file.url, '_blank');
    }
  };

  const handlePreview = (file: FileState) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const handleDownload = async (file: FileState) => {
    try {
      const response = await fileService.downloadFile(file.id, file.label);
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: 'Success',
        description: `${file.label} downloaded successfully`
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Failed to download file',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (file: FileState) => {
    if (!isOnline) return <WifiOff className="w-4 h-4 text-red-500" />;
    if (file.isLoading) return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    if (file.hasError) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (file.url) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  const validFiles = files.filter((f) => f.id > 0);

  if (validFiles.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents available</h3>
          <p className="text-sm text-gray-500">Documents will appear here when uploaded</p>
        </CardContent>
      </Card>);

  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex items-center gap-2">
              {!isOnline &&
              <Badge variant="destructive" className="text-xs">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </Badge>
              }
              <Badge variant="secondary">
                {validFiles.length} document{validFiles.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {validFiles.map((file) =>
            <div
              key={file.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow">

                {/* File Preview */}
                <div className="relative h-32 bg-gray-50 rounded-lg mb-3 overflow-hidden">
                  {file.isLoading &&
                <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                }

                  {file.hasError && !file.isLoading &&
                <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                      <div className="text-center">
                        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className="text-xs text-red-600">Failed to load</p>
                      </div>
                    </div>
                }

                  {file.url && !file.isLoading && !file.hasError &&
                <>
                      {file.isImageFile && file.imageLoaded ?
                  <img
                    src={file.url}
                    alt={file.label}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => handlePreview(file)}
                    onError={() => {
                      setFiles((prev) => prev.map((f) =>
                      f.id === file.id ?
                      { ...f, hasError: true, errorMessage: 'Image failed to display' } :
                      f
                      ));
                    }} /> :


                  <div
                    className="absolute inset-0 flex items-center justify-center bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handlePreview(file)}>

                          <div className="text-center">
                            <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <p className="text-xs text-blue-600">Document</p>
                          </div>
                        </div>
                  }
                    </>
                }

                  {/* Action Buttons Overlay */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {file.hasError &&
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-6 w-6 p-0 bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => handleRetry(file.id)}>

                        <RefreshCw className="w-3 h-3" />
                      </Button>
                  }
                  </div>
                </div>

                {/* File Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">{file.label}</h4>
                    {getStatusIcon(file)}
                  </div>

                  {file.errorMessage &&
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {file.errorMessage}
                    </p>
                }

                  {file.retryCount > 0 &&
                <Badge variant="secondary" className="text-xs">
                      Retry {file.retryCount}
                    </Badge>
                }

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(file)}
                    disabled={!file.url}
                    className="flex-1">

                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    
                    {isAdminUser &&
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    disabled={!file.url}>

                        <Download className="w-3 h-3" />
                      </Button>
                  }
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Retry All Failed */}
          {validFiles.some((f) => f.hasError) &&
          <div className="mt-4 pt-4 border-t">
              <Button
              variant="outline"
              onClick={() => {
                validFiles.filter((f) => f.hasError).forEach((f) => handleRetry(f.id));
              }}
              className="w-full">

                <RefreshCw className="w-4 h-4 mr-2" />
                Retry All Failed Documents
              </Button>
            </div>
          }
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      {showPreviewDialog &&
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {previewFile && getStatusIcon(previewFile)}
                  <div>
                    <h3 className="font-medium">{previewFile?.label}</h3>
                    <p className="text-sm text-gray-500">
                      Document ID: {previewFile?.id}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setPreviewOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>

            {previewFile &&
          <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {previewFile.isImageFile ? 'Image' : 'Document'}
                    </Badge>
                    {previewFile.retryCount > 0 &&
                <Badge variant="secondary">
                        Retry {previewFile.retryCount}
                      </Badge>
                }
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                  variant="outline"
                  onClick={() => handleViewFullScreen(previewFile)}
                  disabled={!previewFile.url}>

                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                    
                    {isAdminUser &&
                <Button onClick={() => handleDownload(previewFile)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                }
                  </div>
                </div>

                {/* Preview Content */}
                <div className="flex justify-center min-h-[400px] bg-gray-50 rounded-lg">
                  {previewFile.isLoading &&
              <div className="flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
              }

                  {previewFile.hasError &&
              <div className="flex items-center justify-center">
                      <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                        <p className="text-sm text-red-600 mb-2">Preview failed to load</p>
                        <p className="text-xs text-red-500">{previewFile.errorMessage}</p>
                        <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRetry(previewFile.id)}
                    className="mt-3">

                          <RefreshCw className="w-4 h-4 mr-2" />
                          Retry
                        </Button>
                      </div>
                    </div>
              }

                  {previewFile.url && !previewFile.isLoading && !previewFile.hasError &&
              <>
                      {previewFile.isImageFile && previewFile.imageLoaded ?
                <img
                  src={previewFile.url}
                  alt={previewFile.label}
                  className="max-w-full max-h-96 object-contain rounded-lg"
                  onError={() => {
                    setFiles((prev) => prev.map((f) =>
                    f.id === previewFile.id ?
                    { ...f, hasError: true, errorMessage: 'Image preview failed' } :
                    f
                    ));
                  }} /> :


                <div className="flex items-center justify-center p-8">
                          <div className="text-center">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-sm text-gray-600 mb-2">Preview not available</p>
                            <p className="text-xs text-gray-500">
                              Click "Open in New Tab" to view this document
                            </p>
                          </div>
                        </div>
                }
                    </>
              }
                </div>
              </div>
          }
          </DialogContent>
        </Dialog>
      }
    </>);

};

export default RobustFileViewer;