import { open as tauriOpen } from '@tauri-apps/plugin-dialog';
import { openPath } from '@tauri-apps/plugin-opener';

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
      
      // Tauri - אפליקציית שולחן
      if (isTauri) {
        console.log('🖥️ משתמש ב-Tauri');
        const folderPath = await tauriOpen({
          multiple: false,
          directory: true,
          title: 'בחר תיקיה לפרויקט'
        });
        console.log('✅ תיקיה נבחרה:', folderPath);
        return folderPath || null;
      }

      // Electron - אפליקציית שולחן
      if (isElectron && (window as any).electronAPI?.selectFolder) {
        console.log('🖥️ משתמש ב-Electron');
        const folderPath = await (window as any).electronAPI.selectFolder();
        console.log('✅ תיקיה נבחרה:', folderPath);
        return folderPath;
      }

      // דפדפן - File System Access API
      if (isBrowser) {
        console.log('🌐 סביבת דפדפן - מנסה File System API');
        
        if ('showDirectoryPicker' in window) {
          try {
            const dirHandle = await (window as any).showDirectoryPicker();
            console.log('✅ תיקיה נבחרה באמצעות File System API:', dirHandle.name);
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

    // Tauri - אפליקציית שולחן
    if (isTauri) {
      console.log('🖥️ משתמש ב-Tauri');
      try {
        await openPath(folderPath);
        console.log('✅ Tauri הצליח');
        return;
      } catch (error) {
        console.error('❌ Tauri נכשל:', error);
      }
    }

    // Electron - אפליקציית שולחן
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

    // דפדפן - ניסיונות שונים
    if (isBrowser) {
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