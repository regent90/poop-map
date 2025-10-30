
export interface UserProfile {
  name?: string;
  picture?: string;
  email?: string;
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
