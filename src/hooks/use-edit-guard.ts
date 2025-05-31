import { useCallback } from 'react';
import { useVisualEdit } from '@/contexts/VisualEditContext';
import { useToast } from '@/hooks/use-toast';

export const useEditGuard = () => {
  const { isEditModeEnabled, checkEditPermission } = useVisualEdit();
  const { toast } = useToast();

  const guardedAction = useCallback((action: string, callback: () => void) => {
    if (!checkEditPermission(action)) {
      toast({
        title: "Cannot modify manually",
        description: "Please modify through AI assistance. Manual editing is currently disabled.",
        variant: "destructive",
        duration: 4000,
      });
      return false;
    }
    callback();
    return true;
  }, [checkEditPermission, toast]);

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
    toast({
      title: "Cannot modify manually",
      description: "Please modify through AI assistance. Manual editing is currently disabled for this field.",
      variant: "destructive",
      duration: 3000,
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
    canEdit: () => isEditModeEnabled,
  };
};

export default useEditGuard;