import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  MoreVertical,
  Timer,
  Copy,
  Share
} from 'lucide-react';
import { usePersonalTasksStore } from '@/store/usePersonalTasksStore';
import { useToast } from '@/hooks/use-toast';

type Priority = 'נמוכה' | 'בינונית' | 'גבוהה';

// פונקציה לאייקונים של עדיפות
const getPriorityIcon = (priority: Priority) => {
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

export function TasksSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('בינונית');
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
    if (!newTask.trim()) return;
    
    addTask({
      title: newTask.trim(),
      completed: false,
      priority: newTaskPriority
    });
    setNewTask('');
    setNewTaskPriority('בינונית');
    
    toast({
      title: "משימה נוספה!",
      description: `המשימה "${newTask}" נוספה בהצלחה`,
    });
  };

  // מעבר בין מושלם ולא מושלם
  const handleToggleTask = (taskId: string) => {
    toggleTask(taskId);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toast({
        title: task.completed ? "משימה בוטלה" : "משימה הושלמה!",
        description: `המשימה "${task.title}" ${task.completed ? 'בוטלה' : 'הושלמה'}`,
      });
    }
  };

  // מחיקת משימה
  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && confirm(`האם אתה בטוח שברצונך למחוק את המשימה "${task.title}"?`)) {
      deleteTask(taskId);
      toast({
        title: "משימה נמחקה",
        description: `המשימה "${task.title}" נמחקה`,
      });
    }
  };

  // עדכון עדיפות משימה
  const handlePriorityChange = (taskId: string, priority: Priority) => {
    updateTask(taskId, { priority });
    toast({
      title: "עדיפות עודכנה",
      description: `העדיפות שונתה ל${priority}`,
    });
  };

  // מחיקת כל המשימות המושלמות
  const clearCompleted = () => {
    const completedTaskIds = completedTasks.map(task => task.id);
    completedTaskIds.forEach(id => deleteTask(id));
    toast({
      title: "מחיקה הושלמה",
      description: `${completedTaskIds.length} משימות מושלמות נמחקו`,
    });
  };

  // העתקת משימות ממתינות
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

  // ייצוא משימות להערות
  const exportPendingTasksToNotes = () => {
    if (pendingTasks.length === 0) {
      toast({
        title: "אין משימות לייצא",
        description: "אין משימות ממתינות לייצוא",
        variant: "destructive"
      });
      return;
    }

    const notesContent = [
      'משימות אישיות לביצוע:',
      '',
      ...pendingTasks.map((task, index) => `${index + 1}. ${task.title} (עדיפות: ${task.priority})`),
      '',
      `נוצר ב: ${new Date().toLocaleDateString('he-IL')}`
    ].join('\n');

    // Try to use native Notes app
    if (navigator.share) {
      navigator.share({
        title: 'משימות אישיות',
        text: notesContent
      }).catch(() => {
        // Fallback to copy to clipboard
        navigator.clipboard.writeText(notesContent);
        toast({
          title: "המשימות הועתקו",
          description: "המשימות הועתקו ללוח, הדבק בהערות",
        });
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(notesContent);
      toast({
        title: "המשימות הועתקו",
        description: "המשימות הועתקו ללוח, הדבק בהערות",
      });
    }
  };

  // מצב מצומצם
  if (isCollapsed) {
    return (
      <div className="fixed right-0 top-0 h-screen w-16 bg-white border-l shadow-lg flex flex-col items-center py-4 z-40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="mb-4"
        >
          <Menu className="w-4 h-4" />
        </Button>
        
        <div className="flex flex-col gap-2">
          <Badge variant="secondary" className="text-xs">
            {pendingTasks.length}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-screen w-full sm:w-96 lg:w-80 bg-white border-l shadow-lg z-40 flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200/30 dark:border-gray-700/30 flex-shrink-0 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-2 sm:p-3 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-xl shadow-sm">
              <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl animate-pulse"></div>
            </div>
            <div>
              <div className="relative">
                <h2 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  משימות אישיות
                </h2>
                <div className="absolute -bottom-0.5 right-0 w-8 h-0.5 bg-gradient-to-l from-primary/60 to-transparent rounded-full"></div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {tasks.length} משימות
              </p>
            </div>
          </div>
        
          <div className="flex gap-2 sm:gap-3">
            {completedTasks.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearCompleted}
                title="נקה משימות מושלמות"
                className="touch-target p-3"
              >
                <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
              </Button>
            )}
            
            {pendingTasks.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={exportPendingTasksToNotes}
                title="ייצא להערות"
                className="touch-target p-3"
              >
                <Share className="w-5 h-5 sm:w-4 sm:h-4" />
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="lg:inline-flex hidden"
            >
              <X className="w-4 h-4" />
            </Button>
            
            {/* Mobile Close Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                // Close mobile sidebar when X is clicked
                if (window.innerWidth < 1024) {
                  const event = new CustomEvent('closeMobileTasksSidebar');
                  window.dispatchEvent(event);
                }
              }}
              className="lg:hidden touch-target p-3"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add New Task */}
      <div className="p-4 sm:p-6 border-b">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Input
            placeholder="הוסף משימה חדשה..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            className="flex-1 rtl text-base py-4 h-12 rounded-xl"
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 py-4 px-6 text-base h-12 rounded-xl whitespace-nowrap">
                {getPriorityIcon(newTaskPriority)}
                {newTaskPriority}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
              {(['גבוהה', 'בינונית', 'נמוכה'] as Priority[]).map((priority) => (
                <DropdownMenuItem
                  key={priority}
                  onClick={() => setNewTaskPriority(priority)}
                  className="gap-2 py-3 text-base touch-target"
                >
                  {getPriorityIcon(priority)}
                  {priority}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Button 
          onClick={handleAddTask} 
          disabled={!newTask.trim()}
          className="w-full py-4 h-12 text-base font-medium rounded-xl"
          size="sm"
        >
          <Plus className="w-5 h-5 mr-3" />
          הוסף משימה
        </Button>
        
        <div className="flex gap-3 mt-4 text-sm text-muted-foreground">
          <Badge variant="outline" className="py-2 px-3 text-sm">{pendingTasks.length} ממתינות</Badge>
          <Badge variant="outline" className="py-2 px-3 text-sm">{completedTasks.length} הושלמו</Badge>
        </div>
      </div>

      {/* Tasks List */}
      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6">
          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-medium text-muted-foreground flex items-center gap-2">
                  <Timer className="w-5 h-5 sm:w-4 sm:h-4" />
                  ממתינות ({pendingTasks.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPendingTasks}
                  className="h-10 px-4 text-sm hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all duration-200 active:scale-95 touch-target"
                >
                  <Copy className="w-4 h-4 ml-1" />
                  העתק
                </Button>
              </div>
              
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-5 rounded-2xl border-2 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md group"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id)}
                      className="scale-125 touch-target"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-base sm:text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-foreground transition-colors">{task.title}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-auto p-2 gap-2 hover:bg-white/80 rounded-xl self-start">
                              {getPriorityIcon(task.priority)}
                              <span className="text-sm font-medium">{task.priority}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
                            {(['גבוהה', 'בינונית', 'נמוכה'] as Priority[]).map((priority) => (
                              <DropdownMenuItem
                                key={priority}
                                onClick={() => handlePriorityChange(task.id, priority)}
                                className="gap-2 py-3 text-base touch-target"
                              >
                                {getPriorityIcon(priority)}
                                {priority}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <Badge variant="secondary" className="text-sm px-3 py-1 bg-gray-100 text-gray-600">
                          {new Date(task.createdAt).toLocaleDateString('he-IL')}
                        </Badge>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
                        <DropdownMenuItem
                          onClick={() => handleDeleteTask(task.id)}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          מחק משימה
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  הושלמו ({completedTasks.length})
                </h3>
              </div>
              
              <div className="space-y-3">
                {completedTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-4 rounded-xl border bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50 shadow-sm"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id)}
                      className="scale-110"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-through text-gray-600 truncate font-medium">
                        {task.title}
                      </p>
                      <Badge variant="secondary" className="text-xs mt-2 px-2 py-1 bg-green-100 text-green-700">
                        הושלמה {new Date(task.updatedAt).toLocaleDateString('he-IL')}
                      </Badge>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {completedTasks.length > 5 && (
                  <div className="text-center">
                    <Badge variant="outline" className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600">
                      ועוד {completedTasks.length - 5} משימות מושלמות...
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="text-center py-12">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">אין משימות עדיין</h3>
              <p className="text-sm text-muted-foreground">
                הוסף משימה ראשונה כדי להתחיל
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}