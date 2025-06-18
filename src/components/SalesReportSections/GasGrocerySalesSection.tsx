import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { Fuel, ShoppingCart } from 'lucide-react';

interface GasGrocerySalesSectionProps {
  station: string;
  values: {
    creditCardAmount: number;
    debitCardAmount: number;
    mobileAmount: number;
    cashAmount: number;
    grocerySales: number;
    ebtSales?: number; // Only for MOBIL
  };
  onChange: (field: string, value: number) => void;
}

const GasGrocerySalesSection: React.FC<GasGrocerySalesSectionProps> = ({
  station,
  values,
  onChange
}) => {
  const isMobil = station === 'MOBIL';
  // Auto-calculate only the total sales
  const totalSales = values.creditCardAmount + values.debitCardAmount + values.mobileAmount + values.cashAmount + values.grocerySales;

  return (
    <div className="space-y-6">
      {/* Gas & Grocery Sales Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center space-x-2">
            <Fuel className="w-5 h-5" />
            <span>Gas & Grocery Sales</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Credit Card Amount - Separate Input Box */}
            <div className="space-y-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <Label htmlFor="creditCard" className="font-medium text-gray-700">Credit Card Amount ($) *</Label>
              <NumberInput
                id="creditCard"
                value={values.creditCardAmount}
                onChange={(value) => onChange('creditCardAmount', value || 0)}
                min={0}
                step={0.01}
                required
                className="w-full text-lg"
                placeholder="Enter credit card amount" />

              <div className="text-xs text-gray-500">Manual entry only</div>
            </div>

            {/* Debit Card Amount - Separate Input Box */}
            <div className="space-y-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <Label htmlFor="debitCard" className="font-medium text-gray-700">Debit Card Amount ($) *</Label>
              <NumberInput
                id="debitCard"
                value={values.debitCardAmount}
                onChange={(value) => onChange('debitCardAmount', value || 0)}
                min={0}
                step={0.01}
                required
                className="w-full text-lg"
                placeholder="Enter debit card amount" />

              <div className="text-xs text-gray-500">Manual entry only</div>
            </div>

            {/* Mobile Payment Amount - Separate Input Box */}
            <div className="space-y-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <Label htmlFor="mobile" className="font-medium text-gray-700">Mobile Payment Amount ($) *</Label>
              <NumberInput
                id="mobile"
                value={values.mobileAmount}
                onChange={(value) => onChange('mobileAmount', value || 0)}
                min={0}
                step={0.01}
                required
                className="w-full text-lg"
                placeholder="Enter mobile payment amount" />

              <div className="text-xs text-gray-500">Manual entry only</div>
            </div>

            {/* Cash Amount - Separate Input Box */}
            <div className="space-y-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <Label htmlFor="cash" className="font-medium text-gray-700">Cash Amount ($) *</Label>
              <NumberInput
                id="cash"
                value={values.cashAmount}
                onChange={(value) => onChange('cashAmount', value || 0)}
                min={0}
                step={0.01}
                required
                className="w-full text-lg"
                placeholder="Enter cash amount" />

              <div className="text-xs text-gray-500">Manual entry only</div>
            </div>

            {/* Grocery Sales - Separate Input Box */}
            <div className="space-y-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <Label htmlFor="grocery" className="font-medium text-gray-700">Grocery Sales ($) *</Label>
              <NumberInput
                id="grocery"
                value={values.grocerySales}
                onChange={(value) => onChange('grocerySales', value || 0)}
                min={0}
                step={0.01}
                required
                className="w-full text-lg"
                placeholder="Enter grocery sales amount" />

              <div className="text-xs text-gray-500">Manual entry only</div>
            </div>

            {/* EBT Sales - Separate Input Box (MOBIL only) */}
            {isMobil &&
            <div className="space-y-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <Label htmlFor="ebt" className="font-medium text-gray-700">EBT Sales ($) *</Label>
                <NumberInput
                id="ebt"
                value={values.ebtSales || 0}
                onChange={(value) => onChange('ebtSales', value || 0)}
                min={0}
                step={0.01}
                required
                className="w-full text-lg"
                placeholder="Enter EBT sales amount" />
                <div className="text-xs text-gray-500">Manual entry only (MOBIL station)</div>
              </div>
            }
          </div>
          
          {/* Auto-calculated Total Sales Section */}
          <div className="pt-6 border-t-2 border-blue-300 bg-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold text-blue-900">
                💰 Total Sales (Auto-calculated)
              </Label>
              <div className="text-3xl font-bold text-blue-800 bg-white px-4 py-2 rounded-lg shadow">
                ${totalSales.toFixed(2)}
              </div>
            </div>
            <div className="text-sm text-blue-700 mt-2 font-medium">
              📊 Credit (${values.creditCardAmount.toFixed(2)}) + Debit (${values.debitCardAmount.toFixed(2)}) + Mobile (${values.mobileAmount.toFixed(2)}) + Cash (${values.cashAmount.toFixed(2)}) + Grocery (${values.grocerySales.toFixed(2)}) = ${totalSales.toFixed(2)}
            </div>
            {isMobil && values.ebtSales &&
            <div className="text-xs text-blue-600 mt-1">
                Note: EBT sales (${values.ebtSales.toFixed(2)}) not included in main total - tracked separately
              </div>
            }
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default GasGrocerySalesSection;