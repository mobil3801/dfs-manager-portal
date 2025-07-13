import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calculator, Save, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface SalaryRecord {
  id?: number;
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  pay_frequency: string;
  hourly_rate: number;
  regular_hours: number;
  assign_hours: number;
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
  salary: number;
}

const SalaryForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id && id !== 'new');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SalaryRecord>({
    employee_id: '',
    pay_period_start: '',
    pay_period_end: '',
    pay_date: format(new Date(), 'yyyy-MM-dd'),
    pay_frequency: 'Weekly',
    base_salary: 0,
    hourly_rate: 0,
    regular_hours: 0,
    assign_hours: 0,
    overtime_hours: 0,
    overtime_rate: 0,
    overtime_pay: 0,
    bonus_amount: 0,
    commission: 0,
    gross_pay: 0,
    federal_tax: 0,
    state_tax: 0,
    social_security: 0,
    medicare: 0,
    health_insurance: 0,
    retirement_401k: 0,
    other_deductions: 0,
    total_deductions: 0,
    net_pay: 0,
    station: 'MOBIL',
    status: 'Pending',
    notes: '',
    created_by: 1
  });

  const SALARY_TABLE_ID = '11788';
  const EMPLOYEES_TABLE_ID = '11727';

  useEffect(() => {
    fetchEmployees();
    if (isEditing) {
      fetchSalaryRecord();
    }
  }, [id]);

  useEffect(() => {
    calculatePayroll();
  }, [
  formData.hourly_rate,
  formData.regular_hours,
  formData.assign_hours,
  formData.overtime_hours,
  formData.bonus_amount,
  formData.commission]
  );

  const fetchEmployees = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(EMPLOYEES_TABLE_ID, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'first_name',
        IsAsc: true,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
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

  const fetchSalaryRecord = async () => {
    if (!id || id === 'new') return;

    setLoading(true);
    try {
      const { data, error } = await window.ezsite.apis.tablePage(SALARY_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'id', op: 'Equal', value: parseInt(id) }]
      });

      if (error) throw error;

      if (data?.List && data.List.length > 0) {
        const record = data.List[0];
        setFormData({
          ...record,
          pay_period_start: format(new Date(record.pay_period_start), 'yyyy-MM-dd'),
          pay_period_end: format(new Date(record.pay_period_end), 'yyyy-MM-dd'),
          pay_date: format(new Date(record.pay_date), 'yyyy-MM-dd')
        });
      }
    } catch (error) {
      console.error('Error fetching salary record:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch salary record',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePayroll = () => {
    // Calculate overtime pay
    const overtimeRate = formData.hourly_rate * 1.5;
    const overtimePay = formData.overtime_hours * overtimeRate;

    // Calculate gross pay
    const regularPay = formData.hourly_rate * formData.regular_hours;
    const assignPay = formData.hourly_rate * formData.assign_hours;
    const grossPay = regularPay + assignPay + overtimePay + formData.bonus_amount + formData.commission;

    setFormData((prev) => ({
      ...prev,
      overtime_rate: overtimeRate,
      overtime_pay: overtimePay,
      gross_pay: grossPay,
      net_pay: grossPay
    }));
  };

  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find((emp) => emp.employee_id === employeeId);
    if (employee) {
      setFormData((prev) => ({
        ...prev,
        employee_id: employeeId,
        station: employee.station,
        hourly_rate: employee.salary || 0 // Use employee salary as hourly rate
      }));
    }
  };

  const handleInputChange = (field: keyof SalaryRecord, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        pay_period_start: new Date(formData.pay_period_start).toISOString(),
        pay_period_end: new Date(formData.pay_period_end).toISOString(),
        pay_date: new Date(formData.pay_date).toISOString()
      };

      if (isEditing) {
        const { error } = await window.ezsite.apis.tableUpdate(SALARY_TABLE_ID, {
          ID: parseInt(id!),
          ...submitData
        });
        if (error) throw error;
      } else {
        const { error } = await window.ezsite.apis.tableCreate(SALARY_TABLE_ID, submitData);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Salary record ${isEditing ? 'updated' : 'created'} successfully`
      });

      navigate('/salary');
    } catch (error) {
      console.error('Error saving salary record:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} salary record`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/salary')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Salary Records
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Salary Record' : 'Create Salary Record'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update salary record details' : 'Add a new salary record for payroll processing'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Employee and pay period details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee *</Label>
                <Select value={formData.employee_id} onValueChange={handleEmployeeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) =>
                    <SelectItem key={employee.employee_id} value={employee.employee_id}>
                        {employee.first_name} {employee.last_name} ({employee.employee_id})
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pay_frequency">Pay Frequency</Label>
                <Select value={formData.pay_frequency} onValueChange={(value) => handleInputChange('pay_frequency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Biweekly">Biweekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Semi-monthly">Semi-monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pay_period_start">Pay Period Start *</Label>
                <Input
                  id="pay_period_start"
                  type="date"
                  value={formData.pay_period_start}
                  onChange={(e) => handleInputChange('pay_period_start', e.target.value)}
                  required />

              </div>

              <div className="space-y-2">
                <Label htmlFor="pay_period_end">Pay Period End *</Label>
                <Input
                  id="pay_period_end"
                  type="date"
                  value={formData.pay_period_end}
                  onChange={(e) => handleInputChange('pay_period_end', e.target.value)}
                  required />

              </div>

              <div className="space-y-2">
                <Label htmlFor="pay_date">Pay Date *</Label>
                <Input
                  id="pay_date"
                  type="date"
                  value={formData.pay_date}
                  onChange={(e) => handleInputChange('pay_date', e.target.value)}
                  required />

              </div>

              <div className="space-y-2">
                <Label htmlFor="station">Station</Label>
                <Select value={formData.station} onValueChange={(value) => handleInputChange('station', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MOBIL">MOBIL</SelectItem>
                    <SelectItem value="AMOCO ROSEDALE">AMOCO ROSEDALE</SelectItem>
                    <SelectItem value="AMOCO BROOKLYN">AMOCO BROOKLYN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Earnings
            </CardTitle>
            <CardDescription>Base salary, hourly wages, and additional compensation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate</Label>
                <NumberInput
                  id="hourly_rate"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(value) => handleInputChange('hourly_rate', value)} />

              </div>

              <div className="space-y-2">
                <Label htmlFor="regular_hours">Regular Hours</Label>
                <NumberInput
                  id="regular_hours"
                  step="0.01"
                  value={formData.regular_hours}
                  onChange={(value) => handleInputChange('regular_hours', value)} />

              </div>

              <div className="space-y-2">
                <Label htmlFor="assign_hours">Assign Hours</Label>
                <NumberInput
                  id="assign_hours"
                  step="0.01"
                  value={formData.assign_hours}
                  onChange={(value) => handleInputChange('assign_hours', value)} />

              </div>


              <div className="space-y-2">
                <Label htmlFor="overtime_hours">Overtime Hours</Label>
                <NumberInput
                  id="overtime_hours"
                  step="0.01"
                  value={formData.overtime_hours}
                  onChange={(value) => handleInputChange('overtime_hours', value)} />

              </div>

              <div className="space-y-2">
                <Label htmlFor="overtime_rate">Overtime Rate (Auto-calculated)</Label>
                <Input
                  id="overtime_rate"
                  type="number"
                  step="0.01"
                  value={formData.overtime_rate.toFixed(2)}
                  disabled
                  className="bg-muted" />

              </div>

              <div className="space-y-2">
                <Label htmlFor="overtime_pay">Overtime Pay (Auto-calculated)</Label>
                <Input
                  id="overtime_pay"
                  type="number"
                  step="0.01"
                  value={formData.overtime_pay.toFixed(2)}
                  disabled
                  className="bg-muted" />

              </div>

              <div className="space-y-2">
                <Label htmlFor="bonus_amount">Bonus Amount</Label>
                <NumberInput
                  id="bonus_amount"
                  step="0.01"
                  value={formData.bonus_amount}
                  onChange={(value) => handleInputChange('bonus_amount', value)} />

              </div>

              <div className="space-y-2">
                <Label htmlFor="commission">Commission</Label>
                <NumberInput
                  id="commission"
                  step="0.01"
                  value={formData.commission}
                  onChange={(value) => handleInputChange('commission', value)} />

              </div>

              <div className="space-y-2">
                <Label htmlFor="gross_pay">Gross Pay (Auto-calculated)</Label>
                <Input
                  id="gross_pay"
                  type="number"
                  step="0.01"
                  value={formData.gross_pay.toFixed(2)}
                  disabled
                  className="bg-muted font-bold" />

              </div>
            </div>
          </CardContent>
        </Card>



        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processed">Processed</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this salary record..."
                rows={3} />

            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/salary')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ?
            <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Updating...' : 'Creating...'}
              </> :

            <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Record' : 'Create Record'}
              </>
            }
          </Button>
        </div>
      </form>
    </div>);

};

export default SalaryForm;