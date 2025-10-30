// MongoDB Data API 服務 (瀏覽器兼容)
import { Poop, Friend, FriendRequest } from '../types';

// MongoDB Data API 配置
const DATA_API_URL = import.meta.env.VITE_MONGODB_DATA_API_URL || '';
const API_KEY = import.meta.env.VITE_MONGODB_API_KEY || '';
const DATABASE = import.meta.env.VITE_MONGODB_DB_NAME || 'poopmap';

// 連接檢查緩存
let connectionCheckCache: { result: boolean; timestamp: number } | null = null;
const CONNECTION_CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘緩存

// 通用 API 調用函數
const callDataAPI = async (action: string, collection: string, document?: any, filter?: any, sort?: any, limit?: number) => {
  if (!DATA_API_URL || !API_KEY) {
    throw new Error('MongoDB Data API not configured');
  }

  const body: any = {
    dataSource: 'Cluster0', // 默認集群名
    database: DATABASE,
    collection
  };

  if (document) body.document = document;
  if (filter) body.filter = filter;
  if (sort) body.sort = sort;
  if (limit) body.limit = limit;

  const response = await fetch(`${DATA_API_URL}/action/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': API_KEY
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`MongoDB Data API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

// 檢查 MongoDB Data API 連接
export const checkMongoDataAPIConnection = async (): Promise<boolean> => {
  // 使用緩存結果，避免頻繁檢查
  if (connectionCheckCache && 
      Date.now() - connectionCheckCache.timestamp < CONNECTION_CACHE_DURATION) {
    console.log('✅ Using cached MongoDB Data API connection status:', connectionCheckCache.result);
    return connectionCheckCache.result;
  }

  try {
    // 嘗試查詢一個文檔來測試連接
    await callDataAPI('findOne', 'poops', undefined, {});
    
    connectionCheckCache = {
      result: true,
      timestamp: Date.now()
    };
    
    console.log('✅ MongoDB Data API connection successful (cached for 5min)');
    return true;
  } catch (error) {
    console.warn('🔴 MongoDB Data API connection test failed:', error);
    connectionCheckCache = {
      result: false,
      timestamp: Date.now()
    };
    return false;
  }
};

// 便便相關操作
export const savePoopToMongoDataAPI = async (poop: Poop): Promise<string> => {
  try {
    const document = {
      id: poop.id,
      userId: poop.userId,
      lat: poop.lat,
      lng: poop.lng,
      timestamp: poop.timestamp,
      rating: poop.rating,
      notes: poop.notes,
      photo: poop.photo,
      privacy: poop.privacy,
      placeName: poop.placeName,
      customLocation: poop.customLocation,
      address: poop.address,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await callDataAPI('insertOne', 'poops', document);
    console.log('✅ Poop saved to MongoDB Data API:', result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error('❌ Failed to save poop to MongoDB Data API:', error);
    throw error;
  }
};

export const getUserPoopsFromMongoDataAPI = async (userEmail: string): Promise<Poop[]> => {
  try {
    const result = await callDataAPI('find', 'poops', undefined, { userId: userEmail }, { timestamp: -1 });
    
    const poops = result.documents.map((doc: any) => ({
      id: doc.id,
      userId: doc.userId,
      lat: doc.lat,
      lng: doc.lng,
      timestamp: doc.timestamp,
      rating: doc.rating,
      notes: doc.notes,
      photo: doc.photo,
      privacy: doc.privacy,
      placeName: doc.placeName,
      customLocation: doc.customLocation,
      address: doc.address
    })) as Poop[];

    console.log(`✅ Fetched ${poops.length} poops for user ${userEmail} from MongoDB Data API`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch user poops from MongoDB Data API:', error);
    throw error;
  }
};

export const getFriendsPoopsFromMongoDataAPI = async (friendEmails: string[]): Promise<Poop[]> => {
  if (friendEmails.length === 0) return [];

  try {
    const result = await callDataAPI('find', 'poops', undefined, {
      userId: { $in: friendEmails },
      privacy: { $in: ['friends', 'public'] }
    }, { timestamp: -1 });

    const poops = result.documents.map((doc: any) => ({
      id: doc.id,
      userId: doc.userId,
      lat: doc.lat,
      lng: doc.lng,
      timestamp: doc.timestamp,
      rating: doc.rating,
      notes: doc.notes,
      photo: doc.photo,
      privacy: doc.privacy,
      placeName: doc.placeName,
      customLocation: doc.customLocation,
      address: doc.address
    })) as Poop[];

    console.log(`✅ Fetched ${poops.length} friends poops from MongoDB Data API`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch friends poops from MongoDB Data API:', error);
    throw error;
  }
};

// 公開便便查詢緩存
let publicPoopsCache: { data: Poop[]; timestamp: number } | null = null;
const PUBLIC_POOPS_CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘緩存

export const getPublicPoopsFromMongoDataAPI = async (): Promise<Poop[]> => {
  // 使用緩存，減少 API 調用
  if (publicPoopsCache && 
      Date.now() - publicPoopsCache.timestamp < PUBLIC_POOPS_CACHE_DURATION) {
    console.log(`✅ Using cached public poops (${publicPoopsCache.data.length} items)`);
    return publicPoopsCache.data;
  }

  try {
    const result = await callDataAPI('find', 'poops', undefined, { privacy: 'public' }, { timestamp: -1 }, 50);

    const poops = result.documents.map((doc: any) => ({
      id: doc.id,
      userId: doc.userId,
      lat: doc.lat,
      lng: doc.lng,
      timestamp: doc.timestamp,
      rating: doc.rating,
      notes: doc.notes,
      photo: doc.photo,
      privacy: doc.privacy,
      placeName: doc.placeName,
      customLocation: doc.customLocation,
      address: doc.address
    })) as Poop[];

    // 緩存結果
    publicPoopsCache = {
      data: poops,
      timestamp: Date.now()
    };

    console.log(`✅ Fetched ${poops.length} public poops from MongoDB Data API (cached for 5min)`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch public poops from MongoDB Data API:', error);
    throw error;
  }
};

// 好友相關操作
export const saveFriendToMongoDataAPI = async (userEmail: string, friend: Friend): Promise<string> => {
  try {
    const document = {
      id: `${userEmail}_${friend.email}`,
      userId: userEmail,
      friendEmail: friend.email,
      friendName: friend.name,
      friendPicture: friend.picture,
      status: friend.status,
      addedAt: friend.addedAt,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 使用 replaceOne 來實現 upsert
    const result = await callDataAPI('replaceOne', 'friends', document, { 
      userId: userEmail, 
      friendEmail: friend.email 
    });

    console.log('✅ Friend saved to MongoDB Data API');
    return document.id;
  } catch (error) {
    console.error('❌ Failed to save friend to MongoDB Data API:', error);
    throw error;
  }
};

export const getUserFriendsFromMongoDataAPI = async (userEmail: string): Promise<Friend[]> => {
  try {
    const result = await callDataAPI('find', 'friends', undefined, { 
      userId: userEmail, 
      status: 'accepted' 
    });

    const friends = result.documents.map((doc: any) => ({
      id: doc.friendEmail,
      name: doc.friendName,
      email: doc.friendEmail,
      picture: doc.friendPicture,
      status: doc.status as 'pending' | 'accepted' | 'blocked',
      addedAt: doc.addedAt
    })) as Friend[];

    console.log(`✅ Fetched ${friends.length} friends for user ${userEmail} from MongoDB Data API`);
    return friends;
  } catch (error) {
    console.error('❌ Failed to fetch user friends from MongoDB Data API:', error);
    throw error;
  }
};

// 好友請求相關操作
export const sendFriendRequestToMongoDataAPI = async (request: FriendRequest): Promise<string> => {
  try {
    const document = {
      id: request.id,
      fromUserId: request.fromUserId,
      fromUserName: request.fromUserName,
      fromUserEmail: request.fromUserEmail,
      fromUserPicture: request.fromUserPicture,
      toUserEmail: request.toUserEmail,
      status: request.status,
      timestamp: request.timestamp,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await callDataAPI('insertOne', 'friend_requests', document);
    console.log('✅ Friend request sent to MongoDB Data API:', result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error('❌ Failed to send friend request to MongoDB Data API:', error);
    throw error;
  }
};

export const getUserFriendRequestsFromMongoDataAPI = async (userEmail: string): Promise<FriendRequest[]> => {
  try {
    const result = await callDataAPI('find', 'friend_requests', undefined, {
      toUserEmail: userEmail,
      status: 'pending'
    }, { timestamp: -1 });

    const requests = result.documents.map((doc: any) => ({
      id: doc.id,
      fromUserId: doc.fromUserId,
      fromUserName: doc.fromUserName,
      fromUserEmail: doc.fromUserEmail,
      fromUserPicture: doc.fromUserPicture,
      toUserEmail: doc.toUserEmail,
      status: doc.status,
      timestamp: doc.timestamp
    })) as FriendRequest[];

    console.log(`✅ Fetched ${requests.length} friend requests for user ${userEmail} from MongoDB Data API`);
    return requests;
  } catch (error) {
    console.error('❌ Failed to fetch friend requests from MongoDB Data API:', error);
    throw error;
  }
};

export const updateFriendRequestStatusInMongoDataAPI = async (requestId: string, status: 'accepted' | 'rejected'): Promise<void> => {
  try {
    const result = await callDataAPI('updateOne', 'friend_requests', {
      $set: { 
        status, 
        updatedAt: new Date() 
      }
    }, { id: requestId });

    if (result.matchedCount === 0) {
      throw new Error(`Friend request ${requestId} not found`);
    }

    console.log(`✅ Friend request ${requestId} status updated to ${status} in MongoDB Data API`);
  } catch (error) {
    console.error('❌ Failed to update friend request status in MongoDB Data API:', error);
    throw error;
  }
};

// MongoDB Data API 不支持實時訂閱，使用輪詢替代
export const subscribeToUserPoopsInMongoDataAPI = (userEmail: string, callback: (poops: Poop[]) => void) => {
  console.log(`🔄 Setting up polling subscription for user poops: ${userEmail}`);
  
  const pollForChanges = async () => {
    try {
      const poops = await getUserPoopsFromMongoDataAPI(userEmail);
      callback(poops);
    } catch (error) {
      console.error('❌ Error in MongoDB Data API polling:', error);
    }
  };

  // 每 30 秒輪詢一次
  const interval = setInterval(pollForChanges, 30000);

  return () => {
    console.log(`🔄 Stopping polling for user poops: ${userEmail}`);
    clearInterval(interval);
  };
};

export const subscribeToFriendRequestsInMongoDataAPI = (userEmail: string, callback: (requests: FriendRequest[]) => void) => {
  console.log(`🔄 Setting up polling subscription for friend requests: ${userEmail}`);
  
  const pollForChanges = async () => {
    try {
      const requests = await getUserFriendRequestsFromMongoDataAPI(userEmail);
      callback(requests);
    } catch (error) {
      console.error('❌ Error in MongoDB Data API friend requests polling:', error);
    }
  };

  // 每 60 秒輪詢一次
  const interval = setInterval(pollForChanges, 60000);

  return () => {
    console.log(`🔄 Stopping polling for friend requests: ${userEmail}`);
    clearInterval(interval);
  };
};