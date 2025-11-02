import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, Leaderboard, UserProfile, TranslationStrings } from '../types';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  friends: any[];
  poops: any[];
  translations: TranslationStrings;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  user,
  friends,
  poops,
  translations,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // 計算真實排行榜數據
  const calculateRealLeaderboard = (): LeaderboardEntry[] => {
    if (!user || !poops || !Array.isArray(poops)) {
      console.log('Missing data for leaderboard:', { user: !!user, poops: !!poops, isArray: Array.isArray(poops) });
      return [];
    }

    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);

    // 獲取所有用戶（當前用戶 + 朋友）
    const allUsers = [
      { email: user?.email || '', name: user?.name || 'You', picture: user?.picture },
      ...friends.map(f => ({ email: f.email, name: f.name, picture: f.picture }))
    ].filter(u => u.email); // 過濾掉沒有 email 的用戶

    console.log('All users for leaderboard:', allUsers.length);
    console.log('Total poops available:', poops.length);

    // 為每個用戶計算統計數據
    const leaderboardData = allUsers.map(u => {
      // 獲取該用戶的所有便便記錄
      const userPoops = poops.filter(p => p.userId === u.email);
      
      const weeklyPoops = userPoops.filter(p => p.timestamp >= weekAgo).length;
      const monthlyPoops = userPoops.filter(p => p.timestamp >= monthAgo).length;
      const totalPoops = userPoops.length;
      
      const totalRating = userPoops.reduce((sum, p) => sum + (p.rating || 0), 0);
      const averageRating = totalPoops > 0 ? totalRating / totalPoops : 0;
      
      const lastPoopTime = userPoops.length > 0 
        ? Math.max(...userPoops.map(p => p.timestamp))
        : 0;

      console.log(`User ${u.name}: ${totalPoops} total, ${weeklyPoops} weekly, ${monthlyPoops} monthly`);

      return {
        userId: u.email,
        userEmail: u.email,
        userName: u.name,
        userPicture: u.picture,
        totalPoops,
        weeklyPoops,
        monthlyPoops,
        averageRating: Math.round(averageRating * 10) / 10,
        lastPoopTime,
        rank: 0, // 將在排序後設置
      };
    });

    // 根據選擇的時間段排序
    const sortedData = leaderboardData.sort((a, b) => {
      switch (selectedPeriod) {
        case 'weekly':
          return b.weeklyPoops - a.weeklyPoops;
        case 'monthly':
          return b.monthlyPoops - a.monthlyPoops;
        case 'allTime':
          return b.totalPoops - a.totalPoops;
        default:
          return 0;
      }
    });

    // 設置排名，只顯示有數據的用戶
    const filteredData = sortedData.filter(entry => {
      switch (selectedPeriod) {
        case 'weekly':
          return entry.weeklyPoops > 0;
        case 'monthly':
          return entry.monthlyPoops > 0;
        case 'allTime':
          return entry.totalPoops > 0;
        default:
          return entry.totalPoops > 0;
      }
    });

    return filteredData.map((entry, index) => ({ ...entry, rank: index + 1 }));
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // 計算真實排行榜數據
      setTimeout(() => {
        const leaderboardData = calculateRealLeaderboard();
        console.log('Leaderboard data:', leaderboardData);
        setLeaderboard(leaderboardData);
        setLoading(false);
      }, 100);
    }
  }, [isOpen, selectedPeriod]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50';
      case 2: return 'text-gray-600 bg-gray-50';
      case 3: return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'weekly': return translations.thisWeek;
      case 'monthly': return translations.thisMonth;
      case 'allTime': return translations.allTime;
      default: return period;
    }
  };

  const getPoopCount = (entry: LeaderboardEntry) => {
    switch (selectedPeriod) {
      case 'weekly': return entry.weeklyPoops;
      case 'monthly': return entry.monthlyPoops;
      case 'allTime': return entry.totalPoops;
      default: return 0;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            🏆 {translations.poopLeaderboard}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 時間段選擇 */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          {(['weekly', 'monthly', 'allTime'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {getPeriodLabel(period)}
            </button>
          ))}
        </div>

        {/* 排行榜列表 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin text-4xl mb-4">💩</div>
            <p className="text-gray-500">載入排行榜中...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🚽</div>
            <p className="text-gray-500">還沒有排行榜數據</p>
            <p className="text-sm text-gray-400">邀請更多朋友一起記錄便便吧！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center p-3 rounded-lg border-2 ${
                  entry.userEmail === user?.email
                    ? 'border-purple-200 bg-purple-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {/* 排名 */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${getRankColor(entry.rank)}`}>
                  {getRankIcon(entry.rank)}
                </div>

                {/* 用戶資訊 */}
                <div className="flex-1 ml-3">
                  <div className="flex items-center">
                    <img
                      src={entry.userPicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.userName)}&background=random&color=fff`}
                      alt={entry.userName}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <div>
                      <div className="font-semibold text-gray-800">
                        {entry.userName}
                        {entry.userEmail === user?.email && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                            你
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        平均評分: {entry.averageRating.toFixed(1)} ⭐
                      </div>
                    </div>
                  </div>
                </div>

                {/* 便便數量 */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {getPoopCount(entry)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedPeriod === 'weekly' ? translations.thisWeek : 
                     selectedPeriod === 'monthly' ? translations.thisMonth : translations.allTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 統計資訊 */}
        {leaderboard.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">📊 統計資訊</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">參與人數</div>
                <div className="font-bold text-purple-600">{leaderboard.length} 人</div>
              </div>
              <div>
                <div className="text-gray-600">總便便數</div>
                <div className="font-bold text-purple-600">
                  {leaderboard.reduce((sum, entry) => sum + getPoopCount(entry), 0)}
                </div>
              </div>
              <div>
                <div className="text-gray-600">平均評分</div>
                <div className="font-bold text-purple-600">
                  {(leaderboard.reduce((sum, entry) => sum + entry.averageRating, 0) / leaderboard.length).toFixed(1)} ⭐
                </div>
              </div>
              <div>
                <div className="text-gray-600">你的排名</div>
                <div className="font-bold text-purple-600">
                  {leaderboard.find(e => e.userEmail === user?.email)?.rank || '-'} / {leaderboard.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 鼓勵訊息 */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 text-center">
            💪 繼續記錄便便，爭取更高排名！
          </p>
        </div>
      </div>
    </div>
  );
};