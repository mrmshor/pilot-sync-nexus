import React, { useState, useEffect } from 'react';
import {
  Apple, Rocket, Gauge, Database, Download, BarChart3, Briefcase, Plus, X, List, ChevronDown
} from 'lucide-react';
import { Project } from '../types';
import { ExportService } from '../services';
import { Button } from '../components/ui/button';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { ProjectsList } from '../components/ProjectsList';
import { EnhancedDashboard } from '../components/EnhancedDashboard';
import { ProjectTasksModal } from '../components/ProjectTasksModal';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(
    localStorage.getItem('customLogo')
  );

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

  const handleProjectSelect = (project: Project) => {
    setSelectedProjectId(project.id);
    setShowTasksModal(true);
    setShowProjectsDropdown(false);
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
    ExportService.exportProjectsAdvanced(projects, 'csv');
    alert('ייצוא CSV הושלם בהצלחה עם עמודות מפורטות במיוחד עבור macOS! 🍎');
  };

  console.log('🔍 Current projects state:', projects.length, 'projects');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" dir="rtl">
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
                    <span>•</span>
                    <Gauge className="h-3 w-3" />
                    <span>ביצועים מהירים</span>
                    <span>•</span>
                    <Database className="h-3 w-3" />
                    <span>נתונים גדולים</span>
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
                ייצוא CSV מפורט
              </Button>
              
              {/* Projects Dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProjectsDropdown(!showProjectsDropdown)}
                  className="gap-2 min-w-[180px] justify-between hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    <span>רשימת פרויקטים ({projects.length})</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showProjectsDropdown ? 'rotate-180' : ''}`} />
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
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                )}
                                {project.paid && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                                <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 rotate-[-90deg]" />
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                          <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 rounded-full"></div>
                          <p className="text-sm">אין פרויקטים במערכת</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
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

      {/* Main Content */}
      <main className="w-full">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 w-full bg-white/90 backdrop-blur p-1.5 rounded-xl shadow-lg mb-8 border border-gray-200/50 max-w-md mx-auto mt-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'dashboard' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
            }`}
          >
            <BarChart3 className="h-4 w-4 mr-2 inline" />
            לוח בקרה Pro
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'projects' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
            }`}
          >
            <Briefcase className="h-4 w-4 mr-2 inline" />
            פרויקטים מתקדם
          </button>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-500 ease-in-out">
          {activeTab === 'dashboard' && (
            <EnhancedDashboard projects={projects} stats={stats} />
          )}

          {activeTab === 'projects' && (
            <ProjectsList 
              projects={projects}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              selectedProjectId={selectedProjectId}
              onProjectSelect={(projectId) => {
                setSelectedProjectId(projectId);
                setShowTasksModal(true);
              }}
            />
          )}
        </div>
      </main>

      {/* Create Project Modal */}
      <CreateProjectModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateProject={handleCreateProject}
      />

      {/* Project Tasks Modal */}
      <ProjectTasksModal
        open={showTasksModal}
        onOpenChange={setShowTasksModal}
        project={selectedProjectId ? projects.find(p => p.id === selectedProjectId) || null : null}
        onAddTask={handleAddProjectTask}
        onToggleTask={handleToggleProjectTask}
        onDeleteTask={handleDeleteProjectTask}
      />
    </div>
  );
};

export default App;