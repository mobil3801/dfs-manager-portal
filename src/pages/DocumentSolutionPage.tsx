import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Database,
  Upload,
  Settings,
  Download,
  Eye,
  ExternalLink,
  Info } from
'lucide-react';
import FixedDocumentViewer from '@/components/FixedDocumentViewer';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DocumentSolutionPage: React.FC = () => {
  const [realFiles, setRealFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadRealFiles();
  }, []);

  const loadRealFiles = async () => {
    setIsLoading(true);
    try {
      console.log('[DocumentSolutionPage] Loading real files from database...');

      const response = await window.ezsite.apis.tablePage('26928', {
        PageNo: 1,
        PageSize: 10,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const files = response.data?.List || [];
      console.log(`[DocumentSolutionPage] Found ${files.length} files in database`);

      setRealFiles(files);

      // Set the first file as selected
      if (files.length > 0 && files[0].store_file_id) {
        setSelectedFileId(files[0].store_file_id);
      }

      toast({
        title: 'Files Loaded',
        description: `Found ${files.length} files in the database`
      });
    } catch (error) {
      console.error('[DocumentSolutionPage] Error loading files:', error);
      toast({
        title: 'Error Loading Files',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testFileUrl = async (fileId: number) => {
    try {
      console.log(`[DocumentSolutionPage] Testing URL for file ${fileId}`);

      const response = await window.ezsite.apis.getUploadUrl(fileId);

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('No URL returned from server');
      }

      console.log(`[DocumentSolutionPage] URL test successful for file ${fileId}`);

      toast({
        title: 'URL Test Successful',
        description: `File ${fileId} URL is accessible`
      });

      return response.data;
    } catch (error) {
      console.error(`[DocumentSolutionPage] URL test failed for file ${fileId}:`, error);

      toast({
        title: 'URL Test Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });

      return null;
    }
  };

  const handleFileSelect = (fileId: number) => {
    setSelectedFileId(fileId);
    console.log(`[DocumentSolutionPage] Selected file ID: ${fileId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span>Document Loading Solution</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Fixed document viewer using real database files with proper error handling
              </p>
            </div>
            <Button onClick={loadRealFiles} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh Files'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Solution Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-600" />
            <span>Solution Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-800">Fixed URL Display</p>
                <p className="text-xs text-green-600">Shows "ID: fileId" instead of long URLs</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-blue-800">Enhanced Error Handling</p>
                <p className="text-xs text-blue-600">Clear error messages and retry options</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-purple-800">Real File Integration</p>
                <p className="text-xs text-purple-600">Uses actual database files for testing</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <CheckCircle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-orange-800">Auto Retry System</p>
                <p className="text-xs text-orange-600">Automatic retry with manual override</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <CheckCircle className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-sm font-medium text-indigo-800">Status Indicators</p>
                <p className="text-xs text-indigo-600">Real-time loading and error states</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
              <CheckCircle className="w-5 h-5 text-teal-500" />
              <div>
                <p className="text-sm font-medium text-teal-800">Image Detection</p>
                <p className="text-xs text-teal-600">Automatic image vs document detection</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Available Files from Database</span>
            <Badge variant="secondary">{realFiles.length} files found</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ?
          <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading files from database...</span>
            </div> :
          realFiles.length > 0 ?
          <div className="space-y-3">
              {realFiles.map((file) =>
            <div
              key={file.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedFileId === file.store_file_id ?
              'border-blue-500 bg-blue-50' :
              'border-gray-200 hover:border-gray-300'}`
              }
              onClick={() => handleFileSelect(file.store_file_id)}>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">File ID: {file.store_file_id}</p>
                      <p className="text-xs text-gray-500">
                        {file.file_name || 'Unnamed file'} • {file.file_type || 'Unknown type'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Uploaded: {new Date(file.upload_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedFileId === file.store_file_id &&
                  <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
                  }
                      <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      testFileUrl(file.store_file_id);
                    }}>

                        Test URL
                      </Button>
                    </div>
                  </div>
                </div>
            )}
            </div> :

          <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No files found in the database. Upload some files to test the document viewer.
              </AlertDescription>
            </Alert>
          }
        </CardContent>
      </Card>

      {/* Fixed Document Viewer Demo */}
      {selectedFileId &&
      <Card>
          <CardHeader>
            <CardTitle>Fixed Document Viewer Demo</CardTitle>
            <p className="text-sm text-gray-600">
              Testing with real File ID: {selectedFileId}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document Viewer */}
              <div>
                <h4 className="font-medium mb-3">Document Viewer</h4>
                <FixedDocumentViewer
                fileId={selectedFileId}
                label={`Document ${selectedFileId}`}
                isAdminUser={true}
                size="lg"
                showRetryButton={true} />

              </div>
              
              {/* Status Information */}
              <div>
                <h4 className="font-medium mb-3">Status & Controls</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="text-sm font-medium mb-2">Current File Info</h5>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><strong>File ID:</strong> {selectedFileId}</p>
                      <p><strong>Component:</strong> FixedDocumentViewer</p>
                      <p><strong>Admin Access:</strong> Enabled</p>
                      <p><strong>Auto Retry:</strong> Available</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testFileUrl(selectedFileId)}
                    className="w-full">

                      <ExternalLink className="w-4 h-4 mr-2" />
                      Test File URL Directly
                    </Button>
                    
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const file = realFiles.find((f) => f.store_file_id === selectedFileId);
                      if (file) {
                        navigator.clipboard.writeText(JSON.stringify(file, null, 2));
                        toast({
                          title: 'Copied',
                          description: 'File data copied to clipboard'
                        });
                      }
                    }}
                    className="w-full">

                      <FileText className="w-4 h-4 mr-2" />
                      Copy File Data
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      }

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-700">✅ What's Fixed</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <strong>ID Display:</strong> Shows "ID: {fileId}" instead of full URLs</li>
                <li>• <strong>Error Messages:</strong> Clear, actionable error descriptions</li>
                <li>• <strong>Retry Logic:</strong> Manual retry with attempt counter</li>
                <li>• <strong>Loading States:</strong> Proper loading indicators</li>
                <li>• <strong>Image Detection:</strong> Automatic image vs document handling</li>
                <li>• <strong>Status Indicators:</strong> Real-time status with icons</li>
                <li>• <strong>Error Recovery:</strong> Graceful error handling</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-blue-700">🔧 Technical Features</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <strong>API Integration:</strong> Direct window.ezsite.apis.getUploadUrl()</li>
                <li>• <strong>Image Testing:</strong> 8-second timeout for image loading</li>
                <li>• <strong>Error Boundaries:</strong> Component-level error handling</li>
                <li>• <strong>State Management:</strong> Comprehensive state tracking</li>
                <li>• <strong>User Feedback:</strong> Toast notifications for actions</li>
                <li>• <strong>Admin Features:</strong> Download buttons for admin users</li>
                <li>• <strong>Responsive Design:</strong> Works on all screen sizes</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="text-sm font-medium text-blue-800 mb-2">💡 Usage Instructions</h5>
            <ol className="text-xs text-blue-700 space-y-1">
              <li>1. Select a file from the "Available Files" section above</li>
              <li>2. The Fixed Document Viewer will automatically load the file</li>
              <li>3. If loading fails, use the retry button to try again</li>
              <li>4. Click "Test File URL Directly" to verify the file URL works</li>
              <li>5. Admin users can download files using the download button</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default DocumentSolutionPage;