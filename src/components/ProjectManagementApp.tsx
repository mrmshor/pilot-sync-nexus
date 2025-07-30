import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, Edit, Trash2, User, PhoneCall, MessageCircle, Mail, 
  FolderOpen, CheckCircle2, CreditCard, Plus, X, Clock, Filter,
  BarChart3, TrendingUp, Users, DollarSign, Calendar, Settings,
  Download, Bug, Zap, Database, Activity, CheckSquare, Target,
  FileText, ArrowUpDown, ListTodo, ChevronDown, List
} from 'lucide-react';
import { Project, ProjectTask, QuickTask } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { CreateProjectModal } from './CreateProjectModal';
import { StatusDropdown } from './StatusDropdown';
import { PriorityDropdown } from './PriorityDropdown';
import { QuickTasksSidebar } from './QuickTasksSidebar';
import { ProjectTasksModal } from './ProjectTasksModal';
import { ProjectEditModal } from './ProjectEditModal';
import { EnhancedDashboard } from './EnhancedDashboard';

export const ProjectManagementApp = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'status' | 'createdAt' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [customLogo, setCustomLogo] = useState<string | null>(
    localStorage.getItem('customLogo')
  );
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);
  const { toast } = useToast();

  // Load sample data
  useEffect(() => {
    const sampleProjects: Project[] = [
      {
        id: '1',
        name: 'פיתוח אתר אינטרנט עסקי מתקדם',
        description: 'פיתוח אתר תדמית עסקי מתקדם עם מערכת ניהול תוכן ומערכת הזמנות מקוונת',
        clientName: 'אליעזר שפירא',
        phone1: '+972-54-628-2522',
        phone2: '',
        whatsapp1: '+972-54-628-2522',
        whatsapp2: '',
        email: 'eliezer@business.co.il',
        folderPath: '/Users/Projects/WebDev/Eliezer',
        icloudLink: 'https://icloud.com/project1',
        status: 'in-progress',
        priority: 'high',
        price: 15000,
        currency: 'ILS',
        paid: false,
        completed: false,
        deadline: new Date('2024-02-28'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
        tasks: [
          { id: '1', title: 'לחזור בקרוב', completed: false, createdAt: new Date('2024-01-16') },
          { id: '2', title: 'לבצע עיצוב ראשוני', completed: true, createdAt: new Date('2024-01-20'), completedAt: new Date('2024-01-25') },
          { id: '3', title: 'להזמין חומר', completed: false, createdAt: new Date('2024-01-21') },
          { id: '4', title: 'לעדכן מחיר', completed: false, createdAt: new Date('2024-01-21') },
          { id: '5', title: 'לתקן קבצים לשליחה לאישור סופי', completed: false, createdAt: new Date('2024-01-21') }
        ],
        subtasks: []
      },
      {
        id: '2',
        name: 'עיצוב לוגו וזהות חזותית',
        description: 'יצירת לוגו מקצועי וחבילת זהות חזותית מלאה כולל כרטיסי ביקור וניירת',
        clientName: 'אברהם קורן',
        phone1: '+972-50-123-4567',
        phone2: '',
        whatsapp1: '+972-50-123-4567',
        whatsapp2: '',
        email: 'avraham@company.com',
        folderPath: '',
        icloudLink: '',
        status: 'on-hold',
        priority: 'medium',
        price: 8000,
        currency: 'ILS',
        paid: false,
        completed: false,
        deadline: new Date('2024-02-10'),
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-15'),
        tasks: [],
        subtasks: []
      },
      {
        id: '3',
        name: 'פאציים עור לבגדים',
        description: 'תיקון והוספת פאציים עור איכותיים לפריטי ביגוד שונים',
        clientName: 'שלמה קויץ',
        phone1: '+972-52-877-3801',
        phone2: '+972-53-340-8665',
        whatsapp1: '+972-52-877-3801',
        whatsapp2: '+972-53-340-8665',
        email: 'shlomo@leather.co.il',
        folderPath: '',
        icloudLink: 'https://icloud.com/leather-project',
        status: 'in-progress',
        priority: 'high',
        price: 4030,
        currency: 'ILS',
        paid: false,
        completed: false,
        deadline: new Date('2024-02-05'),
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-02-10'),
        tasks: [
          { id: '1', title: 'מדידת הבגדים', completed: true, createdAt: new Date('2024-01-21'), completedAt: new Date('2024-01-25') },
          { id: '2', title: 'הזמנת חומרי גלם', completed: false, createdAt: new Date('2024-01-26') }
        ],
        subtasks: []
      }
    ];

    setProjects(sampleProjects);
    toast({
      title: "מערכת נטענה בהצלחה",
      description: `נטענו ${sampleProjects.length} פרויקטים`,
    });
  }, [toast]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "שגיאה",
          description: "גודל הקובץ גדול מדי. אנא בחר קובץ קטן מ-2MB",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomLogo(result);
        localStorage.setItem('customLogo', result);
        toast({
          title: "הלוגו הועלה בהצלחה",
          description: "הלוגו החדש נשמר במערכת",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setCustomLogo(null);
    localStorage.removeItem('customLogo');
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

  // Filter and sort projects
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
  }, [projects, searchTerm, priorityFilter, statusFilter, sortBy, sortOrder]);

  // Utility functions
  const handleExportCSV = () => {
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
  };

  const handleCreateProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'subtasks'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [],
      subtasks: []
    };
    
    setProjects(prev => [...prev, newProject]);
    setShowCreateModal(false);
    toast({
      title: "פרויקט נוצר בהצלחה",
      description: `פרויקט "${newProject.name}" נוסף למערכת`,
    });
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    toast({
      title: "פרויקט עודכן בהצלחה",
      description: `הפרויקט "${updatedProject.name}" עודכן במערכת`,
    });
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && window.confirm(`האם אתה בטוח שברצונך למחוק את הפרויקט "${project.name}"?`)) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
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
    const newTask: ProjectTask = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date()
    };
    
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, tasks: [newTask, ...project.tasks], updatedAt: new Date() }
        : project
    ));
  };

  const handleToggleProjectTask = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            tasks: project.tasks.map(task => 
              task.id === taskId 
                ? { 
                    ...task, 
                    completed: !task.completed,
                    completedAt: !task.completed ? new Date() : undefined
                  }
                : task
            )
          }
        : project
    ));
  };

  const handleDeleteProjectTask = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            tasks: project.tasks.filter(task => task.id !== taskId),
            updatedAt: new Date()
          }
        : project
    ));
  };

  const updateProjectStatus = (projectId: string, newStatus: Project['status']) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, status: newStatus }
        : project
    ));
    toast({
      title: "סטטוס עודכן",
      description: "סטטוס הפרויקט עודכן בהצלחה",
    });
  };

  const updateProjectPriority = (projectId: string, newPriority: Project['priority']) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, priority: newPriority }
        : project
    ));
    toast({
      title: "עדיפות עודכנה",
      description: "עדיפות הפרויקט עודכנה בהצלחה",
    });
  };

  const toggleProjectPaid = (projectId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, paid: !project.paid }
        : project
    ));
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
    setShowTasksModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex w-full" dir="rtl">
      {/* Projects Sidebar - Left Side (Compact) */}
      <div className="w-64 h-screen bg-white/95 backdrop-blur border-r border-gray-200 shadow-lg overflow-y-auto">
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            פרויקטים ({projects.length})
          </h3>
          <div className="space-y-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleSidebarProjectSelect(project)}
                className={`
                  w-full text-right p-3 rounded-lg transition-all duration-200
                  ${selectedProject?.id === project.id 
                    ? 'bg-blue-100 border border-blue-500' 
                    : 'hover:bg-gray-100'
                  }
                  ${project.priority === 'high' ? 'border-r-2 border-red-500' : ''}
                  ${project.priority === 'medium' ? 'border-r-2 border-yellow-500' : ''}
                  ${project.priority === 'low' ? 'border-r-2 border-green-500' : ''}
                `}
              >
                <div className="text-sm font-medium text-gray-900 truncate">
                  {project.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {project.clientName}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {project.completed && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  {project.paid && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                  <span className="text-xs text-gray-400">
                    {project.tasks?.length || 0} משימות
                  </span>
                </div>
              </button>
            ))}
          </div>
          {projects.length === 0 && (
            <div className="text-center text-gray-500 text-sm mt-8">
              אין פרויקטים במערכת
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Main Center Content */}
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <header className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="relative group">
                  <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-macos overflow-hidden">
                    {customLogo ? (
                      <img 
                        src={customLogo} 
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
                  {customLogo && (
                    <button
                      onClick={removeLogo}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    מערכת ניהול פרויקטים Pro
                  </h1>
                </div>
              </div>
              
              {/* Action Button - Export + Projects List */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  ייצוא CSV
                </Button>
                
                {/* Projects Dropdown */}
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setShowProjectsDropdown(!showProjectsDropdown)}
                    className="gap-2 min-w-[200px] justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <List className="w-4 h-4" />
                      <span>רשימת פרויקטים ({projects.length})</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showProjectsDropdown ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {showProjectsDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                          בחר פרויקט לפתיחה
                        </div>
                        {projects.length > 0 ? (
                          <div className="space-y-1 mt-2">
                            {projects.map((project) => (
                              <button
                                key={project.id}
                                onClick={() => handleProjectSelect(project)}
                                className="w-full text-right px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between group"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                    {project.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {project.clientName}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                  {project.completed && (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  )}
                                  {project.paid && (
                                    <CreditCard className="w-4 h-4 text-blue-500" />
                                  )}
                                  <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 rotate-[-90deg]" />
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">אין פרויקטים במערכת</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Navigation */}
            <div className="flex justify-center mb-8">
              <div className="glass p-1.5 rounded-xl shadow-medium">
                <Button
                  onClick={() => setActiveTab('dashboard')}
                  variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                  className="px-6 py-3 rounded-lg text-sm font-medium"
                >
                  <BarChart3 className="w-4 h-4 ml-2" />
                  לוח בקרה Pro
                </Button>
                <Button
                  onClick={() => setActiveTab('projects')}
                  variant={activeTab === 'projects' ? 'default' : 'ghost'}
                  className="px-6 py-3 rounded-lg text-sm font-medium"
                >
                  <Users className="w-4 h-4 ml-2" />
                  פרויקטים מתקדם
                </Button>
              </div>
            </div>

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
                  {/* Search and Filters */}
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
                          >
                            <Plus className="w-4 h-4 ml-2" />
                            פרויקט חדש
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Projects Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAndSortedProjects.map((project) => (
                      <Card key={project.id} className="card-macos">
                        <CardHeader>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{project.clientName}</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-4">{project.description}</p>
                          <div className="flex justify-between items-center mb-4">
                            <Badge variant={getStatusBadgeVariant(project.status)}>
                              {project.status}
                            </Badge>
                            <Badge variant={getPriorityBadgeVariant(project.priority)}>
                              {project.priority}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {getCurrencySymbol(project.currency)}{project.price.toLocaleString()}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedProject(project);
                                  setShowTasksModal(true);
                                }}
                              >
                                <ListTodo className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedProject(project);
                                  setShowEditModal(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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

        {/* Quick Tasks Sidebar - Right Side */}
        <div className="w-80 h-screen bg-white/95 backdrop-blur border-l border-gray-200 shadow-lg overflow-y-auto">
          <QuickTasksSidebar
            quickTasks={quickTasks}
            onAddTask={handleAddQuickTask}
            onToggleTask={handleToggleQuickTask}
            onDeleteTask={handleDeleteQuickTask}
          />
        </div>
      </div>
    </div>
  );
};