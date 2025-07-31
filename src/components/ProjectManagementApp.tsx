import React, { useState } from 'react';
import { Project } from '@/types/project';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from './ProjectCard';
import { CreateProjectDialog } from './CreateProjectDialog';
import { TasksDialog } from './TasksDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter,
  BarChart3,
  FolderOpen,
  TrendingUp,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

export const ProjectManagementApp: React.FC = () => {
  const {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask
  } = useProjects();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTasksDialog, setShowTasksDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // סינון פרויקטים
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // סטטיסטיקות
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    planning: projects.filter(p => p.status === 'planning').length,
    onHold: projects.filter(p => p.status === 'on-hold').length,
    avgProgress: projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0
  };

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'progress'>) => {
    try {
      await createProject(projectData);
      setShowCreateDialog(false);
    } catch (error) {
      toast.error('שגיאה ביצירת הפרויקט');
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowCreateDialog(true);
  };

  const handleUpdateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'progress'>) => {
    if (!editingProject) return;
    
    try {
      await updateProject(editingProject.id, projectData);
      setEditingProject(undefined);
      setShowCreateDialog(false);
    } catch (error) {
      toast.error('שגיאה בעדכון הפרויקט');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק פרויקט זה? פעולה זו לא ניתנת לביטול.')) {
      try {
        await deleteProject(projectId);
      } catch (error) {
        toast.error('שגיאה במחיקת הפרויקט');
      }
    }
  };

  const handleViewTasks = (project: Project) => {
    setSelectedProject(project);
    setShowTasksDialog(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>טוען פרויקטים...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-destructive">
          <p className="text-lg font-medium">שגיאה בטעינת הנתונים</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">מערכת ניהול פרויקטים</h1>
              <p className="text-muted-foreground">נהל את הפרויקטים שלך בצורה יעילה ומקצועית</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              פרויקט חדש
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              דשבורד
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              פרויקטים
            </TabsTrigger>
          </TabsList>

          {/* דשבורד */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">סך הכל פרויקטים</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <FolderOpen className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">פרויקטים פעילים</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">פרויקטים שהושלמו</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">אחוז התקדמות ממוצע</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.avgProgress}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* פרויקטים לפי סטטוס */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg border">
                <h3 className="font-medium mb-2">בתכנון</h3>
                <p className="text-xl font-bold text-blue-500">{stats.planning}</p>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <h3 className="font-medium mb-2">פעילים</h3>
                <p className="text-xl font-bold text-green-500">{stats.active}</p>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <h3 className="font-medium mb-2">מושהים</h3>
                <p className="text-xl font-bold text-yellow-500">{stats.onHold}</p>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <h3 className="font-medium mb-2">הושלמו</h3>
                <p className="text-xl font-bold text-gray-500">{stats.completed}</p>
              </div>
            </div>
          </TabsContent>

          {/* פרויקטים */}
          <TabsContent value="projects" className="space-y-6">
            {/* סרגל חיפוש וסינון */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="חפש פרויקטים..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="סינון לפי סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הסטטוסים</SelectItem>
                  <SelectItem value="planning">תכנון</SelectItem>
                  <SelectItem value="active">פעיל</SelectItem>
                  <SelectItem value="completed">הושלם</SelectItem>
                  <SelectItem value="on-hold">מושהה</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="סינון לפי עדיפות" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל העדיפויות</SelectItem>
                  <SelectItem value="high">גבוהה</SelectItem>
                  <SelectItem value="medium">בינונית</SelectItem>
                  <SelectItem value="low">נמוכה</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
                <Button variant="outline" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  נקה סינונים
                </Button>
              )}
            </div>

            {/* רשימת פרויקטים */}
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  {projects.length === 0 ? 'אין פרויקטים' : 'לא נמצאו פרויקטים'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {projects.length === 0 
                    ? 'צור פרויקט ראשון כדי להתחיל' 
                    : 'נסה לשנות את קריטריוני החיפוש'
                  }
                </p>
                {projects.length === 0 && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    צור פרויקט ראשון
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
                    onViewTasks={handleViewTasks}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* דיאלוגים */}
      <CreateProjectDialog
        isOpen={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setEditingProject(undefined);
        }}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        editProject={editingProject}
      />

      {selectedProject && (
        <TasksDialog
          isOpen={showTasksDialog}
          onClose={() => {
            setShowTasksDialog(false);
            setSelectedProject(undefined);
          }}
          project={selectedProject}
          onAddTask={addTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
        />
      )}
    </div>
  );
};