import { MongoClient, Db, Collection } from 'mongodb';

// MongoDB 配置
const mongoUri = import.meta.env.VITE_MONGODB_URI || '';
const dbName = import.meta.env.VITE_MONGODB_DB_NAME || 'poopmap';

// MongoDB 客戶端實例
let client: MongoClient | null = null;
let db: Db | null = null;

// 連接檢查緩存
let connectionCheckCache: { result: boolean; timestamp: number } | null = null;
const CONNECTION_CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘緩存

// 初始化 MongoDB 連接
export const initMongoDB = async (): Promise<boolean> => {
  if (!mongoUri) {
    console.warn('⚠️ MongoDB URI not configured');
    return false;
  }

  try {
    if (!client) {
      console.log('🍃 Connecting to MongoDB Atlas...');
      client = new MongoClient(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      await client.connect();
      db = client.db(dbName);
      
      console.log('✅ MongoDB Atlas connected successfully');
    }
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    client = null;
    db = null;
    return false;
  }
};

// 獲取數據庫實例
export const getDB = (): Db | null => {
  return db;
};

// 獲取集合
export const getCollection = (collectionName: string): Collection | null => {
  if (!db) return null;
  return db.collection(collectionName);
};

// 檢查 MongoDB 連接 (優化版本，減少連接測試)
export const checkMongoDBConnection = async (): Promise<boolean> => {
  // 使用緩存結果，避免頻繁檢查
  if (connectionCheckCache && 
      Date.now() - connectionCheckCache.timestamp < CONNECTION_CACHE_DURATION) {
    console.log('✅ Using cached MongoDB connection status:', connectionCheckCache.result);
    return connectionCheckCache.result;
  }

  try {
    if (!client || !db) {
      const connected = await initMongoDB();
      connectionCheckCache = {
        result: connected,
        timestamp: Date.now()
      };
      return connected;
    }

    // 輕量級連接測試
    await db.admin().ping();
    
    connectionCheckCache = {
      result: true,
      timestamp: Date.now()
    };
    
    console.log('✅ MongoDB connection successful (cached for 5min)');
    return true;
  } catch (error) {
    console.warn('🔴 MongoDB connection test failed:', error);
    connectionCheckCache = {
      result: false,
      timestamp: Date.now()
    };
    return false;
  }
};

// 關閉連接
export const closeMongoDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🍃 MongoDB connection closed');
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

// 創建索引
export const createIndexes = async (): Promise<void> => {
  if (!db) return;

  try {
    console.log('🔍 Creating MongoDB indexes...');

    // 用戶集合索引
    await db.collection(COLLECTIONS.USERS).createIndex({ email: 1 }, { unique: true });

    // 便便集合索引
    await db.collection(COLLECTIONS.POOPS).createIndexes([
      { key: { userId: 1 } },
      { key: { privacy: 1 } },
      { key: { timestamp: -1 } },
      { key: { userId: 1, privacy: 1 } },
      { key: { lat: 1, lng: 1 } }, // 地理位置索引
    ]);

    // 好友集合索引
    await db.collection(COLLECTIONS.FRIENDS).createIndexes([
      { key: { userId: 1 } },
      { key: { status: 1 } },
      { key: { userId: 1, status: 1 } },
      { key: { userId: 1, friendEmail: 1 }, unique: true },
    ]);

    // 好友請求集合索引
    await db.collection(COLLECTIONS.FRIEND_REQUESTS).createIndexes([
      { key: { toUserEmail: 1 } },
      { key: { status: 1 } },
      { key: { toUserEmail: 1, status: 1 } },
      { key: { fromUserEmail: 1, toUserEmail: 1 } },
    ]);

    console.log('✅ MongoDB indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating MongoDB indexes:', error);
  }
};