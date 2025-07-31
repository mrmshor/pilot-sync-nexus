import { FileSystemService } from './fileSystemService';
import { CommunicationService } from './communicationService';
import { ContactHelpers } from '../utils/contactHelpers';

/**
 * שירות תיקיות - ממשק מאוחד לכל פעולות התיקיות והתקשורת
 * @deprecated השתמש ישירות ב-FileSystemService ו-CommunicationService
 */
export const FolderService = {
  // ====== פעולות תיקיות ======
  selectFolder: FileSystemService.selectFolder,
  openFolder: FileSystemService.openFolder,
  generateFolderPath: FileSystemService.generateFolderPath,

  // ====== פעולות תקשורת ======
  openWhatsApp: CommunicationService.openWhatsApp,
  makePhoneCall: CommunicationService.makePhoneCall,
  sendEmail: CommunicationService.sendEmail,

  // ====== כלי עזר לפרטי יצירת קשר ======
  cleanPhoneNumber: ContactHelpers.cleanPhoneNumber,
  formatPhoneForDisplay: ContactHelpers.formatPhoneForDisplay
};