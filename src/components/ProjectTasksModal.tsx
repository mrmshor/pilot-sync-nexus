import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Project, ProjectTask } from '@/types';
import { Plus, CheckCircle2, Trash2, CheckSquare } from 'lucide-react';
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
    
    const taskTitle = newTaskTitle.trim();
    onAddTask(project.id, taskTitle);
    setNewTaskTitle('');
    toast({
      title: "משימה נוספה",
      description: `המשימה "${taskTitle}" נוספה לפרויקט`,
    });
  };

  const completedTasks = project.tasks.filter(task => task.completed);
  const completionRate = project.tasks.length > 0 
    ? (completedTasks.length / project.tasks.length) * 100 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden" dir="rtl">
        <DialogHeader className="pb-3 border-b">
          <DialogTitle className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold">{project.name}</div>
              <div className="text-xs text-muted-foreground font-normal">
                {project.clientName}
              </div>
            </div>
            {project.tasks.length > 0 && (
              <Badge 
                variant={completionRate === 100 ? "default" : "secondary"}
                className={`text-xs ${completionRate === 100 ? "bg-green-600 text-white" : ""}`}
              >
                {completionRate.toFixed(0)}%
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            ניהול משימות לפרויקט {project.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-2"
             style={{ maxHeight: 'calc(80vh - 160px)' }}>

          {/* Add New Task */}
          <div className="flex gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="משימה חדשה..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTask();
                }
              }}
              className="flex-1 text-sm h-8"
            />
            <Button 
              onClick={handleAddTask}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 h-8"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Progress Bar - Compact */}
          {project.tasks.length > 0 && (
            <div className="bg-white dark:bg-gray-900 p-2 rounded-lg border">
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>התקדמות</span>
                <span className="text-blue-600">{completionRate.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          )}

          {/* All Tasks - Very Compact */}
          {project.tasks.length > 0 && (
            <div className="space-y-1">
              {project.tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                    task.completed 
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                >
                  <div 
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                      task.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onClick={() => onToggleTask(project.id, task.id)}
                  >
                    {task.completed && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${
                      task.completed 
                        ? 'line-through text-gray-500 dark:text-gray-400' 
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {task.title}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(project.id, task.id);
                      toast({
                        title: "משימה נמחקה",
                        description: "המשימה נמחקה בהצלחה",
                      });
                    }}
                    className="p-1 h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {project.tasks.length === 0 && (
            <div className="text-center py-6">
              <CheckSquare className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <h3 className="font-medium text-sm mb-1 text-gray-700 dark:text-gray-300">אין משימות</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                הוסף משימות לעקוב אחר התקדמות
              </p>
            </div>
          )}
        </div>

        <div className="border-t pt-2">
          <Button 
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full h-8 text-sm"
          >
            סגור
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};