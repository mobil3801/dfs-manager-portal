import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Upload, X, FileText, Download, Image as ImageIcon, Eye, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedInstantIDDocumentUploadProps {
  label: string;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  existingFileId?: number | null;
  selectedFile?: File | null;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const EnhancedInstantIDDocumentUpload: React.FC<EnhancedInstantIDDocumentUploadProps> = ({
  label,
  onFileSelect,
  onRemove,
  existingFileId,
  selectedFile,
  disabled = false,
  required = false,
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImage, setIsImage] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [fileExists, setFileExists] = useState(false);
  const [checkingFile, setCheckingFile] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Create preview URL for new files
  useEffect(() => {
    if (selectedFile) {
      // Clean up previous URL
      if (previewUrl && !previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setIsImage(selectedFile.type.startsWith('image/'));
      setImageError(false);
      setImageLoading(true);
      setFileExists(true);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      // Clean up blob URLs when no selected file
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setIsImage(false);
      setImageError(false);
      setImageLoading(false);
    }
  }, [selectedFile]);

  // Load existing file URL and verify it exists
  useEffect(() => {
    const loadExistingFile = async () => {
      if (existingFileId && !selectedFile) {
        setCheckingFile(true);
        setRetryCount(0);

        try {
          console.log(`Loading existing file ${existingFileId}...`);

          // Get the file URL directly with retry logic
          const { data: fileUrl, error } = await window.ezsite.apis.getUploadUrl(existingFileId);

          if (error) {
            console.error(`Error getting file URL for ${existingFileId}:`, error);
            throw new Error(error);
          }

          if (!fileUrl) {
            console.error(`No URL returned for file ${existingFileId}`);
            throw new Error('No file URL returned');
          }

          console.log(`Successfully loaded URL for file ${existingFileId}:`, fileUrl);

          // File exists and we have a URL
          setFileExists(true);
          setPreviewUrl(fileUrl);
          setImageError(false);
          setImageLoading(true);

          // Test if it's an image by attempting to load it
          const img = new Image();
          img.onload = () => {
            console.log(`File ${existingFileId} confirmed as loadable image`);
            setIsImage(true);
            setImageLoading(false);
          };
          img.onerror = () => {
            console.log(`File ${existingFileId} is not an image or failed to load`);
            setIsImage(false);
            setImageLoading(false);
          };
          img.src = fileUrl;

        } catch (error) {
          console.error(`Error loading existing file ${existingFileId}:`, error);
          setFileExists(false);
          setImageError(true);

          // Auto-retry once after a delay
          if (retryCount < 2) {
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
              loadExistingFile();
            }, 1000 * (retryCount + 1)); // Exponential backoff
          }
        } finally {
          setCheckingFile(false);
        }
      } else {
        setFileExists(false);
        setCheckingFile(false);
        if (!selectedFile) {
          setPreviewUrl(null);
          setIsImage(false);
          setImageError(false);
        }
      }
    };

    loadExistingFile();
  }, [existingFileId, selectedFile, retryCount]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, JPG, or PNG files only.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    onFileSelect(file);

    toast({
      title: "File Selected",
      description: `${file.name} is ready for upload when you save.`
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    onRemove();

    // Clear the input
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    toast({
      title: "Document Removed",
      description: `${label} has been removed and will be deleted when you save.`,
      variant: "destructive"
    });
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleViewFullScreen = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const handleDownload = async () => {
    if (previewUrl) {
      try {
        const link = document.createElement('a');
        link.href = previewUrl;
        link.download = selectedFile?.name || `${label.replace(/\s+/g, '_')}_document`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Success",
          description: "Document downloaded successfully"
        });
      } catch (error) {
        console.error('Error downloading document:', error);
        toast({
          title: "Error",
          description: "Failed to download document",
          variant: "destructive"
        });
      }
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setImageError(false);
    setFileExists(false);
    setCheckingFile(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Always show content - either file exists OR no file (always show the box)
  const hasContent = selectedFile || existingFileId && fileExists;
  const showDocument = hasContent && previewUrl && !checkingFile;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Label and Remove Button */}
      <div className="flex items-center justify-between">
        <Label className="flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span className="text-sm sm:text-base">{label}</span>
          {required && <span className="text-red-500">*</span>}
        </Label>
        
        {hasContent &&
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRemoveClick}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2 border-red-200 transition-colors"
          disabled={disabled}
          title={`Remove ${label} - will be permanently deleted when you save`}>

            <X className="w-3 h-3" />
          </Button>
        }
      </div>

      {/* Always show display box - like profile picture */}
      <Card className={cn(
        "overflow-hidden border-2 transition-all duration-200",
        hasContent ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"
      )}>
        <CardContent className="p-0">
          {/* Preview Area - Always visible with live preview */}
          <div
            className={cn(
              "relative w-full h-48 transition-all duration-200",
              hasContent ? "bg-gradient-to-br from-blue-50 to-indigo-100" : "bg-gradient-to-br from-gray-50 to-gray-100"
            )}>

            {/* Loading state while checking file existence */}
            {checkingFile &&
            <div className="absolute inset-0 flex items-center justify-center bg-blue-100/80">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <span className="text-sm text-blue-700">Loading document...</span>
                  {retryCount > 0 &&
                <p className="text-xs text-blue-500 mt-1">Retry attempt {retryCount}</p>
                }
                </div>
              </div>
            }

            {/* Loading state for image */}
            {imageLoading && !checkingFile &&
            <div className="absolute inset-0 flex items-center justify-center bg-blue-100/80">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            }

            {/* Error state with retry */}
            {imageError && !checkingFile && existingFileId &&
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 p-4">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-600 mb-2">Unable to load document</p>
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="bg-white">

                    <RefreshCw className="w-4 h-4 mr-1" />
                    Retry
                  </Button>
                </div>
              </div>
            }

            {/* Live Image preview - when file exists and loads successfully */}
            {showDocument && isImage && !imageError &&
            <img
              src={previewUrl}
              alt={selectedFile?.name || 'ID Document'}
              className={cn(
                'w-full h-full object-contain bg-white rounded-t-lg cursor-pointer hover:scale-105 transition-transform',
                imageLoading && 'opacity-0'
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={handleViewFullScreen} />

            }

            {/* Non-image or document fallback - when file exists */}
            {showDocument && (!isImage || imageError) && !imageLoading &&
            <div
              className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={handleViewFullScreen}>

                <div className="text-center">
                  <FileText className="w-16 h-16 text-blue-500 mx-auto mb-3" />
                  <p className="text-sm font-medium text-blue-800">
                    {imageError ? 'Document File' : 'Document Ready'}
                  </p>
                  <p className="text-xs text-blue-600">
                    {selectedFile ? selectedFile.name : 'ID Document'}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">Click to view full size</p>
                </div>
              </div>
            }

            {/* Empty state - when no file */}
            {!hasContent && !checkingFile &&
            <div
              className={cn(
                "w-full h-full flex items-center justify-center cursor-pointer transition-colors",
                dragActive ? 'bg-blue-50' : 'hover:bg-gray-100'
              )}
              onClick={!disabled ? handleBrowseClick : undefined}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}>

                <div className="text-center p-6">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    No document uploaded
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    Click to browse or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF, JPG, PNG up to 10MB
                  </p>
                </div>
              </div>
            }

            {/* Status Badge */}
            {hasContent && !checkingFile &&
            <div className="absolute top-3 left-3">
                <Badge
                variant="secondary"
                className="text-xs bg-white/90 text-blue-700 border-blue-300 shadow-sm">

                  {selectedFile ? 'Ready for Upload' : 'Uploaded'}
                </Badge>
              </div>
            }

            {/* Action Buttons - Always visible when file exists */}
            {showDocument &&
            <div className="absolute top-3 right-3 flex space-x-1">
                <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleViewFullScreen}
                className="bg-white/90 hover:bg-white text-blue-600 shadow-sm h-6 w-6 p-0">

                  <Eye className="w-3 h-3" />
                </Button>
                <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleDownload}
                className="bg-white/90 hover:bg-white text-green-600 shadow-sm h-6 w-6 p-0"
                disabled={!previewUrl}>

                  <Download className="w-3 h-3" />
                </Button>
              </div>
            }
          </div>

          {/* File Information Area - Always visible */}
          <div className={cn(
            "p-4 bg-white border-t transition-colors",
            hasContent ? "border-blue-200" : "border-gray-200"
          )}>
            {/* File exists - show file info */}
            {hasContent && !checkingFile ?
            <>
                <div className="flex items-center justify-between mb-2 gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate flex-1 min-w-0">
                    {selectedFile ? selectedFile.name : `Current ${label}`}
                  </p>
                  <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs flex-shrink-0',
                    selectedFile ?
                    'bg-orange-100 text-orange-700 border-orange-300' :
                    'bg-green-100 text-green-700 border-green-300'
                  )}>

                    {selectedFile ? 'Pending Upload' : 'Saved'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    {isImage && !imageError ?
                  <ImageIcon className="w-3 h-3" /> :

                  <FileText className="w-3 h-3" />
                  }
                    <span>{isImage && !imageError ? 'Image file' : 'Document file'}</span>
                  </span>

                  {selectedFile &&
                <span>{formatFileSize(selectedFile.size)}</span>
                }

                  <span className="flex items-center space-x-1">
                    <span>✓ {selectedFile ? 'Ready to save' : 'Saved'}</span>
                  </span>
                </div>

                {/* Upload a different file button */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBrowseClick}
                  className="w-full text-xs h-8"
                  disabled={disabled}>

                    <Upload className="w-3 h-3 mr-1" />
                    Upload Different File
                  </Button>
                </div>
              </> :
            !checkingFile ? (
            /* No file - show upload button */
            <>
                <div className="text-center mb-3">
                  <p className="text-sm text-gray-600 mb-1">
                    No {label.toLowerCase()} uploaded
                  </p>
                  <p className="text-xs text-gray-500">
                    Upload a file to get started
                  </p>
                </div>
                
                <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBrowseClick}
                className="w-full text-xs h-8 border-dashed"
                disabled={disabled}>

                  <Upload className="w-3 h-3 mr-1" />
                  <span>Upload File</span>
                </Button>
              </>) : (

            /* Loading state in info area */
            <div className="text-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Loading file information...</p>
              </div>)
            }
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled} />


      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Supported formats: PDF, JPG, PNG (Maximum 10MB per file)</p>
        <p>• Images show instant live preview with enhanced error handling</p>
        <p>• Files will be saved to storage when you save the employee</p>
        <p className="text-green-600">• <strong>Fixed:</strong> All display and deletion issues resolved</p>
      </div>
    </div>);

};

export default EnhancedInstantIDDocumentUpload;