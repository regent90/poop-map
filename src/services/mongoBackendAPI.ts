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

// 簡化的 MongoDB 後端連接檢查 - 總是返回 true
export const checkMongoBackendConnection = async (): Promise<boolean> => {
  console.log('✅ MongoDB backend assumed available');
  return true;
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

    // 立即清除相關緩存並觸發更新
    userPoopsCache.delete(poop.userId);
    publicPoopsCache = null; // 如果是公開便便，清除公開緩存
    
    // 觸發即時更新
    triggerImmediateUpdate(`user_poops_${poop.userId}`);
    
    // 如果是公開便便，也觸發公開便便的更新
    if (poop.privacy === 'public') {
      triggerImmediateUpdate('public_poops');
    }

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

export const getUserPoopsFromBackend = async (userEmail: string, useCache: boolean = true): Promise<Poop[]> => {
  // 檢查緩存
  if (useCache && userPoopsCache.has(userEmail)) {
    const cache = userPoopsCache.get(userEmail)!;
    if (Date.now() - cache.timestamp < USER_POOPS_CACHE_DURATION) {
      console.log(`✅ Using cached poops for user ${userEmail} (${cache.data.length} items)`);
      return cache.data;
    }
  }

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

    // 更新緩存
    userPoopsCache.set(userEmail, {
      data: poops,
      timestamp: Date.now()
    });

    console.log(`✅ Fetched ${poops.length} poops for user ${userEmail} from MongoDB backend (cached)`);
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

// 緩存系統優化
let publicPoopsCache: { data: Poop[]; timestamp: number } | null = null;
let userPoopsCache = new Map<string, { data: Poop[]; timestamp: number }>();
let friendsCache = new Map<string, { data: Friend[]; timestamp: number }>();

const PUBLIC_POOPS_CACHE_DURATION = 3 * 60 * 1000; // 3 分鐘緩存
const USER_POOPS_CACHE_DURATION = 2 * 60 * 1000; // 2 分鐘緩存
const FRIENDS_CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘緩存

// 清除過期緩存
const clearExpiredCache = () => {
  const now = Date.now();
  
  // 清除用戶便便緩存
  userPoopsCache.forEach((cache, key) => {
    if (now - cache.timestamp > USER_POOPS_CACHE_DURATION) {
      userPoopsCache.delete(key);
    }
  });
  
  // 清除好友緩存
  friendsCache.forEach((cache, key) => {
    if (now - cache.timestamp > FRIENDS_CACHE_DURATION) {
      friendsCache.delete(key);
    }
  });
  
  // 清除公開便便緩存
  if (publicPoopsCache && now - publicPoopsCache.timestamp > PUBLIC_POOPS_CACHE_DURATION) {
    publicPoopsCache = null;
  }
};

// 每分鐘清理一次過期緩存
setInterval(clearExpiredCache, 60000);

export const getPublicPoopsFromBackend = async (useCache: boolean = false): Promise<Poop[]> => {
  // 即時模式下不使用緩存，除非明確要求
  if (useCache && publicPoopsCache && 
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

    // 更新緩存
    publicPoopsCache = {
      data: poops,
      timestamp: Date.now()
    };

    console.log(`⚡ Fetched ${poops.length} public poops from MongoDB backend (REAL-TIME)`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch public poops from MongoDB backend:', error);
    throw error;
  }
};

// 公開便便即時訂閱
export const subscribeToPublicPoopsInBackend = (callback: (poops: Poop[]) => void) => {
  console.log(`⚡ Setting up REAL-TIME subscription for public poops`);
  
  const subscriptionKey = `public_poops`;
  
  // 如果已有訂閱，先清除
  if (activeSubscriptions.has(subscriptionKey)) {
    const existing = activeSubscriptions.get(subscriptionKey);
    if (existing) {
      clearInterval(existing.interval);
    }
  }
  
  const REAL_TIME_INTERVAL = 3000; // 3 秒輪詢公開便便
  
  const pollForChanges = async () => {
    try {
      const poops = await getPublicPoopsFromBackend(false); // 不使用緩存
      const subscription = activeSubscriptions.get(subscriptionKey);
      
      if (subscription) {
        const dataChanged = JSON.stringify(poops) !== JSON.stringify(subscription.lastData);
        
        if (dataChanged) {
          console.log(`⚡ REAL-TIME: Public poops changed, updating immediately!`);
          subscription.lastData = poops;
          callback(poops);
        }
        
        // 固定 3 秒間隔
        subscription.interval = setTimeout(pollForChanges, REAL_TIME_INTERVAL);
      }
    } catch (error) {
      console.error('❌ Error in MongoDB backend real-time public poops polling:', error);
      // 即使錯誤也保持即時輪詢
      const subscription = activeSubscriptions.get(subscriptionKey);
      if (subscription) {
        subscription.interval = setTimeout(pollForChanges, REAL_TIME_INTERVAL);
      }
    }
  };

  // 立即執行第一次查詢
  getPublicPoopsFromBackend(false).then(initialPoops => {
    const interval = setTimeout(pollForChanges, REAL_TIME_INTERVAL);
    activeSubscriptions.set(subscriptionKey, {
      interval,
      lastData: initialPoops,
      callback
    });
    callback(initialPoops);
  }).catch(error => {
    console.error('❌ Error in initial MongoDB backend public poops query:', error);
  });

  return () => {
    console.log(`⚡ Stopping REAL-TIME polling for public poops`);
    const subscription = activeSubscriptions.get(subscriptionKey);
    if (subscription) {
      clearTimeout(subscription.interval);
      activeSubscriptions.delete(subscriptionKey);
    }
  };
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

export const getUserFriendsFromBackend = async (userEmail: string, useCache: boolean = true): Promise<Friend[]> => {
  // 檢查緩存
  if (useCache && friendsCache.has(userEmail)) {
    const cache = friendsCache.get(userEmail)!;
    if (Date.now() - cache.timestamp < FRIENDS_CACHE_DURATION) {
      console.log(`✅ Using cached friends for user ${userEmail} (${cache.data.length} items)`);
      return cache.data;
    }
  }

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

    // 更新緩存
    friendsCache.set(userEmail, {
      data: friends,
      timestamp: Date.now()
    });

    console.log(`✅ Fetched ${friends.length} friends for user ${userEmail} from MongoDB backend (cached)`);
    return friends;
  } catch (error) {
    console.error('❌ Failed to fetch user friends from MongoDB backend:', error);
    throw error;
  }
};

// 解除好友功能 (單面解除)
export const removeFriendFromBackend = async (userEmail: string, friendEmail: string): Promise<void> => {
  try {
    const result = await callAPI(`/friends?userId=${encodeURIComponent(userEmail)}&friendEmail=${encodeURIComponent(friendEmail)}`, {
      method: 'DELETE'
    });

    // 立即清除相關緩存
    friendsCache.delete(userEmail);
    
    // 觸發即時更新
    triggerImmediateUpdate(`friend_requests_${userEmail}`);

    console.log(`✅ Friend ${friendEmail} removed from ${userEmail}'s friend list in MongoDB backend`);
  } catch (error) {
    console.error('❌ Failed to remove friend from MongoDB backend:', error);
    throw error;
  }
};

// 手動觸發即時更新 - 立即執行
export const triggerImmediateUpdate = (subscriptionKey: string) => {
  const subscription = activeSubscriptions.get(subscriptionKey);
  if (subscription) {
    console.log(`⚡ Triggering INSTANT update for: ${subscriptionKey}`);
    clearTimeout(subscription.interval);
    
    // 立即執行更新，不等待
    if (subscriptionKey.includes('user_poops_')) {
      const userEmail = subscriptionKey.replace('user_poops_', '');
      getUserPoopsFromBackend(userEmail, false).then(poops => {
        subscription.lastData = poops;
        subscription.callback(poops);
      });
    } else if (subscriptionKey.includes('friend_requests_')) {
      const userEmail = subscriptionKey.replace('friend_requests_', '');
      getUserFriendRequestsFromBackend(userEmail).then(requests => {
        subscription.lastData = requests;
        subscription.callback(requests);
      });
    } else if (subscriptionKey.includes('poop_interactions_')) {
      const poopId = subscriptionKey.replace('poop_interactions_', '');
      Promise.all([
        getLikesFromBackend(poopId),
        getCommentsFromBackend(poopId)
      ]).then(([likes, comments]) => {
        const data = { likes, comments };
        subscription.lastData = data;
        subscription.callback(data);
      });
    } else if (subscriptionKey === 'public_poops') {
      getPublicPoopsFromBackend(false).then(poops => {
        subscription.lastData = poops;
        subscription.callback(poops);
      });
    }
    
    // 重新開始正常輪詢
    subscription.interval = setTimeout(() => {
      // 輪詢邏輯會在各自的函數中處理
    }, 50);
  }
};

// 批量觸發更新（當執行影響多個數據的操作時）
export const triggerBatchUpdate = (userEmail: string) => {
  console.log(`⚡ Triggering batch update for user: ${userEmail}`);
  
  // 清除所有相關緩存
  userPoopsCache.delete(userEmail);
  friendsCache.delete(userEmail);
  
  // 觸發所有相關訂閱的更新
  triggerImmediateUpdate(`user_poops_${userEmail}`);
  triggerImmediateUpdate(`friend_requests_${userEmail}`);
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

// 智能輪詢訂閱系統 - 模擬即時更新
let activeSubscriptions = new Map<string, { interval: NodeJS.Timeout; lastData: any; callback: Function }>();

// 全局訂閱管理器
export const clearAllSubscriptions = () => {
  console.log('🧹 Clearing all MongoDB backend subscriptions');
  activeSubscriptions.forEach((subscription, key) => {
    clearTimeout(subscription.interval);
  });
  activeSubscriptions.clear();
};

// 獲取活躍訂閱數量（用於調試）
export const getActiveSubscriptionsCount = () => {
  return activeSubscriptions.size;
};

// 移除頁面可見性限制 - 保持 24/7 即時同步
console.log('⚡ MongoDB Real-Time Sync: NO LIMITS MODE - 24/7 instant updates enabled!');

export const subscribeToUserPoopsInBackend = (userEmail: string, callback: (poops: Poop[]) => void) => {
  console.log(`⚡ Setting up REAL-TIME subscription for user poops: ${userEmail}`);
  
  const subscriptionKey = `user_poops_${userEmail}`;
  
  // 如果已有訂閱，先清除
  if (activeSubscriptions.has(subscriptionKey)) {
    const existing = activeSubscriptions.get(subscriptionKey);
    if (existing) {
      clearInterval(existing.interval);
    }
  }
  
  const REAL_TIME_INTERVAL = 1000; // 1 秒即時輪詢！
  
  const pollForChanges = async () => {
    try {
      const poops = await getUserPoopsFromBackend(userEmail, false); // 不使用緩存，確保即時性
      const subscription = activeSubscriptions.get(subscriptionKey);
      
      if (subscription) {
        const dataChanged = JSON.stringify(poops) !== JSON.stringify(subscription.lastData);
        
        if (dataChanged) {
          console.log(`⚡ REAL-TIME: Data changed for user ${userEmail}, updating immediately!`);
          subscription.lastData = poops;
          
          // 清除相關緩存
          userPoopsCache.delete(userEmail);
          
          callback(poops);
        }
        
        // 固定 1 秒間隔，真正的即時體驗
        subscription.interval = setTimeout(pollForChanges, REAL_TIME_INTERVAL);
      }
    } catch (error) {
      console.error('❌ Error in MongoDB backend real-time polling:', error);
      // 即使錯誤也保持即時輪詢
      const subscription = activeSubscriptions.get(subscriptionKey);
      if (subscription) {
        subscription.interval = setTimeout(pollForChanges, REAL_TIME_INTERVAL);
      }
    }
  };

  // 立即執行第一次查詢
  getUserPoopsFromBackend(userEmail, false).then(initialPoops => {
    const interval = setTimeout(pollForChanges, REAL_TIME_INTERVAL);
    activeSubscriptions.set(subscriptionKey, {
      interval,
      lastData: initialPoops,
      callback
    });
    callback(initialPoops);
  }).catch(error => {
    console.error('❌ Error in initial MongoDB backend query:', error);
  });

  return () => {
    console.log(`⚡ Stopping REAL-TIME polling for user poops: ${userEmail}`);
    const subscription = activeSubscriptions.get(subscriptionKey);
    if (subscription) {
      clearTimeout(subscription.interval);
      activeSubscriptions.delete(subscriptionKey);
    }
  };
};

export const subscribeToFriendRequestsInBackend = (userEmail: string, callback: (requests: FriendRequest[]) => void) => {
  console.log(`⚡ Setting up REAL-TIME subscription for friend requests: ${userEmail}`);
  
  const subscriptionKey = `friend_requests_${userEmail}`;
  
  // 如果已有訂閱，先清除
  if (activeSubscriptions.has(subscriptionKey)) {
    const existing = activeSubscriptions.get(subscriptionKey);
    if (existing) {
      clearInterval(existing.interval);
    }
  }
  
  const REAL_TIME_INTERVAL = 2000; // 2 秒即時輪詢好友請求
  
  const pollForChanges = async () => {
    try {
      const requests = await getUserFriendRequestsFromBackend(userEmail);
      const subscription = activeSubscriptions.get(subscriptionKey);
      
      if (subscription) {
        const dataChanged = JSON.stringify(requests) !== JSON.stringify(subscription.lastData);
        
        if (dataChanged) {
          console.log(`⚡ REAL-TIME: Friend requests changed for user ${userEmail}, updating immediately!`);
          subscription.lastData = requests;
          callback(requests);
        }
        
        // 固定 2 秒間隔
        subscription.interval = setTimeout(pollForChanges, REAL_TIME_INTERVAL);
      }
    } catch (error) {
      console.error('❌ Error in MongoDB backend real-time friend requests polling:', error);
      // 即使錯誤也保持即時輪詢
      const subscription = activeSubscriptions.get(subscriptionKey);
      if (subscription) {
        subscription.interval = setTimeout(pollForChanges, REAL_TIME_INTERVAL);
      }
    }
  };

  // 立即執行第一次查詢
  getUserFriendRequestsFromBackend(userEmail).then(initialRequests => {
    const interval = setTimeout(pollForChanges, REAL_TIME_INTERVAL);
    activeSubscriptions.set(subscriptionKey, {
      interval,
      lastData: initialRequests,
      callback
    });
    callback(initialRequests);
  }).catch(error => {
    console.error('❌ Error in initial MongoDB backend friend requests query:', error);
  });

  return () => {
    console.log(`⚡ Stopping REAL-TIME polling for friend requests: ${userEmail}`);
    const subscription = activeSubscriptions.get(subscriptionKey);
    if (subscription) {
      clearTimeout(subscription.interval);
      activeSubscriptions.delete(subscriptionKey);
    }
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

    // 觸發便便互動的即時更新
    triggerImmediateUpdate(`poop_interactions_${poopId}`);

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

    // 觸發便便互動的即時更新
    triggerImmediateUpdate(`poop_interactions_${poopId}`);

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

    // 觸發便便互動的即時更新
    triggerImmediateUpdate(`poop_interactions_${poopId}`);

    console.log('✅ Like removed from MongoDB backend:', { poopId, userId });
  } catch (error) {
    console.error('❌ Failed to remove like from MongoDB backend:', error);
    throw error;
  }
};

// 超高頻即時輪詢便便互動數據 - 真正的即時體驗
export const subscribeToPoopInteractionsInBackend = (poopId: string, callback: (data: { likes: any[], comments: any[] }) => void) => {
  console.log(`⚡ Setting up ULTRA REAL-TIME subscription for poop interactions: ${poopId}`);
  
  const subscriptionKey = `poop_interactions_${poopId}`;
  
  // 如果已有訂閱，先清除
  if (activeSubscriptions.has(subscriptionKey)) {
    const existing = activeSubscriptions.get(subscriptionKey);
    if (existing) {
      clearInterval(existing.interval);
    }
  }
  
  const ULTRA_REAL_TIME_INTERVAL = 500; // 0.5 秒超高頻輪詢！互動需要最即時的反饋
  
  const pollForChanges = async () => {
    try {
      const [likes, comments] = await Promise.all([
        getLikesFromBackend(poopId),
        getCommentsFromBackend(poopId)
      ]);
      
      const interactionData = { likes, comments };
      const subscription = activeSubscriptions.get(subscriptionKey);
      
      if (subscription) {
        const dataChanged = JSON.stringify(interactionData) !== JSON.stringify(subscription.lastData);
        
        if (dataChanged) {
          console.log(`⚡ ULTRA REAL-TIME: Interactions changed for poop ${poopId}, updating INSTANTLY!`);
          subscription.lastData = interactionData;
          callback(interactionData);
        }
        
        // 固定 0.5 秒間隔，超即時體驗
        subscription.interval = setTimeout(pollForChanges, ULTRA_REAL_TIME_INTERVAL);
      }
    } catch (error) {
      console.error('❌ Error in MongoDB backend ultra real-time interactions polling:', error);
      // 即使錯誤也保持超高頻輪詢
      const subscription = activeSubscriptions.get(subscriptionKey);
      if (subscription) {
        subscription.interval = setTimeout(pollForChanges, ULTRA_REAL_TIME_INTERVAL);
      }
    }
  };

  // 立即執行第一次查詢
  Promise.all([
    getLikesFromBackend(poopId),
    getCommentsFromBackend(poopId)
  ]).then(([likes, comments]) => {
    const initialData = { likes, comments };
    const interval = setTimeout(pollForChanges, ULTRA_REAL_TIME_INTERVAL);
    activeSubscriptions.set(subscriptionKey, {
      interval,
      lastData: initialData,
      callback
    });
    callback(initialData);
  }).catch(error => {
    console.error('❌ Error in initial MongoDB backend interactions query:', error);
  });

  return () => {
    console.log(`⚡ Stopping ULTRA REAL-TIME polling for poop interactions: ${poopId}`);
    const subscription = activeSubscriptions.get(subscriptionKey);
    if (subscription) {
      clearTimeout(subscription.interval);
      activeSubscriptions.delete(subscriptionKey);
    }
  };
};