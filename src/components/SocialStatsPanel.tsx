import React, { useState, useEffect } from 'react';
import { UserProfile, Friend, UserStats } from '../types';

interface SocialStatsPanelProps {
  user: UserProfile | null;
  friends: Friend[];
  poops: any[];
  userInventory: any;
}

export const SocialStatsPanel: React.FC<SocialStatsPanelProps> = ({
  user,
  friends,
  poops,
  userInventory,
}) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('week');

  // 計算用戶統計數據
  const calculateStats = (): UserStats => {
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);

    const userPoops = poops.filter(p => p.userId === user?.email);
    
    const getFilteredPoops = () => {
      switch (selectedPeriod) {
        case 'today':
          return userPoops.filter(p => p.timestamp >= today.getTime());
        case 'week':
          return userPoops.filter(p => p.timestamp >= weekAgo);
        case 'month':
          return userPoops.filter(p => p.timestamp >= monthAgo);
        default:
          return userPoops;
      }
    };

    const filteredPoops = getFilteredPoops();
    const totalRating = filteredPoops.reduce((sum, p) => sum + (p.rating || 0), 0);
    const averageRating = filteredPoops.length > 0 ? totalRating / filteredPoops.length : 0;

    // 計算連續天數
    const consecutiveDays = calculateConsecutiveDays(userPoops);

    return {
      userId: user?.email || '',
      totalPoops: userPoops.length,
      weeklyPoops: userPoops.filter(p => p.timestamp >= weekAgo).length,
      monthlyPoops: userPoops.filter(p => p.timestamp >= monthAgo).length,
      averageRating: Math.round(averageRating * 10) / 10,
      bestRating: Math.max(...userPoops.map(p => p.rating || 0), 0),
      totalFriends: friends.length,
      consecutiveDays,
      totalAttacksSent: 0, // 將從資料庫獲取
      totalAttacksReceived: 0, // 將從資料庫獲取
      achievementsUnlocked: 0, // 將從資料庫獲取
      totalPoints: (userPoops.length * 10) + (friends.length * 50) + (userInventory?.items?.length || 0) * 25,
      lastUpdated: now,
    };
  };

  const calculateConsecutiveDays = (poops: any[]): number => {
    if (poops.length === 0) return 0;

    const sortedPoops = poops.sort((a, b) => b.timestamp - a.timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let consecutiveDays = 0;
    let currentDate = new Date(today);

    for (let i = 0; i < 30; i++) { // 檢查最近30天
      const dayStart = currentDate.getTime();
      const dayEnd = dayStart + (24 * 60 * 60 * 1000);
      
      const hasPoopThisDay = sortedPoops.some(p => 
        p.timestamp >= dayStart && p.timestamp < dayEnd
      );

      if (hasPoopThisDay) {
        consecutiveDays++;
      } else if (consecutiveDays > 0) {
        break; // 連續記錄中斷
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return consecutiveDays;
  };

  useEffect(() => {
    if (user) {
      setStats(calculateStats());
    }
  }, [user, friends, poops, userInventory, selectedPeriod]);

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'today': return '今天';
      case 'week': return '本週';
      case 'month': return '本月';
      case 'all': return '總計';
      default: return period;
    }
  };

  const getStreakColor = (days: number) => {
    if (days >= 7) return 'text-green-600 bg-green-50';
    if (days >= 3) return 'text-yellow-600 bg-yellow-50';
    if (days >= 1) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStreakIcon = (days: number) => {
    if (days >= 7) return '🔥';
    if (days >= 3) return '⚡';
    if (days >= 1) return '💪';
    return '😴';
  };

  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">📊 我的統計</h2>
        
        {/* 時間段選擇 */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['today', 'week', 'month', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {getPeriodLabel(period)}
            </button>
          ))}
        </div>
      </div>

      {/* 主要統計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {selectedPeriod === 'today' ? stats.totalPoops : 
             selectedPeriod === 'week' ? stats.weeklyPoops :
             selectedPeriod === 'month' ? stats.monthlyPoops : stats.totalPoops}
          </div>
          <div className="text-xs text-purple-600">便便記錄</div>
        </div>

        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="text-xs text-yellow-600">平均評分</div>
        </div>

        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalFriends}</div>
          <div className="text-xs text-blue-600">好友數量</div>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.totalPoints}</div>
          <div className="text-xs text-green-600">總積分</div>
        </div>
      </div>

      {/* 連續記錄 */}
      <div className={`p-4 rounded-lg mb-4 ${getStreakColor(stats.consecutiveDays)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{getStreakIcon(stats.consecutiveDays)}</span>
            <div>
              <div className="font-bold">連續記錄</div>
              <div className="text-sm opacity-75">
                {stats.consecutiveDays === 0 ? '今天還沒記錄' : 
                 stats.consecutiveDays === 1 ? '今天已記錄' :
                 `連續 ${stats.consecutiveDays} 天`}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.consecutiveDays}</div>
            <div className="text-xs">天</div>
          </div>
        </div>
      </div>

      {/* 詳細統計 */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">最高評分:</span>
            <span className="font-medium">
              {stats.bestRating > 0 ? `${stats.bestRating} ⭐` : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">攻擊發送:</span>
            <span className="font-medium">{stats.totalAttacksSent} 次</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">攻擊接收:</span>
            <span className="font-medium">{stats.totalAttacksReceived} 次</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">成就解鎖:</span>
            <span className="font-medium">{stats.achievementsUnlocked} 個</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">道具數量:</span>
            <span className="font-medium">{userInventory?.items?.length || 0} 個</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">本週排名:</span>
            <span className="font-medium text-purple-600">#3</span>
          </div>
        </div>
      </div>

      {/* 進度提示 */}
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
        <div className="text-sm">
          <div className="font-medium text-gray-800 mb-1">💡 今日目標</div>
          <div className="text-gray-600">
            {stats.consecutiveDays === 0 ? 
              '記錄今天的第一次便便來開始連續記錄！' :
              `保持連續記錄，目標是 ${stats.consecutiveDays + 1} 天！`
            }
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="mt-4 flex gap-2">
        <button className="flex-1 py-2 px-3 bg-purple-100 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors">
          📊 詳細報告
        </button>
        <button className="flex-1 py-2 px-3 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
          📤 分享成就
        </button>
      </div>
    </div>
  );
};