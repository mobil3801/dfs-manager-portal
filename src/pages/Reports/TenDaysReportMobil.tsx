import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table } from '@/components/ui/table';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  CalendarDays,
  TrendingUp,
  DollarSign,
  Fuel,
  FileText,
  Download,
  Filter,
  RefreshCw } from
'lucide-react';

interface SalesData {
  id: number;
  report_date: string;
  station: string;
  total_sales: number;
  cash_sales: number;
  credit_card_sales: number;
  fuel_sales: number;
  convenience_sales: number;
  employee_name: string;
  shift: string;
}

const TenDaysReportMobil: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedShift, setSelectedShift] = useState('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState('ALL');
  const { toast } = useToast();

  // Set default date range (last 10 days)
  useEffect(() => {
    const today = new Date();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(today.getDate() - 10);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(tenDaysAgo.toISOString().split('T')[0]);
  }, []);

  // Fetch sales data
  const fetchSalesData = async () => {
    try {
      setLoading(true);

      const filters = [
      {
        name: "station",
        op: "Equal",
        value: "MOBIL"
      }];


      if (startDate && endDate) {
        filters.push(
          {
            name: "report_date",
            op: "GreaterThanOrEqual",
            value: startDate
          },
          {
            name: "report_date",
            op: "LessThanOrEqual",
            value: endDate
          }
        );
      }

      if (selectedShift !== 'ALL') {
        filters.push({
          name: "shift",
          op: "Equal",
          value: selectedShift
        });
      }

      if (selectedEmployee !== 'ALL') {
        filters.push({
          name: "employee_name",
          op: "StringContains",
          value: selectedEmployee
        });
      }

      const { data, error } = await window.ezsite.apis.tablePage(12356, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "report_date",
        IsAsc: false,
        Filters: filters
      });

      if (error) throw error;

      setSalesData(data?.List || []);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sales data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchSalesData();
    }
  }, [startDate, endDate, selectedShift, selectedEmployee]);

  // Calculate totals
  const totals = salesData.reduce((acc, record) => ({
    totalSales: acc.totalSales + (record.total_sales || 0),
    cashSales: acc.cashSales + (record.cash_sales || 0),
    creditCardSales: acc.creditCardSales + (record.credit_card_sales || 0),
    fuelSales: acc.fuelSales + (record.fuel_sales || 0),
    convenienceSales: acc.convenienceSales + (record.convenience_sales || 0)
  }), {
    totalSales: 0,
    cashSales: 0,
    creditCardSales: 0,
    fuelSales: 0,
    convenienceSales: 0
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Employee', 'Shift', 'Total Sales', 'Cash Sales', 'Credit Card Sales', 'Fuel Sales', 'Convenience Sales'];
    const csvContent = [
    headers.join(','),
    ...salesData.map((record) => [
    formatDate(record.report_date),
    record.employee_name,
    record.shift,
    record.total_sales || 0,
    record.cash_sales || 0,
    record.credit_card_sales || 0,
    record.fuel_sales || 0,
    record.convenience_sales || 0].
    join(','))].
    join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MOBIL_10_Days_Report_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Report has been exported to CSV file."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600" />
            10 Days Report - MOBIL Station
          </h1>
          <p className="text-gray-600">Comprehensive sales analysis for the last 10 days</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={fetchSalesData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)} />

          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)} />

          </div>
          <div>
            <Label htmlFor="shift">Shift</Label>
            <Select value={selectedShift} onValueChange={setSelectedShift}>
              <option value="ALL">All Shifts</option>
              <option value="DAY">Day Shift</option>
              <option value="NIGHT">Night Shift</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="employee">Employee</Label>
            <Input
              id="employee"
              placeholder="Search employee..."
              value={selectedEmployee === 'ALL' ? '' : selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value || 'ALL')} />

          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalSales)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cash Sales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.cashSales)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Credit Card</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.creditCardSales)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fuel Sales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.fuelSales)}</p>
            </div>
            <Fuel className="w-8 h-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Convenience</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.convenienceSales)}</p>
            </div>
            <FileText className="w-8 h-8 text-indigo-600" />
          </div>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Daily Sales Records</h2>
          <Badge variant="outline">{salesData.length} records</Badge>
        </div>

        {loading ?
        <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading...</span>
          </div> :

        <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Employee</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Shift</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Total Sales</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Cash</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Credit Card</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Fuel</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Convenience</th>
                </tr>
              </thead>
              <tbody>
                {salesData.length === 0 ?
              <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-500">
                      No sales data found for the selected criteria
                    </td>
                  </tr> :

              salesData.map((record) =>
              <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{formatDate(record.report_date)}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{record.employee_name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={record.shift === 'DAY' ? 'default' : 'secondary'}>
                          {record.shift}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {formatCurrency(record.total_sales || 0)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(record.cash_sales || 0)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(record.credit_card_sales || 0)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(record.fuel_sales || 0)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(record.convenience_sales || 0)}
                      </td>
                    </tr>
              )
              }
              </tbody>
              {salesData.length > 0 &&
            <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 font-semibold text-gray-900">
                      TOTALS
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-green-700">
                      {formatCurrency(totals.totalSales)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {formatCurrency(totals.cashSales)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {formatCurrency(totals.creditCardSales)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {formatCurrency(totals.fuelSales)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {formatCurrency(totals.convenienceSales)}
                    </td>
                  </tr>
                </tfoot>
            }
            </table>
          </div>
        }
      </Card>
    </div>);

};

export default TenDaysReportMobil;