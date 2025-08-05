// import { Capacitor } from '@capacitor/core';

export const isNativePlatform = (): boolean => {
  return typeof window !== 'undefined' && window.Capacitor?.isNativePlatform() || false;
};

export const getPlatform = (): string => {
  return window.Capacitor?.getPlatform() || 'web';
};

export const isReady = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
      // על פלטפורמה נטיבית, המתן שהכל יהיה מוכן
      document.addEventListener('deviceready', () => resolve(true));
      // fallback אם deviceready לא מופעל
      setTimeout(() => resolve(true), 1000);
    } else {
      // בדפדפן, מוכן מיד
      resolve(true);
    }
  });
};