import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { Ticket } from 'lucide-react';

interface LotterySalesSectionProps {
  values: {
    lotteryNetSales: number;
    scratchOffSales: number;
  };
  onChange: (field: string, value: number) => void;
}

const LotterySalesSection: React.FC<LotterySalesSectionProps> = ({
  values,
  onChange
}) => {
  const totalLotteryCash = values.lotteryNetSales + values.scratchOffSales;

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-yellow-800 flex items-center space-x-2">
          <Ticket className="w-5 h-5" />
          <span>NY Lottery Sales</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lotteryNet">Net Sales ($) *</Label>
            <NumberInput
              id="lotteryNet"
              value={values.lotteryNetSales}
              onChange={(value) => onChange('lotteryNetSales', value || 0)}
              min={0}
              step={0.01}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scratchOff">Scratch Off Sales ($) *</Label>
            <NumberInput
              id="scratchOff"
              value={values.scratchOffSales}
              onChange={(value) => onChange('scratchOffSales', value || 0)}
              min={0}
              step={0.01}
              required
            />
          </div>
        </div>
        
        <div className="pt-4 border-t border-yellow-200">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Total Sales Cash (Auto-calculated)</Label>
            <div className="text-2xl font-bold text-yellow-800">${totalLotteryCash.toFixed(2)}</div>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Net Sales + Scratch Off = ${totalLotteryCash.toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LotterySalesSection;