declare module '@capacitor/core' {
  interface PluginRegistry {
    // הוסף כאן plugins נוספים אם נדרש
  }
}

declare global {
  interface Window {
    Capacitor?: any;
  }
}

export {};