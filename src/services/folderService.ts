export const FolderService = {
  selectFolder: async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker();
        return dirHandle.name;
      }

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
      const path = prompt('הכנס נתיב תיקיה מלא:');
      return path;
    }
  },

  openFolder: (folderPath?: string, icloudLink?: string) => {
    if (folderPath) {
      try {
        window.open(`file://${folderPath}`, '_blank');
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