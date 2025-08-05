import React, { useState, useEffect } from 'react';
import ProfilePicture from '@/components/ProfilePicture';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { employeeStorageService } from '@/services/employeeStorageService';

interface EmployeeProfilePictureProps {
  employeeId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  allowEdit?: boolean;
  showFallbackIcon?: boolean;
  enableHover?: boolean;
  rounded?: 'full' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  onImageUpdate?: (imageUrl: string | null) => void;
}

const EmployeeProfilePicture: React.FC<EmployeeProfilePictureProps> = ({
  employeeId,
  size = 'md',
  className = '',
  allowEdit = true,
  showFallbackIcon = true,
  enableHover = false,
  rounded = 'full',
  disabled = false,
  onImageUpdate
}) => {
  const [employee, setEmployee] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load employee data on mount and when employeeId changes
  useEffect(() => {
    if (employeeId) {
      loadEmployeeData();
    }
  }, [employeeId]);

  const loadEmployeeData = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single();

      if (error) {
        console.error('Error loading employee:', error);
        toast({
          title: "Error",
          description: "Failed to load employee data",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setEmployee(data);
      }
    } catch (error) {
      console.error('Error loading employee:', error);
      toast({
        title: "Error",
        description: "Failed to load employee data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpdate = async (newImageUrl: string | null) => {
    try {
      // Use the storage service to update the employee profile image
      const { data, error } = await employeeStorageService.updateEmployeeProfileImage(employeeId, newImageUrl);
      
      if (error) throw error;

      // Update local state
      setEmployee((prev: any) => ({
        ...prev,
        profile_image_url: newImageUrl
      }));

      // Call parent callback if provided
      if (onImageUpdate) {
        onImageUpdate(newImageUrl);
      }

      toast({
        title: "Profile Updated",
        description: "Employee profile picture has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating employee profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update employee profile picture",
        variant: "destructive"
      });
    }
  };

  if (!employee && !isLoading) {
    return (
      <ProfilePicture
        size={size}
        className={className}
        showFallbackIcon={showFallbackIcon}
        enableHover={enableHover}
        rounded={rounded}
        disabled={true}
        allowEdit={false}
        showLoadingState={false} />);
  }

  return (
    <ProfilePicture
      imageUrl={employee?.profile_image_url}
      firstName={employee?.first_name}
      lastName={employee?.last_name}
      size={size}
      className={className}
      showFallbackIcon={showFallbackIcon}
      enableHover={enableHover}
      rounded={rounded}
      allowEdit={allowEdit}
      disabled={disabled || isLoading}
      onImageUpdate={handleImageUpdate}
      tableName="employees"
      recordId={employeeId}
      alt={`${employee?.first_name} ${employee?.last_name}`.trim() || 'Employee profile picture'} />);
};

export default EmployeeProfilePicture;