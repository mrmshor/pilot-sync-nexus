import React, { useState, useEffect } from 'react';
import {
  Plus, X, Apple, FolderOpen, Zap, CheckCircle2, AlertTriangle,
  FileText, User, Settings, Eye, CheckSquare
} from 'lucide-react';
import { Project } from '../types';
import { FolderService } from '../services';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

interface CreateProjectModalProps {
  onCreateProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onCreateProject }) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [folderPathStatus, setFolderPathStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const validateFolderPath = (path: string) => {
    if (!path) {
      setFolderPathStatus('idle');
      return;
    }
    
    const macPathPattern = /^\/Users\/[^\/]+/;
    const isValidMacPath = macPathPattern.test(path);
    const windowsPathPattern = /^[A-Za-z]:\\/;
    const isValidWindowsPath = windowsPathPattern.test(path);
    
    if (isValidMacPath || isValidWindowsPath || path.startsWith('/') || path.includes('Projects')) {
      setFolderPathStatus('valid');
    } else {
      setFolderPathStatus('invalid');
    }
  };

  useEffect(() => {
    validateFolderPath(formData.folderPath);
  }, [formData.folderPath]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'שם הפרויקט הוא שדה חובה';
    }
    
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'שם הלקוח הוא שדה חובה';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'כתובת אימייל לא תקינה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onCreateProject(formData);
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
    setErrors({});
    setIsOpen(false);
    
    const folderInfo = formData.folderPath ? `\n📁 תיקיה: ${formData.folderPath}` : '';
    const cloudInfo = formData.icloudLink ? `\n☁️ קישור: ${formData.icloudLink}` : '';
    alert(`הפרויקט "${formData.name}" נוצר בהצלחה במערכת macOS!${folderInfo}${cloudInfo}`);
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
      >
        <Plus className="h-4 w-4 mr-2" />
        צור פרויקט חדש
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-white/95 backdrop-blur rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white/90 backdrop-blur sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Apple className="h-5 w-5 text-gray-500" />
                צור פרויקט חדש - מותאם macOS
              </h2>
              <Button variant="ghost" onClick={() => setIsOpen(false)} size="sm">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Project Details */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200/50">
                      <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        📋 פרטי הפרויקט
                      </h3>
                      
                      <div className="space-y-4">
                        <Input
                          label="שם הפרויקט"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="הכנס שם פרויקט מפורט ובהיר"
                          required
                          error={errors.name}
                        />

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">תיאור מפורט</label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="מטרות, דרישות, תוכן העבודה וכל פרט רלוונטי"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur bg-white/80 min-h-[120px] resize-none transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Folder Management - ENHANCED */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200/50">
                      <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                        <FolderOpen className="h-5 w-5" />
                        📁 ניהול תיקיות macOS
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            נתיב תיקיה במחשב (אופציונלי)
                          </label>
                          <div className="flex gap-2">
                            <Input
                              value={formData.folderPath}
                              onChange={(e) => setFormData(prev => ({ ...prev, folderPath: e.target.value }))}
                              placeholder="/Users/YourName/Projects/ClientName/ProjectName"
                              className={`flex-1 ${
                                folderPathStatus === 'valid' ? 'border-green-500 bg-green-50/50' :
                                folderPathStatus === 'invalid' ? 'border-red-500 bg-red-50/50' : ''
                              }`}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={async () => {
                                const selectedPath = await FolderService.selectFolder();
                                if (selectedPath) {
                                  setFormData(prev => ({ ...prev, folderPath: selectedPath }));
                                }
                              }} 
                              size="sm"
                              title="פתח Finder לבחירת תיקיה"
                            >
                              <FolderOpen className="h-4 w-4 mr-1" />
                              Finder
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              onClick={() => {
                                if (formData.name && formData.clientName) {
                                  const suggestedPath = FolderService.generateFolderPath(formData.name, formData.clientName);
                                  setFormData(prev => ({ ...prev, folderPath: suggestedPath }));
                                } else {
                                  alert('אנא הכנס תחילה שם פרויקט ושם לקוח');
                                }
                              }} 
                              size="sm"
                              title="צור נתיב מומלץ"
                            >
                              <Zap className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {formData.folderPath && (
                            <div className="mt-2">
                              {folderPathStatus === 'valid' && (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  נתיב תקין ומותאם macOS
                                </p>
                              )}
                              {folderPathStatus === 'invalid' && (
                                <p className="text-xs text-red-600 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  נתיב לא תקין - נסה שוב או השתמש בכפתור Finder
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <Input
                          label="קישור תיקייה (iCloud/URL)"
                          value={formData.icloudLink}
                          onChange={(e) => setFormData(prev => ({ ...prev, icloudLink: e.target.value }))}
                          placeholder="https://icloud.com/... או קישור אחר לתיקייה"
                        />
                      </div>
                    </div>

                    {/* Project Settings */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200/50">
                      <h3 className="text-lg font-semibold text-orange-700 mb-4 flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        ⚙️ הגדרות הפרויקט
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס עבודה</label>
                            <select
                              value={formData.status} 
                              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/80 backdrop-blur"
                            >
                              <option value="not-started">לא התחיל</option>
                              <option value="in-progress">בתהליך</option>
                              <option value="completed">הושלם</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">רמת עדיפות</label>
                            <select
                              value={formData.priority} 
                              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/80 backdrop-blur"
                            >
                              <option value="low">🟢 נמוכה</option>
                              <option value="medium">🟡 בינונית</option>
                              <option value="high">🔴 גבוהה</option>
                            </select>
                          </div>
                        </div>

                        <Input
                          label="מחיר הפרויקט"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />

                        <div className="flex gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.paid}
                              onChange={(e) => setFormData(prev => ({ ...prev, paid: e.target.checked }))}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/50"
                            />
                            <span className="text-sm text-gray-700">שולם</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.completed}
                              onChange={(e) => setFormData(prev => ({ ...prev, completed: e.target.checked }))}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/50"
                            />
                            <span className="text-sm text-gray-700">הושלם</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Client Details & Preview */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200/50">
                      <h3 className="text-lg font-semibold text-purple-700 mb-4 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        👤 פרטי לקוח מפורטים
                      </h3>
                      
                      <div className="space-y-4">
                        <Input
                          label="שם הלקוח"
                          value={formData.clientName}
                          onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                          placeholder="הכנס שם לקוח מלא"
                          required
                          error={errors.clientName}
                        />

                        <div className="grid grid-cols-1 gap-4">
                          <Input
                            label="טלפון ראשי"
                            value={formData.phone1}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone1: e.target.value }))}
                            placeholder="+972-50-123-4567"
                            type="tel"
                          />

                          <Input
                            label="טלפון נוסף"
                            value={formData.phone2}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone2: e.target.value }))}
                            placeholder="+972-50-123-4567"
                            type="tel"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <Input
                            label="וואטסאפ ראשי"
                            value={formData.whatsapp1}
                            onChange={(e) => setFormData(prev => ({ ...prev, whatsapp1: e.target.value }))}
                            placeholder="+972-50-123-4567"
                            type="tel"
                          />

                          <Input
                            label="וואטסאפ נוסף"
                            value={formData.whatsapp2}
                            onChange={(e) => setFormData(prev => ({ ...prev, whatsapp2: e.target.value }))}
                            placeholder="+972-50-123-4567"
                            type="tel"
                          />
                        </div>

                        <Input
                          label="כתובת אימייל"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="client@example.com"
                          error={errors.email}
                        />
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200/50">
                      <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        👀 תצוגה מקדימה
                      </h3>
                      
                      <div className="p-6 bg-white/90 backdrop-blur rounded-xl border-2 border-dashed border-indigo-200 space-y-4">
                        <div className="font-bold text-xl text-gray-800">
                          {formData.name || 'שם הפרויקט'}
                        </div>
                        <div className="text-sm text-gray-600">
                          👤 {formData.clientName || 'שם הלקוח'}
                        </div>
                        
                        {formData.price > 0 && (
                          <div className="font-bold text-xl text-green-600">
                            ₪{formData.price.toLocaleString()}
                          </div>
                        )}

                        {(formData.folderPath || formData.icloudLink) && (
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 text-sm">
                              <FolderOpen className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-800">תיקיה מקושרת:</span>
                            </div>
                            {formData.folderPath && (
                              <div className="text-xs text-blue-600 mt-1 bg-white p-2 rounded border font-mono">
                                📁 {formData.folderPath}
                              </div>
                            )}
                            {formData.icloudLink && (
                              <div className="text-xs text-blue-600 mt-1 bg-white p-2 rounded border">
                                ☁️ {formData.icloudLink.substring(0, 50)}...
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500 border-t pt-2">
                          💻 מותאם במיוחד למחשבי Mac
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 bg-white/90 backdrop-blur sticky bottom-0">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    ביטול
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <CheckSquare className="h-4 w-4 mr-2" />
                    צור פרויקט במערכת macOS
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};