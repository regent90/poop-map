// MongoDB 配置 (僅用於 Data API)
const mongoUri = import.meta.env.VITE_MONGODB_URI || '';
const dbName = import.meta.env.VITE_MONGODB_DB_NAME || 'poopmap';

// 連接檢查緩存
let connectionCheckCache: { result: boolean; timestamp: number } | null = null;
const CONNECTION_CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘緩存

// 注意：此文件僅用於類型定義和常量
// 實際的 MongoDB 操作使用 Data API (src/services/mongoDataAPI.ts)

// 檢查 MongoDB Data API 配置
export const checkMongoDBConnection = async (): Promise<boolean> => {
  // 使用緩存結果，避免頻繁檢查
  if (connectionCheckCache && 
      Date.now() - connectionCheckCache.timestamp < CONNECTION_CACHE_DURATION) {
    console.log('✅ Using cached MongoDB connection status:', connectionCheckCache.result);
    return connectionCheckCache.result;
  }

  try {
    const dataApiUrl = import.meta.env.VITE_MONGODB_DATA_API_URL;
    const apiKey = import.meta.env.VITE_MONGODB_API_KEY;
    
    if (!dataApiUrl || !apiKey) {
      console.warn('⚠️ MongoDB Data API not configured');
      connectionCheckCache = {
        result: false,
        timestamp: Date.now()
      };
      return false;
    }

    // 簡單的 ping 測試
    const response = await fetch(`${dataApiUrl}/action/findOne`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        collection: 'test',
        database: dbName,
        filter: {}
      })
    });

    const isConnected = response.status === 200 || response.status === 404; // 404 也表示連接成功但沒有數據
    
    connectionCheckCache = {
      result: isConnected,
      timestamp: Date.now()
    };
    
    console.log('✅ MongoDB Data API connection successful (cached for 5min)');
    return isConnected;
  } catch (error) {
    console.warn('🔴 MongoDB Data API connection test failed:', error);
    connectionCheckCache = {
      result: false,
      timestamp: Date.now()
    };
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
// Data API 不支持索引管理操作