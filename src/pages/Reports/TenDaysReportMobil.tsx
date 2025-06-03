import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save, Printer } from 'lucide-react';
import FormHeader from '@/components/MobilSalesForm/FormHeader';
import FuelDeliverySection from '@/components/MobilSalesForm/FuelDeliverySection';
import SalesDataSection from '@/components/MobilSalesForm/SalesDataSection';
import CashCollectionSection from '@/components/MobilSalesForm/CashCollectionSection';
import ExpensesSection from '@/components/MobilSalesForm/ExpensesSection';

interface FormData {
  // Header
  reportDate: string;

  // Fuel Delivery
  bolNumber: string;
  regularTankBefore: number;
  plusTankBefore: number;
  superTankBefore: number;
  regularDelivered: number;
  plusDelivered: number;
  superDelivered: number;

  // Sales Data
  cashAmount: number;
  creditCardAmount: number;
  debitCardAmount: number;
  mobileAmount: number;
  grocerySales: number;
  ebtSales: number;
  lotteryNetSales: number;
  scratchOffSales: number;
  regularGallons: number;
  superGallons: number;
  dieselGallons: number;

  // Cash Collection
  cashCollectionOnHand: number;

  // Employee Info
  employeeName: string;
  shift: string;

  // Expenses
  expenses: any[];

  // Notes
  notes: string;
}

const TenDaysReportMobil: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    reportDate: new Date().toISOString().split('T')[0],
    bolNumber: '',
    regularTankBefore: 0,
    plusTankBefore: 0,
    superTankBefore: 0,
    regularDelivered: 0,
    plusDelivered: 0,
    superDelivered: 0,
    cashAmount: 0,
    creditCardAmount: 0,
    debitCardAmount: 0,
    mobileAmount: 0,
    grocerySales: 0,
    ebtSales: 0,
    lotteryNetSales: 0,
    scratchOffSales: 0,
    regularGallons: 0,
    superGallons: 0,
    dieselGallons: 0,
    cashCollectionOnHand: 0,
    employeeName: '',
    shift: 'DAY',
    expenses: [],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveReport = async () => {
    try {
      setLoading(true);

      // Calculate totals
      const totalSales = formData.cashAmount + formData.creditCardAmount +
      formData.debitCardAmount + formData.mobileAmount +
      formData.grocerySales + formData.ebtSales;
      const totalGallons = formData.regularGallons + formData.superGallons + formData.dieselGallons;
      const lotteryTotalCash = formData.lotteryNetSales + formData.scratchOffSales;
      const totalShortOver = formData.cashCollectionOnHand - (
      formData.cashAmount + formData.lotteryNetSales + formData.scratchOffSales);

      const reportData = {
        report_date: formData.reportDate,
        station: 'MOBIL',
        employee_name: formData.employeeName,
        shift: formData.shift,
        cash_collection_on_hand: formData.cashCollectionOnHand,
        total_short_over: totalShortOver,
        credit_card_amount: formData.creditCardAmount,
        debit_card_amount: formData.debitCardAmount,
        mobile_amount: formData.mobileAmount,
        cash_amount: formData.cashAmount,
        grocery_sales: formData.grocerySales,
        ebt_sales: formData.ebtSales,
        lottery_net_sales: formData.lotteryNetSales,
        scratch_off_sales: formData.scratchOffSales,
        lottery_total_cash: lotteryTotalCash,
        regular_gallons: formData.regularGallons,
        super_gallons: formData.superGallons,
        diesel_gallons: formData.dieselGallons,
        total_gallons: totalGallons,
        expenses_data: JSON.stringify(formData.expenses),
        total_sales: totalSales,
        notes: formData.notes,
        created_by: 1 // TODO: Get from auth context
      };

      const { error } = await window.ezsite.apis.tableCreate(12356, reportData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Daily sales report saved successfully."
      });

      // Reset form after successful save
      setFormData({
        reportDate: new Date().toISOString().split('T')[0],
        bolNumber: '',
        regularTankBefore: 0,
        plusTankBefore: 0,
        superTankBefore: 0,
        regularDelivered: 0,
        plusDelivered: 0,
        superDelivered: 0,
        cashAmount: 0,
        creditCardAmount: 0,
        debitCardAmount: 0,
        mobileAmount: 0,
        grocerySales: 0,
        ebtSales: 0,
        lotteryNetSales: 0,
        scratchOffSales: 0,
        regularGallons: 0,
        superGallons: 0,
        dieselGallons: 0,
        cashCollectionOnHand: 0,
        employeeName: '',
        shift: 'DAY',
        expenses: [],
        notes: ''
      });

    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: "Error",
        description: "Failed to save report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  const validateForm = () => {
    if (!formData.reportDate) {
      toast({
        title: "Validation Error",
        description: "Please select a report date.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.employeeName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter employee name.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      saveReport();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4 bg-gray-50 min-h-screen">
      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h1 className="text-2xl font-bold text-gray-900">MOBIL Daily Sales Report</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700">

            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Report'}
          </Button>
          <Button
            onClick={printReport}
            variant="outline">

            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Form Layout - Traditional Paper Style */}
      <div className="bg-white shadow-lg print:shadow-none">
        {/* Header */}
        <FormHeader
          reportDate={formData.reportDate}
          setReportDate={(date) => updateFormData('reportDate', date)} />

        
        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-l border-r border-gray-300">
          {/* Left Column */}
          <div className="border-r border-gray-300 lg:border-r-gray-300">
            <FuelDeliverySection
              formData={formData}
              updateFormData={updateFormData} />

          </div>
          
          {/* Right Column */}
          <div>
            <SalesDataSection
              formData={formData}
              updateFormData={updateFormData} />

          </div>
        </div>
        
        {/* Bottom Section - Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-l border-r border-gray-300">
          {/* Left Column */}
          <div className="border-r border-gray-300 lg:border-r-gray-300">
            <ExpensesSection
              formData={formData}
              updateFormData={updateFormData} />

          </div>
          
          {/* Right Column */}
          <div>
            <CashCollectionSection
              formData={formData}
              updateFormData={updateFormData} />

          </div>
        </div>
        
        {/* Footer */}
        <div className="border border-gray-300 bg-gray-50 p-2 text-center">
          <div className="text-xs text-gray-600">
            Form Generated: {new Date().toLocaleDateString()} | MOBIL Station Operations Report
          </div>
        </div>
      </div>
    </div>);


};

export default TenDaysReportMobil;