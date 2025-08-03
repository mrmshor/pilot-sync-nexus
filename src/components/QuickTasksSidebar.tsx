import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QuickTask } from '@/types';
import { Plus, X, CheckCircle2, Clock, Trash2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickTasksSidebarProps {
  quickTasks: QuickTask[];
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const QuickTasksSidebar = ({ 
  quickTasks, 
  onAddTask, 
  onToggleTask, 
  onDeleteTask 
}: QuickTasksSidebarProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { toast } = useToast();

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין כותרת למשימה",
        variant: "destructive"
      });
      return;
    }
    
    onAddTask(newTaskTitle.trim());
    const taskTitle = newTaskTitle.trim();
    setNewTaskTitle('');
    toast({
      title: "משימה נוספה",
      description: `המשימה "${taskTitle}" נוספה בהצלחה`,
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

  const pendingTasks = quickTasks.filter(task => !task.completed);
  const completedTasks = quickTasks.filter(task => task.completed);

  return (
    <div className="h-full flex flex-col space-y-6 p-6 overflow-y-auto">
      {/* Add New Task */}
      <Card className="card-macos">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            משימות מהירות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="הזן משימה חדשה..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              className="flex-1"
            />
            <Button 
              onClick={handleAddTask}
              size="sm"
              className="gradient-primary text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{pendingTasks.length} ממתינות</Badge>
            <Badge variant="success">{completedTasks.length} הושלמו</Badge>
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
                size="sm"
                variant="outline"
                onClick={handleCopyPendingTasks}
                className="h-7 px-2 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all duration-200 active:scale-95"
              >
                <Copy className="w-3 h-3 ml-1" />
                העתק
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingTasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleTask(task.id)}
                  className="p-1 h-auto hover:text-success"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
                <span className="flex-1 text-sm">{task.title}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1 h-auto hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <Card className="card-macos">
          <CardHeader className="pb-3">
            <CardTitle className="text-md flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              משימות שהושלמו ({completedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedTasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20"
              >
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="flex-1 text-sm line-through text-muted-foreground">
                  {task.title}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1 h-auto hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {quickTasks.length === 0 && (
        <Card className="card-macos">
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">אין משימות מהירות</h3>
            <p className="text-muted-foreground text-sm">
              הוסף משימות מהירות לניהול יעיל יותר
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};