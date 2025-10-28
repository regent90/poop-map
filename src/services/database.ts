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
    // Filter out undefined fields to prevent Firebase errors
    const cleanPoop = Object.fromEntries(
      Object.entries(poop).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = await addDoc(collection(db, POOPS_COLLECTION), {
      ...cleanPoop,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving poop to cloud:', error);
    throw error;
  }
};

export const getUserPoops = async (userId: string): Promise<Poop[]> => {
  try {
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
    return poops.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error getting user poops:', error);
    return [];
  }
};

export const getFriendsPoops = async (friendEmails: string[]): Promise<Poop[]> => {
  if (friendEmails.length === 0) return [];
  
  try {
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
    return allPoops.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error getting friends poops:', error);
    return [];
  }
};

export const getPublicPoops = async (): Promise<Poop[]> => {
  try {
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
    return poops.sort((a, b) => b.timestamp - a.timestamp);
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
export const subscribeToUserPoops = (userId: string, callback: (poops: Poop[]) => void) => {
  const q = query(
    collection(db, POOPS_COLLECTION),
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const poops = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Poop));
    
    // Sort in JavaScript instead of Firestore to avoid index requirements
    const sortedPoops = poops.sort((a, b) => b.timestamp - a.timestamp);
    callback(sortedPoops);
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