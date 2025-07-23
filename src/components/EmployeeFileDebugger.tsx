import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { FileText, Trash2, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface FileRecord {
  id: number;
  file_name: string;
  file_size: number;
  file_type: string;
  store_file_id: number;
  uploaded_by: number;
  upload_date: string;
  associated_table: string;
  associated_record_id: number;
  file_category: string;
  is_active: boolean;
  description: string;
  file_url: string;
}

interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  id_document_file_id?: number | null;
  id_document_2_file_id?: number | null;
  id_document_3_file_id?: number | null;
  id_document_4_file_id?: number | null;
  profile_image_id?: number | null;
}

interface EmployeeFileDebuggerProps {
  employeeId?: number;
  className?: string;
}

const EmployeeFileDebugger: React.FC<EmployeeFileDebuggerProps> = ({
  employeeId,
  className = ''
}) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [fileRecords, setFileRecords] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [orphanedFiles, setOrphanedFiles] = useState<FileRecord[]>([]);

  useEffect(() => {
    if (employeeId) {
      loadEmployeeFileData();
    }
  }, [employeeId]);

  const loadEmployeeFileData = async () => {
    if (!employeeId) return;

    try {
      setLoading(true);

      // Load employee data
      const { data: empData, error: empError } = await window.ezsite.apis.tablePage('11727', {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'ID', op: 'Equal', value: employeeId }]
      });

      if (empError) {
        console.error('Error loading employee:', empError);
        toast({
          title: "Error",
          description: "Failed to load employee data",
          variant: "destructive"
        });
        return;
      }

      if (empData?.List?.length > 0) {
        setEmployee(empData.List[0]);
      }

      // Load all file records associated with this employee
      const { data: fileData, error: fileError } = await window.ezsite.apis.tablePage('26928', {
        PageNo: 1,
        PageSize: 100,
        Filters: [
        { name: 'associated_table', op: 'Equal', value: 'employees' },
        { name: 'associated_record_id', op: 'Equal', value: employeeId }]

      });

      if (fileError) {
        console.error('Error loading file records:', fileError);
        toast({
          title: "Error",
          description: "Failed to load file records",
          variant: "destructive"
        });
        return;
      }

      setFileRecords(fileData?.List || []);

      // Check for orphaned files (files that exist in file_uploads but not referenced in employee record)
      await checkForOrphanedFiles(empData?.List?.[0], fileData?.List || []);

    } catch (error) {
      console.error('Error in loadEmployeeFileData:', error);
      toast({
        title: "Error",
        description: "Failed to load employee file data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkForOrphanedFiles = async (emp: Employee, files: FileRecord[]) => {
    if (!emp) return;

    const referencedFileIds = [
    emp.id_document_file_id,
    emp.id_document_2_file_id,
    emp.id_document_3_file_id,
    emp.id_document_4_file_id,
    emp.profile_image_id].
    filter((id) => id != null);

    const orphaned = files.filter((file) =>
    !referencedFileIds.includes(file.store_file_id) && file.is_active
    );

    setOrphanedFiles(orphaned);
  };

  const cleanupOrphanedFile = async (fileRecord: FileRecord) => {
    try {
      const confirmDelete = window.confirm(
        `Are you sure you want to permanently delete this orphaned file?\n\nFile: ${fileRecord.file_name}\nThis action cannot be undone.`
      );

      if (!confirmDelete) return;

      // Mark file as inactive
      const { error } = await window.ezsite.apis.tableUpdate('26928', {
        ID: fileRecord.id,
        is_active: false,
        description: `${fileRecord.description} - Cleaned up as orphaned file on ${new Date().toISOString()}`
      });

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Success",
        description: "Orphaned file cleaned up successfully"
      });

      // Reload data
      loadEmployeeFileData();

    } catch (error) {
      console.error('Error cleaning up orphaned file:', error);
      toast({
        title: "Error",
        description: "Failed to cleanup orphaned file",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-red-500';
  };

  if (!employeeId) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Employee File Debugger</span>
          </CardTitle>
          <CardDescription>
            Select an employee to debug their file associations
          </CardDescription>
        </CardHeader>
      </Card>);

  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Employee File Debugger</span>
              </CardTitle>
              <CardDescription>
                {employee ?
                `Debugging files for ${employee.first_name} ${employee.last_name} (${employee.employee_id})` :
                'Loading employee data...'
                }
              </CardDescription>
            </div>
            <Button onClick={loadEmployeeFileData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Employee File References */}
          {employee &&
          <div>
              <h3 className="text-lg font-semibold mb-4">Employee Record File References</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">ID Documents</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span>ID Document 1:</span>
                      <Badge variant={employee.id_document_file_id ? "default" : "secondary"}>
                        {employee.id_document_file_id || 'None'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>ID Document 2:</span>
                      <Badge variant={employee.id_document_2_file_id ? "default" : "secondary"}>
                        {employee.id_document_2_file_id || 'None'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>ID Document 3:</span>
                      <Badge variant={employee.id_document_3_file_id ? "default" : "secondary"}>
                        {employee.id_document_3_file_id || 'None'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>ID Document 4:</span>
                      <Badge variant={employee.id_document_4_file_id ? "default" : "secondary"}>
                        {employee.id_document_4_file_id || 'None'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Profile Image</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span>Profile Image:</span>
                    <Badge variant={employee.profile_image_id ? "default" : "secondary"}>
                      {employee.profile_image_id || 'None'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          }

          {/* File Records Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              File Upload Records ({fileRecords.length})
            </h3>
            {fileRecords.length === 0 ?
            <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No file records found for this employee</p>
              </div> :

            <div className="space-y-2">
                {fileRecords.map((file) =>
              <Card key={file.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium truncate">{file.file_name}</span>
                          <Badge className={`text-white ${getFileStatusColor(file.is_active)}`}>
                            {file.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            ID: {file.store_file_id}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Category: {file.file_category}</div>
                          <div>Size: {formatFileSize(file.file_size)}</div>
                          <div>Uploaded: {formatDate(file.upload_date)}</div>
                          <div>Description: {file.description}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
              )}
              </div>
            }
          </div>

          {/* Orphaned Files */}
          {orphanedFiles.length > 0 &&
          <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span>Orphaned Files ({orphanedFiles.length})</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                These files exist in the database but are not referenced by the employee record.
                They may be left over from deleted files.
              </p>
              <div className="space-y-2">
                {orphanedFiles.map((file) =>
              <Card key={file.id} className="p-4 border-orange-200 bg-orange-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="font-medium truncate">{file.file_name}</span>
                          <Badge variant="outline" className="text-xs">
                            ID: {file.store_file_id}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Category: {file.file_category}</div>
                          <div>Size: {formatFileSize(file.file_size)}</div>
                          <div>Uploaded: {formatDate(file.upload_date)}</div>
                        </div>
                      </div>
                      <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cleanupOrphanedFile(file)}
                    className="text-red-600 hover:text-red-700">

                        <Trash2 className="w-4 h-4 mr-1" />
                        Cleanup
                      </Button>
                    </div>
                  </Card>
              )}
              </div>
            </div>
          }

          {/* Summary */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Active Files: {fileRecords.filter((f) => f.is_active).length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span>Inactive Files: {fileRecords.filter((f) => !f.is_active).length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span>Orphaned Files: {orphanedFiles.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default EmployeeFileDebugger;