import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { Fuel, ShoppingCart, Calculator } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface GasGrocerySalesSectionProps {
  station: string;
  values: {
    creditCardAmount: number;
    debitCardAmount: number;
    mobileAmount: number;
    cashAmount: number;
    grocerySales: number;
    ebtSales?: number; // Only for MOBIL
    totalSales?: number; // Manual total sales entry
    regularGallons?: number; // Manual gas gallons entry
    superGallons?: number; // Manual gas gallons entry
    dieselGallons?: number; // Manual gas gallons entry
    totalGallons?: number; // Manual total gallons entry
  };
  onChange: (field: string, value: number) => void;
}

const GasGrocerySalesSection: React.FC<GasGrocerySalesSectionProps> = ({
  station,
  values,
  onChange
}) => {
  const isMobile = useIsMobile();
  const isMobil = station === 'MOBIL';

  // Auto-calculated total for reference, but user can override
  const calculatedTotal = values.creditCardAmount + values.debitCardAmount + values.mobileAmount + values.cashAmount + values.grocerySales + (values.ebtSales || 0);
  const calculatedGallons = (values.regularGallons || 0) + (values.superGallons || 0) + (values.dieselGallons || 0);

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
          {/* Payment Method Sales */}
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="creditCard">Credit Card Amount ($) *</Label>
              <NumberInput
                id="creditCard"
                value={values.creditCardAmount}
                onChange={(value) => onChange('creditCardAmount', value || 0)}
                min={0}
                step={0.01}
                placeholder="Enter credit card sales"
                required />

            </div>
            
            <div className="space-y-2">
              <Label htmlFor="debitCard">Debit Card Amount ($) *</Label>
              <NumberInput
                id="debitCard"
                value={values.debitCardAmount}
                onChange={(value) => onChange('debitCardAmount', value || 0)}
                min={0}
                step={0.01}
                placeholder="Enter debit card sales"
                required />

            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Payment Amount ($) *</Label>
              <NumberInput
                id="mobile"
                value={values.mobileAmount}
                onChange={(value) => onChange('mobileAmount', value || 0)}
                min={0}
                step={0.01}
                placeholder="Enter mobile payment sales"
                required />

            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cash">Cash Amount ($) *</Label>
              <NumberInput
                id="cash"
                value={values.cashAmount}
                onChange={(value) => onChange('cashAmount', value || 0)}
                min={0}
                step={0.01}
                placeholder="Enter cash sales"
                required />

            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grocery">Grocery Sales ($) *</Label>
              <NumberInput
                id="grocery"
                value={values.grocerySales}
                onChange={(value) => onChange('grocerySales', value || 0)}
                min={0}
                step={0.01}
                placeholder="Enter grocery sales"
                required />

            </div>

            {isMobil &&
            <div className="space-y-2">
                <Label htmlFor="ebtSales">EBT Sales ($) *</Label>
                <NumberInput
                id="ebtSales"
                value={values.ebtSales || 0}
                onChange={(value) => onChange('ebtSales', value || 0)}
                min={0}
                step={0.01}
                placeholder="Enter EBT sales"
                required />

              </div>
            }
          </div>

          {/* Gas Gallons Section */}
          <div className="pt-4 border-t border-blue-200">
            <Label className="text-lg font-semibold mb-4 block">Gas Sales (Gallons) - Manual Entry</Label>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
              <div className="space-y-2">
                <Label htmlFor="regularGallons">Regular Gallons *</Label>
                <NumberInput
                  id="regularGallons"
                  value={values.regularGallons || 0}
                  onChange={(value) => onChange('regularGallons', value || 0)}
                  min={0}
                  step={0.01}
                  placeholder="Enter regular gallons"
                  required />

              </div>
              
              <div className="space-y-2">
                <Label htmlFor="superGallons">Super Gallons *</Label>
                <NumberInput
                  id="superGallons"
                  value={values.superGallons || 0}
                  onChange={(value) => onChange('superGallons', value || 0)}
                  min={0}
                  step={0.01}
                  placeholder="Enter super gallons"
                  required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dieselGallons">Diesel Gallons *</Label>
                <NumberInput
                  id="dieselGallons"
                  value={values.dieselGallons || 0}
                  onChange={(value) => onChange('dieselGallons', value || 0)}
                  min={0}
                  step={0.01}
                  placeholder="Enter diesel gallons"
                  required />
              </div>
            </div>

            {/* Manual Total Gallons Override */}
            <div className="mt-4 pt-4 border-t border-blue-100">
              <div className="space-y-2">
                <Label htmlFor="totalGallons" className="text-sm font-medium">
                  Total Gallons - Manual Entry (Override calculated: {calculatedGallons.toFixed(2)})
                </Label>
                <NumberInput
                  id="totalGallons"
                  value={values.totalGallons || calculatedGallons}
                  onChange={(value) => onChange('totalGallons', value || 0)}
                  min={0}
                  step={0.01}
                  placeholder="Enter total gallons or leave to auto-calculate"
                  className="bg-yellow-50 border-yellow-300" />
              </div>
            </div>
          </div>
          
          {/* Manual Total Sales Section */}
          <div className="pt-4 border-t border-blue-200">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <Label className="text-lg font-semibold">Sales Total - Manual Entry</Label>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalSales" className="text-sm font-medium">
                    Total Sales ($) - Manual Entry (Calculated: ${calculatedTotal.toFixed(2)})
                  </Label>
                  <NumberInput
                    id="totalSales"
                    value={values.totalSales || calculatedTotal}
                    onChange={(value) => onChange('totalSales', value || 0)}
                    min={0}
                    step={0.01}
                    placeholder="Enter total sales or leave to auto-calculate"
                    className="bg-yellow-50 border-yellow-300 text-lg font-semibold" />
                </div>
              </div>
              
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <div className="font-medium mb-2">Breakdown Reference:</div>
                <div>Credit: ${values.creditCardAmount.toFixed(2)}</div>
                <div>Debit: ${values.debitCardAmount.toFixed(2)}</div>
                <div>Mobile: ${values.mobileAmount.toFixed(2)}</div>
                <div>Cash: ${values.cashAmount.toFixed(2)}</div>
                <div>Grocery: ${values.grocerySales.toFixed(2)}</div>
                {isMobil && <div>EBT: ${(values.ebtSales || 0).toFixed(2)}</div>}
                <div className="border-t pt-2 mt-2 font-medium">
                  Auto-calculated Total: ${calculatedTotal.toFixed(2)}
                </div>
                <div className="font-medium text-blue-700">
                  Manual Total: ${(values.totalSales || calculatedTotal).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default GasGrocerySalesSection;