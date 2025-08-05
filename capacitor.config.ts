import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pilot.sync.nexus',
  appName: 'Pilot Sync Nexus',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorFilesystem: {
      androidScheme: 'https'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    }
  },
  ios: {
    scheme: 'Pilot Sync Nexus',
    contentInset: 'automatic'
  }
};

export default config;