import React, { useState, useEffect } from 'react';
import {
  Apple, Rocket, Gauge, Database, Download, BarChart3, Briefcase
} from 'lucide-react';
import { Project } from '../types';
import { ExportService } from '../services';
import { Button } from '../components/ui/button';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { ProjectsList } from '../components/ProjectsList';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();

  // Sample data initialization
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
        status: 'waiting',
        priority: 'medium',
        price: 8000,
        currency: 'ILS',
        paid: false,
        completed: false,
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
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-02-10'),
        tasks: [
          { id: '1', title: 'מדידת הבגדים', completed: true, createdAt: new Date('2024-01-21'), completedAt: new Date('2024-01-25') },
          { id: '2', title: 'הזמנת חומרי גלם', completed: false, createdAt: new Date('2024-01-26') }
        ]
      }
    ];

    setProjects(sampleProjects);
  }, []);

  const handleCreateProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: []
    };
    
    setProjects(prev => [newProject, ...prev]);
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

  // Statistics calculation
  const stats = {
    totalProjects: projects.length,
    completedProjects: projects.filter(p => p.completed).length,
    inProgressProjects: projects.filter(p => p.status === 'in-progress').length,
    totalRevenue: projects.reduce((sum, p) => sum + (p.paid ? p.price : 0), 0),
    pendingRevenue: projects.reduce((sum, p) => sum + (p.paid ? 0 : p.price), 0),
    completionRate: projects.length > 0 ? (projects.filter(p => p.completed).length / projects.length) * 100 : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Rocket className="h-6 w-6 text-white" />
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
              <CreateProjectModal onCreateProject={handleCreateProject} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 w-full max-w-md mx-auto bg-white/90 backdrop-blur p-1.5 rounded-xl shadow-lg mb-8 border border-gray-200/50">
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
            <div className="space-y-8">
              {/* macOS System Status Banner */}
              <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white border-0 shadow-2xl rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Apple className="h-8 w-8 text-white" />
                    <div>
                      <h2 className="text-xl font-bold">מערכת ניהול פרויקטים Pro</h2>
                      <p className="text-sm text-white/80">מותאם במיוחד למחשבי Mac • ביצועים מהירים • נתונים גדולים</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCSV}
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      ייצוא מתקדם
                    </Button>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80 mb-1">סה"כ פרויקטים</p>
                      <p className="text-3xl font-bold mb-2">{stats.totalProjects}</p>
                      <div className="flex items-center gap-1 text-sm text-white/70">
                        <Briefcase className="h-3 w-3" />
                        {stats.inProgressProjects} בתהליך
                      </div>
                    </div>
                    <div className="p-4 rounded-full bg-white/20 backdrop-blur">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80 mb-1">פרויקטים שהושלמו</p>
                      <p className="text-3xl font-bold mb-2">{stats.completedProjects}</p>
                      <div className="flex items-center gap-1 text-sm text-white/70">
                        <BarChart3 className="h-3 w-3" />
                        {stats.completionRate.toFixed(1)}% השלמה
                      </div>
                    </div>
                    <div className="p-4 rounded-full bg-white/20 backdrop-blur">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80 mb-1">סך הכנסות</p>
                      <p className="text-3xl font-bold mb-2">₪{stats.totalRevenue.toLocaleString()}</p>
                      <div className="flex items-center gap-1 text-sm text-white/70">
                        <BarChart3 className="h-3 w-3" />
                        שולם
                      </div>
                    </div>
                    <div className="p-4 rounded-full bg-white/20 backdrop-blur">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-amber-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80 mb-1">הכנסות ממתינות</p>
                      <p className="text-3xl font-bold mb-2">₪{stats.pendingRevenue.toLocaleString()}</p>
                      <div className="flex items-center gap-1 text-sm text-white/70">
                        <BarChart3 className="h-3 w-3" />
                        ממתין
                      </div>
                    </div>
                    <div className="p-4 rounded-full bg-white/20 backdrop-blur">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Gauge className="h-6 w-6 text-indigo-600" />
                    <div>
                      <h3 className="font-semibold text-gray-800">ביצועי מערכת macOS</h3>
                      <p className="text-sm text-gray-600">מותאם לניהול נתונים גדולים עם מהירות מקסימלית</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{projects.length}</div>
                      <div className="text-xs text-gray-500">פרויקטים</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">⚡</div>
                      <div className="text-xs text-gray-500">מהיר</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <ProjectsList 
              projects={projects}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              selectedProjectId={selectedProjectId}
              onProjectSelect={setSelectedProjectId}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;