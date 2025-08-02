// Complete file deletion service that ensures total cleanup
export interface FileDeleteResponse {
  success: boolean;
  deletedFiles: number[];
  errors: string[];
  totalAttempted: number;
  totalDeleted: number;
}

class CompleteFileDeleteService {
  // Comprehensive file deletion that removes from all locations
  async deleteFiles(fileIds: number[]): Promise<FileDeleteResponse> {
    if (!fileIds || fileIds.length === 0) {
      return {
        success: true,
        deletedFiles: [],
        errors: [],
        totalAttempted: 0,
        totalDeleted: 0
      };
    }

    console.log('[CompleteFileDeleteService] Starting complete deletion of files:', fileIds);
    
    const errors: string[] = [];
    const deletedFiles: number[] = [];

    for (const fileId of fileIds) {
      try {
        const deleteResult = await this.deleteSingleFile(fileId);
        if (deleteResult.success) {
          deletedFiles.push(fileId);
          console.log(`[CompleteFileDeleteService] Successfully deleted file ${fileId}`);
        } else {
          errors.push(`File ${fileId}: ${deleteResult.error}`);
          console.error(`[CompleteFileDeleteService] Failed to delete file ${fileId}:`, deleteResult.error);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`File ${fileId}: ${errorMsg}`);
        console.error(`[CompleteFileDeleteService] Critical error deleting file ${fileId}:`, error);
      }
    }

    const response: FileDeleteResponse = {
      success: deletedFiles.length > 0,
      deletedFiles,
      errors,
      totalAttempted: fileIds.length,
      totalDeleted: deletedFiles.length
    };

    console.log('[CompleteFileDeleteService] Deletion complete:', response);
    return response;
  }

  // Delete a single file completely
  private async deleteSingleFile(fileId: number): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[CompleteFileDeleteService] Deleting file ${fileId}...`);

      // Step 1: Find all file records in file_uploads table
      const { data: fileRecords, error: findError } = await window.ezsite.apis.tablePage('26928', {
        PageNo: 1,
        PageSize: 10, // In case there are multiple records
        Filters: [
          { name: 'store_file_id', op: 'Equal', value: fileId }
        ]
      });

      if (findError) {
        console.error(`[CompleteFileDeleteService] Error finding file records for ${fileId}:`, findError);
        return { success: false, error: `Failed to find file records: ${findError}` };
      }

      // Step 2: Delete all file records from file_uploads table
      if (fileRecords && fileRecords.List && fileRecords.List.length > 0) {
        console.log(`[CompleteFileDeleteService] Found ${fileRecords.List.length} file record(s) for file ${fileId}`);
        
        for (const record of fileRecords.List) {
          try {
            const { error: deleteError } = await window.ezsite.apis.tableDelete('26928', {
              ID: record.id
            });

            if (deleteError) {
              console.error(`[CompleteFileDeleteService] Error deleting file record ${record.id}:`, deleteError);
              return { 
                success: false, 
                error: `Failed to delete file record ${record.id}: ${deleteError}` 
              };
            } else {
              console.log(`[CompleteFileDeleteService] Successfully deleted file record ${record.id}`);
            }
          } catch (recordError) {
            console.error(`[CompleteFileDeleteService] Exception deleting file record ${record.id}:`, recordError);
            return { 
              success: false, 
              error: `Exception deleting file record: ${recordError}` 
            };
          }
        }

        console.log(`[CompleteFileDeleteService] All file records deleted for file ${fileId}`);
      } else {
        console.log(`[CompleteFileDeleteService] No file records found for file ${fileId} - may already be deleted`);
      }

      // Step 3: Attempt to clear any cached references
      try {
        // Clear URL cache if using file service
        if (window.fileService && typeof window.fileService.clearCache === 'function') {
          window.fileService.clearCache(fileId);
        }
      } catch (cacheError) {
        console.warn(`[CompleteFileDeleteService] Could not clear cache for file ${fileId}:`, cacheError);
        // Don't fail the deletion for cache errors
      }

      // Step 4: Verify deletion by attempting to fetch the file
      try {
        const verifyResponse = await window.ezsite.apis.tablePage('26928', {
          PageNo: 1,
          PageSize: 1,
          Filters: [
            { name: 'store_file_id', op: 'Equal', value: fileId }
          ]
        });

        if (!verifyResponse.error && verifyResponse.data && verifyResponse.data.List && verifyResponse.data.List.length > 0) {
          console.warn(`[CompleteFileDeleteService] Verification failed - file ${fileId} still exists after deletion`);
          return { 
            success: false, 
            error: `File still exists after deletion attempt` 
          };
        }

        console.log(`[CompleteFileDeleteService] Verification passed - file ${fileId} successfully deleted`);
      } catch (verifyError) {
        console.warn(`[CompleteFileDeleteService] Could not verify deletion of file ${fileId}:`, verifyError);
        // Don't fail for verification errors if the main deletion succeeded
      }

      return { success: true };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`[CompleteFileDeleteService] Critical error deleting file ${fileId}:`, error);
      return { 
        success: false, 
        error: `Critical deletion error: ${errorMsg}` 
      };
    }
  }

  // Remove file references from employee record
  async removeFileReferencesFromEmployee(employeeId: number, fileIds: number[]): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[CompleteFileDeleteService] Removing file references from employee ${employeeId}:`, fileIds);

      // Get current employee data
      const { data: employeeData, error: fetchError } = await window.ezsite.apis.tablePage('11727', {
        PageNo: 1,
        PageSize: 1,
        Filters: [
          { name: 'ID', op: 'Equal', value: employeeId }
        ]
      });

      if (fetchError) {
        console.error(`[CompleteFileDeleteService] Error fetching employee ${employeeId}:`, fetchError);
        return { success: false, error: `Failed to fetch employee: ${fetchError}` };
      }

      if (!employeeData || !employeeData.List || employeeData.List.length === 0) {
        console.error(`[CompleteFileDeleteService] Employee ${employeeId} not found`);
        return { success: false, error: 'Employee not found' };
      }

      const employee = employeeData.List[0];
      
      // Prepare update data - clear any field that references the deleted files
      const updateData: any = {
        ID: employeeId
      };

      let clearedReferences = 0;

      // Check and clear each ID document field
      if (fileIds.includes(employee.id_document_file_id)) {
        updateData.id_document_file_id = null;
        clearedReferences++;
        console.log(`[CompleteFileDeleteService] Clearing id_document_file_id (${employee.id_document_file_id})`);
      }

      if (fileIds.includes(employee.id_document_2_file_id)) {
        updateData.id_document_2_file_id = null;
        clearedReferences++;
        console.log(`[CompleteFileDeleteService] Clearing id_document_2_file_id (${employee.id_document_2_file_id})`);
      }

      if (fileIds.includes(employee.id_document_3_file_id)) {
        updateData.id_document_3_file_id = null;
        clearedReferences++;
        console.log(`[CompleteFileDeleteService] Clearing id_document_3_file_id (${employee.id_document_3_file_id})`);
      }

      if (fileIds.includes(employee.id_document_4_file_id)) {
        updateData.id_document_4_file_id = null;
        clearedReferences++;
        console.log(`[CompleteFileDeleteService] Clearing id_document_4_file_id (${employee.id_document_4_file_id})`);
      }

      if (fileIds.includes(employee.profile_image_id)) {
        updateData.profile_image_id = null;
        clearedReferences++;
        console.log(`[CompleteFileDeleteService] Clearing profile_image_id (${employee.profile_image_id})`);
      }

      // Only update if we found references to clear
      if (clearedReferences > 0) {
        const { error: updateError } = await window.ezsite.apis.tableUpdate('11727', updateData);

        if (updateError) {
          console.error(`[CompleteFileDeleteService] Error updating employee ${employeeId}:`, updateError);
          return { success: false, error: `Failed to update employee: ${updateError}` };
        }

        console.log(`[CompleteFileDeleteService] Successfully cleared ${clearedReferences} file references from employee ${employeeId}`);
      } else {
        console.log(`[CompleteFileDeleteService] No file references found to clear for employee ${employeeId}`);
      }

      return { success: true };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`[CompleteFileDeleteService] Error removing file references from employee ${employeeId}:`, error);
      return { success: false, error: errorMsg };
    }
  }

  // Complete deletion workflow: remove references then delete files
  async completeEmployeeFileDeletion(employeeId: number, fileIds: number[]): Promise<FileDeleteResponse> {
    console.log(`[CompleteFileDeleteService] Starting complete employee file deletion - Employee: ${employeeId}, Files:`, fileIds);

    // Step 1: Remove file references from employee record first
    const referenceResult = await this.removeFileReferencesFromEmployee(employeeId, fileIds);
    if (!referenceResult.success) {
      return {
        success: false,
        deletedFiles: [],
        errors: [`Failed to remove file references: ${referenceResult.error}`],
        totalAttempted: fileIds.length,
        totalDeleted: 0
      };
    }

    // Step 2: Delete the actual files
    const deleteResult = await this.deleteFiles(fileIds);

    console.log(`[CompleteFileDeleteService] Complete employee file deletion finished - Success: ${deleteResult.success}, Deleted: ${deleteResult.totalDeleted}/${deleteResult.totalAttempted}`);

    return deleteResult;
  }
}

// Export singleton instance
export const completeFileDeleteService = new CompleteFileDeleteService();
