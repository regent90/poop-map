export interface UserProfile {
  name?: string;
  displayName?: string; // 用戶自定義顯示名稱
  picture?: string;
  email?: string;
  hasChangedName?: boolean; // 是否已經使用過免費改名機會
}

export type PrivacyLevel = 'private' | 'friends' | 'public';

export interface Poop {
  id: string;
  lat: number;
  lng: number;
  timestamp: number;
  address?: string; // Google 地標地址
  placeName?: string; // 地標名稱
  customLocation?: string; // 用戶自訂地點
  rating: number; // 便便體驗評分 (0-5, 0.5為單位)
  photo?: string; // 便便圖片 base64
  notes?: string; // 備註
  privacy: PrivacyLevel; // 隱私設定
  userId: string; // 便便所有者ID
  // 新增互動功能
  likes?: PoopLike[]; // 按讚列表
  comments?: PoopComment[]; // 留言列表
  likeCount?: number; // 按讚數量
  commentCount?: number; // 留言數量
}

// 按讚類型
export interface PoopLike {
  id: string;
  poopId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPicture?: string;
  timestamp: number;
}

// 留言類型
export interface PoopComment {
  id: string;
  poopId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPicture?: string;
  content: string;
  timestamp: number;
}

export interface Friend {
  id: string;
  name: string;
  email: string;
  picture?: string;
  status: 'pending' | 'accepted' | 'blocked';
  addedAt: number;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  fromUserPicture?: string;
  toUserEmail: string;
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export type Language = 'en' | 'zh-TW' | 'zh-CN' | 'ja' | 'ko' | 'es' | 'fr' | 'de';

export interface TranslationStrings {
  loginWithGoogle: string;
  logout: string;
  dropPoop: string;
  dropping: string;
  locationError: string;
  welcome: string;
  totalDrops: string;
  noDropsYet: string;
  poopMap: string;
  language: string;
  // New strings
  poopDetails: string;
  location: string;
  customLocation: string;
  rating: string;
  uploadPhoto: string;
  notes: string;
  save: string;
  cancel: string;
  excellent: string;
  good: string;
  average: string;
  poor: string;
  terrible: string;
  gettingLocation: string;
  takingPhoto: string;
  // Social features
  friends: string;
  addFriend: string;
  friendRequests: string;
  privacy: string;
  private: string;
  friendsOnly: string;
  public: string;
  shareViaEmail: string;
  shareViaQR: string;
  shareViaLink: string;
  inviteFriend: string;
  acceptRequest: string;
  rejectRequest: string;
  myQRCode: string;
  scanQRCode: string;
  // 互動功能翻譯
  like: string;
  unlike: string;
  comment: string;
  comments: string;
  likes: string;
  addComment: string;
  writeComment: string;
  postComment: string;
  deleteComment: string;
  likedBy: string;
  noComments: string;
  noLikes: string;
  // 便便可見性篩選器翻譯
  allPoops: string;
  myPoops: string;
  friendPoops: string;
  publicPoops: string;
  poopVisibility: string;
  selectPoopType: string;
  showAllVisible: string;
  showMyPoops: string;
  showFriendPoops: string;
  showPublicPoops: string;
  switchVisibilityTip: string;
  leaderboard: string;
  achievements: string;
  feed: string;
  challenges: string;
  notifications: string;
  statistics: string;
  weeklyStats: string;
  monthlyStats: string;
  allTimeStats: string;
}

export type Translations = {
  [key in Language]: TranslationStrings;
};

// 便便道具系統
export interface PoopItem {
  id: string;
  type: 'poop_bomb' | 'golden_poop' | 'rainbow_poop' | 'stinky_poop';
  name: string;
  description: string;
  icon: string; // emoji 或圖片 URL
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  obtainedAt: number;
}

export interface UserInventory {
  userId: string;
  items: PoopItem[];
  totalPoops: number; // 總便便數量
  lastUpdated: number;
}

export interface PoopAttack {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  fromUserPicture?: string;
  toUserId: string;
  toUserEmail: string;
  itemUsed: PoopItem;
  timestamp: number;
  viewed: boolean; // 是否已查看
  message?: string; // 攻擊訊息
}

export interface PoopBombEffect {
  id: string;
  type: 'poop_rain' | 'poop_explosion' | 'poop_tornado' | 'golden_shower';
  duration: number; // 動畫持續時間 (毫秒)
  intensity: 'light' | 'medium' | 'heavy' | 'extreme';
  particles: number; // 粒子數量
}

// 新增社交功能類型

// 排行榜系統
export interface LeaderboardEntry {
  userId: string;
  userEmail: string;
  userName: string;
  userPicture?: string;
  totalPoops: number;
  weeklyPoops: number;
  monthlyPoops: number;
  averageRating: number;
  lastPoopTime: number;
  rank: number;
}

export interface Leaderboard {
  period: 'weekly' | 'monthly' | 'allTime';
  entries: LeaderboardEntry[];
  lastUpdated: number;
}

// 成就系統
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'quantity' | 'quality' | 'social' | 'special';
  requirement: {
    type: 'poop_count' | 'rating_average' | 'friend_count' | 'attack_count' | 'special';
    value: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'allTime';
  };
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: number;
  progress?: number; // 進度百分比 (0-100)
}

// 動態牆系統
export interface FeedActivity {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPicture?: string;
  type: 'poop_recorded' | 'achievement_unlocked' | 'friend_added' | 'attack_sent' | 'challenge_completed';
  timestamp: number;
  data: {
    poopId?: string;
    achievementId?: string;
    friendEmail?: string;
    attackId?: string;
    challengeId?: string;
    location?: string;
    rating?: number;
    [key: string]: any;
  };
  privacy: PrivacyLevel;
}

// 挑戰系統
export interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  requirement: {
    type: 'poop_count' | 'rating_target' | 'location_variety' | 'friend_interaction';
    value: number;
    timeframe: number; // 時間限制 (毫秒)
  };
  reward: {
    type: 'achievement' | 'item' | 'points';
    value: string | number;
  };
  startDate: number;
  endDate: number;
  participants: string[]; // 參與者用戶ID列表
}

export interface UserChallenge {
  userId: string;
  challengeId: string;
  progress: number;
  completed: boolean;
  completedAt?: number;
  reward?: {
    type: string;
    value: string | number;
  };
}

// 統計系統
export interface UserStats {
  userId: string;
  totalPoops: number;
  weeklyPoops: number;
  monthlyPoops: number;
  averageRating: number;
  bestRating: number;
  worstRating: number;
  favoriteLocation?: string;
  longestStreak: number; // 連續記錄天數
  currentStreak: number;
  totalFriends: number;
  totalAttacksSent: number;
  totalAttacksReceived: number;
  achievementsUnlocked: number;
  totalPoints: number;
  lastUpdated: number;
}

// 便便熱點系統
export interface PoopHotspot {
  id: string;
  lat: number;
  lng: number;
  radius: number; // 熱點半徑 (米)
  name: string;
  poopCount: number;
  averageRating: number;
  lastActivity: number;
  topContributors: {
    userId: string;
    userName: string;
    count: number;
  }[];
}

// 挑戰系統
export interface Challenge {
  id: string;
  title: string;
  description: string;
  challengeType: 'poop_count' | 'rating_streak' | 'friend_invite' | 'attack_count' | 'location_variety';
  target: number; // 目標數量
  duration: number; // 持續時間 (毫秒)
  createdBy: string;
  createdByName: string;
  participants: string[]; // 參與者用戶ID列表
  startTime: number;
  endTime: number;
  status: 'active' | 'completed' | 'expired';
  reward: {
    type: 'achievement' | 'item' | 'points';
    value: string | number;
  };
  progress: number; // 當前進度
}

// 通知系統
export interface Notification {
  id: string;
  userId: string;
  type: 'friend_request' | 'attack_received' | 'achievement_unlocked' | 'challenge_invite' | 'leaderboard_update' | 'item_received';
  title: string;
  message: string;
  icon: string;
  timestamp: number;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  data?: {
    fromUserId?: string;
    achievementId?: string;
    challengeId?: string;
    itemId?: string;
  };
}