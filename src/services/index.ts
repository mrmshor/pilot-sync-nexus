import { Project, QuickTask } from '../types';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

export const FolderService = {
  // פתיחת תיקיה עם HTML file input (רק בדפדפן)
  selectFolder: async (): Promise<string | null> => {
    console.warn('Folder selection not available in browser environment');
    return null;
  },

  // פתיחת תיקיה/קישור בדפדפן
  openFolder: async (folderPath: string, icloudLink?: string): Promise<void> => {
    if (!folderPath && !icloudLink) {
      throw new Error('לא צוין נתיב תיקיה או קישור');
    }

    try {
      if (icloudLink && icloudLink.startsWith('http')) {
        window.open(icloudLink, '_blank');
        console.log('Opened iCloud link:', icloudLink);
        return;
      }
      
      if (folderPath) {
        // ניסיון לפתוח כ-URL אם נראה כמו אחד
        if (folderPath.startsWith('http')) {
          window.open(folderPath, '_blank');
          console.log('Opened URL:', folderPath);
          return;
        }
        
        // בדפדפן - הצג הודעה על הנתיב
        console.log('Folder path (browser only):', folderPath);
        throw new Error(`נתיב תיקיה: ${folderPath}\nפונקציונליות זו זמינה רק באפליקציית שולחן העבודה`);
      }
    } catch (error) {
      console.error('Error opening folder/link:', error);
      throw error;
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
        throw new Error('מספר הטלפון אינו תקין');
      }
      
      // פתיחת לינק tel: בדפדפן
      const telUrl = `tel:+${formatted}`;
      window.open(telUrl, '_self');
      console.log('Phone call initiated via tel: protocol:', formatted);
    } catch (error) {
      console.error('Error making phone call:', error);
      throw error;
    }
  },
  
  openWhatsApp: async (phone: string): Promise<void> => {
    if (!phone) return;
    try {
      console.log('Opening WhatsApp for phone:', phone);
      const formatted = ContactService.formatPhoneForInternational(phone);
      console.log('Formatted phone number:', formatted);
      
      if (!ContactService.validatePhoneNumber(formatted)) {
        console.warn('Invalid phone number for WhatsApp:', phone);
        throw new Error('מספר הטלפון אינו תקין');
      }

      // Use digits-only phone for wa.me/api URLs (must NOT include '+')
      const numeric = formatted.replace(/[^\d]/g, '');
      const deepLink = `whatsapp://send?phone=${numeric}`;
      const apiUrl = `https://api.whatsapp.com/send?phone=${numeric}`;
      const waUrl = `https://wa.me/${numeric}`;
      console.log('URLs:', { deepLink, apiUrl, waUrl, isNative: Capacitor.isNativePlatform() });
      
      if (Capacitor.isNativePlatform()) {
        // Native: try deep link first, then fallback to in-app browser
        try {
          // Attempt to open the WhatsApp app
          window.location.href = deepLink;
          // Fallback to Browser after short delay
          setTimeout(async () => {
            try {
              await Browser.open({ url: apiUrl, presentationStyle: 'popover' });
            } catch (e) {
              console.error('Browser.open fallback failed', e);
            }
          }, 700);
        } catch (e) {
          console.warn('Deep link failed, opening via Browser', e);
          await Browser.open({ url: apiUrl, presentationStyle: 'popover' });
        }
      } else {
        // Web: prefer wa.me without '+'; handle popup blockers
        console.log('Attempting to open wa.me URL via window.open...');
        const newWin = window.open(waUrl, '_blank', 'noopener,noreferrer');
        if (!newWin) {
          console.warn('Popup blocked, navigating current tab to api.whatsapp.com');
          window.location.href = apiUrl;
        }
      }
      console.log('WhatsApp open triggered');
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      throw error;
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
      
      // בניית URL מייל עם נושא וגוף ההודעה
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
      window.open(mailtoUrl, '_blank');
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