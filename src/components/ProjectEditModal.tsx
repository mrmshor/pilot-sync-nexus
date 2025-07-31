import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Project } from '@/types';
import { Edit, Save, X, FolderOpen } from 'lucide-react';
import { FolderService } from '@/services/folderService';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [formData, setFormData] = useState<Project | null>(null);

  useEffect(() => {
    if (project) {
      setFormData({ ...project });
    }
  }, [project]);

  if (!project || !formData) return null;

  const handleSelectFolder = async () => {
    try {
      console.log('🗂️ ProjectEditModal: מתחיל בחירת תיקיה');
      
      const folderResult = await FolderService.selectFolder();
      console.log('🗂️ ProjectEditModal: תוצאה מ-FolderService:', folderResult);
      
      if (folderResult) {
        const folderPath = folderResult;
        
        console.log('✅ ProjectEditModal: מגדיר נתיב:', folderPath);
        setFormData(prev => prev ? ({ ...prev, folderPath }) : null);
        
        toast({
          title: "תיקיה נבחרה",
          description: `נבחרה: ${folderPath}`,
        });
      } else {
        console.log('ℹ️ ProjectEditModal: לא נבחרה תיקיה');
        toast({
          title: "ביטול",
          description: "לא נבחרה תיקיה",
        });
      }
    } catch (error) {
      console.error('❌ ProjectEditModal שגיאה בבחירת תיקיה:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לבחור תיקיה",
        variant: "destructive"
      });
    }
  };

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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg mb-6">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/20 rounded-full">
              <Edit className="w-6 h-6 text-primary" />
            </div>
            עריכת פרויקט: {project.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Project Details */}
            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-xl border border-blue-200/30 dark:border-blue-800/30">
              <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                פרטי הפרויקט
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name" className="text-blue-700 dark:text-blue-300 font-medium">שם הפרויקט *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="הכנס שם פרויקט"
                    required
                    className="border-blue-200 dark:border-blue-800 focus:border-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-description" className="text-blue-700 dark:text-blue-300 font-medium">תיאור</Label>
                  <textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="תיאור הפרויקט"
                    className="w-full px-3 py-2 border border-blue-200 dark:border-blue-800 focus:border-blue-500 rounded-lg text-sm min-h-[80px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-status" className="text-blue-700 dark:text-blue-300 font-medium">סטטוס</Label>
                    <select
                      id="edit-status"
                      value={formData.status}
                      onChange={(e) => handleFieldChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 dark:border-blue-800 focus:border-blue-500 rounded-lg text-sm"
                    >
                      <option value="not-started">לא התחיל</option>
                      <option value="in-progress">בתהליך</option>
                      <option value="in-review">בבדיקה</option>
                      <option value="completed">הושלם</option>
                      <option value="on-hold">מושהה</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="edit-priority" className="text-blue-700 dark:text-blue-300 font-medium">עדיפות</Label>
                    <select
                      id="edit-priority"
                      value={formData.priority}
                      onChange={(e) => handleFieldChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 dark:border-blue-800 focus:border-blue-500 rounded-lg text-sm"
                    >
                      <option value="low">נמוכה</option>
                      <option value="medium">בינונית</option>
                      <option value="high">גבוהה</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-price" className="text-blue-700 dark:text-blue-300 font-medium">מחיר</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleFieldChange('price', Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      className="border-blue-200 dark:border-blue-800 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-currency" className="text-blue-700 dark:text-blue-300 font-medium">מטבע</Label>
                    <select
                      id="edit-currency"
                      value={formData.currency}
                      onChange={(e) => handleFieldChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 dark:border-blue-800 focus:border-blue-500 rounded-lg text-sm"
                    >
                      <option value="ILS">שקל (₪)</option>
                      <option value="USD">דולר ($)</option>
                      <option value="EUR">יורו (€)</option>
                      <option value="GBP">לירה (£)</option>
                      <option value="CAD">דולר קנדי (CA$)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-deadline" className="text-blue-700 dark:text-blue-300 font-medium">מועד יעד</Label>
                  <Input
                    id="edit-deadline"
                    type="date"
                    value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleFieldChange('deadline', e.target.value ? new Date(e.target.value) : undefined)}
                    className="border-blue-200 dark:border-blue-800 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-6 bg-blue-50/50 dark:bg-blue-950/30 p-3 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.paid}
                      onChange={(e) => handleFieldChange('paid', e.target.checked)}
                      className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">שולם</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.completed}
                      onChange={(e) => handleFieldChange('completed', e.target.checked)}
                      className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">הושלם</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-xl border border-green-200/30 dark:border-green-800/30">
              <h3 className="text-lg font-bold text-green-700 dark:text-green-300 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                פרטי לקוח
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-clientName" className="text-green-700 dark:text-green-300 font-medium">שם הלקוח *</Label>
                  <Input
                    id="edit-clientName"
                    value={formData.clientName}
                    onChange={(e) => handleFieldChange('clientName', e.target.value)}
                    placeholder="הכנס שם לקוח"
                    required
                    className="border-green-200 dark:border-green-800 focus:border-green-500"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-email" className="text-green-700 dark:text-green-300 font-medium">אימייל</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="email@example.com"
                    className="border-green-200 dark:border-green-800 focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-phone1" className="text-green-700 dark:text-green-300 font-medium">טלפון ראשי</Label>
                    <Input
                      id="edit-phone1"
                      type="tel"
                      value={formData.phone1}
                      onChange={(e) => handleFieldChange('phone1', e.target.value)}
                      placeholder="+972-50-123-4567"
                      className="border-green-200 dark:border-green-800 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-phone2" className="text-green-700 dark:text-green-300 font-medium">טלפון נוסף</Label>
                    <Input
                      id="edit-phone2"
                      type="tel"
                      value={formData.phone2}
                      onChange={(e) => handleFieldChange('phone2', e.target.value)}
                      placeholder="+972-50-123-4567"
                      className="border-green-200 dark:border-green-800 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-whatsapp1" className="text-green-700 dark:text-green-300 font-medium">וואטסאפ ראשי</Label>
                    <Input
                      id="edit-whatsapp1"
                      type="tel"
                      value={formData.whatsapp1}
                      onChange={(e) => handleFieldChange('whatsapp1', e.target.value)}
                      placeholder="+972-50-123-4567"
                      className="border-green-200 dark:border-green-800 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-whatsapp2" className="text-green-700 dark:text-green-300 font-medium">וואטסאפ נוסף</Label>
                    <Input
                      id="edit-whatsapp2"
                      type="tel"
                      value={formData.whatsapp2}
                      onChange={(e) => handleFieldChange('whatsapp2', e.target.value)}
                      placeholder="+972-50-123-4567"
                      className="border-green-200 dark:border-green-800 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Files & Links Section */}
          <div className="bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-950/20 dark:to-violet-950/20 p-6 rounded-xl border border-purple-200/30 dark:border-purple-800/30">
            <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              קבצים וקישורים
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-folderPath" className="text-purple-700 dark:text-purple-300 font-medium">נתיב תיקייה</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-folderPath"
                    value={formData.folderPath || ''}
                    onChange={(e) => handleFieldChange('folderPath', e.target.value)}
                    placeholder="בחר תיקיה..."
                    className="flex-1 border-purple-200 dark:border-purple-800 focus:border-purple-500"
                    readOnly
                  />
                  <Button
                    type="button"
                    onClick={handleSelectFolder}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 h-10 flex items-center gap-2 whitespace-nowrap"
                  >
                    <FolderOpen className="w-4 h-4" />
                    בחר תיקיה
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-icloudLink" className="text-purple-700 dark:text-purple-300 font-medium">קישור iCloud</Label>
                <Input
                  id="edit-icloudLink"
                  value={formData.icloudLink || ''}
                  onChange={(e) => handleFieldChange('icloudLink', e.target.value)}
                  placeholder="https://icloud.com/..."
                  className="border-purple-200 dark:border-purple-800 focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 p-4 rounded-lg">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="px-6"
            >
              <X className="w-4 h-4 ml-2" />
              ביטול
            </Button>
            <Button type="submit" className="px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Save className="w-4 h-4 ml-2" />
              שמור שינויים
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};