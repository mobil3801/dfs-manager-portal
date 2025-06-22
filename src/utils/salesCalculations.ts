// Sales calculations utility for Total (+/-) Short/Over logic
// Based on user requirements: Sum specific cash amounts and subtract cash expenses

export interface SalesCalculationData {
  // Gas & Grocery Sales Cash Amount
  gasCash: number;

  // Grocery Sales Breakdown Cash Sales
  groceryCash: number;

  // NY Lottery Total Sales Cash (Net Sales + Scratch Off)
  lotteryNetSales: number;
  scratchOffSales: number;

  // Cash Collection on Hand
  cashCollectionOnHand: number;

  // Cash Expenses (only those marked as "Cash" payment type)
  cashExpenses: number;
}

export interface SalesCalculationResult {
  // Individual components
  gasCashAmount: number;
  groceryCashAmount: number;
  lotteryTotalCash: number;
  totalCashFromSales: number;
  totalCashExpenses: number;

  // Final calculation
  totalShortOver: number;

  // Status indicators
  isOver: boolean;
  isShort: boolean;
  isExact: boolean;

  // Display helpers
  displayAmount: string;
  statusText: string;
  statusColor: 'green' | 'red' | 'blue';
}

/**
 * Calculate Total (+/-) Short/Over based on user requirements
 * Formula: Cash Collection - (Expected Cash from Sales - Cash Expenses)
 * 
 * Expected Cash from Sales = Gas Cash + Grocery Cash + Lottery Cash
 * Where Lottery Cash = Net Sales + Scratch Off Sales
 */
export const calculateTotalShortOver = (data: SalesCalculationData): SalesCalculationResult => {
  // Calculate lottery total cash
  const lotteryTotalCash = data.lotteryNetSales + data.scratchOffSales;

  // Calculate expected cash from sales (per user requirements)
  const totalCashFromSales = data.gasCash + data.groceryCash + lotteryTotalCash;

  // Calculate final short/over amount
  // Cash Collection - (Expected Cash - Cash Expenses)
  const totalShortOver = data.cashCollectionOnHand - (totalCashFromSales - data.cashExpenses);

  // Determine status
  const isOver = totalShortOver > 0;
  const isShort = totalShortOver < 0;
  const isExact = totalShortOver === 0;

  // Format display amount with proper sign
  const displayAmount = isOver ? `+$${Math.abs(totalShortOver).toFixed(2)}` :
  isShort ? `-$${Math.abs(totalShortOver).toFixed(2)}` :
  '$0.00';

  // Status text and color
  const statusText = isOver ? 'Over' : isShort ? 'Short' : 'Exact';
  const statusColor: 'green' | 'red' | 'blue' = isOver ? 'green' : isShort ? 'red' : 'blue';

  return {
    gasCashAmount: data.gasCash,
    groceryCashAmount: data.groceryCash,
    lotteryTotalCash,
    totalCashFromSales,
    totalCashExpenses: data.cashExpenses,
    totalShortOver,
    isOver,
    isShort,
    isExact,
    displayAmount,
    statusText,
    statusColor
  };
};

/**
 * Validate sales calculation data
 */
export const validateSalesData = (data: SalesCalculationData): string[] => {
  const errors: string[] = [];

  if (data.gasCash < 0) errors.push('Gas cash amount cannot be negative');
  if (data.groceryCash < 0) errors.push('Grocery cash amount cannot be negative');
  if (data.lotteryNetSales < 0) errors.push('Lottery net sales cannot be negative');
  if (data.scratchOffSales < 0) errors.push('Scratch off sales cannot be negative');
  if (data.cashCollectionOnHand < 0) errors.push('Cash collection cannot be negative');
  if (data.cashExpenses < 0) errors.push('Cash expenses cannot be negative');

  return errors;
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Calculate percentage difference
 */
export const calculatePercentageDifference = (expected: number, actual: number): number => {
  if (expected === 0) return 0;
  return (actual - expected) / expected * 100;
};

export default {
  calculateTotalShortOver,
  validateSalesData,
  formatCurrency,
  calculatePercentageDifference
};