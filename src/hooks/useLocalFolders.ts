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

  const downloadHelperFiles = () => {
    const isWindows = navigator.platform.toLowerCase().includes('win');
    const helperFileName = isWindows ? 'folder-opener.bat' : 'folder-opener.sh';
    
    if (isWindows) {
      const batContent = `@echo off
echo פותח תיקיה: %1
start "" "%1"
echo התיקיה נפתחה
pause`;
      const blob = new Blob([batContent], { type: 'text/plain; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = helperFileName;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const shContent = `#!/bin/bash
echo "פותח תיקיה: $1"
open "$1"
echo "התיקיה נפתחה"`;
      const blob = new Blob([shContent], { type: 'text/plain; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = helperFileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const openFolder = async (path?: string) => {
    if (!path?.trim()) {
      console.warn('⚠️ נתיב ריק');
      return false;
    }

    try {
      console.log('🗂️ פותח תיקיה:', path);
      
      // קישורי רשת - פתיחה ישירה
      if (path.startsWith('http://') || path.startsWith('https://')) {
        window.open(path, '_blank', 'noopener,noreferrer');
        console.log('✅ קישור רשת נפתח');
        return true;
      }

      // קישורי iCloud מיוחדים
      if (path.startsWith('icloud://') || path.includes('icloud.com')) {
        window.open(path, '_blank', 'noopener,noreferrer');
        console.log('✅ קישור iCloud נפתח');
        return true;
      }

      // Electron - פתיחה מקומית
      if (isElectron) {
        const electronAPI = (window as any).electronAPI;
        if (electronAPI?.openFolder) {
          await electronAPI.openFolder(path);
          console.log('✅ תיקיה נפתחה דרך Electron');
          return true;
        }
      }

      // Tauri - פתיחה מקומית
      if (isTauri) {
        const { openPath } = await import('@tauri-apps/plugin-opener');
        await openPath(path);
        console.log('✅ תיקיה נפתחה דרך Tauri');
        return true;
      }

      // דפדפן רגיל - הדרכה למשתמש
      console.warn('⚠️ לא ניתן לפתוח תיקיה מקומית בדפדפן');
      return false;

    } catch (error) {
      console.error('❌ שגיאה בפתיחת תיקיה:', error);
      return false;
    }
  };

  return {
    isElectron,
    isTauri,
    isDesktop: isElectron || isTauri,
    downloadHelperFiles,
    openFolder
  };
};