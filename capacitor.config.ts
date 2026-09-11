import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitfam.app',
  appName: 'FitFam',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
