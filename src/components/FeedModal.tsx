import React, { useState, useEffect } from 'react';
import { FeedActivity, UserProfile } from '../types';

interface FeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  friends: any[];
  poops: any[];
}

export const FeedModal: React.FC<FeedModalProps> = ({
  isOpen,
  onClose,
  user,
  friends,
  poops,
}) => {
  const [activities, setActivities] = useState<FeedActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'friends' | 'me'>('all');

  // 生成真實動態數據
  const generateRealActivities = (): FeedActivity[] => {
    const activities: FeedActivity[] = [];
    
    if (!user || !poops) {
      console.log('No user or poops data available');
      return activities;
    }
    
    // 從便便記錄生成活動
    const allUsers = [user, ...friends].filter(Boolean);
    
    // 獲取所有相關的便便記錄（不在這裡過濾，讓 filteredActivities 處理）
    const relevantPoops = poops.filter(poop => 
      poop.userId === user?.email || friends.some(f => f.email === poop.userId)
    );

    console.log('Generating activities from poops:', relevantPoops.length);

    relevantPoops.forEach(poop => {
      const poopUser = allUsers.find(u => u?.email === poop.userId);
      if (poopUser) {
        activities.push({
          id: `poop_${poop.id}`,
          userId: poop.userId,
          userEmail: poop.userId,
          userName: poopUser.name || 'Unknown',
          userPicture: poopUser.picture,
          type: 'poop_recorded',
          timestamp: poop.timestamp,
          data: {
            location: poop.customLocation || poop.placeName || '未知地點',
            rating: poop.rating,
            poopId: poop.id,
          },
          privacy: poop.privacy,
        });
      }
    });

    // 從好友關係生成活動（只生成一次，不重複）
    if (activities.length === 0 || !activities.some(a => a.type === 'friend_added')) {
      friends.forEach(friend => {
        activities.push({
          id: `friend_${friend.email}`,
          userId: user?.email || '',
          userEmail: user?.email || '',
          userName: user?.name || 'You',
          userPicture: user?.picture,
          type: 'friend_added',
          timestamp: friend.addedAt || Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          data: {
            friendEmail: friend.email,
            friendName: friend.name,
          },
          privacy: 'friends',
        });
      });
    }

    console.log('Generated activities:', activities.length);
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
  };

  useEffect(() => {
    if (isOpen && !loading) {
      setLoading(true);
      setTimeout(() => {
        setActivities(generateRealActivities());
        setLoading(false);
      }, 100);
    }
  }, [isOpen]);

  // 當篩選器改變時，重新過濾活動而不是重新生成
  useEffect(() => {
    if (activities.length > 0) {
      // 篩選已有的活動，不重新生成
      const filtered = activities.filter(activity => {
        switch (filter) {
          case 'friends':
            return activity.userEmail !== user?.email;
          case 'me':
            return activity.userEmail === user?.email;
          default:
            return true;
        }
      });
      // 不需要重新設置 activities，直接在 render 中過濾
    }
  }, [filter]);

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

  // 使用 useMemo 來避免重複計算
  const filteredActivities = React.useMemo(() => {
    return activities.filter(activity => {
      switch (filter) {
        case 'friends':
          return activity.userEmail !== user?.email;
        case 'me':
          return activity.userEmail === user?.email;
        default:
          return true;
      }
    });
  }, [activities, filter, user?.email]);

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