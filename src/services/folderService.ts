import { open as tauriOpen } from '@tauri-apps/plugin-dialog';
import { openPath } from '@tauri-apps/plugin-opener';

export const FolderService = {
  /**
   * בחירת תיקיה במחשב
   */
  selectFolder: async (): Promise<string | null> => {
    console.log('🗂️ מתחיל בחירת תיקיה');
    
    try {
      // אם זה Tauri - יעבוד רק באפליקציית מחשב
      if ((window as any).__TAURI__) {
        console.log('🖥️ משתמש ב-Tauri');
        const folderPath = await tauriOpen({
          multiple: false,
          directory: true,
          title: 'בחר תיקיה לפרויקט'
        });
        console.log('✅ תיקיה נבחרה:', folderPath);
        return folderPath || null;
      }

      // בדפדפן Lovable - ננסה File System API קודם
      console.log('🌐 סביבת דפדפן - מנסה File System API');
      
      // אם יש File System Access API - ננסה להשתמש בו
      if ('showDirectoryPicker' in window) {
        try {
          const dirHandle = await (window as any).showDirectoryPicker();
          console.log('✅ תיקיה נבחרה באמצעות File System API:', dirHandle.name);
          return dirHandle.name;
        } catch (error: any) {
          console.log('ℹ️ File System API נכשל:', error.message);
          // אם המשתמש ביטל, נחזיר null
          if (error.name === 'AbortError') {
            return null;
          }
        }
      }

      // חלופה - webkitdirectory
      console.log('📁 משתמש ב-webkitdirectory');
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.style.display = 'none';

        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            const folderName = files[0].webkitRelativePath.split('/')[0];
            console.log('✅ תיקיה נבחרה:', folderName);
            resolve(folderName);
          } else {
            resolve(null);
          }
        };

        input.oncancel = () => resolve(null);
        
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
      });
      
    } catch (error) {
      console.error('❌ שגיאה בבחירת תיקיה:', error);
      return null;
    }
  },

  /**
   * פתיחת תיקיה במחשב
   */
  openFolder: async (folderPath?: string, icloudLink?: string): Promise<void> => {
    console.log('🗂️ מנסה לפתוח תיקיה:', { folderPath, icloudLink });
    
    // אם יש קישור iCloud
    if (icloudLink?.trim()) {
      console.log('🔗 פותח קישור iCloud');
      window.open(icloudLink, '_blank');
      return;
    }

    // אם אין נתיב תיקיה
    if (!folderPath?.trim()) {
      console.log('⚠️ אין נתיב תיקיה');
      return;
    }

    console.log('📁 מנסה לפתוח:', folderPath);

    // אם זה קישור רשת
    if (folderPath.startsWith('http')) {
      console.log('🌐 פותח קישור רשת');
      window.open(folderPath, '_blank');
      return;
    }

    // אם זה Tauri
    if ((window as any).__TAURI__) {
      console.log('🖥️ משתמש ב-Tauri');
      try {
        await openPath(folderPath);
        console.log('✅ Tauri הצליח');
        return;
      } catch (error) {
        console.error('❌ Tauri נכשל:', error);
      }
    }

    // אם זה Electron
    if ((window as any).electronAPI?.openFolder) {
      console.log('🖥️ משתמש ב-Electron');
      try {
        await (window as any).electronAPI.openFolder(folderPath);
        console.log('✅ Electron הצליח');
        return;
      } catch (error) {
        console.error('❌ Electron נכשל:', error);
      }
    }

    // דפדפן רגיל - ניסיונות שונים
    console.log('🌐 משתמש בדפדפן');
    
    const attempts = [
      () => {
        const url = folderPath.startsWith('/') ? `file://${folderPath}` : `file:///${folderPath.replace(/\\/g, '/')}`;
        window.open(url, '_blank');
      },
      () => {
        window.open(`file:///${folderPath.replace(/\\/g, '/')}`, '_blank');
      },
      () => {
        const link = document.createElement('a');
        link.href = `file://${folderPath}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    ];

    for (let i = 0; i < attempts.length; i++) {
      try {
        console.log(`📂 ניסיון ${i + 1}`);
        attempts[i]();
        console.log(`✅ ניסיון ${i + 1} הושלם`);
        break;
      } catch (error) {
        console.error(`❌ ניסיון ${i + 1} נכשל:`, error);
      }
    }
  },

  /**
   * פתיחת וואטסאפ
   */
  openWhatsApp: async (phone: string): Promise<void> => {
    console.log('🟢 פותח וואטסאפ עם מספר:', phone);
    
    if (!phone?.trim()) {
      console.error('❌ אין מספר וואטסאפ');
      alert('נא להזין מספר וואטסאפ');
      return;
    }

    try {
      // ניקוי המספר - רק ספרות
      const cleanNumber = phone.replace(/\D/g, '');
      console.log('🔢 מספר נקי:', cleanNumber);

      if (cleanNumber.length < 9) {
        alert(`מספר טלפון קצר מדי: ${phone}`);
        return;
      }

      // פורמט למספר ישראלי
      let formattedNumber = cleanNumber;
      if (cleanNumber.startsWith('0')) {
        formattedNumber = '972' + cleanNumber.substring(1);
      } else if (!cleanNumber.startsWith('972')) {
        formattedNumber = '972' + cleanNumber;
      }

      const whatsappUrl = `https://wa.me/${formattedNumber}`;
      console.log('🟢 פותח:', whatsappUrl);
      
      window.open(whatsappUrl, '_blank');
      console.log('✅ וואטסאפ נפתח בהצלחה');
    } catch (error) {
      console.error('❌ שגיאה בוואטסאפ:', error);
      alert('שגיאה בפתיחת וואטסאפ');
    }
  },

  /**
   * ביצוע שיחת טלפון
   */
  makePhoneCall: (phone?: string): void => {
    console.log('📞 מתחיל שיחה למספר:', phone);
    
    if (!phone?.trim()) {
      console.error('❌ אין מספר טלפון');
      return;
    }

    try {
      const telUrl = `tel:${phone}`;
      console.log('📞 פותח:', telUrl);
      window.open(telUrl);
      console.log('✅ שיחה התחילה');
    } catch (error) {
      console.error('❌ שגיאה בשיחה:', error);
    }
  },

  /**
   * שליחת אימייל
   */
  sendEmail: (email?: string): void => {
    console.log('📧 שולח אימייל ל:', email);
    
    if (!email?.trim()) {
      console.error('❌ אין כתובת אימייל');
      return;
    }

    try {
      const mailtoUrl = `mailto:${email}`;
      console.log('📧 פותח:', mailtoUrl);
      window.open(mailtoUrl);
      console.log('✅ אימייל נפתח');
    } catch (error) {
      console.error('❌ שגיאה באימייל:', error);
    }
  },

  /**
   * יצירת נתיב תיקיה
   */
  generateFolderPath: (projectName: string, clientName: string): string => {
    const sanitizedProject = projectName.replace(/[^א-ת\w\s]/g, '').trim();
    const sanitizedClient = clientName.replace(/[^א-ת\w\s]/g, '').trim();
    return `/Users/Desktop/Projects/${sanitizedClient}/${sanitizedProject}`;
  },

  /**
   * ניקוי מספר טלפון
   */
  cleanPhoneNumber: (phone: string): string => {
    return phone.replace(/[^\d]/g, '');
  },

  /**
   * פורמט מספר טלפון לתצוגה
   */
  formatPhoneForDisplay: (phone: string): string => {
    const cleaned = phone.replace(/[^\d]/g, '');
    if (cleaned.startsWith('972')) {
      return `+${cleaned.substring(0, 3)}-${cleaned.substring(3, 5)}-${cleaned.substring(5, 8)}-${cleaned.substring(8)}`;
    }
    return phone;
  }
};