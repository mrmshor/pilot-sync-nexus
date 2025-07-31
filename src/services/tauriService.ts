import { invoke } from '@tauri-apps/api/tauri';

/**
 * שירות Tauri - ממשק פשוט לפונקציות Tauri
 */
export const TauriService = {
  /**
   * בחירת תיקיה באמצעות Tauri
   */
  selectFolder: async (): Promise<string | null> => {
    try {
      console.log('🗂️ בוחר תיקיה דרך Tauri...');
      const result = await invoke<string>('select_folder');
      console.log('✅ תיקיה נבחרה:', result);
      return result;
    } catch (error) {
      console.error('❌ שגיאה בבחירת תיקיה:', error);
      if (error === 'User canceled folder selection') {
        return null; // משתמש ביטל
      }
      throw error;
    }
  },

  /**
   * פתיחת תיקיה באמצעות Tauri
   */
  openFolder: async (folderPath: string): Promise<void> => {
    try {
      console.log('📁 פותח תיקיה דרך Tauri:', folderPath);
      await invoke<string>('open_folder', { path: folderPath });
      console.log('✅ תיקיה נפתחה בהצלחה');
    } catch (error) {
      console.error('❌ שגיאה בפתיחת תיקיה:', error);
      throw error;
    }
  },

  /**
   * פתיחת וואטסאפ באמצעות Tauri
   */
  openWhatsApp: async (phoneNumber: string): Promise<void> => {
    try {
      console.log('💬 פותח וואטסאפ דרך Tauri:', phoneNumber);
      await invoke<string>('open_whatsapp', { phone: phoneNumber });
      console.log('✅ וואטסאפ נפתח בהצלחה');
    } catch (error) {
      console.error('❌ שגיאה בפתיחת וואטסאפ:', error);
      throw error;
    }
  },

  /**
   * שמירת נתוני פרויקט
   */
  saveProjectData: async (data: string, filename: string): Promise<string> => {
    try {
      console.log('💾 שומר נתונים דרך Tauri:', filename);
      const result = await invoke<string>('save_project_data', { data, filename });
      console.log('✅ נתונים נשמרו בהצלחה');
      return result;
    } catch (error) {
      console.error('❌ שגיאה בשמירת נתונים:', error);
      throw error;
    }
  },

  /**
   * טעינת נתוני פרויקט
   */
  loadProjectData: async (filename: string): Promise<string> => {
    try {
      console.log('📂 טוען נתונים דרך Tauri:', filename);
      const result = await invoke<string>('load_project_data', { filename });
      console.log('✅ נתונים נטענו בהצלחה');
      return result;
    } catch (error) {
      console.error('❌ שגיאה בטעינת נתונים:', error);
      throw error;
    }
  },

  /**
   * קבלת נתיב תיקיית האפליקציה
   */
  getAppDataDir: async (): Promise<string> => {
    try {
      const result = await invoke<string>('get_app_data_dir');
      return result;
    } catch (error) {
      console.error('❌ שגיאה בקבלת נתיב תיקיית האפליקציה:', error);
      throw error;
    }
  },

  /**
   * בדיקה אם האפליקציה רצה ב-Tauri
   */
  isTauri: (): boolean => {
    return typeof window !== 'undefined' && '__TAURI__' in window;
  }
};