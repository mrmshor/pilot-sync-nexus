import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pilot.sync.nexus',
  appName: 'Pilot Sync Nexus',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    // עבור live reload
    url: process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : undefined,
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#667eea',
      showSpinner: false
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#667eea'
    }
  },
  ios: {
    scheme: 'Pilot Sync Nexus',
    contentInset: 'automatic',
    allowsLinkPreview: false,
    handleApplicationNotifications: false
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;