import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Upload,
  Database,
  FileText,
  Eye,
  CheckCircle,
  AlertCircle,
  Settings,
  Zap,
  Image,
  File } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EnhancedFileUpload from '@/components/EnhancedFileUpload';
import DatabaseFileUpload from '@/components/DatabaseFileUpload';
import UnifiedFileUpload from '@/components/UnifiedFileUpload';
import FileUploadManager from '@/components/FileUploadManager';
import FileDisplay from '@/components/FileDisplay';

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

const FileUploadTestPage: React.FC = () => {
  const [uploadResults, setUploadResults] = useState<FileUploadResult[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [testResults, setTestResults] = useState<{[key: string]: boolean;}>({});
  const { toast } = useToast();

  const handleFileUpload = (result: FileUploadResult) => {
    setUploadResults((prev) => [...prev, result]);
    setRefreshKey((prev) => prev + 1);

    // Mark test as successful
    setTestResults((prev) => ({
      ...prev,
      [result.fileCategory || 'general']: true
    }));

    toast({
      title: 'File uploaded successfully',
      description: `${result.fileName} has been uploaded and is accessible via View/Edit`
    });
  };

  const handleFileSelect = (file: File) => {
    setTestResults((prev) => ({
      ...prev,
      'file_select': true
    }));

    toast({
      title: 'File selected',
      description: `${file.name} has been selected for processing`
    });
  };

  const clearTestResults = () => {
    setUploadResults([]);
    setTestResults({});
    setRefreshKey((prev) => prev + 1);
  };

  const getTestStatus = (testName: string) => {
    return testResults[testName] ?
    <CheckCircle className="h-5 w-5 text-green-600" /> :

    <AlertCircle className="h-5 w-5 text-gray-400" />;

  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            File Upload System Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            This comprehensive test page verifies that all file upload components work correctly with 
            the EzSite database storage system. All uploaded files should be accessible via View and Edit options.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">✓ Database Storage Integration</Badge>
            <Badge variant="secondary">✓ File Preview & Download</Badge>
            <Badge variant="secondary">✓ View/Edit Accessibility</Badge>
            <Badge variant="secondary">✓ Auto-compression</Badge>
            <Badge variant="secondary">✓ Multiple File Types</Badge>
          </div>

          <div className="flex gap-2">
            <Button onClick={clearTestResults} variant="outline" size="sm">
              Clear Test Results
            </Button>
            <Button onClick={() => setRefreshKey((prev) => prev + 1)} variant="outline" size="sm">
              Refresh File Display
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Status */}
      <Card>
        <CardHeader>
          <CardTitle>Test Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {getTestStatus('file_select')}
              <span className="text-sm">File Selection</span>
            </div>
            <div className="flex items-center gap-2">
              {getTestStatus('document')}
              <span className="text-sm">Document Upload</span>
            </div>
            <div className="flex items-center gap-2">
              {getTestStatus('image')}
              <span className="text-sm">Image Upload</span>
            </div>
            <div className="flex items-center gap-2">
              {getTestStatus('general')}
              <span className="text-sm">General Upload</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="enhanced" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="unified">Unified</TabsTrigger>
          <TabsTrigger value="manager">Manager</TabsTrigger>
          <TabsTrigger value="view">View Files</TabsTrigger>
        </TabsList>

        {/* Enhanced File Upload Test */}
        <TabsContent value="enhanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Enhanced File Upload Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">File Selection Mode</h3>
                  <p className="text-sm text-gray-600">
                    Test file selection without database storage
                  </p>
                  <EnhancedFileUpload
                    onFileSelect={handleFileSelect}
                    accept="image/*,application/pdf,.doc,.docx"
                    label="Select File (No Upload)"
                    maxSize={5}
                    useDatabaseStorage={false} />

                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Database Storage Mode</h3>
                  <p className="text-sm text-gray-600">
                    Test file upload with database storage
                  </p>
                  <EnhancedFileUpload
                    onFileUpload={handleFileUpload}
                    accept="image/*,application/pdf,.doc,.docx"
                    label="Upload to Database"
                    maxSize={10}
                    useDatabaseStorage={true}
                    associatedTable="test_files"
                    associatedRecordId={1}
                    fileCategory="document"
                    showPreview={true} />

                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database File Upload Test */}
        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database File Upload Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Single File Upload</h3>
                  <p className="text-sm text-gray-600">
                    Test single file upload with categories
                  </p>
                  <DatabaseFileUpload
                    onFileUpload={handleFileUpload}
                    accept="image/*,application/pdf"
                    label="Upload Single File"
                    maxSize={10}
                    associatedTable="test_files"
                    associatedRecordId={2}
                    fileCategory="image"
                    allowMultiple={false} />

                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Multiple Files Upload</h3>
                  <p className="text-sm text-gray-600">
                    Test multiple file upload with descriptions
                  </p>
                  <DatabaseFileUpload
                    onFileUpload={handleFileUpload}
                    accept="*/*"
                    label="Upload Multiple Files"
                    maxSize={15}
                    associatedTable="test_files"
                    associatedRecordId={3}
                    fileCategory="general"
                    allowMultiple={true}
                    showPreview={true} />

                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Unified File Upload Test */}
        <TabsContent value="unified" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Unified File Upload Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Database Mode</h3>
                  <p className="text-sm text-gray-600">
                    Upload files to database only
                  </p>
                  <UnifiedFileUpload
                    onFileUpload={handleFileUpload}
                    accept="image/*,application/pdf,.doc,.docx"
                    label="Database Upload"
                    maxSize={10}
                    associatedTable="test_files"
                    associatedRecordId={4}
                    fileCategory="document"
                    mode="database"
                    showSettings={true} />

                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Select Mode</h3>
                  <p className="text-sm text-gray-600">
                    Select files for processing
                  </p>
                  <UnifiedFileUpload
                    onFileSelect={handleFileSelect}
                    accept="image/*,application/pdf"
                    label="Select Files"
                    maxSize={5}
                    mode="select"
                    showSettings={false} />

                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Both Mode</h3>
                  <p className="text-sm text-gray-600">
                    Both upload and select
                  </p>
                  <UnifiedFileUpload
                    onFileUpload={handleFileUpload}
                    onFileSelect={handleFileSelect}
                    accept="*/*"
                    label="Upload & Select"
                    maxSize={10}
                    associatedTable="test_files"
                    associatedRecordId={5}
                    fileCategory="general"
                    mode="both"
                    showSettings={true}
                    requireDescription={true} />

                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* File Upload Manager Test */}
        <TabsContent value="manager" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5" />
                File Upload Manager Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Comprehensive file management with upload, view, and delete capabilities
              </p>
              <FileUploadManager
                associatedTable="test_files"
                associatedRecordId={6}
                defaultCategory="general"
                allowedFileTypes="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                maxFileSize={20}
                showExistingFiles={true}
                allowMultiple={true}
                onFileUpload={handleFileUpload}
                onFileDelete={(fileId) => {
                  toast({
                    title: 'File deleted',
                    description: `File ID ${fileId} has been deleted`
                  });
                }} />

            </CardContent>
          </Card>
        </TabsContent>

        {/* View Files Test */}
        <TabsContent value="view" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                File View & Edit Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test file viewing and editing capabilities. All uploaded files should be accessible here.
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Document Files (Test Record 1)</h3>
                  <FileDisplay
                    associatedTable="test_files"
                    associatedRecordId={1}
                    fileCategory="document"
                    allowDelete={true}
                    allowEdit={true}
                    showDescription={true}
                    viewMode="grid"
                    key={`doc-${refreshKey}`} />

                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Image Files (Test Record 2)</h3>
                  <FileDisplay
                    associatedTable="test_files"
                    associatedRecordId={2}
                    fileCategory="image"
                    allowDelete={true}
                    allowEdit={true}
                    showDescription={true}
                    viewMode="grid"
                    key={`img-${refreshKey}`} />

                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">All Files (Test Record 3)</h3>
                  <FileDisplay
                    associatedTable="test_files"
                    associatedRecordId={3}
                    allowDelete={true}
                    allowEdit={true}
                    showDescription={true}
                    viewMode="list"
                    key={`all-${refreshKey}`} />

                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Upload Results */}
      {uploadResults.length > 0 &&
      <Card>
          <CardHeader>
            <CardTitle>Recent Upload Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadResults.slice(-5).map((result, index) =>
            <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{result.fileName}</p>
                      <p className="text-sm text-gray-600">
                        {(result.fileSize / 1024 / 1024).toFixed(2)} MB • {result.fileCategory}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => window.open(result.fileUrl, '_blank')}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                  const link = document.createElement('a');
                  link.href = result.fileUrl;
                  link.download = result.fileName;
                  link.click();
                }}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
            )}
            </div>
          </CardContent>
        </Card>
      }
    </div>);

};

export default FileUploadTestPage;