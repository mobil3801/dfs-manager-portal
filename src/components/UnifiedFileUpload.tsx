import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Image, Loader2, Zap, Eye, Download, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { compressImage, formatFileSize, isImageFile, type CompressionResult } from '@/utils/imageCompression';

interface FileUploadResult {
  fileId: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  storeFileId: number;
  uploadDate: string;
  fileUrl: string;
  description?: string;
  fileCategory?: string;
}

interface UnifiedFileUploadProps {
  onFileUpload?: (result: FileUploadResult) => void;
  onFileSelect?: (file: File) => void;
  accept?: string;
  label?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  associatedTable?: string;
  associatedRecordId?: number;
  fileCategory?: string;
  showPreview?: boolean;
  allowMultiple?: boolean;
  placeholder?: string;
  // New props for unified functionality
  mode?: 'database' | 'select' | 'both';
  showSettings?: boolean;
  requireDescription?: boolean;
  customCategories?: string[];
}

const UnifiedFileUpload: React.FC<UnifiedFileUploadProps> = ({
  onFileUpload,
  onFileSelect,
  accept = 'image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt',
  label = 'Upload Files',
  maxSize = 10,
  className = '',
  disabled = false,
  associatedTable = '',
  associatedRecordId = 0,
  fileCategory = 'general',
  showPreview = true,
  allowMultiple = false,
  placeholder = 'Select files to upload...',
  mode = 'database',
  showSettings = true,
  requireDescription = false,
  customCategories = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(fileCategory);
  const [previewFiles, setPreviewFiles] = useState<string[]>([]);
  const [uploadResults, setUploadResults] = useState<FileUploadResult[]>([]);
  const [compressionResults, setCompressionResults] = useState<CompressionResult[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const isImageUpload = accept.includes('image');
  const defaultCategories = ['general', 'document', 'image', 'receipt', 'invoice', 'report', 'license', 'certificate'];
  const availableCategories = customCategories.length > 0 ? customCategories : defaultCategories;

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: `File size must be less than ${maxSize}MB`,
        variant: 'destructive'
      });
      return false;
    }

    if (accept && accept !== '*/*') {
      const acceptedTypes = accept.split(',').map((type) => type.trim());
      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        } else if (type.includes('*')) {
          const baseType = type.split('/')[0];
          return file.type.startsWith(baseType);
        } else {
          return file.type === type;
        }
      });

      if (!isAccepted) {
        toast({
          title: 'Invalid file type',
          description: `Please select a file of type: ${accept}`,
          variant: 'destructive'
        });
        return false;
      }
    }

    return true;
  };

  const processFile = async (file: File): Promise<File> => {
    const needsCompression = isImageFile(file) && file.size > 1024 * 1024;

    if (needsCompression) {
      try {
        const result = await compressImage(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          quality: 0.8,
          initialQuality: 0.8
        });

        setCompressionResults((prev) => [...prev, result]);

        if (result.wasCompressed) {
          toast({
            title: 'Image compressed',
            description: `File size reduced from ${formatFileSize(result.originalSize)} to ${formatFileSize(result.compressedSize)} (${result.compressionRatio.toFixed(1)}x smaller)`,
            duration: 5000
          });
        }

        return result.file;
      } catch (error) {
        console.error('Compression failed:', error);
        toast({
          title: 'Compression failed',
          description: 'Using original file instead',
          variant: 'destructive'
        });
        return file;
      }
    }

    return file;
  };

  const uploadToDatabase = async (file: File): Promise<FileUploadResult> => {
    try {
      // Upload file to storage
      const { data: storeFileId, error: uploadError } = await window.ezsite.apis.upload({
        filename: file.name,
        file: file
      });

      if (uploadError) throw uploadError;

      // Save file metadata to database
      const fileData = {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        store_file_id: storeFileId,
        uploaded_by: 1, // This should be the current user ID
        upload_date: new Date().toISOString(),
        associated_table: associatedTable,
        associated_record_id: associatedRecordId,
        file_category: selectedCategory,
        is_active: true,
        description: description,
        file_url: `${window.location.origin}/file/${storeFileId}`
      };

      const { data: insertResult, error: insertError } = await window.ezsite.apis.tableCreate(26928, fileData);

      if (insertError) throw insertError;

      return {
        fileId: insertResult.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        storeFileId: storeFileId,
        uploadDate: fileData.upload_date,
        fileUrl: fileData.file_url,
        description: description,
        fileCategory: selectedCategory
      };
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(validateFile);
    if (validFiles.length === 0) return;

    setSelectedFiles(validFiles);

    // Create preview URLs for images
    const previewUrls = validFiles.map((file) => {
      if (isImageFile(file)) {
        return URL.createObjectURL(file);
      }
      return '';
    });
    setPreviewFiles(previewUrls);

    // If mode is select only, call onFileSelect for each file
    if (mode === 'select' && onFileSelect) {
      validFiles.forEach((file) => onFileSelect(file));
      toast({
        title: 'Files selected',
        description: `${validFiles.length} file(s) selected successfully`
      });
    }

    // If mode is database and no settings required, upload immediately
    if (mode === 'database' && !showSettings && !requireDescription) {
      await handleUpload(validFiles);
    }
  };

  const handleUpload = async (filesToUpload: File[] = selectedFiles) => {
    if (filesToUpload.length === 0) return;

    if (requireDescription && !description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please provide a description for the files',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      const results: FileUploadResult[] = [];

      for (const file of filesToUpload) {
        const processedFile = await processFile(file);

        if (mode === 'database' || mode === 'both') {
          const result = await uploadToDatabase(processedFile);
          results.push(result);

          if (onFileUpload) {
            onFileUpload(result);
          }
        }

        if (mode === 'select' || mode === 'both') {
          if (onFileSelect) {
            onFileSelect(processedFile);
          }
        }
      }

      setUploadResults(results);

      toast({
        title: 'Upload successful',
        description: `${results.length} file(s) processed successfully`
      });

      // Reset form
      setSelectedFiles([]);
      setDescription('');
      setPreviewFiles([]);
      setCompressionResults([]);
      setIsOpen(false);

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload failed',
        description: typeof error === 'string' ? error : 'An error occurred during upload',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeSelectedFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewFiles(newPreviews);
  };

  const getFileIcon = (fileType?: string) => {
    if (fileType?.startsWith('image/') || isImageUpload) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const closeDialog = () => {
    setIsOpen(false);
    setSelectedFiles([]);
    setDescription('');
    setPreviewFiles([]);
    setCompressionResults([]);
    setUploadResults([]);
  };

  return (
    <div className={className}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full flex items-center gap-2">
            {getFileIcon()}
            {label}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getFileIcon()}
              {label}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* File Upload Section */}
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-6">
                <Button
                  variant="ghost"
                  className="w-full h-auto p-0 flex flex-col items-center gap-3"
                  onClick={() => fileInputRef.current?.click()}>
                  <div className="p-4 bg-blue-100 rounded-full">
                    <Upload className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold">Upload Files</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {placeholder}
                    </p>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 &&
            <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Selected Files</h3>
                    <Badge variant="secondary">{selectedFiles.length} files</Badge>
                  </div>
                  <div className="space-y-3">
                    {selectedFiles.map((file, index) =>
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {previewFiles[index] && isImageFile(file) ?
                    <img
                      src={previewFiles[index]}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded" /> :


                    getFileIcon(file.type)
                    }
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase()}
                          </p>
                        </div>
                        <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeSelectedFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                  )}
                  </div>
                </CardContent>
              </Card>
            }

            {/* Upload Settings */}
            {selectedFiles.length > 0 && (mode === 'database' || mode === 'both') && showSettings &&
            <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">File Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map((cat) =>
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description {requireDescription && <span className="text-red-500">*</span>}
                    </Label>
                    <Textarea
                    id="description"
                    placeholder="Enter a description for these files..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    required={requireDescription} />

                  </div>

                  <div className="flex gap-2">
                    <Button
                    onClick={() => handleUpload()}
                    disabled={isUploading}
                    className="flex-1">
                      {isUploading ?
                    <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Uploading...
                        </> :

                    <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload {selectedFiles.length} file(s)
                        </>
                    }
                    </Button>
                    <Button variant="outline" onClick={closeDialog}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            }

            {/* Upload Results */}
            {uploadResults.length > 0 && showPreview &&
            <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium text-green-800">Upload Successful!</h3>
                  </div>
                  <div className="space-y-2">
                    {uploadResults.map((result, index) =>
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="font-medium text-sm">{result.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(result.fileSize)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => window.open(result.fileUrl, '_blank')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => window.open(result.fileUrl, '_blank')}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                  )}
                  </div>
                </CardContent>
              </Card>
            }

            {/* Compression Results */}
            {compressionResults.length > 0 &&
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-blue-800">Compression Results</h3>
                  </div>
                  {compressionResults.map((result, index) =>
                <div key={index} className="text-sm text-blue-700 mb-1">
                      {result.wasCompressed ?
                  <>Size reduced: {formatFileSize(result.originalSize)} → {formatFileSize(result.compressedSize)} ({result.compressionRatio.toFixed(1)}x smaller)</> :

                  <>File was already optimized</>
                  }
                    </div>
                )}
                </CardContent>
              </Card>
            }

            {/* File Info */}
            <div className="text-center text-sm text-gray-500">
              <p>Accepted file types: {accept}</p>
              <p>Maximum file size: {maxSize}MB</p>
              {isImageUpload &&
              <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs font-medium">Auto-compression enabled for images >1MB</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={allowMultiple}
        onChange={handleFileSelect}
        className="hidden" />

    </div>);

};

export default UnifiedFileUpload;