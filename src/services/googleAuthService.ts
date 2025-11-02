import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@southdevs/capacitor-google-auth';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  imageUrl: string;
  accessToken: string;
}

export class GoogleAuthService {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (Capacitor.isNativePlatform()) {
        // 在原生平台上初始化
        const clientId = '960272040462-l9ok0pdikok8c4fied49j6kbee4ruurg.apps.googleusercontent.com';
        console.log('GoogleAuthService: Initializing with clientId:', clientId);
        
        await GoogleAuth.initialize({
          clientId: clientId,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
      }
      this.initialized = true;
      console.log('Google Auth initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
      throw error;
    }
  }

  static async signIn(): Promise<GoogleUser | null> {
    try {
      console.log('GoogleAuthService: Starting sign in process');
      await this.initialize();

      if (Capacitor.isNativePlatform()) {
        console.log('GoogleAuthService: Using native platform sign in');
        
        // 原生平台使用 Capacitor Google Auth
        const result = await GoogleAuth.signIn();
        console.log('GoogleAuthService: Raw result from GoogleAuth.signIn:', result);
        
        if (!result) {
          console.log('GoogleAuthService: No result returned from GoogleAuth.signIn');
          return null;
        }

        const user = {
          id: result.id || '',
          email: result.email || '',
          name: result.name || '',
          imageUrl: result.imageUrl || '',
          accessToken: result.authentication?.accessToken || '',
        };

        console.log('GoogleAuthService: Processed user data:', {
          id: user.id,
          email: user.email,
          name: user.name,
          hasAccessToken: !!user.accessToken
        });

        return user;
      } else {
        // Web 平台回退到原有的 Google OAuth
        console.log('Web platform detected, falling back to @react-oauth/google');
        return null; // 讓原有的 Web 登入處理
      }
    } catch (error) {
      console.error('GoogleAuthService: Sign in failed with error:', error);
      
      // 詳細的錯誤日誌
      if (error && typeof error === 'object') {
        const err = error as any;
        console.error('GoogleAuthService: Error details:', {
          message: err.message,
          code: err.code,
          type: typeof error,
          stack: err.stack
        });
      }
      
      // 如果是用戶取消，不顯示錯誤
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage.includes('cancelled') || errorMessage.includes('canceled')) {
          console.log('GoogleAuthService: User cancelled sign in');
          return null;
        }
      }
      
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await GoogleAuth.signOut();
      }
      console.log('Google sign out successful');
    } catch (error) {
      console.error('Google sign out failed:', error);
      throw error;
    }
  }

  static async refresh(): Promise<GoogleUser | null> {
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await GoogleAuth.refresh();
        
        return {
          id: result.id,
          email: result.email,
          name: result.name,
          imageUrl: result.imageUrl || '',
          accessToken: result.authentication?.accessToken || '',
        };
      }
      return null;
    } catch (error) {
      console.error('Google token refresh failed:', error);
      return null;
    }
  }

  static isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }
}