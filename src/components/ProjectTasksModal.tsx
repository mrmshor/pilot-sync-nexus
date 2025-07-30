import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Project, ProjectTask } from '@/types';
import { Plus, CheckCircle2, Clock, Trash2, Calendar, CheckSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectTasksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onAddTask: (projectId: string, title: string) => void;
  onToggleTask: (projectId: string, taskId: string) => void;
  onDeleteTask: (projectId: string, taskId: string) => void;
}

export const ProjectTasksModal = ({ 
  open, 
  onOpenChange, 
  project, 
  onAddTask, 
  onToggleTask, 
  onDeleteTask 
}: ProjectTasksModalProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { toast } = useToast();

  if (!project) return null;

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין כותרת למשימה",
        variant: "destructive"
      });
      return;
    }
    
    onAddTask(project.id, newTaskTitle.trim());
    setNewTaskTitle('');
    toast({
      title: "משימה נוספה",
      description: `המשימה "${newTaskTitle}" נוספה לפרויקט`,
    });
  };

  const pendingTasks = project.tasks.filter(task => !task.completed);
  const completedTasks = project.tasks.filter(task => task.completed);
  const completionRate = project.tasks.length > 0 
    ? (completedTasks.length / project.tasks.length) * 100 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]" dir="rtl">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-3">
            <CheckSquare className="w-6 h-6 text-primary" />
            <div className="flex-1">
              <div className="text-xl font-bold">{project.name}</div>
              <div className="text-sm text-muted-foreground font-normal">
                לקוח: {project.clientName}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {project.tasks.length} משימות
              </Badge>
              {project.tasks.length > 0 && (
                <Badge variant={completionRate === 100 ? "success" : "secondary"}>
                  {completionRate.toFixed(0)}% הושלם
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Add New Task */}
          <div className="flex gap-3 p-4 bg-muted/30 rounded-lg">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="הזן משימה חדשה לפרויקט..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              className="flex-1"
            />
            <Button 
              onClick={handleAddTask}
              className="gradient-primary text-white"
            >
              <Plus className="w-4 h-4 ml-2" />
              הוסף
            </Button>
          </div>

          {/* Progress Bar */}
          {project.tasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>התקדמות הפרויקט</span>
                <span>{completionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          )}

          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                משימות ממתינות ({pendingTasks.length})
              </h3>
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleTask(project.id, task.id)}
                      className="p-1 h-auto hover:text-success"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        נוצר: {task.createdAt.toLocaleDateString('he-IL')}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteTask(project.id, task.id)}
                      className="p-1 h-auto hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                משימות שהושלמו ({completedTasks.length})
              </h3>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20"
                  >
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <div className="flex-1">
                      <div className="font-medium line-through text-muted-foreground">
                        {task.title}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          נוצר: {task.createdAt.toLocaleDateString('he-IL')}
                        </span>
                        {task.completedAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            הושלם: {task.completedAt.toLocaleDateString('he-IL')}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteTask(project.id, task.id)}
                      className="p-1 h-auto hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {project.tasks.length === 0 && (
            <div className="text-center py-12">
              <CheckSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">אין משימות בפרויקט</h3>
              <p className="text-muted-foreground">
                הוסף משימות כדי לעקוב אחר התקדמות הפרויקט
              </p>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <Button 
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full"
          >
            סגור
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};