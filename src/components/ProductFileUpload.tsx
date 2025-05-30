import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductFileUploadProps {
  onDataImport: (data: any[]) => void;
}

const ProductFileUpload: React.FC<ProductFileUploadProps> = ({ onDataImport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
      'description'
    ];

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
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
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
      const invalidRows = parsedData.filter(row => 
        requiredFields.some(field => !row[field])
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Import Products
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Product Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file">Select CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Download Template</Label>
            <Button
              type="button"
              variant="outline"
              onClick={downloadTemplate}
              className="w-full"
            >
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
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <FileText className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setFile(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFileUpload;