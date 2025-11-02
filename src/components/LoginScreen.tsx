import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { PoopIcon } from './icons';
import { TranslationStrings } from '../types';
import { GoogleAuthService, GoogleUser } from '../services/googleAuthService';
import { Capacitor } from '@capacitor/core';

interface LoginScreenProps {
  onLoginSuccess: (tokenResponse: any) => void;
  translations: TranslationStrings;
}

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
      <path fill="#FF3D00" d="M6.306 14.691c-1.246 2.459-2.025 5.234-2.025 8.309c0 3.075.779 5.85 2.025 8.309l-5.657 5.657C.659 33.375 0 28.84 0 24c0-4.84.659-9.375 1.764-13.657l5.542 4.348z"></path>
      <path fill="#4CAF50" d="M24 48c5.166 0 9.86-1.977 13.409-5.192l-5.657-5.657C30.015 38.54 27.235 40 24 40c-5.223 0-9.655-3.343-11.303-7.918l-5.542 4.348C9.537 42.625 16.22 48 24 48z"></path>
      <path fill="#1976D2" d="M43.611 20.083L43.593 20H24v8h11.303c-.792 2.447-2.296 4.49-4.303 5.918l5.657 5.657C42.215 35.84 44 30.22 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);


export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, translations }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Web 平台的 Google 登入
  const webLogin = useGoogleLogin({
    onSuccess: onLoginSuccess,
    onError: (error) => {
      console.log('Web Login Failed:', error);
      setError('登入失敗，請重試');
    }
  });

  // 統一的登入處理函數
  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (Capacitor.isNativePlatform()) {
        // 原生平台使用 Capacitor Google Auth
        console.log('Using native Google Auth');
        console.log('Platform:', Capacitor.getPlatform());
        
        const user = await GoogleAuthService.signIn();
        console.log('Google Auth result:', user);
        
        if (user) {
          // 轉換為與 Web 版本兼容的格式
          const tokenResponse = {
            access_token: user.accessToken,
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'profile email',
          };
          
          console.log('Login successful, calling onLoginSuccess');
          // 同時傳遞用戶信息
          onLoginSuccess({ ...tokenResponse, user });
        } else {
          console.log('User cancelled login or no user returned');
          setError('登入已取消');
        }
      } else {
        // Web 平台使用原有的 Google OAuth
        console.log('Using web Google Auth');
        webLogin();
      }
    } catch (error) {
      console.error('Login error details:', error);
      
      // 更詳細的錯誤處理
      let errorMessage = '登入失敗';
      
      if (error && typeof error === 'object') {
        const err = error as any;
        if (err.message) {
          if (err.message.includes('cancelled') || err.message.includes('canceled')) {
            errorMessage = '登入已取消';
          } else if (err.message.includes('network') || err.message.includes('Network')) {
            errorMessage = '網路連接錯誤，請檢查網路設定';
          } else if (err.message.includes('invalid_client')) {
            errorMessage = 'Google 配置錯誤，請聯繫開發者';
          } else if (err.message.includes('unauthorized_client')) {
            errorMessage = 'Google 應用未授權，請聯繫開發者';
          } else {
            errorMessage = `登入失敗: ${err.message}`;
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-2xl max-w-sm w-full">
        <PoopIcon className="h-24 w-24 mx-auto text-amber-800" />
        <h1 className="text-4xl font-bold text-amber-900 mt-4">{translations.poopMap}</h1>
        <p className="text-gray-600 mt-2 mb-8">
            {translations.welcome}! {translations.loginWithGoogle} to start.
        </p>
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="flex items-center justify-center w-full px-4 py-3 font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 mr-2 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          ) : (
            <GoogleIcon />
          )}
          {isLoading ? '登入中...' : translations.loginWithGoogle}
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          {Capacitor.isNativePlatform() ? '原生應用模式' : 'Web 應用模式'}
        </div>
      </div>
    </div>
  );
};