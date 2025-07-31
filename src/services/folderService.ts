export const FolderService = {
  selectFolder: async () => {
    try {
      // First priority: Check for desktop app with Electron API
      if (window.electronAPI && window.electronAPI.selectFolder) {
        const folderPath = await window.electronAPI.selectFolder();
        return folderPath;
      }

      // Second priority: Modern browser with File System Access API
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker();
        // Store the full directory handle for later use
        return { name: dirHandle.name, handle: dirHandle };
      }

      // Fallback for older browsers
      return new Promise<any>((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.style.display = 'none';

        input.addEventListener('change', (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            const folderName = files[0].webkitRelativePath.split('/')[0];
            // For webkitdirectory, we can't get the full path, so we return just the name
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
      console.error('Error selecting folder:', error);
      // Only show manual input as last resort
      const path = prompt('בחירת תיקיה נכשלה. הכנס נתיב מלא:');
      return path;
    }
  },

  openFolder: async (folderPath?: string, icloudLink?: string) => {
    console.log('🗂️ פותח תיקיה במחשב שולחני:', { folderPath, icloudLink });
    
    if (!folderPath && !icloudLink) {
      alert('אין נתיב תיקיה מוגדר לפרויקט זה');
      return;
    }

    if (folderPath) {
      try {
        // בדוק אם יש לנו גישה ל-Tauri shell API
        if ((window as any).__TAURI__) {
          const { shell } = (window as any).__TAURI__;
          await shell.open(folderPath);
          console.log('✅ תיקיה נפתחה ב-Finder');
          return;
        }
        
        console.error('❌ __TAURI__ API לא זמין');
        alert(`לא ניתן לפתוח תיקיה: ${folderPath}`);
        
      } catch (error) {
        console.error('❌ שגיאה בפתיחת תיקיה:', error);
        alert(`שגיאה בפתיחת התיקיה: ${folderPath}\nשגיאה: ${error}`);
      }
    } else if (icloudLink) {
      window.open(icloudLink, '_blank');
    }
  },

  generateFolderPath: (projectName: string, clientName: string) => {
    const sanitizedProject = projectName.replace(/[^א-ת\w\s]/g, '').trim();
    const sanitizedClient = clientName.replace(/[^א-ת\w\s]/g, '').trim();
    return `/Users/${Intl.DateTimeFormat().resolvedOptions().timeZone}/Projects/${sanitizedClient}/${sanitizedProject}`;
  }
};