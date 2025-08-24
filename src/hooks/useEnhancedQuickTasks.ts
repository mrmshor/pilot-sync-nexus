import { useState, useEffect } from 'react';
import { QuickTask } from '@/types';
import { secureStorage } from '@/utils/secureStorage';
import { logger } from '@/utils/logger';

const QUICK_TASKS_STORAGE_KEY = 'quick-tasks';

export const useQuickTasks = () => {
  const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);

  // Load data from secure storage
  useEffect(() => {
    try {
      // Try to migrate from old plain storage first
      const migrated = secureStorage.migrateFromPlainStorage('enhanced-quick-tasks', QUICK_TASKS_STORAGE_KEY);
      
      const savedTasks = secureStorage.getItem<any[]>(QUICK_TASKS_STORAGE_KEY);
      
      if (savedTasks && Array.isArray(savedTasks)) {
        const tasksWithDates = savedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined
        }));
        setQuickTasks(tasksWithDates);
      }
    } catch (error) {
      logger.error('Error loading quick tasks:', error);
      setQuickTasks([]);
    }
  }, []);

  // Save tasks to secure storage
  const saveQuickTasks = (tasks: QuickTask[]) => {
    try {
      secureStorage.setItem(QUICK_TASKS_STORAGE_KEY, tasks);
      setQuickTasks(tasks);
    } catch (error) {
      logger.error('Error saving quick tasks:', error);
    }
  };

  const addQuickTask = (title: string) => {
    const newTask: QuickTask = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date()
    };

    const updatedTasks = [newTask, ...quickTasks];
    saveQuickTasks(updatedTasks);
  };

  const toggleQuickTask = (id: string) => {
    const updatedTasks = quickTasks.map(task =>
      task.id === id 
        ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date() : undefined
          }
        : task
    );
    saveQuickTasks(updatedTasks);
  };

  const deleteQuickTask = (id: string) => {
    const updatedTasks = quickTasks.filter(task => task.id !== id);
    saveQuickTasks(updatedTasks);
  };

  const exportQuickTasksToNotes = (tasks: QuickTask[]) => {
    const pendingTasks = tasks.filter(task => !task.completed);
    
    if (pendingTasks.length === 0) {
      return;
    }

    const notesContent = [
      'משימות מהירות לביצוע:',
      '',
      ...pendingTasks.map((task, index) => `${index + 1}. ${task.title}`),
      '',
      `נוצר ב: ${new Date().toLocaleDateString('he-IL')}`
    ].join('\n');

    // Try to use native Notes app
    if (navigator.share) {
      navigator.share({
        title: 'משימות מהירות',
        text: notesContent
      }).catch(() => {
        // Fallback to copy to clipboard
        navigator.clipboard.writeText(notesContent);
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(notesContent);
    }
  };

  return {
    quickTasks,
    addQuickTask,
    toggleQuickTask,
    deleteQuickTask,
    exportQuickTasksToNotes
  };
};