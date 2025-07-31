import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { QuickTasksSidebar } from './QuickTasksSidebar';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectTasksModal } from './ProjectTasksModal';
import { EnhancedDashboard } from './EnhancedDashboard';
import { ProjectsList } from './ProjectsList';
import { Project } from '../types';
import { useQuickTasks } from '../hooks/useEnhancedQuickTasks';
import { Apple, Download, Plus, X } from 'lucide-react';
import { Button } from './ui/button';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeView, setActiveView] = useState('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(
    localStorage.getItem('customLogo')
  );

  const {
    quickTasks,
    addQuickTask,
    toggleQuickTask,
    deleteQuickTask
  } = useQuickTasks();

  // Sample data initialization
  useEffect(() => {
    console.log('🔄 Loading sample data...');
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
        ]
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
        tasks: []
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
        ]
      }
    ];

    console.log('📊 Sample projects created:', sampleProjects.length, 'projects');
    setProjects(sampleProjects);
    console.log('✅ Projects state updated');
  }, []);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('גודל הקובץ גדול מדי. אנא בחר קובץ קטן מ-2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomLogo(result);
        localStorage.setItem('customLogo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setCustomLogo(null);
    localStorage.removeItem('customLogo');
  };

  const handleCreateProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: []
    };
    
    setProjects(prev => [newProject, ...prev]);
    setShowCreateModal(false);
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProjectId(project.id);
    setShowTasksModal(true);
  };

  const handleAddProjectTask = (projectId: string, title: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newTask = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date()
    };

    const updatedProject = {
      ...project,
      tasks: [...project.tasks, newTask],
      updatedAt: new Date()
    };

    handleUpdateProject(updatedProject);
  };

  const handleToggleProjectTask = (projectId: string, taskId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedTasks = project.tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date() : undefined
          }
        : task
    );

    const updatedProject = {
      ...project,
      tasks: updatedTasks,
      updatedAt: new Date()
    };

    handleUpdateProject(updatedProject);
  };

  const handleDeleteProjectTask = (projectId: string, taskId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedProject = {
      ...project,
      tasks: project.tasks.filter(task => task.id !== taskId),
      updatedAt: new Date()
    };

    handleUpdateProject(updatedProject);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => 
      p.id === updatedProject.id 
        ? { ...updatedProject, updatedAt: new Date() }
        : p
    ));
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    alert('הפרויקט נמחק בהצלחה ממערכת macOS!');
  };

  const handleExportCSV = () => {
    // Simple CSV export implementation
    const headers = [
      'שם פרויקט', 'תיאור', 'שם לקוח', 'טלפון', 'אימייל', 
      'סטטוס', 'עדיפות', 'מחיר', 'תאריך יצירה'
    ];

    const csvData = projects.map(project => [
      project.name, project.description, project.clientName,
      project.phone1, project.email, project.status, project.priority, 
      project.price, project.createdAt.toLocaleDateString('he-IL')
    ]);

    const csv = [headers, ...csvData]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `פרויקטים-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('ייצוא CSV הושלם בהצלחה עם עמודות מפורטות במיוחד עבור macOS! 🍎');
  };

  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.completed).length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    paid: projects.filter(p => p.paid).length,
    unpaid: projects.filter(p => !p.paid).length,
    totalRevenue: projects.reduce((sum, p) => sum + (p.paid ? p.price : 0), 0),
    pendingRevenue: projects.reduce((sum, p) => sum + (p.paid ? 0 : p.price), 0),
    completionRate: projects.length > 0 ? (projects.filter(p => p.completed).length / projects.length) * 100 : 0,
    paymentRate: projects.length > 0 ? (projects.filter(p => p.paid).length / projects.length) * 100 : 0
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 w-full" dir="rtl">
        
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-lg">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200/60 overflow-hidden">
                      {customLogo ? (
                        <img 
                          src={customLogo} 
                          alt="לוגו מותאם אישית" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm"></div>
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
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      מערכת ניהול פרויקטים Pro
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Apple className="h-3 w-3" />
                      <span>מותאם macOS</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportCSV} 
                  className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  ייצוא CSV
                </Button>
                
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => setShowCreateModal(true)}
                  className="gradient-primary shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  פרויקט חדש
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex w-full">
          {/* Quick Tasks Sidebar */}
          <div className="w-80 border-r border-gray-200 bg-white/50 backdrop-blur">
            <QuickTasksSidebar 
              quickTasks={quickTasks}
              onAddTask={addQuickTask}
              onToggleTask={toggleQuickTask}
              onDeleteTask={deleteQuickTask}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="p-6">
              {/* View Toggle */}
              <div className="flex justify-center mb-6">
                <div className="grid grid-cols-2 w-full max-w-md bg-white/90 backdrop-blur p-1.5 rounded-xl shadow-lg border border-gray-200/50">
                  <button
                    onClick={() => setActiveView('projects')}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                      activeView === 'projects' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                    }`}
                  >
                    רשימת פרויקטים
                  </button>
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                      activeView === 'dashboard' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                    }`}
                  >
                    לוח בקרה Pro
                  </button>
                </div>
              </div>

              {/* Content */}
              {activeView === 'dashboard' && (
                <EnhancedDashboard projects={projects} stats={stats} />
              )}

              {activeView === 'projects' && (
                <div className="space-y-6">
                  {/* Projects Cards */}
                  <div className="grid gap-4">
                    {projects.map((project) => (
                      <div 
                        key={project.id}
                        className="bg-white/90 backdrop-blur rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-200 overflow-hidden"
                      >
                        {/* Project Header */}
                        <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-4 border-b border-gray-100">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-800 mb-1">{project.name}</h3>
                              <p className="text-sm text-gray-600">{project.clientName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                project.priority === 'high' ? 'bg-red-100 text-red-700' :
                                project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {project.priority === 'high' ? 'עדיפות גבוהה' :
                                 project.priority === 'medium' ? 'עדיפות בינונית' : 'עדיפות נמוכה'}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                project.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                project.status === 'completed' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {project.status === 'in-progress' ? 'בתהליך' :
                                 project.status === 'completed' ? 'הושלם' : 'לא התחיל'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Project Content */}
                        <div className="p-4">
                          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{project.description}</p>
                          
                          {/* Price and Tasks */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-xl font-bold text-green-600">
                              ₪{project.price?.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {project.tasks?.length || 0} משימות
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleProjectSelect(project)}
                              className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                            >
                              משימות
                            </Button>
                            
                            {project.phone1 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                              >
                                בלל טלפון
                              </Button>
                            )}
                            
                            {project.whatsapp1 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                              >
                                וואטסאפ
                              </Button>
                            )}
                            
                            {project.email && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                              >
                                מייל
                              </Button>
                            )}
                            
                            {(project.folderPath || project.icloudLink) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                              >
                                פתח תיקיה
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Projects Sidebar */}
          <AppSidebar 
            projects={projects}
            onProjectSelect={handleProjectSelect}
            selectedProjectId={selectedProjectId}
          />
        </div>

        {/* Modals */}
        <CreateProjectModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onCreateProject={handleCreateProject}
        />

        <ProjectTasksModal
          open={showTasksModal}
          onOpenChange={setShowTasksModal}
          project={selectedProjectId ? projects.find(p => p.id === selectedProjectId) || null : null}
          onAddTask={handleAddProjectTask}
          onToggleTask={handleToggleProjectTask}
          onDeleteTask={handleDeleteProjectTask}
        />
      </div>
    </SidebarProvider>
  );
};

export default App;