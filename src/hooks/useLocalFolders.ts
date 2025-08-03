import { useState, useCallback } from 'react';
import { FolderService } from '../services';
import { downloadHelperFiles } from '../utils/folderHelpers';

export interface FolderResult {
  success: boolean;
  path?: string;
  error?: string;
}

export const useLocalFolders = () => {
  const [isTauri] = useState(typeof window !== 'undefined' && '__TAURI__' in window);

  const selectFolder = useCallback(async (): Promise<string | null> => {
    try {
      // עבור עתיד: תמיכה בTauri עם electron API
      if (window.electronAPI?.selectFolder) {
        const result = await window.electronAPI.selectFolder();
        return result;
      }

      // Browser fallback
      return await FolderService.selectFolder();
    } catch (error) {
      console.error('Error selecting folder:', error);
      return null;
    }
  }, [isTauri]);

  const attemptAutoOpen = useCallback(async (path: string): Promise<boolean> => {
    const protocols = [
      `file://${path}`,
      `vscode://file/${path}`,
      `subl://open?url=file://${path}`,
    ];

    for (const protocol of protocols) {
      try {
        window.open(protocol, '_blank');
        return true;
      } catch (error) {
        console.warn(`Failed to open with protocol: ${protocol}`, error);
      }
    }

    return false;
  }, []);

  const openFolder = useCallback(async (folderPath: string, icloudLink?: string): Promise<boolean> => {
    try {
      // Electron API (עבור עתיד)
      if (window.electronAPI?.openFolder) {
        await window.electronAPI.openFolder(folderPath);
        return true;
      }

      // Browser fallback
      if (folderPath) {
        await FolderService.openFolder(folderPath, icloudLink);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error opening folder:', error);
      // Fallback to FolderService
      await FolderService.openFolder(folderPath, icloudLink);
      return false;
    }
  }, []);

  const showItemInFolder = useCallback(async (itemPath: string): Promise<boolean> => {
    try {
      // Electron API (עבור עתיד)
      if (window.electronAPI?.showItemInFolder) {
        await window.electronAPI.showItemInFolder(itemPath);
        return true;
      }
      
      // Browser fallback
      return await attemptAutoOpen(itemPath);
    } catch (error) {
      console.error('Error showing item in folder:', error);
      return false;
    }
  }, [attemptAutoOpen]);

  const handleDownloadHelperFiles = useCallback(async () => {
    return await downloadHelperFiles();
  }, []);

  return {
    selectFolder,
    openFolder,
    showItemInFolder,
    attemptAutoOpen,
    downloadHelperFiles: handleDownloadHelperFiles,
    isElectron: !!window.electronAPI,
    isTauri,
  };
};