import React, { useState } from 'react';
import { Project, Task } from '@/types/project';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  Calendar,
  CheckCircle2,
  Circle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface TasksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onAddTask: (projectId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (projectId: string, taskId: string) => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const priorityLabels = {
  low: 'נמוכה',
  medium: 'בינונית',
  high: 'גבוהה'
};

export const TasksDialog: React.FC<TasksDialogProps> = ({
  isOpen,
  onClose,
  project,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    dueDate: ''
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      toast.error('כותרת המשימה חובה');
      return;
    }

    onAddTask(project.id, {
      ...newTask,
      completed: false,
      dueDate: newTask.dueDate || undefined
    });

    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: ''
    });
    setShowAddForm(false);
    toast.success('משימה נוספה בהצלחה');
  };

  const handleToggleTask = (taskId: string, completed: boolean) => {
    onUpdateTask(project.id, taskId, { completed });
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק משימה זו?')) {
      onDeleteTask(project.id, taskId);
    }
  };

  const sortedTasks = [...project.tasks].sort((a, b) => {
    // משימות לא הושלמו קודם
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // לפי עדיפות
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    // לפי תאריך יעד
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });

  const completedTasks = project.tasks.filter(t => t.completed).length;
  const totalTasks = project.tasks.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>משימות - {project.name}</span>
            <div className="flex items-center gap-2 text-sm font-normal">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>{completedTasks}/{totalTasks}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* כפתור הוספת משימה */}
          {!showAddForm && (
            <Button 
              onClick={() => setShowAddForm(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              הוסף משימה חדשה
            </Button>
          )}

          {/* טופס הוספת משימה */}
          {showAddForm && (
            <form onSubmit={handleAddTask} className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label htmlFor="taskTitle">כותרת המשימה *</Label>
                <Input
                  id="taskTitle"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="הזן כותרת למשימה"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="taskDescription">תיאור המשימה</Label>
                <Textarea
                  id="taskDescription"
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="הזן תיאור מפורט (אופציונלי)"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taskPriority">עדיפות</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">נמוכה</SelectItem>
                      <SelectItem value="medium">בינונית</SelectItem>
                      <SelectItem value="high">גבוהה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="taskDueDate">תאריך יעד</Label>
                  <Input
                    id="taskDueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">הוסף משימה</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  ביטול
                </Button>
              </div>
            </form>
          )}

          {/* רשימת משימות */}
          <div className="space-y-2">
            {sortedTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>אין משימות בפרויקט זה</p>
                <p className="text-sm">הוסף משימה ראשונה כדי להתחיל</p>
              </div>
            ) : (
              sortedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    task.completed ? 'bg-muted/50 opacity-75' : 'bg-background'
                  }`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => handleToggleTask(task.id, !!checked)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                        {task.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task.id)}
                        className="h-6 w-6 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {task.description && (
                      <p className={`text-sm text-muted-foreground ${task.completed ? 'line-through' : ''}`}>
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Badge className={priorityColors[task.priority]} variant="secondary">
                        {priorityLabels[task.priority]}
                      </Badge>
                      
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString('he-IL')}
                        </div>
                      )}
                      
                      {task.completed && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          הושלם
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            סגור
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};