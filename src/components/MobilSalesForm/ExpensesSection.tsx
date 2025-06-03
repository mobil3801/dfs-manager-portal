import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus } from 'lucide-react';

interface Expense {
  id: string;
  vendor: string;
  amount: number;
  paymentType: string;
  description: string;
}

interface ExpensesSectionProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

const ExpensesSection: React.FC<ExpensesSectionProps> = ({ formData, updateFormData }) => {
  const expenses: Expense[] = formData.expenses || [];

  const addExpense = () => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      vendor: '',
      amount: 0,
      paymentType: 'Cash',
      description: ''
    };
    updateFormData('expenses', [...expenses, newExpense]);
  };

  const removeExpense = (id: string) => {
    updateFormData('expenses', expenses.filter((expense) => expense.id !== id));
  };

  const updateExpense = (id: string, field: keyof Expense, value: string | number) => {
    const updatedExpenses = expenses.map((expense) =>
    expense.id === id ? { ...expense, [field]: value } : expense
    );
    updateFormData('expenses', updatedExpenses);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + (expense.amount || 0), 0);
  };

  return (
    <div className="space-y-4">
      {/* Expenses */}
      <div className="border border-gray-300 bg-white">
        <div className="bg-gray-100 border-b border-gray-300 p-2">
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold">EXPENSES</div>
            <Button
              type="button"
              onClick={addExpense}
              size="sm"
              variant="outline"
              className="h-6 text-xs">

              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
        
        <div className="p-3">
          {expenses.length === 0 ?
          <div className="text-center text-gray-500 text-xs py-4">
              No expenses recorded. Click "Add" to add expenses.
            </div> :

          <div className="space-y-2">
              {expenses.map((expense) =>
            <div key={expense.id} className="border border-gray-200 rounded p-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-medium">Expense Entry</Label>
                    <Button
                  type="button"
                  onClick={() => removeExpense(expense.id)}
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0 text-red-500 hover:text-red-700">

                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Vendor:</Label>
                      <Input
                    type="text"
                    value={expense.vendor}
                    onChange={(e) => updateExpense(expense.id, 'vendor', e.target.value)}
                    className="h-7 text-xs border border-gray-300"
                    placeholder="Vendor name" />

                    </div>
                    
                    <div>
                      <Label className="text-xs">Amount:</Label>
                      <Input
                    type="number"
                    value={expense.amount || ''}
                    onChange={(e) => updateExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                    className="h-7 text-xs border border-gray-300"
                    placeholder="$0.00" />

                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Payment Type:</Label>
                      <select
                    value={expense.paymentType}
                    onChange={(e) => updateExpense(expense.id, 'paymentType', e.target.value)}
                    className="h-7 text-xs border border-gray-300 rounded px-2 w-full">

                        <option value="Cash">Cash</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Check">Check</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Description:</Label>
                      <Input
                    type="text"
                    value={expense.description}
                    onChange={(e) => updateExpense(expense.id, 'description', e.target.value)}
                    className="h-7 text-xs border border-gray-300"
                    placeholder="Brief description" />

                    </div>
                  </div>
                </div>
            )}
              
              <div className="border-t border-gray-300 pt-2 mt-3">
                <div className="grid grid-cols-2 gap-2 items-center bg-gray-50">
                  <Label className="text-xs font-semibold">Total Expenses:</Label>
                  <div className="text-xs font-semibold p-2 bg-gray-100 border border-gray-300 rounded">
                    ${getTotalExpenses().toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      {/* Notes */}
      <div className="border border-gray-300 bg-white">
        <div className="bg-gray-100 border-b border-gray-300 p-2">
          <div className="text-sm font-semibold text-center">NOTES</div>
        </div>
        
        <div className="p-3">
          <Textarea
            value={formData.notes || ''}
            onChange={(e) => updateFormData('notes', e.target.value)}
            className="text-xs border border-gray-300 min-h-20"
            placeholder="Enter any additional notes about the day's operations..." />

        </div>
      </div>
    </div>);

};

export default ExpensesSection;