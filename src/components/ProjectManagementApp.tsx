import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, Edit, Trash2, User, PhoneCall, MessageCircle, Mail, 
  FolderOpen, CheckCircle2, CreditCard, Plus, Clock, Filter,
  BarChart3, TrendingUp, Users, DollarSign, Calendar, Settings,
  Download, ArrowUpDown, ListTodo, ChevronDown, AlertCircle,
  Loader2
} from 'lucide-react';
import { Project, ProjectTask } from '@/types';
import { ContactService, FolderService } from '@/services';
import { useSupabaseProjects } from '@/hooks/useSupabaseProjects';
import { CreateProjectModal } from './CreateProjectModal';
import { StatusDropdown } from './StatusDropdown';
import { PriorityDropdown } from './PriorityDropdown';
import { ProjectTasksModal } from './ProjectTasksModal';
import { ProjectEditModal } from './ProjectEditModal';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export const ProjectManagementApp = () => {
  const {
    projects,
    loading,
    searchTerm,
    setSearchTerm,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    createProject,
    updateProject,
    deleteProject,
    addTaskToProject,
    updateTask,
    deleteTask
  } = useSupabaseProjects();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects'>('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Contact handlers
  const handleContactClick = async (type: 'phone' | 'whatsapp' | 'email', value: string) => {
    if (!value) {
      toast.error("לא נמצא מידע ליצירת קשר");
      return;
    }
    
    try {
      switch (type) {
        case 'phone':
          await ContactService.makePhoneCall(value);
          toast.success(`מתקשר אל ${value}`);
          break;
        case 'whatsapp':
          await ContactService.openWhatsApp(value);
          toast.success(`פותח צ'אט עם ${value}`);
          break;
        case 'email':
          await ContactService.sendEmail(value);
          toast.success(`פותח אימייל אל ${value}`);
          break;
      }
    } catch (error) {
      toast.error("שגיאה ביצירת קשר");
    }
  };

  // Folder handlers
  const openFolder = async (folderPath: string, icloudLink: string) => {
    try {
      if (folderPath) {
        await FolderService.openFolder(folderPath);
        toast.success("פותח תיקייה...");
      } else if (icloudLink) {
        window.open(icloudLink, '_blank');
        toast.success("פותח קישור iCloud...");
      } else {
        toast.error("לא נמצאה תיקייה או קישור");
      }
    } catch (error) {
      toast.error("שגיאה בפתיחת התיקייה");
    }
  };

  // Add task handler
  const handleAddTask = async (projectId: string, taskTitle: string) => {
    await addTaskToProject(projectId, taskTitle);
  };

  // Toggle task completion
  const handleToggleTask = async (taskId: string, completed: boolean) => {
    await updateTask(taskId, { completed: !completed });
  };

  // Delete task handler
  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  // Update project status
  const handleUpdateStatus = async (projectId: string, status: Project['status']) => {
    await updateProject(projectId, { status });
  };

  // Update project priority
  const handleUpdatePriority = async (projectId: string, priority: Project['priority']) => {
    await updateProject(projectId, { priority });
  };

  // Toggle paid status
  const handleTogglePaid = async (projectId: string, paid: boolean) => {
    await updateProject(projectId, { paid: !paid });
  };

  // Statistics
  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.completed).length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    paid: projects.filter(p => p.paid).length,
    unpaid: projects.filter(p => !p.paid).length,
    totalRevenue: projects.reduce((sum, p) => sum + (p.paid ? p.price : 0), 0),
    pendingRevenue: projects.reduce((sum, p) => sum + (!p.paid ? p.price : 0), 0),
  };

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const paymentRate = (stats.totalRevenue + stats.pendingRevenue) > 0 
    ? (stats.totalRevenue / (stats.totalRevenue + stats.pendingRevenue)) * 100 : 0;

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: currency === 'ILS' ? 'ILS' : currency,
      currencyDisplay: 'symbol'
    }).format(amount);
  };

  // Get priority color
  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  // Format status
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'not-started': 'לא התחיל',
      'in-progress': 'בעבודה',
      'in-review': 'בסקירה',
      'completed': 'הושלם',
      'on-hold': 'בהמתנה'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">טוען פרויקטים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">מנהל משימות</h1>
          <p className="text-muted-foreground">מערכת ניהול פרויקטים מתקדמת</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="lg">
          <Plus className="ml-2 h-4 w-4" />
          פרויקט חדש
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'dashboard' | 'projects')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            דשבורד
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            פרויקטים
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">סך הכל פרויקטים</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">הושלמו</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <Progress value={completionRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {completionRate.toFixed(1)}% שיעור השלמה
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">הכנסות</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue, 'ILS')}</div>
                <Progress value={paymentRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {paymentRate.toFixed(1)}% שולם
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ממתינים לתשלום</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.pendingRevenue, 'ILS')}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.unpaid} פרויקטים
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>פרויקטים אחרונים</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-muted-foreground">{project.clientName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(project.priority)}>
                      {project.priority === 'high' ? 'גבוהה' : project.priority === 'medium' ? 'בינונית' : 'נמוכה'}
                    </Badge>
                    <Badge variant="outline">{formatStatus(project.status)}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חפש פרויקטים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={priorityFilter} onValueChange={(value: string) => setPriorityFilter(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="עדיפות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל העדיפויות</SelectItem>
                <SelectItem value="high">גבוהה</SelectItem>
                <SelectItem value="medium">בינונית</SelectItem>
                <SelectItem value="low">נמוכה</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="not-started">לא התחיל</SelectItem>
                <SelectItem value="in-progress">בעבודה</SelectItem>
                <SelectItem value="in-review">בסקירה</SelectItem>
                <SelectItem value="completed">הושלם</SelectItem>
                <SelectItem value="on-hold">בהמתנה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{project.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Client Info */}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{project.clientName}</span>
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex gap-2">
                    {project.phone1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleContactClick('phone', project.phone1)}
                      >
                        <PhoneCall className="h-4 w-4" />
                      </Button>
                    )}
                    {project.whatsapp1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleContactClick('whatsapp', project.whatsapp1)}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {project.email && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleContactClick('email', project.email)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    {(project.folderPath || project.icloudLink) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openFolder(project.folderPath || '', project.icloudLink || '')}
                      >
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Status and Priority */}
                  <div className="flex gap-2">
                    <StatusDropdown
                      value={project.status}
                      onChange={(status) => handleUpdateStatus(project.id, status as Project['status'])}
                    />
                    <PriorityDropdown
                      value={project.priority}
                      onChange={(priority) => handleUpdatePriority(project.id, priority as Project['priority'])}
                    />
                  </div>

                  {/* Price and Payment */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      {formatCurrency(project.price, project.currency)}
                    </span>
                    <Button
                      variant={project.paid ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTogglePaid(project.id, project.paid)}
                    >
                      <CreditCard className="h-4 w-4 ml-1" />
                      {project.paid ? 'שולם' : 'לא שולם'}
                    </Button>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">משימות ({project.tasks.length})</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setShowTasksModal(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {project.tasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="flex items-center gap-2 text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleToggleTask(task.id, task.completed)}
                          >
                            <CheckCircle2 className={`h-4 w-4 ${task.completed ? 'text-green-600' : 'text-muted-foreground'}`} />
                          </Button>
                          <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                      {project.tasks.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{project.tasks.length - 3} משימות נוספות
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {projects.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">אין פרויקטים</h3>
                <p className="text-muted-foreground mb-4">התחל ביצירת הפרויקט הראשון שלך</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="ml-2 h-4 w-4" />
                  צור פרויקט חדש
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateProjectModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateProject={async (projectData) => {
          await createProject(projectData);
          setShowCreateModal(false);
        }}
      />

      {selectedProject && (
        <>
          <ProjectTasksModal
            open={showTasksModal}
            onOpenChange={(open) => {
              setShowTasksModal(open);
              if (!open) setSelectedProject(null);
            }}
            project={selectedProject}
            onAddTask={(projectId, taskTitle) => handleAddTask(projectId, taskTitle)}
            onToggleTask={(projectId, taskId) => {
              const task = selectedProject.tasks.find(t => t.id === taskId);
              if (task) handleToggleTask(taskId, task.completed);
            }}
            onDeleteTask={(projectId, taskId) => handleDeleteTask(taskId)}
          />

          <ProjectEditModal
            open={showEditModal}
            onOpenChange={(open) => {
              setShowEditModal(open);
              if (!open) setSelectedProject(null);
            }}
            project={selectedProject}
            onUpdateProject={async (updates) => {
              await updateProject(selectedProject.id, updates);
              setShowEditModal(false);
              setSelectedProject(null);
            }}
          />
        </>
      )}
    </div>
  );
};