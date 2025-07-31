import { TauriService } from './tauriService';

/**
 * שירות מערכת קבצים - טיפול בבחירה ופתיחה של תיקיות
 */
export const FileSystemService = {
  /**
   * זיהוי סביבת ההפעלה
   */
  getEnvironment: () => {
    const isTauri = !!(window as any).__TAURI__;
    const isElectron = !!(window as any).electronAPI;
    const isBrowser = !isTauri && !isElectron;
    
    return { isTauri, isElectron, isBrowser };
  },

/**
 * בחירת תיקיה במחשב
 */
selectFolder: async (): Promise<string | null> => {
  console.log('🗂️ מתחיל בחירת תיקיה');
  
  try {
    const { isTauri, isElectron, isBrowser } = FileSystemService.getEnvironment();
    
    console.log('סביבה זוהתה:', { isTauri, isElectron, isBrowser });
    console.log('electronAPI זמין:', !!(window as any).electronAPI);
    
    // Electron - אפליקציית שולחן (עדיפות ראשונה)
    if (isElectron && (window as any).electronAPI?.selectFolder) {
      console.log('🖥️ משתמש ב-Electron');
      const result = await (window as any).electronAPI.selectFolder();
      console.log('תוצאת selectFolder:', result);
      
      if (result && result.success && result.path) {
        console.log('✅ תיקיה נבחרה:', result.path);
        return result.path;
      } else if (result && result.canceled) {
        console.log('ℹ️ המשתמש ביטל');
        return null;
      } else {
        console.error('❌ שגיאה בתוצאת Electron');
        return null;
      }
    }

    // Tauri - אפליקציית שולחן
    if (isTauri) {
      console.log('🖥️ משתמש ב-Tauri');
      try {
        const folderPath = await TauriService.selectFolder();
        console.log('✅ תיקיה נבחרה:', folderPath);
        return folderPath;
      } catch (error) {
        console.error('❌ Tauri selectFolder נכשל:', error);
        return null;
      }
    }

    // דפדפן - שתי אפשרויות: בחירת תיקיה או נתיב מלא
    if (isBrowser) {
      console.log('🌐 סביבת דפדפן');
      
      const choice = confirm(`🗂️ בחירת תיקיה במחשב:

✅ אישור = בחר תיקיה (רק שם התיקיה יישמר)
❌ ביטול = הזן נתיב מלא (פתיחה ישירה אפשרית)

בחר את האפשרות המועדפת עליך:`);

      if (!choice) {
        // הזנת נתיב מלא ידני
        const manualPath = prompt(`📁 הזן נתיב מלא לתיקיה:

🖥️ דוגמאות:
• Windows: C:\\Users\\YourName\\Documents\\Projects
• Mac: /Users/YourName/Documents/Projects
• iCloud: ~/Library/Mobile Documents/com~apple~CloudDocs/Projects

הזן נתיב מלא:`);

        if (manualPath && manualPath.trim()) {
          const cleanPath = manualPath.trim();
          console.log('✅ נשמר נתיב מלא:', cleanPath);
          return cleanPath;
        }
        return null;
      } else {
        // בחירת תיקיה רגילה (רק שם)
        if ('showDirectoryPicker' in window) {
          try {
            const dirHandle = await (window as any).showDirectoryPicker();
            console.log('✅ תיקיה נבחרה:', dirHandle.name);
            return dirHandle.name;
          } catch (error: any) {
            console.log('ℹ️ File System API נכשל:', error.message);
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
      }
    }
      
  } catch (error) {
      console.error('❌ שגיאה בבחירת תיקיה:', error);
      return null;
    }

    return null;
  },

  /**
   * פתיחת תיקיה או קישור
   */
  openFolder: async (folderPath?: string, icloudLink?: string): Promise<void> => {
    console.log('🗂️ מנסה לפתוח תיקיה:', { folderPath, icloudLink });
    
    // עדיפות ל-iCloud Link
    if (icloudLink?.trim()) {
      console.log('🔗 פותח קישור iCloud');
      window.open(icloudLink, '_blank');
      return;
    }

    // בדיקת נתיב תיקיה
    if (!folderPath?.trim()) {
      console.log('⚠️ אין נתיב תיקיה');
      return;
    }

    console.log('📁 מנסה לפתוח:', folderPath);

    // קישורי רשת
    if (folderPath.startsWith('http')) {
      console.log('🌐 פותח קישור רשת');
      window.open(folderPath, '_blank');
      return;
    }

    const { isTauri, isElectron, isBrowser } = FileSystemService.getEnvironment();

    console.log('סביבה זוהתה:', { isTauri, isElectron, isBrowser });
    console.log('electronAPI זמין:', !!(window as any).electronAPI);

    // Electron - אפליקציית שולחן (עדיפות ראשונה)
    if (isElectron && (window as any).electronAPI?.openFolder) {
      console.log('🖥️ משתמש ב-Electron');
      try {
        await (window as any).electronAPI.openFolder(folderPath);
        console.log('✅ Electron הצליח');
        return;
      } catch (error) {
        console.error('❌ Electron נכשל:', error);
      }
    }

    // Tauri - אפליקציית שולחן
    if (isTauri) {
      console.log('🖥️ משתמש ב-Tauri');
      try {
        await TauriService.openFolder(folderPath);
        console.log('✅ Tauri הצליח');
        return;
      } catch (error) {
        console.error('❌ Tauri נכשל:', error);
      }
    }

    // דפדפן - טיפול חכם לפי סוג הנתיב
    if (isBrowser) {
      console.log('🌐 משתמש בדפדפן');
      
      // אם זה שם תיקיה בלבד (בלי סלאש), אל תעשה כלום
      if (!folderPath.includes('/') && !folderPath.includes('\\')) {
        console.log('🗂️ זוהה שם תיקיה פשוט, לא מבצע פעולה');
        return;
      }

      // עבור נתיב מלא - נסה לפתוח ישירות
      const isWindows = folderPath.includes('\\') || folderPath.match(/^[A-Z]:/);
      const isMac = folderPath.startsWith('/') || folderPath.startsWith('~');

      try {
        if (isWindows) {
          const winPath = folderPath.replace(/\//g, '\\');
          window.open(`file:///${winPath}`, '_blank');
          console.log('✅ ניסיון פתיחת Windows הושלם');
        } else if (isMac) {
          window.open(`file://${folderPath}`, '_blank');
          console.log('✅ ניסיון פתיחת Mac הושלם');
        } else {
          // ניסיון כללי
          window.open(`file://${folderPath}`, '_blank');
          console.log('✅ ניסיון פתיחה כללי הושלם');
        }
      } catch (error) {
        console.error('❌ פתיחה בדפדפן נכשלה:', error);
      }
    }
  },

  /**
   * יצירת נתיב תיקיה
   */
  generateFolderPath: (projectName: string, clientName: string): string => {
    const sanitizedProject = projectName.replace(/[^א-ת\w\s]/g, '').trim();
    const sanitizedClient = clientName.replace(/[^א-ת\w\s]/g, '').trim();
    return `/Users/Desktop/Projects/${sanitizedClient}/${sanitizedProject}`;
  }
};