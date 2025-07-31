import { Project, QuickTask } from '../types';

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
  cleanPhoneNumber: (phone: string): string => phone.replace(/[^\d]/g, ''),
  
  formatPhoneForDisplay: (phone: string): string => {
    const cleaned = phone.replace(/[^\d]/g, '');
    if (cleaned.startsWith('972')) {
      return `+${cleaned.substring(0, 3)}-${cleaned.substring(3, 5)}-${cleaned.substring(5, 8)}-${cleaned.substring(8)}`;
    }
    return phone;
  },
  
  makePhoneCall: (phone: string): void => {
    if (!phone) {
      console.warn('⚠️ לא נמצא מספר טלפון');
      return;
    }
    
    try {
      console.log('📞 מתחיל שיחה למספר:', phone);
      const cleaned = phone.replace(/[^\d+]/g, '');
      const phoneUrl = cleaned.startsWith('+') ? `tel:${cleaned}` : `tel:+${cleaned}`;
      
      // Create a temporary link for better compatibility
      const link = document.createElement('a');
      link.href = phoneUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ בקשת שיחה נשלחה');
    } catch (error) {
      console.error('❌ שגיאה בביצוע שיחה:', error);
      alert(`שגיאה בביצוע שיחה למספר: ${phone}`);
    }
  },
  
  openWhatsApp: (phone: string): void => {
    if (!phone) {
      console.warn('⚠️ לא נמצא מספר וואטסאפ');
      return;
    }
    
    try {
      console.log('💬 פותח וואטסאפ למספר:', phone);
      const cleaned = phone.replace(/[^\d]/g, '');
      const whatsappUrl = `https://wa.me/${cleaned}`;
      
      // Open in new tab/window
      const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        // Fallback if popup blocked
        window.location.href = whatsappUrl;
      }
      
      console.log('✅ וואטסאפ נפתח');
    } catch (error) {
      console.error('❌ שגיאה בפתיחת וואטסאפ:', error);
      alert(`שגיאה בפתיחת וואטסאפ למספר: ${phone}`);
    }
  },
  
  sendEmail: (email: string): void => {
    if (!email) {
      console.warn('⚠️ לא נמצא כתובת אימייל');
      return;
    }
    
    try {
      console.log('📧 פותח אימייל לכתובת:', email);
      const mailtoUrl = `mailto:${email}`;
      
      // Create a temporary link for better compatibility
      const link = document.createElement('a');
      link.href = mailtoUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ אימייל נפתח');
    } catch (error) {
      console.error('❌ שגיאה בפתיחת אימייל:', error);
      alert(`שגיאה בפתיחת אימייל לכתובת: ${email}`);
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