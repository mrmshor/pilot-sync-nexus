import React, { useState } from 'react';
import { Project } from '@/types/project';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Folder } from 'lucide-react';
import { TauriService } from '@/services/tauriService';
import { toast } from 'sonner';

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'progress'>) => void;
  editProject?: Project;
}

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editProject
}) => {
  const [formData, setFormData] = useState({
    name: editProject?.name || '',
    description: editProject?.description || '',
    clientName: editProject?.clientName || '',
    clientPhone: editProject?.clientPhone || '',
    clientEmail: editProject?.clientEmail || '',
    folderPath: editProject?.folderPath || '',
    icloudLink: editProject?.icloudLink || '',
    status: editProject?.status || 'planning' as const,
    priority: editProject?.priority || 'medium' as const,
    dueDate: editProject?.dueDate ? editProject.dueDate.split('T')[0] : '',
    budget: editProject?.budget || undefined
  });

  const [isSelectingFolder, setIsSelectingFolder] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectFolder = async () => {
    setIsSelectingFolder(true);
    try {
      if (TauriService.isTauri()) {
        const selectedPath = await TauriService.selectFolder();
        if (selectedPath) {
          setFormData(prev => ({ ...prev, folderPath: selectedPath }));
          toast.success('תיקיה נבחרה בהצלחה');
        }
      } else {
        toast.info('בחירת תיקיות זמינה רק באפליקציה השולחנית');
      }
    } catch (error) {
      console.error('שגיאה בבחירת תיקיה:', error);
      toast.error('שגיאה בבחירת התיקיה');
    } finally {
      setIsSelectingFolder(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('שם הפרויקט חובה');
      return;
    }

    const projectData = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      budget: formData.budget || undefined
    };

    onSubmit(projectData);
    onClose();
    
    // איפוס הטופס
    if (!editProject) {
      setFormData({
        name: '',
        description: '',
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        folderPath: '',
        icloudLink: '',
        status: 'planning',
        priority: 'medium',
        dueDate: '',
        budget: undefined
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editProject ? 'ערוך פרויקט' : 'פרויקט חדש'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* פרטי פרויקט בסיסיים */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">שם הפרויקט *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="הזן שם פרויקט"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientName">שם הלקוח</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="הזן שם לקוח"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">תיאור הפרויקט</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="הזן תיאור מפורט של הפרויקט"
                rows={3}
              />
            </div>
          </div>

          {/* פרטי יצירת קשר */}
          <div className="space-y-4">
            <h3 className="font-medium">פרטי יצירת קשר</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientPhone">טלפון לקוח</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  placeholder="הזן מספר טלפון"
                  type="tel"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">אימייל לקוח</Label>
                <Input
                  id="clientEmail"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  placeholder="הזן כתובת אימייל"
                  type="email"
                />
              </div>
            </div>
          </div>

          {/* הגדרות פרויקט */}
          <div className="space-y-4">
            <h3 className="font-medium">הגדרות פרויקט</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status">סטטוס</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">תכנון</SelectItem>
                    <SelectItem value="active">פעיל</SelectItem>
                    <SelectItem value="completed">הושלם</SelectItem>
                    <SelectItem value="on-hold">מושהה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">עדיפות</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value)}
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
                <Label htmlFor="dueDate">תאריך יעד</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="budget">תקציב (₪)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget || ''}
                onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || undefined)}
                placeholder="הזן תקציב משוער"
              />
            </div>
          </div>

          {/* תיקיות וקישורים */}
          <div className="space-y-4">
            <h3 className="font-medium">תיקיות וקישורים</h3>
            <div>
              <Label htmlFor="folderPath">נתיב תיקיה</Label>
              <div className="flex gap-2">
                <Input
                  id="folderPath"
                  value={formData.folderPath}
                  onChange={(e) => handleInputChange('folderPath', e.target.value)}
                  placeholder="נתיב לתיקיית הפרויקט"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSelectFolder}
                  disabled={isSelectingFolder}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  {isSelectingFolder ? 'בוחר...' : 'בחר'}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="icloudLink">קישור iCloud</Label>
              <Input
                id="icloudLink"
                value={formData.icloudLink}
                onChange={(e) => handleInputChange('icloudLink', e.target.value)}
                placeholder="קישור לתיקיית iCloud"
                type="url"
              />
            </div>
          </div>

          {/* כפתורי פעולה */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit">
              {editProject ? 'עדכן פרויקט' : 'צור פרויקט'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};