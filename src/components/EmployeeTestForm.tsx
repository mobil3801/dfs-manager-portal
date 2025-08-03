import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Users, TestTube } from 'lucide-react';

const EmployeeTestForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@test.com',
    phone: '1234567890',
    position: 'Cashier',
    department: 'MOBIL',
    hire_date: new Date().toISOString().split('T')[0],
    salary: 15.00
  });

  const handleTest = async () => {
    try {
      setLoading(true);
      console.log('Testing employee creation with data:', testData);

      // Generate a unique employee ID
      const employeeId = `TEST${Date.now()}`;
      
      const dataToSubmit = {
        employee_id: employeeId,
        first_name: testData.first_name,
        last_name: testData.last_name,
        email: testData.email,
        phone: testData.phone,
        position: testData.position,
        department: testData.department,
        hire_date: testData.hire_date ? new Date(testData.hire_date).toISOString() : null,
        salary: testData.salary,
        hourly_rate: 0,
        is_active: true,
        emergency_contact: {},
        notes: 'Test employee created via test form',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Submitting data:', dataToSubmit);

      const { data, error } = await supabase
        .from('employees')
        .insert([dataToSubmit])
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Employee created successfully:', data);

      toast({
        title: "Success",
        description: `Test employee created successfully with ID: ${employeeId}`
      });

      // Clear form
      setTestData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        position: 'Cashier',
        department: 'MOBIL',
        hire_date: new Date().toISOString().split('T')[0],
        salary: 15.00
      });

    } catch (error: any) {
      console.error('Error creating test employee:', error);
      toast({
        title: "Error",
        description: `Failed to create test employee: ${error.message || error}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setTestData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="w-5 h-5" />
          <span>Employee Creation Test</span>
        </CardTitle>
        <CardDescription>
          Test the employee creation functionality with sample data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={testData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              placeholder="Enter first name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={testData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              placeholder="Enter last name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={testData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={testData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select value={testData.position} onValueChange={(value) => handleInputChange('position', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
                <SelectItem value="Cashier">Cashier</SelectItem>
                <SelectItem value="Attendant">Attendant</SelectItem>
                <SelectItem value="Mechanic">Mechanic</SelectItem>
                <SelectItem value="Cleaner">Cleaner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={testData.department} onValueChange={(value) => handleInputChange('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MOBIL">MOBIL</SelectItem>
                <SelectItem value="AMOCO ROSEDALE">AMOCO ROSEDALE</SelectItem>
                <SelectItem value="AMOCO BROOKLYN">AMOCO BROOKLYN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hire_date">Hire Date</Label>
            <Input
              id="hire_date"
              type="date"
              value={testData.hire_date}
              onChange={(e) => handleInputChange('hire_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Hourly Rate ($)</Label>
            <Input
              id="salary"
              type="number"
              step="0.01"
              min="0"
              value={testData.salary}
              onChange={(e) => handleInputChange('salary', parseFloat(e.target.value) || 0)}
              placeholder="Enter hourly rate"
            />
          </div>
        </div>

        <div className="flex justify-center pt-4 border-t">
          <Button 
            onClick={handleTest} 
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>{loading ? 'Creating Test Employee...' : 'Create Test Employee'}</span>
          </Button>
        </div>

        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Note:</strong> This will create a real employee record in the database with a TEST prefix for easy identification.
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeTestForm;