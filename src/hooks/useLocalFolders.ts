import { useState, useCallback } from 'react';
import { FolderService } from '../services';

export interface FolderResult {
  success: boolean;
  path?: string;
  error?: string;
}

export const useLocalFolders = () => {

  const selectFolder = useCallback(async (): Promise<string | null> => {
    try {
      return await FolderService.selectFolder();
    } catch (error) {
      console.error('Error selecting folder:', error);
      return null;
    }
  }, []);

  const attemptAutoOpen = useCallback(async (path: string): Promise<boolean> => {
    try {
      await FolderService.openFolder(path);
      return true;
    } catch (error) {
      console.warn(`Failed to open path: ${path}`, error);
      return false;
    }
  }, []);

  const openFolder = useCallback(async (folderPath: string, icloudLink?: string): Promise<boolean> => {
    try {
      if (folderPath) {
        await FolderService.openFolder(folderPath, icloudLink);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error opening folder:', error);
      return false;
    }
  }, []);

  const showItemInFolder = useCallback(async (itemPath: string): Promise<boolean> => {
    try {
      return await attemptAutoOpen(itemPath);
    } catch (error) {
      console.error('Error showing item in folder:', error);
      return false;
    }
  }, [attemptAutoOpen]);

  return {
    selectFolder,
    openFolder,
    showItemInFolder,
    attemptAutoOpen,
    isElectron: false,
    isTauri: false, // Browser only
  };
};