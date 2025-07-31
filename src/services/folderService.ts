import { open as tauriOpen } from '@tauri-apps/plugin-dialog';
import { openPath } from '@tauri-apps/plugin-opener';

export const FolderService = {
  selectFolder: async () => {
    try {
      console.log('🗂️ מתחיל בחירת תיקיה...');
      
      // Priority 1: Tauri v2 Dialog Plugin
      if ((window as any).__TAURI__) {
        console.log('🖥️ זוהה Tauri, משתמש ב-dialog plugin');
        try {
          const folderPath = await tauriOpen({
            multiple: false,
            directory: true,
            title: 'בחר תיקיה לפרויקט'
          });
          
          if (folderPath) {
            console.log('✅ תיקיה נבחרה:', folderPath);
            return folderPath;
          }
          console.log('❌ לא נבחרה תיקיה');
          return null;
        } catch (tauriError) {
          console.error('❌ שגיאה ב-Tauri dialog:', tauriError);
          
          // Fallback to manual input for Tauri
          const manualPath = prompt('בחירת תיקיה נכשלה. הכנס נתיב מלא:');
          return manualPath;
        }
      }

      // Priority 2: Modern browser with File System Access API
      if ('showDirectoryPicker' in window) {
        console.log('🌐 משתמש ב-File System Access API');
        try {
          const dirHandle = await (window as any).showDirectoryPicker();
          return { name: dirHandle.name, handle: dirHandle };
        } catch (browserError) {
          console.error('❌ שגיאה ב-showDirectoryPicker:', browserError);
          // Continue to fallback
        }
      }

      // Priority 3: Fallback for older browsers
      console.log('📁 משתמש ב-webkitdirectory fallback');
      return new Promise<any>((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.style.display = 'none';

        input.addEventListener('change', (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            const folderName = files[0].webkitRelativePath.split('/')[0];
            console.log('✅ תיקיה נבחרה דרך webkitdirectory:', folderName);
            resolve({ name: folderName, handle: null });
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
      console.error('❌ שגיאה כללית בבחירת תיקיה:', error);
      const path = prompt('בחירת תיקיה נכשלה. הכנס נתיב מלא:');
      return path;
    }
  },

  openFolder: async (folderPath?: string, icloudLink?: string) => {
    console.log('🗂️ מנסה לפתוח תיקיה:', { folderPath, icloudLink });
    
    if (!folderPath && !icloudLink) {
      alert('אין נתיב תיקיה או קישור iCloud מוגדר לפרויקט זה');
      return;
    }

    // תמיד העדיף קישור iCloud קודם (עובד ברוב הדפדפנים)
    if (icloudLink && icloudLink.trim() !== '') {
      try {
        console.log('☁️ פותח קישור iCloud:', icloudLink);
        const newWindow = window.open(icloudLink, '_blank', 'noopener,noreferrer');
        if (newWindow) {
          console.log('✅ קישור iCloud נפתח בהצלחה');
          return;
        } else {
          console.warn('⚠️ חלון חדש נחסם, מנסה לנווט בחלון נוכחי');
          window.location.href = icloudLink;
          return;
        }
      } catch (error) {
        console.error('❌ שגיאה בפתיחת קישור iCloud:', error);
      }
    }

    // אם אין iCloud או שנכשל, הראה הוראות למשתמש
    if (folderPath && folderPath.trim() !== '') {
      const instructions = `
לא ניתן לפתוח תיקיות מקומיות ישירות מהדפדפן מסיבות אבטחה.

נתיב התיקיה: ${folderPath}

אפשרויות:
1. העתק את הנתיב למעלה ופתח אותו ידנית ב-Finder/Explorer
2. הוסף קישור iCloud לפרויקט זה
3. גרור את התיקיה למועדפים שלך לגישה מהירה

האם תרצה להעתיק את הנתיב?`;
      
      if (confirm(instructions)) {
        // העתק את הנתיב ללוח
        try {
          await navigator.clipboard.writeText(folderPath);
          alert('הנתיב הועתק ללוח! עכשיו פתח את Finder/Explorer והדבק אותו');
        } catch (error) {
          console.error('שגיאה בהעתקה:', error);
          prompt('העתק את הנתיב הזה:', folderPath);
        }
      }
    } else {
      alert('לא הוגדר נתיב תיקיה או קישור iCloud לפרויקט זה');
    }
  },

  makePhoneCall: async (phone: string): Promise<void> => {
    if (!phone) return;
    
    try {
      console.log('📞 מתחיל שיחה:', phone);
      const cleaned = phone.replace(/[^\d+]/g, '');
      const telUrl = `tel:${cleaned}`;
      
      // Tauri v2 Opener Plugin
      if ((window as any).__TAURI__) {
        console.log('🖥️ זוהה Tauri, משתמש ב-opener plugin לטלפון');
        await openPath(telUrl);
        console.log('✅ שיחה התחילה באמצעות Tauri');
        return;
      }
      
      // Fallback for other environments
      window.open(telUrl, '_blank');
      console.log('✅ שיחה התחילה');
    } catch (error) {
      console.error('❌ שגיאה בשיחה:', error);
    }
  },
  
  openWhatsApp: async (phone: string): Promise<void> => {
    console.log('🟢 openWhatsApp התחיל עם מספר:', phone);
    
    if (!phone || phone.trim() === '') {
      console.warn('⚠️ לא נמצא מספר וואטסאפ');
      alert('לא הוזן מספר וואטסאפ');
      return;
    }
    
    try {
      // נקה את המספר - השאר רק ספרות ו+
      let cleaned = phone.replace(/[^\d+]/g, '');
      console.log('🧹 מספר נוקה:', cleaned);
      
      // אם המספר מתחיל ב-0, החלף ל-972
      if (cleaned.startsWith('0')) {
        cleaned = '972' + cleaned.substring(1);
        console.log('🇮🇱 הוסף קידומת ישראל:', cleaned);
      }
      
      // אם אין קידומת, הוסף 972
      if (!cleaned.startsWith('+') && !cleaned.startsWith('972') && !cleaned.startsWith('1')) {
        cleaned = '972' + cleaned;
        console.log('🇮🇱 הוסף קידומת ישראל (ברירת מחדל):', cleaned);
      }
      
      // הסר + אם קיים
      cleaned = cleaned.replace(/^\+/, '');
      
      // בדוק שהמספר תקין (לפחות 10 ספרות)
      if (cleaned.length < 10) {
        console.error('❌ מספר טלפון לא תקין:', phone);
        alert(`מספר הטלפון לא תקין: ${phone}\nהמספר צריך להכיל לפחות 10 ספרות`);
        return;
      }
      
      const whatsappUrl = `https://wa.me/${cleaned}`;
      console.log('🔗 URL וואטסאפ:', whatsappUrl);
      
      // נסה לפתוח וואטסאפ
      const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      
      if (newWindow) {
        console.log('✅ וואטסאפ נפתח בחלון חדש');
      } else {
        console.warn('⚠️ חלון חדש נחסם, מנסה לנווט בחלון נוכחי');
        window.location.href = whatsappUrl;
      }
      
    } catch (error) {
      console.error('❌ שגיאה בפתיחת וואטסאפ:', error);
      alert('שגיאה בפתיחת וואטסאפ. בדוק את החיבור לאינטרנט ונסה שוב.');
    }
  },
  
  sendEmail: async (email: string): Promise<void> => {
    if (!email) {
      console.warn('⚠️ לא נמצא כתובת אימייל');
      return;
    }
    
    try {
      console.log('📧 פותח אימייל לכתובת:', email);
      const mailtoUrl = `mailto:${email}`;
      
      // Tauri v2 Opener Plugin
      if ((window as any).__TAURI__) {
        console.log('🖥️ זוהה Tauri, משתמש ב-opener plugin למייל');
        await openPath(mailtoUrl);
        console.log('✅ אימייל נפתח באמצעות Tauri');
        return;
      }
      
      // Fallback for other environments
      const link = document.createElement('a');
      link.href = mailtoUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ אימייל נפתח');
    } catch (error) {
      console.error('❌ שגיאה בפתיחת אימייל:', error);
    }
  },

  generateFolderPath: (projectName: string, clientName: string) => {
    const sanitizedProject = projectName.replace(/[^א-ת\w\s]/g, '').trim();
    const sanitizedClient = clientName.replace(/[^א-ת\w\s]/g, '').trim();
    return `/Users/${Intl.DateTimeFormat().resolvedOptions().timeZone}/Projects/${sanitizedClient}/${sanitizedProject}`;
  },

  // Contact service functions - moved here to consolidate
  cleanPhoneNumber: (phone: string): string => phone.replace(/[^\d]/g, ''),
  
  formatPhoneForDisplay: (phone: string): string => {
    const cleaned = phone.replace(/[^\d]/g, '');
    if (cleaned.startsWith('972')) {
      return `+${cleaned.substring(0, 3)}-${cleaned.substring(3, 5)}-${cleaned.substring(5, 8)}-${cleaned.substring(8)}`;
    }
    return phone;
  }
};