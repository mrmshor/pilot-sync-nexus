import { useState, useEffect, useCallback } from 'react';
import { QuickTask } from '@/types';
import { QuickTaskService } from '@/services/QuickTaskService';
import { useToast } from './use-toast';

export const useQuickTasks = () => {
  const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const quickTaskService = QuickTaskService.getInstance();

  const loadQuickTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedTasks = await quickTaskService.loadQuickTasks();
      setQuickTasks(loadedTasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בטעינת המשימות';
      setError(errorMessage);
      toast({
        title: "שגיאה בטעינת המשימות",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [quickTaskService, toast]);

  const addQuickTask = useCallback(async (title: string) => {
    try {
      const newTask = await quickTaskService.addQuickTask(title);
      setQuickTasks(prev => [newTask, ...prev]);
      
      toast({
        title: "משימה נוספה",
        description: `המשימה "${title}" נוספה בהצלחה`,
      });
      
      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בהוספת משימה';
      toast({
        title: "שגיאה בהוספת משימה",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [quickTaskService, toast]);

  const toggleQuickTask = useCallback(async (taskId: string) => {
    try {
      await quickTaskService.toggleQuickTask(taskId);
      const updatedTasks = await quickTaskService.loadQuickTasks();
      setQuickTasks(updatedTasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בעדכון משימה';
      toast({
        title: "שגיאה בעדכון משימה",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [quickTaskService, toast]);

  const deleteQuickTask = useCallback(async (taskId: string) => {
    try {
      await quickTaskService.deleteQuickTask(taskId);
      setQuickTasks(prev => prev.filter(t => t.id !== taskId));
      
      toast({
        title: "משימה נמחקה",
        description: "המשימה נמחקה בהצלחה",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה במחיקת משימה';
      toast({
        title: "שגיאה במחיקת משימה",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [quickTaskService, toast]);

  // Load quick tasks on hook initialization
  useEffect(() => {
    loadQuickTasks();
  }, [loadQuickTasks]);

  return {
    quickTasks,
    loading,
    error,
    addQuickTask,
    toggleQuickTask,
    deleteQuickTask,
    reloadQuickTasks: loadQuickTasks
  };
};