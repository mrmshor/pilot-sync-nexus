import { useState, useEffect } from 'react';
import { QuickTask } from '@/types';

const QUICK_TASKS_STORAGE_KEY = 'enhanced-quick-tasks';

export const useQuickTasks = () => {
  const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem(QUICK_TASKS_STORAGE_KEY);

    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        const tasksWithDates = parsed.map((task: QuickTask & { createdAt: string; completedAt?: string }) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined
        }));
        setQuickTasks(tasksWithDates);
      } catch (error) {
        console.error('Error loading quick tasks:', error);
        setQuickTasks([]);
      }
    }
  }, []);

  // Save tasks to localStorage
  const saveQuickTasks = (tasks: QuickTask[]) => {
    try {
      localStorage.setItem(QUICK_TASKS_STORAGE_KEY, JSON.stringify(tasks));
      setQuickTasks(tasks);
    } catch (error) {
      console.error('Error saving quick tasks:', error);
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