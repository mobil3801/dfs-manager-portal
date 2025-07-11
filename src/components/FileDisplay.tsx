import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Image, Download, Eye, Trash2, Calendar, User, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatFileSize } from '@/utils/imageCompression';

interface FileData {
  ID: number;
  file_name: string;
  file_size: number;
  file_type: string;
  store_file_id: number;
  upload_date: string;
  file_category: string;
  file_url: string;
  description?: string;
}

interface FileDisplayProps {
  associatedTable: string;
  associatedRecordId: number;
  fileCategory?: string;
  showActions?: boolean;
  onFileDeleted?: (fileId: number) => void;
  className?: string;
}

const FileDisplay: React.FC<FileDisplayProps> = ({
  associatedTable,
  associatedRecordId,
  fileCategory = '',
  showActions = true,
  onFileDeleted,
  className = ''
}) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (associatedRecordId > 0) {
      loadFiles();
    }
  }, [associatedRecordId, associatedTable, fileCategory]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const filters = [
        { name: 'associated_table', op: 'Equal', value: associatedTable },
        { name: 'associated_record_id', op: 'Equal', value: associatedRecordId },
        { name: 'is_active', op: 'Equal', value: true }
      ];

      if (fileCategory) {
        filters.push({ name: 'file_category', op: 'Equal', value: fileCategory });
      }

      const { data, error } = await window.ezsite.apis.tablePage('26928', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'upload_date',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw error;

      setFiles(data?.List || []);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load files',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (file: FileData) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  };

  const handleDownload = (file: FileData) => {
    if (file.file_url) {
      const link = document.createElement('a');
      link.href = file.file_url;
      link.download = file.file_name;
      link.click();
    }
  };

  const handleDelete = async (file: FileData) => {
    if (!confirm(`Are you sure you want to delete "${file.file_name}"?`)) {
      return;
    }

    try {
      const { error } = await window.ezsite.apis.tableUpdate('26928', {
        ID: file.ID,
        is_active: false
      });

      if (error) throw error;

      setFiles(prev => prev.filter(f => f.ID !== file.ID));
      if (onFileDeleted) onFileDeleted(file.ID);

      toast({
        title: 'File deleted',
        description: 'File has been removed successfully'
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Delete failed',
        description: typeof error === 'string' ? error : 'Failed to delete file',
        variant: 'destructive'
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'profile_image':
        return 'bg-blue-500';
      case 'id_document':
        return 'bg-green-500';
      case 'document':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-3 ${className}`}>
        {files.map((file) => (
          <Card key={file.ID} className="transition-colors hover:bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.file_type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm truncate">{file.file_name}</p>
                      <Badge 
                        className={`text-white text-xs ${getCategoryBadgeColor(file.file_category)}`}
                      >
                        {file.file_category.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>{formatFileSize(file.file_size)}</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(file.upload_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {showActions && (
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreview(file)}
                      className="p-1 h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(file)}
                      className="p-1 h-8 w-8"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(file)}
                      className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedFile && getFileIcon(selectedFile.file_type)}
              <span>{selectedFile?.file_name}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedFile && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">File Size</p>
                  <p className="text-sm text-gray-600">{formatFileSize(selectedFile.file_size)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Upload Date</p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedFile.upload_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Category</p>
                  <Badge className={`text-white ${getCategoryBadgeColor(selectedFile.file_category)}`}>
                    {selectedFile.file_category.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">File Type</p>
                  <p className="text-sm text-gray-600">{selectedFile.file_type}</p>
                </div>
              </div>

              {/* File Preview */}
              <div className="border rounded-lg p-4">
                {selectedFile.file_type.startsWith('image/') ? (
                  <img 
                    src={selectedFile.file_url} 
                    alt={selectedFile.file_name}
                    className="max-w-full max-h-96 mx-auto rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Preview not available for this file type</p>
                    <p className="text-sm text-gray-500 mt-2">Click download to view the file</p>
                  </div>
                )}
                <div className="hidden text-center py-8">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600">Failed to load preview</p>
                  <p className="text-sm text-gray-500 mt-2">The file may be corrupted or unavailable</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setPreviewOpen(false)}
                >
                  Close
                </Button>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(selectedFile)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  {showActions && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleDelete(selectedFile);
                        setPreviewOpen(false);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileDisplay;