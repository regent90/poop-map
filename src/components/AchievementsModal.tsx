import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Achievement, UserAchievement, UserProfile, TranslationStrings } from '../types';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  poops: any[];
  friends: any[];
  translations: TranslationStrings;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  user,
  poops,
  friends,
  translations,
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'quantity' | 'quality' | 'social' | 'special'>('all');

  // 從 Convex 資料庫獲取用戶成就
  const userAchievementsData = useQuery(
    api.social.getUserAchievements,
    user?.email ? { userId: user.email } : 'skip'
  );

  // 解鎖成就的 mutation
  const unlockAchievement = useMutation(api.social.unlockAchievement);

  // 預定義成就列表
  const predefinedAchievements: Achievement[] = [
    // 數量類成就
    {
      id: 'first_poop',
      name: '初次體驗',
      description: '記錄你的第一次便便',
      icon: '🚽',
      category: 'quantity',
      requirement: { type: 'poop_count', value: 1 },
      rarity: 'bronze',
      points: 10,
    },
    {
      id: 'poop_10',
      name: '便便新手',
      description: '記錄 10 次便便',
      icon: '💩',
      category: 'quantity',
      requirement: { type: 'poop_count', value: 10 },
      rarity: 'bronze',
      points: 50,
    },
    {
      id: 'poop_50',
      name: '便便達人',
      description: '記錄 50 次便便',
      icon: '🏆',
      category: 'quantity',
      requirement: { type: 'poop_count', value: 50 },
      rarity: 'silver',
      points: 200,
    },
    {
      id: 'poop_100',
      name: '便便大師',
      description: '記錄 100 次便便',
      icon: '👑',
      category: 'quantity',
      requirement: { type: 'poop_count', value: 100 },
      rarity: 'gold',
      points: 500,
    },
    {
      id: 'poop_500',
      name: '便便傳說',
      description: '記錄 500 次便便',
      icon: '🌟',
      category: 'quantity',
      requirement: { type: 'poop_count', value: 500 },
      rarity: 'platinum',
      points: 2000,
    },

    // 質量類成就
    {
      id: 'perfect_rating',
      name: '完美體驗',
      description: '獲得一次 5 星評分',
      icon: '⭐',
      category: 'quality',
      requirement: { type: 'rating_average', value: 5 },
      rarity: 'bronze',
      points: 25,
    },
    {
      id: 'high_average',
      name: '品質保證',
      description: '平均評分達到 4.5 星',
      icon: '✨',
      category: 'quality',
      requirement: { type: 'rating_average', value: 4.5 },
      rarity: 'silver',
      points: 150,
    },

    // 社交類成就
    {
      id: 'first_friend',
      name: '社交新手',
      description: '添加第一個朋友',
      icon: '👥',
      category: 'social',
      requirement: { type: 'friend_count', value: 1 },
      rarity: 'bronze',
      points: 30,
    },
    {
      id: 'friend_10',
      name: '人氣王',
      description: '擁有 10 個朋友',
      icon: '🎉',
      category: 'social',
      requirement: { type: 'friend_count', value: 10 },
      rarity: 'gold',
      points: 300,
    },
    {
      id: 'first_attack',
      name: '攻擊新手',
      description: '發動第一次便便攻擊',
      icon: '💥',
      category: 'social',
      requirement: { type: 'attack_count', value: 1 },
      rarity: 'bronze',
      points: 20,
    },

    // 特殊成就
    {
      id: 'early_bird',
      name: '早起鳥兒',
      description: '在早上 6 點前記錄便便',
      icon: '🌅',
      category: 'special',
      requirement: { type: 'special', value: 1 },
      rarity: 'silver',
      points: 100,
    },
    {
      id: 'night_owl',
      name: '夜貓子',
      description: '在晚上 11 點後記錄便便',
      icon: '🦉',
      category: 'special',
      requirement: { type: 'special', value: 1 },
      rarity: 'silver',
      points: 100,
    },
    {
      id: 'weekend_warrior',
      name: '週末戰士',
      description: '週末連續兩天都記錄便便',
      icon: '🏖️',
      category: 'special',
      requirement: { type: 'special', value: 1 },
      rarity: 'gold',
      points: 250,
    },
  ];


  // 檢查並自動解鎖成就
  const checkAndUnlockAchievements = async () => {
    if (!user?.email || !userAchievementsData) return;

    const userPoops = poops.filter(p => p.userId === user.email);
    const unlockedAchievementIds = new Set(userAchievementsData.map(ua => ua.achievementId));

    // 檢查每個成就是否應該解鎖
    for (const achievement of predefinedAchievements) {
      // 如果已經解鎖,跳過
      if (unlockedAchievementIds.has(achievement.id)) continue;

      let shouldUnlock = false;

      switch (achievement.requirement.type) {
        case 'poop_count':
          shouldUnlock = userPoops.length >= achievement.requirement.value;
          break;

        case 'rating_average':
          // 特殊處理:完美體驗成就檢查是否有任何一次 5 星評分
          if (achievement.id === 'perfect_rating') {
            shouldUnlock = userPoops.some(p => p.rating === 5);
          } else {
            // 其他成就檢查平均評分
            const totalRating = userPoops.reduce((sum, p) => sum + (p.rating || 0), 0);
            const averageRating = userPoops.length > 0 ? totalRating / userPoops.length : 0;
            shouldUnlock = averageRating >= achievement.requirement.value;
          }
          break;

        case 'friend_count':
          shouldUnlock = friends.length >= achievement.requirement.value;
          break;

        case 'attack_count':
          // 這裡需要從攻擊記錄中獲取,暫時設為 false
          shouldUnlock = false;
          break;

        case 'special':
          // 特殊成就需要特殊邏輯檢查
          if (achievement.id === 'early_bird') {
            shouldUnlock = userPoops.some(p => {
              const hour = new Date(p.timestamp).getHours();
              return hour < 6;
            });
          } else if (achievement.id === 'night_owl') {
            shouldUnlock = userPoops.some(p => {
              const hour = new Date(p.timestamp).getHours();
              return hour >= 23;
            });
          }
          break;
      }

      // 如果應該解鎖,調用 mutation
      if (shouldUnlock) {
        try {
          await unlockAchievement({
            userId: user.email,
            achievementId: achievement.id,
            progress: 100,
          });
          console.log(`✅ 成就已解鎖: ${achievement.name}`);
        } catch (error) {
          console.error(`❌ 解鎖成就失敗: ${achievement.name}`, error);
        }
      }
    }
  };

  useEffect(() => {
    if (isOpen && user?.email && userAchievementsData) {
      setAchievements(predefinedAchievements);
      // 檢查並解鎖新成就
      checkAndUnlockAchievements();
    }
  }, [isOpen, user?.email, userAchievementsData, poops.length, friends.length]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'bronze': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'silver': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'gold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'platinum': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'diamond': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'bronze': return '銅';
      case 'silver': return '銀';
      case 'gold': return '金';
      case 'platinum': return '白金';
      case 'diamond': return '鑽石';
      default: return rarity;
    }
  };

  const getRarityImage = (rarity: string) => {
    return `/images/ui/${rarity}.png`;
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'quantity': return '數量';
      case 'quality': return '品質';
      case 'social': return '社交';
      case 'special': return '特殊';
      default: return '全部';
    }
  };

  const isUnlocked = (achievementId: string) => {
    return userAchievementsData?.some(ua => ua.achievementId === achievementId) || false;
  };

  const filteredAchievements = achievements.filter(achievement =>
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const unlockedAchievements = filteredAchievements.filter(a => isUnlocked(a.id));
  const lockedAchievements = filteredAchievements.filter(a => !isUnlocked(a.id));

  const totalPoints = (userAchievementsData || []).reduce((sum, ua) => {
    const achievement = achievements.find(a => a.id === ua.achievementId);
    return sum + (achievement?.points || 0);
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            🏅 {translations.achievementSystem}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 統計資訊 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{userAchievementsData?.length || 0}</div>
            <div className="text-sm text-purple-600">{translations.unlocked}</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{achievements.length}</div>
            <div className="text-sm text-blue-600">{translations.totalAchievements}</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{totalPoints}</div>
            <div className="text-sm text-yellow-600">{translations.totalPoints}</div>
          </div>
        </div>

        {/* 分類選擇 */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1 overflow-x-auto">
          {(['all', 'quantity', 'quality', 'social', 'special'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 py-2 px-3 rounded-md text-sm font-medium transition-colors ${selectedCategory === category
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              {getCategoryName(category)}
            </button>
          ))}
        </div>

        {/* 成就列表 */}
        <div className="space-y-6">
          {/* 已解鎖成就 */}
          {unlockedAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {translations.unlocked} ({unlockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {unlockedAchievements.map((achievement) => {
                  const userAchievement = userAchievementsData?.find(ua => ua.achievementId === achievement.id);
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}
                    >
                      <div className="flex items-start">
                        <div className="mr-3 w-16 h-16 flex-shrink-0">
                          <img
                            src={getRarityImage(achievement.rarity)}
                            alt={achievement.rarity}
                            className="w-full h-full object-contain drop-shadow-md"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-800">{achievement.name}</h4>
                            <span className="text-xs px-2 py-1 rounded-full bg-white">
                              {getRarityName(achievement.rarity)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {userAchievement && new Date(userAchievement.unlockedAt).toLocaleDateString()}
                            </span>
                            <span className="text-sm font-bold text-yellow-600">
                              +{achievement.points} 分
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 未解鎖成就 */}
          {lockedAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                未解鎖 ({lockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 opacity-75"
                  >
                    <div className="flex items-start">
                      <div className="mr-3 w-16 h-16 flex-shrink-0 grayscale opacity-40">
                        <img
                          src={getRarityImage(achievement.rarity)}
                          alt={achievement.rarity}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-600">{achievement.name}</h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-white text-gray-500">
                            {getRarityName(achievement.rarity)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{achievement.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">未解鎖</span>
                          <span className="text-sm font-bold text-gray-400">
                            +{achievement.points} 分
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 進度提示 */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">💡 解鎖提示</h3>
          <p className="text-sm text-gray-600">
            繼續記錄便便、添加朋友、發動攻擊來解鎖更多成就！每個成就都會給你積分獎勵。
          </p>
        </div>
      </div>
    </div>
  );
};
