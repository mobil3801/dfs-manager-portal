import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Database,
  TestTube,
  Play
} from 'lucide-react';
import { completeFileDeleteService } from '@/services/completeFileDeleteService';

const IDDocumentDeletionTestPage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { toast } = useToast();

  // Load employees with ID documents
  const loadEmployeesWithDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await window.ezsite.apis.tablePage('11727', {
        PageNo: 1,
        PageSize: 20,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: []
      });

      if (error) throw new Error(error);

      // Filter employees who have at least one ID document
      const employeesWithDocs = data?.List?.filter((emp: any) => 
        emp.id_document_file_id || 
        emp.id_document_2_file_id || 
        emp.id_document_3_file_id || 
        emp.id_document_4_file_id ||
        emp.profile_image_id
      ) || [];

      setEmployees(employeesWithDocs);

      toast({
        title: 'Employees Loaded',
        description: `Found ${employeesWithDocs.length} employees with documents`
      });

    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: 'Loading Failed',
        description: 'Failed to load employees',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test deletion for a specific employee
  const testDeletion = async (employee: any) => {
    const fileIds = [
      employee.id_document_file_id,
      employee.id_document_2_file_id,
      employee.id_document_3_file_id,
      employee.id_document_4_file_id,
      employee.profile_image_id
    ].filter(Boolean);

    if (fileIds.length === 0) {
      toast({
        title: 'No Documents',
        description: 'No documents found for this employee',
        variant: 'default'
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log(`Testing deletion for employee ${employee.employee_id} with files:`, fileIds);
      
      const result = await completeFileDeleteService.completeEmployeeFileDeletion(
        employee.ID,
        fileIds
      );

      const testResult = {
        employeeId: employee.employee_id,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        attemptedFiles: fileIds,
        result: result,
        timestamp: new Date().toLocaleTimeString()
      };

      setTestResults(prev => [testResult, ...prev]);

      if (result.success) {
        toast({
          title: 'Deletion Test Successful',
          description: `Successfully deleted ${result.totalDeleted}/${result.totalAttempted} files for ${employee.employee_id}`,
          variant: 'default'
        });
        
        // Reload employees to reflect changes
        setTimeout(() => {
          loadEmployeesWithDocuments();
        }, 1000);
      } else {
        toast({
          title: 'Deletion Test Failed',
          description: `Failed to delete files for ${employee.employee_id}: ${result.errors.join(', ')}`,
          variant: 'destructive'
        });
      }

    } catch (error) {
      console.error('Error testing deletion:', error);
      toast({
        title: 'Test Error',
        description: 'An error occurred during the deletion test',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load employees on component mount
  useEffect(() => {
    loadEmployeesWithDocuments();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <TestTube className="w-6 h-6 text-red-600" />
            <div>
              <CardTitle className="text-xl text-red-900">
                ID Document Deletion Test Page
              </CardTitle>
              <p className="text-sm text-red-700 mt-1">
                Test the complete file deletion functionality for employee ID documents
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span className="font-medium">
                Found {employees.length} employees with documents
              </span>
            </div>
            <Button
              onClick={loadEmployeesWithDocuments}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Employees with Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {employees.map((employee) => {
              const fileIds = [
                employee.id_document_file_id,
                employee.id_document_2_file_id,
                employee.id_document_3_file_id,
                employee.id_document_4_file_id,
                employee.profile_image_id
              ].filter(Boolean);

              return (
                <div 
                  key={employee.ID} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">
                      {employee.first_name} {employee.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      ID: {employee.employee_id} • {fileIds.length} document{fileIds.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex space-x-1 mt-1">
                      {employee.id_document_file_id && <Badge variant="outline" className="text-xs">Doc1</Badge>}
                      {employee.id_document_2_file_id && <Badge variant="outline" className="text-xs">Doc2</Badge>}
                      {employee.id_document_3_file_id && <Badge variant="outline" className="text-xs">Doc3</Badge>}
                      {employee.id_document_4_file_id && <Badge variant="outline" className="text-xs">Doc4</Badge>}
                      {employee.profile_image_id && <Badge variant="outline" className="text-xs">Profile</Badge>}
                    </div>
                  </div>
                  <Button
                    onClick={() => testDeletion(employee)}
                    disabled={loading}
                    variant="destructive"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Test Delete
                  </Button>
                </div>
              );
            })}
            
            {employees.length === 0 && !loading && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">No employees with documents found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${
                  result.result.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {result.result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="font-medium">
                      {result.employeeName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {result.timestamp}
                  </span>
                </div>
                
                <div className="text-sm space-y-1">
                  <p className={result.result.success ? 'text-green-700' : 'text-red-700'}>
                    Employee: {result.employeeId}
                  </p>
                  <p className={result.result.success ? 'text-green-700' : 'text-red-700'}>
                    Files: {result.result.totalDeleted}/{result.result.totalAttempted} deleted
                  </p>
                  
                  {result.result.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-red-700 font-medium text-xs">Errors:</p>
                      <ul className="text-red-600 text-xs space-y-1">
                        {result.result.errors.map((error: string, errorIndex: number) => (
                          <li key={errorIndex}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {testResults.length === 0 && (
              <div className="text-center py-8">
                <TestTube className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">No test results yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Warning */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                ⚠️ Warning: This is a live deletion test
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Files will be permanently deleted from the database and cannot be recovered. 
                Only use this on test data or when you're sure you want to delete the documents.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IDDocumentDeletionTestPage;
