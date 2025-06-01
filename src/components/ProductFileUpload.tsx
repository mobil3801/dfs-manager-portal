import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EnhancedFileUpload from '@/components/EnhancedFileUpload';

interface ProductFileUploadProps {
  onDataImport: (data: any[]) => void;
  disabled?: boolean;
}

const ProductFileUpload: React.FC<ProductFileUploadProps> = ({ onDataImport, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'manual' | 'enhanced'>('enhanced');
  const { toast } = useToast();

  const downloadTemplate = () => {
    const headers = [
    'product_name',
    'weight',
    'weight_unit',
    'department',
    'bar_code_case',
    'bar_code_unit',
    'case_price',
    'unit_per_case',
    'unit_price',
    'retail_price',
    'category',
    'supplier',
    'quantity_in_stock',
    'minimum_stock',
    'description'];


    const csvContent = headers.join(',') + '\n' +
    'Sample Product,1.5,lb,Convenience Store,123456789012,987654321098,24.99,12,2.99,3.49,Snacks,Sample Supplier,100,10,Sample product description';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map((v) => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }

    return data;
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select a CSV file to upload."
      });
      return;
    }

    setIsProcessing(true);

    try {
      const text = await file.text();
      const parsedData = parseCSV(text);

      if (parsedData.length === 0) {
        throw new Error('No valid data found in file');
      }

      // Validate required fields
      const requiredFields = ['product_name'];
      const invalidRows = parsedData.filter((row) =>
      requiredFields.some((field) => !row[field])
      );

      if (invalidRows.length > 0) {
        throw new Error(`${invalidRows.length} rows are missing required fields`);
      }

      onDataImport(parsedData);
      setIsOpen(false);
      setFile(null);

      toast({
        title: "Import Successful",
        description: `Successfully imported ${parsedData.length} products.`
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to process file."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please select a CSV file."
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleEnhancedFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv') && !selectedFile.type.includes('image')) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select a CSV file or image."
      });
      return;
    }
    setFile(selectedFile);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Upload className="w-4 h-4 mr-2" />
          Import Products
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Product Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Upload method selector */}
          <div className="flex gap-4 justify-center">
            <Button
              variant={uploadMethod === 'enhanced' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('enhanced')}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Enhanced Upload
            </Button>
            <Button
              variant={uploadMethod === 'manual' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('manual')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Manual Upload
            </Button>
          </div>

          {uploadMethod === 'enhanced' ? (
            /* Enhanced upload with camera option */
            <div className="space-y-4">
              <EnhancedFileUpload
                onFileSelect={handleEnhancedFileSelect}
                accept=".csv,image/*"
                label="Select CSV File or Take Photo"
                currentFile={file?.name}
                maxSize={10}
                allowCamera={true}
              />
              
              {file && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Selected file:</p>
                  <p className="text-sm text-gray-600">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {file.type.includes('image') ? 'Image file - OCR processing will be applied' : 'CSV file ready for import'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Traditional manual upload */
            <div className="space-y-2">
              <Label htmlFor="file">Select CSV File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange} />

              {file &&
              <p className="text-sm text-muted-foreground">
                  Selected: {file.name}
                </p>
              }
            </div>
          )}

          <div className="space-y-2">
            <Label>Download Template</Label>
            <Button
              type="button"
              variant="outline"
              onClick={downloadTemplate}
              className="w-full">

              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
            <p className="text-sm text-muted-foreground">
              Download a template file with the correct format and sample data.
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleFileUpload}
              disabled={!file || isProcessing}
              className="flex-1">

              {isProcessing ?
              <>
                  <FileText className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </> :

              <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </>
              }
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setFile(null);
              }}>

              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>);

};

export default ProductFileUpload;