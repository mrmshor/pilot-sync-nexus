import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c31801b6534f41cd9c671e50db5bd43a',
  appName: 'מערכת ניהול פרויקטים Pro',
  webDir: 'dist',
  server: {
    url: 'https://c31801b6-534f-41cd-9c67-1e50db5bd43a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;