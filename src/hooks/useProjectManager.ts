import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types';
import { ProjectService } from '@/services/ProjectService';
import { useToast } from './use-toast';

export const useProjectManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const projectService = ProjectService.getInstance();

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedProjects = await projectService.loadProjects();
      setProjects(loadedProjects);
      
      if (loadedProjects.length > 0) {
        toast({
          title: "מערכת נטענה בהצלחה",
          description: `נטענו ${loadedProjects.length} פרויקטים`,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בטעינת הפרויקטים';
      setError(errorMessage);
      toast({
        title: "שגיאה בטעינת הנתונים",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [projectService, toast]);

  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => {
    try {
      const newProject = await projectService.createProject(projectData);
      setProjects(prev => [newProject, ...prev]);
      
      toast({
        title: "פרויקט נוצר",
        description: `הפרויקט "${newProject.name}" נוצר בהצלחה`,
      });
      
      return newProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה ביצירת הפרויקט';
      toast({
        title: "שגיאה ביצירת פרויקט",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [projectService, toast]);

  const updateProject = useCallback(async (updatedProject: Project) => {
    try {
      await projectService.updateProject(updatedProject);
      setProjects(prev => prev.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      ));
      
      toast({
        title: "פרויקט עודכן",
        description: `הפרויקט "${updatedProject.name}" עודכן בהצלחה`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בעדכון הפרויקט';
      toast({
        title: "שגיאה בעדכון פרויקט",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [projectService, toast]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await projectService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      
      toast({
        title: "פרויקט נמחק",
        description: "הפרויקט נמחק בהצלחה מהמערכת",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה במחיקת הפרויקט';
      toast({
        title: "שגיאה במחיקת פרויקט",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [projectService, toast]);

  const addProjectTask = useCallback(async (projectId: string, title: string) => {
    try {
      await projectService.addProjectTask(projectId, title);
      const updatedProjects = await projectService.loadProjects();
      setProjects(updatedProjects);
      
      toast({
        title: "משימה נוספה",
        description: `המשימה "${title}" נוספה לפרויקט`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בהוספת משימה';
      toast({
        title: "שגיאה בהוספת משימה",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [projectService, toast]);

  const toggleProjectTask = useCallback(async (projectId: string, taskId: string) => {
    try {
      await projectService.toggleProjectTask(projectId, taskId);
      const updatedProjects = await projectService.loadProjects();
      setProjects(updatedProjects);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בעדכון משימה';
      toast({
        title: "שגיאה בעדכון משימה",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [projectService, toast]);

  const deleteProjectTask = useCallback(async (projectId: string, taskId: string) => {
    try {
      await projectService.deleteProjectTask(projectId, taskId);
      const updatedProjects = await projectService.loadProjects();
      setProjects(updatedProjects);
      
      toast({
        title: "משימה נמחקה",
        description: "המשימה נמחקה מהפרויקט",
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
  }, [projectService, toast]);

  // Load projects on hook initialization
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    addProjectTask,
    toggleProjectTask,
    deleteProjectTask,
    reloadProjects: loadProjects
  };
};