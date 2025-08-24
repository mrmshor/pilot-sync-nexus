import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useDebounce, useOptimizedData } from '@/hooks/usePerformanceOptimizations';
import { MemoryManager, debounce } from '@/utils/memoryManager';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, Edit, Trash2, User, PhoneCall, MessageCircle, Mail, 
  FolderOpen, CheckCircle2, CreditCard, Plus, X, Clock, Filter,
  BarChart3, TrendingUp, Users, DollarSign, Calendar, Settings,
  Download, Bug, Zap, Database, Activity, CheckSquare, Target,
  FileText, ArrowUpDown, ListTodo, ChevronDown, ChevronUp, List, AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Project, ProjectTask, QuickTask } from '@/types';
import { ContactService, FolderService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { CreateProjectModal } from './CreateProjectModal';
import { StatusDropdown } from './StatusDropdown';
import { PriorityDropdown } from './PriorityDropdown';
import { TasksSidebar } from './TasksSidebar';
import { ProjectTasksModal } from './ProjectTasksModal';
import { ProjectEditModal } from './ProjectEditModal';
import { useProjectStore } from '@/store/useProjectStore';
import { ProjectsSidebar } from './ProjectsSidebar';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis } from 'recharts';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { he } from 'date-fns/locale';

export const ProjectManagementApp = () => {
  // Use the project store instead of local state
  const { 
    projects, 
    addProject, 
    updateProject, 
    deleteProject,
    tasks,
    addTask: addProjectTask,
    updateTask: updateProjectTask,
    deleteTask: deleteProjectTask,
    refreshData: refreshStoreData,
    initializeSupabase,
    isSyncing,
    lastSyncError
  } = useProjectStore();
  
  const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Debounced search
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'status' | 'createdAt' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [preserveScroll, setPreserveScroll] = useState<number | null>(null);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);
  const [showMobileProjectsSidebar, setShowMobileProjectsSidebar] = useState(false);
  const [showMobileTasksSidebar, setShowMobileTasksSidebar] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const mobileBarTouchStartY = useRef(0);
  const [mobileBarHidden, setMobileBarHidden] = useState(false);

  // Load custom logo on startup
  useEffect(() => {
    const loadCustomLogo = async () => {
      try {
        const savedLogo = localStorage.getItem('customLogo');
        if (savedLogo) {
          setCustomLogo(savedLogo);
        }
      } catch (error) {
        console.log('Logo loading failed:', error);
        console.log('No custom logo found, using default');
      }
    };
    
    loadCustomLogo();
  }, []);

  // Update app title when logo changes
  useEffect(() => {
    if (customLogo) {
      document.title = 'מערכת ניהול פרויקטים Pro • לוגו מותאם';
      console.log('✅ Custom logo loaded');
    } else {
      document.title = 'מערכת ניהול פרויקטים Pro';
    }
  }, [customLogo]);
  
  // Mobile scroll header control
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isMobile = window.innerWidth < 768;
      
      if (!isMobile) {
        setHeaderVisible(true);
        return;
      }
      
      // Header appears faster when scrolling up or near top
      if (currentScrollY < lastScrollY || currentScrollY < 30) {
        setHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHeaderVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Mobile sidebar event listeners and swipe gestures
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!e.changedTouches.length) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = endY - startY;
      
      // Only on mobile/tablet
      if (window.innerWidth >= 1280) return;
      
      // Ensure horizontal swipe (not vertical scroll)
      if (Math.abs(diffY) > Math.abs(diffX)) return;
      if (Math.abs(diffX) < 50) return;
      
      // Swipe from right edge (tasks sidebar)
      if (startX > window.innerWidth - 50 && diffX < -50) {
        setShowMobileTasksSidebar(true);
      }
      
      // Swipe from left edge (projects sidebar)  
      if (startX < 50 && diffX > 50) {
        setShowMobileProjectsSidebar(true);
      }
    };
    
    const handleCloseMobileTasksSidebar = () => {
      setShowMobileTasksSidebar(false);
    };
    
    const handleCloseMobileProjectsSidebar = () => {
      setShowMobileProjectsSidebar(false);
    };

    // Touch events for swipe gestures
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Custom events for closing sidebars
    window.addEventListener('closeMobileTasksSidebar', handleCloseMobileTasksSidebar);
    window.addEventListener('closeMobileProjectsSidebar', handleCloseMobileProjectsSidebar);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('closeMobileTasksSidebar', handleCloseMobileTasksSidebar);
      window.removeEventListener('closeMobileProjectsSidebar', handleCloseMobileProjectsSidebar);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // CMD+N for new project
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault();
        setShowCreateModal(true);
      }
      // CMD+E for export
      if ((event.metaKey || event.ctrlKey) && event.key === 'e') {
        event.preventDefault();
        handleExportCSV();
      }
      // CMD+1 for dashboard
      if ((event.metaKey || event.ctrlKey) && event.key === '1') {
        event.preventDefault();
        setActiveTab('dashboard');
      }
      // CMD+2 for projects
      if ((event.metaKey || event.ctrlKey) && event.key === '2') {
        event.preventDefault();
        setActiveTab('projects');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // שמירת מיקום גלילה
  const saveScrollPosition = () => {
    setPreserveScroll(window.scrollY);
  };

  // שחזור מיקום גלילה
  useEffect(() => {
    if (preserveScroll !== null) {
      const timeoutId = setTimeout(() => {
        window.scrollTo(0, preserveScroll);
        setPreserveScroll(null);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [preserveScroll, projects]);

  // Data is now loaded from the store, no need for sample data effect

  // Refresh function to sync data from server
  const handleRefreshData = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      // 1) ריענון נתונים מהחנות (למשימות/מידע שמסתנכרן)
      await refreshStoreData();

      // 2) טוסט שמייד נעלם במובייל
      const isMobile = window.innerWidth < 768;
      toast({
        title: lastSyncError ? "שגיאת סנכרון" : "הנתונים עודכנו", 
        description: lastSyncError || "הסנכרון הושלם",
        variant: lastSyncError ? "destructive" : "default",
        duration: isMobile ? 1 : 1500,
      });

      // 3) ריענון אפליקציה עם Cache Bust במובייל כדי לראות שינויים מהדסקטופ
      if (isMobile) {
        setTimeout(() => {
          const url = new URL(window.location.href);
          url.searchParams.set('ts', Date.now().toString());
          window.location.replace(url.toString());
        }, 50);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "שגיאה ברענון",
        description: "לא הצלחנו לרענן את הנתונים, נסה שוב",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "שגיאה",
          description: "גודל הקובץ גדול מדי. אנא בחר קובץ קטן מ-2MB",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        setCustomLogo(result);
        
        try {
          localStorage.setItem('customLogo', result);
          toast({
            title: "הלוגו הועלה בהצלחה",
            description: "הלוגו החדש נשמר במערכת",
          });
        } catch (error) {
          console.error('Error saving logo:', error);
          toast({
            title: "שגיאה בשמירת הלוגו",
            description: "אנא נסה שוב",
            variant: "destructive",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = async () => {
    setCustomLogo(null);
    
    try {
      localStorage.removeItem('customLogo');
    } catch (error) {
      console.error('Error removing logo:', error);
    }
    
    toast({
      title: "הלוגו הוסר",
      description: "חזרנו ללוגו הברירת מחדל",
    });
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter(p => p.completed).length;
    const inProgress = projects.filter(p => p.status === 'in-progress').length;
    const paid = projects.filter(p => p.paid).length;
    const unpaid = projects.filter(p => !p.paid).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    const totalRevenue = projects.reduce((sum, p) => sum + (p.paid ? p.price : 0), 0);
    const pendingRevenue = projects.reduce((sum, p) => sum + (p.paid ? 0 : p.price), 0);
    const paymentRate = (totalRevenue + pendingRevenue) > 0 ? (totalRevenue / (totalRevenue + pendingRevenue)) * 100 : 0;

    return {
      total,
      completed,
      inProgress,
      paid,
      unpaid,
      completionRate,
      totalRevenue,
      pendingRevenue,
      paymentRate
    };
  }, [projects]);

  // Charts data based on actual project data
  const statusData = useMemo(() => {
    const statuses = [
      { name: 'בעבודה', key: 'in-progress', fill: '#3b82f6' },
      { name: 'בהמתנה', key: 'on-hold', fill: '#6b7280' }, 
      { name: 'הושלם', key: 'completed', fill: '#10b981' },
    ] as const;
    return statuses.map(status => ({
      name: status.name,
      value: projects.filter(p => p.status === status.key).length,
      fill: status.fill,
    }));
  }, [projects]);

  const priorityData = useMemo(() => {
    const priorities = [
      { name: 'גבוהה', key: 'high', fill: '#ef4444' },
      { name: 'בינונית', key: 'medium', fill: '#f59e0b' }, 
      { name: 'נמוכה', key: 'low', fill: '#10b981' },
    ] as const;
    return priorities.map(priority => ({
      name: priority.name,
      value: projects.filter(p => p.priority === priority.key).length,
      fill: priority.fill,
    }));
  }, [projects]);

  // Task completion data by week
  const weeklyData = useMemo(() => {
    // Get all project tasks
    const allTasks = projects.flatMap(p => p.tasks.map(t => ({
      ...t,
      projectId: p.id,
      deadline: p.deadline,
    })));
    
    const days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
    
    return days.map((day, index) => {
      // Filter tasks created on this day of week
      const dayTasks = allTasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.getDay() === index;
      });
      
      return {
        day,
        הושלמו: dayTasks.filter(t => t.completed).length,
        פעילות: dayTasks.filter(t => !t.completed).length,
      };
    });
  }, [projects]);

  const urgentHighCount = useMemo(() =>
    projects.filter(p => p.priority === 'high' && !p.completed).length + 
    projects.flatMap(p => p.tasks).filter(t => !t.completed).length +
    quickTasks.filter(t => !t.completed).length
  , [projects, quickTasks]);

  const totalTasksCount = useMemo(() => projects.reduce((sum,p)=> sum + p.tasks.length, 0) + quickTasks.length, [projects, quickTasks]);
  const completedTasksCount = useMemo(() => projects.reduce((sum,p)=> sum + p.tasks.filter(t=>t.completed).length, 0) + quickTasks.filter(t=>t.completed).length, [projects, quickTasks]);
  const recentProjects = useMemo(() => [...projects].sort((a,b)=> new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3), [projects]);
  const recentTasks = useMemo(() => {
    // Get all project tasks that are not completed, sorted by creation date
    const allProjectTasks = projects.flatMap(project => 
      project.tasks
        .filter(task => !task.completed)
        .map(task => ({
          ...task,
          projectName: project.name
        }))
    );
    return allProjectTasks
      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [projects]);

  const getPriorityColor = (priority: 'low'|'medium'|'high') => priority === 'high' ? 'text-red-600 bg-red-100 border border-red-200' : priority === 'medium' ? 'text-amber-600 bg-amber-100 border border-amber-200' : 'text-green-600 bg-green-100 border border-green-200';
  const formatStatusHe = (status: string) => status === 'in-progress' ? 'בעבודה' : status === 'on-hold' ? 'בהמתנה' : status === 'completed' ? 'הושלם' : status;
  const toTime = (d: any) => {
    const dt = d instanceof Date ? d : new Date(d);
    const t = dt.getTime();
    return Number.isNaN(t) ? 0 : t;
  };

  // Optimized filter and sort projects with debounced search
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = debouncedSearchTerm === '' || 
        project.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        project.clientName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
      
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      
      return matchesSearch && matchesPriority && matchesStatus;
    });

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
          aValue = toTime(a.createdAt);
          bValue = toTime(b.createdAt);
          break;
        case 'updatedAt':
          aValue = toTime(a.updatedAt);
          bValue = toTime(b.updatedAt);
          break;
        default:
          aValue = toTime(a.updatedAt);
          bValue = toTime(b.updatedAt);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projects, debouncedSearchTerm, priorityFilter, statusFilter, sortBy, sortOrder]);

  // Optimized data handling for large datasets
  const { visibleData: visibleProjects } = useOptimizedData(filteredAndSortedProjects, 50);

  // Contact handlers
  const handleContactClick = async (type: 'phone' | 'whatsapp' | 'email', value: string) => {
    if (!value) {
      toast({
        title: "שגיאה",
        description: "לא נמצא מידע ליצירת קשר",
        variant: "destructive",
      });
      return;
    }
    
    try {
      switch (type) {
        case 'phone':
          await ContactService.makePhoneCall(value);
          toast({
            title: "התקשרות",
            description: `מתקשר אל ${value}`,
          });
          break;
        case 'whatsapp':
          await ContactService.openWhatsApp(value);
          toast({
            title: "וואטסאפ",
            description: `פותח צ'אט עם ${value}`,
          });
          break;
        case 'email':
          await ContactService.sendEmail(value);
          toast({
            title: "אימייל",
            description: `פותח אימייל אל ${value}`,
          });
          break;
      }
    } catch (error: any) {
      console.error(`Error handling ${type} contact:`, error);
      toast({
        title: "שגיאה",
        description: error.message || `שגיאה בפתיחת ${type === 'whatsapp' ? 'וואטסאפ' : type === 'email' ? 'אימייל' : 'טלפון'}`,
        variant: "destructive",
      });
    }
  };

  // Native folder opening for Tauri desktop app
  const openFolder = async (folderPath?: string, icloudLink?: string) => {
    if (!folderPath && !icloudLink) {
      toast({
        title: "שגיאה",
        description: "לא נמצא נתיב תיקיה או קישור לפתיחה",
        variant: "destructive"
      });
      return;
    }

    try {
      if (folderPath || icloudLink) {
        // Use native Tauri command to open folder
        await FolderService.openFolder(folderPath || '', icloudLink);
        toast({
          title: "נפתח בהצלחה",
          description: folderPath ? `פותח תיקיה: ${folderPath}` : `פותח קישור: ${icloudLink}`,
        });
      }
    } catch (error: any) {
      console.error('Error opening folder:', error);
      toast({
        title: "שגיאה",
        description: error.message || "לא ניתן לפתוח את התיקייה או הקישור",
        variant: "destructive"
      });
    }
  };

  const handleExportCSV = () => {
    try {
      if (projects.length === 0) {
        toast({
          title: "אין נתונים לייצוא",
          description: "יש ליצור פרויקטים לפני הייצוא",
          variant: "destructive"
        });
        return;
      }

      const headers = [
        'שם פרויקט', 'תיאור', 'שם לקוח', 'טלפון ראשי', 'טלפון נוסף',
        'וואטסאפ ראשי', 'וואטסאפ נוסף', 'אימייל', 'תיקייה מקומית', 'קישור iCloud',
        'סטטוס', 'עדיפות', 'מחיר', 'מטבע', 'שולם', 'הושלם',
        'תאריך יצירה', 'תאריך עדכון', 'סה"כ משימות', 'משימות הושלמו', 'אחוז השלמה'
      ];

      const csvData = projects.map(project => [
        project.name || '', 
        project.description || '', 
        project.clientName || '',
        project.phone1 || '', 
        project.phone2 || '', 
        project.whatsapp1 || '', 
        project.whatsapp2 || '',
        project.email || '', 
        project.folderPath || '', 
        project.icloudLink || '',
        project.status || '', 
        project.priority || '', 
        project.price || 0, 
        project.currency || 'ILS',
        project.paid ? 'כן' : 'לא', 
        project.completed ? 'כן' : 'לא',
        project.createdAt.toLocaleDateString('he-IL'), 
        project.updatedAt.toLocaleDateString('he-IL'),
        project.tasks.length, 
        project.tasks.filter(t => t.completed).length,
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
        title: "ייצוא הושלם בהצלחה",
        description: `${projects.length} פרויקטים יוצאו לקובץ CSV`,
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "שגיאה בייצוא",
        description: "לא ניתן לייצא את הנתונים. נסה שוב.",
        variant: "destructive"
      });
    }
  };

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'subtasks'>) => {
    try {
      await addProject(projectData);
      setShowCreateModal(false);
      toast({
        title: "פרויקט נוצר בהצלחה",
        description: `פרויקט "${projectData.name}" נוסף למערכת`,
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "שגיאה ביצירת פרויקט",
        description: "לא ניתן ליצור פרויקט חדש כרגע. נסה שוב.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProject = (updatedProject: Project) => {
    saveScrollPosition();
    updateProject(updatedProject.id, updatedProject);
    toast({
      title: "פרויקט עודכן בהצלחה",
      description: `הפרויקט "${updatedProject.name}" עודכן במערכת`,
    });
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && window.confirm(`האם אתה בטוח שברצונך למחוק את הפרויקט "${project.name}"?`)) {
      deleteProject(projectId);
      toast({
        title: "פרויקט נמחק",
        description: `הפרויקט "${project.name}" נמחק מהמערכת`,
      });
    }
  };

  // Quick Tasks handlers
  const handleAddQuickTask = (title: string) => {
    const newTask: QuickTask = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date()
    };
    setQuickTasks(prev => [newTask, ...prev]);
  };

  const handleToggleQuickTask = (taskId: string) => {
    setQuickTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date() : undefined
          }
        : task
    ));
  };

  const handleDeleteQuickTask = (taskId: string) => {
    setQuickTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Project Tasks handlers
  const handleAddProjectTask = (projectId: string, title: string) => {
    saveScrollPosition();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const newTask: ProjectTask = {
        id: Date.now().toString(),
        title,
        completed: false,
        createdAt: new Date()
      };
      
      updateProject(projectId, {
        tasks: [newTask, ...project.tasks],
        updatedAt: new Date()
      });
    }
  };

  const handleToggleProjectTask = (projectId: string, taskId: string) => {
    saveScrollPosition();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const updatedTasks = project.tasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              completed: !task.completed,
              completedAt: !task.completed ? new Date() : undefined
            }
          : task
      );
      updateProject(projectId, {
        tasks: updatedTasks,
        updatedAt: new Date()
      });
    }
  };

  const handleDeleteProjectTask = (projectId: string, taskId: string) => {
    saveScrollPosition();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const updatedTasks = project.tasks.filter(task => task.id !== taskId);
      updateProject(projectId, {
        tasks: updatedTasks,
        updatedAt: new Date()
      });
    }
  };

  // Status and Priority handlers for external buttons
  const updateProjectStatus = (projectId: string, newStatus: Project['status']) => {
    saveScrollPosition();
    updateProject(projectId, { status: newStatus });
    toast({
      title: "סטטוס עודכן",
      description: "סטטוס הפרויקט עודכן בהצלחה",
    });
  };

  const updateProjectPriority = (projectId: string, newPriority: Project['priority']) => {
    saveScrollPosition();
    updateProject(projectId, { priority: newPriority });
    toast({
      title: "עדיפות עודכנה",
      description: "עדיפות הפרויקט עודכנה בהצלחה",
    });
  };

  const toggleProjectPaid = (projectId: string) => {
    saveScrollPosition();
    updateProject(projectId, { paid: !projects.find(p => p.id === projectId)?.paid });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'in-review': return 'outline';
      case 'on-hold': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'ILS': return '₪';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'CAD': return 'CA$';
      default: return currency;
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setShowTasksModal(true);
    setShowProjectsDropdown(false);
  };

  const handleSidebarProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('projects');
    
    // גלילה לפרויקט הנבחר לאחר מעבר לטאב
    setTimeout(() => {
      const projectElement = document.getElementById(`project-${project.id}`);
      if (projectElement) {
        projectElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // הוספת אפקט הבהוב
        projectElement.classList.add('ring-4', 'ring-blue-500/50', 'shadow-2xl');
        setTimeout(() => {
          projectElement.classList.remove('ring-4', 'ring-blue-500/50', 'shadow-2xl');
        }, 3000);
      }
    }, 100);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex w-full ios-safe-area" dir="rtl">
        {/* Desktop Tasks Sidebar - Right Side */}
        <div className="hidden xl:block fixed right-0 top-0 h-full w-80 z-10">
          <TasksSidebar />
        </div>

        {/* Main Content - Center */}
        <div className="flex-1 min-h-screen xl:mx-80 flex flex-col">
          {/* Mobile Header - Collapsible */}
          <div className={`xl:hidden sticky top-0 z-30 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 border-b border-white/20 shadow-sm transition-transform duration-300 ${
            headerVisible ? 'translate-y-0' : '-translate-y-full'
          }`}>
            <div className="container mx-auto px-4 py-3 ios-safe-top">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileProjectsSidebar(true)}
                  className="p-3 hover:bg-white/20 rounded-lg min-h-[44px] min-w-[44px] mobile-touch-target"
                >
                  <FolderOpen className="h-6 w-6" />
                  <span className="sr-only">פרויקטים</span>
                </Button>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                    {customLogo ? (
                      <img src={customLogo} alt="לוגו" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-sm text-white">🚀</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-primary">ניהול פרויקטים</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileTasksSidebar(true)}
                  className="p-3 hover:bg-white/20 rounded-lg min-h-[44px] min-w-[44px] mobile-touch-target"
                >
                  <CheckSquare className="h-6 w-6" />
                  <span className="sr-only">משימות</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Header and Navigation */}
          <div className="hidden xl:block sticky top-0 z-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 border-b border-white/20 shadow-sm">
            <div className="container mx-auto px-4 py-6 md:py-8 lg:py-8">
              {/* Header */}
              <header className="text-center mb-6 md:mb-8 relative">
                
                <div className="flex items-center justify-center gap-4 md:gap-6 mb-4 pt-16 md:pt-20 xl:pt-0">
                  <div className="relative group">
                    <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 gradient-primary rounded-2xl md:rounded-3xl flex items-center justify-center shadow-macos overflow-hidden">
                      {customLogo ? (
                        <img 
                          src={customLogo} 
                          alt="לוגו מותאם אישית" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl md:text-3xl lg:text-4xl">🚀</span>
                      )}
                    </div>
                    
                    {/* Logo upload overlay */}
                    <div className="absolute inset-0 bg-black/60 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <Plus className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    {/* Remove logo button */}
                    {customLogo && (
                      <button
                        onClick={removeLogo}
                        className="absolute -top-1 -right-1 w-6 h-6 md:w-7 md:h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors min-h-[44px] min-w-[44px]"
                      >
                        <X className="h-3 w-3 md:h-4 md:w-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent macos-text leading-tight">
                      מערכת ניהול פרויקטים Pro
                    </h1>
                  </div>
                </div>
              </header>

              {/* Navigation */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 md:gap-6">
                {/* Export Button - Left Side */}
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  className="gap-2 w-full md:w-auto min-h-[44px] px-4 md:px-6"
                  title="ייצוא נתונים לקובץ CSV (⌘E)"
                >
                  <Download className="w-4 h-4 md:w-5 md:h-5" />
                  ייצוא CSV
                </Button>

                {/* Navigation Tabs - Center */}
                <div className="glass p-1.5 rounded-xl shadow-medium w-full md:w-auto">
                  <div className="flex flex-col sm:flex-row">
                    <Button
                      onClick={() => setActiveTab('dashboard')}
                      variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                      className="px-4 md:px-6 py-3 md:py-4 rounded-lg text-sm md:text-base font-medium w-full sm:w-auto min-h-[44px]"
                      title="לוח בקרה Pro (⌘1)"
                    >
                      <BarChart3 className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                      לוח בקרה Pro
                    </Button>
                    <Button
                      onClick={() => setActiveTab('projects')}
                      variant={activeTab === 'projects' ? 'default' : 'ghost'}
                      className="px-4 md:px-6 py-3 md:py-4 rounded-lg text-sm md:text-base font-medium w-full sm:w-auto min-h-[44px]"
                      title="פרויקטים מתקדם (⌘2)"
                    >
                      <Users className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                      פרויקטים מתקדם
                    </Button>
                  </div>
                </div>

                {/* Empty space for balance - hidden on mobile/tablet */}
                <div className="hidden lg:block w-24"></div>
              </div>

              {/* Search and Filters - Only visible in projects tab */}
              {activeTab === 'projects' && (
                <div className="border-t border-white/20 pt-4">
                  <div className="container mx-auto px-4">
                    <Card className="card-macos">
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-4">
                          {/* Search Bar */}
                          <div className="relative w-full max-w-md mx-auto">
                            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="חיפוש פרויקטים..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pr-10"
                            />
                          </div>
                          
                          {/* Filters and Actions - Centered */}
                          <div className="flex flex-wrap items-center justify-center gap-3">
                            <select
                              value={priorityFilter}
                              onChange={(e) => setPriorityFilter(e.target.value)}
                              className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 min-w-[140px]"
                            >
                              <option value="all">כל העדיפויות</option>
                              <option value="high">עדיפות גבוהה</option>
                              <option value="medium">עדיפות בינונית</option>
                              <option value="low">עדיפות נמוכה</option>
                            </select>
                            
                            <select
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                              className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 min-w-[140px]"
                            >
                              <option value="all">כל הסטטוסים</option>
                              <option value="not-started">לא התחיל</option>
                              <option value="in-progress">בתהליך</option>
                              <option value="in-review">בבדיקה</option>
                              <option value="completed">הושלם</option>
                              <option value="on-hold">מושהה</option>
                            </select>
                            
                            <select
                              value={`${sortBy}-${sortOrder}`}
                              onChange={(e) => {
                                const [field, order] = e.target.value.split('-');
                                setSortBy(field as any);
                                setSortOrder(order as any);
                              }}
                              className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 min-w-[140px]"
                            >
                              <option value="updatedAt-desc">עדכון אחרון ↓</option>
                              <option value="updatedAt-asc">עדכון אחרון ↑</option>
                              <option value="createdAt-desc">תאריך יצירה ↓</option>
                              <option value="createdAt-asc">תאריך יצירה ↑</option>
                              <option value="name-asc">שם א-ת</option>
                              <option value="name-desc">שם ת-א</option>
                              <option value="priority-desc">עדיפות ↓</option>
                              <option value="priority-asc">עדיפות ↑</option>
                            </select>
                            
                            <Button 
                              onClick={() => setShowCreateModal(true)} 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6"
                              title="צור פרויקט חדש (⌘N)"
                            >
                              <Plus className="w-4 h-4 ml-2" />
                              פרויקט חדש
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6 pb-16 md:pb-6">{/* Reduced padding on mobile, more bottom space */}
              {/* Content */}
              <main>
                {activeTab === 'dashboard' && (
                  <div className="space-y-8 animate-fade-in">
                    {/* כותרת מעוצבת */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-blue-50 to-cyan-50 p-8 border border-primary/10 animate-scale-in min-h-[180px]">
                      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                      <div className="relative">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="relative hover-scale">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                              <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                          </div>
                          <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-cyan-600 bg-clip-text text-transparent story-link">
                              מערכת ניהול פרויקטים Pro
                            </h1>
                            <p className="text-lg text-muted-foreground mt-1">
                              סקירה כללית של כל הפעילות שלך • {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: he })}
                            </p>
                          </div>
                        </div>
                        
                        {/* נתון מהיר */}
                        <div className="flex items-center gap-6 mt-6">
                          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/20 shadow-sm hover-scale">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-green-700">מערכת פעילה</span>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/20 shadow-sm hover-scale">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">התקדמות: {Math.round(stats.completionRate)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* סטטיסטיקות מעוצבות */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        {
                          title: 'סה"כ פרויקטים',
                          value: stats.total,
                          subValue: `${stats.inProgress} פעילים`,
                          icon: FolderOpen,
                          color: 'from-blue-500 to-cyan-500',
                          bgColor: 'from-blue-50 to-cyan-50',
                          progress: stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0,
                        },
                        {
                          title: 'שיעור השלמה',
                          value: `${Math.round(stats.completionRate)}%`,
                          subValue: `${stats.completed} מתוך ${stats.total}`,
                          icon: Target,
                          color: 'from-green-500 to-emerald-500',
                          bgColor: 'from-green-50 to-emerald-50',
                          progress: stats.completionRate,
                        },
                        {
                          title: 'משימות דחופות',
                          value: urgentHighCount,
                          subValue: 'עדיפות גבוהה',
                          icon: AlertCircle,
                          color: 'from-red-500 to-pink-500',
                          bgColor: 'from-red-50 to-pink-50',
                          progress: urgentHighCount > 0 ? 100 : 0,
                          alert: urgentHighCount > 0,
                        },
                        {
                          title: 'סה"כ משימות',
                          value: totalTasksCount,
                          subValue: `${completedTasksCount} הושלמו`,
                          icon: CheckSquare,
                          color: 'from-purple-500 to-indigo-500',
                          bgColor: 'from-purple-50 to-indigo-50',
                          progress: totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0,
                        },
                      ].map((stat, index) => (
                        <Card 
                          key={stat.title} 
                          className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in ${stat.alert ? 'ring-2 ring-red-500/20 animate-pulse' : ''}`}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-60`}></div>
                          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`}></div>
                          <CardHeader className="relative pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg hover-scale`}>
                                  <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <CardTitle className="text-sm text-muted-foreground font-medium">
                                    {stat.title}
                                  </CardTitle>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="relative">
                            <div className="space-y-3">
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-foreground animate-scale-in">
                                  {stat.value}
                                </span>
                                {stat.alert && (
                                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium animate-pulse">
                                    דרוש טיפול
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground font-medium">
                                {stat.subValue}
                              </p>
                              <Progress 
                                value={stat.progress} 
                                className="h-2 bg-white/50" 
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* תוכן עיקרי - רשתה דינמית */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                      {/* פרויקטים אחרונים */}
                      <Card className="xl:col-span-2 border-0 shadow-lg bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 animate-slide-in-right">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg hover-scale">
                                <FolderOpen className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-xl">פרויקטים אחרונים</CardTitle>
                                <p className="text-sm text-muted-foreground">הפרויקטים החדישים שלך</p>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded-full">
                              {projects.length} פרויקטים
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {recentProjects.length === 0 ? (
                              <div className="text-center py-8 animate-fade-in">
                                <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-3 opacity-50" />
                                <p className="text-muted-foreground font-medium">אין פרויקטים עדיין</p>
                                <p className="text-sm text-muted-foreground mt-1">התחל ליצור פרויקטים חדשים</p>
                              </div>
                            ) : (
                              recentProjects.map((project, index) => (
                                <div
                                  key={project.id}
                                  className="group relative p-4 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl hover:shadow-md transition-all duration-200 hover:scale-[1.02] animate-fade-in"
                                  style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-foreground truncate story-link">{project.name}</h3>
                                        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(project.priority)} hover-scale`}>
                                          {project.priority === 'high' ? 'גבוהה' : project.priority === 'medium' ? 'בינונית' : 'נמוכה'}
                                        </span>
                                      </div>
                                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {project.description}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 text-xs rounded-full border ${
                                          project.status === 'in-progress' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200' :
                                          project.status === 'on-hold' ? 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200' :
                                          project.status === 'completed' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' :
                                          'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200'
                                        } hover-scale`}>
                                          {formatStatusHe(project.status)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {format(new Date(project.updatedAt), 'dd/MM/yyyy', { locale: he })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* משימות פעילות */}
                      <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg hover-scale">
                                <CheckSquare className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">משימות פעילות</CardTitle>
                                <p className="text-sm text-muted-foreground">משימות שדורשות תשומת לב</p>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded-full">
                              {recentTasks.length} משימות
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {recentTasks.length === 0 ? (
                              <div className="text-center py-8 animate-fade-in">
                                <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                <p className="text-muted-foreground font-medium">כל המשימות הושלמו! 🎉</p>
                                <p className="text-sm text-muted-foreground mt-1">עבודה מצוינת</p>
                              </div>
                            ) : (
                              recentTasks.map((task, index) => (
                                <div 
                                  key={task.id || index} 
                                  className="group p-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg hover:shadow-sm transition-all duration-200 hover-scale animate-fade-in"
                                  style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-2 bg-green-500`}></div>
                                     <div className="flex-1 min-w-0">
                                       <h4 className="font-medium text-sm text-foreground truncate story-link">
                                         {task.title}
                                       </h4>
                                       <div className="flex items-center gap-2 mt-1">
                                         <span className="px-2 py-0.5 text-xs rounded-full text-blue-600 bg-blue-100 border border-blue-200 hover-scale">
                                           {task.projectName}
                                         </span>
                                         <span className="text-xs text-muted-foreground flex items-center gap-1">
                                           <Clock className="w-3 h-3" />
                                           {format(new Date(task.createdAt), 'dd/MM', { locale: he })}
                                         </span>
                                       </div>
                                     </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* גרפים מתקדמים מהדף הבית */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {/* סטטוס פרויקטים - עוגה */}
                      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30 hover-scale animate-slide-in-right">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center hover-scale">
                              <span className="text-white text-lg">📊</span>
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold story-link">סטטוס פרויקטים</CardTitle>
                              <p className="text-sm text-muted-foreground">התפלגות לפי מצב נוכחי</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer config={{}} className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie 
                                  data={statusData} 
                                  dataKey="value" 
                                  nameKey="name" 
                                  cx="50%" 
                                  cy="50%" 
                                  innerRadius={50} 
                                  outerRadius={100} 
                                  paddingAngle={3} 
                                  strokeWidth={2} 
                                  stroke="#ffffff"
                                >
                                  {statusData.map((entry, index) => (
                                    <Cell key={`cell-status-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity duration-200" />
                                  ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                          
                          {/* מקרא מעוצב */}
                          <div className="mt-6 grid grid-cols-2 gap-3">
                            {statusData.map((entry, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-white/60 backdrop-blur-sm rounded-lg hover-scale">
                                <div 
                                  className="w-4 h-4 rounded-full shadow-sm" 
                                  style={{ backgroundColor: entry.fill }}
                                ></div>
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-foreground">{entry.name}</span>
                                  <div className="text-xs text-muted-foreground">{entry.value} פרויקטים</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* התקדמות שבועית */}
                      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 hover-scale animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center hover-scale">
                              <span className="text-white text-lg">📈</span>
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold story-link">התקדמות שבועית</CardTitle>
                              <p className="text-sm text-muted-foreground">משימות לפי יום השבוע</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer config={{}} className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={weeklyData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                                <XAxis 
                                  dataKey="day" 
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fontSize: 12, fill: '#6b7280' }}
                                />
                                <YAxis 
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fontSize: 12, fill: '#6b7280' }}
                                  allowDecimals={false}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line 
                                  dataKey="הושלמו" 
                                  stroke="#10b981" 
                                  strokeWidth={4}
                                  dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                                  activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 3, fill: '#ffffff' }}
                                />
                                <Line 
                                  dataKey="פעילות" 
                                  stroke="#3b82f6" 
                                  strokeWidth={4}
                                  dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }}
                                  activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 3, fill: '#ffffff' }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    </div>

                    {/* גרף עדיפויות מורחב */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30 hover-scale animate-fade-in" style={{ animationDelay: '0.2s' }}>
                      <CardHeader className="pb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center hover-scale">
                              <span className="text-white text-xl">⚡</span>
                            </div>
                            <div>
                              <CardTitle className="text-2xl font-bold story-link">התפלגות עדיפויות</CardTitle>
                              <p className="text-muted-foreground">פרויקטים לפי רמת עדיפות</p>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-muted-foreground bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                            {priorityData.reduce((sum, item) => sum + item.value, 0)} פרויקטים סה"כ
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* גרף עמודות אופקי */}
                          <div className="lg:col-span-2">
                            <h4 className="text-lg font-semibold text-foreground mb-6">פילוח לפי עדיפות</h4>
                            <ChartContainer config={{}} className="h-[280px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={priorityData} layout="horizontal" margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
                                  <XAxis 
                                    type="number" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    allowDecimals={false}
                                  />
                                  <YAxis 
                                    type="category" 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fontSize: 14, fill: '#374151', fontWeight: 500 }}
                                    width={70}
                                  />
                                  <ChartTooltip content={<ChartTooltipContent />} />
                                  <Bar 
                                    dataKey="value" 
                                    radius={[0, 6, 6, 0]}
                                  >
                                    {priorityData.map((entry, index) => (
                                      <Cell key={`cell-priority-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity duration-200" />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </ChartContainer>
                          </div>

                          {/* תצוגת נתונים מעוצבת */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-foreground mb-6">סיכום עדיפויות</h4>
                            {priorityData.map((priority, index) => (
                              <div 
                                key={index} 
                                className="group p-5 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl hover:shadow-lg transition-all duration-200 hover-scale animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-5 h-5 rounded-full shadow-md" 
                                      style={{ backgroundColor: priority.fill }}
                                    ></div>
                                    <span className="font-bold text-lg text-foreground story-link">{priority.name}</span>
                                  </div>
                                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                    {priority.value}
                                  </span>
                                </div>
                                
                                <div className="text-sm text-muted-foreground">
                                  {priority.value} פרויקטים בעדיפות {priority.name.toLowerCase()}
                                </div>
                                
                                {/* פרוגרס בר מעוצב */}
                                <div className="mt-4">
                                  <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                                    <div 
                                      className="h-2 rounded-full transition-all duration-500 shadow-sm"
                                      style={{ 
                                        background: `linear-gradient(90deg, ${priority.fill}, ${priority.fill}dd)`,
                                        width: `${priority.value > 0 ? (priority.value / Math.max(...priorityData.map(p => p.value), 1)) * 100 : 0}%`
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="space-y-6">
                    {/* Projects Grid */}
                    <div className="flex flex-wrap justify-center gap-6 max-w-none">{/* Perfect centering with flex */}
                      {filteredAndSortedProjects.map((project) => {
                        const completedTasks = project.tasks.filter(t => t.completed).length;
                        const totalTasks = project.tasks.length;
                        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                        return (
                          <Card key={project.id} id={`project-${project.id}`} className="card-macos relative group w-full max-w-md">{/* Fixed width for perfect alignment */}
                            <CardHeader className="pb-3 md:pb-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-lg md:text-xl font-bold line-clamp-2 mb-2 bg-gradient-to-r from-slate-700 via-blue-600 to-slate-700 bg-clip-text text-transparent hover:from-slate-600 hover:via-blue-500 hover:to-slate-600 transition-colors duration-300">
                                    {project.name}
                                  </CardTitle>
                                  <div className="flex items-center gap-2 mb-3">
                                    <User className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                                    <span className="text-xs md:text-sm text-muted-foreground truncate">
                                      {project.clientName}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 md:gap-2 ml-2">
                                  <StatusDropdown
                                    value={project.status}
                                    onChange={(newStatus) => updateProjectStatus(project.id, newStatus as any)}
                                    className="w-24 md:w-32 text-xs"
                                  />
                                  <PriorityDropdown
                                    value={project.priority}
                                    onChange={(newPriority) => updateProjectPriority(project.id, newPriority as any)}
                                    className="w-24 md:w-32 text-xs"
                                  />
                                </div>
                              </div>

                              {project.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {project.description}
                                </p>
                              )}

                              <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-semibold text-green-600">
                                  {getCurrencySymbol(project.currency)}{project.price.toLocaleString()}
                                </div>
                                <Button
                                  size="sm"
                                  variant={project.paid ? "default" : "outline"}
                                  onClick={() => toggleProjectPaid(project.id)}
                                  className={`text-xs h-8 px-3 transition-all duration-200 ${
                                    project.paid 
                                      ? 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300' 
                                      : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                                  }`}
                                >
                                  <CreditCard className="w-3 h-3 ml-1" />
                                  {project.paid ? 'שולם' : 'לא שולם'}
                                </Button>
                              </div>

                              <div className="space-y-3">
                                <div className="bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20 p-3 rounded-lg border border-blue-100/50 dark:border-blue-800/30">
                                  <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">משימות</h3>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setSelectedProject(project);
                                        setShowTasksModal(true);
                                      }}
                                      className="text-xs h-7 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-all duration-200"
                                    >
                                      <ListTodo className="w-3 h-3 ml-1" />
                                      {totalTasks > 0 ? `${completedTasks}/${totalTasks}` : 'הוסף משימות'}
                                    </Button>
                                  </div>
                                  
                                  {totalTasks > 0 && (
                                    <div className="space-y-3">
                                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                        <div 
                                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all"
                                          style={{ width: `${completionRate}%` }}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        {[...project.tasks]
                                          .sort((a, b) => {
                                            if (a.completed !== b.completed) {
                                              return a.completed ? 1 : -1;
                                            }
                                            return 0;
                                          })
                                          .slice(0, 3)
                                          .map((task) => (
                                          <div key={task.id} className="flex items-center gap-2 text-xs group cursor-pointer hover:bg-white/50 dark:hover:bg-gray-800/50 p-1.5 rounded transition-all">
                                            <div 
                                              className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 ${
                                                task.completed 
                                                  ? 'bg-green-500 border-green-500' 
                                                  : 'border-gray-400 hover:border-blue-500'
                                              }`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleProjectTask(project.id, task.id);
                                              }}
                                            >
                                              {task.completed && <CheckCircle2 className="w-2 h-2 text-white" />}
                                            </div>
                                            <span className={`flex-1 truncate transition-all ${
                                              task.completed 
                                                ? 'line-through text-gray-500 dark:text-gray-400' 
                                                : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                                            }`}>
                                              {task.title}
                                            </span>
                                          </div>
                                        ))}
                                        {totalTasks > 3 && (
                                          <div className="text-xs text-gray-500 text-center pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
                                            +{totalTasks - 3} משימות נוספות...
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {totalTasks === 0 && (
                                    <div className="text-center py-4">
                                      <CheckSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        לחץ על הכפתור להוספת משימות
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-3 gap-2">
                                {project.phone1 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleContactClick('phone', project.phone1)}
                                    className="flex items-center gap-1 h-8 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 transition-all duration-200"
                                  >
                                    <PhoneCall className="w-3 h-3" />
                                    <span className="hidden sm:inline">חייג</span>
                                  </Button>
                                )}
                                {project.whatsapp1 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleContactClick('whatsapp', project.whatsapp1)}
                                    className="flex items-center gap-1 h-8 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 transition-all duration-200"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                    <span className="hidden sm:inline">וואטסאפ</span>
                                  </Button>
                                )}
                                {project.email && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleContactClick('email', project.email)}
                                    className="flex items-center gap-1 h-8 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 transition-all duration-200"
                                  >
                                    <Mail className="w-3 h-3" />
                                    <span className="hidden sm:inline">מייל</span>
                                  </Button>
                                )}
                              </div>

                              <div className="flex gap-2">
                                {(project.folderPath || project.icloudLink) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openFolder(project.folderPath, project.icloudLink)}
                                    className="flex items-center gap-1 h-8 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 transition-all duration-200"
                                  >
                                    <FolderOpen className="w-3 h-3" />
                                    פתח תיקייה
                                  </Button>
                                )}
                              </div>

                              <div className="flex gap-2 pt-2 border-t">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setShowEditModal(true);
                                  }}
                                  className="flex items-center gap-1 h-8 bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 transition-all duration-200"
                                >
                                  <Edit className="w-3 h-3" />
                                  ערוך
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteProject(project.id)}
                                  className="flex items-center gap-1 h-8 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 transition-all duration-200"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  מחק
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {filteredAndSortedProjects.length === 0 && (
                      <Card className="card-macos">
                        <CardContent className="p-12 text-center">
                          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">לא נמצאו פרויקטים</h3>
                          <p className="text-muted-foreground mb-6">
                            {searchTerm || priorityFilter !== 'all' || statusFilter !== 'all'
                              ? 'נסה לשנות את המסננים או החיפוש'
                              : 'התחל ליצור את הפרויקט הראשון שלך'
                            }
                          </p>
                          <Button onClick={() => setShowCreateModal(true)} className="gradient-primary text-white">
                            <Plus className="w-4 h-4 ml-2" />
                            צור פרויקט ראשון
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </main>

              {/* Modals */}
              <CreateProjectModal
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
                onCreateProject={handleCreateProject}
              />

              <ProjectTasksModal
                open={showTasksModal}
                onOpenChange={setShowTasksModal}
                project={selectedProject ? projects.find(p => p.id === selectedProject.id) || selectedProject : null}
                onAddTask={handleAddProjectTask}
                onToggleTask={handleToggleProjectTask}
                onDeleteTask={handleDeleteProjectTask}
              />

              <ProjectEditModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                project={selectedProject}
                onUpdateProject={handleUpdateProject}
              />
            </div>
          </div>
        </div>

        {/* Projects Sidebar - Left Side (appears last due to RTL) */}
        <div className="hidden xl:block fixed left-0 top-0 h-full w-80 z-10">
          <ProjectsSidebar />
        </div>
        
        {/* Mobile Floating Sidebars */}
        {showMobileTasksSidebar && (
          <div className="fixed inset-0 z-50 xl:hidden">
            <div 
              className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
              onClick={() => setShowMobileTasksSidebar(false)}
            ></div>
            <div className="absolute right-0 top-0 h-full w-80 sm:w-96 md:w-[420px] max-w-[85vw] bg-white/95 backdrop-blur-md shadow-2xl border-l border-border/50 transform transition-transform duration-300 ease-out ios-safe-area animate-slide-in-right">
              <div className="h-screen flex flex-col mobile-sidebar-scroll">
                <TasksSidebar />
              </div>
            </div>
          </div>
        )}
        
        {showMobileProjectsSidebar && (
          <div className="fixed inset-0 z-50 xl:hidden">
            <div 
              className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
              onClick={() => setShowMobileProjectsSidebar(false)}
            ></div>
            <div className="absolute left-0 top-0 h-full w-48 max-w-[50vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl border-r border-border/50 transform transition-transform duration-300 ease-out ios-safe-area animate-slide-in-left">
              <div className="h-screen overflow-hidden flex flex-col ios-scroll-fix">
                <div className="flex-1 overflow-y-auto">
                  {/* Minimal Header */}
                  <div className="p-3 border-b bg-white/50 dark:bg-gray-800/50 sticky top-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">קפיצה מהירה</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowMobileProjectsSidebar(false)}
                        className="p-1 h-6 w-6"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Ultra Minimal Projects List */}
                  <div className="p-2 space-y-1">
                    {projects.map((project, index) => (
                      <button 
                        key={project.id}
                        className="w-full text-right p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs group border-b border-gray-100/50 dark:border-gray-700/50 last:border-b-0"
                        onClick={() => {
                          // Scroll to project in main view
                          setSelectedProject(project);
                          setActiveTab('projects');
                          setShowMobileProjectsSidebar(false);
                          
                          // Scroll to specific project after tab switch
                          setTimeout(() => {
                            const projectElement = document.getElementById(`project-${project.id}`);
                            if (projectElement) {
                              projectElement.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'center' 
                              });
                              // Add highlight effect
                              projectElement.classList.add('ring-2', 'ring-blue-400/50');
                              setTimeout(() => {
                                projectElement.classList.remove('ring-2', 'ring-blue-400/50');
                              }, 2000);
                            }
                          }, 100);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 text-right">
                            <div className="font-medium text-gray-800 dark:text-gray-200 truncate text-xs leading-tight">
                              {project.name.length > 20 ? `${project.name.substring(0, 20)}...` : project.name}
                            </div>
                            {project.clientName && (
                              <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {project.clientName.length > 15 ? `${project.clientName.substring(0, 15)}...` : project.clientName}
                              </div>
                            )}
                          </div>
                          
                          {/* Minimal Status Dot */}
                          <div className={`w-2 h-2 rounded-full ml-2 flex-shrink-0 ${
                            project.status === 'in-progress' ? 'bg-blue-500' :
                            project.status === 'completed' ? 'bg-green-500' :
                            'bg-gray-400'
                          }`}></div>
                        </div>
                        
                        {/* Project Number */}
                        <div className="text-[8px] text-gray-400 mt-1 text-right font-mono">
                          #{index + 1}
                        </div>
                      </button>
                    ))}
                    
                    {projects.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <div className="text-xs">אין פרויקטים</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Floating Navigation - 5 Buttons */}
        <div 
          className={`xl:hidden fixed bottom-6 left-4 right-4 z-50 floating-nav-bottom transform transition-all duration-300 ${mobileBarHidden ? 'translate-y-[140%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
          onTouchStart={(e) => { if (e.touches && e.touches[0]) mobileBarTouchStartY.current = e.touches[0].clientY; }}
          onTouchEnd={(e) => { const endY = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : 0; if (endY - mobileBarTouchStartY.current > 40) setMobileBarHidden(true); }}
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-2">
            {/* First Row - Main Navigation */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {/* Dashboard Button */}
              <Button
                variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center gap-1 p-3 h-auto min-h-[60px] transition-all duration-200 ${
                  activeTab === 'dashboard' 
                    ? 'bg-gradient-primary text-white shadow-lg' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs font-medium">לוח בקרה</span>
              </Button>

              {/* Projects Tab Button */}
              <Button
                variant={activeTab === 'projects' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('projects')}
                className={`flex flex-col items-center gap-1 p-3 h-auto min-h-[60px] transition-all duration-200 ${
                  activeTab === 'projects' 
                    ? 'bg-gradient-primary text-white shadow-lg' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="text-xs font-medium">פרויקטים</span>
              </Button>

              {/* Tasks Sidebar Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileTasksSidebar(true)}
                className="flex flex-col items-center gap-1 p-3 h-auto min-h-[60px] text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              >
                <CheckSquare className="h-5 w-5" />
                <span className="text-xs font-medium">משימות</span>
              </Button>

              {/* Projects Sidebar Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileProjectsSidebar(true)}
                className="flex flex-col items-center gap-1 p-3 h-auto min-h-[60px] text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              >
                <FolderOpen className="h-5 w-5" />
                <span className="text-xs font-medium">קפיצה</span>
              </Button>
            </div>
            
            {/* Second Row - Refresh Button */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshData}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-6 py-2 h-auto min-h-[40px] transition-all duration-200 ${
                  isRefreshing 
                    ? 'text-muted-foreground cursor-not-allowed' 
                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-xs font-medium">
                  {isRefreshing ? 'מרענן...' : 'רענון נתונים'}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Toggle back handle when hidden */}
        {mobileBarHidden && (
          <div className="xl:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-50">
            <Button
              variant="glass"
              size="icon"
              onClick={() => setMobileBarHidden(false)}
              className="rounded-full h-9 w-9 shadow-2xl"
            >
              <ChevronUp className="h-4 w-4" />
              <span className="sr-only">הצג סרגל</span>
            </Button>
          </div>
        )}
 
        {/* Swipe Indicators - Show on first visit */}
        {!showMobileTasksSidebar && !showMobileProjectsSidebar && (
          <>
            <div className="swipe-indicator-left xl:hidden"></div>
            <div className="swipe-indicator-right xl:hidden"></div>
          </>
        )}
      </div>
    </SidebarProvider>
  );
};
