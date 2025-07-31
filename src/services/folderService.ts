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
        // For desktop apps with Tauri/Electron - try different protocols
        if ((window as any).__TAURI__ && (window as any).__TAURI__.shell) {
          // Tauri app
          (window as any).__TAURI__.shell.open(folderPath);
          console.log('✅ נפתח באמצעות Tauri API');
          return;
        }
        
        if (window.electronAPI && (window.electronAPI as any).openFolder) {
          // Electron app
          (window.electronAPI as any).openFolder(folderPath);
          console.log('✅ נפתח באמצעות Electron API');
          return;
        }
        
        // Special case for web browsers - if path looks like a generated path, explain to user
        if (folderPath.includes('/Users/') && folderPath.includes('/Projects/')) {
          alert(`זהו נתיב מודה שנוצר אוטומטית: ${folderPath}\n\nבדפדפן לא ניתן לפתוח תיקיות מקומיות מסיבות אבטחה.\nאנא פתח את התיקיה באופן ידני ב-Finder או השתמש בקישור iCloud אם קיים.`);
          return;
        }
        
        // For macOS - try to use the system command (works only in native apps)
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        if (isMac) {
          // Try using a custom URL scheme that might be handled by the system
          const finderUrl = `x-apple.systemevents://finder?path=${encodeURIComponent(folderPath)}`;
          window.location.href = finderUrl;
          console.log('🍎 מנסה לפתוח ב-Finder:', finderUrl);
          return;
        }
        
        // Fallback: try file protocol (might not work in most browsers due to security)
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
          // Show user the path so they can open it manually
          const userChoice = confirm(`לא ניתן לפתוח את התיקיה אוטומטית.\nנתיב התיקיה: ${folderPath}\n\nהאם ברצונך להעתיק את הנתיב ללוח?`);
          if (userChoice) {
            navigator.clipboard.writeText(folderPath).then(() => {
              alert('הנתיב הועתק ללוח. תוכל להדביק אותו ב-Finder.');
            }).catch(() => {
              alert(`נתיב התיקיה: ${folderPath}\nהעתק את הנתיב ופתח אותו ב-Finder באופן ידני.`);
            });
          }
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