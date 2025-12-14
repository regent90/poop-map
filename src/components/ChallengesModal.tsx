import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Challenge, UserProfile, Friend, TranslationStrings } from '../types';

interface ChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  friends: Friend[];
  translations: TranslationStrings;
}

export const ChallengesModal: React.FC<ChallengesModalProps> = ({
  isOpen,
  onClose,
  user,
  friends,
  translations,
}) => {
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed' | 'create'>('active');
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    type: 'poop_count' as 'poop_count' | 'rating_streak' | 'friend_invite' | 'attack_count' | 'location_variety',
    target: 10,
    duration: 7, // 天數
    participants: [] as string[],
  });

  // 從 Convex 資料庫獲取挑戰
  const challengesData = useQuery(
    api.social.getChallenges,
    user?.email ? { userId: user.email } : 'skip'
  );

  // 創建挑戰的 mutation
  const createChallengeMutation = useMutation(api.social.createChallenge);

  // 預定義挑戰模板
  const challengeTemplates = [
    {
      title: '週末便便挑戰',
      description: '在週末兩天內記錄至少 3 次便便',
      type: 'poop_count' as const,
      target: 3,
      duration: 2,
      reward: { type: 'item', value: 'golden_poop' },
    },
    {
      title: '完美評分挑戰',
      description: '連續 5 次便便都獲得 5 星評分',
      type: 'rating_streak' as const,
      target: 5,
      duration: 7,
      reward: { type: 'achievement', value: 'perfectionist' },
    },
    {
      title: '社交達人挑戰',
      description: '邀請 3 個新朋友加入便便地圖',
      type: 'friend_invite' as const,
      target: 3,
      duration: 14,
      reward: { type: 'points', value: 500 },
    },
    {
      title: '攻擊狂魔挑戰',
      description: '使用便便道具攻擊朋友 10 次',
      type: 'attack_count' as const,
      target: 10,
      duration: 7,
      reward: { type: 'item', value: 'rainbow_poop' },
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'poop_count': return '💩';
      case 'rating_streak': return '⭐';
      case 'friend_invite': return '👥';
      case 'attack_count': return '💥';
      case 'location_variety': return '🗺️';
      default: return '🎯';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'poop_count': return '便便數量';
      case 'rating_streak': return '評分連擊';
      case 'friend_invite': return '好友邀請';
      case 'attack_count': return '攻擊次數';
      case 'location_variety': return '地點多樣性';
      default: return '其他';
    }
  };

  const getTimeRemaining = (endTime: number) => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) return '已結束';

    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    if (days > 0) return `${days} 天 ${hours} 小時`;
    return `${hours} 小時`;
  };

  const getProgressPercentage = (progress: number, target: number) => {
    return Math.min((progress / target) * 100, 100);
  };

  const handleCreateChallenge = async () => {
    if (!newChallenge.title || !newChallenge.description) {
      alert('請填寫挑戰標題和描述');
      return;
    }

    if (!user?.email || !user?.name) {
      alert('請先登入');
      return;
    }

    try {
      await createChallengeMutation({
        title: newChallenge.title,
        description: newChallenge.description,
        type: newChallenge.type,
        target: newChallenge.target,
        duration: newChallenge.duration * 24 * 60 * 60 * 1000,
        createdBy: user.email,
        createdByName: user.name,
        participants: [user.email, ...newChallenge.participants],
      });

      setNewChallenge({
        title: '',
        description: '',
        type: 'poop_count',
        target: 10,
        duration: 7,
        participants: [],
      });
      setSelectedTab('active');
      alert('挑戰創建成功！');
    } catch (error) {
      console.error('創建挑戰失敗:', error);
      alert('創建挑戰失敗,請稍後再試');
    }
  };

  const activeChallenges = challengesData?.filter(c => c.status === 'active') || [];
  const completedChallenges = challengesData?.filter(c => c.status === 'completed') || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            🎯 {translations.challengeSystem}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 標籤切換 */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          {(['active', 'completed', 'create'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${selectedTab === tab
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              {tab === 'active' ? translations.active :
                tab === 'completed' ? translations.completed : translations.createChallenge}
            </button>
          ))}
        </div>

        {/* 進行中的挑戰 */}
        {selectedTab === 'active' && (
          <div className="space-y-4">
            {activeChallenges.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-gray-500">沒有{translations.active}的挑戰</p>
                <p className="text-sm text-gray-400">{translations.createChallenge}來開始競爭吧!</p>
              </div>
            ) : (
              activeChallenges.map((challenge) => (
                <div key={challenge._id} className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getTypeIcon(challenge.type)}</span>
                      <div>
                        <h3 className="font-bold text-gray-800">{challenge.title}</h3>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                      {translations.active}
                    </span>
                  </div>

                  {/* 進度條 */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{translations.progress}: 0 / {challenge.target}</span>
                      <span>0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `0%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-gray-600">{translations.participants}: </span>
                      <span className="font-medium">{challenge.participants.length} 人</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{translations.timeRemaining}: </span>
                      <span className="font-medium text-orange-600">
                        {getTimeRemaining(challenge.endTime)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 已完成的挑戰 */}
        {selectedTab === 'completed' && (
          <div className="space-y-4">
            {completedChallenges.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🏆</div>
                <p className="text-gray-500">還沒有完成的挑戰</p>
                <p className="text-sm text-gray-400">完成挑戰來獲得獎勵!</p>
              </div>
            ) : (
              completedChallenges.map((challenge) => (
                <div key={challenge._id} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getTypeIcon(challenge.type)}</span>
                      <div>
                        <h3 className="font-bold text-gray-600">{challenge.title}</h3>
                        <p className="text-sm text-gray-500">{challenge.description}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {translations.completed}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-gray-500">完成度: </span>
                      <span className="font-medium">{challenge.target} / {challenge.target}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">獎勵: </span>
                      <span className="font-medium text-green-600">
                        {challenge.reward.type === 'points' ? `${challenge.reward.value} 積分` :
                          challenge.reward.type === 'item' ? '道具獎勵' : '成就獎勵'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 創建挑戰 */}
        {selectedTab === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">挑戰標題</label>
              <input
                type="text"
                value={newChallenge.title}
                onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                placeholder="輸入挑戰標題..."
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">挑戰描述</label>
              <textarea
                value={newChallenge.description}
                onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                placeholder="描述挑戰內容..."
                rows={3}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">挑戰類型</label>
                <select
                  value={newChallenge.type}
                  onChange={(e) => setNewChallenge({ ...newChallenge, type: e.target.value as any })}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="poop_count">便便數量</option>
                  <option value="rating_streak">評分連擊</option>
                  <option value="friend_invite">好友邀請</option>
                  <option value="attack_count">攻擊次數</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">目標數量</label>
                <input
                  type="number"
                  value={newChallenge.target}
                  onChange={(e) => setNewChallenge({ ...newChallenge, target: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">持續天數</label>
              <input
                type="number"
                value={newChallenge.duration}
                onChange={(e) => setNewChallenge({ ...newChallenge, duration: parseInt(e.target.value) || 1 })}
                min="1"
                max="30"
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">邀請朋友參與</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {friends.map((friend) => (
                  <label key={friend.email} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newChallenge.participants.includes(friend.email)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewChallenge({
                            ...newChallenge,
                            participants: [...newChallenge.participants, friend.email]
                          });
                        } else {
                          setNewChallenge({
                            ...newChallenge,
                            participants: newChallenge.participants.filter(p => p !== friend.email)
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{friend.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateChallenge}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              🎯 {translations.createChallenge}
            </button>

            {/* 快速模板 */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3">快速模板</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {challengeTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => setNewChallenge({
                      title: template.title,
                      description: template.description,
                      type: template.type,
                      target: template.target,
                      duration: template.duration,
                      participants: [],
                    })}
                    className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 text-left"
                  >
                    <div className="flex items-center mb-1">
                      <span className="text-lg mr-2">{getTypeIcon(template.type)}</span>
                      <span className="font-medium text-sm">{template.title}</span>
                    </div>
                    <p className="text-xs text-gray-600">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};