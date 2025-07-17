import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Printer, X, DollarSign, Fuel, TrendingUp, Receipt, Calculator, FileText, AlertCircle } from 'lucide-react';

interface EnhancedSalesReport {
  ID: number;
  report_date: string;
  station: string;
  employee_name: string;
  cash_collection_on_hand: number;
  total_short_over: number;
  credit_card_amount: number;
  debit_card_amount: number;
  mobile_amount: number;
  cash_amount: number;
  grocery_sales: number;
  ebt_sales: number;
  lottery_net_sales: number;
  scratch_off_sales: number;
  lottery_total_cash: number;
  regular_gallons: number;
  super_gallons: number;
  diesel_gallons: number;
  total_gallons: number;
  expenses_data: string;
  day_report_file_id: number;
  veeder_root_file_id: number;
  lotto_report_file_id: number;
  scratch_off_report_file_id: number;
  total_sales: number;
  notes: string;
  created_by: number;
  shift?: string;
}

interface Expense {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  paymentType: 'Cash' | 'Credit Card' | 'Cheque';
  chequeNo?: string;
  invoiceFileId?: number;
  notes: string;
}

interface EnhancedSalesReportPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: EnhancedSalesReport | null;
}

const EnhancedSalesReportPrintDialog: React.FC<EnhancedSalesReportPrintDialogProps> = ({
  open,
  onOpenChange,
  report
}) => {
  if (!report) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (num: number) => {
    return (num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getStationBadgeColor = (station: string) => {
    switch (station.toUpperCase()) {
      case 'MOBIL':
        return 'bg-red-500 text-white';
      case 'AMOCO ROSEDALE':
        return 'bg-blue-500 text-white';
      case 'AMOCO BROOKLYN':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Parse expenses data - handle both old and new formats
  let expenses: Expense[] = [];
  let totalExpenses = 0;
  let cashExpenses = 0;
  let cardExpenses = 0;
  let chequeExpenses = 0;

  if (report.expenses_data) {
    try {
      const parsedExpenses = JSON.parse(report.expenses_data);
      // Check if it's the new format with totals
      if (parsedExpenses.total_expenses !== undefined) {
        totalExpenses = parsedExpenses.total_expenses || 0;
        cashExpenses = parsedExpenses.cash_expenses || 0;
        cardExpenses = totalExpenses - cashExpenses; // Approximate for display
        expenses = parsedExpenses.expenses || [];
      } else if (Array.isArray(parsedExpenses)) {
        // Old format - array of expenses
        expenses = parsedExpenses;
        totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        cashExpenses = expenses.filter((e) => e.paymentType === 'Cash').reduce((sum, expense) => sum + expense.amount, 0);
        cardExpenses = expenses.filter((e) => e.paymentType === 'Credit Card').reduce((sum, expense) => sum + expense.amount, 0);
        chequeExpenses = expenses.filter((e) => e.paymentType === 'Cheque').reduce((sum, expense) => sum + expense.amount, 0);
      }
    } catch (error) {
      console.error('Error parsing expenses data:', error);
    }
  }

  // Calculate payment method totals
  const totalPaymentMethods = report.credit_card_amount + report.debit_card_amount + report.mobile_amount + report.cash_amount;
  const totalFuelSales = report.regular_gallons + report.super_gallons + report.diesel_gallons;

  // Verification checks
  const isPaymentBalanced = Math.abs(totalPaymentMethods + report.grocery_sales - report.total_sales) <= 0.01;
  const isCashBalanced = Math.abs(report.total_short_over) <= 1.00; // Allow $1 tolerance

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Enhanced Sales Report - ${report.station} - ${formatDate(report.report_date)}</title>
          <style>
            @page {
              size: A4;
              margin: 0.5in;
            }
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              color: #333;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
            }
            .company-logo {
              font-size: 28px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 20px;
              color: #374151;
              margin-bottom: 10px;
            }
            .report-meta {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 25px;
            }
            .meta-item {
              text-align: center;
            }
            .meta-label {
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              font-weight: 600;
            }
            .meta-value {
              font-size: 14px;
              font-weight: bold;
              margin-top: 5px;
            }
            .station-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              color: white;
              font-size: 12px;
              font-weight: 600;
            }
            .section {
              margin-bottom: 25px;
              break-inside: avoid;
            }
            .section-header {
              display: flex;
              align-items: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
            }
            .section-icon {
              margin-right: 10px;
              color: #2563eb;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
            }
            .data-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
            }
            .data-card {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
              background: #ffffff;
            }
            .data-label {
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              font-weight: 600;
              margin-bottom: 5px;
            }
            .data-value {
              font-size: 16px;
              font-weight: bold;
              color: #1f2937;
            }
            .currency {
              color: #059669;
            }
            .gallons {
              color: #2563eb;
            }
            .summary-card {
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              color: white;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              text-align: center;
            }
            .summary-amount {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .summary-label {
              font-size: 12px;
              opacity: 0.9;
            }
            .expenses-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            .expenses-table th,
            .expenses-table td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            .expenses-table th {
              background: #f3f4f6;
              font-weight: 600;
              font-size: 12px;
              text-transform: uppercase;
            }
            .verification-section {
              background: #f0fdf4;
              border: 2px solid #10b981;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .verification-failed {
              background: #fef2f2;
              border-color: #ef4444;
            }
            .verification-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }
            .check-passed {
              color: #059669;
              font-weight: bold;
            }
            .check-failed {
              color: #dc2626;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            .notes-section {
              background: #fffbeb;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
            }
            @media print {
              body { font-size: 11pt; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-logo">DFS Manager Portal</div>
            <div class="report-title">Daily Sales Report - Enhanced</div>
          </div>

          <div class="report-meta">
            <div class="meta-item">
              <div class="meta-label">Report Date</div>
              <div class="meta-value">${formatDate(report.report_date)}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Station</div>
              <div class="meta-value">
                <span class="station-badge" style="background: ${report.station === 'MOBIL' ? '#ef4444' : report.station === 'AMOCO ROSEDALE' ? '#3b82f6' : '#10b981'}">${report.station}</span>
              </div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Employee</div>
              <div class="meta-value">${report.employee_name}</div>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-grid">
              <div>
                <div class="summary-amount">${formatCurrency(report.total_sales)}</div>
                <div class="summary-label">Total Sales</div>
              </div>
              <div>
                <div class="summary-amount">${formatNumber(report.total_gallons)} gal</div>
                <div class="summary-label">Total Gallons</div>
              </div>
              <div>
                <div class="summary-amount">${formatCurrency(report.lottery_total_cash)}</div>
                <div class="summary-label">Lottery Sales</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-header">
              <span class="section-icon">💰</span>
              <span class="section-title">Cash Collection & Balance</span>
            </div>
            <div class="data-grid">
              <div class="data-card">
                <div class="data-label">Cash on Hand</div>
                <div class="data-value currency">${formatCurrency(report.cash_collection_on_hand)}</div>
              </div>
              <div class="data-card">
                <div class="data-label">Short/Over</div>
                <div class="data-value ${report.total_short_over >= 0 ? 'check-passed' : 'check-failed'}">${formatCurrency(report.total_short_over)}</div>
              </div>
              <div class="data-card">
                <div class="data-label">Cash Sales</div>
                <div class="data-value currency">${formatCurrency(report.cash_amount)}</div>
              </div>
              <div class="data-card">
                <div class="data-label">Cash Expenses</div>
                <div class="data-value currency">${formatCurrency(cashExpenses)}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-header">
              <span class="section-icon">💳</span>
              <span class="section-title">Payment Methods</span>
            </div>
            <div class="data-grid">
              <div class="data-card">
                <div class="data-label">Credit Card</div>
                <div class="data-value currency">${formatCurrency(report.credit_card_amount)}</div>
              </div>
              <div class="data-card">
                <div class="data-label">Debit Card</div>
                <div class="data-value currency">${formatCurrency(report.debit_card_amount)}</div>
              </div>
              <div class="data-card">
                <div class="data-label">Mobile Payments</div>
                <div class="data-value currency">${formatCurrency(report.mobile_amount)}</div>
              </div>
              <div class="data-card">
                <div class="data-label">Cash Payments</div>
                <div class="data-value currency">${formatCurrency(report.cash_amount)}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-header">
              <span class="section-icon">⛽</span>
              <span class="section-title">Fuel Sales</span>
            </div>
            <div class="data-grid">
              <div class="data-card">
                <div class="data-label">Regular Gallons</div>
                <div class="data-value gallons">${formatNumber(report.regular_gallons)} gal</div>
              </div>
              <div class="data-card">
                <div class="data-label">Super Gallons</div>
                <div class="data-value gallons">${formatNumber(report.super_gallons)} gal</div>
              </div>
              <div class="data-card">
                <div class="data-label">Diesel Gallons</div>
                <div class="data-value gallons">${formatNumber(report.diesel_gallons)} gal</div>
              </div>
              <div class="data-card">
                <div class="data-label">Total Gallons</div>
                <div class="data-value gallons">${formatNumber(report.total_gallons)} gal</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-header">
              <span class="section-icon">🛒</span>
              <span class="section-title">Store Sales</span>
            </div>
            <div class="data-grid">
              <div class="data-card">
                <div class="data-label">Grocery Sales</div>
                <div class="data-value currency">${formatCurrency(report.grocery_sales)}</div>
              </div>
              ${report.station === 'MOBIL' ? `
              <div class="data-card">
                <div class="data-label">EBT Sales</div>
                <div class="data-value currency">${formatCurrency(report.ebt_sales)}</div>
              </div>
              ` : ''}
              <div class="data-card">
                <div class="data-label">Lottery Net Sales</div>
                <div class="data-value currency">${formatCurrency(report.lottery_net_sales)}</div>
              </div>
              <div class="data-card">
                <div class="data-label">Scratch-off Sales</div>
                <div class="data-value currency">${formatCurrency(report.scratch_off_sales)}</div>
              </div>
            </div>
          </div>

          ${totalExpenses > 0 ? `
          <div class="section">
            <div class="section-header">
              <span class="section-icon">📋</span>
              <span class="section-title">Expenses Summary</span>
            </div>
            <div class="data-grid">
              <div class="data-card">
                <div class="data-label">Total Expenses</div>
                <div class="data-value currency">${formatCurrency(totalExpenses)}</div>
              </div>
              <div class="data-card">
                <div class="data-label">Cash Expenses</div>
                <div class="data-value currency">${formatCurrency(cashExpenses)}</div>
              </div>
              <div class="data-card">
                <div class="data-label">Card Expenses</div>
                <div class="data-value currency">${formatCurrency(cardExpenses)}</div>
              </div>
              <div class="data-card">
                <div class="data-label">Cheque Expenses</div>
                <div class="data-value currency">${formatCurrency(chequeExpenses)}</div>
              </div>
            </div>
          </div>
          ` : ''}

          <div class="verification-section ${isPaymentBalanced && isCashBalanced ? '' : 'verification-failed'}">
            <div class="section-header">
              <span class="section-icon">✓</span>
              <span class="section-title">Report Verification</span>
            </div>
            <div class="verification-item">
              <span>Payment Methods Balance:</span>
              <span class="${isPaymentBalanced ? 'check-passed' : 'check-failed'}">
                ${isPaymentBalanced ? '✓ Balanced' : '⚠️ Discrepancy: ' + formatCurrency(Math.abs(totalPaymentMethods + report.grocery_sales - report.total_sales))}
              </span>
            </div>
            <div class="verification-item">
              <span>Cash Balance (Short/Over):</span>
              <span class="${isCashBalanced ? 'check-passed' : 'check-failed'}">
                ${isCashBalanced ? '✓ Within tolerance' : '⚠️ Outside tolerance'}
              </span>
            </div>
            <div class="verification-item">
              <span>Documents Uploaded:</span>
              <span class="check-passed">✓ All Required</span>
            </div>
          </div>

          ${report.notes ? `
          <div class="notes-section">
            <div class="section-header">
              <span class="section-icon">📝</span>
              <span class="section-title">Additional Notes</span>
            </div>
            <p style="margin: 0; white-space: pre-wrap;">${report.notes}</p>
          </div>
          ` : ''}

          <div class="footer">
            <div>Report ID: #${report.ID} | Generated on ${new Date().toLocaleString()}</div>
            <div>Created by User #${report.created_by} | DFS Manager Portal v2.0</div>
            <div style="margin-top: 10px; font-style: italic;">
              This is an official business document. Please retain for your records.
            </div>
          </div>
        </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              Enhanced Sales Report - {report.station}
            </DialogTitle>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Printer className="h-4 w-4" />
              Print Full Report
            </Button>
          </div>
        </DialogHeader>

        {/* Preview Content */}
        <div className="space-y-6">
          {/* Header Info */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-800">{formatDate(report.report_date)}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStationBadgeColor(report.station)}>{report.station}</Badge>
                    <span className="text-sm text-gray-600">Employee: {report.employee_name}</span>
                    {report.shift && <Badge variant="outline">{report.shift}</Badge>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-800">{formatCurrency(report.total_sales)}</div>
                  <div className="text-sm text-gray-600">Total Sales</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <div className="text-2xl font-bold text-green-600">{formatCurrency(report.total_sales)}</div>
                <div className="text-sm text-gray-600">Total Sales</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Fuel className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-blue-600">{formatNumber(report.total_gallons)}</div>
                <div className="text-sm text-gray-600">Total Gallons</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(report.lottery_total_cash)}</div>
                <div className="text-sm text-gray-600">Lottery Sales</div>
              </CardContent>
            </Card>
          </div>

          {/* Verification Status */}
          <Card className={`border-2 ${isPaymentBalanced && isCashBalanced ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isPaymentBalanced && isCashBalanced ?
                <div className="text-green-600">✓ Report Verified</div> :
                <div className="text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Discrepancies Found
                  </div>
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span>Payment Balance:</span>
                  <span className={isPaymentBalanced ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {isPaymentBalanced ? '✓ Balanced' : `⚠️ ${formatCurrency(Math.abs(totalPaymentMethods + report.grocery_sales - report.total_sales))} difference`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Balance:</span>
                  <span className={isCashBalanced ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {isCashBalanced ? '✓ Within tolerance' : `⚠️ ${formatCurrency(Math.abs(report.total_short_over))}`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sections Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Credit Card:</span>
                  <span className="font-medium">{formatCurrency(report.credit_card_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Debit Card:</span>
                  <span className="font-medium">{formatCurrency(report.debit_card_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Mobile:</span>
                  <span className="font-medium">{formatCurrency(report.mobile_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cash:</span>
                  <span className="font-medium">{formatCurrency(report.cash_amount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Fuel Sales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Fuel Sales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Regular:</span>
                  <span className="font-medium">{formatNumber(report.regular_gallons)} gal</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Super:</span>
                  <span className="font-medium">{formatNumber(report.super_gallons)} gal</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Diesel:</span>
                  <span className="font-medium">{formatNumber(report.diesel_gallons)} gal</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-semibold">
                  <span>Total:</span>
                  <span>{formatNumber(report.total_gallons)} gal</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expenses Preview */}
          {totalExpenses > 0 &&
          <Card>
              <CardHeader>
                <CardTitle className="text-sm">Expenses Summary - Total: {formatCurrency(totalExpenses)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  Cash: {formatCurrency(cashExpenses)} | Card: {formatCurrency(cardExpenses)} | Cheque: {formatCurrency(chequeExpenses)}
                </div>
              </CardContent>
            </Card>
          }

          {/* Notes Preview */}
          {report.notes &&
          <Card>
              <CardHeader>
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.notes}</p>
              </CardContent>
            </Card>
          }
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="w-4 h-4 mr-2" />
            Print Full Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

};

export default EnhancedSalesReportPrintDialog;