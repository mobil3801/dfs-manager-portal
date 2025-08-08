import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Save, X, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import EnhancedEmployeeProfilePicture from '@/components/EnhancedEmployeeProfilePicture';
import { displayPhoneNumber } from '@/utils/phoneFormatter';

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  hire_date?: string;
  termination_date?: string;
  salary?: number;
  hourly_rate?: number;
  is_active?: boolean;
  emergency_contact?: any;
  notes?: string;
  profile_image_url?: string | null;
}

interface EmployeeEditDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEmployee: Employee) => void;
}

const EmployeeEditDialog: React.FC<EmployeeEditDialogProps> = ({
  employee,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const positions = ['Manager', 'Supervisor', 'Cashier', 'Attendant', 'Mechanic', 'Cleaner'];
  const departments = ['MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'];

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
        termination_date: employee.termination_date ? employee.termination_date.split('T')[0] : ''
      });
    }
  }, [employee]);

  const handleInputChange = (field: keyof Employee, value: any) => {
    if (!formData) return;
    setFormData((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = async () => {
    if (!formData) return;

    try {
      setIsLoading(true);

      const updateData = {
        ...formData,
        hire_date: formData.hire_date ? new Date(formData.hire_date).toISOString() : null,
        termination_date: formData.termination_date ? new Date(formData.termination_date).toISOString() : null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase.
      from('employees').
      update(updateData).
      eq('id', formData.id).
      select().
      single();

      if (error) {
        console.error('Error updating employee:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Employee updated successfully"
      });

      onSave(data);
      onClose();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureUpdate = (newImageUrl: string | null) => {
    if (formData) {
      setFormData((prev) => prev ? { ...prev, profile_image_url: newImageUrl } : null);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Edit Employee: {formData.first_name} {formData.last_name}</span>
          </DialogTitle>
          <DialogDescription>
            Update employee information and profile picture
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Picture Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
            <EnhancedEmployeeProfilePicture
              employeeId={formData.id}
              currentImageUrl={formData.profile_image_url}
              employeeName={`${formData.first_name} ${formData.last_name}`}
              size="xl"
              allowEdit
              onImageUpdate={handleProfilePictureUpdate} />

          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => handleInputChange('employee_id', e.target.value)}
                  className="bg-gray-50"
                  readOnly />

              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department || ''}
                  onValueChange={(value) => handleInputChange('department', value)}>

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
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  required />

              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  required />

              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)} />

              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)} />

                {formData.phone &&
                <div className="text-xs text-gray-500">
                    Display: {displayPhoneNumber(formData.phone)}
                  </div>
                }
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select
                  value={formData.position || ''}
                  onValueChange={(value) => handleInputChange('position', value)}>

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
                <Label htmlFor="is_active">Employment Status</Label>
                <Select
                  value={formData.is_active ? 'active' : 'inactive'}
                  onValueChange={(value) => handleInputChange('is_active', value === 'active')}>

                  <SelectTrigger>
                    <SelectValue />
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
                <Badge className={`text-white ${formData.is_active ? 'bg-green-500' : 'bg-red-500'}`}>
                  {formData.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hire_date">Hire Date</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date || ''}
                  onChange={(e) => handleInputChange('hire_date', e.target.value)} />

              </div>

              {!formData.is_active &&
              <div className="space-y-2">
                  <Label htmlFor="termination_date">Termination Date</Label>
                  <Input
                  id="termination_date"
                  type="date"
                  value={formData.termination_date || ''}
                  onChange={(e) => handleInputChange('termination_date', e.target.value)} />

                </div>
              }

              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hourly_rate || 0}
                  onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value) || 0)} />

              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                placeholder="Enter any additional notes about the employee" />

            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}>

            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}>

            {isLoading ?
            'Saving...' :

            <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

};

export default EmployeeEditDialog;