// Clean, centralized exports for all services
export * from './TauriService';
export * from './ProjectService';
export * from './QuickTaskService';
export * from './ExportService';

// Legacy compatibility - keeping some of the old functions for backward compatibility
import { TauriService } from './TauriService';
import { ExportService as NewExportService } from './ExportService';

// Legacy ContactService functions
export const ContactService = {
  cleanPhoneNumber: (phone: string): string => phone.replace(/[^\d+]/g, ''),
  
  formatPhoneForInternational: (phone: string, defaultCountryCode: string = '972'): string => {
    if (!phone) return '';
    
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    if (cleaned.startsWith('0')) {
      return defaultCountryCode + cleaned.slice(1);
    }
    
    if (cleaned.startsWith('972') || cleaned.startsWith('1') || cleaned.length > 10) {
      return cleaned;
    }
    
    return defaultCountryCode + cleaned;
  },
  
  formatPhoneForDisplay: (phone: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/[^\d]/g, '');
    if (cleaned.startsWith('972')) {
      const withoutCountry = cleaned.substring(3);
      return `+972-${withoutCountry.substring(0, 2)}-${withoutCountry.substring(2, 5)}-${withoutCountry.substring(5)}`;
    }
    return phone;
  },
  
  validatePhoneNumber: (phone: string): boolean => {
    if (!phone) return false;
    const cleaned = phone.replace(/[^\d+]/g, '');
    return cleaned.length >= 7;
  },
  
  makePhoneCall: async (phone: string): Promise<void> => {
    if (!phone) return;
    const formatted = ContactService.formatPhoneForInternational(phone);
    if (!ContactService.validatePhoneNumber(formatted)) {
      console.warn('Invalid phone number:', phone);
      return;
    }
    await TauriService.makePhoneCall(formatted);
  },
  
  openWhatsApp: async (phone: string): Promise<void> => {
    if (!phone) return;
    const formatted = ContactService.formatPhoneForInternational(phone);
    if (!ContactService.validatePhoneNumber(formatted)) {
      console.warn('Invalid phone number for WhatsApp:', phone);
      return;
    }
    await TauriService.openWhatsApp(formatted);
  },
  
  sendEmail: async (email: string, subject?: string, body?: string): Promise<void> => {
    if (!email || !email.includes('@')) {
      console.warn('Invalid email address:', email);
      return;
    }
    await TauriService.sendEmail(email, subject, body);
  }
};

// Legacy FolderService functions
export const FolderService = {
  selectFolder: async (): Promise<string | null> => {
    return await TauriService.selectFolder();
  },

  openFolder: async (folderPath: string, icloudLink?: string): Promise<void> => {
    if (!folderPath) {
      console.warn('No folder path provided');
      return;
    }
    
    try {
      await TauriService.openFolder(folderPath);
    } catch (error) {
      // Fallback to iCloud link if available
      if (icloudLink && icloudLink.startsWith('http')) {
        await TauriService.openUrl(icloudLink);
      } else {
        throw error;
      }
    }
  },

  generateFolderPath: (projectName: string, clientName: string): string => {
    const sanitizedProject = projectName.replace(/[^א-ת\w\s\-\.]/g, '').trim();
    const sanitizedClient = clientName.replace(/[^א-ת\w\s\-\.]/g, '').trim();
    
    const homeDir = '/Users/' + (process.env.USER || 'User');
    return `${homeDir}/Documents/Projects/${sanitizedClient}/${sanitizedProject}`;
  }
};

// Legacy openWithTauri function
export const openWithTauri = async (url: string): Promise<boolean> => {
  try {
    await TauriService.openUrl(url);
    return true;
  } catch (error) {
    console.warn('Failed to open URL with Tauri:', error);
    return false;
  }
};

// Helper function to detect if running in Tauri
export const isTauriApp = (): boolean => {
  return TauriService.isTauriApp();
};

// Legacy ExportService - for backward compatibility
export const ExportService = {
  exportProjectsAdvanced: (projects: any[], format: 'csv' | 'json' = 'csv') => {
    if (format === 'csv') {
      NewExportService.exportProjectsCSV(projects);
    }
  },
  exportTasksAdvanced: (tasks: any[]) => {
    NewExportService.exportQuickTasksTXT(tasks);
  }
};