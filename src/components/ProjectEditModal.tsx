import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
          <DialogDescription className="sr-only">
            עריכת פרויקט {project.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-2"
             style={{ maxHeight: 'calc(80vh - 160px)' }}>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Project Details Section */}
            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border">
              <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">פרטי הפרויקט</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">שם הפרויקט *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    required
                    className="text-sm h-8"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">תיאור</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm min-h-[60px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">סטטוס</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleFieldChange('status', e.target.value)}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs h-8"
                    >
                      <option value="not-started">לא התחיל</option>
                      <option value="in-progress">בתהליך</option>
                      <option value="in-review">בבדיקה</option>
                      <option value="completed">הושלם</option>
                      <option value="on-hold">מושהה</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">עדיפות</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleFieldChange('priority', e.target.value)}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs h-8"
                    >
                      <option value="low">נמוכה</option>
                      <option value="medium">בינונית</option>
                      <option value="high">גבוהה</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">מחיר</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleFieldChange('price', Number(e.target.value))}
                      min="0"
                      className="text-sm h-8"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">מטבע</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => handleFieldChange('currency', e.target.value)}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs h-8"
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
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.paid}
                      onChange={(e) => handleFieldChange('paid', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-xs">שולם</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.completed}
                      onChange={(e) => handleFieldChange('completed', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-xs">הושלם</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Client Details Section */}
            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border">
              <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">פרטי לקוח</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">שם הלקוח *</label>
                  <Input
                    value={formData.clientName}
                    onChange={(e) => handleFieldChange('clientName', e.target.value)}
                    required
                    className="text-sm h-8"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">אימייל</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className="text-sm h-8"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">טלפון ראשי</label>
                    <Input
                      type="tel"
                      value={formData.phone1}
                      onChange={(e) => handleFieldChange('phone1', e.target.value)}
                      className="text-sm h-8"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">טלפון נוסף</label>
                    <Input
                      type="tel"
                      value={formData.phone2}
                      onChange={(e) => handleFieldChange('phone2', e.target.value)}
                      className="text-sm h-8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">וואטסאפ ראשי</label>
                    <Input
                      type="tel"
                      value={formData.whatsapp1}
                      onChange={(e) => handleFieldChange('whatsapp1', e.target.value)}
                      className="text-sm h-8"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">וואטסאפ נוסף</label>
                    <Input
                      type="tel"
                      value={formData.whatsapp2}
                      onChange={(e) => handleFieldChange('whatsapp2', e.target.value)}
                      className="text-sm h-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">נתיב תיקייה</label>
                  <Input
                    value={formData.folderPath || ''}
                    onChange={(e) => handleFieldChange('folderPath', e.target.value)}
                    className="text-sm h-8"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">קישור iCloud</label>
                  <Input
                    value={formData.icloudLink || ''}
                    onChange={(e) => handleFieldChange('icloudLink', e.target.value)}
                    className="text-sm h-8"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="border-t pt-2 flex gap-2">
          <Button 
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1 h-8 text-sm"
          >
            ביטול
          </Button>
          <Button 
            onClick={handleSubmit}
            className="flex-1 h-8 text-sm bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="w-3 h-3 ml-1" />
            שמור
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};