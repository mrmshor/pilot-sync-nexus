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
    console.log('🗂️ פותח תיקיה:', { folderPath, icloudLink });
    
    // בדיקה אם יש נתונים כלשהם
    if (!folderPath && !icloudLink) {
      alert('❌ לא הוגדר נתיב תיקיה או קישור iCloud לפרויקט זה.\nנא להוסיף אחד מהם בעריכת הפרויקט.');
      return;
    }

    // קדימות ל-iCloud (עובד בכל הדפדפנים)
    if (icloudLink && icloudLink.trim() !== '') {
      try {
        console.log('☁️ פותח iCloud:', icloudLink);
        
        // וולידציה של קישור iCloud
        if (!icloudLink.includes('icloud.com')) {
          console.warn('⚠️ קישור לא נראה כמו iCloud');
        }
        
        const newWindow = window.open(icloudLink, '_blank', 'noopener,noreferrer');
        if (newWindow) {
          console.log('✅ iCloud נפתח בחלון חדש');
          return;
        } else {
          // אם popup נחסם, נווט בחלון הנוכחי
          console.warn('⚠️ popup נחסם, מנווט בחלון נוכחי');
          window.location.href = icloudLink;
          return;
        }
      } catch (error) {
        console.error('❌ שגיאה בפתיחת iCloud:', error);
        alert(`שגיאה בפתיחת iCloud: ${error}`);
      }
    }

    // תיקיות מקומיות - הסבר למשתמש על מגבלות הדפדפן
    if (folderPath && folderPath.trim() !== '') {
      const message = `🔒 מגבלות אבטחה של הדפדפן מונעות פתיחה ישירה של תיקיות מקומיות.

📁 נתיב התיקיה:
${folderPath}

💡 פתרונות זמינים:
1️⃣ העתק הנתיב למטה ופתח ב-Finder/Explorer
2️⃣ הוסף קישור iCloud לפרויקט (מומלץ)
3️⃣ גרור התיקיה למועדפים במחשב

❓ האם להעתיק את הנתיב ללוח?`;
      
      if (confirm(message)) {
        try {
          await navigator.clipboard.writeText(folderPath);
          alert('✅ הנתיב הועתק ללוח!\n\n📋 עכשיו:\n1. פתח Finder (Mac) או Explorer (Windows)\n2. הדבק (Cmd+V / Ctrl+V) את הנתיב בשורת הכתובת\n3. לחץ Enter');
        } catch (clipboardError) {
          console.error('❌ שגיאה בהעתקה ללוח:', clipboardError);
          // fallback - הצג prompt עם הנתיב
          prompt('העתק את הנתיב הזה ידנית:', folderPath);
        }
      }
    } else {
      alert('❌ לא הוגדר נתיב תיקיה.\nנא להוסיף נתיב תיקיה או קישור iCloud בעריכת הפרויקט.');
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
    console.log('🟢 פותח וואטסאפ למספר:', phone);
    
    if (!phone || phone.trim() === '') {
      console.warn('⚠️ מספר וואטסאפ ריק');
      alert('נא להזין מספר וואטסאפ');
      return;
    }
    
    try {
      // ניקוי מספר יסודי - רק ספרות ו+
      let cleaned = phone.replace(/[^\d+]/g, '').trim();
      console.log('🧹 מספר אחרי ניקוי:', cleaned);
      
      // הסרת + מהתחלה אם קיים
      if (cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1);
      }
      
      // טיפול במספרים ישראליים שמתחילים ב-0
      if (cleaned.startsWith('0')) {
        // החלפת 0 ב-972 למספרים ישראליים
        cleaned = '972' + cleaned.substring(1);
        console.log('🇮🇱 המרה למספר ישראלי:', cleaned);
      } 
      // אם המספר לא מתחיל ב-972 או קידומת אחרת (1, 44 וכו'), הוסף 972
      else if (!cleaned.match(/^(972|1|44|33|49|39|34|31|32|43|41|46|47|48|20|27|91|86|81|82|55|52|54|56|57|58|51|595|598|502|503|504|505|506|507|508|509|590|591|592|593|594|596|597|598|599)/)) {
        cleaned = '972' + cleaned;
        console.log('🇮🇱 הוספת קידומת ישראל:', cleaned);
      }
      
      // וולידציה - המספר חייב להיות לפחות 10 ספרות
      if (cleaned.length < 10) {
        console.error('❌ מספר קצר מדי:', phone, 'נוקה:', cleaned);
        alert(`מספר טלפון לא תקין: ${phone}\nהמספר חייב להכיל לפחות 10 ספרות`);
        return;
      }
      
      // יצירת קישור וואטסאפ
      const whatsappUrl = `https://wa.me/${cleaned}`;
      console.log('🔗 קישור וואטסאפ:', whatsappUrl);
      
      // ניסיון פתיחה בחלון חדש
      const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      
      if (newWindow) {
        console.log('✅ וואטסאפ נפתח בחלון חדש');
      } else {
        // אם חלון חדש נחסם, נווט בחלון הנוכחי
        console.warn('⚠️ חלון חדש נחסם, מנווט בחלון הנוכחי');
        window.location.href = whatsappUrl;
      }
      
    } catch (error) {
      console.error('❌ שגיאה בפתיחת וואטסאפ:', error);
      alert(`שגיאה בפתיחת וואטסאפ:\n${error}\n\nנא לבדוק את החיבור לאינטרנט ולנסות שוב.`);
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