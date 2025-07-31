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

      // Priority 2: File System Access API - ננסה תמיד
      if ('showDirectoryPicker' in window) {
        console.log('🌐 משתמש ב-File System Access API');
        try {
          const dirHandle = await (window as any).showDirectoryPicker();
          console.log('✅ תיקיה נבחרה דרך File System API:', dirHandle.name);
          return { name: dirHandle.name, handle: dirHandle };
        } catch (error) {
          console.log('ℹ️ File System API נכשל (רגיל ב-iframe):', error.name);
          // זה רגיל - נמשיך לאפשרויות הבאות
        }
      }

      // Priority 3: webkitdirectory fallback
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

        input.addEventListener('cancel', () => {
          console.log('ℹ️ בחירת תיקיה בוטלה');
          resolve(null);
        });
        
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
      });
    } catch (error) {
      console.error('❌ שגיאה כללית בבחירת תיקיה:', error);
      // אפשרות אחרונה - הכנסה ידנית
      const path = prompt(`בחירה אוטומטית נכשלה.
      
הכנס נתיב תיקיה או קישור:
• נתיב מקומי: C:\\Projects\\...
• קישור iCloud: https://...
• או השאר ריק לביטול`);
      return path?.trim() || null;
    }
  },

  openFolder: async (folderPath?: string, icloudLink?: string) => {
    // אם יש קישור iCloud - פתח אותו
    if (icloudLink?.trim()) {
      window.open(icloudLink, '_blank');
      return;
    }

    // אם יש נתיב תיקיה - פתח ישירות
    if (folderPath?.trim()) {
      // קישורי רשת
      if (folderPath.startsWith('http')) {
        window.open(folderPath, '_blank');
        return;
      }
      
      // Tauri - פתיחה ישירה
      if ((window as any).__TAURI__) {
        try {
          await openPath(folderPath);
          return;
        } catch (error) {
          // שקט
        }
      }
      
      // דפדפן - פתיחה ישירה
      try {
        const fileUrl = folderPath.startsWith('/') ? `file://${folderPath}` : `file:///${folderPath.replace(/\\/g, '/')}`;
        window.open(fileUrl, '_blank');
      } catch (error) {
        // שקט
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