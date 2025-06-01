import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import StationSelector from '@/components/StationSelector';
import GasGrocerySalesSection from '@/components/SalesReportSections/GasGrocerySalesSection';
import LotterySalesSection from '@/components/SalesReportSections/LotterySalesSection';
import GasTankReportSection from '@/components/SalesReportSections/GasTankReportSection';
import ExpensesSection from '@/components/SalesReportSections/ExpensesSection';
import DocumentsUploadSection from '@/components/SalesReportSections/DocumentsUploadSection';
import CashCollectionSection from '@/components/SalesReportSections/CashCollectionSection';

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

export default function SalesReportForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditing = !!id;

  const [selectedStation, setSelectedStation] = useState('');
  const [employees, setEmployees] = useState<Array<{id: number;first_name: string;last_name: string;employee_id: string;}>>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const [formData, setFormData] = useState({
    report_date: new Date().toISOString().split('T')[0],
    station: '',
    employee_name: '',
    // Cash Collection
    cashCollectionOnHand: 0,
    // Gas & Grocery Sales
    creditCardAmount: 0,
    debitCardAmount: 0,
    mobileAmount: 0,
    cashAmount: 0,
    grocerySales: 0,
    ebtSales: 0, // MOBIL only
    // Lottery
    lotteryNetSales: 0,
    scratchOffSales: 0,
    // Gas Tank Report
    regularGallons: 0,
    superGallons: 0,
    dieselGallons: 0,
    // Documents
    dayReportFileId: undefined as number | undefined,
    veederRootFileId: undefined as number | undefined,
    lottoReportFileId: undefined as number | undefined,
    scratchOffReportFileId: undefined as number | undefined,
    // Notes
    notes: ''
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    if (selectedStation) {
      setFormData((prev) => ({ ...prev, station: selectedStation }));
      loadEmployees(selectedStation);
    }
  }, [selectedStation]);

  useEffect(() => {
    if (isEditing && id) {
      loadExistingReport();
    }
  }, [isEditing, id]);

  const loadExistingReport = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(12356, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'id', op: 'Equal', value: parseInt(id!) }]
      });

      if (error) throw error;

      if (data?.List && data.List.length > 0) {
        const report = data.List[0];
        setSelectedStation(report.station);
        setFormData({
          report_date: report.report_date.split('T')[0],
          station: report.station,
          employee_name: report.employee_name,
          cashCollectionOnHand: report.cash_collection_on_hand,
          creditCardAmount: report.credit_card_amount,
          debitCardAmount: report.debit_card_amount,
          mobileAmount: report.mobile_amount,
          cashAmount: report.cash_amount,
          grocerySales: report.grocery_sales,
          ebtSales: report.ebt_sales,
          lotteryNetSales: report.lottery_net_sales,
          scratchOffSales: report.scratch_off_sales,
          regularGallons: report.regular_gallons,
          superGallons: report.super_gallons,
          dieselGallons: report.diesel_gallons,
          dayReportFileId: report.day_report_file_id,
          veederRootFileId: report.veeder_root_file_id,
          lottoReportFileId: report.lotto_report_file_id,
          scratchOffReportFileId: report.scratch_off_report_file_id,
          notes: report.notes
        });

        // Parse expenses from JSON
        if (report.expenses_data) {
          try {
            setExpenses(JSON.parse(report.expenses_data));
          } catch (e) {
            console.error('Error parsing expenses data:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error loading report:', error);
      toast({
        title: 'Error',
        description: 'Failed to load existing report',
        variant: 'destructive'
      });
    }
  };

  const loadEmployees = async (station: string) => {
    setIsLoadingEmployees(true);
    try {
      const { data, error } = await window.ezsite.apis.tablePage(11727, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'first_name',
        IsAsc: true,
        Filters: [
        { name: 'station', op: 'Equal', value: station },
        { name: 'is_active', op: 'Equal', value: true }]

      });

      if (error) throw error;
      setEmployees(data?.List || []);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employees',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  // Auto-calculations
  const totalSales = formData.creditCardAmount + formData.debitCardAmount + formData.mobileAmount + formData.cashAmount + formData.grocerySales;
  const totalGallons = formData.regularGallons + formData.superGallons + formData.dieselGallons;
  const totalLotteryCash = formData.lotteryNetSales + formData.scratchOffSales;
  // Expected Cash calculation: Cash Amount + Grocery Sales (cash portion) + NY Lottery Net Sales + Scratch Off Sales
  const totalCashFromSales = formData.cashAmount + formData.grocerySales + formData.lotteryNetSales + formData.scratchOffSales;
  const totalCashFromExpenses = expenses.filter((e) => e.paymentType === 'Cash').reduce((sum, expense) => sum + expense.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required documents
    const requiredDocs = ['dayReportFileId', 'veederRootFileId', 'lottoReportFileId', 'scratchOffReportFileId'];
    const missingDocs = requiredDocs.filter((doc) => !formData[doc as keyof typeof formData]);

    if (missingDocs.length > 0) {
      toast({
        title: 'Missing Documents',
        description: 'Please upload all required documents before submitting.',
        variant: 'destructive'
      });
      return;
    }

    // Validate expenses have invoices
    const expensesWithoutInvoices = expenses.filter((expense) => !expense.invoiceFileId);
    if (expensesWithoutInvoices.length > 0) {
      toast({
        title: 'Missing Invoices',
        description: 'Please upload invoices for all expenses.',
        variant: 'destructive'
      });
      return;
    }

    const submitData = {
      report_date: formData.report_date,
      station: formData.station,
      employee_name: formData.employee_name,
      cash_collection_on_hand: formData.cashCollectionOnHand,
      total_short_over: formData.cashCollectionOnHand - (totalCashFromSales - totalCashFromExpenses),
      credit_card_amount: formData.creditCardAmount,
      debit_card_amount: formData.debitCardAmount,
      mobile_amount: formData.mobileAmount,
      cash_amount: formData.cashAmount,
      grocery_sales: formData.grocerySales,
      ebt_sales: formData.ebtSales,
      lottery_net_sales: formData.lotteryNetSales,
      scratch_off_sales: formData.scratchOffSales,
      lottery_total_cash: totalLotteryCash,
      regular_gallons: formData.regularGallons,
      super_gallons: formData.superGallons,
      diesel_gallons: formData.dieselGallons,
      total_gallons: totalGallons,
      expenses_data: JSON.stringify(expenses),
      day_report_file_id: formData.dayReportFileId,
      veeder_root_file_id: formData.veederRootFileId,
      lotto_report_file_id: formData.lottoReportFileId,
      scratch_off_report_file_id: formData.scratchOffReportFileId,
      total_sales: totalSales,
      notes: formData.notes,
      created_by: user?.ID || 0
    };

    try {
      let result;
      if (isEditing) {
        result = await window.ezsite.apis.tableUpdate(12356, { ...submitData, ID: parseInt(id!) });
      } else {
        result = await window.ezsite.apis.tableCreate(12356, submitData);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: isEditing ? 'Report Updated' : 'Report Created',
        description: `Sales report has been ${isEditing ? 'updated' : 'created'} successfully.`
      });

      navigate('/sales-reports');
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save report',
        variant: 'destructive'
      });
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExpensesChange = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
  };

  const handleDocumentUpload = (field: string, fileId: number) => {
    setFormData((prev) => ({ ...prev, [field]: fileId }));
  };

  // If no station selected, show station selector
  if (!selectedStation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/sales-reports')}
              className="mb-4">

              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Create Daily Sales Report</h1>
            <p className="text-gray-600 mt-2">Step 1: Select your station to begin</p>
          </div>
          <StationSelector onStationSelect={setSelectedStation} />
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setSelectedStation('')}
            className="mb-4">

            <ArrowLeft className="w-4 h-4 mr-2" />
            Change Station
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Edit' : 'Create'} Daily Sales Report
              </h1>
              <p className="text-gray-600 mt-2">
                Station: <span className="font-semibold">{selectedStation}</span>
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/sales-reports')}>

              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="report_date">Report Date *</Label>
                  <Input
                    type="date"
                    id="report_date"
                    value={formData.report_date}
                    onChange={(e) => updateFormData('report_date', e.target.value)}
                    required />

                </div>
                <div className="space-y-2">
                  <Label>Station</Label>
                  <div className="h-9 px-3 py-2 border border-gray-200 rounded-md bg-gray-100 flex items-center">
                    <span className="text-gray-700 font-medium">{selectedStation}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee *</Label>
                  <Select
                    value={formData.employee_name}
                    onValueChange={(value) => updateFormData('employee_name', value)}>

                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) =>
                      <SelectItem key={employee.id} value={`${employee.first_name} ${employee.last_name}`}>
                          {employee.first_name} {employee.last_name} ({employee.employee_id})
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cash Collection */}
          <CashCollectionSection
            values={{
              cashCollectionOnHand: formData.cashCollectionOnHand,
              totalCashFromSales: totalCashFromSales,
              totalCashFromExpenses: totalCashFromExpenses
            }}
            onChange={updateFormData} />


          {/* Gas & Grocery Sales */}
          <GasGrocerySalesSection
            station={selectedStation}
            values={{
              creditCardAmount: formData.creditCardAmount,
              debitCardAmount: formData.debitCardAmount,
              mobileAmount: formData.mobileAmount,
              cashAmount: formData.cashAmount,
              grocerySales: formData.grocerySales,
              ebtSales: formData.ebtSales
            }}
            onChange={updateFormData} />


          {/* NY Lottery Sales */}
          <LotterySalesSection
            values={{
              lotteryNetSales: formData.lotteryNetSales,
              scratchOffSales: formData.scratchOffSales
            }}
            onChange={updateFormData} />


          {/* Gas Tank Report */}
          <GasTankReportSection
            values={{
              regularGallons: formData.regularGallons,
              superGallons: formData.superGallons,
              dieselGallons: formData.dieselGallons
            }}
            onChange={updateFormData} />


          {/* Expenses */}
          <ExpensesSection
            expenses={expenses}
            onChange={handleExpensesChange} />


          {/* Documents Upload */}
          <DocumentsUploadSection
            documents={{
              dayReportFileId: formData.dayReportFileId,
              veederRootFileId: formData.veederRootFileId,
              lottoReportFileId: formData.lottoReportFileId,
              scratchOffReportFileId: formData.scratchOffReportFileId
            }}
            onChange={handleDocumentUpload} />


          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  placeholder="Enter any additional notes about the day's operations..."
                  rows={4} />

              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Report Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-800">${totalSales.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Sales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800">{totalGallons.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Gallons</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-800">${totalLotteryCash.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Lottery Sales</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/sales-reports')}>

              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Update' : 'Create'} Report
            </Button>
          </div>
        </form>
      </div>
    </div>);

}