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

  openFolder: async (folderPath?: string, icloudLink?: string) => {
    if (folderPath) {
      try {
        // בדוק אם זה אפליקציית Tauri
        if ((window as any).__TAURI__) {
          const { invoke } = (window as any).__TAURI__.tauri;
          await invoke('show_in_folder', { path: folderPath });
        } else {
          // fallback לדפדפן
          window.open(`file://${folderPath}`, '_blank');
        }
      } catch (error) {
        console.error('Error opening folder:', error);
        if (icloudLink) {
          window.open(icloudLink, '_blank');
        }
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