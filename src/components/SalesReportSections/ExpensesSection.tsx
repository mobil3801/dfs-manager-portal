import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { NumberInput } from '@/components/ui/number-input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Upload, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Expense {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  paymentType: 'Cash' | 'Credit Card' | 'Cheque';
  chequeNo?: string;
  invoiceFileId?: number;
  notes: string;
}

interface ExpensesSectionProps {
  expenses: Expense[];
  onChange: (expenses: Expense[]) => void;
}

const ExpensesSection: React.FC<ExpensesSectionProps> = ({
  expenses,
  onChange
}) => {
  const [vendors, setVendors] = useState<Array<{id: number;vendor_name: string;}>>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(11729, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'vendor_name',
        IsAsc: true,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      });

      if (error) throw error;
      setVendors(data?.List || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vendors',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingVendors(false);
    }
  };

  const addExpense = () => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      vendorId: '',
      vendorName: '',
      amount: 0,
      paymentType: 'Cash',
      notes: ''
    };
    onChange([...expenses, newExpense]);
  };

  const updateExpense = (index: number, field: keyof Expense, value: any) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index] = { ...updatedExpenses[index], [field]: value };

    if (field === 'vendorId') {
      const vendor = vendors.find((v) => v.id.toString() === value);
      updatedExpenses[index].vendorName = vendor?.vendor_name || '';
    }

    onChange(updatedExpenses);
  };

  const removeExpense = (index: number) => {
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    onChange(updatedExpenses);
  };

  const uploadInvoice = async (index: number, file: File) => {
    try {
      const { data: fileId, error } = await window.ezsite.apis.upload({
        filename: file.name,
        file: file
      });

      if (error) throw error;
      updateExpense(index, 'invoiceFileId', fileId);

      toast({
        title: 'Success',
        description: 'Invoice uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload invoice',
        variant: 'destructive'
      });
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const cashExpenses = expenses.filter((e) => e.paymentType === 'Cash').reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <Card className="bg-orange-50 border-orange-200">
      <CardHeader>
        <CardTitle className="text-orange-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5" />
            <span>Expenses</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addExpense}
            className="bg-white hover:bg-orange-100">

            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {expenses.length === 0 ?
        <div className="text-center py-8 text-gray-500">
            No expenses recorded. Click "Add Expense" to get started.
          </div> :

        <div className="space-y-4">
            {expenses.map((expense, index) =>
          <div key={expense.id} className="border border-orange-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="text-orange-700">
                    Expense #{index + 1}
                  </Badge>
                  <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeExpense(index)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50">

                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vendor *</Label>
                    <Select
                  value={expense.vendorId}
                  onValueChange={(value) => updateExpense(index, 'vendorId', value)}>

                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((vendor) =>
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                            {vendor.vendor_name}
                          </SelectItem>
                    )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Amount ($) *</Label>
                    <NumberInput
                  value={expense.amount}
                  onChange={(value) => updateExpense(index, 'amount', value || 0)}
                  min={0}
                  step={0.01}
                  required />

                  </div>
                  
                  <div className="space-y-2">
                    <Label>Payment Type *</Label>
                    <Select
                  value={expense.paymentType}
                  onValueChange={(value) => updateExpense(index, 'paymentType', value)}>

                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {expense.paymentType === 'Cheque' &&
              <div className="space-y-2">
                      <Label>Cheque Number *</Label>
                      <Input
                  value={expense.chequeNo || ''}
                  onChange={(e) => updateExpense(index, 'chequeNo', e.target.value)}
                  placeholder="Enter cheque number"
                  required />

                    </div>
              }
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label>Upload Invoice * (Mandatory)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadInvoice(index, file);
                    }}
                    className="flex-1" />

                      {expense.invoiceFileId &&
                  <Badge variant="default" className="bg-green-100 text-green-800">
                          ✓ Uploaded
                        </Badge>
                  }
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                  value={expense.notes}
                  onChange={(e) => updateExpense(index, 'notes', e.target.value)}
                  placeholder="Additional notes about this expense..."
                  rows={2} />

                  </div>
                </div>
              </div>
          )}
          </div>
        }
        
        {expenses.length > 0 &&
        <div className="pt-4 border-t border-orange-200 bg-orange-100 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Total Expenses:</Label>
                <div className="text-xl font-bold text-orange-800">${totalExpenses.toFixed(2)}</div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Cash Expenses:</Label>
                <div className="text-xl font-bold text-orange-800">${cashExpenses.toFixed(2)}</div>
              </div>
            </div>
          </div>
        }
      </CardContent>
    </Card>);

};

export default ExpensesSection;