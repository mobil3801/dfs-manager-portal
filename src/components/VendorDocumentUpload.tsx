import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Upload, FileText, X, Download, Eye, Loader2, AlertCircle } from 'lucide-react';
import { vendorService } from '@/services/vendorService';

interface VendorDocumentUploadProps {
  vendorId: string;
  documents: any[];
  onDocumentsChange: (documents: any[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: string;
}

const VendorDocumentUpload: React.FC<VendorDocumentUploadProps> = ({
  vendorId,
  documents,
  onDocumentsChange,
  maxFiles = 10,
  acceptedFileTypes = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt'
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    if (documents.length + files.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `Maximum ${maxFiles} files allowed. Current: ${documents.length}`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
        }

        try {
          const result = await vendorService.uploadDocument(vendorId, file);
          return result.document;
        } catch (uploadError: any) {
          console.error('File upload error:', uploadError);
          
          // Handle specific upload errors
          if (uploadError.message?.includes('Bucket not found')) {
            throw new Error(`Storage bucket not configured. Please contact administrator.`);
          } else if (uploadError.message?.includes('JWT')) {
            throw new Error(`Authentication error. Please try logging in again.`);
          } else {
            throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
          }
        }
      });

      const uploadedDocuments = await Promise.all(uploadPromises);
      const updatedDocuments = [...documents, ...uploadedDocuments];

      onDocumentsChange(updatedDocuments);

      toast({
        title: "Success",
        description: `${uploadedDocuments.length} document(s) uploaded successfully`
      });
    } catch (error: any) {
      console.error('Error uploading documents:', error);
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload documents",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await vendorService.deleteDocument(vendorId, documentId);

      const updatedDocuments = documents.filter((doc) => doc.id !== documentId);
      onDocumentsChange(updatedDocuments);

      toast({
        title: "Success",
        description: "Document deleted successfully"
      });
    } catch (error: any) {
      console.error('Error deleting document:', error);
      
      let errorMessage = "Failed to delete document";
      
      if (error.message?.includes('JWT')) {
        errorMessage = "Authentication error. Please try logging in again.";
      } else if (error.message?.includes('not found')) {
        errorMessage = "Document not found. It may have been already deleted.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  }, [vendorId, documents]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('image')) {
      return <Eye className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-blue-500" />;
  };

  const handleViewDocument = (doc: any) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    } else {
      toast({
        title: "Error",
        description: "Document URL not available",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Label>Vendor Documents ({documents.length}/{maxFiles})</Label>
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600">Uploading documents...</p>
            </div>
          ) : (
            <>
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="flex flex-col items-center space-y-2">
                <label htmlFor="document-upload" className="cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={documents.length >= maxFiles}
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </span>
                  </Button>
                </label>
                <input
                  id="document-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept={acceptedFileTypes}
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
                <p className="text-xs text-gray-500">
                  or drag and drop files here
                </p>
                <p className="text-xs text-gray-400">
                  PDF, DOC, DOCX, JPG, PNG, TXT • Max 10MB per file
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <Label>Uploaded Documents</Label>
          <div className="space-y-2">
            {documents.map((doc) => (
              <Card key={doc.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(doc.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(doc.size)} • {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDocument(doc)}
                      title="View/Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDocumentDelete(doc.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {documents.length >= maxFiles && (
        <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
          Maximum number of files reached ({maxFiles}). Delete some files to upload more.
        </div>
      )}

      {/* Storage Info */}
      <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded p-2">
        <div className="flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Documents are stored securely in Supabase Storage and linked to this vendor record.</span>
        </div>
      </div>
    </div>
  );
};

export default VendorDocumentUpload;
