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
        await GoogleAuth.initialize({
          clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
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
      await this.initialize();

      if (Capacitor.isNativePlatform()) {
        // 原生平台使用 Capacitor Google Auth
        const result = await GoogleAuth.signIn();
        
        return {
          id: result.id,
          email: result.email,
          name: result.name,
          imageUrl: result.imageUrl || '',
          accessToken: result.authentication?.accessToken || '',
        };
      } else {
        // Web 平台回退到原有的 Google OAuth
        console.log('Web platform detected, falling back to @react-oauth/google');
        return null; // 讓原有的 Web 登入處理
      }
    } catch (error) {
      console.error('Google sign in failed:', error);
      
      // 如果是用戶取消，不顯示錯誤
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage.includes('cancelled') || errorMessage.includes('canceled')) {
          console.log('User cancelled Google sign in');
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