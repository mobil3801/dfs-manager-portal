import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ChangelogEntry {
  product_id: number;
  field_name: string;
  old_value: string;
  new_value: string;
  change_timestamp: string;
  changed_by: number;
  change_type: 'create' | 'update' | 'delete';
  change_summary: string;
}

export const useProductChangelog = () => {
  const { userProfile } = useAuth();

  const logChange = async (
    productId: number,
    fieldName: string,
    oldValue: any,
    newValue: any,
    changeType: 'create' | 'update' | 'delete' = 'update',
    summary?: string
  ) => {
    if (!userProfile) {
      console.warn('No user profile available for logging change');
      return;
    }

    try {
      const entry: ChangelogEntry = {
        product_id: productId,
        field_name: fieldName,
        old_value: oldValue?.toString() || '',
        new_value: newValue?.toString() || '',
        change_timestamp: new Date().toISOString(),
        changed_by: userProfile.user_id,
        change_type: changeType,
        change_summary: summary || `${fieldName.replace(/_/g, ' ')} changed from "${oldValue}" to "${newValue}"`
      };

      const { error } = await window.ezsite.apis.tableCreate('24010', entry);
      
      if (error) {
        console.error('Error logging change:', error);
      }
    } catch (error) {
      console.error('Error logging change:', error);
    }
  };

  const logMultipleChanges = async (
    productId: number,
    changes: Array<{
      fieldName: string;
      oldValue: any;
      newValue: any;
    }>,
    changeType: 'create' | 'update' | 'delete' = 'update'
  ) => {
    if (!userProfile) {
      console.warn('No user profile available for logging changes');
      return;
    }

    try {
      const entries = changes.map(change => ({
        product_id: productId,
        field_name: change.fieldName,
        old_value: change.oldValue?.toString() || '',
        new_value: change.newValue?.toString() || '',
        change_timestamp: new Date().toISOString(),
        changed_by: userProfile.user_id,
        change_type: changeType,
        change_summary: `${change.fieldName.replace(/_/g, ' ')} changed from "${change.oldValue}" to "${change.newValue}"`
      }));

      // Log each change individually for better granularity
      for (const entry of entries) {
        const { error } = await window.ezsite.apis.tableCreate('24010', entry);
        if (error) {
          console.error('Error logging change:', error);
        }
      }
    } catch (error) {
      console.error('Error logging multiple changes:', error);
    }
  };

  const logProductCreation = async (productId: number, productData: any) => {
    if (!userProfile) return;

    try {
      const entry: ChangelogEntry = {
        product_id: productId,
        field_name: 'product_created',
        old_value: '',
        new_value: productData.product_name || 'New Product',
        change_timestamp: new Date().toISOString(),
        changed_by: userProfile.user_id,
        change_type: 'create',
        change_summary: `Product "${productData.product_name}" was created`
      };

      const { error } = await window.ezsite.apis.tableCreate('24010', entry);
      
      if (error) {
        console.error('Error logging product creation:', error);
      }
    } catch (error) {
      console.error('Error logging product creation:', error);
    }
  };

  const logProductDeletion = async (productId: number, productName: string) => {
    if (!userProfile) return;

    try {
      const entry: ChangelogEntry = {
        product_id: productId,
        field_name: 'product_deleted',
        old_value: productName,
        new_value: '',
        change_timestamp: new Date().toISOString(),
        changed_by: userProfile.user_id,
        change_type: 'delete',
        change_summary: `Product "${productName}" was deleted`
      };

      const { error } = await window.ezsite.apis.tableCreate('24010', entry);
      
      if (error) {
        console.error('Error logging product deletion:', error);
      }
    } catch (error) {
      console.error('Error logging product deletion:', error);
    }
  };

  return {
    logChange,
    logMultipleChanges,
    logProductCreation,
    logProductDeletion
  };
};