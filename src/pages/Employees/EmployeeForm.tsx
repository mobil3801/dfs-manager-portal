import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Users, Save, ArrowLeft, X, FileText, Upload } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import EnhancedEmployeeProfilePicture from '@/components/EnhancedEmployeeProfilePicture';
import { displayPhoneNumber, formatPhoneNumber } from '@/utils/phoneFormatter';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';

interface EmployeeFormData {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hire_date: string;
  termination_date: string;
  salary: number;
  hourly_rate: number;
  is_active: boolean;
  emergency_contact: any;
  notes: string;
  profile_image_url: string | null;
}

const EmployeeForm: React.FC = () => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    hire_date: '',
    termination_date: '',
    salary: 0,
    hourly_rate: 0,
    is_active: true,
    emergency_contact: {},
    notes: '',
    profile_image_url: null
  });

  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin } = useSupabaseAuth();

  const positions = ['Manager', 'Supervisor', 'Cashier', 'Attendant', 'Mechanic', 'Cleaner'];
  const departments = ['MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'];

  useEffect(() => {
    if (id && id !== 'new') {
      setIsEditing(true);
      loadEmployee(id);
    } else {
      // Auto-generate employee ID for new employees
      generateEmployeeId();
    }
  }, [id]);

  const generateEmployeeId = async () => {
    try {
      // Get all existing employee IDs that start with 'DFS' to find the next number
      const { data, error } = await supabase.
      from('employees').
      select('employee_id').
      like('employee_id', 'DFS%').
      order('employee_id', { ascending: false }).
      limit(1);

      if (error) {
        console.error('Error fetching existing employee IDs:', error);
        throw error;
      }

      let nextNumber = 1001; // Start from DFS1001

      // If there are existing DFS IDs, find the highest number and increment
      if (data && data.length > 0) {
        const lastId = data[0].employee_id;
        const match = lastId.match(/^DFS(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      const uniqueId = `DFS${nextNumber}`;

      // Double-check that this ID doesn't exist
      const { data: checkData, error: checkError } = await supabase.
      from('employees').
      select('id').
      eq('employee_id', uniqueId).
      limit(1);

      if (checkError) {
        console.error('Error checking employee ID uniqueness:', checkError);
        throw checkError;
      }

      if (checkData && checkData.length > 0) {
        // If somehow the ID exists, try the next number
        const fallbackId = `DFS${nextNumber + 1}`;
        setFormData((prev) => ({ ...prev, employee_id: fallbackId }));
        console.log('Generated unique employee ID (fallback):', fallbackId);
      } else {
        setFormData((prev) => ({ ...prev, employee_id: uniqueId }));
        console.log('Generated unique employee ID:', uniqueId);
      }
    } catch (error) {
      console.error('Error generating employee ID:', error);
      toast({
        title: "Warning",
        description: "Could not auto-generate employee ID. Please enter manually.",
        variant: "default"
      });
    }
  };

  const loadEmployee = async (employeeId: string) => {
    try {
      setLoading(true);
      console.log('Loading employee for editing:', employeeId);

      const { data, error } = await supabase.
      from('employees').
      select('*').
      eq('id', employeeId).
      single();

      if (error) {
        console.error('Error loading employee:', error);
        throw error;
      }

      if (data) {
        setFormData({
          employee_id: data.employee_id || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          position: data.position || '',
          department: data.department || '',
          hire_date: data.hire_date ? data.hire_date.split('T')[0] : '',
          termination_date: data.termination_date ? data.termination_date.split('T')[0] : '',
          salary: data.salary || 0,
          hourly_rate: data.hourly_rate || 0,
          is_active: data.is_active !== false,
          emergency_contact: data.emergency_contact || {},
          notes: data.notes || '',
          profile_image_url: data.profile_image_url || null
        });

        console.log('Employee data loaded successfully');
      }
    } catch (error) {
      console.error('Error loading employee:', error);
      toast({
        title: "Error",
        description: "Failed to load employee details",
        variant: "destructive"
      });
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      console.log('Starting form submission...');

      // Create the data object to submit
      const dataToSubmit = {
        ...formData,
        hire_date: formData.hire_date ? new Date(formData.hire_date).toISOString() : null,
        termination_date: formData.termination_date ? new Date(formData.termination_date).toISOString() : null,
        emergency_contact: formData.emergency_contact || {},
        updated_at: new Date().toISOString()
      };

      console.log('Data to submit:', dataToSubmit);

      if (isEditing && id && id !== 'new') {
        console.log('Updating employee...');

        const { data, error } = await supabase.
        from('employees').
        update(dataToSubmit).
        eq('id', id).
        select().
        single();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }

        console.log('Employee update completed successfully');

        toast({
          title: "Success",
          description: "Employee updated successfully"
        });
      } else {
        console.log('Creating employee...');

        const createData = {
          ...dataToSubmit,
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase.
        from('employees').
        insert([createData]).
        select().
        single();

        if (error) {
          console.error('Create error:', error);
          throw error;
        }

        console.log('Employee creation completed successfully');

        toast({
          title: "Success",
          description: "Employee created successfully"
        });
      }

      console.log('Form submission completed successfully');
      navigate('/employees');
    } catch (error: any) {
      console.error('Error saving employee:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} employee: ${error.message || error}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EmployeeFormData, value: string | number | boolean | any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value: string) => {
    // Store the raw value but format it for display
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>);

  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-6 h-6" />
                <span>{isEditing ? 'Edit Employee' : 'Add New Employee'}</span>
              </CardTitle>
              <CardDescription>
                {isEditing ? 'Update employee information' : 'Add a new employee to your team'}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate('/employees')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Employees
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee ID *</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="employee_id"
                      value={formData.employee_id}
                      onChange={(e) => handleInputChange('employee_id', e.target.value)}
                      placeholder={isEditing ? "Enter employee ID" : "Auto-generated"}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-gray-50 cursor-not-allowed" : ""}
                      required />
                    {!isEditing &&
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateEmployeeId}
                      className="shrink-0">
                        Regenerate
                      </Button>
                    }
                  </div>
                  {!isEditing



                  }
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) =>
                      <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Enter first name"
                    required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Enter last name"
                    required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Enter phone number (e.g., 1234567890)" />
                  {formData.phone &&
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <span className="font-medium">Display format:</span> {displayPhoneNumber(formData.phone)}
                    </div>
                  }
                </div>
              </div>
            </div>

            {/* Employment Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Employment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) =>
                      <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_active">Employment Status *</Label>
                  <Select
                    value={formData.is_active ? 'active' : 'inactive'}
                    onValueChange={(value) => handleInputChange('is_active', value === 'active')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>Active</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span>Inactive</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={`text-white ${formData.is_active ? 'bg-green-500' : 'bg-red-500'}`}>
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-xs text-gray-500">Current employment status</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => handleInputChange('hire_date', e.target.value)} />
                </div>

                {!formData.is_active &&
                <div className="space-y-2">
                    <Label htmlFor="termination_date">Termination Date</Label>
                    <Input
                    id="termination_date"
                    type="date"
                    value={formData.termination_date}
                    onChange={(e) => handleInputChange('termination_date', e.target.value)} />
                  </div>
                }

                









                <div className="space-y-2">
                  <Label htmlFor="hourly_rate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Hourly Salary Rate ($)</Label>
                  <NumberInput
                    id="hourly_rate"
                    step="0.01"
                    min="0"
                    value={formData.hourly_rate}
                    onChange={(value) => handleInputChange('hourly_rate', value)} />
                </div>
              </div>
            </div>

            {/* Profile Picture Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Profile Picture</h3>
              <div className="flex items-center space-x-6">
                <EnhancedEmployeeProfilePicture
                  employeeId={id && id !== 'new' ? id : ''}
                  currentImageUrl={formData.profile_image_url}
                  employeeName={`${formData.first_name} ${formData.last_name}`}
                  size="xl"
                  allowEdit={true}
                  disabled={!id || id === 'new'}
                  onImageUpdate={(newImageUrl) => handleInputChange('profile_image_url', newImageUrl)} />

                <div className="flex-1">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Upload a profile picture for this employee</p>
                    <p className="text-xs text-gray-500">
                      Supported formats: JPG, PNG, GIF (max 5MB)
                    </p>
                    {!id || id === 'new' ?
                    <p className="text-xs text-amber-600 font-medium">
                        Save the employee first to enable profile picture upload
                      </p> :
                    null}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Additional Information</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter any additional notes about the employee"
                    rows={4} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/employees')}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || isUploading}>
                {loading || isUploading ?
                'Saving...' :
                <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Update Employee' : 'Create Employee'}
                  </>
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>);

};

export default EmployeeForm;