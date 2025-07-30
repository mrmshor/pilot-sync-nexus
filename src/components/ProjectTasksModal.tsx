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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden" dir="rtl">
        <DialogHeader className="pb-3 border-b">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-lg font-bold">{project.name}</div>
                <div className="text-sm text-muted-foreground font-normal">
                  {project.clientName}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {project.tasks.length} משימות
              </Badge>
              {project.tasks.length > 0 && (
                <Badge 
                  variant={completionRate === 100 ? "default" : "secondary"}
                  className={completionRate === 100 ? "bg-green-600 text-white" : ""}
                >
                  {completionRate.toFixed(0)}%
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2"
             style={{ maxHeight: 'calc(85vh - 200px)' }}>
          {/* Add New Task */}
          <div className="flex gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="הזן משימה חדשה..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              className="flex-1 text-sm"
            />
            <Button 
              onClick={handleAddTask}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          {project.tasks.length > 0 && (
            <div className="space-y-2 bg-white dark:bg-gray-900 p-3 rounded-lg border">
              <div className="flex justify-between text-sm font-medium">
                <span>התקדמות</span>
                <span className="text-blue-600">{completionRate.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          )}

          {/* All Tasks - Simplified */}
          {project.tasks.length > 0 && (
            <div className="space-y-2">
              {project.tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    task.completed 
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onToggleTask(project.id, task.id)}
                    className={`p-1 h-8 w-8 flex items-center justify-center rounded-full transition-colors ${
                      task.completed 
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${
                      task.completed 
                        ? 'line-through text-gray-500 dark:text-gray-400' 
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
                      <span>נוצר: {task.createdAt.toLocaleDateString('he-IL')}</span>
                      {task.completed && task.completedAt && (
                        <span className="text-green-600 dark:text-green-400">
                          הושלם: {task.completedAt.toLocaleDateString('he-IL')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteTask(project.id, task.id)}
                    className="p-1 h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {project.tasks.length === 0 && (
            <div className="text-center py-8">
              <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-base mb-1 text-gray-700 dark:text-gray-300">אין משימות בפרויקט</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                הוסף משימות כדי לעקוב אחר התקדמות הפרויקט
              </p>
            </div>
          )}
        </div>

        <div className="border-t pt-3 flex gap-2">
          <Button 
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1"
          >
            סגור
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};