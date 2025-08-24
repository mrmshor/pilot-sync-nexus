// Comprehensive input validation utilities for enhanced security

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const ISRAELI_PHONE_REGEX = /^(\+972|972|0)?([1-9]\d{8}|5[0-9]\d{7})$/;
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Email validation with comprehensive checks
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('כתובת מייל נדרשת');
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push('כתובת מייל לא תקינה');
  } else if (email.length > 254) {
    errors.push('כתובת מייל ארוכה מדי');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Password strength validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('סיסמה נדרשת');
    return { isValid: false, errors };
  }
  
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`הסיסמה חייבת להיות באורך של לפחות ${PASSWORD_REQUIREMENTS.minLength} תווים`);
  }
  
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('הסיסמה חייבת לכלול לפחות אות גדולה אחת באנגלית');
  }
  
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('הסיסמה חייבת לכלול לפחות אות קטנה אחת באנגלית');
  }
  
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('הסיסמה חייבת לכלול לפחות ספרה אחת');
  }
  
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('הסיסמה חייבת לכלול לפחות תו מיוחד אחד');
  }
  
  // Common password patterns to avoid
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'user'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('הסיסמה חלשה מדי - נא להימנע מסיסמאות נפוצות');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Israeli phone number validation
export const validateIsraeliPhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone) {
    return { isValid: true, errors }; // Phone is optional
  }
  
  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  if (!ISRAELI_PHONE_REGEX.test(cleanPhone)) {
    errors.push('מספר טלפון לא תקין (נדרש מספר ישראלי)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Project name validation
export const validateProjectName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name?.trim()) {
    errors.push('שם פרויקט נדרש');
  } else if (name.trim().length < 2) {
    errors.push('שם פרויקט חייב להיות באורך של לפחות 2 תווים');
  } else if (name.trim().length > 100) {
    errors.push('שם פרויקט ארוך מדי (מקסימום 100 תווים)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Client name validation
export const validateClientName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name?.trim()) {
    errors.push('שם לקוח נדרש');
  } else if (name.trim().length < 2) {
    errors.push('שם לקוח חייב להיות באורך של לפחות 2 תווים');
  } else if (name.trim().length > 100) {
    errors.push('שם לקוח ארוך מדי (מקסימום 100 תווים)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Text sanitization to prevent XSS
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// URL validation for iCloud links
export const validateUrl = (url: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!url) {
    return { isValid: true, errors }; // URL is optional
  }
  
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      errors.push('קישור חייב להתחיל ב-http או https');
    }
  } catch {
    errors.push('קישור לא תקין');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};