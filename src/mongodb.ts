// MongoDB 配置 (用於後端 API)
const mongoUri = import.meta.env.VITE_MONGODB_URI || '';
const dbName = import.meta.env.VITE_MONGODB_DB_NAME || 'poopmap';

// 注意：此文件僅用於類型定義和常量
// 實際的 MongoDB 操作使用後端 API (src/services/mongoBackendAPI.ts)

// 檢查 MongoDB 後端 API 配置
export const checkMongoDBConnection = async (): Promise<boolean> => {
  try {
    if (!mongoUri) {
      console.warn('⚠️ MongoDB URI not configured');
      return false;
    }

    // 使用後端 API 檢查連接
    const { checkMongoBackendConnection } = await import('./services/mongoBackendAPI');
    return await checkMongoBackendConnection();
  } catch (error) {
    console.warn('🔴 MongoDB backend connection test failed:', error);
    return false;
  }
};

// 數據庫集合名稱常量
export const COLLECTIONS = {
  USERS: 'users',
  POOPS: 'poops',
  FRIENDS: 'friends',
  FRIEND_REQUESTS: 'friend_requests'
} as const;

// MongoDB 文檔接口
export interface MongoUser {
  _id?: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoPoop {
  _id?: string;
  id: string; // 保持與原有系統兼容的 ID
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

export interface MongoFriend {
  _id?: string;
  id: string;
  userId: string;
  friendEmail: string;
  friendName: string;
  friendPicture?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  addedAt: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoFriendRequest {
  _id?: string;
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

// 注意：索引創建需要通過 MongoDB Atlas UI 或 MongoDB Compass 手動完成
// 後端 API 可以支持索引管理，但建議在 Atlas UI 中創建