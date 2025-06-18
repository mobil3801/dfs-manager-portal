import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NumberInput } from '@/components/ui/number-input';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Vendor {
  id: number;
  vendor_name: string;
}

interface ExpenseFormData {
  vendor: string;
  othersName: string;
  amount: number;
  paymentType: 'Cash' | 'Credit' | 'Cheque';
  chequeNumber: string;
  invoiceFileId?: number;
  invoiceFileName?: string;
}

interface ExpenseFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (expense: ExpenseFormData) => void;
}

const ExpenseFormDialog: React.FC<ExpenseFormDialogProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ExpenseFormData>({
    vendor: '',
    othersName: '',
    amount: 0,
    paymentType: 'Cash',
    chequeNumber: ''
  });
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Load vendors when dialog opens
  useEffect(() => {
    if (open) {
      loadVendors();
      // Reset form
      setFormData({
        vendor: '',
        othersName: '',
        amount: 0,
        paymentType: 'Cash',
        chequeNumber: ''
      });
      setUploadProgress(0);
      setIsUploading(false);
    }
  }, [open]);

  const loadVendors = async () => {
    try {
      setLoadingVendors(true);
      const { data, error } = await window.ezsite.apis.tablePage(11729, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "vendor_name",
        IsAsc: true,
        Filters: [{
          name: "is_active",
          op: "Equal",
          value: true
        }]
      });

      if (error) throw error;
      setVendors(data?.List || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive"
      });
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(10);

      // Validate file
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size must be less than 10MB');
      }

      setUploadProgress(30);

      const { data: fileId, error } = await window.ezsite.apis.upload({
        filename: file.name,
        file: file
      });

      if (error) throw error;

      setUploadProgress(100);
      setFormData(prev => ({
        ...prev,
        invoiceFileId: fileId,
        invoiceFileName: file.name
      }));

      toast({
        title: "Success",
        description: "Invoice file uploaded successfully",
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive"
      });
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.othersName.trim()) {
      toast({
        title: "Validation Error",
        description: "Other's Name is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (formData.paymentType === 'Cheque' && !formData.chequeNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Cheque Number is required for cheque payments",
        variant: "destructive"
      });
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      invoiceFileId: undefined,
      invoiceFileName: undefined
    }));
    setUploadProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Add New Expense
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Vendor Name */}
          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor Name (Optional)</Label>
            <Select
              value={formData.vendor}
              onValueChange={(value) => setFormData(prev => ({ ...prev, vendor: value }))}
              disabled={loadingVendors}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingVendors ? "Loading vendors..." : "Select vendor (optional)"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No vendor selected</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.vendor_name}>
                    {vendor.vendor_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Other's Name */}
          <div className="space-y-2">
            <Label htmlFor="othersName">Other's Name *</Label>
            <Input
              id="othersName"
              value={formData.othersName}
              onChange={(e) => setFormData(prev => ({ ...prev, othersName: e.target.value }))}
              placeholder="Enter other's name"
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($) *</Label>
            <NumberInput
              id="amount"
              value={formData.amount}
              onValueChange={(value) => setFormData(prev => ({ ...prev, amount: value }))}
              placeholder="0.00"
              min={0}
              step={0.01}
              required
            />
          </div>

          {/* Payment Type */}
          <div className="space-y-2">
            <Label htmlFor="paymentType">Payment Type *</Label>
            <Select
              value={formData.paymentType}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                paymentType: value as 'Cash' | 'Credit' | 'Cheque',
                chequeNumber: value !== 'Cheque' ? '' : prev.chequeNumber
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cheque Number (Conditional) */}
          {formData.paymentType === 'Cheque' && (
            <div className="space-y-2">
              <Label htmlFor="chequeNumber">Cheque Number *</Label>
              <Input
                id="chequeNumber"
                value={formData.chequeNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, chequeNumber: e.target.value }))}
                placeholder="Enter cheque number"
                required
              />
            </div>
          )}

          {/* Invoice Upload */}
          <div className="space-y-2">
            <Label>Invoice Number (Upload File)</Label>
            
            {!formData.invoiceFileName ? (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag & drop a file here, or click to select
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-input')?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Choose File'}
                </Button>
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">{formData.invoiceFileName}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseFormDialog;