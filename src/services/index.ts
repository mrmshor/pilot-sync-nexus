import { Project, QuickTask } from '../types';

// Helper function to detect if running in Tauri
export const isTauriApp = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

// Safe Tauri invoke function using Tauri 2.0 API
const invokeCommand = async (cmd: string, args?: any): Promise<any> => {
  try {
    if (!isTauriApp()) throw new Error('Not in Tauri environment');
    
    // Use Tauri 2.0 core API
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke(cmd, args || {});
  } catch (error) {
    console.warn(`Tauri command ${cmd} failed:`, error);
    throw error;
  }
};

// Safe Tauri shell open function using Tauri 2.0 plugin
export const openWithTauri = async (url: string): Promise<boolean> => {
  try {
    if (!isTauriApp()) return false;
    
    // Use Tauri 2.0 shell plugin
    const { open } = await import('@tauri-apps/plugin-shell');
    await open(url);
    return true;
  } catch (error) {
    console.warn('Tauri shell plugin not available:', error);
    return false;
  }
};

export const FolderService = {
  // פתיחת Finder לבחירת תיקיה חדשה
  selectFolder: async (): Promise<string | null> => {
    try {
      if (!isTauriApp()) {
        console.warn('Not running in Tauri - folder selection not available');
        return null;
      }

      console.log('Attempting to open folder dialog using Tauri command...');
      
      try {
        // מקביל ל-dialog.showOpenDialog() ב-Electron - פותח דיאלוג בחירת תיקיה עם Tauri 2.0
        const { open } = await import('@tauri-apps/plugin-dialog');
        console.log('Opening native folder selection dialog via Tauri 2.0...');
        const selected = await open({
          directory: true,
          multiple: false,
          title: 'בחר תיקיה לפרויקט'
        });
        
        console.log('Native dialog result:', selected);
        
        if (selected && typeof selected === 'string') {
          console.log('Folder successfully selected:', selected);
          return selected;
        } else if (selected === null) {
          console.log('User cancelled folder selection');
          return null;
        }
      } catch (error) {
        console.error('Error opening native folder dialog:', error);
      }
      
      return null;
    } catch (error) {
      console.error('Error selecting folder with Tauri:', error);
      return null;
    }
  },

  // פתיחת תיקיה קיימת במערכת - מקביל ל-shell.openPath() ב-Electron
  openFolder: async (folderPath: string, icloudLink?: string): Promise<void> => {
    if (!folderPath) {
      console.warn('No folder path provided');
      return;
    }

    try {
      if (isTauriApp()) {
        // מקביל ל-shell.openPath() ב-Electron - פותח את התיקיה ישירות
        const result = await invokeCommand('open_folder_native', { path: folderPath });
        console.log('Folder opened successfully via Tauri native command:', result);
      } else {
        console.warn('Not running in Tauri app - folder opening only works on desktop');
      }
    } catch (error) {
      console.error('Failed to open folder with Tauri command:', error);
      
      // אם הפקודה הראשונה נכשלה, נסה להציג את הפריט בתיקיה
      try {
        if (isTauriApp()) {
          const result = await invokeCommand('show_item_in_folder', { path: folderPath });
          console.log('Fallback: Item location shown in folder:', result);
        }
      } catch (fallbackError) {
        console.error('Both folder opening methods failed:', fallbackError);
        
        // אם גם זה נכשל ויש קישור iCloud, נסה לפתוח אותו
        if (icloudLink && icloudLink.startsWith('http')) {
          try {
            const opened = await openWithTauri(icloudLink);
            if (opened) {
              console.log('Opened iCloud link as fallback:', icloudLink);
            }
          } catch (icloudError) {
            console.error('Failed to open iCloud link as fallback:', icloudError);
          }
        }
      }
    }
  },

  // יצירת נתיב תיקיה מומלץ (תואם macOS)
  generateFolderPath: (projectName: string, clientName: string): string => {
    const sanitizedProject = projectName.replace(/[^א-ת\w\s\-\.]/g, '').trim();
    const sanitizedClient = clientName.replace(/[^א-ת\w\s\-\.]/g, '').trim();
    
    // נתיב מותאם macOS עם Documents או Desktop
    const homeDir = '/Users/' + (process.env.USER || 'User');
    return `${homeDir}/Documents/Projects/${sanitizedClient}/${sanitizedProject}`;
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
      
      if (isTauriApp()) {
        // השתמש בפקודה native של Tauri להתקשרות טלפונית במחשב
        try {
          await invokeCommand('make_phone_call', { phone: formatted });
          console.log('Phone call initiated via native command with phone:', formatted);
        } catch (error) {
          console.error('Failed to initiate call via native command:', error);
          // חלופה - השתמש ב-tel protocol דרך Tauri shell
          const telUrl = `tel:+${formatted}`;
          const opened = await openWithTauri(telUrl);
          if (!opened) {
            console.warn('Unable to open tel: URL on this platform');
          }
        }
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
          await invokeCommand('open_whatsapp_with_phone', { phone: formatted });
          console.log('WhatsApp opened via native command with phone:', formatted);
        } catch (error) {
          console.error('Failed to open WhatsApp via native command:', error);
          // חלופה - השתמש ב-whatsapp protocol דרך Tauri shell
          const whatsappUrl = `whatsapp://send?phone=${formatted}`;
          const opened = await openWithTauri(whatsappUrl);
          if (!opened) {
            console.warn('Unable to open WhatsApp on this platform');
          }
        }
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
    }
  },
  
  sendEmail: async (email: string, subject?: string, body?: string): Promise<void> => {
    if (!email) return;
    try {
      if (!email.includes('@')) {
        console.warn('Invalid email address:', email);
        return;
      }
      
      console.log('Sending email to:', email, 'with subject:', subject);
      
      if (isTauriApp()) {
        try {
          // השתמש בפקודה native מתקדמת למייל
          const result = await invokeCommand('send_email_native', { 
            email, 
            subject: subject || null, 
            body: body || null 
          });
          console.log('Email client opened via native command:', result);
          return;
        } catch (error) {
          console.error('Failed to open email via native command:', error);
        }
      }
      
      // גיבוי - בניית URL מייל מתקדם עם נושא וגוף ההודעה
      let mailtoUrl = `mailto:${email}`;
      const params = [];
      
      if (subject) {
        params.push(`subject=${encodeURIComponent(subject)}`);
      }
      if (body) {
        params.push(`body=${encodeURIComponent(body)}`);
      }
      
      if (params.length > 0) {
        mailtoUrl += `?${params.join('&')}`;
      }
      
      console.log('Opening email with URL:', mailtoUrl);
      
      if (isTauriApp()) {
        const opened = await openWithTauri(mailtoUrl);
        if (opened) {
          console.log('Email client opened successfully via shell');
        } else {
          console.warn('Unable to open email client on this platform');
        }
      } else {
        // גיבוי לדפדפן
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