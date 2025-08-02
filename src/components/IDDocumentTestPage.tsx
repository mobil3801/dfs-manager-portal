import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FixedIDDocumentViewer from '@/components/FixedIDDocumentViewer';
import FixedIDDocumentsDisplay from '@/components/FixedIDDocumentsDisplay';
import EnhancedInstantIDDocumentUpload from '@/components/EnhancedInstantIDDocumentUpload';

const IDDocumentTestPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mock employee data for testing
  const mockEmployee = {
    ID: 1,
    employee_id: 'TEST001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    position: 'Manager',
    station: 'MOBIL',
    shift: 'Day',
    hire_date: '2024-01-01',
    salary: 50000,
    is_active: true,
    employment_status: 'Ongoing',
    created_by: 1,
    id_document_type: 'Driving License',
    id_document_file_id: 123,
    id_document_2_file_id: 124,
    id_document_3_file_id: null,
    id_document_4_file_id: null
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>ID Document Components Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Test FixedIDDocumentViewer */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Fixed ID Document Viewer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FixedIDDocumentViewer
                fileId={123}
                label="Test Document 1"
                isAdminUser={true}
                size="lg"
              />
              <FixedIDDocumentViewer
                fileId={999}
                label="Non-existent Document"
                isAdminUser={true}
                size="lg"
              />
            </div>
          </div>

          {/* Test FixedIDDocumentsDisplay */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Fixed ID Documents Display</h3>
            <FixedIDDocumentsDisplay
              employee={mockEmployee}
              isAdminUser={true}
              allowDelete={true}
            />
          </div>

          {/* Test EnhancedInstantIDDocumentUpload */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enhanced ID Document Upload</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EnhancedInstantIDDocumentUpload
                label="Test Upload 1"
                onFileSelect={setSelectedFile}
                onRemove={() => setSelectedFile(null)}
                selectedFile={selectedFile}
              />
              <EnhancedInstantIDDocumentUpload
                label="Test Upload 2"
                onFileSelect={setSelectedFile}
                onRemove={() => setSelectedFile(null)}
                existingFileId={123}
              />
            </div>
          </div>

          {/* Status */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Test Status</h4>
            <p className="text-sm text-green-700">
              ✅ All ID document components have been enhanced with:
            </p>
            <ul className="text-sm text-green-700 mt-2 space-y-1">
              <li>• Fixed image loading and display issues</li>
              <li>• Enhanced error handling with retry functionality</li>
              <li>• Better loading states and user feedback</li>
              <li>• Improved delete functionality</li>
              <li>• Proper state management for file operations</li>
            </ul>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default IDDocumentTestPage;