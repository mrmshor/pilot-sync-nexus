import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Flag,
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types';

interface QuickTask {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

interface ProjectPulseDashboardProps {
  projects: Project[];
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    paid: number;
    unpaid: number;
    totalRevenue: number;
    pendingRevenue: number;
    completionRate: number;
    paymentRate: number;
  };
}

export const ProjectPulseDashboard = ({ projects, stats }: ProjectPulseDashboardProps) => {
  const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const { toast } = useToast();

  const formatCurrency = (amount: number) => `₪${amount.toLocaleString()}`;

  const addQuickTask = () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין כותרת למשימה",
        variant: "destructive"
      });
      return;
    }

    const newTask: QuickTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      priority: selectedPriority,
      completed: false,
      createdAt: new Date()
    };

    setQuickTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    toast({
      title: "משימה נוספה",
      description: `המשימה "${newTask.title}" נוספה בהצלחה`,
    });
  };

  const toggleTask = (taskId: string) => {
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

  const deleteTask = (taskId: string) => {
    setQuickTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-3 h-3" />;
      case 'medium': return <Clock className="w-3 h-3" />;
      case 'low': return <Flag className="w-3 h-3" />;
      default: return <Flag className="w-3 h-3" />;
    }
  };

  const getPriorityLabel = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'גבוהה';
      case 'medium': return 'בינונית';
      case 'low': return 'נמוכה';
      default: return 'בינונית';
    }
  };

  const pendingTasks = quickTasks.filter(task => !task.completed);
  const completedTasks = quickTasks.filter(task => task.completed);
  const highPriorityTasks = pendingTasks.filter(task => task.priority === 'high');

  const recentProjects = projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex h-full gap-6 p-6">
      {/* Main Dashboard Content */}
      <div className="flex-1 space-y-6">
        {/* Statistics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="gradient-card hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">סה"כ פרויקטים</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-white/70">{stats.inProgress} בביצוע</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">הושלמו</p>
                  <p className="text-3xl font-bold text-white">{stats.completed}</p>
                  <p className="text-xs text-white/70">{stats.completionRate.toFixed(1)}% הושלמו</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">הכנסות</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-white/70">ששולמו</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">לקוחות</p>
                  <p className="text-3xl font-bold text-white">{new Set(projects.map(p => p.clientName)).size}</p>
                  <p className="text-xs text-white/70">לקוחות פעילים</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              סקירת התקדמות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>השלמת פרויקטים</span>
                <span>{stats.completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>אחוז תשלומים</span>
                <span>{stats.paymentRate.toFixed(1)}%</span>
              </div>
              <Progress value={stats.paymentRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200">
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pendingRevenue)}</p>
                <p className="text-sm text-orange-800">הכנסות ממתינות</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                <p className="text-sm text-blue-800">פרויקטים בביצוע</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              פרויקטים אחרונים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.clientName} • {formatCurrency(project.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                      {project.status === 'completed' ? 'הושלם' : 'בביצוע'}
                    </Badge>
                    {project.paid && <Badge variant="default">שולם</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tasks Sidebar */}
      <div className="w-80 space-y-4">
        {/* Add Task Form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              משימות מהירות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="הזן משימה חדשה..."
                onKeyPress={(e) => e.key === 'Enter' && addQuickTask()}
              />
              
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((priority) => (
                  <Button
                    key={priority}
                    variant={selectedPriority === priority ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPriority(priority)}
                    className={`flex items-center gap-1 ${selectedPriority === priority ? '' : getPriorityColor(priority)}`}
                  >
                    {getPriorityIcon(priority)}
                    {getPriorityLabel(priority)}
                  </Button>
                ))}
              </div>
              
              <Button 
                onClick={addQuickTask}
                className="w-full gradient-primary"
              >
                <Plus className="w-4 h-4 ml-2" />
                הוסף משימה
              </Button>
            </div>
            
            <div className="flex gap-2 text-sm">
              <Badge variant="outline">{pendingTasks.length} ממתינות</Badge>
              <Badge variant="default">{completedTasks.length} הושלמו</Badge>
              {highPriorityTasks.length > 0 && (
                <Badge variant="destructive">{highPriorityTasks.length} דחופות</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* High Priority Tasks */}
        {highPriorityTasks.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                משימות דחופות ({highPriorityTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {highPriorityTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center gap-2 p-2 rounded bg-white border border-red-200"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleTask(task.id)}
                    className="p-1 h-auto hover:text-green-600"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                  </Button>
                  <span className="flex-1 text-xs font-medium">{task.title}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTask(task.id)}
                    className="p-1 h-auto hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                משימות ממתינות ({pendingTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {pendingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleTask(task.id)}
                    className="p-1 h-auto hover:text-green-600"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{task.title}</p>
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                      {getPriorityIcon(task.priority)}
                      {getPriorityLabel(task.priority)}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTask(task.id)}
                    className="p-1 h-auto hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                הושלמו ({completedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-32 overflow-y-auto">
              {completedTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center gap-2 p-2 rounded bg-green-50 border border-green-200"
                >
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  <span className="flex-1 text-xs line-through text-muted-foreground">
                    {task.title}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTask(task.id)}
                    className="p-1 h-auto hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {quickTasks.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-medium mb-1">אין משימות מהירות</h3>
              <p className="text-sm text-muted-foreground">
                הוסף משימות לניהול יעיל יותר
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};