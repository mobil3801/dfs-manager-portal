import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Save,
  TrendingUp,
  FileEdit,
  Clock,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Folder,
  RefreshCw } from
'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceAdaptive } from '@/contexts/DeviceAdaptiveContext';
import StationSelector from '@/components/StationSelector';
import GasGrocerySalesSection from '@/components/SalesReportSections/GasGrocerySalesSection';
import LotterySalesSection from '@/components/SalesReportSections/LotterySalesSection';
import GasTankReportSection from '@/components/SalesReportSections/GasTankReportSection';
import ExpensesSection from '@/components/SalesReportSections/ExpensesSection';
import DocumentsUploadSection from '@/components/SalesReportSections/DocumentsUploadSection';
import CashCollectionSection from '@/components/SalesReportSections/CashCollectionSection';
import DraftManagementDialog from '@/components/DraftManagementDialog';
import SalesCalculationDisplay from '@/components/SalesCalculationDisplay';
import EnhancedAdaptiveLayout from '@/components/EnhancedAdaptiveLayout';
import DraftSavingService from '@/utils/draftSaving';
import { calculateTotalShortOver, SalesCalculationData } from '@/utils/salesCalculations';

export default function SalesReportForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const device = useDeviceAdaptive();
  const isEditing = !!id;

  const [selectedStation, setSelectedStation] = useState('');
  const [employees, setEmployees] = useState<Array<{id: number;first_name: string;last_name: string;employee_id: string;}>>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [cashExpenses, setCashExpenses] = useState(0);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftInfo, setDraftInfo] = useState<{
    savedAt: Date;
    expiresAt: Date;
    timeRemainingHours: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    report_date: new Date().toISOString().split('T')[0],
    station: '',
    shift: 'DAY',
    employee_name: '',
    employee_id: '',
    // Cash Collection
    cashCollectionOnHand: 0,
    // Gas & Grocery Sales - Manual Entry
    creditCardAmount: 0,
    debitCardAmount: 0,
    mobileAmount: 0,
    cashAmount: 0,
    grocerySales: 0,
    ebtSales: 0, // MOBIL only
    // Grocery Sales Breakdown - Manual Entry
    groceryCashSales: 0,
    groceryCardSales: 0,
    // Lottery - Manual Entry
    lotteryNetSales: 0,
    scratchOffSales: 0,
    // Gas Tank Report - Manual Entry
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

  useEffect(() => {
    if (selectedStation) {
      setFormData((prev) => ({ ...prev, station: selectedStation }));
      loadEmployees(selectedStation);
      checkForExistingDraft();
    }
  }, [selectedStation]);

  useEffect(() => {
    if (isEditing && id) {
      loadExistingReport();
    }
  }, [isEditing, id]);

  // Check for existing draft when form data changes
  useEffect(() => {
    if (selectedStation && formData.report_date) {
      checkForExistingDraft();
    }
  }, [selectedStation, formData.report_date]);

  const checkForExistingDraft = () => {
    if (selectedStation && formData.report_date && !isEditing) {
      const info = DraftSavingService.getDraftInfo(selectedStation, formData.report_date);
      setDraftInfo(info);
    }
  };

  const loadExistingReport = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(12356, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'id', op: 'Equal', value: parseInt(id!) }]
      });

      if (error) throw new Error(error);

      if (data?.List && data.List.length > 0) {
        const report = data.List[0];
        setSelectedStation(report.station);
        setFormData({
          report_date: report.report_date.split('T')[0],
          station: report.station,
          shift: report.shift || 'DAY',
          employee_name: report.employee_name,
          employee_id: report.employee_id || '',
          cashCollectionOnHand: report.cash_collection_on_hand,
          creditCardAmount: report.credit_card_amount,
          debitCardAmount: report.debit_card_amount,
          mobileAmount: report.mobile_amount,
          cashAmount: report.cash_amount,
          grocerySales: report.grocery_sales,
          ebtSales: report.ebt_sales,
          groceryCashSales: 0,
          groceryCardSales: 0,
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

      if (error) throw new Error(error);
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

  // Enhanced calculations using the new utility
  const salesCalculationData: SalesCalculationData = useMemo(() => ({
    gasCash: formData.cashAmount,
    groceryCash: formData.groceryCashSales,
    lotteryNetSales: formData.lotteryNetSales,
    scratchOffSales: formData.scratchOffSales,
    cashCollectionOnHand: formData.cashCollectionOnHand,
    cashExpenses: cashExpenses
  }), [formData.cashAmount, formData.groceryCashSales, formData.lotteryNetSales,
  formData.scratchOffSales, formData.cashCollectionOnHand, cashExpenses]);

  const calculation = useMemo(() => {
    return calculateTotalShortOver(salesCalculationData);
  }, [salesCalculationData]);

  // Legacy calculations for compatibility
  const totalSales = formData.creditCardAmount + formData.debitCardAmount + formData.mobileAmount + formData.cashAmount + formData.grocerySales;
  const totalGallons = formData.regularGallons + formData.superGallons + formData.dieselGallons;
  const totalLotteryCash = formData.lotteryNetSales + formData.scratchOffSales;
  const totalGrocerySales = formData.groceryCashSales + formData.groceryCardSales + formData.ebtSales;

  const handleSaveAsDraft = () => {
    try {
      if (!selectedStation || !formData.report_date) {
        toast({
          title: 'Cannot Save Draft',
          description: 'Please select a station and report date first',
          variant: 'destructive'
        });
        return;
      }

      const success = DraftSavingService.saveDraft(selectedStation, formData.report_date, {
        ...formData,
        totalExpenses,
        cashExpenses,
        calculatedValues: {
          totalSales,
          totalGallons,
          totalLotteryCash,
          totalGrocerySales,
          calculation
        }
      });

      if (success) {
        toast({
          title: 'Draft Saved',
          description: `Form data saved for ${selectedStation} on ${formData.report_date}. Will expire in 12 hours.`
        });
        checkForExistingDraft();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save draft',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to save draft',
        variant: 'destructive'
      });
    }
  };

  const handleLoadDraft = (draftData: any, station: string, reportDate: string) => {
    try {
      setSelectedStation(station);
      setFormData({
        ...draftData,
        station
      });

      if (draftData.totalExpenses) setTotalExpenses(draftData.totalExpenses);
      if (draftData.cashExpenses) setCashExpenses(draftData.cashExpenses);

      // Delete the draft after loading
      DraftSavingService.deleteDraft(station, reportDate);
      setDraftInfo(null);
    } catch (error) {
      console.error('Error loading draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to load draft data',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      report_date: new Date().toISOString().split('T')[0],
      station: selectedStation,
      shift: 'DAY',
      employee_name: '',
      employee_id: '',
      cashCollectionOnHand: 0,
      creditCardAmount: 0,
      debitCardAmount: 0,
      mobileAmount: 0,
      cashAmount: 0,
      grocerySales: 0,
      ebtSales: 0,
      groceryCashSales: 0,
      groceryCardSales: 0,
      lotteryNetSales: 0,
      scratchOffSales: 0,
      regularGallons: 0,
      superGallons: 0,
      dieselGallons: 0,
      dayReportFileId: undefined,
      veederRootFileId: undefined,
      lottoReportFileId: undefined,
      scratchOffReportFileId: undefined,
      notes: ''
    });
    setTotalExpenses(0);
    setCashExpenses(0);
    setDraftInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required documents
    const requiredDocs = ['dayReportFileId', 'veederRootFileId', 'lottoReportFileId', 'scratchOffReportFileId'];
    const missingDocs = requiredDocs.filter((doc) => !formData[doc as keyof typeof formData]);

    if (missingDocs.length > 0) {
      toast({
        title: 'Missing Documents',
        description: 'Please upload all required documents before submitting.',
        variant: 'destructive'
      });
      setIsSubmitting(false);
      return;
    }

    const submitData = {
      report_date: formData.report_date,
      station: formData.station,
      shift: formData.shift,
      employee_name: formData.employee_name,
      employee_id: formData.employee_id,
      cash_collection_on_hand: formData.cashCollectionOnHand,
      total_short_over: calculation.totalShortOver,
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
      expenses_data: JSON.stringify({ total_expenses: totalExpenses, cash_expenses: cashExpenses }),
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

      // Delete any existing draft after successful submission
      if (selectedStation && formData.report_date) {
        DraftSavingService.deleteDraft(selectedStation, formData.report_date);
      }

      // Reset form after successful submission (as requested)
      if (!isEditing) {
        resetForm();
        toast({
          title: 'Form Reset',
          description: 'Form has been reset for new entry'
        });
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save report',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDocumentUpload = (field: string, fileId: number) => {
    setFormData((prev) => ({ ...prev, [field]: fileId }));
  };

  const handleExpensesChange = (totalExpenses: number, cashExpenses: number = 0) => {
    setTotalExpenses(totalExpenses);
    setCashExpenses(cashExpenses);
  };

  const validEmployees = employees.filter((employee) => employee.employee_id && employee.employee_id.trim() !== '');

  // If no station selected, show station selector
  if (!selectedStation) {
    return (
      <EnhancedAdaptiveLayout padding="medium" maxWidth="4xl">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Create Daily Sales Report</h1>
          <p className="text-gray-600 mt-2">Step 1: Select your station to begin</p>
        </div>
        <StationSelector onStationSelect={setSelectedStation} />
      </EnhancedAdaptiveLayout>);

  }

  return (
    <EnhancedAdaptiveLayout padding="medium" maxWidth="6xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => setSelectedStation('')}
          className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Change Station
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit' : 'Create'} Daily Sales Report
          </h1>
          <p className="text-gray-600 mt-2">
            Station: <span className="font-semibold">{selectedStation}</span>
          </p>
        </div>
      </div>

      {/* Draft Info Alert */}
      {draftInfo && !isEditing &&
      <Alert className="mb-6 border-amber-200 bg-amber-50">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="flex items-center justify-between">
              <span>
                You have a saved draft from {draftInfo.savedAt.toLocaleString()}. 
                Expires in {Math.floor(draftInfo.timeRemainingHours)} hours.
              </span>
              <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDraftDialog(true)}
              className="ml-4 text-amber-800 border-amber-300 hover:bg-amber-100">

                <Folder className="w-3 h-3 mr-1" />
                Manage Drafts
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      }

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-6 ${device.isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-4'}`}>
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
                <Label htmlFor="shift">Shift *</Label>
                <Select
                  value={formData.shift}
                  onValueChange={(value) => updateFormData('shift', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAY">DAY</SelectItem>
                    <SelectItem value="NIGHT">NIGHT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee">Employee Name *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => {
                    const selectedEmployee = validEmployees.find((emp) => emp.employee_id === value);
                    if (selectedEmployee) {
                      updateFormData('employee_id', value);
                      updateFormData('employee_name', `${selectedEmployee.first_name} ${selectedEmployee.last_name}`);
                    }
                  }}
                  disabled={isLoadingEmployees}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingEmployees ? "Loading employees..." : "Select employee"} />
                  </SelectTrigger>
                  <SelectContent>
                    {validEmployees.length === 0 && !isLoadingEmployees &&
                    <div className="p-2 text-center text-gray-500">
                        No active employees found for {selectedStation}
                      </div>
                    }
                    {validEmployees.map((employee) =>
                    <SelectItem key={employee.id} value={employee.employee_id}>
                        {employee.first_name} {employee.last_name} (ID: {employee.employee_id})
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Collection with Enhanced Calculation Display */}
        <CashCollectionSection
          values={{
            cashCollectionOnHand: formData.cashCollectionOnHand,
            totalCashFromSales: calculation.totalCashFromSales,
            totalCashFromExpenses: cashExpenses,
            totalShortOver: calculation.totalShortOver
          }}
          onChange={updateFormData} />

        {/* Enhanced Sales Calculation Display */}
        <SalesCalculationDisplay
          calculation={calculation}
          showDetails={!device.isMobile} />


        {/* Gas & Grocery Sales */}
        <GasGrocerySalesSection
          station={selectedStation}
          values={{
            creditCardAmount: formData.creditCardAmount,
            debitCardAmount: formData.debitCardAmount,
            mobileAmount: formData.mobileAmount,
            cashAmount: formData.cashAmount,
            grocerySales: formData.grocerySales,
            ebtSales: formData.ebtSales,
            groceryCashSales: formData.groceryCashSales,
            groceryCardSales: formData.groceryCardSales
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

        {/* Expenses Section */}
        <ExpensesSection
          station={selectedStation}
          reportDate={formData.report_date}
          onExpensesChange={handleExpensesChange} />

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
            <div className={`grid gap-6 ${device.isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-5'}`}>
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
              <div className="text-center">
                <div className="text-2xl font-bold text-green-800">${totalGrocerySales.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Grocery Sales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-800">${totalExpenses.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Expenses</div>
              </div>
            </div>
            
            {/* Additional Short/Over Summary */}
            <div className="mt-6 pt-4 border-t border-blue-200">
              <div className="text-center">
                <div className="text-sm text-blue-600 mb-1">Total (+/-) Short/Over</div>
                <div className={`text-4xl font-bold ${calculation.statusColor === 'green' ? 'text-green-800' : calculation.statusColor === 'red' ? 'text-red-800' : 'text-blue-800'}`}>
                  {calculation.displayAmount}
                </div>
                <Badge variant={calculation.isShort ? 'destructive' : 'default'} className="mt-2">
                  {calculation.statusText}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className={`flex items-center ${device.isMobile ? 'flex-col gap-4' : 'justify-between'} pt-6`}>
          <div className={`flex items-center space-x-4 ${device.isMobile ? 'w-full justify-center' : ''}`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            
            {!isEditing &&
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDraftDialog(true)}
              className="gap-2">
                <Folder className="w-4 h-4" />
                Manage Drafts
              </Button>
            }
          </div>

          <div className={`flex items-center space-x-4 ${device.isMobile ? 'w-full justify-center' : ''}`}>
            {!isEditing &&
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveAsDraft}
              className="gap-2">
                <FileEdit className="w-4 h-4" />
                Save as Draft
              </Button>
            }
            
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 gap-2"
              disabled={isSubmitting}>
              {isSubmitting ?
              <RefreshCw className="w-4 h-4 animate-spin" /> :

              <Save className="w-4 h-4" />
              }
              {isEditing ? 'Update' : 'Create'} Report
            </Button>
          </div>
        </div>
      </form>

      {/* Draft Management Dialog */}
      <DraftManagementDialog
        open={showDraftDialog}
        onClose={() => setShowDraftDialog(false)}
        onLoadDraft={handleLoadDraft}
        currentStation={selectedStation}
        currentReportDate={formData.report_date} />

    </EnhancedAdaptiveLayout>);

}