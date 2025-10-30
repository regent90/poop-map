import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Poop, Friend, FriendRequest, PoopLike, PoopComment } from '../types';

// 緩存機制 - 避免過度查詢
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

const cache = new Map<string, CacheEntry<any>>();
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘緩存

const getCachedData = <T>(key: string): T | null => {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) {
    console.log(`🔄 Using cached data for: ${key}`);
    return entry.data;
  }
  if (entry) {
    cache.delete(key); // 清除過期緩存
  }
  return null;
};

const setCachedData = <T>(key: string, data: T, duration: number = DEFAULT_CACHE_DURATION): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expiry: Date.now() + duration
  });
  console.log(`💾 Cached data for: ${key} (${duration / 1000}s)`);
};

// 清除特定緩存
const clearCache = (pattern?: string): void => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
    console.log(`🗑️ Cleared cache matching: ${pattern}`);
  } else {
    cache.clear();
    console.log('🗑️ Cleared all cache');
  }
};

// Collections
const POOPS_COLLECTION = 'poops';
const FRIENDS_COLLECTION = 'friends';
const FRIEND_REQUESTS_COLLECTION = 'friendRequests';
const USERS_COLLECTION = 'users';
const LIKES_COLLECTION = 'likes';
const COMMENTS_COLLECTION = 'comments';

// Poop operations
export const savePoopToCloud = async (poop: Poop): Promise<string> => {
  try {
    console.log('🔥 Saving poop to Firebase');
    
    // Filter out undefined fields to prevent Firebase errors
    const cleanPoop = Object.fromEntries(
      Object.entries(poop).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = await addDoc(collection(db, POOPS_COLLECTION), {
      ...cleanPoop,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // 清除相關緩存
    clearCache(`user_poops_${poop.userId}`);
    if (poop.privacy === 'public') {
      clearCache('public_poops');
    }
    clearCache('friends_poops'); // 清除所有好友便便緩存
    
    console.log('✅ Poop saved to Firebase:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving poop to cloud:', error);
    throw error;
  }
};

export const getUserPoops = async (userId: string): Promise<Poop[]> => {
  const cacheKey = `user_poops_${userId}`;
  
  // 檢查緩存
  const cachedPoops = getCachedData<Poop[]>(cacheKey);
  if (cachedPoops) {
    return cachedPoops;
  }
  
  try {
    console.log(`🔥 Fetching user poops from Firebase for: ${userId}`);
    const q = query(
      collection(db, POOPS_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const poops = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Poop));
    
    // Sort in JavaScript instead of Firestore to avoid index requirements
    const sortedPoops = poops.sort((a, b) => b.timestamp - a.timestamp);
    
    // 緩存結果（3分鐘）
    setCachedData(cacheKey, sortedPoops, 3 * 60 * 1000);
    
    console.log(`✅ Fetched ${sortedPoops.length} poops for user ${userId}`);
    return sortedPoops;
  } catch (error) {
    console.error('Error getting user poops:', error);
    return [];
  }
};

export const getFriendsPoops = async (friendEmails: string[]): Promise<Poop[]> => {
  if (friendEmails.length === 0) return [];
  
  const cacheKey = `friends_poops_${friendEmails.sort().join(',').substring(0, 50)}`;
  
  // 檢查緩存
  const cachedPoops = getCachedData<Poop[]>(cacheKey);
  if (cachedPoops) {
    return cachedPoops;
  }
  
  try {
    console.log(`🔥 Fetching friends poops from Firebase for ${friendEmails.length} friends`);
    
    // Firestore 'in' queries are limited to 10 items, so we need to batch them
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < friendEmails.length; i += batchSize) {
      const batch = friendEmails.slice(i, i + batchSize);
      const q = query(
        collection(db, POOPS_COLLECTION),
        where('userId', 'in', batch),
        where('privacy', 'in', ['public', 'friends'])
      );
      batches.push(getDocs(q));
    }
    
    const results = await Promise.all(batches);
    const allPoops: Poop[] = [];
    
    results.forEach(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        allPoops.push({
          id: doc.id,
          ...doc.data()
        } as Poop);
      });
    });
    
    // Sort by timestamp
    const sortedPoops = allPoops.sort((a, b) => b.timestamp - a.timestamp);
    
    // 緩存結果（5分鐘）
    setCachedData(cacheKey, sortedPoops, 5 * 60 * 1000);
    
    console.log(`✅ Fetched ${sortedPoops.length} friends poops`);
    return sortedPoops;
  } catch (error) {
    console.error('Error getting friends poops:', error);
    return [];
  }
};

export const getPublicPoops = async (): Promise<Poop[]> => {
  const cacheKey = 'public_poops';
  
  // 檢查緩存
  const cachedPoops = getCachedData<Poop[]>(cacheKey);
  if (cachedPoops) {
    return cachedPoops;
  }
  
  try {
    console.log('🔥 Fetching public poops from Firebase');
    const q = query(
      collection(db, POOPS_COLLECTION),
      where('privacy', '==', 'public')
    );
    const querySnapshot = await getDocs(q);
    const poops = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Poop));
    
    // Sort in JavaScript
    const sortedPoops = poops.sort((a, b) => b.timestamp - a.timestamp);
    
    // 緩存結果（10分鐘，因為公開便便變化較少）
    setCachedData(cacheKey, sortedPoops, 10 * 60 * 1000);
    
    console.log(`✅ Fetched ${sortedPoops.length} public poops`);
    return sortedPoops;
  } catch (error) {
    console.error('Error getting public poops:', error);
    return [];
  }
};

// Friend operations
export const saveFriendToCloud = async (userId: string, friend: Friend): Promise<void> => {
  try {
    const friendData = {
      userId,
      friendId: friend.id,
      friendEmail: friend.email,
      friendName: friend.name,
      status: friend.status,
      addedAt: Timestamp.now()
    };
    
    // Only add friendPicture if it's not undefined
    if (friend.picture !== undefined) {
      friendData.friendPicture = friend.picture;
    }
    
    await addDoc(collection(db, FRIENDS_COLLECTION), friendData);
  } catch (error) {
    console.error('Error saving friend to cloud:', error);
    throw error;
  }
};

export const getUserFriends = async (userId: string): Promise<Friend[]> => {
  try {
    const q = query(
      collection(db, FRIENDS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'accepted')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.friendId,
        email: data.friendEmail,
        name: data.friendName,
        picture: data.friendPicture,
        status: data.status,
        addedAt: data.addedAt?.toMillis() || Date.now()
      } as Friend;
    });
  } catch (error) {
    console.error('Error getting user friends:', error);
    return [];
  }
};

// Friend request operations
export const sendFriendRequest = async (request: FriendRequest): Promise<string> => {
  try {
    // Filter out undefined fields to prevent Firebase errors
    const cleanRequest = Object.fromEntries(
      Object.entries(request).filter(([_, value]) => value !== undefined)
    );
    
    // Remove the client-generated ID since Firestore will generate its own
    const { id, ...requestData } = cleanRequest;
    
    const docRef = await addDoc(collection(db, FRIEND_REQUESTS_COLLECTION), {
      ...requestData,
      createdAt: Timestamp.now()
    });
    
    console.log('✅ Friend request sent with Firestore ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

export const getUserFriendRequests = async (userEmail: string): Promise<FriendRequest[]> => {
  try {
    const q = query(
      collection(db, FRIEND_REQUESTS_COLLECTION),
      where('toUserEmail', '==', userEmail),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FriendRequest));
  } catch (error) {
    console.error('Error getting friend requests:', error);
    return [];
  }
};

export const updateFriendRequestStatus = async (requestId: string, status: 'accepted' | 'rejected'): Promise<void> => {
  try {
    console.log('🔄 Updating friend request status:', { requestId, status });
    const requestRef = doc(db, FRIEND_REQUESTS_COLLECTION, requestId);
    
    // First check if the document exists
    const docSnap = await getDoc(requestRef);
    if (!docSnap.exists()) {
      console.error('❌ Friend request document does not exist:', requestId);
      throw new Error(`Friend request with ID ${requestId} not found`);
    }
    
    console.log('📄 Found friend request document:', docSnap.data());
    
    await updateDoc(requestRef, {
      status,
      updatedAt: Timestamp.now()
    });
    
    console.log('✅ Successfully updated friend request status');
  } catch (error) {
    console.error('❌ Error updating friend request:', error);
    throw error;
  }
};

// Real-time listeners
// 防抖機制避免過度觸發
const debounceCallbacks = new Map<string, NodeJS.Timeout>();

const debounceCallback = (key: string, callback: () => void, delay: number = 1000) => {
  const existingTimeout = debounceCallbacks.get(key);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }
  
  const timeout = setTimeout(() => {
    callback();
    debounceCallbacks.delete(key);
  }, delay);
  
  debounceCallbacks.set(key, timeout);
};

export const subscribeToUserPoops = (userId: string, callback: (poops: Poop[]) => void) => {
  console.log('🔄 Setting up Firebase subscription for user poops:', userId);
  
  const q = query(
    collection(db, POOPS_COLLECTION),
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    // 使用防抖避免過度觸發
    debounceCallback(`user_poops_${userId}`, () => {
      const poops = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Poop));
      
      // Sort in JavaScript instead of Firestore to avoid index requirements
      const sortedPoops = poops.sort((a, b) => b.timestamp - a.timestamp);
      
      // 更新緩存
      setCachedData(`user_poops_${userId}`, sortedPoops, 3 * 60 * 1000);
      
      console.log(`🔄 Firebase: Updated ${sortedPoops.length} user poops for ${userId}`);
      callback(sortedPoops);
    }, 1000); // 1秒防抖
  });
};

export const subscribeToFriendRequests = (userEmail: string, callback: (requests: FriendRequest[]) => void) => {
  const q = query(
    collection(db, FRIEND_REQUESTS_COLLECTION),
    where('toUserEmail', '==', userEmail),
    where('status', '==', 'pending')
  );
  
  return onSnapshot(q, 
    (querySnapshot) => {
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FriendRequest));
      console.log(`🔄 Firestore listener: Found ${requests.length} pending requests for ${userEmail}`);
      callback(requests);
    },
    (error) => {
      console.error('❌ Friend requests listener error:', error);
    }
  );
};
//
// ==========================================
// 互動功能 (按讚和留言)
// ==========================================

// 按讚功能
export const togglePoopLike = async (poopId: string, userId: string, userEmail: string, userName: string, userPicture?: string): Promise<boolean> => {
  try {
    // 檢查是否已經按讚
    const likesQuery = query(
      collection(db, LIKES_COLLECTION),
      where('poopId', '==', poopId),
      where('userId', '==', userId)
    );
    
    const existingLikes = await getDocs(likesQuery);
    
    if (existingLikes.empty) {
      // 添加按讚
      const newLike = {
        poopId,
        userId,
        userEmail,
        userName,
        userPicture: userPicture || undefined,
        timestamp: Timestamp.now()
      };
      
      // 過濾 undefined 值
      const cleanLike = Object.fromEntries(
        Object.entries(newLike).filter(([_, value]) => value !== undefined)
      );
      
      await addDoc(collection(db, LIKES_COLLECTION), cleanLike);
      console.log('👍 Like added for poop:', poopId);
      return true; // 已按讚
    } else {
      // 移除按讚
      const likeDoc = existingLikes.docs[0];
      await deleteDoc(doc(db, LIKES_COLLECTION, likeDoc.id));
      console.log('👎 Like removed for poop:', poopId);
      return false; // 已取消讚
    }
  } catch (error) {
    console.error('❌ Error toggling like:', error);
    throw error;
  }
};

// 獲取便便的按讚列表
export const getPoopLikes = async (poopId: string) => {
  try {
    const likesQuery = query(
      collection(db, LIKES_COLLECTION),
      where('poopId', '==', poopId)
    );
    
    const likesSnapshot = await getDocs(likesQuery);
    const likes = likesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return likes;
  } catch (error) {
    console.error('❌ Error getting likes:', error);
    return [];
  }
};

// 添加留言
export const addPoopComment = async (poopId: string, userId: string, userEmail: string, userName: string, content: string, userPicture?: string): Promise<string> => {
  try {
    const newComment = {
      poopId,
      userId,
      userEmail,
      userName,
      content,
      userPicture: userPicture || undefined,
      timestamp: Timestamp.now()
    };
    
    // 過濾 undefined 值
    const cleanComment = Object.fromEntries(
      Object.entries(newComment).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), cleanComment);
    console.log('💬 Comment added for poop:', poopId);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    throw error;
  }
};

// 獲取便便的留言列表
export const getPoopComments = async (poopId: string) => {
  try {
    const commentsQuery = query(
      collection(db, COMMENTS_COLLECTION),
      where('poopId', '==', poopId)
    );
    
    const commentsSnapshot = await getDocs(commentsQuery);
    const comments = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // 按時間排序
    return comments.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('❌ Error getting comments:', error);
    return [];
  }
};

// 刪除留言
export const deletePoopComment = async (commentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
    console.log('🗑️ Comment deleted:', commentId);
  } catch (error) {
    console.error('❌ Error deleting comment:', error);
    throw error;
  }
};

// 實時監聽便便的互動數據
export const subscribeToPoopInteractions = (poopId: string, callback: (data: { likes: any[], comments: any[] }) => void) => {
  // 監聽按讚
  const likesQuery = query(
    collection(db, LIKES_COLLECTION),
    where('poopId', '==', poopId)
  );
  
  // 監聽留言
  const commentsQuery = query(
    collection(db, COMMENTS_COLLECTION),
    where('poopId', '==', poopId)
  );
  
  let likes: any[] = [];
  let comments: any[] = [];
  
  const unsubscribeLikes = onSnapshot(likesQuery, (snapshot) => {
    likes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback({ likes, comments });
  });
  
  const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
    comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => a.timestamp - b.timestamp);
    callback({ likes, comments });
  });
  
  // 返回清理函數
  return () => {
    unsubscribeLikes();
    unsubscribeComments();
  };
};