import { useState, useEffect } from 'react';

export const useLocalFolders = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [isTauri, setIsTauri] = useState(false);
  
  useEffect(() => {
    // בדיקת Electron
    const electronAPI = (window as any).electronAPI;
    setIsElectron(!!electronAPI);
    
    // בדיקת Tauri
    const tauriAPI = (window as any).__TAURI__;
    setIsTauri(!!tauriAPI);
  }, []);

  const downloadFolderHelper = () => {
    const isWindows = navigator.platform.toLowerCase().includes('win');
    const isMac = navigator.platform.toLowerCase().includes('mac');
    
    if (isWindows) {
      // Windows batch file
      const batContent = `@echo off
echo פותח תיקיה...
start "" "%1"
pause`;
      const blob = new Blob([batContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'open-folder.bat';
      a.click();
      URL.revokeObjectURL(url);
    } else if (isMac) {
      // Mac shell script
      const shContent = `#!/bin/bash
echo "פותח תיקיה..."
open "$1"`;
      const blob = new Blob([shContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'open-folder.sh';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const openFolderAdvanced = async (folderPath: string, icloudLink?: string) => {
    // Tauri - פתיחה ישירה
    if (isTauri && folderPath) {
      try {
        const { openPath } = await import('@tauri-apps/plugin-opener');
        await openPath(folderPath);
        return true;
      } catch (error) {
        console.error('Tauri folder open failed:', error);
      }
    }
    
    // Electron - פתיחה ישירה
    if (isElectron && folderPath) {
      try {
        const electronAPI = (window as any).electronAPI;
        await electronAPI.openFolder(folderPath);
        return true;
      } catch (error) {
        console.error('Electron folder open failed:', error);
      }
    }
    
    // iCloud fallback
    if (icloudLink) {
      window.open(icloudLink, '_blank');
      return true;
    }
    
    return false;
  };

  return {
    isElectron,
    isTauri,
    isDesktop: isElectron || isTauri,
    downloadFolderHelper,
    openFolderAdvanced
  };
};