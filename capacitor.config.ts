import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mrmshor.projectmanager.pro',
  appName: 'מערכת ניהול פרויקטים Pro',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    Filesystem: {
      iosDatabaseLocation: 'Library/NoCloud'
    }
  },
  ios: {
    scheme: 'ProjectManagerPro',
    path: 'ios',
    buildOptions: {
      developmentTeam: '',
      packageType: 'app-store'
    }
  }
};

export default config;