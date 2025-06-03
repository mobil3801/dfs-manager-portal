import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CashCollectionSectionProps {
  formData: any;
  updateFormData: (field: string, value: string | number) => void;
}

const CashCollectionSection: React.FC<CashCollectionSectionProps> = ({ formData, updateFormData }) => {
  const calculateTotalShortOver = () => {
    const cashOnHand = formData.cashCollectionOnHand || 0;
    const expectedCash = (formData.cashAmount || 0) + (formData.lotteryNetSales || 0) + (formData.scratchOffSales || 0);
    return cashOnHand - expectedCash;
  };

  const calculateTotalSales = () => {
    return (formData.cashAmount || 0) + (
    formData.creditCardAmount || 0) + (
    formData.debitCardAmount || 0) + (
    formData.mobileAmount || 0) + (
    formData.grocerySales || 0) + (
    formData.ebtSales || 0);
  };

  return (
    <div className="space-y-4">
      {/* Cash Collection */}
      <div className="border border-gray-300 bg-white">
        <div className="bg-gray-100 border-b border-gray-300 p-2">
          <div className="text-sm font-semibold text-center">CASH COLLECTION</div>
        </div>
        
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Cash on Hand:</Label>
            <Input
              type="number"
              value={formData.cashCollectionOnHand || ''}
              onChange={(e) => updateFormData('cashCollectionOnHand', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="$0.00" />

          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center bg-yellow-50">
            <Label className="text-xs font-semibold">Short/Over:</Label>
            <div className={`text-xs font-semibold p-2 border border-gray-300 rounded ${
            calculateTotalShortOver() < 0 ? 'bg-red-100 text-red-700' :
            calculateTotalShortOver() > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`
            }>
              ${calculateTotalShortOver().toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Total Sales Summary */}
      <div className="border border-gray-300 bg-white">
        <div className="bg-gray-100 border-b border-gray-300 p-2">
          <div className="text-sm font-semibold text-center">TOTAL SALES</div>
        </div>
        
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2 items-center bg-blue-50">
            <Label className="text-sm font-bold">GRAND TOTAL:</Label>
            <div className="text-sm font-bold p-2 bg-blue-100 border border-blue-300 rounded text-blue-700">
              ${calculateTotalSales().toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Employee and Shift Info */}
      <div className="border border-gray-300 bg-white">
        <div className="bg-gray-100 border-b border-gray-300 p-2">
          <div className="text-sm font-semibold text-center">EMPLOYEE INFO</div>
        </div>
        
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Employee Name:</Label>
            <Input
              type="text"
              value={formData.employeeName || ''}
              onChange={(e) => updateFormData('employeeName', e.target.value)}
              className="h-8 text-xs border border-gray-300"
              placeholder="Enter name" />

          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Shift:</Label>
            <select
              value={formData.shift || 'DAY'}
              onChange={(e) => updateFormData('shift', e.target.value)}
              className="h-8 text-xs border border-gray-300 rounded px-2">

              <option value="DAY">Day Shift</option>
              <option value="NIGHT">Night Shift</option>
            </select>
          </div>
        </div>
      </div>

      {/* Signature Area */}
      <div className="border border-gray-300 bg-white">
        <div className="bg-gray-100 border-b border-gray-300 p-2">
          <div className="text-sm font-semibold text-center">SIGNATURES</div>
        </div>
        
        <div className="p-3 space-y-3">
          <div>
            <Label className="text-xs">Employee Signature:</Label>
            <div className="border-b border-gray-300 h-8 mt-1"></div>
          </div>
          
          <div>
            <Label className="text-xs">Manager Signature:</Label>
            <div className="border-b border-gray-300 h-8 mt-1"></div>
          </div>
          
          <div>
            <Label className="text-xs">Date:</Label>
            <div className="border-b border-gray-300 h-8 mt-1"></div>
          </div>
        </div>
      </div>
    </div>);

};

export default CashCollectionSection;