import { useState, useCallback } from 'react';
import { FolderService } from '../services/folderService';
import { downloadHelperFiles } from '../utils/folderHelpers';

export interface FolderResult {
  success: boolean;
  path?: string;
  error?: string;
}

export const useLocalFolders = () => {
  const [isElectron] = useState(false); // Tauri app
  const [isTauri] = useState(typeof window !== 'undefined' && '__TAURI__' in window);

  const selectFolder = useCallback(async (): Promise<string | null> => {
    return await FolderService.selectFolder();
  }, []);

  const openFolder = useCallback(async (folderPath: string, icloudLink?: string): Promise<boolean> => {
    try {
      FolderService.openFolder(folderPath, icloudLink);
      return true;
    } catch (error) {
      console.error('Error opening folder:', error);
      return false;
    }
  }, []);

  const showItemInFolder = useCallback(async (itemPath: string): Promise<boolean> => {
    try {
      FolderService.openFolder(itemPath);
      return true;
    } catch (error) {
      console.error('Error showing item in folder:', error);
      return false;
    }
  }, []);

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

  const handleDownloadHelperFiles = useCallback(async () => {
    return await downloadHelperFiles();
  }, []);

  return {
    selectFolder,
    openFolder,
    showItemInFolder,
    attemptAutoOpen,
    downloadHelperFiles: handleDownloadHelperFiles,
    isElectron,
    isTauri,
  };
};