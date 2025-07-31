import React from 'react';
import { Project } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Folder, 
  MessageCircle, 
  Phone, 
  Mail, 
  Calendar,
  MoreVertical,
  Play,
  Pause,
  CheckCircle2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TauriService } from '@/services/tauriService';
import { toast } from 'sonner';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onViewTasks: (project: Project) => void;
}

const statusColors = {
  planning: 'bg-blue-500',
  active: 'bg-green-500',
  completed: 'bg-gray-500',
  'on-hold': 'bg-yellow-500'
};

const statusLabels = {
  planning: 'תכנון',
  active: 'פעיל',
  completed: 'הושלם',
  'on-hold': 'מושהה'
};

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

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onViewTasks
}) => {
  const handleOpenFolder = async () => {
    if (!project.folderPath) {
      toast.error('לא הוגדר נתיב תיקיה לפרויקט זה');
      return;
    }

    try {
      if (TauriService.isTauri()) {
        await TauriService.openFolder(project.folderPath);
        toast.success('התיקיה נפתחה בהצלחה');
      } else {
        toast.info('פתיחת תיקיות זמינה רק באפליקציה השולחנית');
      }
    } catch (error) {
      console.error('שגיאה בפתיחת תיקיה:', error);
      toast.error('שגיאה בפתיחת התיקיה');
    }
  };

  const handleOpenWhatsApp = async () => {
    if (!project.clientPhone) {
      toast.error('לא הוגדר מספר טלפון ללקוח');
      return;
    }

    try {
      if (TauriService.isTauri()) {
        await TauriService.openWhatsApp(project.clientPhone);
        toast.success('וואטסאפ נפתח בהצלחה');
      } else {
        // fallback לדפדפן
        const cleanNumber = project.clientPhone.replace(/\D/g, '');
        const formattedNumber = cleanNumber.startsWith('0') 
          ? '972' + cleanNumber.substring(1)
          : cleanNumber.startsWith('972') 
            ? cleanNumber 
            : '972' + cleanNumber;
        window.open(`https://wa.me/${formattedNumber}`, '_blank');
        toast.success('וואטסאפ נפתח בהצלחה');
      }
    } catch (error) {
      console.error('שגיאה בפתיחת וואטסאפ:', error);
      toast.error('שגיאה בפתיחת וואטסאפ');
    }
  };

  const handleCall = () => {
    if (!project.clientPhone) {
      toast.error('לא הוגדר מספר טלפון ללקוח');
      return;
    }
    window.open(`tel:${project.clientPhone}`);
  };

  const handleEmail = () => {
    if (!project.clientEmail) {
      toast.error('לא הוגדרה כתובת אימייל ללקוח');
      return;
    }
    window.open(`mailto:${project.clientEmail}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusColors[project.status]}`} />
            <CardTitle className="text-lg">{project.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(project)}>
                ערוך פרויקט
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewTasks(project)}>
                צפה במשימות
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(project.id)}
                className="text-destructive"
              >
                מחק פרויקט
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex gap-2 mt-2">
          <Badge className={priorityColors[project.priority]}>
            {priorityLabels[project.priority]}
          </Badge>
          <Badge variant="secondary">
            {statusLabels[project.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}

        {project.clientName && (
          <div className="text-sm">
            <span className="font-medium">לקוח: </span>
            {project.clientName}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>התקדמות</span>
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {project.tasks.filter(t => t.completed).length} מתוך {project.tasks.length} משימות הושלמו
          </div>
        </div>

        {project.dueDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>תאריך יעד: {new Date(project.dueDate).toLocaleDateString('he-IL')}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {project.folderPath && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenFolder}
              className="flex-1"
            >
              <Folder className="h-4 w-4 mr-2" />
              פתח תיקיה
            </Button>
          )}
          
          {project.clientPhone && (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={handleOpenWhatsApp}
                title="וואטסאפ"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCall}
                title="התקשר"
              >
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {project.clientEmail && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleEmail}
              title="שלח אימייל"
            >
              <Mail className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};