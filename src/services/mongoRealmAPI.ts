// MongoDB Realm Web SDK 服務
import * as Realm from 'realm-web';
import { Poop, Friend, FriendRequest } from '../types';

// Realm 配置
const REALM_APP_ID = import.meta.env.VITE_MONGODB_REALM_APP_ID || '';

let app: Realm.App | null = null;
let user: Realm.User | null = null;

// 初始化 Realm App
const initRealmApp = () => {
  if (!app && REALM_APP_ID) {
    app = new Realm.App({ id: REALM_APP_ID });
  }
  return app;
};

// 匿名登入
const loginAnonymously = async (): Promise<Realm.User> => {
  const realmApp = initRealmApp();
  if (!realmApp) throw new Error('Realm App not initialized');

  if (!user || !user.isLoggedIn) {
    user = await realmApp.logIn(Realm.Credentials.anonymous());
  }
  return user;
};

// 獲取 MongoDB 服務
const getMongoDBService = async () => {
  const currentUser = await loginAnonymously();
  return currentUser.mongoClient('mongodb-atlas');
};

// 便便相關操作
export const savePoopToRealm = async (poop: Poop): Promise<string> => {
  try {
    const mongodb = await getMongoDBService();
    const collection = mongodb.db('poopmap').collection('poops');

    const document = {
      ...poop,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(document);
    console.log('✅ Poop saved to MongoDB Realm:', result.insertedId);
    return result.insertedId.toString();
  } catch (error) {
    console.error('❌ Failed to save poop to MongoDB Realm:', error);
    throw error;
  }
};

export const getUserPoopsFromRealm = async (userEmail: string): Promise<Poop[]> => {
  try {
    const mongodb = await getMongoDBService();
    const collection = mongodb.db('poopmap').collection('poops');

    const poops = await collection.find(
      { userId: userEmail },
      { sort: { timestamp: -1 } }
    );

    console.log(`✅ Fetched ${poops.length} poops for user ${userEmail} from MongoDB Realm`);
    return poops as Poop[];
  } catch (error) {
    console.error('❌ Failed to fetch user poops from MongoDB Realm:', error);
    throw error;
  }
};

export const getFriendsPoopsFromRealm = async (friendEmails: string[]): Promise<Poop[]> => {
  if (friendEmails.length === 0) return [];

  try {
    const mongodb = await getMongoDBService();
    const collection = mongodb.db('poopmap').collection('poops');

    const poops = await collection.find(
      {
        userId: { $in: friendEmails },
        privacy: { $in: ['friends', 'public'] }
      },
      { sort: { timestamp: -1 } }
    );

    console.log(`✅ Fetched ${poops.length} friends poops from MongoDB Realm`);
    return poops as Poop[];
  } catch (error) {
    console.error('❌ Failed to fetch friends poops from MongoDB Realm:', error);
    throw error;
  }
};

// 公開便便查詢緩存
let publicPoopsCache: { data: Poop[]; timestamp: number } | null = null;
const PUBLIC_POOPS_CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘緩存

export const getPublicPoopsFromRealm = async (): Promise<Poop[]> => {
  // 使用緩存，減少 API 調用
  if (publicPoopsCache && 
      Date.now() - publicPoopsCache.timestamp < PUBLIC_POOPS_CACHE_DURATION) {
    console.log(`✅ Using cached public poops (${publicPoopsCache.data.length} items)`);
    return publicPoopsCache.data;
  }

  try {
    const mongodb = await getMongoDBService();
    const collection = mongodb.db('poopmap').collection('poops');

    const poops = await collection.find(
      { privacy: 'public' },
      { 
        sort: { timestamp: -1 },
        limit: 50
      }
    );

    // 緩存結果
    publicPoopsCache = {
      data: poops as Poop[],
      timestamp: Date.now()
    };

    console.log(`✅ Fetched ${poops.length} public poops from MongoDB Realm (cached for 5min)`);
    return poops as Poop[];
  } catch (error) {
    console.error('❌ Failed to fetch public poops from MongoDB Realm:', error);
    throw error;
  }
};

// 檢查 Realm 連接
export const checkRealmConnection = async (): Promise<boolean> => {
  try {
    const realmApp = initRealmApp();
    if (!realmApp) return false;

    await loginAnonymously();
    console.log('✅ MongoDB Realm connection successful');
    return true;
  } catch (error) {
    console.warn('🔴 MongoDB Realm connection failed:', error);
    return false;
  }
};

// 實時訂閱（Realm 支持）
export const subscribeToUserPoopsInRealm = (userEmail: string, callback: (poops: Poop[]) => void) => {
  console.log(`🔄 Setting up Realm subscription for user poops: ${userEmail}`);
  
  // Realm 支持實時訂閱，但需要配置
  // 這裡先用輪詢替代
  const pollForChanges = async () => {
    try {
      const poops = await getUserPoopsFromRealm(userEmail);
      callback(poops);
    } catch (error) {
      console.error('❌ Error in Realm polling:', error);
    }
  };

  const interval = setInterval(pollForChanges, 30000);

  return () => {
    console.log(`🔄 Stopping Realm subscription for user poops: ${userEmail}`);
    clearInterval(interval);
  };
};