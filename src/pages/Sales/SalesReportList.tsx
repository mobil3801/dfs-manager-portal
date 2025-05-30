import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, TrendingUp, DollarSign, Calendar, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SalesReportPrintDialog from '@/components/SalesReportPrintDialog';
import BrandLogo from '@/components/BrandLogo';

interface SalesReport {
  ID: number;
  report_date: string;
  station: string;
  total_sales: number;
  cash_sales: number;
  credit_card_sales: number;
  fuel_sales: number;
  convenience_sales: number;
  employee_id: string;
  notes: string;
  created_by: number;
}

const SalesReportList: React.FC = () => {
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SalesReport | null>(null);
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const pageSize = 10;

  useEffect(() => {
    loadReports();
  }, [currentPage, searchTerm]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const filters = [];

      if (searchTerm) {
        filters.push({ name: 'station', op: 'StringContains', value: searchTerm });
      }

      const { data, error } = await window.ezsite.apis.tablePage('11728', {
        PageNo: currentPage,
        PageSize: pageSize,
        OrderByField: 'report_date',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw error;

      setReports(data?.List || []);
      setTotalCount(data?.VirtualCount || 0);
    } catch (error) {
      console.error('Error loading sales reports:', error);
      toast({
        title: "Error",
        description: "Failed to load sales reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId: number) => {
    if (!confirm('Are you sure you want to delete this sales report?')) {
      return;
    }

    try {
      const { error } = await window.ezsite.apis.tableDelete('11728', { ID: reportId });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Sales report deleted successfully"
      });
      loadReports();
    } catch (error) {
      console.error('Error deleting sales report:', error);
      toast({
        title: "Error",
        description: "Failed to delete sales report",
        variant: "destructive"
      });
    }
  };

  const handlePrint = (report: SalesReport) => {
    setSelectedReport(report);
    setPrintDialogOpen(true);
  };

  const isAdmin = userProfile?.role === 'Administrator';

  const getStationBadgeColor = (station: string) => {
    switch (station.toUpperCase()) {
      case 'MOBIL':
        return 'bg-blue-500';
      case 'AMOCO ROSEDALE':
        return 'bg-green-500';
      case 'AMOCO BROOKLYN':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // Calculate totals for all visible reports with proper validation
  const totals = reports.reduce((acc, report) => {
    // Ensure all values are properly parsed as numbers
    const totalSales = parseFloat(report.total_sales) || 0;
    const cashSales = parseFloat(report.cash_sales) || 0;
    const creditSales = parseFloat(report.credit_card_sales) || 0;
    const fuelSales = parseFloat(report.fuel_sales) || 0;
    const convenienceSales = parseFloat(report.convenience_sales) || 0;

    // Validate calculations for each report
    const paymentTotal = cashSales + creditSales;
    const categoryTotal = fuelSales + convenienceSales;

    // Log any discrepancies for debugging
    if (Math.abs(paymentTotal - totalSales) > 0.01) {
      console.warn(`Report ID ${report.ID}: Payment methods (${paymentTotal}) don't match total (${totalSales})`);
    }

    if (categoryTotal > totalSales + 0.01) {
      console.warn(`Report ID ${report.ID}: Categories (${categoryTotal}) exceed total (${totalSales})`);
    }

    return {
      total_sales: acc.total_sales + totalSales,
      cash_sales: acc.cash_sales + cashSales,
      credit_card_sales: acc.credit_card_sales + creditSales,
      fuel_sales: acc.fuel_sales + fuelSales,
      convenience_sales: acc.convenience_sales + convenienceSales
    };
  }, {
    total_sales: 0,
    cash_sales: 0,
    credit_card_sales: 0,
    fuel_sales: 0,
    convenience_sales: 0
  });

  // Validate the summary totals
  const summaryPaymentTotal = totals.cash_sales + totals.credit_card_sales;
  const summaryCategoryTotal = totals.fuel_sales + totals.convenience_sales;

  console.log('Summary calculations:', {
    total_sales: totals.total_sales,
    payment_total: summaryPaymentTotal,
    category_total: summaryCategoryTotal,
    payment_matches: Math.abs(summaryPaymentTotal - totals.total_sales) <= 0.01,
    category_valid: summaryCategoryTotal <= totals.total_sales + 0.01
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">{formatCurrency(totals.total_sales)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Fuel Sales</p>
                <p className="text-2xl font-bold">{formatCurrency(totals.fuel_sales)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Convenience Sales</p>
                <p className="text-2xl font-bold">{formatCurrency(totals.convenience_sales)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Reports</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6" />
                <span>Daily Sales Reports</span>
              </CardTitle>
              <CardDescription>
                Track daily sales performance across all stations
              </CardDescription>
            </div>
            <Button onClick={() => navigate('/sales/new')} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Report</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by station..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10" />

            </div>
          </div>

          {/* Reports Table */}
          {loading ?
          <div className="space-y-4">
              {[...Array(5)].map((_, i) =>
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            )}
            </div> :
          reports.length === 0 ?
          <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No sales reports found</p>
              <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/sales/new')}>

                Add Your First Sales Report
              </Button>
            </div> :

          <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>
                      <div className="flex items-center space-x-2">
                        <BrandLogo station="MOBIL" size="sm" showText={false} />
                        <BrandLogo station="AMOCO" size="sm" showText={false} />
                        <span>Station</span>
                      </div>
                    </TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Fuel Sales</TableHead>
                    <TableHead>Convenience</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) =>
                <TableRow key={report.ID}>
                      <TableCell className="font-medium">
                        {formatDate(report.report_date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <BrandLogo station={report.station} size="sm" showText={false} />
                          <Badge className={`text-white ${getStationBadgeColor(report.station)}`}>
                            {report.station}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{formatCurrency(report.total_sales)}</span>
                          {(() => {
                        const total = parseFloat(report.total_sales) || 0;
                        const cash = parseFloat(report.cash_sales) || 0;
                        const credit = parseFloat(report.credit_card_sales) || 0;
                        const paymentTotal = cash + credit;
                        const isPaymentCorrect = Math.abs(paymentTotal - total) <= 0.01;

                        return isPaymentCorrect ?
                        <span className="text-green-600 text-xs">✓</span> :
                        <span className="text-red-600 text-xs" title={`Payment total: ${formatCurrency(paymentTotal)}`}>⚠️</span>;
                      })()} 
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{formatCurrency(report.fuel_sales)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{formatCurrency(report.convenience_sales)}</span>
                          {(() => {
                        const total = parseFloat(report.total_sales) || 0;
                        const fuel = parseFloat(report.fuel_sales) || 0;
                        const convenience = parseFloat(report.convenience_sales) || 0;
                        const categoryTotal = fuel + convenience;
                        const isCategoryValid = categoryTotal <= total + 0.01;

                        return isCategoryValid ?
                        <span className="text-green-600 text-xs">✓</span> :
                        <span className="text-red-600 text-xs" title={`Categories total: ${formatCurrency(categoryTotal)} > Total: ${formatCurrency(total)}`}>⚠️</span>;
                      })()} 
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div>Cash: {formatCurrency(report.cash_sales)}</div>
                          <div>Card: {formatCurrency(report.credit_card_sales)}</div>
                          <div className="text-xs text-gray-500">
                            Total: {formatCurrency((parseFloat(report.cash_sales) || 0) + (parseFloat(report.credit_card_sales) || 0))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{report.employee_id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(report)}
                        title="Document Print">
                            <Printer className="w-4 h-4" />
                          </Button>
                          {isAdmin &&
                      <>
                              <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/sales/edit/${report.ID}`)}
                          title="Edit Report">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(report.ID)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete Report">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                      }
                        </div>
                      </TableCell>
                    </TableRow>
                )}
                
                {/* Summary Row */}
                {reports.length > 0 &&
                <TableRow className="bg-gray-50 font-semibold border-t-2">
                    <TableCell className="font-bold">TOTALS</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {reports.length} reports
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      <div className="flex items-center space-x-2">
                        <span>{formatCurrency(totals.total_sales)}</span>
                        {Math.abs(summaryPaymentTotal - totals.total_sales) <= 0.01 ?
                      <span className="text-green-600 text-xs">✓</span> :
                      <span className="text-red-600 text-xs">⚠️</span>
                      }
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-blue-600">
                      {formatCurrency(totals.fuel_sales)}
                    </TableCell>
                    <TableCell className="font-bold text-purple-600">
                      <div className="flex items-center space-x-2">
                        <span>{formatCurrency(totals.convenience_sales)}</span>
                        {summaryCategoryTotal <= totals.total_sales + 0.01 ?
                      <span className="text-green-600 text-xs">✓</span> :
                      <span className="text-red-600 text-xs">⚠️</span>
                      }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="font-medium">Cash: {formatCurrency(totals.cash_sales)}</div>
                        <div className="font-medium">Card: {formatCurrency(totals.credit_card_sales)}</div>
                        <div className="text-xs text-gray-600">
                          Total: {formatCurrency(summaryPaymentTotal)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">-</TableCell>
                    <TableCell className="text-gray-500">-</TableCell>
                  </TableRow>
                }
                </TableBody>
              </Table>
            </div>
          }

          {/* Pagination */}
          {totalPages > 1 &&
          <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} reports
              </p>
              <div className="flex items-center space-x-2">
                <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}>

                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}>

                  Next
                </Button>
              </div>
            </div>
          }
        </CardContent>
      </Card>

      {/* Print Dialog */}
      <SalesReportPrintDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        report={selectedReport} />

    </div>);

};

export default SalesReportList;