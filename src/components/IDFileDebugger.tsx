import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  ExternalLink,
  Database
} from 'lucide-react';

interface IDFileDebuggerProps {
  fileIds?: number[];
  className?: string;
}

const IDFileDebugger: React.FC<IDFileDebuggerProps> = ({
  fileIds = [123, 124],
  className = ''
}) => {
  const [debugResults, setDebugResults] = useState<Record<number, {
    status: 'testing' | 'success' | 'error';
    url?: string;
    error?: string;
    fileRecord?: any;
    timestamp?: Date;
  }>>({});
  const [isDebugging, setIsDebugging] = useState(false);
  const { toast } = useToast();

  const debugFile = async (fileId: number) => {
    console.log(`[IDFileDebugger] Starting debug for file ${fileId}`);
    
    setDebugResults(prev => ({
      ...prev,
      [fileId]: { status: 'testing', timestamp: new Date() }
    }));

    try {
      // Step 1: Check if file record exists in file_uploads table
      console.log(`[IDFileDebugger] Checking file_uploads table for file ${fileId}`);
      const { data: fileData, error: fileError } = await window.ezsite.apis.tablePage('26928', {
        PageNo: 1,
        PageSize: 10,
        Filters: [{ name: 'store_file_id', op: 'Equal', value: fileId }]
      });

      if (fileError) {
        throw new Error(`File record query failed: ${fileError}`);
      }

      const fileRecord = fileData?.List?.[0];
      console.log(`[IDFileDebugger] File record for ${fileId}:`, fileRecord);

      // Step 2: Try to get the upload URL
      console.log(`[IDFileDebugger] Attempting to get upload URL for file ${fileId}`);
      const { data: fileUrl, error: urlError } = await window.ezsite.apis.getUploadUrl(fileId);

      if (urlError) {
        throw new Error(`URL retrieval failed: ${urlError}`);
      }

      if (!fileUrl || fileUrl.trim() === '') {
        throw new Error('Empty URL returned from server');
      }

      console.log(`[IDFileDebugger] Successfully retrieved URL for file ${fileId}:`, fileUrl);

      // Step 3: Test URL accessibility
      console.log(`[IDFileDebugger] Testing URL accessibility for file ${fileId}`);
      const response = await fetch(fileUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        throw new Error(`URL not accessible: ${response.status} ${response.statusText}`);
      }

      setDebugResults(prev => ({
        ...prev,
        [fileId]: {
          status: 'success',
          url: fileUrl,
          fileRecord,
          timestamp: new Date()
        }
      }));

      console.log(`[IDFileDebugger] File ${fileId} debug completed successfully`);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[IDFileDebugger] Debug failed for file ${fileId}:`, error);
      
      setDebugResults(prev => ({
        ...prev,
        [fileId]: {
          status: 'error',
          error: errorMsg,
          timestamp: new Date()
        }
      }));
    }
  };

  const debugAllFiles = async () => {
    setIsDebugging(true);
    console.log(`[IDFileDebugger] Starting debug for files:`, fileIds);
    
    try {
      // Debug files sequentially to avoid overwhelming the API
      for (const fileId of fileIds) {
        await debugFile(fileId);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast({
        title: 'Debug Complete',
        description: `Completed debugging ${fileIds.length} file(s)`
      });
    } catch (error) {
      console.error('[IDFileDebugger] Debug process failed:', error);
      toast({
        title: 'Debug Error',
        description: 'Failed to complete debugging process',
        variant: 'destructive'
      });
    } finally {
      setIsDebugging(false);
    }
  };

  const handleOpenUrl = (fileId: number) => {
    const result = debugResults[fileId];
    if (result?.url) {
      window.open(result.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getStatusIcon = (status: 'testing' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: 'testing' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'testing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  useEffect(() => {
    // Auto-start debugging when component mounts
    debugAllFiles();
  }, []);

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-6 h-6" />
            <span>ID File Debugger</span>
          </CardTitle>
          <Button
            onClick={debugAllFiles}
            disabled={isDebugging}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isDebugging ? 'animate-spin' : ''}`} />
            {isDebugging ? 'Debugging...' : 'Debug Again'}
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Testing file IDs {fileIds.join(', ')} for URL retrieval and accessibility
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {fileIds.map(fileId => {
          const result = debugResults[fileId];
          return (
            <div key={fileId} className={`p-4 border rounded-lg ${result ? getStatusColor(result.status) : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {result && getStatusIcon(result.status)}
                  <span className="font-medium">File ID: {fileId}</span>
                  <Badge variant="outline" className="text-xs">
                    {result?.timestamp?.toLocaleTimeString() || 'Not tested'}
                  </Badge>
                </div>
                {result?.url && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenUrl(fileId)}
                      className="h-7 px-2"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open
                    </Button>
                  </div>
                )}
              </div>

              {result?.status === 'success' && result.url && (
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>✓ URL Retrieved:</strong>
                    <div className="bg-white p-2 rounded border text-xs font-mono break-all mt-1">
                      {result.url}
                    </div>
                  </div>
                  {result.fileRecord && (
                    <div className="text-sm">
                      <strong>✓ File Record Found:</strong>
                      <div className="bg-white p-2 rounded border text-xs mt-1">
                        <div>Original Name: {result.fileRecord.file_name || 'N/A'}</div>
                        <div>Size: {result.fileRecord.file_size || 'N/A'} bytes</div>
                        <div>Type: {result.fileRecord.file_type || 'N/A'}</div>
                        <div>Upload Date: {result.fileRecord.upload_date ? new Date(result.fileRecord.upload_date).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {result?.status === 'error' && (
                <div className="text-sm">
                  <strong>✗ Error:</strong>
                  <div className="bg-white p-2 rounded border text-xs mt-1">
                    {result.error}
                  </div>
                </div>
              )}

              {result?.status === 'testing' && (
                <div className="text-sm text-blue-600">
                  <Database className="w-4 h-4 inline mr-1" />
                  Testing file accessibility...
                </div>
              )}

              {!result && (
                <div className="text-sm text-gray-500">
                  Waiting to be tested...
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Debug Process:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
              <li>Check if file record exists in file_uploads table</li>
              <li>Attempt to retrieve upload URL from EasySite API</li>
              <li>Test URL accessibility with HTTP HEAD request</li>
              <li>Report results with detailed error information</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IDFileDebugger;