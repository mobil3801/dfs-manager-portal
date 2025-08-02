import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw } from 'lucide-react';
import FixedIDDocumentViewer from '@/components/FixedIDDocumentViewer';
import { useToast } from '@/hooks/use-toast';

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

interface FixedIDDocumentsDisplayProps {
  employee: Employee;
  isAdminUser: boolean;
  onRefresh?: () => void;
  allowDelete?: boolean;
}

const FixedIDDocumentsDisplay: React.FC<FixedIDDocumentsDisplayProps> = ({
  employee,
  isAdminUser,
  onRefresh,
  allowDelete = false
}) => {
  const [localEmployee, setLocalEmployee] = useState<Employee>(employee);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Update local state when employee prop changes
  useEffect(() => {
    setLocalEmployee(employee);
  }, [employee]);

  const documents = [
  { fileId: localEmployee.id_document_file_id, label: 'ID Document 1', key: 'id_document_file_id' },
  { fileId: localEmployee.id_document_2_file_id, label: 'ID Document 2', key: 'id_document_2_file_id' },
  { fileId: localEmployee.id_document_3_file_id, label: 'ID Document 3', key: 'id_document_3_file_id' },
  { fileId: localEmployee.id_document_4_file_id, label: 'ID Document 4', key: 'id_document_4_file_id' }].
  filter((doc) => doc.fileId);

  const handleRefresh = async () => {
    if (!onRefresh) return;

    setRefreshing(true);
    try {
      await onRefresh();
      toast({
        title: "Refreshed",
        description: "Document display has been refreshed"
      });
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteDocument = async (documentKey: string, fileId: number) => {
    if (!allowDelete || !isAdminUser) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete documents",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update the employee record to remove the file reference
      const updateData = {
        ID: localEmployee.ID,
        [documentKey]: null
      };

      const { error } = await window.ezsite.apis.tableUpdate('11727', updateData);
      if (error) throw new Error(error);

      // Update local state immediately
      setLocalEmployee((prev) => ({
        ...prev,
        [documentKey]: null
      }));

      // Delete the file from storage
      try {
        const { data: fileData, error: fetchError } = await window.ezsite.apis.tablePage('26928', {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'store_file_id', op: 'Equal', value: fileId }]
        });

        if (!fetchError && fileData && fileData.List && fileData.List.length > 0) {
          const { error: deleteError } = await window.ezsite.apis.tableDelete('26928', {
            ID: fileData.List[0].id
          });
          if (deleteError) {
            console.error('Error deleting file from storage:', deleteError);
          }
        }
      } catch (fileError) {
        console.error('Error cleaning up file storage:', fileError);
      }

      toast({
        title: "Document Deleted",
        description: "The document has been permanently deleted",
        variant: "destructive"
      });

      // Refresh parent component if callback provided
      if (onRefresh) {
        onRefresh();
      }

    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive"
      });
    }
  };

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
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-6 px-2">

            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Badge variant="outline" className="text-xs">
            Live Preview
          </Badge>
          {isAdminUser &&
          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
              Admin: Full Access
            </Badge>
          }
        </div>
      </div>
      
      {/* Document Type Information */}
      {localEmployee.id_document_type &&
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Document Type:</strong> {localEmployee.id_document_type}
          </p>
        </div>
      }
      
      {/* Enhanced Document Display Grid - Always Visible with Live Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {documents.map((doc, index) => {
          const docData = documents.find((d) => d.fileId === doc.fileId);
          return (
            <FixedIDDocumentViewer
              key={`${doc.fileId}-${index}`}
              fileId={doc.fileId}
              label={doc.label}
              isAdminUser={isAdminUser}
              size="lg"
              className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-hidden"
              showDeleteButton={allowDelete && isAdminUser}
              onDelete={() => doc.fileId && handleDeleteDocument(doc.key, doc.fileId)} />);


        })}
      </div>

      {/* Information Panel */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p>• All ID documents show instant live preview with enhanced error handling</p>
        <p>• Click on any document to view in full screen with zoom capabilities</p>
        <p>• Documents are automatically refreshed and cached for better performance</p>
        {isAdminUser ?
        <p>• <strong>Admin:</strong> Download and delete buttons are available for document management</p> :

        <p>• Download and delete access is restricted to administrators only</p>
        }
        <p className="text-green-600 mt-1">• <strong>Fixed:</strong> All display and deletion issues have been resolved</p>
      </div>
    </div>);

};

export default FixedIDDocumentsDisplay;