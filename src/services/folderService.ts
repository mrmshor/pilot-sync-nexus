import { open as tauriOpen } from '@tauri-apps/plugin-dialog';
import { openPath } from '@tauri-apps/plugin-opener';

export const FolderService = {
  selectFolder: async () => {
    console.log('🗂️ מתחיל בחירת תיקיה...');
    
    try {
      // Priority 1: Tauri Desktop App
      if ((window as any).__TAURI__) {
        console.log('🖥️ זוהה Tauri - משתמש ב-dialog plugin');
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
          return null;
        } catch (tauriError) {
          console.error('❌ שגיאה ב-Tauri dialog:', tauriError);
          const manualPath = prompt('הכנס נתיב תיקיה:');
          return manualPath;
        }
      }

      // Priority 2: Browser with File System Access API (only if not in iframe)
      if ('showDirectoryPicker' in window && window.top === window.self) {
        console.log('🌐 משתמש ב-File System Access API');
        try {
          const dirHandle = await (window as any).showDirectoryPicker();
          return { name: dirHandle.name, handle: dirHandle };
        } catch (error) {
          console.error('❌ שגיאה ב-showDirectoryPicker:', error);
          // Fall through to manual input
        }
      }

      // Priority 3: Manual input (works everywhere including iframe)
      console.log('📝 משתמש בהכנסה ידנית');
      const folderPath = prompt(`בחר אחת מהאפשרויות:

1️⃣ הכנס נתיב מלא (C:\\Users\\...)
2️⃣ הכנס קישור iCloud 
3️⃣ השאר ריק ותוכל להוסיף מאוחר יותר

נתיב תיקיה:`);
      
      if (folderPath && folderPath.trim()) {
        console.log('✅ נתיב הוכנס ידנית:', folderPath);
        return folderPath.trim();
      }
      
      return null;
    } catch (error) {
      console.error('❌ שגיאה כללית בבחירת תיקיה:', error);
      return null;
    }
  },

  openFolder: async (folderPath?: string, icloudLink?: string) => {
    console.log('🗂️ FolderService.openFolder called with:', { folderPath, icloudLink });
    
    // בדיקה ראשונית
    if (!folderPath && !icloudLink) {
      console.log('❌ No path provided');
      alert('❌ לא הוגדר נתיב תיקיה או קישור iCloud.\nנא להוסיף בעריכת הפרויקט.');
      return;
    }

    // ניסיון עם iCloud קודם
    if (icloudLink?.trim()) {
      console.log('🔗 Trying iCloud link:', icloudLink);
      if (icloudLink.startsWith('http')) {
        window.open(icloudLink, '_blank');
        return;
      }
    }

    // ניסיון עם נתיב מקומי
    if (folderPath?.trim()) {
      console.log('📁 Trying local path:', folderPath);
      
      // אם זה קישור רשת - פתח ישירות
      if (folderPath.startsWith('http')) {
        window.open(folderPath, '_blank');
        return;
      }
      
      // אם זה iCloud או קישור מיוחד
      if (folderPath.startsWith('icloud://')) {
        window.open(folderPath, '_blank');
        return;
      }
      
      // עבור נתיבים מקומיים - הצע פתרונות
      const message = `🔒 לא ניתן לפתוח תיקיות מקומיות בדפדפן

📁 נתיב: ${folderPath}

💡 פתרונות:
✅ הוסף קישור iCloud (מומלץ)
✅ הורד קובץ עזר לפתיחה
✅ העתק נתיב ופתח ידנית

האם להעתיק הנתיב?`;
      
      if (confirm(message)) {
        try {
          await navigator.clipboard.writeText(folderPath);
          alert('✅ הנתיב הועתק!\n\nפתח Finder/Explorer והדבק (Cmd+V)');
        } catch {
          prompt('העתק את הנתיב:', folderPath);
        }
      }
    }
  },

  makePhoneCall: (phone?: string) => {
    console.log('📞 makePhoneCall called with:', phone);
    if (phone) {
      console.log('📞 Opening tel:', `tel:${phone}`);
      window.open(`tel:${phone}`);
    } else {
      console.log('❌ No phone number provided');
    }
  },
  
  openWhatsApp: async (phone: string): Promise<void> => {
    console.log('🟢 openWhatsApp called with:', phone);
    if (!phone?.trim()) {
      console.log('❌ No WhatsApp number provided');
      alert('נא להזין מספר וואטסאפ');
      return;
    }
    
    try {
      // ניקוי פשוט - רק ספרות
      const cleanNumber = phone.replace(/\D/g, '');
      console.log('🟢 Cleaned number:', cleanNumber);
      
      // ווlidation בסיסית
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
      console.log('🟢 Opening WhatsApp URL:', whatsappUrl);
      
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('❌ שגיאה בוואטסאפ:', error);
      alert('שגיאה בפתיחת וואטסאפ');
    }
  },
  
  sendEmail: (email?: string) => {
    console.log('📧 sendEmail called with:', email);
    if (email) {
      console.log('📧 Opening mailto:', `mailto:${email}`);
      window.open(`mailto:${email}`);
    } else {
      console.log('❌ No email provided');
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