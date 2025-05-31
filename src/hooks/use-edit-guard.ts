import { useCallback } from 'react';
import { useVisualEdit } from '@/contexts/VisualEditContext';
import { useToast } from '@/hooks/use-toast';

export const useEditGuard = () => {
  const { isEditModeEnabled, checkEditPermission } = useVisualEdit();
  const { toast } = useToast();

  const guardedAction = useCallback((action: string, callback: () => void) => {
    // Always allow actions - remove blocking behavior
    try {
      callback();
      return true;
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
      toast({
        title: "Action failed",
        description: `Failed to ${action}. Please try again.`,
        variant: "destructive",
        duration: 3000
      });
      return false;
    }
  }, [toast]);

  const guardedSubmit = useCallback((formName: string, submitCallback: () => void) => {
    return guardedAction(`submit ${formName} form`, submitCallback);
  }, [guardedAction]);

  const guardedDelete = useCallback((itemName: string, deleteCallback: () => void) => {
    return guardedAction(`delete ${itemName}`, deleteCallback);
  }, [guardedAction]);

  const guardedUpdate = useCallback((itemName: string, updateCallback: () => void) => {
    return guardedAction(`update ${itemName}`, updateCallback);
  }, [guardedAction]);

  const guardedCreate = useCallback((itemName: string, createCallback: () => void) => {
    return guardedAction(`create ${itemName}`, createCallback);
  }, [guardedAction]);

  const showRestrictedMessage = useCallback(() => {
    // No longer show restriction messages
    console.log('Edit action allowed');
  }, []);

  const enableEditMode = useCallback(() => {
    toast({
      title: "Edit mode enabled",
      description: "You can now make manual changes to the application.",
      variant: "default",
      duration: 2000
    });
  }, [toast]);

  return {
    isEditModeEnabled,
    guardedAction,
    guardedSubmit,
    guardedDelete,
    guardedUpdate,
    guardedCreate,
    showRestrictedMessage,
    enableEditMode,
    canEdit: () => true // Always allow editing
  };
};

export default useEditGuard;