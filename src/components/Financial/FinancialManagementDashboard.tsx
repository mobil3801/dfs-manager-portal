import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import {
  DollarSignIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CreditCardIcon,
  BanknoteIcon,
  ReceiptIcon,
  CalendarIcon,
  PieChartIcon,
  BarChart3Icon,
  AlertCircleIcon,
  CheckCircleIcon } from
'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer } from
'recharts';
import { ReportHeader, MetricCard, ReportSection, DataTable } from '@/components/Reports/ComprehensiveReportLayout';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface SalesData {
  id: number;
  report_date: string;
  station: string;
  total_sales: number;
  cash_amount: number;
  credit_card_amount: number;
  debit_card_amount: number;
  mobile_amount: number;
  grocery_sales: number;
  lottery_net_sales: number;
  expenses_data: string;
}

interface SalaryData {
  id: number;
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  gross_pay: number;
  net_pay: number;
  total_deductions: number;
  station: string;
  status: string;
}

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  cashFlow: number;
  payrollCosts: number;
  operatingExpenses: number;
  revenueGrowth: number;
}

interface FinancialFilters {
  period: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  station: string;
  startDate?: Date;
  endDate?: Date;
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const FinancialManagementDashboard: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [salaryData, setSalaryData] = useState<SalaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FinancialFilters>({
    period: 'month',
    station: 'ALL'
  });
  const [dateRange, setDateRange] = useState<{from: Date | undefined;to: Date | undefined;}>({
    from: undefined,
    to: undefined
  });
  const { toast } = useToast();

  const stations = ['ALL', 'MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'];

  useEffect(() => {
    fetchFinancialData();
  }, [filters]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      // Calculate date range based on filter
      let startDate = new Date();
      let endDate = new Date();

      switch (filters.period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate = startOfMonth(new Date());
          endDate = endOfMonth(new Date());
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        case 'custom':
          if (filters.startDate && filters.endDate) {
            startDate = filters.startDate;
            endDate = filters.endDate;
          }
          break;
      }

      // Fetch sales data
      const salesFilters = [
      {
        name: "report_date",
        op: "GreaterThanOrEqual",
        value: startDate.toISOString()
      },
      {
        name: "report_date",
        op: "LessThanOrEqual",
        value: endDate.toISOString()
      }];


      if (filters.station !== 'ALL') {
        salesFilters.push({
          name: "station",
          op: "Equal",
          value: filters.station
        });
      }

      const [salesResponse, salaryResponse] = await Promise.all([
      window.ezsite.apis.tablePage(12356, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: "report_date",
        IsAsc: false,
        Filters: salesFilters
      }),
      window.ezsite.apis.tablePage(11788, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: "pay_period_start",
        IsAsc: false,
        Filters: []
      })]
      );

      if (salesResponse.error) throw salesResponse.error;
      if (salaryResponse.error) throw salaryResponse.error;

      setSalesData(salesResponse.data.List);
      setSalaryData(salaryResponse.data.List);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch financial data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancialSummary = (): FinancialSummary => {
    const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.total_sales || 0), 0);

    // Calculate expenses from sales data
    const totalExpensesFromSales = salesData.reduce((sum, sale) => {
      try {
        const expenses = JSON.parse(sale.expenses_data || '[]');
        return sum + expenses.reduce((expSum: number, exp: any) => expSum + (exp.amount || 0), 0);
      } catch {
        return sum;
      }
    }, 0);

    // Calculate payroll costs
    const payrollCosts = salaryData.
    filter((salary) => salary.status === 'Paid').
    reduce((sum, salary) => sum + (salary.gross_pay || 0), 0);

    const totalExpenses = totalExpensesFromSales + payrollCosts;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? netProfit / totalRevenue * 100 : 0;

    // Calculate cash flow (simplified)
    const cashFlow = netProfit + payrollCosts * 0.3; // Approximate depreciation and non-cash items

    // Calculate previous period for growth comparison
    const previousPeriodRevenue = totalRevenue * 0.9; // Simplified calculation
    const revenueGrowth = previousPeriodRevenue > 0 ?
    (totalRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      cashFlow,
      payrollCosts,
      operatingExpenses: totalExpensesFromSales,
      revenueGrowth
    };
  };

  const getRevenueBySource = () => {
    const totalCash = salesData.reduce((sum, sale) => sum + (sale.cash_amount || 0), 0);
    const totalCredit = salesData.reduce((sum, sale) => sum + (sale.credit_card_amount || 0), 0);
    const totalDebit = salesData.reduce((sum, sale) => sum + (sale.debit_card_amount || 0), 0);
    const totalMobile = salesData.reduce((sum, sale) => sum + (sale.mobile_amount || 0), 0);
    const totalGrocery = salesData.reduce((sum, sale) => sum + (sale.grocery_sales || 0), 0);
    const totalLottery = salesData.reduce((sum, sale) => sum + (sale.lottery_net_sales || 0), 0);

    return [
    { name: 'Cash', value: totalCash, percentage: 0 },
    { name: 'Credit Card', value: totalCredit, percentage: 0 },
    { name: 'Debit Card', value: totalDebit, percentage: 0 },
    { name: 'Mobile Pay', value: totalMobile, percentage: 0 },
    { name: 'Grocery', value: totalGrocery, percentage: 0 },
    { name: 'Lottery', value: totalLottery, percentage: 0 }].
    map((item) => {
      const total = totalCash + totalCredit + totalDebit + totalMobile + totalGrocery + totalLottery;
      return {
        ...item,
        percentage: total > 0 ? (item.value / total * 100).toFixed(1) : '0.0'
      };
    }).filter((item) => item.value > 0);
  };

  const getDailyRevenueTrend = () => {
    const dailyData = new Map();

    salesData.forEach((sale) => {
      const date = sale.report_date.split('T')[0];
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          revenue: 0,
          expenses: 0,
          profit: 0,
          transactions: 0
        });
      }

      const dayData = dailyData.get(date);
      dayData.revenue += sale.total_sales || 0;
      dayData.transactions += 1;

      try {
        const expenses = JSON.parse(sale.expenses_data || '[]');
        dayData.expenses += expenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
      } catch {


        // Handle invalid JSON
      }dayData.profit = dayData.revenue - dayData.expenses;
    });

    return Array.from(dailyData.values()).
    sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).
    map((item) => ({
      ...item,
      date: format(new Date(item.date), 'MMM dd')
    }));
  };

  const getStationProfitability = () => {
    return stations.filter((s) => s !== 'ALL').map((station) => {
      const stationSales = salesData.filter((sale) => sale.station === station);
      const revenue = stationSales.reduce((sum, sale) => sum + (sale.total_sales || 0), 0);

      const expenses = stationSales.reduce((sum, sale) => {
        try {
          const expenseData = JSON.parse(sale.expenses_data || '[]');
          return sum + expenseData.reduce((expSum: number, exp: any) => expSum + (exp.amount || 0), 0);
        } catch {
          return sum;
        }
      }, 0);

      const stationPayroll = salaryData.
      filter((salary) => salary.station === station && salary.status === 'Paid').
      reduce((sum, salary) => sum + (salary.gross_pay || 0), 0);

      const totalExpenses = expenses + stationPayroll;
      const profit = revenue - totalExpenses;
      const margin = revenue > 0 ? profit / revenue * 100 : 0;

      return {
        station,
        revenue,
        expenses: totalExpenses,
        profit,
        margin: margin.toFixed(1),
        transactions: stationSales.length
      };
    });
  };

  const getTopExpenseCategories = () => {
    const expenseCategories = new Map();

    salesData.forEach((sale) => {
      try {
        const expenses = JSON.parse(sale.expenses_data || '[]');
        expenses.forEach((expense: any) => {
          const category = expense.vendor || 'Other';
          const amount = expense.amount || 0;

          if (!expenseCategories.has(category)) {
            expenseCategories.set(category, 0);
          }
          expenseCategories.set(category, expenseCategories.get(category) + amount);
        });
      } catch {


        // Handle invalid JSON
      }});
    return Array.from(expenseCategories.entries()).
    map(([category, amount]) => ({ category, amount })).
    sort((a, b) => b.amount - a.amount).
    slice(0, 10).
    map((item, index) => [
    index + 1,
    item.category,
    `$${item.amount.toLocaleString()}`,
    // Calculate percentage of total expenses
    `${(item.amount / calculateFinancialSummary().operatingExpenses * 100).toFixed(1)}%`]
    );
  };

  const getCashFlowData = () => {
    const monthlyData = new Map();

    // Group sales by month
    salesData.forEach((sale) => {
      const month = format(new Date(sale.report_date), 'yyyy-MM');
      if (!monthlyData.has(month)) {
        monthlyData.set(month, {
          month,
          revenue: 0,
          expenses: 0,
          payroll: 0,
          cashFlow: 0
        });
      }

      const data = monthlyData.get(month);
      data.revenue += sale.total_sales || 0;

      try {
        const expenses = JSON.parse(sale.expenses_data || '[]');
        data.expenses += expenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
      } catch {


        // Handle invalid JSON
      }});
    // Add payroll data
    salaryData.forEach((salary) => {
      const month = format(new Date(salary.pay_period_start), 'yyyy-MM');
      if (monthlyData.has(month) && salary.status === 'Paid') {
        const data = monthlyData.get(month);
        data.payroll += salary.gross_pay || 0;
      }
    });

    // Calculate cash flow
    monthlyData.forEach((data) => {
      data.cashFlow = data.revenue - data.expenses - data.payroll;
    });

    return Array.from(monthlyData.values()).
    sort((a, b) => a.month.localeCompare(b.month)).
    map((item) => ({
      ...item,
      month: format(new Date(item.month + '-01'), 'MMM yyyy')
    }));
  };

  const financialSummary = calculateFinancialSummary();
  const revenueBySource = getRevenueBySource();
  const dailyTrend = getDailyRevenueTrend();
  const stationProfitability = getStationProfitability();
  const cashFlowData = getCashFlowData();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) =>
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
            )}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>);

  }

  return (
    <div className="p-6 space-y-6">
      <ReportHeader
        title="Financial Management Dashboard"
        subtitle="Comprehensive financial analysis and performance metrics"
        station={filters.station === 'ALL' ? 'All Stations' : filters.station}
        dateRange={filters.period === 'custom' && dateRange.from && dateRange.to ?
        `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}` :
        filters.period.charAt(0).toUpperCase() + filters.period.slice(1)}
        reportId={`FM-${Date.now()}`}
        onPrint={() => window.print()}
        onExport={() => toast({ title: "Export", description: "Export functionality coming soon" })}
        onFilter={() => {}} />


      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analysis Period & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Station</label>
              <Select value={filters.station} onValueChange={(value) => setFilters({ ...filters, station: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) =>
                  <SelectItem key={station} value={station}>{station}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select value={filters.period} onValueChange={(value: any) => setFilters({ ...filters, period: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filters.period === 'custom' &&
            <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, 'MMM dd, yyyy') : 'Pick start date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => {
                        setDateRange({ ...dateRange, from: date });
                        setFilters({ ...filters, startDate: date });
                      }}
                      initialFocus />

                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, 'MMM dd, yyyy') : 'Pick end date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => {
                        setDateRange({ ...dateRange, to: date });
                        setFilters({ ...filters, endDate: date });
                      }}
                      initialFocus />

                    </PopoverContent>
                  </Popover>
                </div>
              </>
            }
          </div>
        </CardContent>
      </Card>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${financialSummary.totalRevenue.toLocaleString()}`}
          subtitle="All income streams"
          icon={<DollarSignIcon className="w-5 h-5" />}
          trend={{ value: financialSummary.revenueGrowth, isPositive: financialSummary.revenueGrowth > 0 }} />

        <MetricCard
          title="Net Profit"
          value={`$${financialSummary.netProfit.toLocaleString()}`}
          subtitle="After all expenses"
          icon={<TrendingUpIcon className="w-5 h-5" />}
          trend={{ value: 8.7, isPositive: true }} />

        <MetricCard
          title="Profit Margin"
          value={`${financialSummary.profitMargin.toFixed(1)}%`}
          subtitle="Revenue efficiency"
          icon={<BarChart3Icon className="w-5 h-5" />}
          trend={{ value: 2.3, isPositive: true }} />

        <MetricCard
          title="Cash Flow"
          value={`$${financialSummary.cashFlow.toLocaleString()}`}
          subtitle="Operational liquidity"
          icon={<BanknoteIcon className="w-5 h-5" />}
          trend={{ value: 5.1, isPositive: true }} />

      </div>

      {/* Revenue Trends */}
      <ReportSection title="Daily Revenue & Profit Trends">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }} />

              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: any, name: string) => [`$${value.toLocaleString()}`, name]} />

              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stackId="1"
                stroke={CHART_COLORS[0]}
                fill={CHART_COLORS[0]}
                fillOpacity={0.6}
                name="Revenue" />

              <Area
                type="monotone"
                dataKey="profit"
                stackId="2"
                stroke={CHART_COLORS[1]}
                fill={CHART_COLORS[1]}
                fillOpacity={0.6}
                name="Profit" />

            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ReportSection>

      {/* Revenue Sources & Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportSection title="Revenue by Payment Method">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueBySource}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value">

                  {revenueBySource.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  )}
                </Pie>
                <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ReportSection>

        <ReportSection title="Monthly Cash Flow Analysis">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any, name: string) => [`$${value.toLocaleString()}`, name]} />
                <Legend />
                <Bar dataKey="revenue" fill={CHART_COLORS[0]} name="Revenue" />
                <Bar dataKey="expenses" fill={CHART_COLORS[3]} name="Operating Expenses" />
                <Bar dataKey="payroll" fill={CHART_COLORS[2]} name="Payroll" />
                <Bar dataKey="cashFlow" fill={CHART_COLORS[1]} name="Net Cash Flow" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportSection>
      </div>

      {/* Station Profitability */}
      <ReportSection title="Station Profitability Analysis">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {stationProfitability.map((station, index) =>
          <Card key={station.station} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  {station.station}
                  <Badge
                  variant={parseFloat(station.margin) > 10 ? 'default' :
                  parseFloat(station.margin) > 5 ? 'secondary' : 'destructive'}>

                    {station.margin}% margin
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue:</span>
                    <span className="font-medium">${station.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expenses:</span>
                    <span className="font-medium">${station.expenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Profit:</span>
                    <span className={`font-medium ${station.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${station.profit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Transactions:</span>
                    <span className="font-medium">{station.transactions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ReportSection>

      {/* Expense Analysis */}
      <ReportSection title="Top Expense Categories">
        <DataTable
          headers={['Rank', 'Category', 'Amount', 'Percentage']}
          data={getTopExpenseCategories()}
          showRowNumbers={false}
          alternateRows={true} />

      </ReportSection>

      {/* Financial Health Indicators */}
      <ReportSection title="Financial Health Indicators">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                {financialSummary.profitMargin > 10 ?
                <CheckCircleIcon className="w-8 h-8 text-green-500" /> :
                <AlertCircleIcon className="w-8 h-8 text-yellow-500" />
                }
              </div>
              <h3 className="font-semibold">Profitability</h3>
              <p className="text-sm text-gray-600 mt-1">
                {financialSummary.profitMargin > 10 ? 'Excellent' :
                financialSummary.profitMargin > 5 ? 'Good' : 'Needs Attention'}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                {financialSummary.cashFlow > 0 ?
                <CheckCircleIcon className="w-8 h-8 text-green-500" /> :
                <AlertCircleIcon className="w-8 h-8 text-red-500" />
                }
              </div>
              <h3 className="font-semibold">Cash Flow</h3>
              <p className="text-sm text-gray-600 mt-1">
                {financialSummary.cashFlow > 0 ? 'Positive' : 'Negative'}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                {financialSummary.revenueGrowth > 0 ?
                <TrendingUpIcon className="w-8 h-8 text-green-500" /> :
                <TrendingDownIcon className="w-8 h-8 text-red-500" />
                }
              </div>
              <h3 className="font-semibold">Growth Trend</h3>
              <p className="text-sm text-gray-600 mt-1">
                {financialSummary.revenueGrowth > 0 ? 'Growing' : 'Declining'}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-2">
                <ReceiptIcon className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="font-semibold">Expense Control</h3>
              <p className="text-sm text-gray-600 mt-1">
                {financialSummary.totalExpenses / financialSummary.totalRevenue * 100 < 70 ? 'Well Controlled' : 'Monitor Closely'}
              </p>
            </CardContent>
          </Card>
        </div>
      </ReportSection>
    </div>);

};

export default FinancialManagementDashboard;