import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SalesDataSectionProps {
  formData: any;
  updateFormData: (field: string, value: string | number) => void;
}

const SalesDataSection: React.FC<SalesDataSectionProps> = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-4">
      {/* Gas & Grocery Sales */}
      <div className="border border-gray-300 bg-white">
        <div className="bg-gray-100 border-b border-gray-300 p-2">
          <div className="text-sm font-semibold text-center">GAS & GROCERY SALES</div>
        </div>
        
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Cash:</Label>
            <Input
              type="number"
              value={formData.cashAmount || ''}
              onChange={(e) => updateFormData('cashAmount', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="$0.00"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Credit Card:</Label>
            <Input
              type="number"
              value={formData.creditCardAmount || ''}
              onChange={(e) => updateFormData('creditCardAmount', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="$0.00"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Debit Card:</Label>
            <Input
              type="number"
              value={formData.debitCardAmount || ''}
              onChange={(e) => updateFormData('debitCardAmount', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="$0.00"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Mobile Payment:</Label>
            <Input
              type="number"
              value={formData.mobileAmount || ''}
              onChange={(e) => updateFormData('mobileAmount', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="$0.00"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Grocery Sales:</Label>
            <Input
              type="number"
              value={formData.grocerySales || ''}
              onChange={(e) => updateFormData('grocerySales', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="$0.00"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">EBT Sales:</Label>
            <Input
              type="number"
              value={formData.ebtSales || ''}
              onChange={(e) => updateFormData('ebtSales', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="$0.00"
            />
          </div>
        </div>
      </div>

      {/* Lottery Sales */}
      <div className="border border-gray-300 bg-white">
        <div className="bg-gray-100 border-b border-gray-300 p-2">
          <div className="text-sm font-semibold text-center">NY LOTTERY</div>
        </div>
        
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Lottery Net Sales:</Label>
            <Input
              type="number"
              value={formData.lotteryNetSales || ''}
              onChange={(e) => updateFormData('lotteryNetSales', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="$0.00"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Scratch Off Sales:</Label>
            <Input
              type="number"
              value={formData.scratchOffSales || ''}
              onChange={(e) => updateFormData('scratchOffSales', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="$0.00"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center bg-gray-50">
            <Label className="text-xs font-semibold">Total Lottery Cash:</Label>
            <div className="text-xs font-semibold p-2 bg-gray-100 border border-gray-300 rounded">
              ${((formData.lotteryNetSales || 0) + (formData.scratchOffSales || 0)).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Gas Tank Report */}
      <div className="border border-gray-300 bg-white">
        <div className="bg-gray-100 border-b border-gray-300 p-2">
          <div className="text-sm font-semibold text-center">GAS TANK REPORT</div>
        </div>
        
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Regular Gallons:</Label>
            <Input
              type="number"
              value={formData.regularGallons || ''}
              onChange={(e) => updateFormData('regularGallons', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="0"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Super Gallons:</Label>
            <Input
              type="number"
              value={formData.superGallons || ''}
              onChange={(e) => updateFormData('superGallons', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="0"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label className="text-xs">Diesel Gallons:</Label>
            <Input
              type="number"
              value={formData.dieselGallons || ''}
              onChange={(e) => updateFormData('dieselGallons', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs border border-gray-300"
              placeholder="0"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center bg-gray-50">
            <Label className="text-xs font-semibold">Total Gallons:</Label>
            <div className="text-xs font-semibold p-2 bg-gray-100 border border-gray-300 rounded">
              {((formData.regularGallons || 0) + (formData.superGallons || 0) + (formData.dieselGallons || 0)).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDataSection;