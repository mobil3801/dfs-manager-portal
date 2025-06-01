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
  const totalSales = values.creditCardAmount + values.debitCardAmount + values.mobileAmount + values.cashAmount + values.grocerySales;

  return (
    <div className="space-y-6">
      {/* Gas &amp; Grocery Sales Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center space-x-2">
            <Fuel className="w-5 h-5" />
            <span>Gas &amp; Grocery Sales</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creditCard">Credit Card Amount ($) *</Label>
              <NumberInput
                id="creditCard"
                value={values.creditCardAmount}
                onChange={(value) => onChange('creditCardAmount', value || 0)}
                min={0}
                step={0.01}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debitCard">Debit Card Amount ($) *</Label>
              <NumberInput
                id="debitCard"
                value={values.debitCardAmount}
                onChange={(value) => onChange('debitCardAmount', value || 0)}
                min={0}
                step={0.01}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Payment Amount ($) *</Label>
              <NumberInput
                id="mobile"
                value={values.mobileAmount}
                onChange={(value) => onChange('mobileAmount', value || 0)}
                min={0}
                step={0.01}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cash">Cash Amount ($) *</Label>
              <NumberInput
                id="cash"
                value={values.cashAmount}
                onChange={(value) => onChange('cashAmount', value || 0)}
                min={0}
                step={0.01}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grocery">Grocery Sales ($) *</Label>
              <NumberInput
                id="grocery"
                value={values.grocerySales}
                onChange={(value) => onChange('grocerySales', value || 0)}
                min={0}
                step={0.01}
                required
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-blue-200">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Total Sales (Auto-calculated)</Label>
              <div className="text-2xl font-bold text-blue-800">${totalSales.toFixed(2)}</div>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Credit + Debit + Mobile + Cash + Grocery = ${totalSales.toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grocery Sales Section (MOBIL only) */}
      {isMobil && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Grocery Sales Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="groceryCash">Cash Sales ($) *</Label>
                <NumberInput
                  id="groceryCash"
                  value={values.cashAmount}
                  onChange={(value) => onChange('cashAmount', value || 0)}
                  min={0}
                  step={0.01}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groceryCreditDebit">Credit/Debit Card ($) *</Label>
                <NumberInput
                  id="groceryCreditDebit"
                  value={values.creditCardAmount + values.debitCardAmount}
                  onChange={(value) => {
                    const half = (value || 0) / 2;
                    onChange('creditCardAmount', half);
                    onChange('debitCardAmount', half);
                  }}
                  min={0}
                  step={0.01}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ebt">EBT ($) *</Label>
                <NumberInput
                  id="ebt"
                  value={values.ebtSales || 0}
                  onChange={(value) => onChange('ebtSales', value || 0)}
                  min={0}
                  step={0.01}
                  required
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-green-200">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Total Grocery Sales</Label>
                <div className="text-2xl font-bold text-green-800">
                  ${(values.cashAmount + values.creditCardAmount + values.debitCardAmount + (values.ebtSales || 0)).toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GasGrocerySalesSection;