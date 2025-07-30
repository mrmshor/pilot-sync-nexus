import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Project } from '@/types';
import { Edit, Save, X } from 'lucide-react';

interface ProjectEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onUpdateProject: (project: Project) => void;
}

export const ProjectEditModal = ({ 
  open, 
  onOpenChange, 
  project, 
  onUpdateProject 
}: ProjectEditModalProps) => {
  const [formData, setFormData] = useState<Project | null>(null);

  useEffect(() => {
    if (project) {
      setFormData({ ...project });
    }
  }, [project]);

  if (!project || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProject({
      ...formData,
      updatedAt: new Date()
    });
    onOpenChange(false);
  };

  const handleFieldChange = (field: keyof Project, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden" dir="rtl">
        <DialogHeader className="pb-3 border-b">
          <DialogTitle className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold">{project.name}</div>
              <div className="text-xs text-muted-foreground font-normal">
                {project.clientName}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 py-2"
             style={{ maxHeight: 'calc(80vh - 160px)' }}>
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">פרטי הפרויקט</h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="edit-name">שם הפרויקט *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-description">תיאור</Label>
                  <textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm min-h-[100px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-status">סטטוס</Label>
                    <select
                      id="edit-status"
                      value={formData.status}
                      onChange={(e) => handleFieldChange('status', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="not-started">לא התחיל</option>
                      <option value="in-progress">בתהליך</option>
                      <option value="in-review">בבדיקה</option>
                      <option value="completed">הושלם</option>
                      <option value="on-hold">מושהה</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="edit-priority">עדיפות</Label>
                    <select
                      id="edit-priority"
                      value={formData.priority}
                      onChange={(e) => handleFieldChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="low">נמוכה</option>
                      <option value="medium">בינונית</option>
                      <option value="high">גבוהה</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-price">מחיר</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleFieldChange('price', Number(e.target.value))}
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-currency">מטבע</Label>
                    <select
                      id="edit-currency"
                      value={formData.currency}
                      onChange={(e) => handleFieldChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="ILS">שקל (₪)</option>
                      <option value="USD">דולר ($)</option>
                      <option value="EUR">יורו (€)</option>
                      <option value="GBP">לירה (£)</option>
                      <option value="CAD">דולר קנדי (CA$)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.paid}
                      onChange={(e) => handleFieldChange('paid', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">שולם</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.completed}
                      onChange={(e) => handleFieldChange('completed', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">הושלם</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">פרטי לקוח</h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="edit-clientName">שם הלקוח *</Label>
                  <Input
                    id="edit-clientName"
                    value={formData.clientName}
                    onChange={(e) => handleFieldChange('clientName', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-email">אימייל</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-phone1">טלפון ראשי</Label>
                    <Input
                      id="edit-phone1"
                      type="tel"
                      value={formData.phone1}
                      onChange={(e) => handleFieldChange('phone1', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-phone2">טלפון נוסף</Label>
                    <Input
                      id="edit-phone2"
                      type="tel"
                      value={formData.phone2}
                      onChange={(e) => handleFieldChange('phone2', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-whatsapp1">וואטסאפ ראשי</Label>
                    <Input
                      id="edit-whatsapp1"
                      type="tel"
                      value={formData.whatsapp1}
                      onChange={(e) => handleFieldChange('whatsapp1', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-whatsapp2">וואטסאפ נוסף</Label>
                    <Input
                      id="edit-whatsapp2"
                      type="tel"
                      value={formData.whatsapp2}
                      onChange={(e) => handleFieldChange('whatsapp2', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-folderPath">נתיב תיקייה</Label>
                  <Input
                    id="edit-folderPath"
                    value={formData.folderPath || ''}
                    onChange={(e) => handleFieldChange('folderPath', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-icloudLink">קישור iCloud</Label>
                  <Input
                    id="edit-icloudLink"
                    value={formData.icloudLink || ''}
                    onChange={(e) => handleFieldChange('icloudLink', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4 ml-2" />
            ביטול
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            className="gradient-primary text-white"
          >
            <Save className="w-4 h-4 ml-2" />
            שמור שינויים
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};