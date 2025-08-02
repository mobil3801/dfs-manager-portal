import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  FileX, 
  Database,
  RefreshCw,
  Shield
} from 'lucide-react';
import { completeFileDeleteService } from '@/services/completeFileDeleteService';

interface Employee {
  ID: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  id_document_file_id?: number | null;
  id_document_2_file_id?: number | null;
  id_document_3_file_id?: number | null;
  id_document_4_file_id?: number | null;
  profile_image_id?: number | null;
  [key: string]: any;
}

interface EnhancedIDDocumentDeletionManagerProps {
  employee: Employee;
  isAdminUser: boolean;
  onRefresh?: () => void;
  onDelete?: (documentKey: string, fileId: number) => void;
  className?: string;
}

const EnhancedIDDocumentDeletionManager: React.FC<EnhancedIDDocumentDeletionManagerProps> = ({
  employee,
  isAdminUser,
  onRefresh,
  onDelete,
  className = ''
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastDeletionResult, setLastDeletionResult] = useState<any>(null);
  const { toast } = useToast();

  // Get all file IDs from employee record
  const getAllFileIds = (): { fileId: number; documentKey: string; label: string }[] => {
    const files: { fileId: number; documentKey: string; label: string }[] = [];
    
    if (employee.id_document_file_id) {
      files.push({
        fileId: employee.id_document_file_id,
        documentKey: 'id_document_file_id',
        label: 'ID Document 1'
      });
    }
    
    if (employee.id_document_2_file_id) {
      files.push({
        fileId: employee.id_document_2_file_id,
        documentKey: 'id_document_2_file_id',
        label: 'ID Document 2'
      });
    }
    
    if (employee.id_document_3_file_id) {
      files.push({
        fileId: employee.id_document_3_file_id,
        documentKey: 'id_document_3_file_id',
        label: 'ID Document 3'
      });
    }
    
    if (employee.id_document_4_file_id) {
      files.push({
        fileId: employee.id_document_4_file_id,
        documentKey: 'id_document_4_file_id',
        label: 'ID Document 4'
      });
    }
    
    if (employee.profile_image_id) {
      files.push({
        fileId: employee.profile_image_id,
        documentKey: 'profile_image_id',
        label: 'Profile Image'
      });
    }
    
    return files;
  };

  // Handle single document deletion
  const handleSingleDocumentDeletion = async (documentKey: string, fileId: number, label: string) => {
    if (!isAdminUser) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can delete documents',
        variant: 'destructive'
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      console.log(`[EnhancedIDDocumentDeletionManager] Deleting single document: ${label} (ID: ${fileId})`);
      
      // Use the complete deletion service
      const result = await completeFileDeleteService.completeEmployeeFileDeletion(
        employee.ID, 
        [fileId]
      );

      setLastDeletionResult(result);

      if (result.success) {
        toast({
          title: 'Document Deleted Successfully',
          description: `${label} has been permanently deleted from all systems.`,
          variant: 'destructive'
        });

        // Call the parent deletion callback if provided
        if (onDelete) {
          onDelete(documentKey, fileId);
        }

        // Refresh the display
        if (onRefresh) {
          setTimeout(() => {
            onRefresh();
          }, 1000);
        }
      } else {
        throw new Error(`Deletion failed: ${result.errors.join(', ')}`);
      }

    } catch (error) {
      console.error('[EnhancedIDDocumentDeletionManager] Error during single document deletion:', error);
      toast({
        title: 'Deletion Failed',
        description: `Failed to delete ${label}. Please try again or contact support.`,
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle bulk deletion of all documents
  const handleBulkDeletion = async () => {
    if (!isAdminUser) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can delete documents',
        variant: 'destructive'
      });
      return;
    }

    const allFiles = getAllFileIds();
    if (allFiles.length === 0) {
      toast({
        title: 'No Documents Found',
        description: 'There are no documents to delete for this employee.',
        variant: 'default'
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      console.log(`[EnhancedIDDocumentDeletionManager] Starting bulk deletion of ${allFiles.length} documents`);
      
      const fileIds = allFiles.map(f => f.fileId);
      const result = await completeFileDeleteService.completeEmployeeFileDeletion(
        employee.ID, 
        fileIds
      );

      setLastDeletionResult(result);

      if (result.success) {
        toast({
          title: 'Bulk Deletion Successful',
          description: `${result.totalDeleted} document(s) permanently deleted from all systems.`,
          variant: 'destructive'
        });

        // Call deletion callbacks for all files
        if (onDelete) {
          allFiles.forEach(file => {
            onDelete(file.documentKey, file.fileId);
          });
        }

        // Refresh the display
        if (onRefresh) {
          setTimeout(() => {
            onRefresh();
          }, 1500);
        }
      } else {
        throw new Error(`Bulk deletion failed: ${result.errors.join(', ')}`);
      }

    } catch (error) {
      console.error('[EnhancedIDDocumentDeletionManager] Error during bulk deletion:', error);
      toast({
        title: 'Bulk Deletion Failed',
        description: 'Failed to delete all documents. Some files may have been deleted.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const allFiles = getAllFileIds();

  if (!isAdminUser) {
    return null;
  }

  if (allFiles.length === 0) {
    return (
      <Card className={`border-gray-200 ${className}`}>
        <CardContent className="text-center py-6">
          <FileX className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-500">No documents available for deletion</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-red-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-600" />
            <CardTitle className="text-lg text-red-800">Document Deletion Manager</CardTitle>
          </div>
          <Badge variant="destructive" className="text-xs">
            Admin Only
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Employee Info */}
        <div className="p-3 bg-gray-50 rounded-lg border">
          <p className="text-sm font-medium text-gray-900">
            {employee.first_name} {employee.last_name}
          </p>
          <p className="text-xs text-gray-600">
            Employee ID: {employee.employee_id} • Total Documents: {allFiles.length}
          </p>
        </div>

        {/* Individual Document Deletion */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-800">Individual Document Deletion</h4>
          <div className="grid grid-cols-1 gap-2">
            {allFiles.map((file) => (
              <div key={file.documentKey} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">{file.label}</span>
                  <Badge variant="outline" className="text-xs">
                    ID: {file.fileId}
                  </Badge>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleSingleDocumentDeletion(file.documentKey, file.fileId, file.label)}
                  disabled={isDeleting}
                  className="h-6 px-2 text-xs"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Bulk Deletion */}
        {allFiles.length > 1 && (
          <div className="space-y-3 pt-3 border-t border-red-200">
            <h4 className="text-sm font-medium text-gray-800">Bulk Deletion</h4>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Danger Zone</span>
              </div>
              <p className="text-xs text-red-700 mb-3">
                This will permanently delete ALL {allFiles.length} documents from the database and storage. 
                This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDeletion}
                disabled={isDeleting}
                className="w-full"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting All Documents...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All {allFiles.length} Documents
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Last Deletion Result */}
        {lastDeletionResult && (
          <div className="space-y-2 pt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-800">Last Operation Result</h4>
            <div className={`p-3 rounded-lg border ${
              lastDeletionResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {lastDeletionResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  lastDeletionResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {lastDeletionResult.success ? 'Deletion Successful' : 'Deletion Failed'}
                </span>
              </div>
              <div className="text-xs space-y-1">
                <p className={lastDeletionResult.success ? 'text-green-700' : 'text-red-700'}>
                  Deleted: {lastDeletionResult.totalDeleted}/{lastDeletionResult.totalAttempted} files
                </p>
                {lastDeletionResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-red-700 font-medium">Errors:</p>
                    <ul className="text-red-600 text-xs space-y-1">
                      {lastDeletionResult.errors.map((error: string, index: number) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="pt-2 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isDeleting}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Document Display
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedIDDocumentDeletionManager;
