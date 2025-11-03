import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';

export class CapacitorService {
  static isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  static getPlatform(): string {
    return Capacitor.getPlatform();
  }

  // 地理位置服務
  static async getCurrentPosition(): Promise<{ lat: number; lng: number } | null> {
    try {
      if (!this.isNative()) {
        // Web 環境使用瀏覽器 API
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            (error) => {
              console.error('Geolocation error:', error);
              reject(error);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
          );
        });
      }

      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      return {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  // 相機服務
  static async takePicture(): Promise<string | null> {
    try {
      if (!this.isNative()) {
        // Web 環境的處理
        console.log('Camera not available in web environment');
        return null;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      return image.dataUrl || null;
    } catch (error) {
      console.error('Error taking picture:', error);
      return null;
    }
  }

  // 分享服務
  static async shareContent(title: string, text: string, url?: string): Promise<void> {
    try {
      if (!this.isNative()) {
        // Web 環境使用 Web Share API
        if (navigator.share) {
          await navigator.share({ title, text, url });
        } else {
          // 回退到複製到剪貼板
          await navigator.clipboard.writeText(`${title}\n${text}${url ? '\n' + url : ''}`);
          console.log('Content copied to clipboard');
        }
        return;
      }

      await Share.share({
        title,
        text,
        url,
        dialogTitle: '分享便便地圖'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }

  // 觸覺反饋
  static async hapticFeedback(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    try {
      if (!this.isNative()) return;

      const impactStyle = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy
      }[style];

      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.error('Error with haptic feedback:', error);
    }
  }

  // 狀態欄控制
  static async setStatusBarStyle(dark: boolean = false): Promise<void> {
    try {
      if (!this.isNative()) return;

      await StatusBar.setStyle({
        style: dark ? Style.Dark : Style.Light
      });

      // 設置狀態欄背景色
      await StatusBar.setBackgroundColor({
        color: '#10B981'
      });

      // 確保狀態欄不覆蓋內容
      await StatusBar.setOverlaysWebView({
        overlay: false
      });
    } catch (error) {
      console.error('Error setting status bar style:', error);
    }
  }

  // 鍵盤控制
  static async hideKeyboard(): Promise<void> {
    try {
      if (!this.isNative()) return;
      await Keyboard.hide();
    } catch (error) {
      console.error('Error hiding keyboard:', error);
    }
  }

  // 啟動畫面控制
  static async hideSplashScreen(): Promise<void> {
    try {
      if (!this.isNative()) return;
      await SplashScreen.hide();
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  }

  // 初始化應用
  static async initializeApp(): Promise<void> {
    try {
      if (!this.isNative()) return;

      // 設置狀態欄樣式和背景
      await this.setStatusBarStyle(false);

      // 隱藏啟動畫面
      setTimeout(async () => {
        await this.hideSplashScreen();
      }, 2000);

      console.log('Capacitor app initialized successfully');
    } catch (error) {
      console.error('Error initializing Capacitor app:', error);
    }
  }
}