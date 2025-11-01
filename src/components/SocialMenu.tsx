import React, { useState, useRef, useEffect } from 'react';

interface SocialMenuProps {
  onOpenLeaderboard?: () => void;
  onOpenAchievements?: () => void;
  onOpenFeed?: () => void;
  onOpenChallenges?: () => void;
  onOpenNotifications?: () => void;
  unreadNotifications?: number;
}

export const SocialMenu: React.FC<SocialMenuProps> = ({
  onOpenLeaderboard,
  onOpenAchievements,
  onOpenFeed,
  onOpenChallenges,
  onOpenNotifications,
  unreadNotifications = 0,
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
      icon: '🏆',
      label: '排行榜',
      action: onOpenLeaderboard,
      description: '查看便便排名'
    },
    {
      icon: '🏅',
      label: '成就系統',
      action: onOpenAchievements,
      description: '我的成就進度'
    },
    {
      icon: '📰',
      label: '動態牆',
      action: onOpenFeed,
      description: '朋友動態'
    },
    {
      icon: '🎯',
      label: '挑戰',
      action: onOpenChallenges,
      description: '參與挑戰'
    },
    {
      icon: '🔔',
      label: '通知',
      action: onOpenNotifications,
      description: '消息通知',
      badge: unreadNotifications > 0 ? unreadNotifications : undefined
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* 主按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
        aria-label="社交功能"
      >
        <span className="text-2xl">🎮</span>
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
              <h3 className="text-sm font-semibold text-gray-800">社交功能</h3>
              <p className="text-xs text-gray-500">選擇要使用的功能</p>
            </div>
            
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => item.action && handleMenuItemClick(item.action)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center"
                disabled={!item.action}
              >
                <span className="text-2xl mr-3">{item.icon}</span>
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
              💡 記錄便便來解鎖更多功能
            </p>
          </div>
        </div>
      )}
    </div>
  );
};