import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Users, Save, ArrowLeft, X, FileText, Upload } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import EnhancedFileUpload from '@/components/EnhancedFileUpload';
import StationDropdown from '@/components/StationDropdown';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';

interface EmployeeFormData {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  station: string;
  shift: string;
  hire_date: string;
  salary: number;
  is_active: boolean;
  employment_status: string;
  terminated_date: string;
  left_date: string;
  date_of_birth: string;
  current_address: string;
  mailing_address: string;
  reference_name: string;
  id_document_type: string;
  id_document_file_id: number | null;
  id_document_2_file_id: number | null;
  id_document_3_file_id: number | null;
  id_document_4_file_id: number | null;
  profile_image_id: number | null;
}

interface IDDocument {
  file: File | null;
  name: string;
  preview: string | null;
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
    shift: '',
    hire_date: '',
    salary: 0,
    is_active: true,
    employment_status: 'Ongoing',
    terminated_date: '',
    left_date: '',
    date_of_birth: '',
    current_address: '',
    mailing_address: '',
    reference_name: '',
    id_document_type: '',
    id_document_file_id: null,
    id_document_2_file_id: null,
    id_document_3_file_id: null,
    id_document_4_file_id: null,
    profile_image_id: null
  });

  // ID Documents state - 4 separate documents
  const [idDocuments, setIdDocuments] = useState<IDDocument[]>([
  { file: null, name: '', preview: null },
  { file: null, name: '', preview: null },
  { file: null, name: '', preview: null },
  { file: null, name: '', preview: null }]
  );

  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const positions = ['Manager', 'Supervisor', 'Cashier', 'Attendant', 'Mechanic', 'Cleaner'];
  const shifts = ['Day', 'Night', 'Day & Night'];
  const idDocumentTypes = ['Driving License', 'Passport', 'Green Card', 'SSN', 'Work Permit'];

  const employmentStatuses = [
  { value: 'Ongoing', label: 'Ongoing', color: 'bg-green-500' },
  { value: 'Terminated', label: 'Terminated', color: 'bg-red-500' },
  { value: 'Left', label: 'Left', color: 'bg-orange-500' }];


  const getEmploymentStatusColor = (status: string) => {
    const statusConfig = employmentStatuses.find((s) => s.value === status);
    return statusConfig ? statusConfig.color : 'bg-gray-500';
  };

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
          shift: employee.shift || '',
          hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
          salary: employee.salary || 0,
          is_active: employee.is_active !== false,
          employment_status: employee.employment_status || 'Ongoing',
          terminated_date: employee.terminated_date ? employee.terminated_date.split('T')[0] : '',
          left_date: employee.left_date ? employee.left_date.split('T')[0] : '',
          date_of_birth: employee.date_of_birth ? employee.date_of_birth.split('T')[0] : '',
          current_address: employee.current_address || '',
          mailing_address: employee.mailing_address || '',
          reference_name: employee.reference_name || '',
          id_document_type: employee.id_document_type || '',
          id_document_file_id: employee.id_document_file_id || null,
          id_document_2_file_id: employee.id_document_2_file_id || null,
          id_document_3_file_id: employee.id_document_3_file_id || null,
          id_document_4_file_id: employee.id_document_4_file_id || null,
          profile_image_id: employee.profile_image_id || null
        });

        // Initialize ID documents state for editing
        const newIdDocuments = [...idDocuments];
        if (employee.id_document_file_id) {
          newIdDocuments[0] = { file: null, name: 'Existing Document 1', preview: null };
        }
        if (employee.id_document_2_file_id) {
          newIdDocuments[1] = { file: null, name: 'Existing Document 2', preview: null };
        }
        if (employee.id_document_3_file_id) {
          newIdDocuments[2] = { file: null, name: 'Existing Document 3', preview: null };
        }
        if (employee.id_document_4_file_id) {
          newIdDocuments[3] = { file: null, name: 'Existing Document 4', preview: null };
        }
        setIdDocuments(newIdDocuments);
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

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const { data: fileId, error } = await window.ezsite.apis.upload({
        filename: file.name,
        file: file
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

  const handleIDDocumentSelect = (file: File, index: number) => {
    const newIdDocuments = [...idDocuments];

    // Create preview URL for image files
    let preview = null;
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    newIdDocuments[index] = {
      file: file,
      name: file.name,
      preview: preview
    };

    setIdDocuments(newIdDocuments);

    toast({
      title: "Document Selected",
      description: `ID Document ${index + 1} has been selected for upload.`
    });
  };

  const handleRemoveIDDocument = (index: number) => {
    const newIdDocuments = [...idDocuments];

    // Clean up preview URL
    if (newIdDocuments[index].preview) {
      URL.revokeObjectURL(newIdDocuments[index].preview!);
    }

    newIdDocuments[index] = { file: null, name: '', preview: null };
    setIdDocuments(newIdDocuments);

    toast({
      title: "Document Removed",
      description: `ID Document ${index + 1} has been removed.`
    });
  };

  const handleRemoveProfileImage = () => {
    setSelectedProfileImage(null);
    setFormData((prev) => ({ ...prev, profile_image_id: null }));
    toast({
      title: "Profile Picture Removed",
      description: "The profile picture will be removed when you save the employee."
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate station selection - ALL is not allowed for individual employees
    if (formData.station === 'ALL') {
      toast({
        title: "Invalid Station Selection",
        description: "Please select a specific station for the employee. 'ALL' is not allowed for individual employee records.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      let profileImageId = formData.profile_image_id;
      let idDocumentFileIds = [
      formData.id_document_file_id,
      formData.id_document_2_file_id,
      formData.id_document_3_file_id,
      formData.id_document_4_file_id];


      // Upload profile image if selected
      if (selectedProfileImage) {
        profileImageId = await handleFileUpload(selectedProfileImage);
        if (profileImageId === null) {
          setLoading(false);
          return;
        }
      }

      // Upload ID documents if selected
      for (let i = 0; i < idDocuments.length; i++) {
        if (idDocuments[i].file) {
          const uploadedFileId = await handleFileUpload(idDocuments[i].file!);
          if (uploadedFileId === null) {
            setLoading(false);
            return;
          }
          idDocumentFileIds[i] = uploadedFileId;
        }
      }

      const dataToSubmit = {
        ...formData,
        hire_date: formData.hire_date ? new Date(formData.hire_date).toISOString() : '',
        terminated_date: formData.terminated_date ? new Date(formData.terminated_date).toISOString() : '',
        left_date: formData.left_date ? new Date(formData.left_date).toISOString() : '',
        date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString() : '',
        id_document_file_id: idDocumentFileIds[0],
        id_document_2_file_id: idDocumentFileIds[1],
        id_document_3_file_id: idDocumentFileIds[2],
        id_document_4_file_id: idDocumentFileIds[3],
        profile_image_id: profileImageId,
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

  // Calculate how many ID document boxes to show (progressive reveal)
  const getVisibleIDDocumentBoxes = () => {
    let visibleBoxes = 1; // Always show at least the first box

    for (let i = 0; i < idDocuments.length; i++) {
      if (idDocuments[i].file || isEditing && getExistingDocumentFileId(i)) {
        visibleBoxes = Math.max(visibleBoxes, i + 2); // Show next box after this one
      }
    }

    return Math.min(visibleBoxes, 4); // Maximum 4 boxes
  };

  const getExistingDocumentFileId = (index: number) => {
    switch (index) {
      case 0:return formData.id_document_file_id;
      case 1:return formData.id_document_2_file_id;
      case 2:return formData.id_document_3_file_id;
      case 3:return formData.id_document_4_file_id;
      default:return null;
    }
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
            {/* Profile Picture Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Profile Picture</h3>
              <div className="flex items-center space-x-6">
                <div className="flex flex-col items-center space-y-3">
                  <ProfilePictureUpload
                    onFileSelect={setSelectedProfileImage}
                    firstName={formData.first_name}
                    lastName={formData.last_name}
                    imageId={formData.profile_image_id}
                    previewFile={selectedProfileImage}
                    maxSize={5}
                    disabled={loading || isUploading}
                    showRemoveButton={true} />

                  {(formData.profile_image_id || selectedProfileImage) &&
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveProfileImage}
                    className="text-red-600 hover:text-red-700">
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  }
                </div>
                
                <div className="flex-1 space-y-3">
                  <Label>Upload Profile Picture</Label>
                  <EnhancedFileUpload
                    onFileSelect={setSelectedProfileImage}
                    accept="image/*"
                    label="Upload Profile Picture"
                    currentFile={selectedProfileImage?.name}
                    maxSize={5} />
                  
                  {selectedProfileImage &&
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-800">New profile picture selected:</p>
                      <p className="text-sm text-blue-600">{selectedProfileImage.name}</p>
                      <p className="text-xs text-blue-500 mt-1">
                        This will replace the current profile picture when saved.
                      </p>
                    </div>
                  }
                  
                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF (Max 5MB)
                    <br />
                    Recommended: Square image, at least 200x200 pixels
                  </p>
                </div>
              </div>
            </div>

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
                  <StationDropdown
                    id="station"
                    label="Station"
                    value={formData.station}
                    onValueChange={(value) => handleInputChange('station', value)}
                    placeholder="Select station"
                    required
                    includeAll={false} // Individual employees should be assigned to specific stations
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shift">Shift *</Label>
                  <Select value={formData.shift} onValueChange={(value) => handleInputChange('shift', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((shift) =>
                      <SelectItem key={shift} value={shift}>
                          {shift}
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
                  <Label htmlFor="employment_status">Employment Status *</Label>
                  <Select value={formData.employment_status} onValueChange={(value) => handleInputChange('employment_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentStatuses.map((status) =>
                      <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                            <span>{status.label}</span>
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={`text-white ${getEmploymentStatusColor(formData.employment_status)}`}>
                      {formData.employment_status}
                    </Badge>
                    <span className="text-xs text-gray-500">Current employment status</span>
                  </div>
                </div>

                {/* Conditional Date Fields based on Employment Status */}
                {formData.employment_status === 'Terminated' &&
                <div className="space-y-2">
                    <Label htmlFor="terminated_date">Terminated Date *</Label>
                    <Input
                    id="terminated_date"
                    type="date"
                    value={formData.terminated_date}
                    onChange={(e) => handleInputChange('terminated_date', e.target.value)}
                    required />
                  </div>
                }

                {formData.employment_status === 'Left' &&
                <div className="space-y-2">
                    <Label htmlFor="left_date">Left Date *</Label>
                    <Input
                    id="left_date"
                    type="date"
                    value={formData.left_date}
                    onChange={(e) => handleInputChange('left_date', e.target.value)}
                    required />
                  </div>
                }

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

            {/* ID Documentation Section with Progressive Preview Boxes */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">ID Documentation</h3>
              <div className="space-y-6">
                {/* ID Document Type Selection */}
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
                </div>

                {/* Progressive ID Document Upload Boxes */}
                <div className="space-y-6">
                  <h4 className="text-md font-medium text-gray-800">Upload ID Documents</h4>
                  <p className="text-sm text-gray-600">Upload up to 4 ID documents. Additional boxes will appear as you upload files.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: getVisibleIDDocumentBoxes() }, (_, index) =>
                    <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span>ID Document {index + 1}</span>
                            {index === 0 && <span className="text-red-500">*</span>}
                          </Label>
                          {(idDocuments[index].file || getExistingDocumentFileId(index)) &&
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveIDDocument(index)}
                          className="text-red-600 hover:text-red-700 h-6 px-2">
                              <X className="w-3 h-3" />
                            </Button>
                        }
                        </div>

                        <EnhancedFileUpload
                        onFileSelect={(file) => handleIDDocumentSelect(file, index)}
                        accept=".pdf,.jpg,.jpeg,.png,image/*"
                        label={`Upload Document ${index + 1}`}
                        currentFile={idDocuments[index].name}
                        maxSize={10}
                        disabled={loading || isUploading} />

                        {/* Preview for uploaded file */}
                        {idDocuments[index].file &&
                      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="space-y-3">
                              {/* Image Preview Section */}
                              {idDocuments[index].preview ?
                          <div className="relative">
                                  <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-200">
                                    <img
                                src={idDocuments[index].preview!}
                                alt={`ID Document ${index + 1} preview`}
                                className="w-full h-full object-contain hover:object-cover transition-all duration-200 cursor-pointer"
                                onClick={() => window.open(idDocuments[index].preview!, '_blank')} />

                                  </div>
                                  <div className="absolute top-2 right-2">
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-300">
                                      Image Preview
                                    </Badge>
                                  </div>
                                </div> :

                          <div className="aspect-video bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                                  <div className="text-center">
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 font-medium">Document File</p>
                                    <p className="text-xs text-gray-400">No preview available</p>
                                  </div>
                                </div>
                          }

                              {/* File Information */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {idDocuments[index].name}
                                  </p>
                                  <Badge variant="secondary" className="text-xs">
                                    Ready for upload
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span className="flex items-center space-x-1">
                                    <FileText className="w-3 h-3" />
                                    <span>{idDocuments[index].file!.type.includes('image') ? 'Image file' : 'Document file'}</span>
                                  </span>
                                  <span>
                                    {(idDocuments[index].file!.size / 1024 / 1024).toFixed(1)} MB
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                      }

                        {/* Show existing document in edit mode with enhanced image preview */}
                        {isEditing && !idDocuments[index].file && getExistingDocumentFileId(index) &&
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="space-y-3">
                              {/* Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-800">Current Document {index + 1}</span>
                                </div>
                                <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                                  Uploaded
                                </Badge>
                              </div>
                              
                              {/* Enhanced Image Preview */}
                              <div className="relative">
                                <div className="aspect-video bg-white rounded-lg overflow-hidden border border-blue-200 shadow-sm">
                                  <img
                                src={`${window.location.origin}/api/files/${getExistingDocumentFileId(index)}`}
                                alt={`Current Document ${index + 1} preview`}
                                className="w-full h-full object-contain hover:object-cover transition-all duration-200 cursor-pointer"
                                onClick={() => window.open(`${window.location.origin}/api/files/${getExistingDocumentFileId(index)}`, '_blank')}
                                onError={(e) => {
                                  // Enhanced fallback handling for non-image files
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallbackDiv = target.nextElementSibling as HTMLDivElement;
                                  if (fallbackDiv) {
                                    fallbackDiv.style.display = 'flex';
                                  }
                                }} />


                                  {/* Enhanced fallback for non-image files */}
                                  <div
                                className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
                                style={{ display: 'none' }}>
                                    <div className="text-center p-6">
                                      <FileText className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                                      <p className="text-sm font-medium text-gray-700">Document File</p>
                                      <p className="text-xs text-gray-500 mt-1">Click to view file</p>
                                      <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 text-blue-600 border-blue-300 hover:bg-blue-50"
                                    onClick={() => window.open(`${window.location.origin}/api/files/${getExistingDocumentFileId(index)}`, '_blank')}>

                                        View File
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* View Full Size Overlay */}
                                <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
                                  <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="text-xs bg-white/90 hover:bg-white"
                                onClick={() => window.open(`${window.location.origin}/api/files/${getExistingDocumentFileId(index)}`, '_blank')}>

                                    View Full Size
                                  </Button>
                                </div>
                              </div>
                              
                              <p className="text-xs text-blue-600">
                                Upload a new file to replace the current document
                              </p>
                            </div>
                          </div>
                      }
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    Supported formats: PDF, JPG, PNG (Max 10MB per file)
                    <br />
                    Tip: Additional upload boxes will appear automatically as you upload files
                  </p>
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