import React, { useState } from 'react';
import { UserProfile, TranslationStrings } from '../types';

interface UserSwitcherProps {
  currentUser: UserProfile | null;
  onSwitchUser: (user: UserProfile) => void;
  translations: TranslationStrings;
}

const demoUsers: UserProfile[] = [
  {
    name: 'Alice Chen',
    email: 'alice@poopmap.demo',
    picture: 'https://ui-avatars.com/api/?name=Alice+Chen&background=ff6b6b&color=fff'
  },
  {
    name: 'Bob Wang',
    email: 'bob@poopmap.demo',
    picture: 'https://ui-avatars.com/api/?name=Bob+Wang&background=4ecdc4&color=fff'
  },
  {
    name: 'Carol Liu',
    email: 'carol@poopmap.demo',
    picture: 'https://ui-avatars.com/api/?name=Carol+Liu&background=45b7d1&color=fff'
  },
  {
    name: 'David Zhang',
    email: 'david@poopmap.demo',
    picture: 'https://ui-avatars.com/api/?name=David+Zhang&background=f39c12&color=fff'
  },
  {
    name: 'Emma Wu',
    email: 'emma@poopmap.demo',
    picture: 'https://ui-avatars.com/api/?name=Emma+Wu&background=e74c3c&color=fff'
  }
];

export const UserSwitcher: React.FC<UserSwitcherProps> = ({
  currentUser,
  onSwitchUser,
  translations
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">
            🔄 {translations.language === 'zh-TW' ? '切換用戶' : 
                 translations.language === 'zh-CN' ? '切换用户' :
                 translations.language === 'ja' ? 'ユーザー切替' :
                 translations.language === 'ko' ? '사용자 전환' :
                 translations.language === 'es' ? 'Cambiar Usuario' :
                 translations.language === 'fr' ? 'Changer d\'Utilisateur' :
                 translations.language === 'de' ? 'Benutzer Wechseln' :
                 'Switch User'}
          </span>
          <span className="text-xs text-gray-500">
            ({currentUser?.name || 'None'})
          </span>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs text-gray-500 px-2 py-1 border-b border-gray-100 mb-2">
                {translations.language === 'zh-TW' ? '示範用戶 (測試用)' : 
                 translations.language === 'zh-CN' ? '演示用户 (测试用)' :
                 translations.language === 'ja' ? 'デモユーザー (テスト用)' :
                 translations.language === 'ko' ? '데모 사용자 (테스트용)' :
                 translations.language === 'es' ? 'Usuarios Demo (Prueba)' :
                 translations.language === 'fr' ? 'Utilisateurs Démo (Test)' :
                 translations.language === 'de' ? 'Demo-Benutzer (Test)' :
                 'Demo Users (Testing)'}
              </div>
              
              {demoUsers.map((user) => (
                <button
                  key={user.email}
                  onClick={() => {
                    onSwitchUser(user);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                    currentUser?.email === user.email ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                  {currentUser?.email === user.email && (
                    <span className="text-blue-600 text-xs">✓</span>
                  )}
                </button>
              ))}
              
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={() => {
                    // Switch to real Google login
                    window.location.reload();
                  }}
                  className="w-full p-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  🔐 {translations.language === 'zh-TW' ? '使用 Google 登入' : 
                       translations.language === 'zh-CN' ? '使用 Google 登录' :
                       translations.language === 'ja' ? 'Googleでログイン' :
                       translations.language === 'ko' ? 'Google로 로그인' :
                       translations.language === 'es' ? 'Iniciar con Google' :
                       translations.language === 'fr' ? 'Connexion Google' :
                       translations.language === 'de' ? 'Google Anmeldung' :
                       'Use Google Login'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};