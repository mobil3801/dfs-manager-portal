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
  Shield,
  Eye,
  Download,
  ExternalLink } from
'lucide-react';
import RobustIDDocumentsDisplay from '@/components/RobustIDDocumentsDisplay';
import EnhancedIDDocumentDeletionManager from '@/components/EnhancedIDDocumentDeletionManager';
import { completeFileDeleteService } from '@/services/completeFileDeleteService';

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

interface CompleteIDDocumentManagerProps {
  employee: Employee;
  isAdminUser: boolean;
  onRefresh?: () => void;
  showDeletionManager?: boolean;
  className?: string;
}

const CompleteIDDocumentManager: React.FC<CompleteIDDocumentManagerProps> = ({
  employee,
  isAdminUser,
  onRefresh,
  showDeletionManager = true,
  className = ''
}) => {
  const [localEmployee, setLocalEmployee] = useState<Employee>(employee);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Update local state when employee prop changes
  useEffect(() => {
    setLocalEmployee(employee);
  }, [employee]);

  // Get document count for display
  const getDocumentCount = () => {
    const files = [
    localEmployee.id_document_file_id,
    localEmployee.id_document_2_file_id,
    localEmployee.id_document_3_file_id,
    localEmployee.id_document_4_file_id,
    localEmployee.profile_image_id].
    filter(Boolean);

    return files.length;
  };

  // Handle refresh with enhanced error handling
  const handleRefresh = async () => {
    if (!onRefresh) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
      toast({
        title: 'Refreshed Successfully',
        description: 'Document display has been updated with latest data.',
        variant: 'default'
      });
    } catch (error) {
      console.error('[CompleteIDDocumentManager] Error during refresh:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh document display. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle document deletion with state update
  const handleDocumentDeleted = (documentKey: string, fileId: number) => {
    console.log(`[CompleteIDDocumentManager] Document deleted: ${documentKey} (${fileId})`);

    // Update local state to reflect the deletion
    setLocalEmployee((prev) => ({
      ...prev,
      [documentKey]: null
    }));

    // Schedule a refresh after a short delay to ensure backend consistency
    setTimeout(() => {
      if (onRefresh) {
        onRefresh();
      }
    }, 1500);
  };

  const documentCount = getDocumentCount();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-blue-900">
                  Complete ID Document Manager
                </CardTitle>
                <p className="text-sm text-blue-700">
                  {localEmployee.first_name} {localEmployee.last_name} • {documentCount} Document{documentCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white">

                <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {isAdminUser &&
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              }
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Document Display */}
      <RobustIDDocumentsDisplay
        employee={localEmployee}
        isAdminUser={isAdminUser}
        onRefresh={handleRefresh}
        allowDelete={isAdminUser}
        showPreview={true} />


      {/* Enhanced Deletion Manager */}
      {showDeletionManager && isAdminUser && documentCount > 0 &&
      <EnhancedIDDocumentDeletionManager
        employee={localEmployee}
        isAdminUser={isAdminUser}
        onRefresh={handleRefresh}
        onDelete={handleDocumentDeleted}
        className="mt-6" />

      }

      {/* Information Panel */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">
                <strong>Complete Document Management:</strong> Full lifecycle document handling with secure deletion
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">
                <strong>Robust Deletion:</strong> Files are completely removed from database, storage, and all references
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">
                <strong>Live Preview:</strong> Real-time document viewing with enhanced error recovery
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">
                <strong>Admin Features:</strong> Comprehensive deletion tools with individual and bulk operations
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default CompleteIDDocumentManager;