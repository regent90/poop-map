// MongoDB 後端 API 服務
import { Poop, Friend, FriendRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// 通用 API 調用函數
const callAPI = async (endpoint: string, options: RequestInit = {}) => {
  const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : `/api${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'API call failed');
  }

  return result;
};

// 連接檢查緩存
let connectionCheckCache: { result: boolean; timestamp: number } | null = null;
const CONNECTION_CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘緩存

// 檢查 MongoDB 後端連接
export const checkMongoBackendConnection = async (): Promise<boolean> => {
  // 使用緩存結果，避免頻繁檢查
  if (connectionCheckCache && 
      Date.now() - connectionCheckCache.timestamp < CONNECTION_CACHE_DURATION) {
    console.log('✅ Using cached MongoDB backend connection status:', connectionCheckCache.result);
    return connectionCheckCache.result;
  }

  try {
    // 嘗試調用測試 API 來檢查連接
    const url = API_BASE_URL ? `${API_BASE_URL}/test` : `/api/test`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API test failed: ${response.status}`);
    }

    const result = await response.json();
    
    // 檢查是否有 MongoDB URI 配置
    const hasMongoConfig = result.environment?.hasMongoUri;
    
    if (!hasMongoConfig) {
      throw new Error('MongoDB URI not configured in backend');
    }
    
    connectionCheckCache = {
      result: true,
      timestamp: Date.now()
    };
    
    console.log('✅ MongoDB backend connection successful (cached for 5min)');
    return true;
  } catch (error) {
    console.warn('🔴 MongoDB backend connection test failed:', error);
    connectionCheckCache = {
      result: false,
      timestamp: Date.now()
    };
    return false;
  }
};

// 便便相關操作
export const savePoopToBackend = async (poop: Poop): Promise<string> => {
  try {
    // 檢查圖片大小
    if (poop.photo) {
      const photoSize = poop.photo.length;
      console.log(`📸 Photo size: ${(photoSize / 1024).toFixed(1)} KB`);
      
      if (photoSize > 5 * 1024 * 1024) { // 5MB 警告
        console.warn('⚠️ Large photo detected, may cause MongoDB size limit issues');
      }
    }

    const result = await callAPI('/poops', {
      method: 'POST',
      body: JSON.stringify(poop)
    });

    console.log('✅ Poop saved to MongoDB backend:', result.insertedId);
    return result.insertedId;
  } catch (error: any) {
    console.error('❌ Failed to save poop to MongoDB backend:', error);
    
    // 檢查是否是大小限制錯誤
    if (error.message && (
      error.message.includes('413') || 
      error.message.includes('too large') ||
      error.message.includes('DOCUMENT_TOO_LARGE') ||
      error.message.includes('BSON_TOO_LARGE')
    )) {
      throw new Error('圖片太大無法存儲到 MongoDB。請使用較小的圖片或壓縮後再試。');
    }
    
    throw error;
  }
};

export const getUserPoopsFromBackend = async (userEmail: string): Promise<Poop[]> => {
  try {
    const result = await callAPI(`/poops?userId=${encodeURIComponent(userEmail)}`);
    
    const poops = result.data.map((doc: any) => ({
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

    console.log(`✅ Fetched ${poops.length} poops for user ${userEmail} from MongoDB backend`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch user poops from MongoDB backend:', error);
    throw error;
  }
};

export const getFriendsPoopsFromBackend = async (friendEmails: string[]): Promise<Poop[]> => {
  if (friendEmails.length === 0) return [];

  try {
    const emailsParam = friendEmails.map(email => `friendEmails=${encodeURIComponent(email)}`).join('&');
    const result = await callAPI(`/poops?${emailsParam}`);

    const poops = result.data.map((doc: any) => ({
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

    console.log(`✅ Fetched ${poops.length} friends poops from MongoDB backend`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch friends poops from MongoDB backend:', error);
    throw error;
  }
};

// 公開便便查詢緩存
let publicPoopsCache: { data: Poop[]; timestamp: number } | null = null;
const PUBLIC_POOPS_CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘緩存

export const getPublicPoopsFromBackend = async (): Promise<Poop[]> => {
  // 使用緩存，減少 API 調用
  if (publicPoopsCache && 
      Date.now() - publicPoopsCache.timestamp < PUBLIC_POOPS_CACHE_DURATION) {
    console.log(`✅ Using cached public poops (${publicPoopsCache.data.length} items)`);
    return publicPoopsCache.data;
  }

  try {
    const result = await callAPI('/poops?privacy=public');

    const poops = result.data.map((doc: any) => ({
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

    console.log(`✅ Fetched ${poops.length} public poops from MongoDB backend (cached for 5min)`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch public poops from MongoDB backend:', error);
    throw error;
  }
};

// 好友相關操作
export const saveFriendToBackend = async (userEmail: string, friend: Friend): Promise<string> => {
  try {
    const friendData = {
      id: `${userEmail}_${friend.email}`,
      userId: userEmail,
      friendEmail: friend.email,
      friendName: friend.name,
      friendPicture: friend.picture,
      status: friend.status,
      addedAt: friend.addedAt
    };

    const result = await callAPI('/friends', {
      method: 'POST',
      body: JSON.stringify(friendData)
    });

    console.log('✅ Friend saved to MongoDB backend');
    return friendData.id;
  } catch (error) {
    console.error('❌ Failed to save friend to MongoDB backend:', error);
    throw error;
  }
};

export const getUserFriendsFromBackend = async (userEmail: string): Promise<Friend[]> => {
  try {
    const result = await callAPI(`/friends?userId=${encodeURIComponent(userEmail)}&status=accepted`);

    const friends = result.data.map((doc: any) => ({
      id: doc.friendEmail,
      name: doc.friendName,
      email: doc.friendEmail,
      picture: doc.friendPicture,
      status: doc.status as 'pending' | 'accepted' | 'blocked',
      addedAt: doc.addedAt
    })) as Friend[];

    console.log(`✅ Fetched ${friends.length} friends for user ${userEmail} from MongoDB backend`);
    return friends;
  } catch (error) {
    console.error('❌ Failed to fetch user friends from MongoDB backend:', error);
    throw error;
  }
};

// 好友請求相關操作
export const sendFriendRequestToBackend = async (request: FriendRequest): Promise<string> => {
  try {
    const result = await callAPI('/friend-requests', {
      method: 'POST',
      body: JSON.stringify(request)
    });

    console.log('✅ Friend request sent to MongoDB backend:', result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error('❌ Failed to send friend request to MongoDB backend:', error);
    throw error;
  }
};

export const getUserFriendRequestsFromBackend = async (userEmail: string): Promise<FriendRequest[]> => {
  try {
    const result = await callAPI(`/friend-requests?toUserEmail=${encodeURIComponent(userEmail)}&status=pending`);

    const requests = result.data.map((doc: any) => ({
      id: doc.id,
      fromUserId: doc.fromUserId,
      fromUserName: doc.fromUserName,
      fromUserEmail: doc.fromUserEmail,
      fromUserPicture: doc.fromUserPicture,
      toUserEmail: doc.toUserEmail,
      status: doc.status,
      timestamp: doc.timestamp
    })) as FriendRequest[];

    console.log(`✅ Fetched ${requests.length} friend requests for user ${userEmail} from MongoDB backend`);
    return requests;
  } catch (error) {
    console.error('❌ Failed to fetch friend requests from MongoDB backend:', error);
    throw error;
  }
};

export const updateFriendRequestStatusInBackend = async (requestId: string, status: 'accepted' | 'rejected'): Promise<void> => {
  try {
    const result = await callAPI('/friend-requests', {
      method: 'PUT',
      body: JSON.stringify({ id: requestId, status })
    });

    if (result.matchedCount === 0) {
      throw new Error(`Friend request ${requestId} not found`);
    }

    console.log(`✅ Friend request ${requestId} status updated to ${status} in MongoDB backend`);
  } catch (error) {
    console.error('❌ Failed to update friend request status in MongoDB backend:', error);
    throw error;
  }
};

// 訂閱相關操作（使用輪詢）
export const subscribeToUserPoopsInBackend = (userEmail: string, callback: (poops: Poop[]) => void) => {
  console.log(`🔄 Setting up polling subscription for user poops: ${userEmail}`);
  
  const pollForChanges = async () => {
    try {
      const poops = await getUserPoopsFromBackend(userEmail);
      callback(poops);
    } catch (error) {
      console.error('❌ Error in MongoDB backend polling:', error);
    }
  };

  // 每 30 秒輪詢一次
  const interval = setInterval(pollForChanges, 30000);

  return () => {
    console.log(`🔄 Stopping polling for user poops: ${userEmail}`);
    clearInterval(interval);
  };
};

export const subscribeToFriendRequestsInBackend = (userEmail: string, callback: (requests: FriendRequest[]) => void) => {
  console.log(`🔄 Setting up polling subscription for friend requests: ${userEmail}`);
  
  const pollForChanges = async () => {
    try {
      const requests = await getUserFriendRequestsFromBackend(userEmail);
      callback(requests);
    } catch (error) {
      console.error('❌ Error in MongoDB backend friend requests polling:', error);
    }
  };

  // 每 60 秒輪詢一次
  const interval = setInterval(pollForChanges, 60000);

  return () => {
    console.log(`🔄 Stopping polling for friend requests: ${userEmail}`);
    clearInterval(interval);
  };
};

// 留言相關操作
export const addCommentToBackend = async (poopId: string, userId: string, userEmail: string, userName: string, content: string, userPicture?: string): Promise<string> => {
  try {
    const result = await callAPI('/comments', {
      method: 'POST',
      body: JSON.stringify({
        poopId,
        userId,
        userEmail,
        userName,
        content,
        userPicture
      })
    });

    console.log('✅ Comment added to MongoDB backend:', result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error('❌ Failed to add comment to MongoDB backend:', error);
    throw error;
  }
};

export const getCommentsFromBackend = async (poopId: string): Promise<any[]> => {
  try {
    const result = await callAPI(`/comments?poopId=${encodeURIComponent(poopId)}`);
    
    console.log(`✅ Fetched ${result.data.length} comments for poop ${poopId} from MongoDB backend`);
    return result.data;
  } catch (error) {
    console.error('❌ Failed to fetch comments from MongoDB backend:', error);
    throw error;
  }
};

export const deleteCommentFromBackend = async (commentId: string): Promise<void> => {
  try {
    const result = await callAPI(`/comments?commentId=${encodeURIComponent(commentId)}`, {
      method: 'DELETE'
    });

    console.log('✅ Comment deleted from MongoDB backend:', commentId);
  } catch (error) {
    console.error('❌ Failed to delete comment from MongoDB backend:', error);
    throw error;
  }
};

// 按讚相關操作
export const addLikeToBackend = async (poopId: string, userId: string, userEmail: string, userName: string, userPicture?: string): Promise<string> => {
  try {
    const result = await callAPI('/likes', {
      method: 'POST',
      body: JSON.stringify({
        poopId,
        userId,
        userEmail,
        userName,
        userPicture
      })
    });

    console.log('✅ Like added to MongoDB backend:', result.insertedId);
    return result.insertedId;
  } catch (error: any) {
    if (error.message && error.message.includes('ALREADY_LIKED')) {
      throw new Error('已經按過讚了');
    }
    console.error('❌ Failed to add like to MongoDB backend:', error);
    throw error;
  }
};

export const getLikesFromBackend = async (poopId: string): Promise<any[]> => {
  try {
    const result = await callAPI(`/likes?poopId=${encodeURIComponent(poopId)}`);
    
    console.log(`✅ Fetched ${result.data.length} likes for poop ${poopId} from MongoDB backend`);
    return result.data;
  } catch (error) {
    console.error('❌ Failed to fetch likes from MongoDB backend:', error);
    throw error;
  }
};

export const removeLikeFromBackend = async (poopId: string, userId: string): Promise<void> => {
  try {
    const result = await callAPI(`/likes?poopId=${encodeURIComponent(poopId)}&userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE'
    });

    console.log('✅ Like removed from MongoDB backend:', { poopId, userId });
  } catch (error) {
    console.error('❌ Failed to remove like from MongoDB backend:', error);
    throw error;
  }
};

// 實時監聽便便的互動數據（使用輪詢）
export const subscribeToPoopInteractionsInBackend = (poopId: string, callback: (data: { likes: any[], comments: any[] }) => void) => {
  console.log(`🔄 Setting up polling subscription for poop interactions: ${poopId}`);
  
  const pollForChanges = async () => {
    try {
      const [likes, comments] = await Promise.all([
        getLikesFromBackend(poopId),
        getCommentsFromBackend(poopId)
      ]);
      
      callback({ likes, comments });
    } catch (error) {
      console.error('❌ Error in MongoDB backend interactions polling:', error);
    }
  };

  // 立即執行一次
  pollForChanges();

  // 每 30 秒輪詢一次
  const interval = setInterval(pollForChanges, 30000);

  return () => {
    console.log(`🔄 Stopping polling for poop interactions: ${poopId}`);
    clearInterval(interval);
  };
};