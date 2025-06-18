import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { NumberInput } from '@/components/ui/number-input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Upload, FileText, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EnhancedFileUpload from '@/components/EnhancedFileUpload';
import { useIsMobile } from '@/hooks/use-mobile';

interface Expense {
  id: string;
  vendor: string;
  othersName: string;
  amount: number;
  paymentType: 'Cash' | 'Card' | 'Cheque';
  description: string;
  receiptFileId?: number;
  receiptFileName?: string;
}

interface ExpensesSectionProps {
  expenses: Expense[];
  onExpensesChange: (expenses: Expense[]) => void;
}

const ExpensesSection: React.FC<ExpensesSectionProps> = ({
  expenses,
  onExpensesChange
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [vendors, setVendors] = useState<Array<{id: number;vendor_name: string;}>>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);

  // Load vendors from database
  useEffect(() => {
    loadVendors();
  }, []);

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

  const addExpense = () => {
    try {
      const newExpense: Expense = {
        id: Date.now().toString(),
        vendor: '',
        othersName: '',
        amount: 0,
        paymentType: 'Cash',
        description: ''
      };
      const updatedExpenses = [...expenses, newExpense];
      onExpensesChange(updatedExpenses);

      toast({
        title: "Success",
        description: "New expense added successfully"
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive"
      });
    }
  };

  const updateExpense = (id: string, field: keyof Expense, value: any) => {
    try {
      const updatedExpenses = expenses.map((expense) =>
      expense.id === id ? { ...expense, [field]: value } : expense
      );
      onExpensesChange(updatedExpenses);
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive"
      });
    }
  };

  const removeExpense = (id: string) => {
    try {
      const updatedExpenses = expenses.filter((expense) => expense.id !== id);
      onExpensesChange(updatedExpenses);
      toast({
        title: "Success",
        description: "Expense removed successfully"
      });
    } catch (error) {
      console.error('Error removing expense:', error);
      toast({
        title: "Error",
        description: "Failed to remove expense",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (file: File, expenseId: string) => {
    try {
      toast({
        title: "Uploading",
        description: "Uploading receipt image..."
      });

      const { data: fileId, error } = await window.ezsite.apis.upload({
        filename: file.name,
        file: file
      });

      if (error) throw error;

      updateExpense(expenseId, 'receiptFileId', fileId);
      updateExpense(expenseId, 'receiptFileName', file.name);

      toast({
        title: "Success",
        description: "Receipt uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload receipt",
        variant: "destructive"
      });
    }
  };

  // Calculate totals by payment type
  const calculateTotals = () => {
    const cashExpense = expenses.
    filter((exp) => exp.paymentType === 'Cash').
    reduce((sum, exp) => sum + (exp.amount || 0), 0);

    const cardExpense = expenses.
    filter((exp) => exp.paymentType === 'Card').
    reduce((sum, exp) => sum + (exp.amount || 0), 0);

    const chequeExpense = expenses.
    filter((exp) => exp.paymentType === 'Cheque').
    reduce((sum, exp) => sum + (exp.amount || 0), 0);

    const totalExpenses = cashExpense + cardExpense + chequeExpense;

    return { cashExpense, cardExpense, chequeExpense, totalExpenses };
  };

  const { cashExpense, cardExpense, chequeExpense, totalExpenses } = calculateTotals();

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Expenses
        </h3>
        <Button
          onClick={addExpense}
          size="sm"
          className="gap-2 hover:bg-blue-600 transition-colors"

          type="button">

          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <div className="space-y-4">
        {expenses.map((expense) =>
        <Card key={expense.id} className="p-4 space-y-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="gap-1">
                <FileText className="h-3 w-3" />
                Expense #{expense.id.slice(-4)}
              </Badge>
              <Button
              variant="ghost"
              size="sm"
              onClick={() => removeExpense(expense.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"

              type="button">

                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
              <div className="space-y-2">
                <Label htmlFor={`vendor-${expense.id}`}>Vendor (Optional)</Label>
                <Select
                value={expense.vendor}
                onValueChange={(value) => updateExpense(expense.id, 'vendor', value)}>


                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No vendor selected</SelectItem>
                    {vendors.map((vendor) =>
                  <SelectItem key={vendor.id} value={vendor.vendor_name}>
                        {vendor.vendor_name}
                      </SelectItem>
                  )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`others-name-${expense.id}`}>Other's Name</Label>
                <Input
                id={`others-name-${expense.id}`}
                value={expense.othersName}
                onChange={(e) => updateExpense(expense.id, 'othersName', e.target.value)}
                placeholder="Enter other's name" />


              </div>

              <div className="space-y-2">
                <Label htmlFor={`payment-type-${expense.id}`}>Payment Type</Label>
                <Select
                value={expense.paymentType}
                onValueChange={(value) => updateExpense(expense.id, 'paymentType', value as 'Cash' | 'Card' | 'Cheque')}>


                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`amount-${expense.id}`}>Amount ($)</Label>
                <NumberInput
                id={`amount-${expense.id}`}
                value={expense.amount}
                onValueChange={(value) => updateExpense(expense.id, 'amount', value)}
                placeholder="0.00"
                min={0}
                step={0.01} />


              </div>

              <div className="space-y-2 col-span-full">
                <Label htmlFor={`description-${expense.id}`}>Description</Label>
                <Textarea
                id={`description-${expense.id}`}
                value={expense.description}
                onChange={(e) => updateExpense(expense.id, 'description', e.target.value)}
                placeholder="Enter expense description"
                rows={2} />


              </div>

              <div className="space-y-2 col-span-full">
                <Label>Receipt Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <EnhancedFileUpload
                  onFileSelect={(file) => handleFileUpload(file, expense.id)}
                  accept="image/*"
                  maxSize={10}
                  label="Upload Receipt"
                  allowCamera={true} />


                  {expense.receiptFileName &&
                <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Upload className="h-3 w-3" />
                        {expense.receiptFileName}
                      </Badge>
                    </div>
                }
                </div>
              </div>
            </div>
          </Card>
        )}

        {expenses.length === 0 &&
        <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No expenses added yet</p>
            <p className="text-sm">Click "Add Expense" to get started</p>
          </div>
        }
      </div>

      {/* Expense Totals Calculation */}
      {expenses.length > 0 &&
      <Card className="p-4 bg-gray-50 border-2 border-gray-200">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Expense Summary
          </h4>
          
          <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
            <div className="bg-white p-3 rounded-lg border">
              <Label className="text-sm text-gray-600">Cash Expense</Label>
              <div className="text-xl font-bold text-red-600">
                ${cashExpense.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border">
              <Label className="text-sm text-gray-600">Card Expense</Label>
              <div className="text-xl font-bold text-red-600">
                ${cardExpense.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border">
              <Label className="text-sm text-gray-600">Cheque Expense</Label>
              <div className="text-xl font-bold text-red-600">
                ${chequeExpense.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-red-300">
              <Label className="text-sm text-gray-600">Total Expenses</Label>
              <div className="text-2xl font-bold text-red-600">
                ${totalExpenses.toFixed(2)}
              </div>
            </div>
          </div>
        </Card>
      }
    </Card>);

};

export default ExpensesSection;