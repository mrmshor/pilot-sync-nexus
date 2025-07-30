import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, Edit, Trash2, User, PhoneCall, MessageCircle, Mail, 
  FolderOpen, CheckCircle2, CreditCard, Plus, X, Clock, Filter,
  BarChart3, TrendingUp, Users, DollarSign, Calendar, Settings,
  Download, Bug, Zap, Database, Activity
} from 'lucide-react';
import { Project, ProjectTask } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { CreateProjectModal } from './CreateProjectModal';
import { StatusDropdown } from './StatusDropdown';
import { PriorityDropdown } from './PriorityDropdown';

export const ProjectManagementApp = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
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
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
        tasks: [
          { id: '1', title: 'לחזור בקרוב', completed: false, createdAt: new Date('2024-01-16') },
          { id: '2', title: 'לבצע', completed: false, createdAt: new Date('2024-01-21') },
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
    toast({
      title: "מערכת נטענה בהצלחה",
      description: `נטענו ${sampleProjects.length} פרויקטים`,
    });
  }, [toast]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.completed).length;
    const inProgressProjects = projects.filter(p => p.status === 'in-progress').length;
    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

    const totalRevenue = projects.reduce((sum, p) => sum + (p.paid ? p.price : 0), 0);
    const pendingRevenue = projects.reduce((sum, p) => sum + (p.paid ? 0 : p.price), 0);
    const paymentRate = (totalRevenue + pendingRevenue) > 0 ? (totalRevenue / (totalRevenue + pendingRevenue)) * 100 : 0;

    const unpaidProjects = projects.filter(p => !p.paid).length;

    return {
      totalProjects,
      completedProjects,
      inProgressProjects,
      completionRate,
      totalRevenue,
      pendingRevenue,
      paymentRate,
      unpaidProjects
    };
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [projects, searchTerm, priorityFilter, statusFilter]);

  // Contact handlers
  const handleContactClick = (type: 'phone' | 'whatsapp' | 'email', value: string) => {
    if (!value) return;
    
    try {
      switch (type) {
        case 'phone':
          window.open(`tel:${value}`, '_blank');
          break;
        case 'whatsapp':
          const cleanPhone = value.replace(/[^\d]/g, '');
          window.open(`https://wa.me/${cleanPhone}`, '_blank');
          break;
        case 'email':
          window.open(`mailto:${value}`, '_blank');
          break;
      }
    } catch (error) {
      console.error(`Error handling ${type} contact:`, error);
      toast({
        title: "שגיאה",
        description: `לא ניתן לפתוח את ${type}`,
        variant: "destructive"
      });
    }
  };

  const openFolder = (folderPath?: string, icloudLink?: string) => {
    if (folderPath) {
      try {
        window.open(`file://${folderPath}`, '_blank');
      } catch (error) {
        if (icloudLink) {
          window.open(icloudLink, '_blank');
        }
      }
    } else if (icloudLink) {
      window.open(icloudLink, '_blank');
    }
  };

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
    toast({
      title: "פרויקט נוצר בהצלחה",
      description: `פרויקט "${newProject.name}" נוסף למערכת`,
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'in-review': return 'outline';
      case 'on-hold': return 'destructive';
      case 'waiting': return 'outline';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-macos">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                מערכת ניהול פרויקטים Pro
              </h1>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>🍎</span>
                <span>מותאם macOS</span>
                <span>•</span>
                <span>⚡</span>
                <span>ביצועים מהירים</span>
                <span>•</span>
                <span>💾</span>
                <span>נתונים גדולים</span>
              </div>
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
            <div className="space-y-8">
              {/* System Status */}
              <Card className="card-macos bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white border-0">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">🍎</span>
                      <div>
                        <h2 className="text-2xl font-bold">מערכת ניהול פרויקטים Pro</h2>
                        <p className="text-white/80">מותאם במיוחד למחשבי Mac • ביצועים מהירים • נתונים גדולים</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="glass" onClick={handleExportCSV}>
                        <Download className="w-4 h-4 ml-2" />
                        ייצוא מתקדם
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Projects */}
                <Card className="card-macos gradient-primary text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/80 mb-1">סה"כ פרויקטים</p>
                        <p className="text-3xl font-bold mb-2">{stats.totalProjects}</p>
                        <div className="flex items-center gap-1 text-sm text-white/70">
                          <Users className="w-4 h-4" />
                          <span>{stats.inProgressProjects} בתהליך</span>
                        </div>
                      </div>
                      <div className="p-4 rounded-full bg-white/20 backdrop-blur">
                        <BarChart3 className="w-8 h-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Completed Projects */}
                <Card className="card-macos gradient-success text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/80 mb-1">פרויקטים הושלמו</p>
                        <p className="text-3xl font-bold mb-2">{stats.completedProjects}</p>
                        <div className="flex items-center gap-1 text-sm text-white/70">
                          <TrendingUp className="w-4 h-4" />
                          <span>{stats.completionRate.toFixed(1)}% השלמה</span>
                        </div>
                      </div>
                      <div className="p-4 rounded-full bg-white/20 backdrop-blur">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue */}
                <Card className="card-macos gradient-warning text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/80 mb-1">הכנסות שהתקבלו</p>
                        <p className="text-3xl font-bold mb-2">₪{stats.totalRevenue.toLocaleString()}</p>
                        <div className="flex items-center gap-1 text-sm text-white/70">
                          <DollarSign className="w-4 h-4" />
                          <span>{stats.paymentRate.toFixed(1)}% נתקבל</span>
                        </div>
                      </div>
                      <div className="p-4 rounded-full bg-white/20 backdrop-blur">
                        <CreditCard className="w-8 h-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Revenue */}
                <Card className="card-macos gradient-danger text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/80 mb-1">הכנסות ממתינות</p>
                        <p className="text-3xl font-bold mb-2">₪{stats.pendingRevenue.toLocaleString()}</p>
                        <div className="flex items-center gap-1 text-sm text-white/70">
                          <Clock className="w-4 h-4" />
                          <span>{stats.unpaidProjects} פרויקטים</span>
                        </div>
                      </div>
                      <div className="p-4 rounded-full bg-white/20 backdrop-blur">
                        <Calendar className="w-8 h-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <Card className="card-macos">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="חיפוש פרויקטים..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pr-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="all">כל העדיפויות</option>
                        <option value="high">גבוה</option>
                        <option value="medium">בינוני</option>
                        <option value="low">נמוך</option>
                      </select>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="all">כל הסטטוסים</option>
                        <option value="not-started">לא התחיל</option>
                        <option value="in-progress">בתהליך</option>
                        <option value="in-review">בבדיקה</option>
                        <option value="completed">הושלם</option>
                        <option value="on-hold">מושהה</option>
                        <option value="waiting">ממתין</option>
                      </select>
                      <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="w-4 h-4 ml-2" />
                        פרויקט חדש
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="card-macos">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{project.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{project.clientName}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getStatusBadgeVariant(project.status)} className={`status-${project.status}`}>
                            {project.status}
                          </Badge>
                          <Badge variant={getPriorityBadgeVariant(project.priority)} className={`priority-${project.priority}`}>
                            {project.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {project.description}
                      </p>
                      
                      <div className="space-y-3">
                        {/* Price and Payment */}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">
                            {getCurrencySymbol(project.currency)}{project.price.toLocaleString()}
                          </span>
                          <Badge variant={project.paid ? 'default' : 'destructive'}>
                            {project.paid ? '✅ שולם' : '⏳ ממתין לתשלום'}
                          </Badge>
                        </div>

                        {/* Contact Actions */}
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContactClick('phone', project.phone1)}
                          >
                            <PhoneCall className="w-3 h-3 ml-1" />
                            שיחה
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContactClick('whatsapp', project.whatsapp1)}
                          >
                            <MessageCircle className="w-3 h-3 ml-1" />
                            וואטסאפ
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContactClick('email', project.email)}
                          >
                            <Mail className="w-3 h-3 ml-1" />
                            מייל
                          </Button>
                          {(project.folderPath || project.icloudLink) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openFolder(project.folderPath, project.icloudLink)}
                            >
                              <FolderOpen className="w-3 h-3 ml-1" />
                              תיקייה
                            </Button>
                          )}
                        </div>

                        {/* Tasks Summary */}
                        {project.tasks.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            משימות: {project.tasks.filter(t => t.completed).length}/{project.tasks.length} הושלמו
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredProjects.length === 0 && (
                <Card className="card-macos">
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">לא נמצאו פרויקטים</h3>
                      <p className="text-sm">נסה לשנות את מילות החיפוש או הפילטרים</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};