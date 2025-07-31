import { Project, QuickTask } from '../types';

// Helper function to detect if running in Tauri
const isTauriApp = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

// Safe Tauri shell open function
const openWithTauri = async (url: string): Promise<boolean> => {
  try {
    if (!isTauriApp()) return false;
    
    // Use eval to avoid TypeScript module resolution issues
    const tauriShell = await eval('import("@tauri-apps/api/shell")');
    await tauriShell.open(url);
    return true;
  } catch (error) {
    console.warn('Tauri shell API not available:', error);
    return false;
  }
};

export const FolderService = {
  // פתיחת Finder לבחירת תיקיה חדשה
  selectFolder: async (): Promise<string | null> => {
    try {
      // מודרני - File System Access API
      if (window.showDirectoryPicker) {
        const dirHandle = await window.showDirectoryPicker();
        return dirHandle.name;
      }
      
      // חלופה - webkitdirectory
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        (input as any).webkitdirectory = true;
        input.style.display = 'none';
        
        input.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement;
          const files = target.files;
          if (files && files.length > 0) {
            const path = (files[0] as any).webkitRelativePath.split('/')[0];
            resolve(path);
          } else {
            resolve(null);
          }
        });
        
        input.addEventListener('cancel', () => resolve(null));
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
      });
    } catch (error) {
      console.error('Error selecting folder:', error);
      const path = prompt('הכנס נתיב תיקיה מלא:');
      return path;
    }
  },

  // פתיחת תיקיה קיימת במערכת
  openFolder: (folderPath: string, icloudLink?: string): void => {
    if (folderPath) {
      try {
        window.open(`file://${folderPath}`, '_blank');
      } catch (error) {
        console.error('Error opening folder:', error);
        if (icloudLink) {
          window.open(icloudLink, '_blank');
        }
      }
    } else if (icloudLink) {
      window.open(icloudLink, '_blank');
    }
  },

  // יצירת נתיב תיקיה מומלץ
  generateFolderPath: (projectName: string, clientName: string): string => {
    const sanitizedProject = projectName.replace(/[^א-ת\w\s]/g, '').trim();
    const sanitizedClient = clientName.replace(/[^א-ת\w\s]/g, '').trim();
    return `/Users/Projects/${sanitizedClient}/${sanitizedProject}`;
  }
};

export const ContactService = {
  cleanPhoneNumber: (phone: string): string => phone.replace(/[^\d+]/g, ''),
  
  formatPhoneForInternational: (phone: string, defaultCountryCode: string = '972'): string => {
    if (!phone) return '';
    
    // נקה את המספר (שמור רק ספרות ו-+)
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // אם המספר מתחיל ב-+, השאר אותו כמו שהוא
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // אם המספר מתחיל ב-0 (פורמט מקומי ישראלי), החלף ל-972
    if (cleaned.startsWith('0')) {
      return defaultCountryCode + cleaned.slice(1);
    }
    
    // אם המספר כבר מתחיל בקידומת מדינה, השאר אותו
    if (cleaned.startsWith('972') || cleaned.startsWith('1') || cleaned.length > 10) {
      return cleaned;
    }
    
    // אחרת, הוסף את קידומת ברירת המחדל
    return defaultCountryCode + cleaned;
  },
  
  formatPhoneForDisplay: (phone: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/[^\d]/g, '');
    if (cleaned.startsWith('972')) {
      const withoutCountry = cleaned.substring(3);
      return `+972-${withoutCountry.substring(0, 2)}-${withoutCountry.substring(2, 5)}-${withoutCountry.substring(5)}`;
    }
    return phone;
  },
  
  validatePhoneNumber: (phone: string): boolean => {
    if (!phone) return false;
    const cleaned = phone.replace(/[^\d+]/g, '');
    // בדיקה בסיסית - לפחות 7 ספרות אחרי הניקוי
    return cleaned.length >= 7;
  },
  
  makePhoneCall: async (phone: string): Promise<void> => {
    if (!phone) return;
    try {
      const formatted = ContactService.formatPhoneForInternational(phone);
      if (!ContactService.validatePhoneNumber(formatted)) {
        console.warn('Invalid phone number:', phone);
        return;
      }
      const telUrl = `tel:+${formatted}`;
      
      const opened = await openWithTauri(telUrl);
      if (!opened) {
        window.open(telUrl, '_blank');
      }
    } catch (error) {
      console.error('Error making phone call:', error);
    }
  },
  
  openWhatsApp: async (phone: string): Promise<void> => {
    if (!phone) return;
    try {
      const formatted = ContactService.formatPhoneForInternational(phone);
      if (!ContactService.validatePhoneNumber(formatted)) {
        console.warn('Invalid phone number for WhatsApp:', phone);
        return;
      }
      
      if (isTauriApp()) {
        // השתמש בפקודה native של Tauri להפעלת WhatsApp במחשב
        try {
          const tauriCore = await eval('import("@tauri-apps/api/tauri")');
          await tauriCore.invoke('open_whatsapp_with_phone', { phone: formatted });
          console.log('WhatsApp opened via native command with phone:', formatted);
        } catch (error) {
          console.error('Failed to open WhatsApp via native command:', error);
        }
      } else {
        // זה לא צריך להגיע כי אנחנו מתמקדים רק במחשב
        console.warn('Not running in Tauri app, WhatsApp functionality limited to desktop');
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
    }
  },
  
  sendEmail: async (email: string): Promise<void> => {
    if (!email) return;
    try {
      if (!email.includes('@')) {
        console.warn('Invalid email address:', email);
        return;
      }
      const mailtoUrl = `mailto:${email}`;
      
      const opened = await openWithTauri(mailtoUrl);
      if (!opened) {
        window.open(mailtoUrl, '_blank');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
};

export const ExportService = {
  // ייצוא פרויקטים ל-CSV
  exportProjectsAdvanced: (projects: Project[], format: 'csv' | 'json' = 'csv'): void => {
    try {
      if (format === 'csv') {
        const headers = [
          'שם פרויקט', 'תיאור', 'שם לקוח', 'טלפון ראשי', 'טלפון נוסף',
          'וואטסאפ ראשי', 'וואטסאפ נוסף', 'אימייל', 'תיקייה מקומית', 'קישור iCloud',
          'סטטוס', 'עדיפות', 'מחיר', 'מטבע', 'שולם', 'הושלם',
          'תאריך יצירה', 'תאריך עדכון', 'סה"כ משימות', 'משימות הושלמו'
        ];

        const csvData = projects.map(project => [
          project.name, project.description, project.clientName,
          project.phone1, project.phone2 || '', project.whatsapp1, project.whatsapp2 || '',
          project.email, project.folderPath || '', project.icloudLink || '',
          project.status, project.priority, project.price, project.currency,
          project.paid ? 'כן' : 'לא', project.completed ? 'כן' : 'לא',
          project.createdAt.toLocaleDateString('he-IL'), project.updatedAt.toLocaleDateString('he-IL'),
          project.tasks.length, project.tasks.filter(t => t.completed).length
        ]);

        const csv = [headers, ...csvData]
          .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
          .join('\n');

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `פרויקטים-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting projects:', error);
    }
  },

  // ייצוא משימות ל-TXT
  exportTasksAdvanced: (tasks: QuickTask[]): void => {
    try {
      const completedTasks = tasks.filter(t => t.completed);
      const pendingTasks = tasks.filter(t => !t.completed);
      
      const content = `📋 רשימת משימות מהירות - מערכת ניהול פרויקטים Pro macOS
📅 תאריך: ${new Date().toLocaleDateString('he-IL')} ${new Date().toLocaleTimeString('he-IL')}

📊 סיכום מפורט:
• סה"כ משימות: ${tasks.length}
• הושלמו: ${completedTasks.length}
• בהמתנה: ${pendingTasks.length}

✅ משימות שהושלמו (${completedTasks.length}):
${completedTasks.length > 0 ? completedTasks.map((task, index) => 
  `${index + 1}. ✓ ${task.title}
   📅 הושלם: ${task.completedAt?.toLocaleDateString('he-IL') || 'לא ידוע'}`
).join('\n\n') : 'אין משימות שהושלמו'}

⏳ משימות בהמתנה (${pendingTasks.length}):
${pendingTasks.length > 0 ? pendingTasks.map((task, index) => 
  `${index + 1}. ○ ${task.title}
   🕐 נוצר: ${task.createdAt.toLocaleDateString('he-IL')}`
).join('\n\n') : 'אין משימות בהמתנה'}

---
🚀 מערכת ניהול פרויקטים Pro - מותאם macOS`;

      const blob = new Blob(['\ufeff' + content], { type: 'text/plain; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `משימות-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting tasks:', error);
    }
  }
};