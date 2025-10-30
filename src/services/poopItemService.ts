import { UserInventory, PoopItem, PoopAttack } from '../types';
import { generateRandomPoopItem, getItemObtainedMessage } from '../config/poopItems';

// 本地儲存鍵名
const INVENTORY_KEY = (userId: string) => `poop_inventory_${userId}`;
const ATTACKS_KEY = (userId: string) => `poop_attacks_${userId}`;

// 獲取用戶道具庫存
export const getUserInventory = (userId: string): UserInventory => {
  const stored = localStorage.getItem(INVENTORY_KEY(userId));
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    userId,
    items: [],
    totalPoops: 0,
    lastUpdated: Date.now(),
  };
};

// 保存用戶道具庫存
export const saveUserInventory = (inventory: UserInventory): void => {
  inventory.lastUpdated = Date.now();
  localStorage.setItem(INVENTORY_KEY(inventory.userId), JSON.stringify(inventory));
};

// 記錄便便時獲得道具
export const awardPoopItem = (userId: string): { item: PoopItem; message: string } | null => {
  const inventory = getUserInventory(userId);
  
  // 更新總便便數
  inventory.totalPoops += 1;
  
  // 生成隨機道具
  const newItem = generateRandomPoopItem();
  inventory.items.push(newItem);
  
  // 保存庫存
  saveUserInventory(inventory);
  
  // 返回獲得的道具和訊息
  return {
    item: newItem,
    message: getItemObtainedMessage(newItem),
  };
};

// 使用道具攻擊朋友
export const usePoopItem = (
  fromUserId: string,
  fromUserName: string,
  fromUserEmail: string,
  fromUserPicture: string | undefined,
  toUserEmail: string,
  itemId: string,
  message?: string
): boolean => {
  const inventory = getUserInventory(fromUserId);
  
  // 找到要使用的道具
  const itemIndex = inventory.items.findIndex(item => item.id === itemId);
  if (itemIndex === -1) {
    return false; // 道具不存在
  }
  
  const item = inventory.items[itemIndex];
  
  // 移除道具
  inventory.items.splice(itemIndex, 1);
  saveUserInventory(inventory);
  
  // 創建攻擊記錄
  const attack: PoopAttack = {
    id: `attack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fromUserId,
    fromUserName,
    fromUserEmail,
    fromUserPicture,
    toUserId: toUserEmail, // 這裡用 email 作為 userId
    toUserEmail,
    itemUsed: item,
    timestamp: Date.now(),
    viewed: false,
    message,
  };
  
  // 保存攻擊記錄到目標用戶
  const targetAttacks = getPoopAttacks(toUserEmail);
  targetAttacks.push(attack);
  savePoopAttacks(toUserEmail, targetAttacks);
  
  return true;
};

// 獲取用戶收到的攻擊
export const getPoopAttacks = (userId: string): PoopAttack[] => {
  const stored = localStorage.getItem(ATTACKS_KEY(userId));
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

// 保存攻擊記錄
export const savePoopAttacks = (userId: string, attacks: PoopAttack[]): void => {
  localStorage.setItem(ATTACKS_KEY(userId), JSON.stringify(attacks));
};

// 獲取未查看的攻擊
export const getUnviewedAttacks = (userId: string): PoopAttack[] => {
  const attacks = getPoopAttacks(userId);
  return attacks.filter(attack => !attack.viewed);
};

// 標記攻擊為已查看
export const markAttackAsViewed = (userId: string, attackId: string): void => {
  const attacks = getPoopAttacks(userId);
  const attack = attacks.find(a => a.id === attackId);
  if (attack) {
    attack.viewed = true;
    savePoopAttacks(userId, attacks);
  }
};

// 清除舊的攻擊記錄 (保留最近 30 天)
export const cleanupOldAttacks = (userId: string): void => {
  const attacks = getPoopAttacks(userId);
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const recentAttacks = attacks.filter(attack => attack.timestamp > thirtyDaysAgo);
  savePoopAttacks(userId, recentAttacks);
};

// 獲取道具統計
export const getInventoryStats = (inventory: UserInventory) => {
  const stats = {
    total: inventory.items.length,
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };
  
  inventory.items.forEach(item => {
    stats[item.rarity]++;
  });
  
  return stats;
};