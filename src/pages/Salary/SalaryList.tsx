import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Eye, Edit, Trash2, Download, DollarSign, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface SalaryRecord {
  id: number;
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  pay_frequency: string;
  gross_pay: number;
  net_pay: number;
  station: string;
  status: string;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stationFilter, setStationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const { toast } = useToast();

  const pageSize = 10;
  const SALARY_TABLE_ID = '11788';
  const EMPLOYEES_TABLE_ID = '11727';

  useEffect(() => {
    fetchEmployees();
    fetchSalaryRecords();
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

  const fetchSalaryRecords = async () => {
    setLoading(true);
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
      toast({
        title: 'Error',
        description: 'Failed to fetch salary records',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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
      
      fetchSalaryRecords();
    } catch (error) {
      console.error('Error deleting salary record:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete salary record',
        variant: 'destructive'
      });
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.employee_id === employeeId);
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
    const uniqueEmployees = new Set(salaryRecords.map(record => record.employee_id)).size;
    
    return {
      totalGrossPay,
      totalNetPay,
      uniqueEmployees,
      totalRecords: salaryRecords.length
    };
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
        <Link to="/salary/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Salary Record
          </Button>
        </Link>
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
                        <Badge variant={getStatusBadgeVariant(record.status)}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link to={`/salary/${record.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/salary/${record.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(record.id)}
                            className="text-destructive"
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
                  No salary records found. <Link to="/salary/new" className="text-primary hover:underline">Create your first salary record</Link>
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
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default SalaryList;