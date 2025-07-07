import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Search, Edit, Trash2, Users, Mail, Phone, Plus, Eye, Download, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleAccess } from '@/contexts/ModuleAccessContext';
import ViewModal from '@/components/ViewModal';
import { useListKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { motion } from 'motion/react';

interface Employee {
  ID: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  station: string;
  hire_date: string;
  salary: number;
  is_active: boolean;
  created_by: number;
}

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const navigate = useNavigate();

  // Module Access Control
  const {
    canCreate,
    canEdit,
    canDelete,
    isModuleAccessEnabled
  } = useModuleAccess();

  // Permission checks for employees module
  const canCreateEmployee = canCreate('employees');
  const canEditEmployee = canEdit('employees');
  const canDeleteEmployee = canDelete('employees');

  const pageSize = 10;

  useEffect(() => {
    loadEmployees();
  }, [currentPage, searchTerm, selectedStation]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const filters = [];

      if (searchTerm) {
        filters.push({ name: 'first_name', op: 'StringContains', value: searchTerm });
      }

      if (selectedStation && selectedStation !== 'ALL') {
        filters.push({ name: 'station', op: 'Equal', value: selectedStation });
      }

      const { data, error } = await window.ezsite.apis.tablePage('11727', {
        PageNo: currentPage,
        PageSize: pageSize,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw error;

      setEmployees(data?.List || []);
      setTotalCount(data?.VirtualCount || 0);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedEmployeeId(employee.ID);
    setViewModalOpen(true);
  };

  const handleEdit = (employeeId: number) => {
    // Check edit permission
    if (!canEditEmployee) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit employees.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Validate employee ID exists
      const employee = employees.find((emp) => emp.ID === employeeId);
      if (!employee) {
        toast({
          title: "Error",
          description: "Employee not found. Please refresh the list and try again.",
          variant: "destructive"
        });
        loadEmployees(); // Refresh the list
        return;
      }

      // Navigate to edit form
      navigate(`/employees/${employeeId}/edit`);

      // Log for debugging
      console.log('Navigating to edit employee:', employeeId, employee);
    } catch (error) {
      console.error('Error navigating to edit form:', error);
      toast({
        title: "Navigation Error",
        description: "Failed to open edit form. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (employeeId: number) => {
    // Check delete permission
    if (!canDeleteEmployee) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete employees.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const { error } = await window.ezsite.apis.tableDelete('11727', { ID: employeeId });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee deleted successfully"
      });
      loadEmployees();
      setViewModalOpen(false);
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    if (!selectedEmployee) return;

    const csvContent = [
    'Field,Value',
    `Employee ID,${selectedEmployee.employee_id}`,
    `Name,${selectedEmployee.first_name} ${selectedEmployee.last_name}`,
    `Email,${selectedEmployee.email}`,
    `Phone,${selectedEmployee.phone}`,
    `Position,${selectedEmployee.position}`,
    `Station,${selectedEmployee.station}`,
    `Hire Date,${selectedEmployee.hire_date}`,
    `Salary,${selectedEmployee.salary}`,
    `Status,${selectedEmployee.is_active ? 'Active' : 'Inactive'}`].
    join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee_${selectedEmployee.employee_id}_details.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Employee details exported successfully"
    });
  };

  const handleCreateEmployee = () => {
    // Check create permission
    if (!canCreateEmployee) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create employees.",
        variant: "destructive"
      });
      return;
    }

    navigate('/employees/new');
  };

  // Keyboard shortcuts
  useListKeyboardShortcuts(
    selectedEmployeeId,
    (id) => {
      const employee = employees.find((emp) => emp.ID === id);
      if (employee) handleView(employee);
    },
    handleEdit,
    handleDelete,
    handleCreateEmployee
  );

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

  const totalPages = Math.ceil(totalCount / pageSize);

  // Define view modal fields
  const getViewModalFields = (employee: Employee) => [
  {
    key: 'employee_id',
    label: 'Employee ID',
    value: employee.employee_id,
    type: 'text' as const,
    icon: User
  },
  {
    key: 'name',
    label: 'Full Name',
    value: `${employee.first_name} ${employee.last_name}`,
    type: 'text' as const,
    icon: User
  },
  {
    key: 'email',
    label: 'Email',
    value: employee.email,
    type: 'email' as const
  },
  {
    key: 'phone',
    label: 'Phone',
    value: employee.phone,
    type: 'phone' as const
  },
  {
    key: 'position',
    label: 'Position',
    value: employee.position,
    type: 'text' as const
  },
  {
    key: 'station',
    label: 'Station',
    value: employee.station,
    type: 'badge' as const,
    badgeColor: getStationBadgeColor(employee.station)
  },
  {
    key: 'hire_date',
    label: 'Hire Date',
    value: employee.hire_date,
    type: 'date' as const
  },
  {
    key: 'salary',
    label: 'Salary',
    value: employee.salary,
    type: 'currency' as const
  },
  {
    key: 'is_active',
    label: 'Status',
    value: employee.is_active,
    type: 'boolean' as const
  }];


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-6 h-6" />
                <span>Employee List</span>
              </CardTitle>
              <CardDescription>
                Manage your employees across all stations
              </CardDescription>
            </div>
            
            {/* Only show Add Employee button if create permission is enabled */}
            {canCreateEmployee ? (
              <Button
                onClick={handleCreateEmployee}
                className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
              </Button>
            ) : isModuleAccessEnabled && (
              <Badge variant="secondary" className="text-xs">
                Create access disabled by admin
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Station Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-64">
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Select Any Station</SelectItem>
                  <SelectItem value="MOBIL">MOBIL</SelectItem>
                  <SelectItem value="AMOCO ROSEDALE">AMOCO ROSEDALE</SelectItem>
                  <SelectItem value="AMOCO BROOKLYN">AMOCO BROOKLYN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10" />
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Keyboard shortcuts:</strong> Select a row, then press <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">V</kbd> to view, 
              <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs ml-1">E</kbd> to edit, 
              <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs ml-1">D</kbd> to delete, or 
              <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs ml-1">Ctrl+N</kbd> to create new
            </p>
          </div>

          {/* Employees Table */}
          {loading ?
          <div className="space-y-4">
              {[...Array(5)].map((_, i) =>
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            )}
            </div> :
          employees.length === 0 ?
          <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No employees found</p>
              {canCreateEmployee && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleCreateEmployee}>
                  Add Your First Employee
                </Button>
              )}
            </div> :

          <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee, index) =>
                <motion.tr
                  key={employee.ID}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedEmployeeId === employee.ID ? 'bg-blue-50 border-blue-200' : ''}`
                  }
                  onClick={() => setSelectedEmployeeId(employee.ID)}>

                      <TableCell className="font-medium">{employee.employee_id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                          <p className="text-sm text-gray-500">{employee.position}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {employee.email &&
                      <div className="flex items-center space-x-1 text-sm">
                              <Mail className="w-3 h-3" />
                              <span>{employee.email}</span>
                            </div>
                      }
                          {employee.phone &&
                      <div className="flex items-center space-x-1 text-sm">
                              <Phone className="w-3 h-3" />
                              <span>{employee.phone}</span>
                            </div>
                      }
                        </div>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <Badge className={`text-white ${getStationBadgeColor(employee.station)}`}>
                          {employee.station}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(employee.hire_date)}</TableCell>
                      <TableCell>
                        <Badge variant={employee.is_active ? "default" : "secondary"}>
                          {employee.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(employee);
                        }}
                        className="text-blue-600 hover:text-blue-700">

                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {/* Only show Edit button if edit permission is enabled */}
                          {canEditEmployee && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(employee.ID);
                              }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {/* Only show Delete button if delete permission is enabled */}
                          {canDeleteEmployee && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(employee.ID);
                              }}
                              className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                )}
                </TableBody>
              </Table>
            </div>
          }

          {/* Show permission status when actions are disabled */}
          {(!canEditEmployee || !canDeleteEmployee) && isModuleAccessEnabled && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                <strong>Access Restrictions:</strong>
                {!canEditEmployee && " Edit access disabled by admin."}
                {!canDeleteEmployee && " Delete access disabled by admin."}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 &&
          <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} employees
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
      
      {/* View Modal */}
      {selectedEmployee &&
      <ViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedEmployee(null);
          setSelectedEmployeeId(null);
        }}
        title={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
        subtitle={`Employee ID: ${selectedEmployee.employee_id} • ${selectedEmployee.position}`}
        data={selectedEmployee}
        fields={getViewModalFields(selectedEmployee)}
        onEdit={() => {
          setViewModalOpen(false);
          handleEdit(selectedEmployee.ID);
        }}
        onDelete={() => handleDelete(selectedEmployee.ID)}
        onExport={handleExport}
        canEdit={canEditEmployee}
        canDelete={canDeleteEmployee}
        canExport={true} />

      }
    </div>);

};

export default EmployeeList;