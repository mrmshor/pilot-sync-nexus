import { TauriService } from './tauriService';

/**
 * שירות תקשורת - טיפול בוואטסאפ, טלפון ואימייל
 */
export const CommunicationService = {
  /**
   * זיהוי סביבת ההפעלה
   */
  getEnvironment: () => {
    const isTauri = !!(window as any).__TAURI__;
    const isElectron = !!(window as any).electronAPI;
    const isBrowser = !isTauri && !isElectron;
    
    return { isTauri, isElectron, isBrowser };
  },

  /**
   * פתיחת וואטסאפ
   */
  openWhatsApp: async (phone: string): Promise<void> => {
    console.log('🟢 פותח וואטסאפ עם מספר:', phone);
    
    if (!phone?.trim()) {
      console.error('❌ אין מספר וואטסאפ');
      return;
    }

    try {
      // ניקוי המספר - רק ספרות
      const cleanNumber = phone.replace(/\D/g, '');
      console.log('🔢 מספר נקי:', cleanNumber);

      if (cleanNumber.length < 9) {
        console.error(`❌ מספר טלפון קצר מדי: ${phone}`);
        return;
      }

      // פורמט למספר ישראלי
      let formattedNumber = cleanNumber;
      if (cleanNumber.startsWith('0')) {
        formattedNumber = '972' + cleanNumber.substring(1);
      } else if (!cleanNumber.startsWith('972')) {
        formattedNumber = '972' + cleanNumber;
      }

      const whatsappUrl = `https://wa.me/${formattedNumber}`;
      console.log('🟢 פותח:', whatsappUrl);
      
      const { isTauri, isElectron } = CommunicationService.getEnvironment();
      
      // Tauri - אפליקציית שולחן
      if (isTauri) {
        try {
          await TauriService.openWhatsApp(formattedNumber);
          console.log('✅ וואטסאפ נפתח דרך Tauri');
          return;
        } catch (error) {
          console.error('❌ Tauri נכשל עבור וואטסאפ:', error);
          // נפל חזרה לשיטה הרגילה
        }
      }
      
      // דפדפן או Electron
      window.open(whatsappUrl, '_blank');
      console.log('✅ וואטסאפ נפתח בהצלחה');
    } catch (error) {
      console.error('❌ שגיאה בוואטסאפ:', error);
    }
  },

  /**
   * ביצוע שיחת טלפון
   */
  makePhoneCall: (phone?: string): void => {
    console.log('📞 מתחיל שיחה למספר:', phone);
    
    if (!phone?.trim()) {
      console.error('❌ אין מספר טלפון');
      return;
    }

    try {
      const telUrl = `tel:${phone}`;
      console.log('📞 פותח:', telUrl);
      window.open(telUrl);
      console.log('✅ שיחה התחילה');
    } catch (error) {
      console.error('❌ שגיאה בשיחה:', error);
    }
  },

  /**
   * שליחת אימייל
   */
  sendEmail: (email?: string): void => {
    console.log('📧 שולח אימייל ל:', email);
    
    if (!email?.trim()) {
      console.error('❌ אין כתובת אימייל');
      return;
    }

    try {
      const mailtoUrl = `mailto:${email}`;
      console.log('📧 פותח:', mailtoUrl);
      window.open(mailtoUrl);
      console.log('✅ אימייל נפתח');
    } catch (error) {
      console.error('❌ שגיאה באימייל:', error);
    }
  }
};