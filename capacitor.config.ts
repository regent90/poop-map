import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.regent.poopmap',
  appName: '便便地圖',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#10B981',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true,
    },
    Geolocation: {
      permissions: ['location']
    },
    Camera: {
      permissions: ['camera', 'photos']
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '960272040462-l9ok0pdikok8c4fied49j6kbee4ruurg.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    }
  }
};

export default config;
