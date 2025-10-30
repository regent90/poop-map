import { PoopItem, PoopBombEffect } from '../types';

// 便便道具配置
export const POOP_ITEM_CONFIGS = {
  poop_bomb: {
    type: 'poop_bomb' as const,
    name: '💩 便便炸彈',
    description: '經典便便攻擊，造成中等程度的便便雨',
    icon: '💣',
    rarity: 'common' as const,
    dropRate: 0.8, // 80% 機率獲得
  },
  golden_poop: {
    type: 'golden_poop' as const,
    name: '✨ 黃金便便',
    description: '稀有的黃金便便，造成華麗的金色便便暴風雨',
    icon: '🌟',
    rarity: 'rare' as const,
    dropRate: 0.15, // 15% 機率獲得
  },
  rainbow_poop: {
    type: 'rainbow_poop' as const,
    name: '🌈 彩虹便便',
    description: '史詩級彩虹便便，造成絢爛的彩虹便便龍捲風',
    icon: '🦄',
    rarity: 'epic' as const,
    dropRate: 0.04, // 4% 機率獲得
  },
  stinky_poop: {
    type: 'stinky_poop' as const,
    name: '🤢 臭臭便便',
    description: '傳說級臭臭便便，造成毀滅性的便便海嘯',
    icon: '☠️',
    rarity: 'legendary' as const,
    dropRate: 0.01, // 1% 機率獲得
  },
};

// 便便攻擊效果配置
export const POOP_BOMB_EFFECTS: Record<string, PoopBombEffect> = {
  poop_bomb: {
    id: 'poop_rain',
    type: 'poop_rain',
    duration: 3000,
    intensity: 'medium',
    particles: 50,
  },
  golden_poop: {
    id: 'golden_shower',
    type: 'golden_shower',
    duration: 4000,
    intensity: 'heavy',
    particles: 80,
  },
  rainbow_poop: {
    id: 'poop_tornado',
    type: 'poop_tornado',
    duration: 5000,
    intensity: 'heavy',
    particles: 120,
  },
  stinky_poop: {
    id: 'poop_explosion',
    type: 'poop_explosion',
    duration: 6000,
    intensity: 'extreme',
    particles: 200,
  },
};

// 稀有度顏色配置
export const RARITY_COLORS = {
  common: '#9CA3AF',    // 灰色
  rare: '#3B82F6',      // 藍色
  epic: '#8B5CF6',      // 紫色
  legendary: '#F59E0B', // 金色
};

// 稀有度中文名稱
export const RARITY_NAMES = {
  common: '普通',
  rare: '稀有',
  epic: '史詩',
  legendary: '傳說',
};

// 生成隨機便便道具
export const generateRandomPoopItem = (): PoopItem => {
  const random = Math.random();
  let selectedType: keyof typeof POOP_ITEM_CONFIGS;
  
  if (random <= POOP_ITEM_CONFIGS.stinky_poop.dropRate) {
    selectedType = 'stinky_poop';
  } else if (random <= POOP_ITEM_CONFIGS.stinky_poop.dropRate + POOP_ITEM_CONFIGS.rainbow_poop.dropRate) {
    selectedType = 'rainbow_poop';
  } else if (random <= POOP_ITEM_CONFIGS.stinky_poop.dropRate + POOP_ITEM_CONFIGS.rainbow_poop.dropRate + POOP_ITEM_CONFIGS.golden_poop.dropRate) {
    selectedType = 'golden_poop';
  } else {
    selectedType = 'poop_bomb';
  }
  
  const config = POOP_ITEM_CONFIGS[selectedType];
  
  return {
    id: `${selectedType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: config.type,
    name: config.name,
    description: config.description,
    icon: config.icon,
    rarity: config.rarity,
    obtainedAt: Date.now(),
  };
};

// 獲得道具的祝賀訊息
export const getItemObtainedMessage = (item: PoopItem): string => {
  const messages = {
    common: [
      '💩 你獲得了一個便便炸彈！',
      '🎉 不錯！又多了一個攻擊道具！',
      '💣 便便炸彈到手！準備攻擊朋友吧！',
    ],
    rare: [
      '✨ 哇！你獲得了稀有的黃金便便！',
      '🌟 運氣不錯！黃金便便非常珍貴！',
      '💰 恭喜！黃金便便將帶來華麗的攻擊效果！',
    ],
    epic: [
      '🌈 太棒了！你獲得了史詩級彩虹便便！',
      '🦄 不可思議！彩虹便便極其罕見！',
      '🎊 恭喜！你擁有了傳說中的彩虹便便！',
    ],
    legendary: [
      '☠️ 天啊！你獲得了傳說級臭臭便便！',
      '🤢 這是奇蹟！臭臭便便萬中無一！',
      '👑 你是便便之王！臭臭便便無人能敵！',
    ],
  };
  
  const rarityMessages = messages[item.rarity];
  return rarityMessages[Math.floor(Math.random() * rarityMessages.length)];
};