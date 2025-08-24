import React, { useState } from 'react';
import { logger } from '@/utils/logger';
import { validateEmail, validateProjectName, validateClientName, validateIsraeliPhone, validateUrl, sanitizeText } from '@/utils/validation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Project } from '@/types';
import { Plus, X, FolderOpen } from 'lucide-react';
import { FolderService } from '@/services';
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
    completed: false,
    deadline: undefined as Date | undefined
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string[]}>({});

  const handleSelectFolder = async () => {
    try {
      // Use Tauri native folder selection
      const folderName = await FolderService.selectFolder();
      if (folderName) {
        const generatedPath = FolderService.generateFolderPath(formData.name || 'New Project', formData.clientName || 'Client');
        setFormData(prev => ({ ...prev, folderPath: generatedPath }));
        toast({
          title: "תיקיה נבחרה",
          description: `נבחרה התיקיה: ${generatedPath}`,
        });
      }
    } catch (error) {
      logger.error('Error selecting folder:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לבחור תיקיה",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    // Enhanced validation
    const nameValidation = validateProjectName(formData.name);
    const clientValidation = validateClientName(formData.clientName);
    const emailValidation = formData.email ? validateEmail(formData.email) : { isValid: true, errors: [] };
    const phone1Validation = validateIsraeliPhone(formData.phone1);
    const phone2Validation = validateIsraeliPhone(formData.phone2);
    const whatsapp1Validation = validateIsraeliPhone(formData.whatsapp1);
    const whatsapp2Validation = validateIsraeliPhone(formData.whatsapp2);
    const urlValidation = validateUrl(formData.icloudLink);
    
    const errors: {[key: string]: string[]} = {};

    if (!nameValidation.isValid) {
      errors.name = nameValidation.errors;
    }
    if (!clientValidation.isValid) {
      errors.clientName = clientValidation.errors;
    }
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errors;
    }
    if (!phone1Validation.isValid) {
      errors.phone1 = phone1Validation.errors;
    }
    if (!phone2Validation.isValid) {
      errors.phone2 = phone2Validation.errors;
    }
    if (!whatsapp1Validation.isValid) {
      errors.whatsapp1 = whatsapp1Validation.errors;
    }
    if (!whatsapp2Validation.isValid) {
      errors.whatsapp2 = whatsapp2Validation.errors;
    }
    if (!urlValidation.isValid) {
      errors.icloudLink = urlValidation.errors;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast({
        title: "שגיאות בטופס",
        description: "נא תקן את השגיאות המסומנות בטופס",
        variant: "destructive"
      });
      return;
    }

    // Sanitize text inputs
    const sanitizedData = {
      ...formData,
      name: sanitizeText(formData.name.trim()),
      description: sanitizeText(formData.description.trim()),
      clientName: sanitizeText(formData.clientName.trim()),
    };
    
    onCreateProject(sanitizedData);
    
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
      completed: false,
      deadline: undefined
    });
    setValidationErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg mb-6">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/20 rounded-full">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            פרויקט חדש
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
                  <Label htmlFor="name" className="text-blue-700 dark:text-blue-300 font-medium">שם הפרויקט *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="הכנס שם פרויקט"
                    required
                    className="border-blue-200 dark:border-blue-800 focus:border-blue-500"
                    error={validationErrors.name?.[0]}
                  />
                  {validationErrors.name && (
                    <div className="text-sm text-red-600 space-y-1 mt-1">
                      {validationErrors.name.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="description" className="text-blue-700 dark:text-blue-300 font-medium">תיאור</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="תיאור הפרויקט"
                    className="w-full px-3 py-2 border border-blue-200 dark:border-blue-800 focus:border-blue-500 rounded-lg text-sm min-h-[80px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="status" className="text-blue-700 dark:text-blue-300 font-medium">סטטוס</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
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
                    <Label htmlFor="priority" className="text-blue-700 dark:text-blue-300 font-medium">עדיפות</Label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
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
                    <Label htmlFor="price" className="text-blue-700 dark:text-blue-300 font-medium">מחיר</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      placeholder="0"
                      min="0"
                      className="border-blue-200 dark:border-blue-800 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency" className="text-blue-700 dark:text-blue-300 font-medium">מטבע</Label>
                    <select
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as any }))}
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
                  <Label htmlFor="deadline" className="text-blue-700 dark:text-blue-300 font-medium">מועד יעד</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline ? formData.deadline.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      deadline: e.target.value ? new Date(e.target.value) : undefined 
                    }))}
                    className="border-blue-200 dark:border-blue-800 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-6 bg-blue-50/50 dark:bg-blue-950/30 p-3 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.paid}
                      onChange={(e) => setFormData(prev => ({ ...prev, paid: e.target.checked }))}
                      className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">שולם</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.completed}
                      onChange={(e) => setFormData(prev => ({ ...prev, completed: e.target.checked }))}
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
                  <Label htmlFor="clientName" className="text-green-700 dark:text-green-300 font-medium">שם הלקוח *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="הכנס שם לקוח"
                    required
                    className="border-green-200 dark:border-green-800 focus:border-green-500"
                    error={validationErrors.clientName?.[0]}
                  />
                  {validationErrors.clientName && (
                    <div className="text-sm text-red-600 space-y-1 mt-1">
                      {validationErrors.clientName.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-green-700 dark:text-green-300 font-medium">אימייל</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="border-green-200 dark:border-green-800 focus:border-green-500"
                    error={validationErrors.email?.[0]}
                  />
                  {validationErrors.email && (
                    <div className="text-sm text-red-600 space-y-1 mt-1">
                      {validationErrors.email.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="phone1" className="text-green-700 dark:text-green-300 font-medium">טלפון ראשי</Label>
                    <Input
                      id="phone1"
                      type="tel"
                      value={formData.phone1}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone1: e.target.value }))}
                      placeholder="+972-50-123-4567"
                      className="border-green-200 dark:border-green-800 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone2" className="text-green-700 dark:text-green-300 font-medium">טלפון נוסף</Label>
                    <Input
                      id="phone2"
                      type="tel"
                      value={formData.phone2}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone2: e.target.value }))}
                      placeholder="+972-50-123-4567"
                      className="border-green-200 dark:border-green-800 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="whatsapp1" className="text-green-700 dark:text-green-300 font-medium">וואטסאפ ראשי</Label>
                    <Input
                      id="whatsapp1"
                      type="tel"
                      value={formData.whatsapp1}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp1: e.target.value }))}
                      placeholder="+972-50-123-4567"
                      className="border-green-200 dark:border-green-800 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp2" className="text-green-700 dark:text-green-300 font-medium">וואטסאפ נוסף</Label>
                    <Input
                      id="whatsapp2"
                      type="tel"
                      value={formData.whatsapp2}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp2: e.target.value }))}
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
                <Label htmlFor="folderPath" className="text-purple-700 dark:text-purple-300 font-medium">נתיב תיקייה</Label>
                <div className="flex gap-2">
                  <Input
                    id="folderPath"
                    value={formData.folderPath}
                    onChange={(e) => setFormData(prev => ({ ...prev, folderPath: e.target.value }))}
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
                <Label htmlFor="icloudLink" className="text-purple-700 dark:text-purple-300 font-medium">קישור iCloud</Label>
                <Input
                  id="icloudLink"
                  value={formData.icloudLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, icloudLink: e.target.value }))}
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
              ביטול
            </Button>
            <Button type="submit" className="px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              צור פרויקט
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};