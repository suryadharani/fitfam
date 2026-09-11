import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitfam.app',
  appName: 'FitFam',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1002272415607-8v1u9fcne8halouc98q2sju33vr68mru.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
