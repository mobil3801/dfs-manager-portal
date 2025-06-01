import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileText, Download, Zap, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EnhancedFileUpload from '@/components/EnhancedFileUpload';

interface ProductFileUploadProps {
  onDataImport: (data: any[]) => void;
  disabled?: boolean;
}

interface ParsedProduct {
  original: any;
  mapped: any;
  isValid: boolean;
  isDuplicate: boolean;
  errors: string[];
  productName: string;
}

const ProductFileUpload: React.FC<ProductFileUploadProps> = ({ onDataImport, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'manual' | 'enhanced'>('enhanced');
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [existingProducts, setExistingProducts] = useState<any[]>([]);
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

  // Field mapping for header names
  const fieldMapping: { [key: string]: string } = {
    'product name': 'product_name',
    'productname': 'product_name',
    'name': 'product_name',
    'item': 'product_name',
    'title': 'product_name',
    'weight': 'weight',
    'weight unit': 'weight_unit',
    'weightunit': 'weight_unit',
    'unit': 'weight_unit',
    'department': 'department',
    'dept': 'department',
    'category': 'category',
    'cat': 'category',
    'type': 'category',
    'barcode case': 'bar_code_case',
    'barcode_case': 'bar_code_case',
    'case barcode': 'bar_code_case',
    'casebarcode': 'bar_code_case',
    'barcode unit': 'bar_code_unit',
    'barcode_unit': 'bar_code_unit',
    'unit barcode': 'bar_code_unit',
    'unitbarcode': 'bar_code_unit',
    'case price': 'case_price',
    'caseprice': 'case_price',
    'price case': 'case_price',
    'unit per case': 'unit_per_case',
    'unitpercase': 'unit_per_case',
    'units per case': 'unit_per_case',
    'unitspercase': 'unit_per_case',
    'unit price': 'unit_price',
    'unitprice': 'unit_price',
    'price unit': 'unit_price',
    'retail price': 'retail_price',
    'retailprice': 'retail_price',
    'selling price': 'retail_price',
    'sale price': 'retail_price',
    'supplier': 'supplier',
    'vendor': 'supplier',
    'manufacturer': 'supplier',
    'quantity': 'quantity_in_stock',
    'stock': 'quantity_in_stock',
    'quantity in stock': 'quantity_in_stock',
    'current stock': 'quantity_in_stock',
    'minimum stock': 'minimum_stock',
    'min stock': 'minimum_stock',
    'reorder level': 'minimum_stock',
    'description': 'description',
    'desc': 'description',
    'notes': 'description',
    'details': 'description'
  };

  const mapHeaderToField = (header: string): string => {
    const cleanHeader = header.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
    return fieldMapping[cleanHeader] || header;
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
          const mappedField = mapHeaderToField(header);
          row[mappedField] = values[index] || '';
        });
        data.push(row);
      }
    }

    return data;
  };

  const fetchExistingProducts = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(11726, {
        PageNo: 1,
        PageSize: 1000, // Get all products to check for duplicates
        OrderByField: 'product_name',
        IsAsc: true,
        Filters: []
      });

      if (error) throw error;
      setExistingProducts(data?.List || []);
      return data?.List || [];
    } catch (error) {
      console.error('Error fetching existing products:', error);
      toast({
        variant: "destructive",
        title: "Warning",
        description: "Could not fetch existing products for duplicate check."
      });
      return [];
    }
  };

  const validateAndCheckDuplicates = (importedData: any[], existingProducts: any[]): ParsedProduct[] => {
    const existingNames = new Set(existingProducts.map(p => p.product_name?.toLowerCase().trim()));
    
    return importedData.map((row, index) => {
      const errors: string[] = [];
      const productName = row.product_name || row.name || row.productname || row.item || row.title || '';
      
      // Validate required field (only product name)
      if (!productName.trim()) {
        errors.push('Product name is required');
      }

      // Check for duplicates
      const isDuplicate = productName.trim() && existingNames.has(productName.toLowerCase().trim());
      if (isDuplicate) {
        errors.push('Product name already exists in database');
      }

      // Map the data to proper format
      const mapped = {
        product_name: productName.trim(),
        weight: parseFloat(row.weight) || 0,
        weight_unit: row.weight_unit || 'lb',
        department: row.department || 'Convenience Store',
        bar_code_case: row.bar_code_case || '',
        bar_code_unit: row.bar_code_unit || '',
        case_price: parseFloat(row.case_price) || 0,
        unit_per_case: parseInt(row.unit_per_case) || 1,
        unit_price: parseFloat(row.unit_price) || 0,
        retail_price: parseFloat(row.retail_price) || 0,
        category: row.category || '',
        supplier: row.supplier || '',
        quantity_in_stock: parseInt(row.quantity_in_stock) || 0,
        minimum_stock: parseInt(row.minimum_stock) || 0,
        description: row.description || ''
      };

      return {
        original: row,
        mapped,
        isValid: errors.length === 0,
        isDuplicate,
        errors,
        productName: productName.trim()
      };
    });
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

      // Fetch existing products for duplicate checking
      const existing = await fetchExistingProducts();
      
      // Validate and check for duplicates
      const validatedProducts = validateAndCheckDuplicates(parsedData, existing);
      
      if (validatedProducts.length === 0) {
        throw new Error('No valid products found in file');
      }

      setParsedProducts(validatedProducts);
      setShowPreview(true);
      
      const validCount = validatedProducts.filter(p => p.isValid).length;
      const duplicateCount = validatedProducts.filter(p => p.isDuplicate).length;
      const errorCount = validatedProducts.filter(p => !p.isValid).length;

      toast({
        title: "File Processed",
        description: `Found ${validatedProducts.length} products. ${validCount} valid, ${duplicateCount} duplicates, ${errorCount} errors.`
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

  const handleConfirmImport = () => {
    const validProducts = parsedProducts.filter(p => p.isValid && !p.isDuplicate);
    
    if (validProducts.length === 0) {
      toast({
        variant: "destructive",
        title: "No Valid Products",
        description: "No valid products to import."
      });
      return;
    }

    const dataToImport = validProducts.map(p => p.mapped);
    onDataImport(dataToImport);
    
    // Reset state
    setIsOpen(false);
    setFile(null);
    setParsedProducts([]);
    setShowPreview(false);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setFile(null);
    setParsedProducts([]);
    setShowPreview(false);
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
      <DialogContent className={showPreview ? "sm:max-w-6xl max-h-[80vh] overflow-y-auto" : "sm:max-w-2xl"}>
        <DialogHeader>
          <DialogTitle>{showPreview ? 'Import Preview' : 'Import Product Data'}</DialogTitle>
        </DialogHeader>
        
        {!showPreview ? (
          <div className="space-y-6">
            {/* Upload method selector */}
            <div className="flex gap-4 justify-center">
              <Button
                variant={uploadMethod === 'enhanced' ? 'default' : 'outline'}
                onClick={() => setUploadMethod('enhanced')}
                className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Enhanced Upload
              </Button>
              <Button
                variant={uploadMethod === 'manual' ? 'default' : 'outline'}
                onClick={() => setUploadMethod('manual')}
                className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Manual Upload
              </Button>
            </div>

            {uploadMethod === 'enhanced' ? (
              /* Enhanced upload with camera option */
              <div className="space-y-4">
                {/* Compression info banner */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-medium">Auto-compression enabled for large images</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Images over 1MB will be automatically optimized for faster uploads and processing
                  </p>
                </div>
                
                <EnhancedFileUpload
                  onFileSelect={handleEnhancedFileSelect}
                  accept=".csv,image/*"
                  label="Select CSV File or Take Photo"
                  currentFile={file?.name}
                  maxSize={10}
                  allowCamera={true} />

                {file &&
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">Selected file:</p>
                    <p className="text-sm text-gray-600">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {file.type.includes('image') ? 'Image file - OCR processing will be applied' : 'CSV file ready for import'}
                    </p>
                  </div>
                }
              </div>) : (
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
              </div>)
            }

            {/* Header mapping info */}
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Automatic Header Mapping</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Headers will be automatically mapped to product fields. Only Product Name is required.
              </p>
            </div>

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
                    Process File
                  </>
                }
              </Button>
              <Button
                variant="outline"
                onClick={handleCloseDialog}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          /* Preview Section */
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{parsedProducts.length}</p>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{parsedProducts.filter(p => p.isValid && !p.isDuplicate).length}</p>
                    <p className="text-sm text-muted-foreground">Valid</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{parsedProducts.filter(p => p.isDuplicate).length}</p>
                    <p className="text-sm text-muted-foreground">Duplicates</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{parsedProducts.filter(p => !p.isValid).length}</p>
                    <p className="text-sm text-muted-foreground">Errors</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Products table */}
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {product.isValid && !product.isDuplicate ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Valid
                          </Badge>
                        ) : product.isDuplicate ? (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Duplicate
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.productName || 'N/A'}</TableCell>
                      <TableCell>{product.mapped.category || 'N/A'}</TableCell>
                      <TableCell>
                        {product.mapped.retail_price > 0 ? `$${product.mapped.retail_price.toFixed(2)}` : 'N/A'}
                      </TableCell>
                      <TableCell>{product.mapped.quantity_in_stock || 0}</TableCell>
                      <TableCell>
                        {product.errors.length > 0 && (
                          <div className="text-xs text-red-600">
                            {product.errors.join(', ')}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}>
                Back to Upload
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  disabled={parsedProducts.filter(p => p.isValid && !p.isDuplicate).length === 0}
                  className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Import {parsedProducts.filter(p => p.isValid && !p.isDuplicate).length} Products
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>);

};

export default ProductFileUpload;