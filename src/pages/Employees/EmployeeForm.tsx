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
import DocumentPreview from '@/components/DocumentPreview';

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

  // Track files to be deleted from database
  const [filesToDelete, setFilesToDelete] = useState<number[]>([]);

  // Debug log for file deletion tracking
  useEffect(() => {
    if (filesToDelete.length > 0) {
      console.log('Files marked for deletion:', filesToDelete);
    }
  }, [filesToDelete]);

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

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up all preview URLs
      idDocuments.forEach(doc => {
        if (doc.preview) {
          URL.revokeObjectURL(doc.preview);
        }
      });
      
      // Clean up profile image preview
      if (selectedProfileImage) {
        URL.revokeObjectURL(URL.createObjectURL(selectedProfileImage));
      }
    };
  }, []);

  // Clean up preview URLs when idDocuments change
  useEffect(() => {
    return () => {
      idDocuments.forEach(doc => {
        if (doc.preview) {
          URL.revokeObjectURL(doc.preview);
        }
      });
    };
  }, [idDocuments]);

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

        // Initialize ID documents state for editing - only show existing documents
        const newIdDocuments = [
        { file: null, name: '', preview: null },
        { file: null, name: '', preview: null },
        { file: null, name: '', preview: null },
        { file: null, name: '', preview: null }];


        // Only populate if the document actually exists
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

        // Clear any pending deletions when loading fresh data
        setFilesToDelete([]);
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

  const handleFileUpload = async (file: File, fileCategory: string = 'document') => {
    setIsUploading(true);
    try {
      const { data: fileId, error } = await window.ezsite.apis.upload({
        filename: file.name,
        file: file
      });
      if (error) throw error;

      // Create file_uploads record for tracking
      const fileUploadData = {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        store_file_id: fileId,
        uploaded_by: 1, // TODO: Get from auth context
        upload_date: new Date().toISOString(),
        associated_table: 'employees',
        associated_record_id: id ? parseInt(id) : null,
        file_category: fileCategory,
        is_active: true,
        description: `Employee ${fileCategory} upload`,
        file_url: '' // Will be populated by system
      };

      const { error: uploadRecordError } = await window.ezsite.apis.tableCreate('26928', fileUploadData);
      if (uploadRecordError) {
        console.error('Error creating file upload record:', uploadRecordError);
        // Don't fail the upload if the record creation fails
      }

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

  // Function to permanently delete files from database storage
  const deleteFilesFromDatabase = async (fileIds: number[]) => {
    try {
      // Delete files from file_uploads table using the correct field name
      for (const fileId of fileIds) {
        // First, get the file record to find the correct ID
        const { data: fileData, error: fetchError } = await window.ezsite.apis.tablePage('26928', {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'store_file_id', op: 'Equal', value: fileId }]
        });

        if (fetchError) {
          console.error(`Error fetching file record ${fileId}:`, fetchError);
          continue;
        }

        if (fileData && fileData.List && fileData.List.length > 0) {
          // Mark file as inactive instead of deleting (for audit trail)
          const { error: deactivateError } = await window.ezsite.apis.tableUpdate('26928', {
            ID: fileData.List[0].id,
            is_active: false,
            description: `${fileData.List[0].description} - Deleted on ${new Date().toISOString()}`
          });
          
          if (deactivateError) {
            console.error(`Error deactivating file ${fileId}:`, deactivateError);
            // Try to delete if update fails
            const { error: deleteError } = await window.ezsite.apis.tableDelete('26928', {
              ID: fileData.List[0].id
            });
            if (deleteError) {
              console.error(`Error deleting file ${fileId}:`, deleteError);
            } else {
              console.log(`Successfully deleted file ${fileId} from database`);
            }
          } else {
            console.log(`Successfully deactivated file ${fileId} in database`);
          }
        }
      }
    } catch (error) {
      console.error('Error deleting files from database:', error);
    }
  };

  // Function to update file associations with employee record
  const updateFileAssociations = async (employeeId: number, documentFileIds: (number | null)[], profileImageId: number | null) => {
    try {
      // Update ID document files
      for (let i = 0; i < documentFileIds.length; i++) {
        const fileId = documentFileIds[i];
        if (fileId) {
          const { data: fileData, error: fetchError } = await window.ezsite.apis.tablePage('26928', {
            PageNo: 1,
            PageSize: 1,
            Filters: [{ name: 'store_file_id', op: 'Equal', value: fileId }]
          });

          if (!fetchError && fileData && fileData.List && fileData.List.length > 0) {
            await window.ezsite.apis.tableUpdate('26928', {
              ID: fileData.List[0].id,
              associated_record_id: employeeId,
              description: `Employee ID Document ${i + 1}`
            });
          }
        }
      }

      // Update profile image file
      if (profileImageId) {
        const { data: fileData, error: fetchError } = await window.ezsite.apis.tablePage('26928', {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'store_file_id', op: 'Equal', value: profileImageId }]
        });

        if (!fetchError && fileData && fileData.List && fileData.List.length > 0) {
          await window.ezsite.apis.tableUpdate('26928', {
            ID: fileData.List[0].id,
            associated_record_id: employeeId,
            description: 'Employee Profile Image'
          });
        }
      }
    } catch (error) {
      console.error('Error updating file associations:', error);
    }
  };

  const handleIDDocumentSelect = (file: File, index: number) => {
    const newIdDocuments = [...idDocuments];

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, JPG, or PNG files only.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    // Clean up previous preview URL if exists
    if (newIdDocuments[index].preview) {
      URL.revokeObjectURL(newIdDocuments[index].preview!);
    }

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
    try {
      const newIdDocuments = [...idDocuments];

      // Clean up preview URL
      if (newIdDocuments[index].preview) {
        URL.revokeObjectURL(newIdDocuments[index].preview!);
      }

      // Get the existing file ID that needs to be deleted
      const existingFileId = getExistingDocumentFileId(index);
      if (existingFileId) {
        // Add to files to delete list for permanent removal
        setFilesToDelete((prev) => {
          const newFilesToDelete = [...prev];
          if (!newFilesToDelete.includes(existingFileId)) {
            newFilesToDelete.push(existingFileId);
          }
          return newFilesToDelete;
        });
      }

      // Clear the document at the specified index instead of removing it
      newIdDocuments[index] = { file: null, name: '', preview: null };

      setIdDocuments(newIdDocuments);

      // Update form data to clear the file ID at the specified index
      const updatedFormData = { ...formData };
      
      switch (index) {
        case 0:
          updatedFormData.id_document_file_id = null;
          break;
        case 1:
          updatedFormData.id_document_2_file_id = null;
          break;
        case 2:
          updatedFormData.id_document_3_file_id = null;
          break;
        case 3:
          updatedFormData.id_document_4_file_id = null;
          break;
      }

      setFormData(updatedFormData);

      toast({
        title: "Document Removed",
        description: `ID Document ${index + 1} has been removed and will be deleted when you save.`
      });
    } catch (error) {
      console.error('Error removing document:', error);
      toast({
        title: "Error",
        description: "Failed to remove document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveProfileImage = () => {
    // Track existing profile image for deletion
    if (formData.profile_image_id) {
      setFilesToDelete((prev) => {
        const newFilesToDelete = [...prev];
        if (!newFilesToDelete.includes(formData.profile_image_id!)) {
          newFilesToDelete.push(formData.profile_image_id!);
        }
        return newFilesToDelete;
      });
    }

    // Clean up preview URL if exists
    if (selectedProfileImage) {
      URL.revokeObjectURL(URL.createObjectURL(selectedProfileImage));
    }

    setSelectedProfileImage(null);
    setFormData((prev) => ({ ...prev, profile_image_id: null }));
    toast({
      title: "Profile Picture Marked for Removal",
      description: "The profile picture will be permanently deleted when you save the employee."
    });
  };

  const handleProfileImageSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload JPG, PNG, or GIF files only.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    // Clean up previous preview if exists
    if (selectedProfileImage) {
      URL.revokeObjectURL(URL.createObjectURL(selectedProfileImage));
    }

    setSelectedProfileImage(file);
    toast({
      title: "Profile Picture Selected",
      description: "Profile picture has been selected for upload."
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

      // Permanently delete files that were marked for deletion
      if (filesToDelete.length > 0) {
        console.log('Deleting files:', filesToDelete);
        await deleteFilesFromDatabase(filesToDelete);
        setFilesToDelete([]); // Clear the list after deletion

        // Show deletion confirmation
        toast({
          title: "Files Deleted",
          description: `${filesToDelete.length} file(s) have been permanently deleted from storage.`
        });
      }

      let profileImageId = formData.profile_image_id;
      let idDocumentFileIds = [
      formData.id_document_file_id,
      formData.id_document_2_file_id,
      formData.id_document_3_file_id,
      formData.id_document_4_file_id];


      // Upload profile image if selected
      if (selectedProfileImage) {
        profileImageId = await handleFileUpload(selectedProfileImage, 'profile_image');
        if (profileImageId === null) {
          setLoading(false);
          return;
        }
      }

      // Upload ID documents if selected
      for (let i = 0; i < idDocuments.length; i++) {
        if (idDocuments[i].file) {
          const uploadedFileId = await handleFileUpload(idDocuments[i].file!, `id_document_${i + 1}`);
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

        // Update file_uploads records with the correct associated_record_id
        await updateFileAssociations(parseInt(id), idDocumentFileIds, profileImageId);

        toast({
          title: "Success",
          description: "Employee updated successfully"
        });
      } else {
        const { error } = await window.ezsite.apis.tableCreate('11727', dataToSubmit);
        if (error) throw error;

        // Get the created employee ID to update file associations
        const { data: createdEmployee } = await window.ezsite.apis.tablePage('11727', {
          PageNo: 1,
          PageSize: 1,
          OrderByField: 'ID',
          IsAsc: false,
          Filters: [{ name: 'employee_id', op: 'Equal', value: dataToSubmit.employee_id }]
        });

        if (createdEmployee && createdEmployee.List && createdEmployee.List.length > 0) {
          const employeeId = createdEmployee.List[0].id;
          await updateFileAssociations(employeeId, idDocumentFileIds, profileImageId);
        }

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
                    onFileSelect={handleProfileImageSelect}
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
                    onFileSelect={handleProfileImageSelect}
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
                  <p className="text-xs text-green-600 bg-green-50 p-2 rounded mt-2">
                      Employee ID is automatically generated
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
                  
                  <div className="space-y-6">
                    {Array.from({ length: getVisibleIDDocumentBoxes() }, (_, index) =>
                    <div key={index} className="space-y-4 p-6 border border-gray-200 rounded-lg bg-gray-50">
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
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveIDDocument(index);
                          }}
                          className="text-red-600 hover:text-red-700 h-6 px-2">
                              <X className="w-3 h-3" />
                            </Button>
                        }
                        </div>

                        {/* Enhanced Upload Area - Larger for Driver License Preview */}
                        <div className="space-y-4">
                          <EnhancedFileUpload
                          onFileSelect={(file) => handleIDDocumentSelect(file, index)}
                          accept=".pdf,.jpg,.jpeg,.png,image/*"
                          label={`Upload Document ${index + 1}`}
                          currentFile={idDocuments[index].name}
                          maxSize={10}
                          disabled={loading || isUploading} />

                          {/* Instant Preview with DocumentPreview Component */}
                          {idDocuments[index].file && (
                            <DocumentPreview
                              file={idDocuments[index].file}
                              fileName={idDocuments[index].name}
                              documentName={`ID Document ${index + 1}`}
                              size="xl"
                              aspectRatio="landscape"
                              showRemoveButton={false}
                              showDownload={false}
                              showFullscreen={true}
                              className="mt-4" />
                          )}

                        </div>

                        {/* Show existing document in edit mode with DocumentPreview Component */}
                        {isEditing && !idDocuments[index].file && getExistingDocumentFileId(index) && (
                          <div className="mt-4">
                            <DocumentPreview
                              fileId={getExistingDocumentFileId(index)}
                              fileName={`Current Document ${index + 1}`}
                              documentName={`ID Document ${index + 1}`}
                              size="xl"
                              aspectRatio="landscape"
                              showRemoveButton={false}
                              showDownload={true}
                              showFullscreen={true}
                              className="border-blue-200 bg-blue-50" />

                            <p className="text-xs text-blue-600 bg-blue-100 p-2 rounded mt-2">
                              Upload a new file to replace the current document. The new file will be saved when you click "Save Employee".
                            </p>
                          </div>
                        )}

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