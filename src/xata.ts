// Xata 資料庫配置
import { XataClient } from '@xata.io/client';

// Xata 配置
const xataApiUrl = import.meta.env.VITE_XATA_API_URL || '';
const xataApiKey = import.meta.env.VITE_XATA_API_KEY || '';

// 創建 Xata 客戶端
export const xata = new XataClient({
  apiKey: xataApiKey,
  databaseURL: xataApiUrl,
});

// 檢查 Xata 連接
export const checkXataConnection = async (): Promise<boolean> => {
  try {
    // 嘗試查詢一個表來測試連接
    await xata.db.poops.getFirst();
    console.log('✅ Xata connection successful');
    return true;
  } catch (error) {
    console.warn('🔴 Xata connection failed:', error);
    return false;
  }
};

// 資料庫表結構定義
export interface XataPoop {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  timestamp: number;
  rating?: number;
  notes?: string;
  photo?: string;
  privacy: 'private' | 'friends' | 'public';
  placeName?: string;
  customLocation?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface XataFriend {
  id: string;
  userId: string;
  friendEmail: string;
  friendName: string;
  friendPicture?: string;
  status: 'accepted' | 'pending' | 'rejected';
  addedAt: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface XataFriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  fromUserPicture?: string;
  toUserEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface XataComment {
  id: string;
  poopId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPicture?: string;
  content: string;
  timestamp: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface XataLike {
  id: string;
  poopId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPicture?: string;
  timestamp: number;
  createdAt: Date;
  updatedAt: Date;
}