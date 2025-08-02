import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import IDDocumentViewer from '@/components/IDDocumentViewer';

interface Employee {
  ID: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  station: string;
  shift: string;
  hire_date: string;
  salary: number;
  is_active: boolean;
  employment_status: string;
  created_by: number;
  profile_image_id?: number | null;
  date_of_birth?: string;
  current_address?: string;
  mailing_address?: string;
  reference_name?: string;
  id_document_type?: string;
  id_document_file_id?: number | null;
  id_document_2_file_id?: number | null;
  id_document_3_file_id?: number | null;
  id_document_4_file_id?: number | null;
}

interface EnhancedIDDocumentsDisplayProps {
  employee: Employee;
  isAdminUser: boolean;
}

const EnhancedIDDocumentsDisplay: React.FC<EnhancedIDDocumentsDisplayProps> = ({ employee, isAdminUser }) => {
  const documents = [
    { fileId: employee.id_document_file_id, label: 'ID Document 1' },
    { fileId: employee.id_document_2_file_id, label: 'ID Document 2' },
    { fileId: employee.id_document_3_file_id, label: 'ID Document 3' },
    { fileId: employee.id_document_4_file_id, label: 'ID Document 4' }
  ].filter((doc) => doc.fileId);

  if (documents.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-sm font-medium">No ID documents uploaded</p>
        <p className="text-xs text-gray-400 mt-1">ID documents will appear here once uploaded</p>
      </div>);

  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-800">ID Documents ({documents.length})</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            Always visible
          </Badge>
          {isAdminUser &&
          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
              Admin: Download enabled
            </Badge>
          }
        </div>
      </div>
      
      {/* Document Type Information */}
      {employee.id_document_type &&
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Document Type:</strong> {employee.id_document_type}
          </p>
        </div>
      }
      
      {/* Enhanced Document Display Grid - Always Visible Like Profile Pictures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {documents.map((doc, index) =>
          <IDDocumentViewer
            key={index}
            fileId={doc.fileId}
            label={doc.label}
            isAdminUser={isAdminUser}
            size="lg"
            className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-hidden"
          />
        )}
      </div>

      {/* Information Panel */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p>• All ID documents are always visible like profile pictures</p>
        <p>• Click on any document to view in full screen</p>
        {isAdminUser ?
        <p>• <strong>Admin:</strong> Download buttons are visible for document management</p> :

        <p>• Download access is restricted to administrators only</p>
        }
      </div>
    </div>);

};

export default EnhancedIDDocumentsDisplay;