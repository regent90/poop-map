import React, { useState } from 'react';
import { UserInventory, PoopItem, Friend } from '../types';
import { RARITY_COLORS, RARITY_NAMES } from '../config/poopItems';

interface PoopInventoryProps {
  inventory: UserInventory;
  friends: Friend[];
  onUseItem: (item: PoopItem, targetFriend: Friend, message?: string) => void;
  onClose: () => void;
}

export const PoopInventory: React.FC<PoopInventoryProps> = ({
  inventory,
  friends,
  onUseItem,
  onClose,
}) => {
  const [selectedItem, setSelectedItem] = useState<PoopItem | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [attackMessage, setAttackMessage] = useState('');
  const [showAttackModal, setShowAttackModal] = useState(false);

  // 按稀有度分組道具
  const groupedItems = inventory.items.reduce((groups, item) => {
    if (!groups[item.rarity]) {
      groups[item.rarity] = [];
    }
    groups[item.rarity].push(item);
    return groups;
  }, {} as Record<string, PoopItem[]>);

  const handleItemClick = (item: PoopItem) => {
    setSelectedItem(item);
    setShowAttackModal(true);
  };

  const handleAttack = () => {
    if (selectedItem && selectedFriend) {
      onUseItem(selectedItem, selectedFriend, attackMessage);
      setShowAttackModal(false);
      setSelectedItem(null);
      setSelectedFriend(null);
      setAttackMessage('');
      onClose();
    }
  };

  const getRarityBadge = (rarity: string) => (
    <span
      className="px-2 py-1 rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] }}
    >
      {RARITY_NAMES[rarity as keyof typeof RARITY_NAMES]}
    </span>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            💩 便便道具庫存
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 統計資訊 */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {inventory.totalPoops}
              </div>
              <div className="text-sm text-gray-600">總便便數</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {inventory.items.length}
              </div>
              <div className="text-sm text-gray-600">道具數量</div>
            </div>
          </div>
        </div>

        {/* 道具列表 */}
        {inventory.items.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🚽</div>
            <p className="text-gray-500">還沒有任何道具</p>
            <p className="text-sm text-gray-400">記錄便便來獲得道具吧！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([rarity, items]) => (
              <div key={rarity}>
                <h3 className="flex items-center gap-2 mb-3">
                  {getRarityBadge(rarity)}
                  <span className="text-lg font-semibold">
                    ({items.length} 個)
                  </span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="border-2 rounded-lg p-3 cursor-pointer hover:shadow-lg transition-all"
                      style={{
                        borderColor: RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS],
                      }}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{item.icon}</div>
                        <div className="font-semibold text-sm mb-1">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 攻擊模態框 */}
        {showAttackModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">
                使用 {selectedItem.name}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  選擇攻擊目標：
                </label>
                <select
                  value={selectedFriend?.email || ''}
                  onChange={(e) => {
                    const friend = friends.find(f => f.email === e.target.value);
                    setSelectedFriend(friend || null);
                  }}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">選擇朋友...</option>
                  {friends.map((friend) => (
                    <option key={friend.email} value={friend.email}>
                      {friend.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  攻擊訊息 (可選)：
                </label>
                <input
                  type="text"
                  value={attackMessage}
                  onChange={(e) => setAttackMessage(e.target.value)}
                  placeholder="留個挑釁的話吧... 💩"
                  className="w-full p-2 border rounded-lg"
                  maxLength={50}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAttackModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleAttack}
                  disabled={!selectedFriend}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300"
                >
                  💥 攻擊！
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};