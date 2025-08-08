import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, FileText, Eye, CheckCircle } from 'lucide-react';
import EnhancedLiveIDDocumentsDisplay from '@/components/EnhancedLiveIDDocumentsDisplay';

const EnhancedIDDocumentTestPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAdminUser, setIsAdminUser] = useState(true);
  const { toast } = useToast();

  // Sample employee data with ID documents
  const sampleEmployee = {
    ID: 1,
    employee_id: 'EMP001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    position: 'Manager',
    station: 'Station A',
    shift: 'Day',
    hire_date: '2023-01-15',
    salary: 50000,
    is_active: true,
    employment_status: 'Active',
    created_by: 1,
    profile_image_id: null,
    date_of_birth: '1990-05-15',
    current_address: '123 Main St, City, State',
    mailing_address: '123 Main St, City, State',
    reference_name: 'Jane Smith',
    id_document_type: 'Driving License',
    // Use actual file IDs that might exist in the system for testing
    id_document_file_id: 1001,
    id_document_2_file_id: 1002,
    id_document_3_file_id: null,
    id_document_4_file_id: null
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    toast({
      title: "Refreshed",
      description: "Document display has been refreshed"
    });
  };

  const toggleAdminAccess = () => {
    setIsAdminUser((prev) => !prev);
    toast({
      title: "Access Changed",
      description: `Switched to ${!isAdminUser ? 'Admin' : 'Regular'} user view`
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <span>Enhanced ID Document Viewer Test</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Testing the enhanced live preview with proper ID display
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Button
                variant={isAdminUser ? 'default' : 'outline'}
                size="sm"
                onClick={toggleAdminAccess}>
                {isAdminUser ? 'Admin View' : 'User View'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enhanced Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Proper ID display format</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Fixed file URL retrieval</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Enhanced error handling</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Live preview status</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Connection monitoring</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Automatic retry logic</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Panel */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Test Environment
              </Badge>
              <Badge variant={isAdminUser ? 'default' : 'outline'}>
                {isAdminUser ? 'Admin Access' : 'User Access'}
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Eye className="w-3 h-3 mr-1" />
                Live Preview Active
              </Badge>
            </div>
            <span className="text-xs text-gray-500">
              Refresh Key: {refreshKey}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced ID Documents Display */}
      <EnhancedLiveIDDocumentsDisplay
        key={refreshKey}
        employee={sampleEmployee}
        isAdminUser={isAdminUser}
        onRefresh={handleRefresh}
        allowDelete
        showPreview />


      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">✅ Fixed Issues</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Document IDs now display as "ID: {fileId}" instead of long URLs</li>
                <li>• Enhanced file URL retrieval with proper error handling</li>
                <li>• Added connection status monitoring and retry mechanisms</li>
                <li>• Improved loading states and user feedback</li>
              </ul>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">🚀 New Features</h4>
              <ul className="space-y-1 text-green-700">
                <li>• Live preview status indicators</li>
                <li>• Automatic connection testing every 30 seconds</li>
                <li>• Enhanced document viewer with better error recovery</li>
                <li>• Real-time document type display</li>
              </ul>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-2">🔧 Technical Improvements</h4>
              <ul className="space-y-1 text-purple-700">
                <li>• Exponential backoff retry strategy</li>
                <li>• Request timeout handling (15 seconds)</li>
                <li>• Enhanced image validation and loading</li>
                <li>• Proper URL validation and CORS handling</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default EnhancedIDDocumentTestPage;