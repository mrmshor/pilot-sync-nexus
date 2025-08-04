import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  FileText, ArrowUpDown, ListTodo, ChevronDown, List
} from 'lucide-react';
import { Project, ProjectTask, QuickTask } from '@/types';
import { ContactService, FolderService, ExportService, TauriService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { useProjectManager } from '@/hooks/useProjectManager';
import { useQuickTasks } from '@/hooks/useQuickTasks';
import { useAppSettings } from '@/hooks/useAppSettings';
import { CreateProjectModal } from './CreateProjectModal';
import { StatusDropdown } from './StatusDropdown';
import { PriorityDropdown } from './PriorityDropdown';
import { QuickTasksSidebar } from './QuickTasksSidebar';
import { ProjectTasksModal } from './ProjectTasksModal';
import { ProjectEditModal } from './ProjectEditModal';
import { EnhancedDashboard } from './EnhancedDashboard';
import { AppSidebar } from './AppSidebar';

export const ProjectManagementApp = () => {
  // Core state management using custom hooks
  const { 
    projects, 
    loading: projectsLoading, 
    createProject, 
    updateProject, 
    deleteProject,
    addProjectTask,
    toggleProjectTask,
    deleteProjectTask 
  } = useProjectManager();
  
  const { 
    quickTasks, 
    loading: tasksLoading, 
    addQuickTask, 
    toggleQuickTask, 
    deleteQuickTask 
  } = useQuickTasks();
  
  const { 
    settings, 
    loading: settingsLoading, 
    uploadLogo, 
    removeLogo 
  } = useAppSettings();

  // UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'status' | 'createdAt' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [preserveScroll, setPreserveScroll] = useState<number | null>(null);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);
  const { toast } = useToast();

  // Loading state
  const loading = projectsLoading || tasksLoading || settingsLoading;

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

  // Scroll position preservation
  const saveScrollPosition = () => {
    setPreserveScroll(window.scrollY);
  };

  useEffect(() => {
    if (preserveScroll !== null) {
      const timeoutId = setTimeout(() => {
        window.scrollTo(0, preserveScroll);
        setPreserveScroll(null);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [preserveScroll, projects]);

  // Logo upload handler
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadLogo(file);
      } catch (error) {
        console.error('Error uploading logo:', error);
      }
    }
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

  // Optimized data handling for large datasets
  const { visibleData: visibleProjects } = useOptimizedData(filteredAndSortedProjects, 50);

  // Contact handlers
  const handleContactClick = (type: 'phone' | 'whatsapp' | 'email', value: string) => {
    if (!value) return;
    
    try {
      switch (type) {
        case 'phone':
          ContactService.makePhoneCall(value);
          break;
        case 'whatsapp':
          ContactService.openWhatsApp(value);
          break;
        case 'email':
          ContactService.sendEmail(value);
          break;
      }
    } catch (error) {
      console.error(`Error handling ${type} contact:`, error);
      toast({
        title: "שגיאה",
        description: `שגיאה בפתיחת ${type === 'whatsapp' ? 'וואטסאפ' : type === 'email' ? 'אימייל' : 'טלפון'}`,
        variant: "destructive",
      });
    }
  };

  // Native folder opening for Tauri desktop app
  const openFolder = async (folderPath?: string, icloudLink?: string) => {
    try {
      if (folderPath) {
        // Use native Tauri command to open folder
        await FolderService.openFolder(folderPath, icloudLink);
        toast({
          title: "תיקייה נפתחת",
          description: `פותח ${folderPath}`,
        });
      } else if (icloudLink) {
        // For iCloud links, use TauriService
        await TauriService.openUrl(icloudLink);
        if (!opened) {
          console.warn('Failed to open iCloud link natively');
        }
        toast({
          title: "קישור iCloud נפתח",
          description: "נפתח באפליקציית ברירת המחדל",
        });
      }
    } catch (error) {
      console.error('Error opening folder:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לפתוח את התיקייה",
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
      await createProject(projectData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      await updateProject(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && window.confirm(`האם אתה בטוח שברצונך למחוק את הפרויקט "${project.name}"?`)) {
      try {
        await deleteProject(projectId);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex w-full" dir="rtl">
        {/* Quick Tasks Sidebar - Right Side (appears first due to RTL) */}
        <div className="w-80 h-screen bg-white/95 backdrop-blur border-l border-gray-200 shadow-lg fixed top-0 right-0 z-30">
          <QuickTasksSidebar
            quickTasks={quickTasks}
            onAddTask={addQuickTask}
            onToggleTask={toggleQuickTask}
            onDeleteTask={deleteQuickTask}
          />
        </div>

        {/* Main Content - Center */}
        <div className="flex-1 min-h-screen mr-80 flex flex-col">
          {/* Fixed Header and Navigation */}
          <div className="sticky top-0 z-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 border-b border-white/20 shadow-sm">
            <div className="container mx-auto px-4 py-8">
              {/* Header */}
              <header className="text-center mb-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="relative group">
                    <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-macos overflow-hidden">
                      {settings.customLogo ? (
                        <img 
                          src={settings.customLogo} 
                          alt="לוגו מותאם אישית" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">🚀</span>
                      )}
                    </div>
                    
                    {/* Logo upload overlay */}
                    <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <Plus className="h-5 w-5 text-white" />
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
                    {settings.customLogo && (
                      <button
                        onClick={removeLogo}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent macos-text">
                      מערכת ניהול פרויקטים Pro
                    </h1>
                  </div>
                </div>
              </header>

              {/* Navigation */}
              <div className="flex justify-between items-center mb-6">
                {/* Export Button - Left Side */}
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  className="gap-2"
                  title="ייצוא נתונים לקובץ CSV (⌘E)"
                >
                  <Download className="w-4 h-4" />
                  ייצוא CSV
                </Button>

                {/* Navigation Tabs - Center */}
                <div className="glass p-1.5 rounded-xl shadow-medium">
                  <Button
                    onClick={() => setActiveTab('dashboard')}
                    variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                    className="px-6 py-3 rounded-lg text-sm font-medium"
                    title="לוח בקרה Pro (⌘1)"
                  >
                    <BarChart3 className="w-4 h-4 ml-2" />
                    לוח בקרה Pro
                  </Button>
                  <Button
                    onClick={() => setActiveTab('projects')}
                    variant={activeTab === 'projects' ? 'default' : 'ghost'}
                    className="px-6 py-3 rounded-lg text-sm font-medium"
                    title="פרויקטים מתקדם (⌘2)"
                  >
                    <Users className="w-4 h-4 ml-2" />
                    פרויקטים מתקדם
                  </Button>
                </div>

                {/* Empty space for balance */}
                <div className="w-24"></div>
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
            <div className="container mx-auto px-4 py-6">
              {/* Content */}
              <main>
                {activeTab === 'dashboard' && (
                  <div>
                    <EnhancedDashboard 
                      projects={projects} 
                      stats={{
                        total: stats.total,
                        completed: stats.completed,
                        inProgress: stats.inProgress,
                        paid: stats.paid,
                        unpaid: stats.unpaid,
                        totalRevenue: stats.totalRevenue,
                        pendingRevenue: stats.pendingRevenue,
                        completionRate: stats.completionRate,
                        paymentRate: stats.paymentRate
                      }}
                    />
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="space-y-6">
                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredAndSortedProjects.map((project) => {
                        const completedTasks = project.tasks.filter(t => t.completed).length;
                        const totalTasks = project.tasks.length;
                        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                        return (
                          <Card key={project.id} id={`project-${project.id}`} className="card-macos relative group">
                            {/* ... keep existing code (project card content) */}
                            <CardHeader className="pb-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-xl font-bold line-clamp-2 mb-2 bg-gradient-to-r from-slate-700 via-blue-600 to-slate-700 bg-clip-text text-transparent hover:from-slate-600 hover:via-blue-500 hover:to-slate-600 transition-colors duration-300">
                                    {project.name}
                                  </CardTitle>
                                  <div className="flex items-center gap-2 mb-3">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {project.clientName}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <StatusDropdown
                                    value={project.status}
                                    onChange={(newStatus) => updateProjectStatus(project.id, newStatus as any)}
                                    className="w-32"
                                  />
                                  <PriorityDropdown
                                    value={project.priority}
                                    onChange={(newPriority) => updateProjectPriority(project.id, newPriority as any)}
                                    className="w-32"
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
        <AppSidebar 
          projects={projects} 
          onProjectSelect={handleSidebarProjectSelect}
          selectedProjectId={selectedProject?.id}
        />
      </div>
    </SidebarProvider>
  );
};
