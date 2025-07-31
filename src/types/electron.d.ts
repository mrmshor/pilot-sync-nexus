declare global {
  interface Window {
    electronAPI?: {
      selectFolder: () => Promise<string | null>;
      openFolder: (folderPath: string) => Promise<void>;
      showItemInFolder: (itemPath: string) => Promise<void>;
    };
  }
}

export {};