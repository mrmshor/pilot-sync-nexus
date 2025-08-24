import { useState, useCallback, useMemo, useEffect } from 'react';
import { Project } from '@/types';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'enhanced_project_management_data';

// Debounce hook for performance
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const useOptimizedProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'status' | 'createdAt' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounced search for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem(STORAGE_KEY);
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        const projectsWithDates = parsed.map((project: any) => ({
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
          tasks: project.tasks?.map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            completedAt: task.completedAt ? new Date(task.completedAt) : undefined
          })) || [],
          subtasks: project.subtasks?.map((task: any) => ({
            ...task,
            createdAt: task.createdAt ? new Date(task.createdAt) : new Date()
          })) || []
        }));
        setProjects(projectsWithDates);
      } catch (error) {
        console.error('Error loading projects:', error);
        toast({
          title: "שגיאה בטעינת נתונים",
          description: "לא ניתן לטעון את הפרויקטים השמורים",
          variant: "destructive"
        });
      }
    }
    setLoading(false);
  }, [toast]);

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects, loading]);

  // Memoized filtered and sorted projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchLower) ||
        project.clientName.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    // Apply status filter
    if (statusFilter === 'completed') {
      filtered = filtered.filter(project => project.completed);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(project => !project.completed);
    }

    // Sort projects
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'updatedAt':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        default:
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projects, debouncedSearchTerm, priorityFilter, statusFilter, sortBy, sortOrder]);

  const createProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'subtasks'>) => {
    try {
      const newProject: Project = {
        ...projectData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        tasks: [],
        subtasks: []
      };

      setProjects(prev => [newProject, ...prev]);
      
      toast({
        title: "פרויקט נוצר בהצלחה",
        description: `פרויקט "${newProject.name}" נוסף למערכת`,
      });

      return newProject;
    } catch (error) {
      console.error('Error in createProject:', error);
      toast({
        title: "שגיאה ביצירת פרויקט",
        description: "לא ניתן ליצור את הפרויקט",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project =>
      project.id === id
        ? { ...project, ...updates, updatedAt: new Date() }
        : project
    ));

    toast({
      title: "פרויקט עודכן",
      description: "הפרויקט עודכן בהצלחה",
    });
  }, [toast]);

  const deleteProject = useCallback((id: string) => {
    const project = projects.find(p => p.id === id);
    if (project && window.confirm(`האם אתה בטוח שברצונך למחוק את הפרויקט "${project.name}"?`)) {
      setProjects(prev => prev.filter(project => project.id !== id));
      
      toast({
        title: "פרויקט נמחק",
        description: `הפרויקט "${project.name}" נמחק מהמערכת`,
      });
    }
  }, [projects, toast]);

  const getProjectStats = useCallback(() => {
    const total = projects.length;
    const completed = projects.filter(p => p.completed).length;
    const inProgress = projects.filter(p => p.status === 'in-progress').length;
    const paid = projects.filter(p => p.paid).length;
    const unpaid = projects.filter(p => !p.paid).length;

    const totalRevenue = projects.reduce((sum, p) => sum + (p.paid ? p.price : 0), 0);
    const pendingRevenue = projects.reduce((sum, p) => sum + (p.paid ? 0 : p.price), 0);

    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const paymentRate = (totalRevenue + pendingRevenue) > 0 ? (totalRevenue / (totalRevenue + pendingRevenue)) * 100 : 0;

    return {
      total,
      completed,
      inProgress,
      paid,
      unpaid,
      totalRevenue,
      pendingRevenue,
      completionRate,
      paymentRate
    };
  }, [projects]);

  const exportToCSV = useCallback(() => {
    try {
      const headers = [
        'שם פרויקט', 'תיאור', 'שם לקוח', 'טלפון ראשי', 'טלפון נוסף',
        'וואטסאפ ראשי', 'וואטסאפ נוסף', 'אימייל', 'תיקייה מקומית', 'קישור iCloud',
        'סטטוס', 'עדיפות', 'מחיר', 'מטבע', 'שולם', 'הושלם',
        'תאריך יצירה', 'תאריך עדכון', 'סה"כ משימות', 'משימות הושלמו', 'אחוז השלמה'
      ];

      const csvData = projects.map(project => [
        project.name, project.description, project.clientName,
        project.phone1, project.phone2 || '', project.whatsapp1, project.whatsapp2 || '',
        project.email, project.folderPath || '', project.icloudLink || '',
        project.status, project.priority, project.price, project.currency,
        project.paid ? 'כן' : 'לא', project.completed ? 'כן' : 'לא',
        project.createdAt.toLocaleDateString('he-IL'), project.updatedAt.toLocaleDateString('he-IL'),
        project.tasks.length, project.tasks.filter(t => t.completed).length,
        project.tasks.length > 0 ? `${((project.tasks.filter(t => t.completed).length / project.tasks.length) * 100).toFixed(1)}%` : '0%'
      ]);

      const csv = [headers, ...csvData]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `פרויקטים-מפורט-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "ייצוא הושלם",
        description: "הנתונים יוצאו בהצלחה לקובץ CSV",
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "שגיאה בייצוא",
        description: "לא ניתן לייצא את הנתונים",
        variant: "destructive"
      });
    }
  }, [projects, toast]);

  return {
    projects: filteredAndSortedProjects,
    allProjects: projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    getProjectStats,
    exportToCSV,
    searchTerm,
    setSearchTerm,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  };
};