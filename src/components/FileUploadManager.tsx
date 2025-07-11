import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Image, Video, File, Trash2, Edit, Eye, Download, Plus, Settings, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatFileSize, isImageFile } from '@/utils/imageCompression';
import EnhancedFileUpload from '@/components/EnhancedFileUpload';
import FileDisplay from '@/components/FileDisplay';

interface FileUploadResult {
  fileId?: number;
  ID?: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  storeFileId: number;
  uploadDate: string;
  fileUrl: string;
  description?: string;
  fileCategory?: string;
}

interface FileUploadManagerProps {
  associatedTable: string;
  associatedRecordId: number;
  defaultCategory?: string;
  allowedFileTypes?: string;
  maxFileSize?: number;
  showExistingFiles?: boolean;
  allowMultiple?: boolean;
  className?: string;
  onFileUpload?: (result: FileUploadResult) => void;
  onFileDelete?: (fileId: number) => void;
}

const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  associatedTable,
  associatedRecordId,
  defaultCategory = 'general',
  allowedFileTypes = 'image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt',
  maxFileSize = 10,
  showExistingFiles = true,
  allowMultiple = false,
  className = '',
  onFileUpload,
  onFileDelete
}) => {
  const [files, setFiles] = useState<FileUploadResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [uploadSettings, setUploadSettings] = useState({
    category: defaultCategory,
    description: '',
    allowMultiple: allowMultiple
  });
  const { toast } = useToast();

  useEffect(() => {
    if (showExistingFiles) {
      loadFiles();
    }
  }, [associatedTable, associatedRecordId, refreshKey]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const filters = [
        { name: 'associated_table', op: 'Equal', value: associatedTable },
        { name: 'associated_record_id', op: 'Equal', value: associatedRecordId },
        { name: 'is_active', op: 'Equal', value: true }
      ];

      const { data, error } = await window.ezsite.apis.tablePage(26928, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'upload_date',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw error;
      setFiles(data.List || []);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: 'Error loading files',
        description: typeof error === 'string' ? error : 'Failed to load files',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (result: FileUploadResult) => {
    setFiles(prev => [result, ...prev]);
    setRefreshKey(prev => prev + 1);
    
    if (onFileUpload) {
      onFileUpload(result);
    }
    
    toast({
      title: 'File uploaded successfully',
      description: `${result.fileName} has been uploaded to the database`
    });
  };

  const handleFileDelete = async (fileId: number) => {
    try {
      const { error } = await window.ezsite.apis.tableUpdate(26928, {
        id: fileId,
        is_active: false
      });

      if (error) throw error;

      setFiles(prev => prev.filter(f => (f.fileId || f.ID) !== fileId));
      
      if (onFileDelete) {
        onFileDelete(fileId);
      }
      
      toast({
        title: 'File deleted',
        description: 'File has been successfully deleted'
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
      return <Image className="h-5 w-5 text-blue-600" />;
    } else if (fileType.startsWith('video/')) {
      return <Video className="h-5 w-5 text-purple-600" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-600" />;
    } else {
      return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      document: 'bg-blue-100 text-blue-800',
      image: 'bg-green-100 text-green-800',
      receipt: 'bg-yellow-100 text-yellow-800',
      invoice: 'bg-purple-100 text-purple-800',
      report: 'bg-orange-100 text-orange-800',
      license: 'bg-indigo-100 text-indigo-800',
      certificate: 'bg-pink-100 text-pink-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Upload Manager
            </span>
            <div className="flex gap-2">
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">File Category</Label>
                      <Select value={uploadSettings.category} onValueChange={(value) => setUploadSettings(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="receipt">Receipt</SelectItem>
                          <SelectItem value="invoice">Invoice</SelectItem>
                          <SelectItem value="report">Report</SelectItem>
                          <SelectItem value="license">License</SelectItem>
                          <SelectItem value="certificate">Certificate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Default Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter a default description for uploaded files..."
                        value={uploadSettings.description}
                        onChange={(e) => setUploadSettings(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="allowMultiple"
                        checked={uploadSettings.allowMultiple}
                        onChange={(e) => setUploadSettings(prev => ({ ...prev, allowMultiple: e.target.checked }))}
                      />
                      <Label htmlFor="allowMultiple">Allow multiple file uploads</Label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsSettingsOpen(false)}>
                        <Check className="h-4 w-4 mr-2" />
                        Apply Settings
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Max size: {maxFileSize}MB</Badge>
              <Badge variant="secondary">Types: {allowedFileTypes}</Badge>
              <Badge variant="secondary">Category: {uploadSettings.category}</Badge>
              {uploadSettings.allowMultiple && <Badge variant="secondary">Multiple files</Badge>}
            </div>

            <EnhancedFileUpload
              onFileUpload={handleFileUpload}
              accept={allowedFileTypes}
              label="Upload Files"
              maxSize={maxFileSize}
              useDatabaseStorage={true}
              associatedTable={associatedTable}
              associatedRecordId={associatedRecordId}
              fileCategory={uploadSettings.category}
              showPreview={true}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* File Display */}
      {showExistingFiles && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Uploaded Files</span>
              <Badge variant="secondary">{files.length} files</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8">
                <File className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded</h3>
                <p className="text-sm text-gray-500">Files will appear here once uploaded</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                  <div key={file.fileId} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      {getFileIcon(file.fileType)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{file.fileName}</h4>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.fileSize)} • {file.fileType.split('/')[1]?.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {file.description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{file.description}</p>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-wrap gap-1">
                        {file.fileCategory && (
                          <Badge variant="secondary" className={`text-xs ${getCategoryColor(file.fileCategory)}`}>
                            {file.fileCategory}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {formatDate(file.uploadDate)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(file.fileUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = file.fileUrl;
                          link.download = file.fileName;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFileDelete(file.fileId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploadManager;