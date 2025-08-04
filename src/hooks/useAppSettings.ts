import { useState, useEffect, useCallback } from 'react';
import { TauriService } from '@/services/TauriService';
import { useToast } from './use-toast';

interface AppSettings {
  customLogo: string | null;
  theme: 'light' | 'dark';
  language: 'he' | 'en';
  autoSave: boolean;
}

const defaultSettings: AppSettings = {
  customLogo: null,
  theme: 'light',
  language: 'he',
  autoSave: true
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await TauriService.loadData('app-settings.json');
      if (data) {
        const loadedSettings = JSON.parse(data);
        setSettings({ ...defaultSettings, ...loadedSettings });
      }
    } catch (error) {
      console.log('Loading default settings (first time)');
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await TauriService.saveData('app-settings.json', JSON.stringify(updatedSettings, null, 2));
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Fallback to localStorage
      localStorage.setItem('appSettings', JSON.stringify({ ...settings, ...newSettings }));
    }
  }, [settings]);

  const uploadLogo = useCallback(async (file: File) => {
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "שגיאה",
        description: "גודל הקובץ גדול מדי. אנא בחר קובץ קטן מ-2MB",
        variant: "destructive",
      });
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = e.target?.result as string;
          await saveSettings({ customLogo: result });
          
          // Update favicon
          const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
          if (favicon) {
            favicon.href = result;
          } else {
            const newFavicon = document.createElement('link');
            newFavicon.rel = 'icon';
            newFavicon.href = result;
            document.head.appendChild(newFavicon);
          }
          
          // Update app title
          document.title = 'מערכת ניהול פרויקטים Pro • לוגו מותאם';
          
          toast({
            title: "הלוגו הועלה בהצלחה",
            description: "הלוגו החדש נשמר במערכת לצמיתות",
          });
          resolve();
        } catch (error) {
          console.error('Error saving logo:', error);
          toast({
            title: "שגיאה בשמירת הלוגו",
            description: "אירעה שגיאה בשמירת הלוגו",
            variant: "destructive",
          });
          reject(error);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [saveSettings, toast]);

  const removeLogo = useCallback(async () => {
    await saveSettings({ customLogo: null });
    
    // Reset favicon
    const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (favicon) {
      favicon.href = '/favicon.ico';
    }
    
    // Reset app title
    document.title = 'מערכת ניהול פרויקטים Pro';
    
    toast({
      title: "הלוגו הוסר",
      description: "חזרנו ללוגו הברירת מחדל",
    });
  }, [saveSettings, toast]);

  // Load settings on hook initialization
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Update favicon when logo changes
  useEffect(() => {
    if (settings.customLogo && typeof window !== 'undefined') {
      const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (favicon) {
        favicon.href = settings.customLogo;
      } else {
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = settings.customLogo;
        document.head.appendChild(newFavicon);
      }
      
      document.title = 'מערכת ניהול פרויקטים Pro • לוגו מותאם';
    } else if (typeof window !== 'undefined') {
      document.title = 'מערכת ניהול פרויקטים Pro';
    }
  }, [settings.customLogo]);

  return {
    settings,
    loading,
    saveSettings,
    uploadLogo,
    removeLogo
  };
};