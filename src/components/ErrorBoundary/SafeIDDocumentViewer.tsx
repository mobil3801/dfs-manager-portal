import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle } from 'lucide-react';

interface SafeIDDocumentViewerProps {
  fileId: number | null;
  label: string;
  documentType?: string;
  isAdminUser?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SafeIDDocumentViewer: React.FC<SafeIDDocumentViewerProps> = ({
  fileId,
  label,
  documentType = 'Document',
  isAdminUser = false,
  size = 'lg',
  className = ''
}) => {
  // Safe display ID function
  const getDisplayId = (): string => {
    try {
      if (!fileId || fileId === null || fileId === undefined) {
        return 'No ID';
      }
      return `ID: ${fileId}`;
    } catch (error) {
      console.error('[SafeIDDocumentViewer] Error getting display ID:', error);
      return 'ID: Error';
    }
  };

  // Safe document name function
  const getCleanDocumentName = (): string => {
    try {
      if (!label || typeof label !== 'string') {
        return `${documentType} ${fileId || 'Unknown'}`;
      }

      let cleanName = label.replace(/https?:\/\/[^\s]+/g, '').trim();
      cleanName = cleanName.replace(/\.(jpg|jpeg|png|gif|pdf|doc|docx)$/i, '');

      if (!cleanName) {
        return `${documentType} ${fileId || 'Unknown'}`;
      }

      return cleanName;
    } catch (error) {
      console.error('[SafeIDDocumentViewer] Error getting clean document name:', error);
      return `${documentType} Document`;
    }
  };

  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm':return 'h-24';
      case 'md':return 'h-32';
      case 'lg':return 'h-48';
      case 'xl':return 'h-80';
      default:return 'h-48';
    }
  };

  // Don't render if no file ID
  if (!fileId) {
    return null;
  }

  return (
    <Card className={`overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-0">
        {/* Document Type Header */}
        <div className="bg-blue-50 border-b border-blue-200 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Document Type: {documentType}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Safe Mode
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getDisplayId()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className={`relative w-full bg-gray-50 border-b ${getSizeClasses()}`}>
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center p-4">
              <FileText className="w-16 h-16 text-blue-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-blue-800">Document File (Safe Mode)</p>
              <p className="text-xs text-blue-600 mt-1">Enhanced viewer temporarily disabled</p>
            </div>
          </div>
        </div>

        {/* Document Info */}
        <div className="p-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getCleanDocumentName()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {getDisplayId()}
              </p>
            </div>
            <div className="flex items-center space-x-2 ml-2">
              <Badge variant="outline" className="text-xs">
                Document
              </Badge>
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                Safe Mode
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>);

};

export default SafeIDDocumentViewer;