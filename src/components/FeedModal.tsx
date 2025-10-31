import React, { useState, useEffect } from 'react';
import { FeedActivity, UserProfile } from '../types';

interface FeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  friends: any[];
}

export const FeedModal: React.FC<FeedModalProps> = ({
  isOpen,
  onClose,
  user,
  friends,
}) => {
  const [activities, setActivities] = useState<FeedActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'friends' | 'me'>('all');

  // 生成模擬動態數據
  const generateMockActivities = (): FeedActivity[] => {
    const allUsers = [
      { email: user?.email || '', name: user?.name || 'You', picture: user?.picture },
      ...friends.map(f => ({ email: f.email, name: f.name, picture: f.picture }))
    ];

    const activityTypes = [
      'poop_recorded',
      'achievement_unlocked',
      'friend_added',
      'attack_sent',
    ];

    const locations = [
      '台北車站', '西門町', '信義區', '士林夜市', '淡水老街',
      '中正紀念堂', '101大樓', '貓空纜車', '陽明山', '北投溫泉'
    ];

    const achievements = [
      { id: 'first_poop', name: '初次體驗', icon: '🚽' },
      { id: 'poop_10', name: '便便新手', icon: '💩' },
      { id: 'perfect_rating', name: '完美體驗', icon: '⭐' },
      { id: 'first_friend', name: '社交新手', icon: '👥' },
    ];

    return Array.from({ length: 20 }, (_, i) => {
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const timestamp = Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000); // 過去7天

      let data: any = {};
      
      switch (activityType) {
        case 'poop_recorded':
          data = {
            location: locations[Math.floor(Math.random() * locations.length)],
            rating: Math.floor(Math.random() * 5) + 1,
          };
          break;
        case 'achievement_unlocked':
          const achievement = achievements[Math.floor(Math.random() * achievements.length)];
          data = {
            achievementId: achievement.id,
            achievementName: achievement.name,
            achievementIcon: achievement.icon,
          };
          break;
        case 'friend_added':
          const friendUser = allUsers.filter(u => u.email !== randomUser.email)[0];
          data = {
            friendEmail: friendUser?.email,
            friendName: friendUser?.name,
          };
          break;
        case 'attack_sent':
          const targetUser = allUsers.filter(u => u.email !== randomUser.email)[0];
          data = {
            targetEmail: targetUser?.email,
            targetName: targetUser?.name,
            itemName: ['便便炸彈', '黃金便便', '彩虹便便'][Math.floor(Math.random() * 3)],
          };
          break;
      }

      return {
        id: `activity_${i}`,
        userId: randomUser.email,
        userEmail: randomUser.email,
        userName: randomUser.name,
        userPicture: randomUser.picture,
        type: activityType as any,
        timestamp,
        data,
        privacy: 'friends' as any,
      };
    }).sort((a, b) => b.timestamp - a.timestamp);
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setTimeout(() => {
        setActivities(generateMockActivities());
        setLoading(false);
      }, 500);
    }
  }, [isOpen, friends]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'poop_recorded': return '💩';
      case 'achievement_unlocked': return '🏅';
      case 'friend_added': return '👥';
      case 'attack_sent': return '💥';
      default: return '📝';
    }
  };

  const getActivityText = (activity: FeedActivity) => {
    switch (activity.type) {
      case 'poop_recorded':
        return (
          <span>
            在 <strong>{activity.data.location}</strong> 記錄了一次便便
            {activity.data.rating && (
              <span className="ml-1">
                {'⭐'.repeat(activity.data.rating)}
              </span>
            )}
          </span>
        );
      case 'achievement_unlocked':
        return (
          <span>
            解鎖了成就 <strong>{activity.data.achievementIcon} {activity.data.achievementName}</strong>
          </span>
        );
      case 'friend_added':
        return (
          <span>
            與 <strong>{activity.data.friendName}</strong> 成為了朋友
          </span>
        );
      case 'attack_sent':
        return (
          <span>
            向 <strong>{activity.data.targetName}</strong> 丟了 <strong>{activity.data.itemName}</strong>
          </span>
        );
      default:
        return '進行了一個神秘活動';
    }
  };

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

  const filteredActivities = activities.filter(activity => {
    switch (filter) {
      case 'friends':
        return activity.userEmail !== user?.email;
      case 'me':
        return activity.userEmail === user?.email;
      default:
        return true;
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📰 動態牆
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 篩選器 */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          {(['all', 'friends', 'me'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {filterType === 'all' ? '全部' : 
               filterType === 'friends' ? '朋友' : '我的'}
            </button>
          ))}
        </div>

        {/* 動態列表 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin text-4xl mb-4">📰</div>
            <p className="text-gray-500">載入動態中...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500">還沒有動態</p>
            <p className="text-sm text-gray-400">
              {filter === 'friends' ? '朋友們還沒有活動' : 
               filter === 'me' ? '你還沒有活動記錄' : '開始記錄便便來創建動態吧！'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className={`p-4 rounded-lg border ${
                  activity.userEmail === user?.email
                    ? 'border-purple-200 bg-purple-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start">
                  {/* 用戶頭像 */}
                  <img
                    src={activity.userPicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.userName)}&background=random&color=fff`}
                    alt={activity.userName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  
                  <div className="flex-1">
                    {/* 活動內容 */}
                    <div className="flex items-center mb-1">
                      <span className="text-2xl mr-2">{getActivityIcon(activity.type)}</span>
                      <div>
                        <span className="font-semibold text-gray-800">
                          {activity.userName}
                          {activity.userEmail === user?.email && (
                            <span className="ml-1 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                              你
                            </span>
                          )}
                        </span>
                        <div className="text-sm text-gray-600">
                          {getActivityText(activity)}
                        </div>
                      </div>
                    </div>
                    
                    {/* 時間戳 */}
                    <div className="text-xs text-gray-400 mt-2">
                      {getTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 底部提示 */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 text-center">
            💡 記錄便便、解鎖成就、攻擊朋友都會出現在動態牆上！
          </p>
        </div>
      </div>
    </div>
  );
};