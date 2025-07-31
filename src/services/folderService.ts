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
        return dirHandle.name;
      }

      // Fallback for older browsers
      return new Promise<string | null>((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.style.display = 'none';

        input.addEventListener('change', (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            const path = files[0].webkitRelativePath.split('/')[0];
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
      // Only show manual input as last resort
      const path = prompt('בחירת תיקיה נכשלה. הכנס נתיב מלא:');
      return path;
    }
  },

  openFolder: (folderPath?: string, icloudLink?: string) => {
    console.log('🗂️ מנסה לפתוח תיקיה:', { folderPath, icloudLink });
    
    if (!folderPath && !icloudLink) {
      console.warn('⚠️ לא נמצא נתיב תיקיה או קישור iCloud');
      alert('אין נתיב תיקיה מוגדר לפרויקט זה');
      return;
    }

    // Try opening folder path first
    if (folderPath) {
      try {
        // For desktop apps - try different protocols
        if (window.electronAPI && (window.electronAPI as any).openFolder) {
          (window.electronAPI as any).openFolder(folderPath);
          console.log('✅ נפתח באמצעות Electron API');
          return;
        }
        
        // For web browsers - try file protocol
        const fileUrl = folderPath.startsWith('file://') ? folderPath : `file://${folderPath}`;
        console.log('🌐 מנסה לפתוח ב-file protocol:', fileUrl);
        window.open(fileUrl, '_blank');
        
      } catch (error) {
        console.error('❌ שגיאה בפתיחת תיקיה:', error);
        
        // Fallback to iCloud if available
        if (icloudLink) {
          console.log('🔄 מעבר לקישור iCloud');
          window.open(icloudLink, '_blank');
        } else {
          alert(`לא ניתן לפתוח את התיקיה: ${folderPath}\nנסה לפתוח אותה באופן ידני`);
        }
      }
    } else if (icloudLink) {
      // Only iCloud link available
      console.log('☁️ פותח קישור iCloud');
      window.open(icloudLink, '_blank');
    }
  },

  generateFolderPath: (projectName: string, clientName: string) => {
    const sanitizedProject = projectName.replace(/[^א-ת\w\s]/g, '').trim();
    const sanitizedClient = clientName.replace(/[^א-ת\w\s]/g, '').trim();
    return `/Users/${Intl.DateTimeFormat().resolvedOptions().timeZone}/Projects/${sanitizedClient}/${sanitizedProject}`;
  }
};