import React, { useState, useEffect } from 'react';
import { Project } from '@/types';
import { EnhancedDashboard } from './EnhancedDashboard';
import { ProjectsList } from './ProjectsList';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectTasksModal } from './ProjectTasksModal';
import { ProjectEditModal } from './ProjectEditModal';
import { QuickTasksSidebar } from './QuickTasksSidebar';
import { AppSidebar } from './AppSidebar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SidebarProvider } from '@/components/ui/sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import { FolderService } from '@/services/folderService';
import { 
  Plus, 
  BarChart3,
  List,
  Upload,
  Download,
  X,
  ChevronDown,
  Eye,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Settings,
  Users,
  FolderOpen,
  Target,
  Activity,
  TrendingUp,
  Brain,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface ProjectStats {
  total: number;
  completed: number;
  inProgress: number;
  paid: number;
  unpaid: number;
  totalRevenue: number;
  pendingRevenue: number;
  completionRate: number;
  paymentRate: number;
}

export const ProjectManagementApp: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [customLogo, setCustomLogo] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Initialize with sample data
  useEffect(() => {
    const sampleProjects: Project[] = [
      {
        id: '1',
        name: 'אתר קורפוס מיוזיק',
        description: 'פיתוח אתר חדש לחברת מוזיקה',
        clientName: 'דוד כהן',
        email: 'david@example.com',
        phone1: '052-1234567',
        phone2: '03-1234567',
        whatsapp1: '052-1234567',
        whatsapp2: '03-1234567',
        folderPath: '/path/to/project1',
        icloudLink: 'https://icloud.com/link1',
        status: 'in-progress',
        priority: 'high',
        price: 25000,
        currency: 'ILS',
        paid: true,
        completed: false,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        tasks: [
          { id: '1', title: 'עיצוב ראשוני', completed: true, createdAt: new Date() },
          { id: '2', title: 'פיתוח דף בית', completed: false, createdAt: new Date() }
        ]
      },
      {
        id: '2',
        name: 'מערכת ניהול מלאי',
        description: 'פיתוח מערכת ניהול מלאי לחנות',
        clientName: 'שרה לוי',
        email: 'sara@example.com',
        phone1: '054-7654321',
        phone2: '',
        whatsapp1: '054-7654321',
        whatsapp2: '',
        folderPath: '/path/to/project2',
        icloudLink: '',
        status: 'completed',
        priority: 'medium',
        price: 35000,
        currency: 'ILS',
        paid: false,
        completed: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-25'),
        tasks: []
      }
    ];
    
    setProjects(sampleProjects);
    
    // Load custom logo from localStorage
    const savedLogo = localStorage.getItem('customLogo');
    if (savedLogo) {
      setCustomLogo(savedLogo);
    }
  }, []);

  // Logo upload handler
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('גודל הקובץ גדול מדי. אנא בחר קובץ עד 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const logoUrl = e.target?.result as string;
      setCustomLogo(logoUrl);
      localStorage.setItem('customLogo', logoUrl);
      alert('הלוגו הועלה בהצלחה!');
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setCustomLogo('');
    localStorage.removeItem('customLogo');
  };

  // Project handlers
  const handleCreateProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: []
    };
    
    setProjects(prev => [...prev, newProject]);
    setShowCreateModal(false);
    alert('הפרויקט נוצר בהצלחה!');
  };

  const handleAddProjectTask = (projectId: string, taskTitle: string) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const newTask = {
          id: Date.now().toString(),
          title: taskTitle,
          completed: false,
          createdAt: new Date()
        };
        return {
          ...project,
          tasks: [...project.tasks, newTask],
          updatedAt: new Date()
        };
      }
      return project;
    }));
  };

  const handleToggleProjectTask = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const updatedTasks = project.tasks.map(task =>
          task.id === taskId 
            ? { 
                ...task, 
                completed: !task.completed,
                completedAt: !task.completed ? new Date() : undefined
              }
            : task
        );
        return {
          ...project,
          tasks: updatedTasks,
          updatedAt: new Date()
        };
      }
      return project;
    }));
  };

  const handleDeleteProjectTask = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.filter(task => task.id !== taskId),
          updatedAt: new Date()
        };
      }
      return project;
    }));
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(project => 
      project.id === updatedProject.id ? updatedProject : project
    ));
    setShowEditModal(false);
    setEditingProject(null);
    alert('הפרויקט עודכן בהצלחה!');
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId('');
    }
    alert('הפרויקט נמחק בהצלחה!');
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['שם פרויקט', 'לקוח', 'סטטוס', 'עדיפות', 'מחיר', 'שולם', 'הושלם', 'תאריך יצירה'].join(','),
      ...projects.map(project => [
        project.name,
        project.clientName,
        project.status,
        project.priority,
        project.price,
        project.paid ? 'כן' : 'לא',
        project.completed ? 'כן' : 'לא',
        project.createdAt.toLocaleDateString('he-IL')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `projects_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setShowTasksModal(true);
  };

  const handleProjectSelectForSidebar = (project: Project) => {
    setSelectedProjectId(project.id);
    setShowTasksModal(true);
  };

  // Calculate statistics
  const stats: ProjectStats = {
    total: projects.length,
    completed: projects.filter(p => p.completed).length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    paid: projects.filter(p => p.paid).length,
    unpaid: projects.filter(p => !p.paid).length,
    totalRevenue: projects.filter(p => p.paid).reduce((sum, p) => sum + p.price, 0),
    pendingRevenue: projects.filter(p => !p.paid).reduce((sum, p) => sum + p.price, 0),
    completionRate: projects.length > 0 ? (projects.filter(p => p.completed).length / projects.length) * 100 : 0,
    paymentRate: projects.length > 0 ? (projects.filter(p => p.paid).length / projects.length) * 100 : 0
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <AppSidebar projects={projects} onProjectSelect={handleProjectSelectForSidebar} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-40 border-b bg-gradient-to-r from-white/95 via-blue-50/95 to-purple-50/95 backdrop-blur-md shadow-sm">
            <div className="flex h-16 items-center gap-4 px-6">
              {/* Logo Section */}
              <div className="flex items-center gap-4">
                {customLogo ? (
                  <div className="relative group">
                    <img 
                      src={customLogo} 
                      alt="Logo" 
                      className="h-10 w-10 object-contain rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    />
                    <button
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2">
                    <Upload className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">העלה לוגו</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
                
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent">
                    מערכת ניהול פרויקטים
                  </h1>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      <Activity className="h-3 w-3 mr-1" />
                      מתקדם
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                      <Brain className="h-3 w-3 mr-1" />
                      חכם
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex-1" />

              {/* Export Button */}
              <Button 
                variant="outline" 
                onClick={handleExportCSV}
                className="bg-white/80 backdrop-blur border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-700 transition-all duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                יצוא ל-CSV
              </Button>

              {/* Projects Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white/80 backdrop-blur border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                    <Eye className="h-4 w-4 mr-2" />
                    פרויקטים ({projects.length})
                    <ChevronDown className="h-4 w-4 mr-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-white/95 backdrop-blur border-gray-200">
                  <div className="p-2">
                    <div className="relative mb-2">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="חפש פרויקט..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10 bg-white/80"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {projects
                        .filter(project => 
                          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.clientName.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(project => (
                          <DropdownMenuItem
                            key={project.id}
                            onClick={() => handleProjectSelect(project.id)}
                            className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg mb-1"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{project.name}</div>
                              <div className="text-sm text-gray-500">{project.clientName}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge 
                                variant={project.status === 'completed' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {project.status === 'completed' ? 'הושלם' : 
                                 project.status === 'in-progress' ? 'בתהליך' : 'לא התחיל'}
                              </Badge>
                              <span className="text-xs text-gray-500">₪{project.price.toLocaleString()}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* New Project Button */}
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                פרויקט חדש
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'dashboard' | 'projects')}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/70 backdrop-blur">
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                >
                  <BarChart3 className="h-4 w-4" />
                  דשבורד
                </TabsTrigger>
                <TabsTrigger 
                  value="projects"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                >
                  <List className="h-4 w-4" />
                  פרויקטים
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <EnhancedDashboard projects={projects} stats={stats} />
              </TabsContent>

              <TabsContent value="projects">
                <ProjectsList 
                  projects={projects}
                  onUpdateProject={handleUpdateProject}
                  onDeleteProject={handleDeleteProject}
                  selectedProjectId={selectedProjectId}
                  onProjectSelect={handleProjectSelect}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <QuickTasksSidebar 
          quickTasks={[]}
          onAddTask={() => {}}
          onToggleTask={() => {}}
          onDeleteTask={() => {}}
        />

        {/* Modals */}
        <CreateProjectModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onCreateProject={handleCreateProject}
        />

        {selectedProjectId && (
          <ProjectTasksModal
            open={showTasksModal}
            onOpenChange={setShowTasksModal}
            project={projects.find(p => p.id === selectedProjectId)!}
            onAddTask={handleAddProjectTask}
            onToggleTask={handleToggleProjectTask}
            onDeleteTask={handleDeleteProjectTask}
          />
        )}

        {editingProject && (
          <ProjectEditModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            project={editingProject}
            onUpdateProject={handleUpdateProject}
          />
        )}
      </div>
    </SidebarProvider>
  );
};