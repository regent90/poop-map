import { getCollection, COLLECTIONS, MongoPoop, MongoFriend, MongoFriendRequest, initMongoDB } from '../mongodb';
import { Poop, Friend, FriendRequest } from '../types';

// 類型轉換函數
const convertMongoPoopToPoop = (mongoPoop: MongoPoop): Poop => ({
  id: mongoPoop.id,
  userId: mongoPoop.userId,
  lat: mongoPoop.lat,
  lng: mongoPoop.lng,
  timestamp: mongoPoop.timestamp,
  rating: mongoPoop.rating,
  notes: mongoPoop.notes,
  photo: mongoPoop.photo,
  privacy: mongoPoop.privacy,
  placeName: mongoPoop.placeName,
  customLocation: mongoPoop.customLocation,
  address: mongoPoop.address
});

const convertPoopToMongoPoop = (poop: Poop): Omit<MongoPoop, '_id' | 'createdAt' | 'updatedAt'> => ({
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
  address: poop.address
});

const convertMongoFriendToFriend = (mongoFriend: MongoFriend): Friend => ({
  id: mongoFriend.friendEmail,
  name: mongoFriend.friendName,
  email: mongoFriend.friendEmail,
  picture: mongoFriend.friendPicture,
  status: mongoFriend.status as 'pending' | 'accepted' | 'blocked',
  addedAt: mongoFriend.addedAt
});

const convertMongoFriendRequestToFriendRequest = (mongoRequest: MongoFriendRequest): FriendRequest => ({
  id: mongoRequest.id,
  fromUserId: mongoRequest.fromUserId,
  fromUserName: mongoRequest.fromUserName,
  fromUserEmail: mongoRequest.fromUserEmail,
  fromUserPicture: mongoRequest.fromUserPicture,
  toUserEmail: mongoRequest.toUserEmail,
  status: mongoRequest.status,
  timestamp: mongoRequest.timestamp
});

// 便便相關操作
export const savePoopToMongoDB = async (poop: Poop): Promise<string> => {
  try {
    await initMongoDB();
    const collection = getCollection(COLLECTIONS.POOPS);
    if (!collection) throw new Error('MongoDB not connected');

    const mongoPoop: MongoPoop = {
      ...convertPoopToMongoPoop(poop),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(mongoPoop as any);
    console.log('✅ Poop saved to MongoDB:', result.insertedId);
    return result.insertedId.toString();
  } catch (error) {
    console.error('❌ Failed to save poop to MongoDB:', error);
    throw error;
  }
};

export const getUserPoopsFromMongoDB = async (userEmail: string): Promise<Poop[]> => {
  try {
    await initMongoDB();
    const collection = getCollection(COLLECTIONS.POOPS);
    if (!collection) throw new Error('MongoDB not connected');

    const cursor = collection.find({ userId: userEmail }).sort({ timestamp: -1 });
    const mongoPoops = await cursor.toArray() as any as MongoPoop[];

    const poops = mongoPoops.map(convertMongoPoopToPoop);
    console.log(`✅ Fetched ${poops.length} poops for user ${userEmail} from MongoDB`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch user poops from MongoDB:', error);
    throw error;
  }
};

export const getFriendsPoopsFromMongoDB = async (friendEmails: string[]): Promise<Poop[]> => {
  if (friendEmails.length === 0) return [];

  try {
    await initMongoDB();
    const collection = getCollection(COLLECTIONS.POOPS);
    if (!collection) throw new Error('MongoDB not connected');

    const cursor = collection.find({
      userId: { $in: friendEmails },
      privacy: { $in: ['friends', 'public'] }
    }).sort({ timestamp: -1 });

    const mongoPoops = await cursor.toArray() as any as MongoPoop[];
    const poops = mongoPoops.map(convertMongoPoopToPoop);
    console.log(`✅ Fetched ${poops.length} friends poops from MongoDB`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch friends poops from MongoDB:', error);
    throw error;
  }
};

// 公開便便查詢緩存
let publicPoopsCache: { data: Poop[]; timestamp: number } | null = null;
const PUBLIC_POOPS_CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘緩存

export const getPublicPoopsFromMongoDB = async (): Promise<Poop[]> => {
  // 使用緩存，減少 API 調用
  if (publicPoopsCache && 
      Date.now() - publicPoopsCache.timestamp < PUBLIC_POOPS_CACHE_DURATION) {
    console.log(`✅ Using cached public poops (${publicPoopsCache.data.length} items)`);
    return publicPoopsCache.data;
  }

  try {
    await initMongoDB();
    const collection = getCollection(COLLECTIONS.POOPS);
    if (!collection) throw new Error('MongoDB not connected');

    const cursor = collection.find({ privacy: 'public' })
      .sort({ timestamp: -1 })
      .limit(50); // 限制數量

    const mongoPoops = await cursor.toArray() as any as MongoPoop[];
    const poops = mongoPoops.map(convertMongoPoopToPoop);

    // 緩存結果
    publicPoopsCache = {
      data: poops,
      timestamp: Date.now()
    };

    console.log(`✅ Fetched ${poops.length} public poops from MongoDB (cached for 5min)`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch public poops from MongoDB:', error);
    throw error;
  }
};

// 好友相關操作
export const saveFriendToMongoDB = async (userEmail: string, friend: Friend): Promise<string> => {
  try {
    await initMongoDB();
    const collection = getCollection(COLLECTIONS.FRIENDS);
    if (!collection) throw new Error('MongoDB not connected');

    const mongoFriend: MongoFriend = {
      id: `${userEmail}_${friend.email}`,
      userId: userEmail,
      friendEmail: friend.email,
      friendName: friend.name,
      friendPicture: friend.picture,
      status: friend.status as 'pending' | 'accepted' | 'rejected' | 'blocked',
      addedAt: friend.addedAt,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.replaceOne(
      { userId: userEmail, friendEmail: friend.email },
      mongoFriend,
      { upsert: true }
    );

    console.log('✅ Friend saved to MongoDB:', result.upsertedId || 'updated');
    return result.upsertedId?.toString() || mongoFriend.id;
  } catch (error) {
    console.error('❌ Failed to save friend to MongoDB:', error);
    throw error;
  }
};

export const getUserFriendsFromMongoDB = async (userEmail: string): Promise<Friend[]> => {
  try {
    await initMongoDB();
    const collection = getCollection(COLLECTIONS.FRIENDS);
    if (!collection) throw new Error('MongoDB not connected');

    const cursor = collection.find({ 
      userId: userEmail, 
      status: 'accepted' 
    });

    const mongoFriends = await cursor.toArray() as any as MongoFriend[];
    const friends = mongoFriends.map(convertMongoFriendToFriend);
    console.log(`✅ Fetched ${friends.length} friends for user ${userEmail} from MongoDB`);
    return friends;
  } catch (error) {
    console.error('❌ Failed to fetch user friends from MongoDB:', error);
    throw error;
  }
};

// 好友請求相關操作
export const sendFriendRequestToMongoDB = async (request: FriendRequest): Promise<string> => {
  try {
    await initMongoDB();
    const collection = getCollection(COLLECTIONS.FRIEND_REQUESTS);
    if (!collection) throw new Error('MongoDB not connected');

    const mongoRequest: MongoFriendRequest = {
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

    const result = await collection.insertOne(mongoRequest as any);
    console.log('✅ Friend request sent to MongoDB:', result.insertedId);
    return result.insertedId.toString();
  } catch (error) {
    console.error('❌ Failed to send friend request to MongoDB:', error);
    throw error;
  }
};

export const getUserFriendRequestsFromMongoDB = async (userEmail: string): Promise<FriendRequest[]> => {
  try {
    await initMongoDB();
    const collection = getCollection(COLLECTIONS.FRIEND_REQUESTS);
    if (!collection) throw new Error('MongoDB not connected');

    const cursor = collection.find({
      toUserEmail: userEmail,
      status: 'pending'
    }).sort({ timestamp: -1 });

    const mongoRequests = await cursor.toArray() as any as MongoFriendRequest[];
    const requests = mongoRequests.map(convertMongoFriendRequestToFriendRequest);
    console.log(`✅ Fetched ${requests.length} friend requests for user ${userEmail} from MongoDB`);
    return requests;
  } catch (error) {
    console.error('❌ Failed to fetch friend requests from MongoDB:', error);
    throw error;
  }
};

export const updateFriendRequestStatusInMongoDB = async (requestId: string, status: 'accepted' | 'rejected'): Promise<void> => {
  try {
    await initMongoDB();
    const collection = getCollection(COLLECTIONS.FRIEND_REQUESTS);
    if (!collection) throw new Error('MongoDB not connected');

    const result = await collection.updateOne(
      { id: requestId },
      { 
        $set: { 
          status, 
          updatedAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      throw new Error(`Friend request ${requestId} not found`);
    }

    console.log(`✅ Friend request ${requestId} status updated to ${status} in MongoDB`);
  } catch (error) {
    console.error('❌ Failed to update friend request status in MongoDB:', error);
    throw error;
  }
};

// MongoDB 不支持實時訂閱，這裡提供輪詢替代方案
export const subscribeToUserPoopsInMongoDB = (userEmail: string, callback: (poops: Poop[]) => void) => {
  console.log(`🔄 Setting up polling subscription for user poops: ${userEmail}`);
  
  let lastCheck = Date.now();
  
  const pollForChanges = async () => {
    try {
      const collection = getCollection(COLLECTIONS.POOPS);
      if (!collection) return;

      // 只查詢最近更新的記錄
      const cursor = collection.find({
        userId: userEmail,
        updatedAt: { $gte: new Date(lastCheck) }
      }).sort({ timestamp: -1 });

      const mongoPoops = await cursor.toArray() as any as MongoPoop[];
      
      if (mongoPoops.length > 0) {
        // 獲取所有用戶便便
        const allPoops = await getUserPoopsFromMongoDB(userEmail);
        callback(allPoops);
        console.log(`🔄 MongoDB polling: Found ${mongoPoops.length} new/updated poops`);
      }
      
      lastCheck = Date.now();
    } catch (error) {
      console.error('❌ Error in MongoDB polling:', error);
    }
  };

  // 每 30 秒輪詢一次 (比實時訂閱慢，但減少資源使用)
  const interval = setInterval(pollForChanges, 30000);

  return () => {
    console.log(`🔄 Stopping polling for user poops: ${userEmail}`);
    clearInterval(interval);
  };
};

export const subscribeToFriendRequestsInMongoDB = (userEmail: string, callback: (requests: FriendRequest[]) => void) => {
  console.log(`🔄 Setting up polling subscription for friend requests: ${userEmail}`);
  
  let lastCheck = Date.now();
  
  const pollForChanges = async () => {
    try {
      const collection = getCollection(COLLECTIONS.FRIEND_REQUESTS);
      if (!collection) return;

      // 只查詢最近更新的記錄
      const cursor = collection.find({
        toUserEmail: userEmail,
        updatedAt: { $gte: new Date(lastCheck) }
      });

      const mongoRequests = await cursor.toArray() as any as MongoFriendRequest[];
      
      if (mongoRequests.length > 0) {
        // 獲取所有待處理的好友請求
        const allRequests = await getUserFriendRequestsFromMongoDB(userEmail);
        callback(allRequests);
        console.log(`🔄 MongoDB polling: Found ${mongoRequests.length} new/updated friend requests`);
      }
      
      lastCheck = Date.now();
    } catch (error) {
      console.error('❌ Error in MongoDB friend requests polling:', error);
    }
  };

  // 每 60 秒輪詢一次
  const interval = setInterval(pollForChanges, 60000);

  return () => {
    console.log(`🔄 Stopping polling for friend requests: ${userEmail}`);
    clearInterval(interval);
  };
};