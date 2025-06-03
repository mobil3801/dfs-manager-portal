import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  FuelIcon,
  ShoppingCartIcon,
  CalendarIcon,
  BarChart3Icon,
  LineChartIcon,
  PieChartIcon } from
'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer } from
'recharts';
import { ReportHeader, MetricCard, ReportSection, DataTable } from '@/components/Reports/ComprehensiveReportLayout';
import { format } from 'date-fns';

interface SalesData {
  date: string;
  station: string;
  totalSales: number;
  fuelSales: number;
  grocerySales: number;
  lotteryPlayout: number;
  transactions: number;
}

interface AnalyticsFilters {
  station: string;
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const SalesAnalyticsDashboard: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    station: 'ALL',
    dateRange: 'month'
  });
  const [dateRange, setDateRange] = useState<{from: Date | undefined;to: Date | undefined;}>({
    from: undefined,
    to: undefined
  });
  const { toast } = useToast();

  const stations = ['ALL', 'MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'];

  useEffect(() => {
    fetchSalesData();
  }, [filters]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);

      // Calculate date range based on filter
      const today = new Date();
      let startDate = new Date();
      let endDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(today);
          break;
        case 'week':
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(today.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(today.getFullYear() - 1);
          break;
        case 'custom':
          if (filters.startDate && filters.endDate) {
            startDate = filters.startDate;
            endDate = filters.endDate;
          }
          break;
      }

      const queryFilters = [
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
        queryFilters.push({
          name: "station",
          op: "Equal",
          value: filters.station
        });
      }

      const { data, error } = await window.ezsite.apis.tablePage(12356, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: "report_date",
        IsAsc: false,
        Filters: queryFilters
      });

      if (error) throw error;

      const processedData: SalesData[] = data.List.map((item: any) => ({
        date: format(new Date(item.report_date), 'yyyy-MM-dd'),
        station: item.station,
        totalSales: item.total_sales || 0,
        fuelSales: (item.regular_gallons || 0) * 3.5 + (item.super_gallons || 0) * 3.8 + (item.diesel_gallons || 0) * 4.0,
        grocerySales: item.grocery_sales || 0,
        lotteryPlayout: item.lottery_net_sales || 0,
        transactions: 1
      }));

      setSalesData(processedData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sales analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const totalSales = salesData.reduce((sum, item) => sum + item.totalSales, 0);
    const totalFuelSales = salesData.reduce((sum, item) => sum + item.fuelSales, 0);
    const totalGrocerySales = salesData.reduce((sum, item) => sum + item.grocerySales, 0);
    const totalLotteryPayout = salesData.reduce((sum, item) => sum + item.lotteryPlayout, 0);
    const averageDailySales = salesData.length > 0 ? totalSales / salesData.length : 0;

    return {
      totalSales,
      totalFuelSales,
      totalGrocerySales,
      totalLotteryPayout,
      averageDailySales,
      totalTransactions: salesData.length
    };
  };

  const getChartData = () => {
    const dailyData = salesData.reduce((acc: any[], item) => {
      const existingDate = acc.find((d) => d.date === item.date);
      if (existingDate) {
        existingDate.totalSales += item.totalSales;
        existingDate.fuelSales += item.fuelSales;
        existingDate.grocerySales += item.grocerySales;
        existingDate.lotteryPlayout += item.lotteryPlayout;
      } else {
        acc.push({
          date: item.date,
          totalSales: item.totalSales,
          fuelSales: item.fuelSales,
          grocerySales: item.grocerySales,
          lotteryPlayout: item.lotteryPlayout
        });
      }
      return acc;
    }, []);

    return dailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getStationComparison = () => {
    return stations.filter((s) => s !== 'ALL').map((station) => {
      const stationData = salesData.filter((item) => item.station === station);
      const totalSales = stationData.reduce((sum, item) => sum + item.totalSales, 0);
      return {
        name: station,
        value: totalSales,
        percentage: totalSales > 0 ? (totalSales / calculateMetrics().totalSales * 100).toFixed(1) : '0.0'
      };
    });
  };

  const getTopPerformingDays = () => {
    const dailyTotals = getChartData();
    return dailyTotals.
    sort((a, b) => b.totalSales - a.totalSales).
    slice(0, 5).
    map((day, index) => [
    index + 1,
    format(new Date(day.date), 'MMM dd, yyyy'),
    `$${day.totalSales.toLocaleString()}`,
    `$${day.fuelSales.toLocaleString()}`,
    `$${day.grocerySales.toLocaleString()}`]
    );
  };

  const metrics = calculateMetrics();
  const chartData = getChartData();
  const stationComparison = getStationComparison();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
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
        title="Sales Analytics Dashboard"
        subtitle="Comprehensive sales performance analysis and insights"
        station={filters.station === 'ALL' ? 'All Stations' : filters.station}
        dateRange={filters.dateRange === 'custom' && dateRange.from && dateRange.to ?
        `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}` :
        filters.dateRange.charAt(0).toUpperCase() + filters.dateRange.slice(1)}
        reportId={`SA-${Date.now()}`}
        onPrint={() => window.print()}
        onExport={() => toast({ title: "Export", description: "Export functionality coming soon" })}
        onFilter={() => {}} />


      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Settings</CardTitle>
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
              <Select value={filters.dateRange} onValueChange={(value: any) => setFilters({ ...filters, dateRange: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filters.dateRange === 'custom' &&
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sales"
          value={`$${metrics.totalSales.toLocaleString()}`}
          subtitle="All revenue streams"
          icon={<DollarSignIcon className="w-5 h-5" />}
          trend={{ value: 12.5, isPositive: true }} />

        <MetricCard
          title="Fuel Sales"
          value={`$${metrics.totalFuelSales.toLocaleString()}`}
          subtitle="Gasoline & diesel revenue"
          icon={<FuelIcon className="w-5 h-5" />}
          trend={{ value: 8.3, isPositive: true }} />

        <MetricCard
          title="Grocery Sales"
          value={`$${metrics.totalGrocerySales.toLocaleString()}`}
          subtitle="Convenience store items"
          icon={<ShoppingCartIcon className="w-5 h-5" />}
          trend={{ value: -2.1, isPositive: false }} />

        <MetricCard
          title="Average Daily Sales"
          value={`$${metrics.averageDailySales.toLocaleString()}`}
          subtitle="Per day average"
          icon={<BarChart3Icon className="w-5 h-5" />}
          trend={{ value: 5.7, isPositive: true }} />

      </div>

      {/* Sales Trend Chart */}
      <ReportSection title="Sales Trends Over Time">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => format(new Date(value), 'MMM dd')} />

              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: any, name: string) => [`$${value.toLocaleString()}`, name]}
                labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')} />

              <Legend />
              <Line
                type="monotone"
                dataKey="totalSales"
                stroke={CHART_COLORS[0]}
                strokeWidth={2}
                name="Total Sales" />

              <Line
                type="monotone"
                dataKey="fuelSales"
                stroke={CHART_COLORS[1]}
                strokeWidth={2}
                name="Fuel Sales" />

              <Line
                type="monotone"
                dataKey="grocerySales"
                stroke={CHART_COLORS[2]}
                strokeWidth={2}
                name="Grocery Sales" />

            </LineChart>
          </ResponsiveContainer>
        </div>
      </ReportSection>

      {/* Station Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportSection title="Sales by Category">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')} />

                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any, name: string) => [`$${value.toLocaleString()}`, name]}
                  labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')} />

                <Legend />
                <Bar dataKey="fuelSales" fill={CHART_COLORS[0]} name="Fuel Sales" />
                <Bar dataKey="grocerySales" fill={CHART_COLORS[1]} name="Grocery Sales" />
                <Bar dataKey="lotteryPlayout" fill={CHART_COLORS[2]} name="Lottery Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportSection>

        <ReportSection title="Station Performance Distribution">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stationComparison}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value">

                  {stationComparison.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  )}
                </Pie>
                <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Sales']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ReportSection>
      </div>

      {/* Top Performing Days */}
      <ReportSection title="Top Performing Days">
        <DataTable
          headers={['Rank', 'Date', 'Total Sales', 'Fuel Sales', 'Grocery Sales']}
          data={getTopPerformingDays()}
          showRowNumbers={false}
          alternateRows={true} />

      </ReportSection>

      {/* Station Performance Summary */}
      <ReportSection title="Station Performance Summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stationComparison.map((station, index) =>
          <Card key={station.name} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  {station.name}
                  <Badge variant="outline">{station.percentage}%</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  ${station.value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Total Sales Revenue
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ReportSection>
    </div>);

};

export default SalesAnalyticsDashboard;