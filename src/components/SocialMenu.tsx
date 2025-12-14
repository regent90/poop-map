import React, { useState, useRef, useEffect } from 'react';
import { TranslationStrings } from '../types';

interface SocialMenuProps {
  onOpenLeaderboard?: () => void;
  onOpenAchievements?: () => void;
  onOpenFeed?: () => void;
  onOpenChallenges?: () => void;
  onOpenNotifications?: () => void;
  unreadNotifications?: number;
  translations: TranslationStrings;
}

export const SocialMenu: React.FC<SocialMenuProps> = ({
  onOpenLeaderboard,
  onOpenAchievements,
  onOpenFeed,
  onOpenChallenges,
  onOpenNotifications,
  unreadNotifications = 0,
  translations,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉菜單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: '/images/icon/icon_leaderboard.png',
      label: translations.leaderboard,
      action: onOpenLeaderboard,
      description: translations.viewPoopRanking
    },
    {
      icon: '/images/icon/icon_achievements.png',
      label: translations.achievements,
      action: onOpenAchievements,
      description: translations.myAchievementProgress
    },
    {
      icon: '/images/icon/icon_feed.png',
      label: translations.feed,
      action: onOpenFeed,
      description: translations.friendActivity
    },
    {
      icon: '/images/icon/icon_challenges.png',
      label: translations.challenges,
      action: onOpenChallenges,
      description: translations.participateInChallenges
    },
    {
      icon: '/images/icon/icon_notifications.png',
      label: translations.notifications,
      action: onOpenNotifications,
      description: translations.messageNotifications,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* 主按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
        aria-label={translations.socialFeatures}
      >
        <img src="/images/icon/icon_social.png" className="w-8 h-8 object-contain" alt="Social" />
        {unreadNotifications > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadNotifications > 9 ? '9+' : unreadNotifications}
          </span>
        )}
      </button>

      {/* 下拉菜單 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">{translations.socialFeatures}</h3>
              <p className="text-xs text-gray-500">{translations.selectFeature}</p>
            </div>

            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => item.action && handleMenuItemClick(item.action)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center"
                disabled={!item.action}
              >
                <img src={item.icon} className="w-8 h-8 mr-3 object-contain" alt={item.label} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* 底部提示 */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              💡 {translations.recordPoopToUnlock}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};