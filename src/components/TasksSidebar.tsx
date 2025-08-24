import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  CheckSquare, 
  Menu, 
  X, 
  Plus,
  Trash2,
  Check,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Copy,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { usePersonalTasksStore, PersonalTask } from '@/store/usePersonalTasksStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type TaskPriority = 'נמוכה' | 'בינונית' | 'גבוהה';

// פונקציה לאייקונים של עדיפות
const getPriorityIcon = (priority: TaskPriority) => {
  switch (priority) {
    case 'גבוהה':
      return <ArrowUp className="w-3 h-3 text-red-500" />;
    case 'בינונית':
      return <ArrowRight className="w-3 h-3 text-yellow-500" />;
    case 'נמוכה':
      return <ArrowDown className="w-3 h-3 text-green-500" />;
    default:
      return <ArrowRight className="w-3 h-3 text-gray-400" />;
  }
};

// פונקציה לצבעים של עדיפות
const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case 'גבוהה':
      return 'text-red-600';
    case 'בינונית':
      return 'text-yellow-600';
    case 'נמוכה':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

export function TasksSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('בינונית');
  const { 
    tasks, 
    addTask, 
    toggleTask, 
    deleteTask, 
    updateTask
  } = usePersonalTasksStore();
  const { toast } = useToast();

  // משימות לא מושלמות, ממויינות לפי עדיפות
  const pendingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      const priorityOrder = { 'גבוהה': 3, 'בינונית': 2, 'נמוכה': 1 };
      const aPriority = priorityOrder[a.priority] || 1;
      const bPriority = priorityOrder[b.priority] || 1;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const completedTasks = tasks.filter(task => task.completed);

  // הוספת משימה חדשה
  const handleAddTask = () => {
    if (!newTask.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין כותרת למשימה",
        variant: "destructive"
      });
      return;
    }
    
    addTask({
      title: newTask.trim(),
      completed: false,
      priority: newTaskPriority
    });
    const taskTitle = newTask.trim();
    setNewTask('');
    setNewTaskPriority('בינונית');
    
    toast({
      title: "משימה נוספה",
      description: `המשימה "${taskTitle}" נוספה בהצלחה`,
    });
  };

  // מעבר בין מושלם ולא מושלם
  const handleToggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toggleTask(taskId);
      toast({
        title: !task.completed ? "משימה הושלמה!" : "משימה בוטלה",
        description: `המשימה "${task.title}" ${!task.completed ? 'הושלמה' : 'בוטלה'}`,
      });
    }
  };

  // מחיקת משימה
  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      deleteTask(taskId);
      toast({
        title: "משימה נמחקה",
        description: `המשימה "${task.title}" נמחקה`,
      });
    }
  };

  // עדכון עדיפות משימה
  const handlePriorityChange = (taskId: string, priority: TaskPriority) => {
    updateTask(taskId, { priority });
    toast({
      title: "עדיפות עודכנה",
      description: `העדיפות שונתה ל${priority}`,
    });
  };

  // מחיקת כל המשימות המושלמות
  const handleClearCompleted = () => {
    const completedTaskIds = completedTasks.map(task => task.id);
    completedTaskIds.forEach(id => deleteTask(id));
    toast({
      title: "מחיקה הושלמה",
      description: `${completedTaskIds.length} משימות מושלמות נמחקו`,
    });
  };
  const handleCopyPendingTasks = async () => {
    if (pendingTasks.length === 0) {
      toast({
        title: "אין משימות לעתוק",
        description: "אין משימות ממתינות בתור",
        variant: "destructive"
      });
      return;
    }

    const tasksText = pendingTasks.map(task => `• ${task.title}`).join('\n');
    
    try {
      await navigator.clipboard.writeText(tasksText);
      toast({
        title: "המשימות הועתקו",
        description: `${pendingTasks.length} משימות הועתקו ללוח`,
      });
    } catch (error) {
      toast({
        title: "שגיאה בעתיקה",
        description: "לא ניתן להעתיק את המשימות",
        variant: "destructive"
      });
    }
  };

  return (
    <div
      className={cn(
        'h-screen bg-white/95 dark:bg-gray-900/95 backdrop-blur-md transition-all duration-300 shadow-xl flex flex-col border-l border-gray-200 fixed top-0 right-0 z-30',
        isCollapsed ? 'w-12' : 'w-80'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200/30 dark:border-gray-700/30 flex-shrink-0 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-800/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="relative p-2 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-xl shadow-sm">
                <CheckSquare className="w-4 h-4 text-primary" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl animate-pulse"></div>
              </div>
              <div>
                <div className="relative">
                  <h2 className="text-sm font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    משימות אישיות
                  </h2>
                  <div className="absolute -bottom-0.5 right-0 w-8 h-0.5 bg-gradient-to-l from-primary/60 to-transparent rounded-full"></div>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tasks.length} משימות
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
          >
            {isCollapsed ? (
              <Menu size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <X size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <ScrollArea className="flex-1">
          <div className="h-full flex flex-col space-y-6 p-6">
            {/* Add New Task */}
            <Card className="card-macos">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" />
                  הוסף משימה חדשה
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Input
                    placeholder="הוסף משימה חדשה..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 flex-1">
                          {getPriorityIcon(newTaskPriority)}
                          {newTaskPriority}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
                        {(['גבוהה', 'בינונית', 'נמוכה'] as TaskPriority[]).map((priority) => (
                          <DropdownMenuItem
                            key={priority}
                            onClick={() => setNewTaskPriority(priority)}
                            className="gap-2 cursor-pointer"
                          >
                            {getPriorityIcon(priority)}
                            {priority}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      onClick={handleAddTask}
                      size="sm"
                      className="gradient-primary text-white px-4"
                      disabled={!newTask.trim()}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      הוסף
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2 text-xs text-muted-foreground pt-1">
                  <Badge variant="outline" className="text-xs">{pendingTasks.length} ממתינות</Badge>
                  <Badge variant="outline" className="text-xs">{completedTasks.length} הושלמו</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <Card className="card-macos">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md flex items-center gap-2">
                      <Clock className="w-4 h-4 text-warning" />
                      משימות ממתינות ({pendingTasks.length})
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyPendingTasks}
                      className="h-7 px-2 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all duration-200 active:scale-95"
                    >
                      <Copy className="w-3 h-3 ml-1" />
                      העתק
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-gray-200/50"
                    >
                      <div className="flex items-start gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleTask(task.id)}
                          className="p-2 h-auto hover:text-success rounded-lg hover:bg-success/10 mt-0.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        
                        <div className="flex-1 min-w-0 space-y-2">
                          <p className="text-sm font-medium leading-relaxed">{task.title}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 px-2 gap-1 hover:bg-gray-100">
                                    {getPriorityIcon(task.priority)}
                                    <span className={cn("text-xs font-medium", getPriorityColor(task.priority))}>
                                      {task.priority}
                                    </span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
                                  {(['גבוהה', 'בינונית', 'נמוכה'] as TaskPriority[]).map((priority) => (
                                    <DropdownMenuItem
                                      key={priority}
                                      onClick={() => handlePriorityChange(task.id, priority)}
                                      className="gap-2 cursor-pointer"
                                    >
                                      {getPriorityIcon(priority)}
                                      {priority}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                              
                              <span className="text-xs text-muted-foreground">
                                {new Date(task.createdAt).toLocaleDateString('he-IL')}
                              </span>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-2 h-auto hover:text-destructive rounded-lg hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <Card className="card-macos">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      משימות שהושלמו ({completedTasks.length})
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCompleted}
                      className="h-7 px-2 text-xs hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-200 active:scale-95"
                    >
                      <Trash2 className="w-3 h-3 ml-1" />
                      נקה הכל
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {completedTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg bg-success/10 border border-success/20 hover:bg-success/20 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-success mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm line-through text-muted-foreground leading-relaxed">
                            {task.title}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">
                              הושלמה {new Date(task.updatedAt).toLocaleDateString('he-IL')}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-2 h-auto hover:text-destructive rounded-lg hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {completedTasks.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center py-3 bg-muted/30 rounded-lg">
                      ועוד {completedTasks.length - 5} משימות מושלמות...
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {tasks.length === 0 && (
              <Card className="card-macos">
                <CardContent className="p-8 text-center">
                  <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">אין משימות אישיות</h3>
                  <p className="text-muted-foreground text-sm">
                    הוסף משימות אישיות לניהול יעיל יותר
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      )}

      {/* במצב מוקטן - מספר משימות */}
      {isCollapsed && tasks.length > 0 && (
        <div className="p-3">
          <div className="relative">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-xl flex items-center justify-center text-xs font-bold mx-auto shadow-sm">
              {pendingTasks.length}
            </div>
            {completedTasks.length > 0 && (
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}