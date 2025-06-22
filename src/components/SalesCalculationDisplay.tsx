import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { SalesCalculationResult, formatCurrency } from '@/utils/salesCalculations';
import { useDeviceAdaptive } from '@/contexts/DeviceAdaptiveContext';

interface SalesCalculationDisplayProps {
  calculation: SalesCalculationResult;
  showDetails?: boolean;
  className?: string;
}

const SalesCalculationDisplay: React.FC<SalesCalculationDisplayProps> = ({
  calculation,
  showDetails = true,
  className = ''
}) => {
  const device = useDeviceAdaptive();

  const getStatusIcon = () => {
    if (calculation.isOver) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (calculation.isShort) return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-blue-600" />;
  };

  const getStatusColor = (opacity: number = 100) => {
    const colors = {
      green: `bg-green-${opacity} border-green-200 text-green-800`,
      red: `bg-red-${opacity} border-red-200 text-red-800`,
      blue: `bg-blue-${opacity} border-blue-200 text-blue-800`
    };
    return colors[calculation.statusColor];
  };

  const getCardLayout = () => {
    if (device.isMobile) {
      return 'grid grid-cols-1 gap-4';
    }
    if (device.isTablet) {
      return 'grid grid-cols-2 lg:grid-cols-4 gap-4';
    }
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4';
  };

  return (
    <Card className={`bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 ${className}`}>
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Total (+/-) Short/Over Calculation
        </CardTitle>
        <CardDescription className="text-green-700">
          User Requirements: Gas Cash + Grocery Cash + Lottery Cash - Cash Expenses
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {showDetails &&
        <div className={getCardLayout()}>
            <motion.div
            className="bg-white p-4 rounded-lg border border-green-200"
            whileHover={device.supportsHover ? { scale: 1.02 } : {}}
            transition={{ duration: 0.2 }}>

              <div className="text-sm text-green-600 mb-1">Gas & Grocery Cash</div>
              <div className="text-2xl font-bold text-green-800">
                {formatCurrency(calculation.gasCashAmount)}
              </div>
              <div className="text-xs text-gray-500 mt-1">From Gas & Grocery Section</div>
            </motion.div>

            <motion.div
            className="bg-white p-4 rounded-lg border border-green-200"
            whileHover={device.supportsHover ? { scale: 1.02 } : {}}
            transition={{ duration: 0.2 }}>

              <div className="text-sm text-green-600 mb-1">Grocery Breakdown Cash</div>
              <div className="text-2xl font-bold text-green-800">
                {formatCurrency(calculation.groceryCashAmount)}
              </div>
              <div className="text-xs text-gray-500 mt-1">From Grocery Breakdown</div>
            </motion.div>

            <motion.div
            className="bg-white p-4 rounded-lg border border-green-200"
            whileHover={device.supportsHover ? { scale: 1.02 } : {}}
            transition={{ duration: 0.2 }}>

              <div className="text-sm text-green-600 mb-1">NY Lottery Total Cash</div>
              <div className="text-2xl font-bold text-green-800">
                {formatCurrency(calculation.lotteryTotalCash)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Net Sales + Scratch Off</div>
            </motion.div>

            <motion.div
            className="bg-white p-4 rounded-lg border border-red-200"
            whileHover={device.supportsHover ? { scale: 1.02 } : {}}
            transition={{ duration: 0.2 }}>

              <div className="text-sm text-red-600 mb-1">Cash Expenses</div>
              <div className="text-2xl font-bold text-red-600">
                -{formatCurrency(calculation.totalCashExpenses)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Subtracted from total</div>
            </motion.div>
          </div>
        }
        
        <div className="mt-4 p-4 bg-white rounded-lg border-2 border-green-300">
          <div className="text-sm text-green-600 mb-1">Expected Cash from Sales</div>
          <div className="text-3xl font-bold text-green-800">
            {formatCurrency(calculation.totalCashFromSales)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            Formula: {formatCurrency(calculation.gasCashAmount)} + {formatCurrency(calculation.groceryCashAmount)} + {formatCurrency(calculation.lotteryTotalCash)}
          </div>
        </div>

        <motion.div
          className={`mt-4 p-6 rounded-lg border-2 ${getStatusColor(50)}`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm mb-1">Final Short/Over Calculation</div>
              <div className={`text-4xl font-bold ${
              calculation.statusColor === 'green' ? 'text-green-800' :
              calculation.statusColor === 'red' ? 'text-red-800' : 'text-blue-800'}`
              }>
                {calculation.displayAmount}
              </div>
              <div className="text-xs mt-2 opacity-75">
                Cash Collection - (Expected Cash - Cash Expenses) = {calculation.statusText}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              {getStatusIcon()}
              <Badge
                variant={calculation.isShort ? 'destructive' : 'default'}
                className="text-sm px-3 py-1">

                {calculation.statusText}
              </Badge>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>);

};

export default SalesCalculationDisplay;