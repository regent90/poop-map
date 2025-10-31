import { UserInventory, PoopItem, PoopAttack } from '../types';
import { generateRandomPoopItem, getItemObtainedMessage } from '../config/poopItems';
import { 
  getUserInventory as getInventoryFromDB, 
  addItemToInventory, 
  useItemFromInventory, 
  createPoopAttack,
  getUserAttacks,
  getUnviewedAttacks as getUnviewedAttacksFromDB,
  markAttackAsViewed as markAttackViewedInDB,
  cleanupOldAttacks as cleanupOldAttacksInDB
} from './unifiedDatabase';

// 本地儲存鍵名
const INVENTORY_KEY = (userId: string) => `poop_inventory_${userId}`;
const ATTACKS_KEY = (userId: string) => `poop_attacks_${userId}`;

// 獲取用戶道具庫存
export const getUserInventory = async (userId: string): Promise<UserInventory> => {
  return await getInventoryFromDB(userId);
};

// 記錄便便時獲得道具
export const awardPoopItem = async (userId: string): Promise<{ item: PoopItem; message: string } | null> => {
  // 生成隨機道具
  const newItem = generateRandomPoopItem();
  
  // 添加到庫存
  await addItemToInventory(userId, newItem);
  
  // 返回獲得的道具和訊息
  return {
    item: newItem,
    message: getItemObtainedMessage(newItem),
  };
};

// 使用道具攻擊朋友
export const usePoopItem = async (
  fromUserId: string,
  fromUserName: string,
  fromUserEmail: string,
  fromUserPicture: string | undefined,
  toUserEmail: string,
  itemId: string,
  message?: string
): Promise<boolean> => {
  try {
    // 使用道具（從庫存中移除）
    const item = await useItemFromInventory(fromUserId, itemId);
    
    // 創建攻擊記錄
    const attack = {
      fromUserId,
      fromUserName,
      fromUserEmail,
      fromUserPicture,
      toUserId: toUserEmail, // 這裡用 email 作為 userId
      toUserEmail,
      itemUsed: item,
      timestamp: Date.now(),
      message,
    };
    
    // 保存攻擊記錄到目標用戶
    await createPoopAttack(attack);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to use poop item:', error);
    return false;
  }
};

// 獲取未查看的攻擊
export const getUnviewedAttacks = async (userId: string): Promise<PoopAttack[]> => {
  return await getUnviewedAttacksFromDB(userId);
};

// 標記攻擊為已查看
export const markAttackAsViewed = async (userId: string, attackId: string): Promise<void> => {
  await markAttackViewedInDB(userId, attackId);
};

// 清除舊的攻擊記錄 (保留最近 30 天)
export const cleanupOldAttacks = async (userId: string): Promise<void> => {
  await cleanupOldAttacksInDB(userId);
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