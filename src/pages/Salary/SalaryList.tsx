import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Eye, Edit, Trash2, Download, DollarSign, Calendar, Users, RefreshCw, FileText, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface SalaryRecord {
  id: number;
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  pay_frequency: string;
  base_salary: number;
  hourly_rate: number;
  regular_hours: number;
  overtime_hours: number;
  overtime_rate: number;
  overtime_pay: number;
  bonus_amount: number;
  commission: number;
  gross_pay: number;
  federal_tax: number;
  state_tax: number;
  social_security: number;
  medicare: number;
  health_insurance: number;
  retirement_401k: number;
  other_deductions: number;
  total_deductions: number;
  net_pay: number;
  station: string;
  status: string;
  notes: string;
  created_by: number;
}

interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  position: string;
  station: string;
}

const SalaryList: React.FC = () => {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stationFilter, setStationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<SalaryRecord | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const { toast } = useToast();

  const pageSize = 10;
  const SALARY_TABLE_ID = '11788';
  const EMPLOYEES_TABLE_ID = '11727';

  useEffect(() => {
    fetchEmployees();
    fetchSalaryRecords();
  }, [currentPage, statusFilter, stationFilter, searchTerm]);

  // Set up real-time refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh(true); // Silent refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [currentPage, statusFilter, stationFilter, searchTerm]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(EMPLOYEES_TABLE_ID, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'first_name',
        IsAsc: true
      });

      if (error) throw error;
      setEmployees(data?.List || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employee data',
        variant: 'destructive'
      });
    }
  };

  const fetchSalaryRecords = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const filters = [];

      if (statusFilter !== 'all') {
        filters.push({ name: 'status', op: 'Equal', value: statusFilter });
      }

      if (stationFilter !== 'all') {
        filters.push({ name: 'station', op: 'Equal', value: stationFilter });
      }

      if (searchTerm) {
        filters.push({ name: 'employee_id', op: 'StringContains', value: searchTerm });
      }

      const { data, error } = await window.ezsite.apis.tablePage(SALARY_TABLE_ID, {
        PageNo: currentPage,
        PageSize: pageSize,
        OrderByField: 'pay_date',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw error;

      setSalaryRecords(data?.List || []);
      setTotalRecords(data?.VirtualCount || 0);
    } catch (error) {
      console.error('Error fetching salary records:', error);
      if (!silent) {
        toast({
          title: 'Error',
          description: 'Failed to fetch salary records',
          variant: 'destructive'
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleRefresh = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      await Promise.all([
        fetchEmployees(),
        fetchSalaryRecords(silent)
      ]);
      if (!silent) {
        toast({
          title: 'Success',
          description: 'Data refreshed successfully'
        });
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      if (!silent) {
        toast({
          title: 'Error',
          description: 'Failed to refresh data',
          variant: 'destructive'
        });
      }
    } finally {
      if (!silent) setRefreshing(false);
    }
  };

  const handleViewRecord = (record: SalaryRecord) => {
    setSelectedRecord(record);
    setShowViewDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this salary record?')) return;

    try {
      const { error } = await window.ezsite.apis.tableDelete(SALARY_TABLE_ID, { ID: id });
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Salary record deleted successfully'
      });

      // Refresh the data to show real-time updates
      await fetchSalaryRecords();
    } catch (error) {
      console.error('Error deleting salary record:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete salary record',
        variant: 'destructive'
      });
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      const record = salaryRecords.find(r => r.id === id);
      if (!record) return;

      const { error } = await window.ezsite.apis.tableUpdate(SALARY_TABLE_ID, {
        ID: id,
        ...record,
        status: newStatus,
        pay_period_start: new Date(record.pay_period_start).toISOString(),
        pay_period_end: new Date(record.pay_period_end).toISOString(),
        pay_date: new Date(record.pay_date).toISOString()
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Salary record status updated to ${newStatus}`
      });

      // Refresh the data to show real-time updates
      await fetchSalaryRecords();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((emp) => emp.employee_id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : employeeId;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'default';
      case 'processed': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const calculateSummaryStats = () => {
    const totalGrossPay = salaryRecords.reduce((sum, record) => sum + (record.gross_pay || 0), 0);
    const totalNetPay = salaryRecords.reduce((sum, record) => sum + (record.net_pay || 0), 0);
    const uniqueEmployees = new Set(salaryRecords.map((record) => record.employee_id)).size;

    return {
      totalGrossPay,
      totalNetPay,
      uniqueEmployees,
      totalRecords: salaryRecords.length
    };
  };

  const exportToPDF = (record: SalaryRecord) => {
    // Create a printable salary slip
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const employeeName = getEmployeeName(record.employee_id);
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Salary Slip - ${employeeName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .details { margin: 20px 0; }
          .row { display: flex; justify-content: space-between; margin: 10px 0; }
          .section { margin: 20px 0; border-top: 1px solid #ccc; padding-top: 15px; }
          .total { font-weight: bold; font-size: 1.2em; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DFS Manager Portal</h1>
          <h2>Salary Slip</h2>
        </div>
        
        <div class="details">
          <div class="row"><span>Employee:</span><span>${employeeName} (${record.employee_id})</span></div>
          <div class="row"><span>Station:</span><span>${record.station}</span></div>
          <div class="row"><span>Pay Period:</span><span>${format(new Date(record.pay_period_start), 'MMM dd')} - ${format(new Date(record.pay_period_end), 'MMM dd, yyyy')}</span></div>
          <div class="row"><span>Pay Date:</span><span>${format(new Date(record.pay_date), 'MMM dd, yyyy')}</span></div>
          <div class="row"><span>Pay Frequency:</span><span>${record.pay_frequency}</span></div>
        </div>

        <div class="section">
          <h3>Earnings</h3>
          <div class="row"><span>Base Salary:</span><span>$${record.base_salary?.toLocaleString() || '0.00'}</span></div>
          <div class="row"><span>Regular Hours (${record.regular_hours}):</span><span>$${(record.hourly_rate * record.regular_hours)?.toLocaleString() || '0.00'}</span></div>
          <div class="row"><span>Overtime Hours (${record.overtime_hours}):</span><span>$${record.overtime_pay?.toLocaleString() || '0.00'}</span></div>
          <div class="row"><span>Bonus:</span><span>$${record.bonus_amount?.toLocaleString() || '0.00'}</span></div>
          <div class="row"><span>Commission:</span><span>$${record.commission?.toLocaleString() || '0.00'}</span></div>
          <div class="row total"><span>Gross Pay:</span><span>$${record.gross_pay?.toLocaleString() || '0.00'}</span></div>
        </div>

        <div class="section">
          <h3>Deductions</h3>
          <div class="row"><span>Federal Tax:</span><span>$${record.federal_tax?.toLocaleString() || '0.00'}</span></div>
          <div class="row"><span>State Tax:</span><span>$${record.state_tax?.toLocaleString() || '0.00'}</span></div>
          <div class="row"><span>Social Security:</span><span>$${record.social_security?.toLocaleString() || '0.00'}</span></div>
          <div class="row"><span>Medicare:</span><span>$${record.medicare?.toLocaleString() || '0.00'}</span></div>
          <div class="row"><span>Health Insurance:</span><span>$${record.health_insurance?.toLocaleString() || '0.00'}</span></div>
          <div class="row"><span>401(k):</span><span>$${record.retirement_401k?.toLocaleString() || '0.00'}</span></div>
          <div class="row"><span>Other Deductions:</span><span>$${record.other_deductions?.toLocaleString() || '0.00'}</span></div>
          <div class="row total"><span>Total Deductions:</span><span>$${record.total_deductions?.toLocaleString() || '0.00'}</span></div>
        </div>

        <div class="section">
          <div class="row total" style="font-size: 1.5em; color: green;"><span>Net Pay:</span><span>$${record.net_pay?.toLocaleString() || '0.00'}</span></div>
        </div>

        ${record.notes ? `<div class="section"><h3>Notes</h3><p>${record.notes}</p></div>` : ''}
        
        <div style="margin-top: 50px; text-align: center; font-size: 0.9em; color: #666;">
          Generated on ${format(new Date(), 'PPpp')}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const stats = calculateSummaryStats();
  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Salary Management</h1>
          <p className="text-muted-foreground">Manage employee salary records and payroll</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleRefresh(false)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to="/salary/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Salary Record
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Gross Pay</p>
              <p className="text-2xl font-bold">${stats.totalGrossPay.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Net Pay</p>
              <p className="text-2xl font-bold">${stats.totalNetPay.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Users className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Employees</p>
              <p className="text-2xl font-bold">{stats.uniqueEmployees}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Calendar className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold">{totalRecords}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processed">Processed</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={stationFilter} onValueChange={setStationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Station" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
                <SelectItem value="MOBIL">MOBIL</SelectItem>
                <SelectItem value="AMOCO ROSEDALE">AMOCO ROSEDALE</SelectItem>
                <SelectItem value="AMOCO BROOKLYN">AMOCO BROOKLYN</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Salary Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Records</CardTitle>
          <CardDescription>
            Showing {salaryRecords.length} of {totalRecords} salary records
            {refreshing && <span className="text-blue-600 ml-2">(Refreshing...)</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Pay Period</TableHead>
                    <TableHead>Pay Date</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {getEmployeeName(record.employee_id)}
                        <div className="text-xs text-muted-foreground">ID: {record.employee_id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(record.pay_period_start), 'MMM dd')} - {format(new Date(record.pay_period_end), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(record.pay_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{record.pay_frequency}</TableCell>
                      <TableCell className="font-medium">${record.gross_pay?.toLocaleString() || '0'}</TableCell>
                      <TableCell className="font-medium text-green-600">${record.net_pay?.toLocaleString() || '0'}</TableCell>
                      <TableCell>{record.station}</TableCell>
                      <TableCell>
                        <Select 
                          value={record.status} 
                          onValueChange={(value) => handleStatusUpdate(record.id, value)}
                        >
                          <SelectTrigger className="w-auto h-auto p-0 border-none">
                            <Badge variant={getStatusBadgeVariant(record.status)}>
                              {record.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Processed">Processed</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewRecord(record)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Link to={`/salary/${record.id}/edit`}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              title="Edit Record"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => exportToPDF(record)}
                            title="Export PDF"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                            className="text-destructive hover:text-destructive"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {salaryRecords.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No salary records found.</p>
                  <Link to="/salary/new" className="text-primary hover:underline">
                    Create your first salary record
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* View Record Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Salary Record Details</DialogTitle>
            <DialogDescription>
              Complete salary information for {selectedRecord ? getEmployeeName(selectedRecord.employee_id) : ''}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Employee</label>
                  <p className="font-medium">{getEmployeeName(selectedRecord.employee_id)} ({selectedRecord.employee_id})</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Station</label>
                  <p>{selectedRecord.station}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pay Period</label>
                  <p>{format(new Date(selectedRecord.pay_period_start), 'MMM dd')} - {format(new Date(selectedRecord.pay_period_end), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pay Date</label>
                  <p>{format(new Date(selectedRecord.pay_date), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pay Frequency</label>
                  <p>{selectedRecord.pay_frequency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant={getStatusBadgeVariant(selectedRecord.status)}>
                    {selectedRecord.status}
                  </Badge>
                </div>
              </div>

              {/* Earnings */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Earnings</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Base Salary</label>
                    <p className="font-medium">${selectedRecord.base_salary?.toLocaleString() || '0.00'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Hourly Rate</label>
                    <p className="font-medium">${selectedRecord.hourly_rate?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Regular Hours</label>
                    <p className="font-medium">{selectedRecord.regular_hours || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Overtime Hours</label>
                    <p className="font-medium">{selectedRecord.overtime_hours || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Overtime Pay</label>
                    <p className="font-medium">${selectedRecord.overtime_pay?.toLocaleString() || '0.00'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bonus</label>
                    <p className="font-medium">${selectedRecord.bonus_amount?.toLocaleString() || '0.00'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Commission</label>
                    <p className="font-medium">${selectedRecord.commission?.toLocaleString() || '0.00'}</p>
                  </div>
                  <div className="col-span-3 border-t pt-2">
                    <label className="text-sm font-medium text-muted-foreground">Gross Pay</label>
                    <p className="text-xl font-bold text-green-600">${selectedRecord.gross_pay?.toLocaleString() || '0.00'}</p>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Deductions</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Federal Tax</label>
                    <p className="font-medium">${selectedRecord.federal_tax?.toLocaleString() || '0.00'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">State Tax</label>
                    <p className="font-medium">${selectedRecord.state_tax?.toLocaleString() || '0.00'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Social Security</label>
                    <p className="font-medium">${selectedRecord.social_security?.toLocaleString() || '0.00'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Medicare</label>
                    <p className="font-medium">${selectedRecord.medicare?.toLocaleString() || '0.00'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Health Insurance</label>
                    <p className="font-medium">${selectedRecord.health_insurance?.toLocaleString() || '0.00'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">401(k)</label>
                    <p className="font-medium">${selectedRecord.retirement_401k?.toLocaleString() || '0.00'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Other Deductions</label>
                    <p className="font-medium">${selectedRecord.other_deductions?.toLocaleString() || '0.00'}</p>
                  </div>
                  <div className="col-span-3 border-t pt-2">
                    <label className="text-sm font-medium text-muted-foreground">Total Deductions</label>
                    <p className="text-xl font-bold text-red-600">${selectedRecord.total_deductions?.toLocaleString() || '0.00'}</p>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-muted-foreground">Net Pay</label>
                <p className="text-3xl font-bold text-green-600">${selectedRecord.net_pay?.toLocaleString() || '0.00'}</p>
              </div>

              {/* Notes */}
              {selectedRecord.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedRecord.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => exportToPDF(selectedRecord)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Link to={`/salary/${selectedRecord.id}/edit`}>
                  <Button onClick={() => setShowViewDialog(false)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Record
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalaryList;