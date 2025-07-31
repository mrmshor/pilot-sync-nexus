import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { QuickTasksSidebar } from './QuickTasksSidebar';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectTasksModal } from './ProjectTasksModal';
import { EnhancedDashboard } from './EnhancedDashboard';
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
        
        {/* Header - Purple gradient background exactly like the image */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-8 px-6 text-center relative">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg"></div>
            </div>
            <h1 className="text-3xl font-bold">מערכת ניהול פרויקטים Pro</h1>
          </div>
          
          {/* Buttons row */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button 
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              onClick={() => setActiveView('projects')}
            >
              פרויקטים מתקדם
            </Button>
            
            <Button 
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-6 py-2 rounded-lg"
              onClick={() => setActiveView('dashboard')}
            >
              לוח בקרה Pro
            </Button>
            
            <Button 
              variant="outline"
              size="sm" 
              onClick={handleExportCSV} 
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-4 py-2 rounded-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              ייצוא CSV
            </Button>
          </div>
          
          {/* Search and filters section */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 max-w-4xl mx-auto">
            <div className="mb-4">
              <input 
                type="text"
                placeholder="חיפוש פרויקטים..."
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button variant="ghost" className="text-white hover:bg-white/20 px-4 py-2 rounded-lg">
                כל הפרויקטים
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/20 px-4 py-2 rounded-lg">
                כל הסטטוסים
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/20 px-4 py-2 rounded-lg">
                אחרי יצירה ↑
              </Button>
              <Button 
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                פרויקט חדש
              </Button>
            </div>
          </div>
        </div>

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

              {/* Content */}
              {activeView === 'dashboard' && (
                <EnhancedDashboard projects={projects} stats={stats} />
              )}

              {activeView === 'projects' && (
                <div className="grid gap-6">
                  <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/20 p-6">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">פרויקטים ({projects.length})</h2>
                    <div className="grid gap-4">
                      {projects.map((project) => (
                        <div 
                          key={project.id}
                          className="bg-white/80 backdrop-blur rounded-xl p-4 border border-gray-200/50 hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => handleProjectSelect(project)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">{project.name}</h3>
                              <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-700">
                                  <strong>לקוח:</strong> {project.clientName}
                                </span>
                                <span className="text-green-600 font-semibold">
                                  ₪{project.price?.toLocaleString()}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                  project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {project.status === 'in-progress' ? 'בתהליך' :
                                   project.status === 'completed' ? 'הושלם' : 'מושהה'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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