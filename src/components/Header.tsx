
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Language, TranslationStrings, Poop } from '../types';
import { LanguageSwitcher } from './LanguageSwitcher';
import { PoopIcon } from './icons';
import { SocialMenu } from './SocialMenu';
import { DisplayNameEditor } from './DisplayNameEditor';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface HeaderProps {
  user: UserProfile;
  onLogout: () => void;
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  translations: TranslationStrings;
  poops: Poop[]; // User's own poops only
  onViewPoopDetails?: (poop: Poop, poopNumber: number) => void;
  onOpenFriends?: () => void;
  friendsCount?: number;

  onOpenInventory?: () => void;
  inventoryItemCount?: number;
  onOpenLeaderboard?: () => void;
  onOpenAchievements?: () => void;
  onOpenFeed?: () => void;
  onOpenChallenges?: () => void;
  onOpenNotifications?: () => void;
  unreadNotifications?: number;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, currentLang, onLangChange, translations, poops, onViewPoopDetails, onOpenFriends, friendsCount = 0, onOpenInventory, inventoryItemCount = 0, onOpenLeaderboard, onOpenAchievements, onOpenFeed, onOpenChallenges, onOpenNotifications, unreadNotifications = 0 }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDisplayNameEditor, setShowDisplayNameEditor] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 獲取用戶顯示名稱
  const userDisplayName = useQuery(api.users.getUserDisplayName, 
    user?.email ? { email: user.email } : "skip"
  );
  const canChangeDisplayName = useQuery(api.users.canChangeDisplayName, 
    user?.email ? { email: user.email } : "skip"
  );

  // Statistics functions - only count user's own poops
  const userPoops = poops.filter(poop => poop.userId === user.email);
  
  const getTodayCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return userPoops.filter(poop => new Date(poop.timestamp) >= today).length;
  };

  const getWeekCount = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return userPoops.filter(poop => new Date(poop.timestamp) >= weekAgo).length;
  };

  const getLast7DaysData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const count = userPoops.filter(poop => {
        const poopDate = new Date(poop.timestamp);
        return poopDate >= date && poopDate < nextDay;
      }).length;
      
      data.push(count);
    }
    return data;
  };

  const getWeeklyAverage = () => {
    const weekData = getLast7DaysData();
    const total = weekData.reduce((sum, count) => sum + count, 0);
    return total / 7;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&color=fff`;
  };

  return (
    <>
    <header className="absolute top-0 left-0 right-0 bg-gray-800 text-white shadow-md z-10">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <PoopIcon className="h-8 w-8 text-yellow-500" />
          <h1 className="text-xl font-bold">{translations.poopMap}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher currentLang={currentLang} onLangChange={onLangChange} translations={translations} />
          
          {/* Friends Button - 只在桌面版顯示 */}
          <button
            onClick={onOpenFriends}
            className="relative p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white hidden md:block"
            aria-label={translations.friends}
          >
            <span className="text-2xl">👥</span>
            {friendsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {friendsCount}
              </span>
            )}
          </button>

          {/* Inventory Button - 只在桌面版顯示 */}
          <button
            onClick={onOpenInventory}
            className="relative p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white hidden md:block"
            aria-label="便便道具庫存"
          >
            <span className="text-2xl">🎒</span>
            {inventoryItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {inventoryItemCount}
              </span>
            )}
          </button>

          {/* Social Menu - 整合所有社交功能 */}
          <SocialMenu
            onOpenLeaderboard={onOpenLeaderboard}
            onOpenAchievements={onOpenAchievements}
            onOpenFeed={onOpenFeed}
            onOpenChallenges={onOpenChallenges}
            onOpenNotifications={onOpenNotifications}
            unreadNotifications={unreadNotifications}
          />
          
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center space-x-2 focus:outline-none">
              <img 
                src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}`} 
                alt={user.name || 'User'} 
                className="h-8 w-8 rounded-full bg-gray-600"
                onError={handleImageError} 
              />
            </button>
            {menuOpen && (
              <div 
                className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 max-h-96 overflow-hidden"
              >
                <div className="py-1">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm text-gray-700">{translations.welcome},</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {userDisplayName || user.name || user.email}
                      </p>
                      <button
                        onClick={() => setShowDisplayNameEditor(true)}
                        className="ml-2 text-xs text-purple-600 hover:text-purple-800 flex items-center"
                        title={canChangeDisplayName ? "編輯顯示名稱" : "查看顯示名稱"}
                      >
                        {canChangeDisplayName ? '✏️' : '👁️'}
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{getTodayCount()}</div>
                        <div className="text-gray-500">{currentLang === 'zh-TW' ? '今天' : currentLang === 'zh-CN' ? '今天' : currentLang === 'ja' ? '今日' : currentLang === 'ko' ? '오늘' : currentLang === 'es' ? 'Hoy' : currentLang === 'fr' ? 'Aujourd\'hui' : currentLang === 'de' ? 'Heute' : 'Today'}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{getWeekCount()}</div>
                        <div className="text-gray-500">{currentLang === 'zh-TW' ? '本週' : currentLang === 'zh-CN' ? '本周' : currentLang === 'ja' ? '今週' : currentLang === 'ko' ? '이번 주' : currentLang === 'es' ? 'Semana' : currentLang === 'fr' ? 'Semaine' : currentLang === 'de' ? 'Woche' : 'Week'}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{userPoops.length}</div>
                        <div className="text-gray-500">{currentLang === 'zh-TW' ? '總計' : currentLang === 'zh-CN' ? '总计' : currentLang === 'ja' ? '合計' : currentLang === 'ko' ? '총계' : currentLang === 'es' ? 'Total' : currentLang === 'fr' ? 'Total' : currentLang === 'de' ? 'Gesamt' : 'Total'}</div>
                      </div>
                    </div>
                    
                    {/* Icon Legend */}
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-600 mb-2 font-medium">圖標說明</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-amber-400 rounded-full border border-amber-500 flex items-center justify-center">
                            <span className="text-xs">💩</span>
                          </div>
                          <span className="text-gray-600">我的便便</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-400 rounded-full border border-green-500 flex items-center justify-center">
                            <span className="text-xs">💩</span>
                          </div>
                          <span className="text-gray-600">好友的便便</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-purple-400 rounded-full border border-purple-500 flex items-center justify-center">
                            <span className="text-xs">💩</span>
                          </div>
                          <span className="text-gray-600">公開的便便</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Poop History */}
                  <div className="px-4 py-2 border-b">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">💩 {currentLang === 'zh-TW' ? '便便歷史' : currentLang === 'zh-CN' ? '便便历史' : currentLang === 'ja' ? 'うんち履歴' : currentLang === 'ko' ? '똥 기록' : currentLang === 'es' ? 'Historial de Caca' : currentLang === 'fr' ? 'Historique de Caca' : currentLang === 'de' ? 'Haufen-Verlauf' : 'Poop History'}</h3>
                    <div className="max-h-40 overflow-y-auto">
                      {userPoops.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">{translations.noDropsYet}</p>
                      ) : (
                        <div className="space-y-1">
                          {userPoops
                            .sort((a, b) => b.timestamp - a.timestamp)
                            .slice(0, 10)
                            .map((poop, index) => {
                              const date = new Date(poop.timestamp);
                              const isToday = date.toDateString() === new Date().toDateString();
                              const timeStr = date.toLocaleDateString(currentLang === 'zh-TW' ? 'zh-TW' : currentLang === 'zh-CN' ? 'zh-CN' : currentLang === 'ja' ? 'ja-JP' : currentLang === 'ko' ? 'ko-KR' : 'en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit'
                              });
                              
                              return (
                                <div 
                                  key={poop.id} 
                                  className="border-b border-gray-100 pb-2 mb-2 last:border-b-0 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                                  onClick={() => {
                                    if (onViewPoopDetails) {
                                      onViewPoopDetails(poop, userPoops.length - index);
                                      setMenuOpen(false);
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center">
                                      <span className="text-base mr-1">💩</span>
                                      <span className="text-gray-600">#{userPoops.length - index}</span>
                                      {poop.rating && (
                                        <span className="ml-2 text-yellow-500">
                                          {'⭐'.repeat(Math.floor(poop.rating))}
                                          {poop.rating % 1 !== 0 && '✨'}
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-gray-500">{timeStr}</span>
                                  </div>
                                  {(poop.placeName || poop.customLocation) && (
                                    <div className="text-xs text-gray-600 mt-1 ml-6">
                                      📍 {poop.customLocation || poop.placeName}
                                    </div>
                                  )}
                                  {poop.photo && (
                                    <div className="text-xs text-gray-500 mt-1 ml-6">
                                      📷 Photo attached
                                    </div>
                                  )}
                                  <div className="text-xs text-blue-600 mt-1 ml-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    👆 {currentLang === 'zh-TW' ? '點擊查看詳情' : 
                                        currentLang === 'zh-CN' ? '点击查看详情' :
                                        currentLang === 'ja' ? 'クリックして詳細を表示' :
                                        currentLang === 'ko' ? '클릭하여 세부 정보 보기' :
                                        currentLang === 'es' ? 'Haz clic para ver detalles' :
                                        currentLang === 'fr' ? 'Cliquez pour voir les détails' :
                                        currentLang === 'de' ? 'Klicken Sie für Details' :
                                        'Click to view details'}
                                  </div>
                                </div>
                              );
                            })}
                          {userPoops.length > 10 && (
                            <p className="text-xs text-gray-400 text-center mt-2">
                              {currentLang === 'zh-TW' ? `還有 ${userPoops.length - 10} 筆記錄...` : 
                               currentLang === 'zh-CN' ? `还有 ${userPoops.length - 10} 条记录...` :
                               currentLang === 'ja' ? `他に${userPoops.length - 10}件...` :
                               currentLang === 'ko' ? `${userPoops.length - 10}개 더...` :
                               currentLang === 'es' ? `${userPoops.length - 10} más...` :
                               currentLang === 'fr' ? `${userPoops.length - 10} de plus...` :
                               currentLang === 'de' ? `${userPoops.length - 10} weitere...` :
                               `${userPoops.length - 10} more...`}
                            </p>
                          )}
                          
                          {/* Weekly trend */}
                          {userPoops.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>{currentLang === 'zh-TW' ? '本週趨勢' : currentLang === 'zh-CN' ? '本周趋势' : currentLang === 'ja' ? '今週の傾向' : currentLang === 'ko' ? '이번 주 추세' : currentLang === 'es' ? 'Tendencia semanal' : currentLang === 'fr' ? 'Tendance hebdomadaire' : currentLang === 'de' ? 'Wochentrend' : 'Weekly trend'}</span>
                                <span>{getWeeklyAverage().toFixed(1)}/day</span>
                              </div>
                              <div className="flex space-x-1">
                                {getLast7DaysData().map((count, index) => (
                                  <div key={index} className="flex-1 bg-gray-100 rounded-sm overflow-hidden" style={{ height: '20px' }}>
                                    <div 
                                      className="bg-amber-400 transition-all duration-300" 
                                      style={{ 
                                        height: `${Math.max(10, (count / Math.max(...getLast7DaysData(), 1)) * 100)}%`,
                                        width: '100%'
                                      }}
                                      title={`${count} ${currentLang === 'zh-TW' ? '次' : currentLang === 'zh-CN' ? '次' : currentLang === 'ja' ? '回' : currentLang === 'ko' ? '번' : currentLang === 'es' ? 'veces' : currentLang === 'fr' ? 'fois' : currentLang === 'de' ? 'mal' : 'times'}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onLogout();
                      setMenuOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {translations.logout}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    
    {/* 顯示名稱編輯器 */}
    {showDisplayNameEditor && user?.email && (
      <DisplayNameEditor
        userEmail={user.email}
        currentDisplayName={userDisplayName || user.name || user.email}
        onClose={() => setShowDisplayNameEditor(false)}
        onSuccess={(newDisplayName) => {
          console.log(`✏️ Display name updated to: ${newDisplayName}`);
          // 這裡可以添加成功提示
        }}
      />
    )}
  </>
  );
};