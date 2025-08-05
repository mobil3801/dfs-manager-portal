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
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import ViewModal from '@/components/ViewModal';
import { useListKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { motion } from 'motion/react';
import { useIsMobile } from '@/hooks/use-mobile';
import EnhancedEmployeeProfilePicture from '@/components/EnhancedEmployeeProfilePicture';
import EmployeeEditDialog from '@/components/EmployeeEditDialog';
import { displayPhoneNumber } from '@/utils/phoneFormatter';
import { supabase } from '@/lib/supabase';

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  station_id?: string;
  hire_date?: string;
  termination_date?: string;
  salary?: number;
  hourly_rate?: number;
  is_active?: boolean;
  emergency_contact?: any;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  profile_image_url?: string | null;
  // Legacy fields for compatibility
  station?: string;
  shift?: string;
  employment_status?: string;
  profile_image_id?: number | null;
}

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState<string>('ALL');
  const [totalCount, setTotalCount] = useState(0);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Authentication and Admin Check
  const { isAdmin } = useSupabaseAuth();
  const isAdminUser = isAdmin();

  // Module Access Control
  const {
    canCreate,
    canEdit,
    canDelete,
    isModuleAccessEnabled
  } = useModuleAccess();

  // Permission checks for employees module - only admin users can edit/delete
  const canCreateEmployee = canCreate('employees');
  const canEditEmployee = canEdit('employees') && isAdminUser;
  const canDeleteEmployee = canDelete('employees') && isAdminUser;

  // Custom sorting function for Status and Station priority
  const sortEmployeesByStatusAndStation = (employees: Employee[]) => {
    return employees.sort((a, b) => {
      // Define status priority: Active = 1, Inactive = 2
      const getStatusPriority = (isActive: boolean) => {
        return isActive ? 1 : 2;
      };

      const statusA = a.is_active !== false;
      const statusB = b.is_active !== false;

      const priorityA = getStatusPriority(statusA);
      const priorityB = getStatusPriority(statusB);

      // First sort by status priority
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Within the same status, sort by department alphabetically
      const deptA = a.department || '';
      const deptB = b.department || '';
      if (deptA !== deptB) {
        return deptA.localeCompare(deptB);
      }

      // Within the same status and department, sort by name for consistency
      const nameA = `${a.first_name} ${a.last_name}`;
      const nameB = `${b.first_name} ${b.last_name}`;
      return nameA.localeCompare(nameB);
    });
  };

  useEffect(() => {
    loadEmployees();
  }, [searchTerm, selectedStation]);

  const loadEmployees = async () => {
    try {
      setLoading(true);

      let query = supabase.
      from('employees').
      select('*');

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,employee_id.ilike.%${searchTerm}%`);
      }

      if (selectedStation && selectedStation !== 'ALL') {
        query = query.eq('department', selectedStation);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading employees:', error);
        throw error;
      }

      // Apply custom sorting by Status and Station
      const sortedEmployees = sortEmployeesByStatusAndStation(data || []);

      setEmployees(sortedEmployees);
      setTotalCount(data?.length || 0);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees. Please check your database connection.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedEmployeeId(employee.id);
    setViewModalOpen(true);
  };

  const handleEdit = (employeeId: string) => {
    // Check admin permission for edit
    if (!isAdminUser) {
      toast({
        title: "Admin Access Required",
        description: "Only administrators can edit employee records.",
        variant: "destructive"
      });
      return;
    }

    // Check module edit permission
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
      const employee = employees.find((emp) => emp.id === employeeId);
      if (!employee) {
        toast({
          title: "Error",
          description: "Employee not found. Please refresh the list and try again.",
          variant: "destructive"
        });
        loadEmployees(); // Refresh the list
        return;
      }

      // Open edit dialog instead of navigating
      setEmployeeToEdit(employee);
      setEditDialogOpen(true);

      console.log('Opening edit dialog for employee:', employeeId, employee);
    } catch (error) {
      console.error('Error opening edit dialog:', error);
      toast({
        title: "Error",
        description: "Failed to open edit dialog. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditSave = (updatedEmployee: Employee) => {
    // Update the employee in the local state
    setEmployees(prev => prev.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    ));
    
    // If this employee is currently selected in view modal, update it too
    if (selectedEmployee && selectedEmployee.id === updatedEmployee.id) {
      setSelectedEmployee(updatedEmployee);
    }
    
    // Close edit dialog
    setEditDialogOpen(false);
    setEmployeeToEdit(null);
  };

  const handleDelete = async (employeeId: string) => {
    // Check admin permission for delete
    if (!isAdminUser) {
      toast({
        title: "Admin Access Required",
        description: "Only administrators can delete employee records.",
        variant: "destructive"
      });
      return;
    }

    // Check module delete permission
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
      const { error } = await supabase.
      from('employees').
      delete().
      eq('id', employeeId);

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
    `Email,${selectedEmployee.email || 'N/A'}`,
    `Phone,${selectedEmployee.phone || 'N/A'}`,
    `Position,${selectedEmployee.position || 'N/A'}`,
    `Department,${selectedEmployee.department || 'N/A'}`,
    `Hire Date,${selectedEmployee.hire_date || 'N/A'}`,
    `Salary,${selectedEmployee.salary || 'N/A'}`,
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
      const employee = employees.find((emp) => emp.id === id);
      if (employee) handleView(employee);
    },
    handleEdit,
    handleDelete,
    handleCreateEmployee
  );

  const getDepartmentBadgeColor = (department: string) => {
    switch (department?.toUpperCase()) {
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

  const getEmploymentStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-red-500';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

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
    value: employee.email || 'N/A',
    type: 'email' as const
  },
  {
    key: 'phone',
    label: 'Phone',
    value: employee.phone ? displayPhoneNumber(employee.phone) : 'N/A',
    type: 'phone' as const
  },
  {
    key: 'position',
    label: 'Position',
    value: employee.position || 'N/A',
    type: 'text' as const
  },
  {
    key: 'department',
    label: 'Department',
    value: employee.department || 'N/A',
    type: 'badge' as const,
    badgeColor: getDepartmentBadgeColor(employee.department || '')
  },
  {
    key: 'status',
    label: 'Employment Status',
    value: employee.is_active ? 'Active' : 'Inactive',
    type: 'badge' as const,
    badgeColor: getEmploymentStatusColor(employee.is_active !== false)
  },
  {
    key: 'hire_date',
    label: 'Hire Date',
    value: employee.hire_date || 'N/A',
    type: 'date' as const
  },
  {
    key: 'salary',
    label: 'Salary',
    value: employee.salary || 0,
    type: 'currency' as const
  }];


  // Mobile view for smaller screens
  if (isMobile) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Users className="w-5 h-5" />
                  <span>All Employees</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  Displaying all {totalCount} employees
                </CardDescription>
              </div>
              
              {canCreateEmployee &&
              <Button size="sm" onClick={handleCreateEmployee}>
                  <Plus className="w-4 h-4" />
                </Button>
              }
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filter */}
            <div className="space-y-3">
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Departments</SelectItem>
                  <SelectItem value="MOBIL">MOBIL</SelectItem>
                  <SelectItem value="AMOCO ROSEDALE">AMOCO ROSEDALE</SelectItem>
                  <SelectItem value="AMOCO BROOKLYN">AMOCO BROOKLYN</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10" />
              </div>
            </div>

            {/* Employee Cards */}
            {loading ?
            <div className="space-y-3">
                {[...Array(5)].map((_, i) =>
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
              )}
              </div> :
            employees.length === 0 ?
            <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No employees found</p>
                  {canCreateEmployee &&
              <Button variant="outline" className="mt-4" onClick={handleCreateEmployee}>
                      Add Your First Employee
                    </Button>
              }
                </div> :
            <div className="space-y-3">
                  {employees.map((employee, index) =>
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}>
                      <Card
                  className={`cursor-pointer transition-colors ${
                  selectedEmployeeId === employee.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`
                  }
                  onClick={() => setSelectedEmployeeId(employee.id)}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <EnhancedEmployeeProfilePicture
                        employeeId={employee.id}
                        currentImageUrl={employee.profile_image_url}
                        employeeName={`${employee.first_name} ${employee.last_name}`}
                        size="md" />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900 truncate">
                                  {employee.first_name} {employee.last_name}
                                </h3>
                                <Badge
                            className={`text-white text-xs ${getEmploymentStatusColor(employee.is_active !== false)}`}>
                                  {employee.is_active !== false ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-500">{employee.position || 'N/A'}</p>
                              <p className="text-xs text-gray-400">{employee.employee_id}</p>
                              
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-2">
                                  <Badge
                              className={`text-white text-xs ${getDepartmentBadgeColor(employee.department || '')}`}>
                                    {employee.department || 'N/A'}
                                  </Badge>
                                </div>
                                
                                <div className="flex space-x-1">
                                  <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(employee);
                              }}
                              className="p-1 h-6 w-6">
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  {canEditEmployee &&
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(employee.id);
                              }}
                              className="p-1 h-6 w-6">
                                      <Edit className="w-3 h-3" />
                                    </Button>
                            }
                                  {canDeleteEmployee &&
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(employee.id);
                              }}
                              className="p-1 h-6 w-6 text-red-600 hover:text-red-700">
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                            }
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
              )}
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
          subtitle={`Employee ID: ${selectedEmployee.employee_id} • ${selectedEmployee.position || 'N/A'}`}
          data={selectedEmployee}
          fields={getViewModalFields(selectedEmployee)}
          onEdit={() => {
            setViewModalOpen(false);
            handleEdit(selectedEmployee.id);
          }}
          onDelete={() => handleDelete(selectedEmployee.id)}
          onExport={handleExport}
          canEdit={canEditEmployee}
          canDelete={canDeleteEmployee}
          canExport={true} />
        }
      </div>);

  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-6 h-6" />
                <span>All Employees</span>
              </CardTitle>
              <CardDescription>
                Displaying all {totalCount} employees across all departments (sorted by status: Active → Inactive, then by department)
              </CardDescription>
            </div>
            
            {/* Only show Add Employee button if create permission is enabled */}
            {canCreateEmployee ?
            <Button
              onClick={handleCreateEmployee}
              className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
              </Button> :
            isModuleAccessEnabled &&
            <Badge variant="secondary" className="text-xs">
                  Create access disabled by admin
                </Badge>
            }
          </div>
        </CardHeader>
        <CardContent>
          {/* Department Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-64">
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Select Any Department</SelectItem>
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
                {canCreateEmployee &&
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleCreateEmployee}>
                    Add Your First Employee
                  </Button>
            }
              </div> :
          <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profile</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hire Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee, index) =>
                <motion.tr
                  key={employee.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedEmployeeId === employee.id ? 'bg-blue-50 border-blue-200' : ''}`
                  }
                  onClick={() => setSelectedEmployeeId(employee.id)}>
                        <TableCell>
                          <EnhancedEmployeeProfilePicture
                      employeeId={employee.id}
                      currentImageUrl={employee.profile_image_url}
                      employeeName={`${employee.first_name} ${employee.last_name}`}
                      size="sm" />
                        </TableCell>
                        <TableCell className="font-medium">{employee.employee_id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                            <p className="text-sm text-gray-500">{employee.position || 'N/A'}</p>
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
                                <span>{displayPhoneNumber(employee.phone)}</span>
                              </div>
                      }
                          </div>
                        </TableCell>
                        <TableCell>{employee.position || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={`text-white ${getDepartmentBadgeColor(employee.department || '')}`}>
                            {employee.department || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-white ${getEmploymentStatusColor(employee.is_active !== false)}`}>
                            {employee.is_active !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(employee.hire_date)}</TableCell>
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
                            {canEditEmployee &&
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(employee.id);
                        }}
                        title="Edit Employee & Profile Picture">
                                <Edit className="w-4 h-4" />
                              </Button>
                      }
                            
                            {/* Only show Delete button if delete permission is enabled */}
                            {canDeleteEmployee &&
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(employee.id);
                        }}
                        className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                      }
                          </div>
                        </TableCell>
                      </motion.tr>
                )}
                  </TableBody>
                </Table>
              </div>
          }

          {/* Show permission status when actions are disabled */}
          {(!isAdminUser || !canEditEmployee || !canDeleteEmployee) &&
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                <strong>Access Restrictions:</strong>
                {!isAdminUser && " Edit & Delete access restricted to administrators only."}
                {isAdminUser && !canEditEmployee && " Edit access disabled by module settings."}
                {isAdminUser && !canDeleteEmployee && " Delete access disabled by module settings."}
              </p>
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
        subtitle={`Employee ID: ${selectedEmployee.employee_id} • ${selectedEmployee.position || 'N/A'}`}
        data={selectedEmployee}
        fields={getViewModalFields(selectedEmployee)}
        onEdit={() => {
          setViewModalOpen(false);
          handleEdit(selectedEmployee.id);
        }}
        onDelete={() => handleDelete(selectedEmployee.id)}
        onExport={handleExport}
        canEdit={canEditEmployee}
        canDelete={canDeleteEmployee}
        canExport={true} />
      }

      {/* Employee Edit Dialog */}
      <EmployeeEditDialog
        employee={employeeToEdit}
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEmployeeToEdit(null);
        }}
        onSave={handleEditSave}
      />
    </div>);

};

export default EmployeeList;