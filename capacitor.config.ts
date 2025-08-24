import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c31801b6534f41cd9c671e50db5bd43a',
  appName: 'pilot-sync-nexus',
  webDir: 'dist',
  server: {
    url: 'https://c31801b6-534f-41cd-9c67-1e50db5bd43a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;