// 🚀 ProjectPilot Sync - ULTIMATE UPGRADE
// העתק את הקוד הזה ושלח ל-Lovable!

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Project, ProjectTask, QuickTask } from '@/types';
import {
  Plus, X, Clock, CheckCircle2, Circle, Download, FileText, Phone, Mail,
  MessageCircle, FolderOpen, Star, TrendingUp, TrendingDown, DollarSign,
  Users, Target, AlertTriangle, BarChart3, PieChart, Activity, Zap,
  Sparkles, Rocket, Apple, Settings, Search, Filter, Save, Upload,
  Eye, EyeOff, Calendar, MapPin, Globe, Smartphone, Tablet, Monitor
} from 'lucide-react';

// Apple Notes Integration Service
class AppleNotesService {
  static async createNote(title: string, content: string): Promise<boolean> {
    try {
      const noteContent = `${title}\n\n${content}`;
      const encodedContent = encodeURIComponent(noteContent);
      const notesUrl = `notes://new?content=${encodedContent}`;
      
      if (typeof window !== 'undefined') {
        if ((window as any).electronAPI) {
          await (window as any).electronAPI.openUrl(notesUrl);
          return true;
        } else {
          const newWindow = window.open(notesUrl, '_blank');
          if (!newWindow) {
            this.downloadAsTextFile(title, content);
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error creating note:', error);
      this.downloadAsTextFile(title, content);
      return false;
    }
  }

  static async exportProjectToNotes(project: Project): Promise<boolean> {
    const content = `
📊 פרויקט: ${project.name}
👤 לקוח: ${project.clientName}
💰 מחיר: ${project.price} ${project.currency}
📱 טלפון: ${project.phone1}
📧 אימייל: ${project.email}
📁 תיקייה: ${project.folderPath || 'לא נבחרה'}

📝 תיאור:
${project.description}

✅ משימות (${project.tasks.length}):
${project.tasks.map((task, index) => 
  `${index + 1}. ${task.completed ? '✓' : '○'} ${task.title}`
).join('\n')}

📈 סטטיסטיקות:
• סטטוס: ${this.getStatusInHebrew(project.status)}
• עדיפות: ${this.getPriorityInHebrew(project.priority)}
• שולם: ${project.paid ? 'כן ✅' : 'לא ⏳'}
• הושלם: ${project.completed ? 'כן ✅' : 'לא ⏳'}

---
📅 נוצר: ${project.createdAt.toLocaleDateString('he-IL')}
🔄 עודכן: ${project.updatedAt.toLocaleDateString('he-IL')}

יוצא מ-ProjectPilot Sync 🚀`.trim();

    return await this.createNote(`פרויקט: ${project.name}`, content);
  }

  static async exportQuickTasksToNotes(tasks: QuickTask[]): Promise<boolean> {
    const completedTasks = tasks.filter(t => t.completed);
    const pendingTasks = tasks.filter(t => !t.completed);
    
    const content = `
📋 רשימת משימות מהירות - ${new Date().toLocaleDateString('he-IL')}

📊 סיכום:
• סה"כ משימות: ${tasks.length}
• הושלמו: ${completedTasks.length}
• בהמתנה: ${pendingTasks.length}
• אחוז השלמה: ${tasks.length > 0 ? ((completedTasks.length / tasks.length) * 100).toFixed(1) : 0}%

✅ משימות שהושלמו (${completedTasks.length}):
${completedTasks.map((task, index) => 
  `${index + 1}. ✓ ${task.title}\n   🕐 הושלם: ${task.completedAt?.toLocaleDateString('he-IL') || 'לא ידוע'}`
).join('\n\n')}

⏳ משימות בהמתנה (${pendingTasks.length}):
${pendingTasks.map((task, index) => 
  `${index + 1}. ○ ${task.title}\n   🕐 נוצר: ${task.createdAt.toLocaleDateString('he-IL')}`
).join('\n\n')}

---
📅 יוצא: ${new Date().toLocaleString('he-IL')}
🚀 מ-ProjectPilot Sync`.trim();

    return await this.createNote(`משימות מהירות - ${new Date().toISOString().split('T')[0]}`, content);
  }

  private static downloadAsTextFile(title: string, content: string): void {
    try {
      const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  }

  private static getStatusInHebrew(status: string): string {
    const statusMap: Record<string, string> = {
      'not-started': 'לא התחיל',
      'in-progress': 'בתהליך',
      'in-review': 'בסקירה',
      'completed': 'הושלם',
      'on-hold': 'ממתין',
      'waiting': 'ממתין'
    };
    return statusMap[status] || status;
  }

  private static getPriorityInHebrew(priority: string): string {
    const priorityMap: Record<string, string> = {
      'low': 'נמוכה',
      'medium': 'בינונית',
      'high': 'גבוהה'
    };
    return priorityMap[priority] || priority;
  }
}

// Storage Service
class StorageService {
  private static PROJECTS_KEY = 'projectpilot_projects';
  private static QUICK_TASKS_KEY = 'projectpilot_quick_tasks';

  static saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }

  static loadProjects(): Project[] {
    try {
      const data = localStorage.getItem(this.PROJECTS_KEY);
      if (data) {
        const projects = JSON.parse(data);
        return projects.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          tasks: p.tasks.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            completedAt: t.completedAt ? new Date(t.completedAt) : undefined
          }))
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  static saveQuickTasks(tasks: QuickTask[]): void {
    try {
      localStorage.setItem(this.QUICK_TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving quick tasks:', error);
    }
  }

  static loadQuickTasks(): QuickTask[] {
    try {
      const data = localStorage.getItem(this.QUICK_TASKS_KEY);
      if (data) {
        const tasks = JSON.parse(data);
        return tasks.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          completedAt: t.completedAt ? new Date(t.completedAt) : undefined
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading quick tasks:', error);
      return [];
    }
  }

  static exportToCSV(projects: Project[]): void {
    try {
      const headers = [
        'שם פרויקט', 'לקוח', 'תיאור', 'סטטוס', 'עדיפות', 'מחיר', 'מטבע',
        'שולם', 'הושלם', 'טלפון 1', 'טלפון 2', 'וואטסאפ 1', 'וואטסאפ 2',
        'אימייל', 'תיקייה', 'נוצר', 'עודכן', 'משימות', 'משימות הושלמו'
      ];

      const csvData = projects.map(project => [
        project.name,
        project.clientName,
        project.description,
        project.status,
        project.priority,
        project.price,
        project.currency,
        project.paid ? 'כן' : 'לא',
        project.completed ? 'כן' : 'לא',
        project.phone1,
        project.phone2 || '',
        project.whatsapp1,
        project.whatsapp2 || '',
        project.email,
        project.folderPath || '',
        project.createdAt.toLocaleDateString('he-IL'),
        project.updatedAt.toLocaleDateString('he-IL'),
        project.tasks.length,
        project.tasks.filter(t => t.completed).length
      ]);

      const csv = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
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
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  }
}

// Advanced Dashboard Component
const AdvancedDashboard: React.FC<{ projects: Project[]; quickTasks: QuickTask[] }> = ({ projects, quickTasks }) => {
  const totalRevenue = projects.reduce((sum, p) => sum + (p.paid ? p.price : 0), 0);
  const pendingRevenue = projects.reduce((sum, p) => sum + (p.paid ? 0 : p.price), 0);
  const completionRate = projects.length > 0 ? (projects.filter(p => p.completed).length / projects.length) * 100 : 0;
  const activeProjects = projects.filter(p => p.status === 'in-progress').length;

  const priorityStats = {
    high: projects.filter(p => p.priority === 'high').length,
    medium: projects.filter(p => p.priority === 'medium').length,
    low: projects.filter(p => p.priority === 'low').length
  };

  const recentProjects = projects
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  const urgentProjects = projects.filter(p => 
    p.priority === 'high' && p.status !== 'completed'
  ).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-success text-white shadow-elegant animate-slide-up border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">סה״כ הכנסות</p>
                <p className="text-2xl font-bold">₪{totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-sm text-white/70">
                  <TrendingUp className="h-3 w-3" />
                  +12.5%
                </div>
              </div>
              <div className="p-3 rounded-full bg-white/20 animate-pulse-glow">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-warning text-white shadow-elegant animate-slide-up border-0" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">הכנסות ממתינות</p>
                <p className="text-2xl font-bold">₪{pendingRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-sm text-white/70">
                  <Clock className="h-3 w-3" />
                  {projects.filter(p => !p.paid).length} פרויקטים
                </div>
              </div>
              <div className="p-3 rounded-full bg-white/20 animate-pulse-glow">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-primary text-white shadow-glow animate-slide-up border-0" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">אחוז השלמה</p>
                <p className="text-2xl font-bold">{completionRate.toFixed(1)}%</p>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-1000" 
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
              <div className="p-3 rounded-full bg-white/20 animate-pulse-glow">
                <Target className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-elegant animate-slide-up border-0" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">פרויקטים פעילים</p>
                <p className="text-2xl font-bold">{activeProjects}</p>
                <div className="flex items-center gap-1 text-sm text-white/70">
                  <Activity className="h-3 w-3" />
                  מתוך {projects.length}
                </div>
              </div>
              <div className="p-3 rounded-full bg-white/20 animate-pulse-glow">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              חלוקה לפי עדיפות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>עדיפות גבוהה</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{priorityStats.high}</span>
                  <Progress value={projects.length > 0 ? (priorityStats.high / projects.length) * 100 : 0} className="w-20" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>עדיפות בינונית</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{priorityStats.medium}</span>
                  <Progress value={projects.length > 0 ? (priorityStats.medium / projects.length) * 100 : 0} className="w-20" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>עדיפות נמוכה</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{priorityStats.low}</span>
                  <Progress value={projects.length > 0 ? (priorityStats.low / projects.length) * 100 : 0} className="w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tasks Summary */}
        <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              משימות מהירות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {quickTasks.filter(t => t.completed).length}/{quickTasks.length}
                </div>
                <p className="text-muted-foreground">משימות הושלמו</p>
              </div>
              <Progress 
                value={quickTasks.length > 0 ? (quickTasks.filter(t => t.completed).length / quickTasks.length) * 100 : 0} 
                className="h-3"
              />
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-bold text-green-600">{quickTasks.filter(t => t.completed).length}</div>
                  <div className="text-muted-foreground">הושלמו</div>
                </div>
                <div>
                  <div className="font-bold text-blue-600">{quickTasks.filter(t => !t.completed).length}</div>
                  <div className="text-muted-foreground">בהמתנה</div>
                </div>
                <div>
                  <div className="font-bold text-purple-600">{quickTasks.length}</div>
                  <div className="text-muted-foreground">סך הכל</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Urgent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              פעילות אחרונה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProjects.length > 0 ? recentProjects.map(project => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">{project.clientName}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                      {project.status === 'completed' ? 'הושלם' : 'בתהליך'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {project.updatedAt.toLocaleDateString('he-IL')}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>אין פרויקטים עדיין</p>
                  <p className="text-sm">צור פרויקט ראשון כדי לראות פעילות</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Urgent Projects */}
        <Card className="bg-white/70 backdrop-blur-sm border border-white/20 border-l-4 border-l-red-500 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              פרויקטים דחופים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentProjects.length > 0 ? urgentProjects.map(project => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div>
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">{project.clientName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">₪{project.price.toLocaleString()}</div>
                    <Badge variant="destructive">דחוף</Badge>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>אין פרויקטים דחופים! 🎉</p>
                  <p className="text-sm">כל הפרויקטים בעדיפות גבוהה הושלמו</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Super Quick Tasks Component
const SuperQuickTasks: React.FC<{
  tasks: QuickTask[];
  onTasksChange: (tasks: QuickTask[]) => void;
}> = ({ tasks, onTasksChange }) => {
  const [newTask, setNewTask] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const { toast } = useToast();

  const addTask = useCallback(() => {
    if (!newTask.trim()) return;
    
    const task: QuickTask = {
      id: Date.now().toString(),
      title: newTask.trim(),
      completed: false,
      createdAt: new Date()
    };
    
    const updatedTasks = [task, ...tasks];
    onTasksChange(updatedTasks);
    setNewTask('');
    
    toast({
      title: "משימה נוספה!",
      description: `"${task.title}" נוספה לרשימה`,
      duration: 2000,
    });
  }, [newTask, tasks, onTasksChange, toast]);

  const toggleTask = useCallback((id: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id 
        ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date() : undefined
          }
        : task
    );
    onTasksChange(updatedTasks);
  }, [tasks, onTasksChange]);

  const deleteTask = useCallback((id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    onTasksChange(updatedTasks);
    
    toast({
      title: "משימה נמחקה",
      description: "המשימה נמחקה בהצלחה",
      duration: 2000,
    });
  }, [tasks, onTasksChange, toast]);

  const exportToNotes = useCallback(async () => {
    const success = await AppleNotesService.exportQuickTasksToNotes(tasks);
    
    toast({
      title: success ? "יוצא לפתקים!" : "נוצר קובץ טקסט",
      description: success 
        ? "המשימות יוצאו לאפליקציית הפתקים של אפל" 
        : "הקובץ נשמר להורדה במקום",
      duration: 3000,
    });
  }, [tasks, toast]);

  const activeTasks = showCompleted ? tasks : tasks.filter(t => !t.completed);
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <Card className="h-full bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30 border-0 shadow-elegant">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Zap className="h-5 w-5" />
            משימות מהירות
          </div>
          <Badge variant="secondary" className="bg-white/80 dark:bg-black/20">
            {tasks.length - completedCount}/{tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add Task */}
        <div className="flex gap-2">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="הוסף משימה מהירה..."
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            className="border-0 bg-white/60 dark:bg-black/20 focus:bg-white dark:focus:bg-black/40 transition-all duration-300"
          />
          <Button 
            onClick={addTask}
            size="sm"
            variant="gradient"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-xs bg-white/40 hover:bg-white/60 dark:bg-black/20 dark:hover:bg-black/40 border-0"
          >
            {showCompleted ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                הסתר הושלמו
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                הצג הושלמו ({completedCount})
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToNotes}
            className="text-xs bg-white/40 hover:bg-white/60 dark:bg-black/20 dark:hover:bg-black/40 border-0"
          >
            <Apple className="h-3 w-3 mr-1" />
            ייצא לפתקים
          </Button>
        </div>

        {/* Tasks List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {activeTasks.map((task) => (
            <div
              key={task.id}
              className={`
                flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 group hover:shadow-md hover:scale-[1.02]
                ${task.completed 
                  ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30' 
                  : 'bg-white/60 dark:bg-black/20 border-gray-200/50 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-black/40'
                }
              `}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="transition-all duration-300"
              />
              
              <div className="flex-1 min-w-0">
                <p className={`
                  text-sm transition-all duration-300
                  ${task.completed 
                    ? 'line-through text-muted-foreground' 
                    : 'text-foreground'
                  }
                `}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {task.completed && task.completedAt
                      ? `הושלם: ${task.completedAt.toLocaleDateString('he-IL')}`
                      : `נוצר: ${task.createdAt.toLocaleDateString('he-IL')}`
                    }
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-950/30"
              >
                <X className="h-3 w-3 text-red-500" />
              </Button>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Circle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>אין משימות עדיין</p>
            <p className="text-sm">הוסף משימה ראשונה כדי להתחיל</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Ultimate Component
const UltimateProjectPilot: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [quickTasks, setQuickTasks] = useState<QuickTask[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  // Load data on mount
  useEffect(() => {
    const loadedProjects = StorageService.loadProjects();
    const loadedQuickTasks = StorageService.loadQuickTasks();
    setProjects(loadedProjects);
    setQuickTasks(loadedQuickTasks);
  }, []);

  // Save projects when changed
  useEffect(() => {
    StorageService.saveProjects(projects);
  }, [projects]);

  // Save quick tasks when changed
  useEffect(() => {
    StorageService.saveQuickTasks(quickTasks);
  }, [quickTasks]);

  const handleExportCSV = () => {
    StorageService.exportToCSV(projects);
    toast({
      title: "יוצא CSV!",
      description: "הקובץ נשמר להורדה",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center animate-float">
                  <Rocket className="h-5 w-5 text-white animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    ProjectPilot Sync
                  </h1>
                  <p className="text-xs text-muted-foreground">Ultimate Edition</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="hover:bg-white/60">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => AppleNotesService.exportQuickTasksToNotes(quickTasks)}
                className="hover:bg-white/60"
              >
                <Apple className="h-4 w-4 mr-2" />
                יצא לפתקים
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto bg-white/60 dark:bg-black/20 p-1.5 rounded-xl shadow-elegant">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md text-sm font-medium"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              דשבורד
            </TabsTrigger>
            <TabsTrigger 
              value="projects" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md text-sm font-medium"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              פרויקטים
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md text-sm font-medium"
            >
              <Zap className="h-4 w-4 mr-2" />
              משימות
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="dashboard">
              <AdvancedDashboard projects={projects} quickTasks={quickTasks} />
            </TabsContent>

            <TabsContent value="projects">
              <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>רשימת פרויקטים</span>
                    <Badge variant="secondary">{projects.length} פרויקטים</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">רשימת הפרויקטים תופיע כאן</h3>
                    <p className="text-sm">
                      זהו הרכיב הבסיסי - השלם את האינטגרציה עם הרכיבים הקיימים שלך
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SuperQuickTasks 
                    tasks={quickTasks} 
                    onTasksChange={setQuickTasks}
                  />
                </div>
                <div>
                  <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-elegant">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        הגדרות מהירות
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => AppleNotesService.exportQuickTasksToNotes(quickTasks)}
                      >
                        <Apple className="h-4 w-4 mr-2" />
                        ייצא לפתקים של אפל
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        שמור גיבוי מקומי
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        טען מגיבוי
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-white/30 dark:bg-black/30 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>ProjectPilot Sync Ultimate Edition</span>
            </div>
            <div className="flex items-center gap-4">
              <span>פרויקטים: {projects.length}</span>
              <span>משימות: {quickTasks.length}</span>
              <span>הכנסות: ₪{projects.reduce((sum, p) => sum + (p.paid ? p.price : 0), 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UltimateProjectPilot;