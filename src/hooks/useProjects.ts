import { useState, useEffect, useCallback } from 'react';
import { Project, Task, AppState } from '@/types/project';
import { TauriService } from '@/services/tauriService';
import { toast } from 'sonner';

const STORAGE_FILE = 'projects.json';

export const useProjects = () => {
  const [state, setState] = useState<AppState>({
    projects: [],
    isLoading: true,
    error: undefined
  });

  // טעינת פרויקטים בהפעלה
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      if (TauriService.isTauri()) {
        const data = await TauriService.loadProjectData(STORAGE_FILE);
        const parsed = data ? JSON.parse(data) : { projects: [] };
        setState(prev => ({
          ...prev,
          projects: parsed.projects || [],
          isLoading: false
        }));
      } else {
        // טעינה מ-localStorage לבדיקות
        const saved = localStorage.getItem('projects');
        const projects = saved ? JSON.parse(saved) : [];
        setState(prev => ({
          ...prev,
          projects,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('❌ שגיאה בטעינת פרויקטים:', error);
      setState(prev => ({
        ...prev,
        error: 'שגיאה בטעינת נתונים',
        isLoading: false
      }));
      toast.error('שגיאה בטעינת הפרויקטים');
    }
  }, []);

  const saveProjects = useCallback(async (projects: Project[]) => {
    try {
      if (TauriService.isTauri()) {
        await TauriService.saveProjectData(
          JSON.stringify({ projects }, null, 2),
          STORAGE_FILE
        );
      } else {
        localStorage.setItem('projects', JSON.stringify(projects));
      }
    } catch (error) {
      console.error('❌ שגיאה בשמירת פרויקטים:', error);
      toast.error('שגיאה בשמירת הנתונים');
    }
  }, []);

  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'progress'>) => {
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      tasks: [],
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedProjects = [...state.projects, newProject];
    setState(prev => ({ ...prev, projects: updatedProjects }));
    await saveProjects(updatedProjects);
    toast.success('פרויקט נוצר בהצלחה');
    return newProject;
  }, [state.projects, saveProjects]);

  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    const updatedProjects = state.projects.map(project =>
      project.id === projectId
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    );
    setState(prev => ({ ...prev, projects: updatedProjects }));
    await saveProjects(updatedProjects);
    toast.success('פרויקט עודכן בהצלחה');
  }, [state.projects, saveProjects]);

  const deleteProject = useCallback(async (projectId: string) => {
    const updatedProjects = state.projects.filter(project => project.id !== projectId);
    setState(prev => ({ ...prev, projects: updatedProjects }));
    await saveProjects(updatedProjects);
    toast.success('פרויקט נמחק בהצלחה');
  }, [state.projects, saveProjects]);

  const addTask = useCallback(async (projectId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedProjects = state.projects.map(project => {
      if (project.id === projectId) {
        const updatedTasks = [...project.tasks, newTask];
        const completedTasks = updatedTasks.filter(t => t.completed).length;
        const progress = updatedTasks.length > 0 ? (completedTasks / updatedTasks.length) * 100 : 0;
        
        return {
          ...project,
          tasks: updatedTasks,
          progress: Math.round(progress),
          updatedAt: new Date().toISOString()
        };
      }
      return project;
    });

    setState(prev => ({ ...prev, projects: updatedProjects }));
    await saveProjects(updatedProjects);
    toast.success('משימה נוספה בהצלחה');
  }, [state.projects, saveProjects]);

  const updateTask = useCallback(async (projectId: string, taskId: string, updates: Partial<Task>) => {
    const updatedProjects = state.projects.map(project => {
      if (project.id === projectId) {
        const updatedTasks = project.tasks.map(task =>
          task.id === taskId
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        );
        
        const completedTasks = updatedTasks.filter(t => t.completed).length;
        const progress = updatedTasks.length > 0 ? (completedTasks / updatedTasks.length) * 100 : 0;
        
        return {
          ...project,
          tasks: updatedTasks,
          progress: Math.round(progress),
          updatedAt: new Date().toISOString()
        };
      }
      return project;
    });

    setState(prev => ({ ...prev, projects: updatedProjects }));
    await saveProjects(updatedProjects);
  }, [state.projects, saveProjects]);

  const deleteTask = useCallback(async (projectId: string, taskId: string) => {
    const updatedProjects = state.projects.map(project => {
      if (project.id === projectId) {
        const updatedTasks = project.tasks.filter(task => task.id !== taskId);
        const completedTasks = updatedTasks.filter(t => t.completed).length;
        const progress = updatedTasks.length > 0 ? (completedTasks / updatedTasks.length) * 100 : 0;
        
        return {
          ...project,
          tasks: updatedTasks,
          progress: Math.round(progress),
          updatedAt: new Date().toISOString()
        };
      }
      return project;
    });

    setState(prev => ({ ...prev, projects: updatedProjects }));
    await saveProjects(updatedProjects);
    toast.success('משימה נמחקה בהצלחה');
  }, [state.projects, saveProjects]);

  const selectProject = useCallback((projectId: string) => {
    setState(prev => ({ ...prev, selectedProjectId: projectId }));
  }, []);

  const getProjectById = useCallback((projectId: string) => {
    return state.projects.find(p => p.id === projectId);
  }, [state.projects]);

  return {
    ...state,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    selectProject,
    getProjectById
  };
};