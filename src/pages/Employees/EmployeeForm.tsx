import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Users, Save, ArrowLeft, Upload } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import EnhancedFileUpload from '@/components/EnhancedFileUpload';

interface EmployeeFormData {
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
  date_of_birth: string;
  current_address: string;
  mailing_address: string;
  reference_name: string;
  id_document_type: string;
  id_document_file_id: number | null;
}

const EmployeeForm: React.FC = () => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    station: '',
    hire_date: '',
    salary: 0,
    is_active: true,
    date_of_birth: '',
    current_address: '',
    mailing_address: '',
    reference_name: '',
    id_document_type: '',
    id_document_file_id: null
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const stations = ['MOBIL', 'AMOCO ROSEDALE', 'AMOCO BROOKLYN'];
  const positions = ['Manager', 'Supervisor', 'Cashier', 'Attendant', 'Mechanic', 'Cleaner'];
  const idDocumentTypes = ['Driving License', 'Passport', 'Green Card', 'SSN', 'Work Permit'];

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadEmployee(parseInt(id));
    } else {
      // Auto-generate employee ID for new employees
      generateEmployeeId();
    }
  }, [id]);

  const generateEmployeeId = async () => {
    try {
      // Get all existing employee IDs that start with 'DFS' to find the next number
      const { data, error } = await window.ezsite.apis.tablePage('11727', {
        PageNo: 1,
        PageSize: 1000, // Get enough records to find the highest number
        OrderByField: 'employee_id',
        IsAsc: false,
        Filters: [{ name: 'employee_id', op: 'StringStartsWith', value: 'DFS' }]
      });

      if (error) {
        console.error('Error fetching existing employee IDs:', error);
        throw error;
      }

      let nextNumber = 1001; // Start from DFS1001

      // If there are existing DFS IDs, find the highest number and increment
      if (data && data.List && data.List.length > 0) {
        const existingNumbers = data.List.
        map((emp) => {
          const match = emp.employee_id.match(/^DFS(\d+)$/);
          return match ? parseInt(match[1]) : 0;
        }).
        filter((num) => num > 0);

        if (existingNumbers.length > 0) {
          nextNumber = Math.max(...existingNumbers) + 1;
        }
      }

      const uniqueId = `DFS${nextNumber}`;

      // Double-check that this ID doesn't exist
      const { data: checkData, error: checkError } = await window.ezsite.apis.tablePage('11727', {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'employee_id', op: 'Equal', value: uniqueId }]
      });

      if (checkError) {
        console.error('Error checking employee ID uniqueness:', checkError);
        throw checkError;
      }

      if (checkData && checkData.List && checkData.List.length > 0) {
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

  const loadEmployee = async (employeeId: number) => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage('11727', {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'ID', op: 'Equal', value: employeeId }]
      });

      if (error) throw error;

      if (data && data.List && data.List.length > 0) {
        const employee = data.List[0];
        setFormData({
          employee_id: employee.employee_id || '',
          first_name: employee.first_name || '',
          last_name: employee.last_name || '',
          email: employee.email || '',
          phone: employee.phone || '',
          position: employee.position || '',
          station: employee.station || '',
          hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
          salary: employee.salary || 0,
          is_active: employee.is_active !== false,
          date_of_birth: employee.date_of_birth ? employee.date_of_birth.split('T')[0] : '',
          current_address: employee.current_address || '',
          mailing_address: employee.mailing_address || '',
          reference_name: employee.reference_name || '',
          id_document_type: employee.id_document_type || '',
          id_document_file_id: employee.id_document_file_id || null
        });
      }
    } catch (error) {
      console.error('Error loading employee:', error);
      toast({
        title: "Error",
        description: "Failed to load employee details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return null;

    setIsUploading(true);
    try {
      const { data: fileId, error } = await window.ezsite.apis.upload({
        filename: selectedFile.name,
        file: selectedFile
      });
      if (error) throw error;
      return fileId;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      let fileId = formData.id_document_file_id;

      if (selectedFile) {
        fileId = await handleFileUpload();
        if (fileId === null) {
          setLoading(false);
          return;
        }
      }

      const dataToSubmit = {
        ...formData,
        hire_date: formData.hire_date ? new Date(formData.hire_date).toISOString() : '',
        date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString() : '',
        id_document_file_id: fileId,
        created_by: 1
      };

      if (isEditing && id) {
        const { error } = await window.ezsite.apis.tableUpdate('11727', {
          ID: parseInt(id),
          ...dataToSubmit
        });
        if (error) throw error;

        toast({
          title: "Success",
          description: "Employee updated successfully"
        });
      } else {
        const { error } = await window.ezsite.apis.tableCreate('11727', dataToSubmit);
        if (error) throw error;

        toast({
          title: "Success",
          description: "Employee created successfully"
        });
      }

      navigate('/employees');
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} employee`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EmployeeFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
                  {!isEditing &&
                  <p className="text-xs text-gray-500">
                      Auto-generated format: DFS#### (sequential numbering starting from DFS1001)
                    </p>
                  }
                </div>

                <div className="space-y-2">
                  <Label htmlFor="station">Station *</Label>
                  <Select value={formData.station} onValueChange={(value) => handleInputChange('station', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select station" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) =>
                      <SelectItem key={station} value={station}>
                          {station}
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
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)} />
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
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference_name">Reference Name</Label>
                  <Input
                    id="reference_name"
                    value={formData.reference_name}
                    onChange={(e) => handleInputChange('reference_name', e.target.value)}
                    placeholder="Enter reference name" />
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="current_address">Current Address</Label>
                  <Textarea
                    id="current_address"
                    value={formData.current_address}
                    onChange={(e) => handleInputChange('current_address', e.target.value)}
                    placeholder="Enter current address"
                    rows={3} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mailing_address">Mailing Address</Label>
                  <Textarea
                    id="mailing_address"
                    value={formData.mailing_address}
                    onChange={(e) => handleInputChange('mailing_address', e.target.value)}
                    placeholder="Enter mailing address"
                    rows={3} />
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
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => handleInputChange('hire_date', e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salary ($)</Label>
                  <NumberInput
                    id="salary"
                    step="0.01"
                    min="0"
                    value={formData.salary}
                    onChange={(value) => handleInputChange('salary', value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_active">Active Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)} />
                    <span className="text-sm text-gray-600">
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ID Documentation Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">ID Documentation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="id_document_type">ID Document Type</Label>
                  <Select value={formData.id_document_type} onValueChange={(value) => handleInputChange('id_document_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {idDocumentTypes.map((type) =>
                      <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>ID Document Upload</Label>
                  <EnhancedFileUpload
                    onFileSelect={setSelectedFile}
                    accept=".pdf,.jpg,.jpeg,.png,image/*"
                    label="Upload ID Document or Take Photo"
                    currentFile={selectedFile?.name}
                    maxSize={10}
                    allowCamera={true} />

                  {selectedFile &&
                  <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">Selected file:</p>
                      <p className="text-sm text-gray-600">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedFile.type.includes('image') ? 'Image file selected' : 'Document file selected'}
                      </p>
                    </div>
                  }
                  <p className="text-xs text-gray-500">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
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
              <Button type="submit" disabled={loading || isUploading}>
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