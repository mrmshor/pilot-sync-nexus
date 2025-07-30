import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Project } from '@/types';
import { Plus, X, FolderOpen } from 'lucide-react';
import { FolderService } from '@/services/folderService';
import { useToast } from '@/hooks/use-toast';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => void;
}

export const CreateProjectModal = ({ open, onOpenChange, onCreateProject }: CreateProjectModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientName: '',
    phone1: '',
    phone2: '',
    whatsapp1: '',
    whatsapp2: '',
    email: '',
    folderPath: '',
    icloudLink: '',
    status: 'not-started' as const,
    priority: 'medium' as const,
    price: 0,
    currency: 'ILS' as const,
    paid: false,
    completed: false
  });

  const handleSelectFolder = async () => {
    try {
      // For desktop applications - use native directory picker
      if (window.electronAPI && window.electronAPI.selectFolder) {
        const folderPath = await window.electronAPI.selectFolder();
        if (folderPath) {
          setFormData(prev => ({ ...prev, folderPath }));
          toast({
            title: "תיקיה נבחרה",
            description: `נבחרה התיקיה: ${folderPath}`,
          });
        }
        return;
      }

      // Fallback for web browsers - use File System Access API
      const folderName = await FolderService.selectFolder();
      if (folderName) {
        const generatedPath = FolderService.generateFolderPath(formData.name || 'New Project', formData.clientName || 'Client');
        setFormData(prev => ({ ...prev, folderPath: generatedPath }));
        toast({
          title: "תיקיה נבחרה",
          description: `נבחרה התיקיה: ${folderName}`,
        });
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לבחור תיקיה",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject(formData);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      clientName: '',
      phone1: '',
      phone2: '',
      whatsapp1: '',
      whatsapp2: '',
      email: '',
      folderPath: '',
      icloudLink: '',
      status: 'not-started',
      priority: 'medium',
      price: 0,
      currency: 'ILS',
      paid: false,
      completed: false
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            פרויקט חדש
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">פרטי הפרויקט</h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">שם הפרויקט *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="הכנס שם פרויקט"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">תיאור</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="תיאור הפרויקט"
                    className="w-full px-3 py-2 border rounded-lg text-sm min-h-[80px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="status">סטטוס</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="not-started">לא התחיל</option>
                      <option value="in-progress">בתהליך</option>
                      <option value="in-review">בבדיקה</option>
                      <option value="completed">הושלם</option>
                      <option value="on-hold">מושהה</option>
                      <option value="waiting">ממתין</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="priority">עדיפות</Label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
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
                    <Label htmlFor="price">מחיר</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency">מטבע</Label>
                    <select
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as any }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, paid: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">שולם</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.completed}
                      onChange={(e) => setFormData(prev => ({ ...prev, completed: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">הושלם</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">פרטי לקוח</h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="clientName">שם הלקוח *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="הכנס שם לקוח"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">אימייל</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="phone1">טלפון ראשי</Label>
                    <Input
                      id="phone1"
                      type="tel"
                      value={formData.phone1}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone1: e.target.value }))}
                      placeholder="+972-50-123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone2">טלפון נוסף</Label>
                    <Input
                      id="phone2"
                      type="tel"
                      value={formData.phone2}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone2: e.target.value }))}
                      placeholder="+972-50-123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="whatsapp1">וואטסאפ ראשי</Label>
                    <Input
                      id="whatsapp1"
                      type="tel"
                      value={formData.whatsapp1}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp1: e.target.value }))}
                      placeholder="+972-50-123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp2">וואטסאפ נוסף</Label>
                    <Input
                      id="whatsapp2"
                      type="tel"
                      value={formData.whatsapp2}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp2: e.target.value }))}
                      placeholder="+972-50-123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="folderPath">נתיב תיקייה</Label>
                  <div className="flex gap-2">
                    <Input
                      id="folderPath"
                      value={formData.folderPath}
                      onChange={(e) => setFormData(prev => ({ ...prev, folderPath: e.target.value }))}
                      placeholder="/Users/YourName/Projects/..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectFolder}
                      className="px-3 h-8"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="icloudLink">קישור iCloud</Label>
                  <Input
                    id="icloudLink"
                    value={formData.icloudLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, icloudLink: e.target.value }))}
                    placeholder="https://icloud.com/..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              ביטול
            </Button>
            <Button type="submit">
              צור פרויקט
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};