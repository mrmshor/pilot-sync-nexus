/**
 * כלי עזר לטיפול במספרי טלפון ופרטי יצירת קשר
 */
export const ContactHelpers = {
  /**
   * ניקוי מספר טלפון - רק ספרות
   */
  cleanPhoneNumber: (phone: string): string => {
    return phone.replace(/[^\d]/g, '');
  },

  /**
   * פורמט מספר טלפון לתצוגה יפה
   */
  formatPhoneForDisplay: (phone: string): string => {
    const cleaned = phone.replace(/[^\d]/g, '');
    
    // אם זה מספר ישראלי עם קוד ארץ
    if (cleaned.startsWith('972')) {
      return `+${cleaned.substring(0, 3)}-${cleaned.substring(3, 5)}-${cleaned.substring(5, 8)}-${cleaned.substring(8)}`;
    }
    
    // אם זה מספר ישראלי רגיל
    if (cleaned.startsWith('05') || cleaned.startsWith('02') || cleaned.startsWith('03') || cleaned.startsWith('04') || cleaned.startsWith('08') || cleaned.startsWith('09')) {
      return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    }
    
    // במקרה כללי - החזר כמו שהוא
    return phone;
  },

  /**
   * בדיקת תקינות מספר טלפון
   */
  isValidPhoneNumber: (phone: string): boolean => {
    const cleaned = ContactHelpers.cleanPhoneNumber(phone);
    
    // לפחות 9 ספרות
    if (cleaned.length < 9) {
      return false;
    }
    
    // לא יותר מ-15 ספרות (סטנדרט בינלאומי)
    if (cleaned.length > 15) {
      return false;
    }
    
    return true;
  },

  /**
   * בדיקת תקינות כתובת אימייל
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * פורמט מספר לוואטסאפ (עם קוד ארץ)
   */
  formatForWhatsApp: (phone: string): string => {
    const cleaned = ContactHelpers.cleanPhoneNumber(phone);
    
    // אם מתחיל ב-0, הסר והוסף 972
    if (cleaned.startsWith('0')) {
      return '972' + cleaned.substring(1);
    }
    
    // אם לא מתחיל ב-972, הוסף
    if (!cleaned.startsWith('972')) {
      return '972' + cleaned;
    }
    
    return cleaned;
  }
};