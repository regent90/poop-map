import React, { useState, useEffect } from 'react';
import { Notification, UserProfile } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'social' | 'achievements'>('all');

  // 生成模擬通知數據
  const generateMockNotifications = (): Notification[] => {
    const notificationTypes = [
      {
        type: 'friend_request' as const,
        title: '新的好友請求',
        message: 'John Doe 想要成為你的朋友',
        icon: '👥',
        priority: 'medium' as const,
      },
      {
        type: 'attack_received' as const,
        title: '便便攻擊！',
        message: 'Alice 向你丟了一個便便炸彈！',
        icon: '💥',
        priority: 'high' as const,
      },
      {
        type: 'achievement_unlocked' as const,
        title: '成就解鎖！',
        message: '恭喜解鎖成就：便便新手',
        icon: '🏅',
        priority: 'medium' as const,
      },
      {
        type: 'challenge_invite' as const,
        title: '挑戰邀請',
        message: 'Bob 邀請你參加週末便便挑戰',
        icon: '🎯',
        priority: 'medium' as const,
      },
      {
        type: 'leaderboard_update' as const,
        title: '排行榜更新',
        message: '你在本週排行榜上升到第3名！',
        icon: '🏆',
        priority: 'low' as const,
      },
      {
        type: 'item_received' as const,
        title: '道具獲得',
        message: '你獲得了稀有道具：黃金便便',
        icon: '✨',
        priority: 'medium' as const,
      },
    ];

    return Array.from({ length: 15 }, (_, i) => {
      const template = notificationTypes[i % notificationTypes.length];
      const isRead = Math.random() > 0.4; // 60% 已讀
      
      return {
        id: `notification_${i}`,
        userId: user?.email || '',
        type: template.type,
        title: template.title,
        message: template.message,
        icon: template.icon,
        timestamp: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000), // 過去7天
        read: isRead,
        priority: template.priority,
        actionUrl: template.type === 'friend_request' ? '/friends' : undefined,
        data: {
          fromUserId: template.type.includes('friend') || template.type.includes('attack') ? 'user123' : undefined,
          achievementId: template.type === 'achievement_unlocked' ? 'poop_10' : undefined,
          challengeId: template.type === 'challenge_invite' ? 'challenge_123' : undefined,
        },
      };
    }).sort((a, b) => b.timestamp - a.timestamp);
  };

  useEffect(() => {
    if (isOpen) {
      setNotifications(generateMockNotifications());
    }
  }, [isOpen]);

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '剛剛';
    if (minutes < 60) return `${minutes} 分鐘前`;
    if (hours < 24) return `${hours} 小時前`;
    return `${days} 天前`;
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'social':
        return ['friend_request', 'attack_received', 'challenge_invite'].includes(notification.type);
      case 'achievements':
        return ['achievement_unlocked', 'item_received', 'leaderboard_update'].includes(notification.type);
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🔔 通知中心</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600">{unreadCount} 條未讀通知</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 篩選器和操作 */}
        <div className="mb-4">
          <div className="flex mb-3 bg-gray-100 rounded-lg p-1">
            {(['all', 'unread', 'social', 'achievements'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {filterType === 'all' ? '全部' : 
                 filterType === 'unread' ? '未讀' :
                 filterType === 'social' ? '社交' : '成就'}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              標記全部為已讀
            </button>
          )}
        </div>

        {/* 通知列表 */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500">沒有通知</p>
            <p className="text-sm text-gray-400">
              {filter === 'unread' ? '所有通知都已讀取' : '暫時沒有新通知'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-l-4 rounded-lg p-3 ${getPriorityColor(notification.priority)} ${
                  !notification.read ? 'shadow-md' : 'opacity-75'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <span className="text-2xl mr-3">{notification.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(notification.timestamp)}
                        </span>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-purple-600 hover:text-purple-800"
                            >
                              標記已讀
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            刪除
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 操作按鈕 */}
                {notification.type === 'friend_request' && (
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 py-2 px-3 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200">
                      接受
                    </button>
                    <button className="flex-1 py-2 px-3 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200">
                      拒絕
                    </button>
                  </div>
                )}

                {notification.type === 'challenge_invite' && (
                  <div className="mt-3">
                    <button className="w-full py-2 px-3 bg-purple-100 text-purple-700 rounded text-sm font-medium hover:bg-purple-200">
                      查看挑戰
                    </button>
                  </div>
                )}

                {notification.type === 'attack_received' && (
                  <div className="mt-3">
                    <button className="w-full py-2 px-3 bg-orange-100 text-orange-700 rounded text-sm font-medium hover:bg-orange-200">
                      反擊
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 設定按鈕 */}
        <div className="mt-6 pt-4 border-t">
          <button className="w-full py-2 px-3 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200">
            ⚙️ 通知設定
          </button>
        </div>
      </div>
    </div>
  );
};