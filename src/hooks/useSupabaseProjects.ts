import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Project, ProjectTask } from '@/types';
import { logger } from '@/utils/logger';

export const useSupabaseProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not-started' | 'in-progress' | 'in-review' | 'completed' | 'on-hold'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'priority' | 'deadline'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { user } = useAuth();

  // Load projects from Supabase using secure role-based function
  const loadProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Use the secure function that filters data based on user role
      const { data, error } = await supabase.rpc('get_user_projects');

      if (error) throw error;

      const formattedProjects: Project[] = (data || []).map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        // Only include client data if user has access (will be null for regular members)
        clientName: project.client_name || '',
        phone1: project.phone1 || '',
        phone2: project.phone2 || '',
        whatsapp1: project.whatsapp1 || '',
        whatsapp2: project.whatsapp2 || '',
        email: project.email || '',
        folderPath: project.folder_path || '',
        icloudLink: project.icloud_link || '',
        status: project.status as Project['status'],
        priority: project.priority as Project['priority'],
        // Only include financial data if user has access
        price: Number(project.price) || 0,
        currency: project.currency as Project['currency'],
        paid: project.paid || false,
        completed: project.completed || false,
        deadline: project.deadline ? new Date(project.deadline) : undefined,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
        tasks: [], // Load tasks separately to maintain security
        subtasks: [] // Will be added later if needed
      }));

      // Load project tasks separately for each project
      for (const project of formattedProjects) {
        const { data: tasksData, error: tasksError } = await supabase
          .from('project_tasks')
          .select('id, title, completed, created_at, completed_at')
          .eq('project_id', project.id)
          .order('created_at', { ascending: false });

        if (!tasksError && tasksData) {
          project.tasks = tasksData.map((task: any): ProjectTask => ({
            id: task.id,
            title: task.title,
            completed: task.completed,
            createdAt: new Date(task.created_at),
            completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
          }));
        }
      }

      setProjects(formattedProjects);
    } catch (error: any) {
      logger.error('Error loading projects:', error);
      toast.error('שגיאה בטעינת הפרויקטים');
    } finally {
      setLoading(false);
    }
  };

  // Create new project
  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'subtasks'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          description: projectData.description,
          client_name: projectData.clientName,
          phone1: projectData.phone1,
          phone2: projectData.phone2,
          whatsapp1: projectData.whatsapp1,
          whatsapp2: projectData.whatsapp2,
          email: projectData.email,
          folder_path: projectData.folderPath,
          icloud_link: projectData.icloudLink,
          status: projectData.status,
          priority: projectData.priority,
          price: projectData.price,
          currency: projectData.currency,
          paid: projectData.paid,
          completed: projectData.completed,
          deadline: projectData.deadline?.toISOString(),
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('הפרויקט נוצר בהצלחה');
      loadProjects(); // Reload projects
      return data;
    } catch (error: any) {
      logger.error('Error creating project:', error);
      toast.error('שגיאה ביצירת הפרויקט');
    }
  };

  // Update project
  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: updates.name,
          description: updates.description,
          client_name: updates.clientName,
          phone1: updates.phone1,
          phone2: updates.phone2,
          whatsapp1: updates.whatsapp1,
          whatsapp2: updates.whatsapp2,
          email: updates.email,
          folder_path: updates.folderPath,
          icloud_link: updates.icloudLink,
          status: updates.status,
          priority: updates.priority,
          price: updates.price,
          currency: updates.currency,
          paid: updates.paid,
          completed: updates.completed,
          deadline: updates.deadline?.toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('הפרויקט עודכן בהצלחה');
      loadProjects(); // Reload projects
    } catch (error: any) {
      logger.error('Error updating project:', error);
      toast.error('שגיאה בעדכון הפרויקט');
    }
  };

  // Delete project
  const deleteProject = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הפרויקט?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('הפרויקט נמחק בהצלחה');
      loadProjects(); // Reload projects
    } catch (error: any) {
      logger.error('Error deleting project:', error);
      toast.error('שגיאה במחיקת הפרויקט');
    }
  };

  // Add task to project
  const addTaskToProject = async (projectId: string, taskTitle: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('project_tasks')
        .insert({
          project_id: projectId,
          title: taskTitle,
          created_by: user.id
        });

      if (error) throw error;

      toast.success('המשימה נוספה בהצלחה');
      loadProjects(); // Reload projects
    } catch (error: any) {
      logger.error('Error adding task:', error);
      toast.error('שגיאה בהוספת המשימה');
    }
  };

  // Update task
  const updateTask = async (taskId: string, updates: { completed?: boolean; title?: string }) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({
          ...updates,
          completed_at: updates.completed ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;

      loadProjects(); // Reload projects
    } catch (error: any) {
      logger.error('Error updating task:', error);
      toast.error('שגיאה בעדכון המשימה');
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast.success('המשימה נמחקה בהצלחה');
      loadProjects(); // Reload projects
    } catch (error: any) {
      logger.error('Error deleting task:', error);
      toast.error('שגיאה במחיקת המשימה');
    }
  };

  // Filtered and sorted projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      
      return matchesSearch && matchesPriority && matchesStatus;
    });

    // Sort projects
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'deadline':
          aValue = a.deadline ? a.deadline.getTime() : 0;
          bValue = b.deadline ? b.deadline.getTime() : 0;
          break;
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [projects, searchTerm, priorityFilter, statusFilter, sortBy, sortOrder]);

  // Load projects on user change
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        () => loadProjects()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks'
        },
        () => loadProjects()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    projects: filteredAndSortedProjects,
    allProjects: projects,
    loading,
    searchTerm,
    setSearchTerm,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    createProject,
    updateProject,
    deleteProject,
    addTaskToProject,
    updateTask,
    deleteTask,
    refreshProjects: loadProjects
  };
};