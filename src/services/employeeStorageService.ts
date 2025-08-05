import { supabase } from '@/lib/supabase';

export class EmployeeStorageService {
  private bucketName: string = '';

  constructor() {
    // Use the default bucket from the project
    this.bucketName = '';
  }

  /**
   * Upload employee profile picture
   */
  async uploadProfilePicture(employeeId: string, file: File): Promise<{
    data: {publicUrl: string;} | null;
    error: Error | null;
  }> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `employee_${employeeId}_${Date.now()}.${fileExt}`;
      const filePath = `profiles/employees/${fileName}`;

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage.
      from(this.bucketName).
      upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.
      from(this.bucketName).
      getPublicUrl(filePath);

      return {
        data: { publicUrl },
        error: null
      };

    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown upload error')
      };
    }
  }

  /**
   * Delete employee profile picture
   */
  async deleteProfilePicture(imageUrl: string): Promise<{error: Error | null;}> {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const filePath = url.pathname.split('/storage/v1/object/public/')[1];

      if (!filePath) {
        throw new Error('Invalid image URL format');
      }

      // Remove bucket name from path if present
      const pathWithoutBucket = filePath.startsWith(this.bucketName + '/') ?
      filePath.substring(this.bucketName.length + 1) :
      filePath;

      const { error } = await supabase.storage.
      from(this.bucketName).
      remove([pathWithoutBucket]);

      if (error) {
        console.error('Delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }

      return { error: null };

    } catch (error) {
      console.error('Error deleting profile picture:', error);
      return {
        error: error instanceof Error ? error : new Error('Unknown delete error')
      };
    }
  }

  /**
   * Update employee profile image URL in database
   */
  async updateEmployeeProfileImage(employeeId: string, imageUrl: string | null): Promise<{
    data: any;
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase.
      from('employees').
      update({
        profile_image_url: imageUrl,
        updated_at: new Date().toISOString()
      }).
      eq('id', employeeId).
      select().
      single();

      if (error) {
        console.error('Database update error:', error);
        throw new Error(`Database update failed: ${error.message}`);
      }

      return { data, error: null };

    } catch (error) {
      console.error('Error updating employee profile image:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown database error')
      };
    }
  }

  /**
   * Upload and update employee profile picture in one operation
   */
  async uploadAndUpdateProfilePicture(employeeId: string, file: File): Promise<{
    data: {employee: any;imageUrl: string;} | null;
    error: Error | null;
  }> {
    try {
      // First, get current employee data to potentially clean up old image
      const { data: currentEmployee } = await supabase.
      from('employees').
      select('profile_image_url').
      eq('id', employeeId).
      single();

      // Upload new image
      const uploadResult = await this.uploadProfilePicture(employeeId, file);
      if (uploadResult.error || !uploadResult.data) {
        throw uploadResult.error || new Error('Upload failed');
      }

      const newImageUrl = uploadResult.data.publicUrl;

      // Update database
      const updateResult = await this.updateEmployeeProfileImage(employeeId, newImageUrl);
      if (updateResult.error || !updateResult.data) {
        // If database update fails, try to clean up uploaded file
        await this.deleteProfilePicture(newImageUrl);
        throw updateResult.error || new Error('Database update failed');
      }

      // Clean up old image if it exists and is different from new one
      if (currentEmployee?.profile_image_url &&
      currentEmployee.profile_image_url !== newImageUrl) {
        await this.deleteProfilePicture(currentEmployee.profile_image_url);
      }

      return {
        data: {
          employee: updateResult.data,
          imageUrl: newImageUrl
        },
        error: null
      };

    } catch (error) {
      console.error('Error in upload and update operation:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error in upload and update')
      };
    }
  }

  /**
   * Remove employee profile picture (delete file and update database)
   */
  async removeEmployeeProfilePicture(employeeId: string): Promise<{
    data: any;
    error: Error | null;
  }> {
    try {
      // Get current employee data
      const { data: currentEmployee } = await supabase.
      from('employees').
      select('profile_image_url').
      eq('id', employeeId).
      single();

      // Update database first
      const updateResult = await this.updateEmployeeProfileImage(employeeId, null);
      if (updateResult.error) {
        throw updateResult.error;
      }

      // Delete file if it exists
      if (currentEmployee?.profile_image_url) {
        await this.deleteProfilePicture(currentEmployee.profile_image_url);
      }

      return {
        data: updateResult.data,
        error: null
      };

    } catch (error) {
      console.error('Error removing employee profile picture:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error in remove operation')
      };
    }
  }

  /**
   * Get employee profile image URL
   */
  async getEmployeeProfileImage(employeeId: string): Promise<{
    data: {imageUrl: string | null;employee: any;} | null;
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase.
      from('employees').
      select('id, first_name, last_name, profile_image_url').
      eq('id', employeeId).
      single();

      if (error) {
        console.error('Error fetching employee:', error);
        throw new Error(`Fetch failed: ${error.message}`);
      }

      return {
        data: {
          imageUrl: data.profile_image_url,
          employee: data
        },
        error: null
      };

    } catch (error) {
      console.error('Error getting employee profile image:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown fetch error')
      };
    }
  }
}

// Export singleton instance
export const employeeStorageService = new EmployeeStorageService();
export default employeeStorageService;