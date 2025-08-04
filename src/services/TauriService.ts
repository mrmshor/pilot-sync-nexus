// Centralized Tauri service for all native operations
export class TauriService {
  static isTauriApp(): boolean {
    return typeof window !== 'undefined' && '__TAURI__' in window;
  }

  static async saveData(filename: string, data: string): Promise<void> {
    if (!this.isTauriApp()) {
      // Fallback to localStorage in development
      localStorage.setItem(`tauri_${filename}`, data);
      return;
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('save_project_data', { data, filename });
    } catch (error) {
      console.error('Tauri save failed:', error);
      localStorage.setItem(`tauri_${filename}`, data);
    }
  }

  static async loadData(filename: string): Promise<string | null> {
    if (!this.isTauriApp()) {
      // Fallback to localStorage in development
      return localStorage.getItem(`tauri_${filename}`);
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('load_project_data', { filename });
    } catch (error) {
      console.error('Tauri load failed:', error);
      return localStorage.getItem(`tauri_${filename}`);
    }
  }

  static async openFolder(folderPath: string): Promise<void> {
    if (!this.isTauriApp()) {
      console.warn('Folder opening only available in desktop app');
      return;
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('open_folder_native', { path: folderPath });
    } catch (error) {
      console.error('Failed to open folder:', error);
      throw error;
    }
  }

  static async selectFolder(): Promise<string | null> {
    if (!this.isTauriApp()) {
      console.warn('Folder selection only available in desktop app');
      return null;
    }

    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'בחר תיקיה לפרויקט'
      });
      
      return typeof selected === 'string' ? selected : null;
    } catch (error) {
      console.error('Failed to select folder:', error);
      return null;
    }
  }

  static async openUrl(url: string): Promise<void> {
    if (!this.isTauriApp()) {
      window.open(url, '_blank');
      return;
    }

    try {
      const { open } = await import('@tauri-apps/plugin-shell');
      await open(url);
    } catch (error) {
      console.error('Failed to open URL:', error);
      window.open(url, '_blank');
    }
  }

  static async makePhoneCall(phone: string): Promise<void> {
    if (!this.isTauriApp()) {
      window.open(`tel:${phone}`, '_blank');
      return;
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('make_phone_call', { phone });
    } catch (error) {
      console.error('Failed to make phone call:', error);
      await this.openUrl(`tel:${phone}`);
    }
  }

  static async openWhatsApp(phone: string): Promise<void> {
    if (!this.isTauriApp()) {
      window.open(`https://wa.me/${phone}`, '_blank');
      return;
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('open_whatsapp_with_phone', { phone });
    } catch (error) {
      console.error('Failed to open WhatsApp:', error);
      await this.openUrl(`https://wa.me/${phone}`);
    }
  }

  static async sendEmail(email: string, subject?: string, body?: string): Promise<void> {
    let mailtoUrl = `mailto:${email}`;
    const params = [];
    
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    
    if (params.length > 0) {
      mailtoUrl += `?${params.join('&')}`;
    }

    if (!this.isTauriApp()) {
      window.open(mailtoUrl, '_blank');
      return;
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('send_email_native', { email, subject, body });
    } catch (error) {
      console.error('Failed to send email:', error);
      await this.openUrl(mailtoUrl);
    }
  }
}