import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import IDFileDebugger from '@/components/IDFileDebugger';
import LiveIDDocumentViewer from '@/components/LiveIDDocumentViewer';
import { FileText } from 'lucide-react';

const IDFileDebugPage: React.FC = () => {
  // Test with the specific file IDs that are causing issues
  const problemFileIds = [123, 124];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-6 h-6" />
              <span>ID Document Debug Center</span>
            </CardTitle>
            <p className="text-gray-600">
              Comprehensive debugging for ID document file retrieval issues
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              This page helps diagnose issues with ID document files that are failing to load.
              Based on the error logs, files 123 and 124 are returning "No URL returned from server".
            </p>
          </CardContent>
        </Card>

        {/* Debug specific problem files */}
        <IDFileDebugger fileIds={problemFileIds} />

        {/* Test with Live ID Document Viewer */}
        <Card>
          <CardHeader>
            <CardTitle>Live ID Document Viewer Test</CardTitle>
            <p className="text-gray-600">
              Testing the new Live ID Document Viewer with the problematic files
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {problemFileIds.map((fileId) =>
              <div key={fileId}>
                  <h4 className="text-lg font-medium mb-3">File ID: {fileId}</h4>
                  <LiveIDDocumentViewer
                  fileId={fileId}
                  label={`Test Document ${fileId}`}
                  documentType="Driving License"
                  isAdminUser={true}
                  size="lg"
                  className="border-2 border-gray-200"
                  showDeleteButton={false} />

                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional test files */}
        <Card>
          <CardHeader>
            <CardTitle>Additional File Tests</CardTitle>
            <p className="text-gray-600">
              Testing with other file IDs to see if the issue is specific to certain files
            </p>
          </CardHeader>
          <CardContent>
            <IDFileDebugger fileIds={[120, 121, 122, 125, 126]} />
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium mb-2">File Upload API</h4>
                <p className="text-gray-600">
                  Files are uploaded using window.ezsite.apis.upload() and stored with unique file IDs.
                  These IDs are then used to retrieve URLs via window.ezsite.apis.getUploadUrl().
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Database Tables</h4>
                <p className="text-gray-600">
                  Files are tracked in the file_uploads table (ID: 26928) and referenced in 
                  the employees table (ID: 11727) via id_document_file_id fields.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Common Issues</h4>
                <ul className="text-gray-600 list-disc list-inside space-y-1">
                  <li>File was deleted from storage but reference remains in database</li>
                  <li>File ID exists but upload failed or was corrupted</li>
                  <li>Network issues preventing URL retrieval</li>
                  <li>File storage service temporarily unavailable</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Debug Strategy</h4>
                <ul className="text-gray-600 list-disc list-inside space-y-1">
                  <li>Check file_uploads table for record existence</li>
                  <li>Test URL retrieval API call with error handling</li>
                  <li>Verify URL accessibility with HTTP requests</li>
                  <li>Implement retry logic with exponential backoff</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

};

export default IDFileDebugPage;