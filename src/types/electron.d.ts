declare global {
  interface Window {
    electronAPI?: {
      selectFolder: () => Promise<string | null>;
      openFolder: (path: string) => Promise<void>;
    };
  }
}

export {};