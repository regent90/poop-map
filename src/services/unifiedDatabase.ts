import { Poop, Friend, FriendRequest } from '../types';

// MongoDB 服務 (主要)
import {
  savePoopToMongoDB,
  getUserPoopsFromMongoDB,
  getFriendsPoopsFromMongoDB,
  getPublicPoopsFromMongoDB,
  saveFriendToMongoDB,
  getUserFriendsFromMongoDB,
  sendFriendRequestToMongoDB,
  getUserFriendRequestsFromMongoDB,
  updateFriendRequestStatusInMongoDB,
  subscribeToUserPoopsInMongoDB,
  subscribeToFriendRequestsInMongoDB
} from './mongoDatabase';

// Supabase 服務 (備選)
import {
  savePoopToSupabase,
  getUserPoopsFromSupabase,
  getFriendsPoopsFromSupabase,
  getPublicPoopsFromSupabase,
  saveFriendToSupabase,
  getUserFriendsFromSupabase,
  sendFriendRequestToSupabase,
  getUserFriendRequestsFromSupabase,
  updateFriendRequestStatusInSupabase,
  subscribeToUserPoopsInSupabase,
  subscribeToFriendRequestsInSupabase
} from './supabaseDatabase';

// Convex 服務 (新的主要選擇)
import {
  savePoopToConvex,
  getUserPoopsFromConvex,
  getFriendsPoopsFromConvex,
  getPublicPoopsFromConvex,
  saveFriendToConvex,
  getUserFriendsFromConvex,
  removeFriendFromConvex,
  sendFriendRequestToConvex,
  getUserFriendRequestsFromConvex,
  updateFriendRequestStatusInConvex,
  subscribeToUserPoopsInConvex,
  subscribeToFriendRequestsInConvex,
  addCommentToConvex,
  getCommentsFromConvex,
  deleteCommentFromConvex,
  addLikeToConvex,
  getLikesFromConvex,
  removeLikeFromConvex,
  subscribeToPoopInteractionsInConvex
} from './convexDatabase';

// Firebase 服務 (作為備選)
import {
  savePoopToCloud as savePoopToFirebase,
  getUserPoops as getUserPoopsFromFirebase,
  getFriendsPoops as getFriendsPoopsFromFirebase,
  getPublicPoops as getPublicPoopsFromFirebase,
  saveFriendToCloud as saveFriendToFirebase,
  getUserFriends as getUserFriendsFromFirebase,
  sendFriendRequest as sendFriendRequestToFirebase,
  getUserFriendRequests as getUserFriendRequestsFromFirebase,
  updateFriendRequestStatus as updateFriendRequestStatusInFirebase,
  subscribeToUserPoops as subscribeToUserPoopsInFirebase,
  subscribeToFriendRequests as subscribeToFriendRequestsInFirebase
} from './database';

import { checkMongoBackendConnection } from './mongoBackendAPI';
import { checkSupabaseConnection } from '../supabase';
import { checkFirebaseConnection } from '../firebase';
import { checkConvexConnection } from './convexDatabase';
import { error } from 'console';

// 數據庫提供者類型
type DatabaseProvider = 'convex' | 'mongodb' | 'supabase' | 'firebase' | 'localStorage';

// 數據庫提供者緩存
let databaseProviderCache: { provider: DatabaseProvider; timestamp: number } | null = null;
const PROVIDER_CACHE_DURATION = 10 * 60 * 1000; // 10 分鐘緩存

// 清除數據庫提供者緩存（強制重新檢查）
export const clearDatabaseProviderCache = () => {
  databaseProviderCache = null;
  console.log('🔄 Database provider cache cleared');
};

// 獲取當前數據庫提供者 (優化版本，MongoDB 優先)
const getDatabaseProvider = async (): Promise<DatabaseProvider> => {
  // 使用緩存結果，避免頻繁檢查
  if (databaseProviderCache && 
      Date.now() - databaseProviderCache.timestamp < PROVIDER_CACHE_DURATION) {
    console.log('🔄 Using cached database provider:', databaseProviderCache.provider);
    return databaseProviderCache.provider;
  }

  // 檢查環境變量配置
  const hasConvexConfig = !!(import.meta.env.VITE_CONVEX_URL);
  const hasSupabaseConfig = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  const hasFirebaseConfig = !!(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID);
  
  console.log('🔍 Database provider check (cached for 10min):', {
    hasConvexConfig,
    hasSupabaseConfig,
    hasFirebaseConfig,
    isOnline: navigator.onLine,
    timestamp: new Date().toISOString()
  });

  let selectedProvider: DatabaseProvider = 'localStorage';

  // 如果離線，使用 localStorage
  if (!navigator.onLine) {
    console.log('📱 Using localStorage (offline mode)');
    selectedProvider = 'localStorage';
  }
  // 優先使用 Convex（最佳選擇）
  else if (hasConvexConfig) {
    console.log('🚀 Using Convex as primary database (best choice!)');
    selectedProvider = 'convex';
  }
  // 備選 Supabase
  else if (hasSupabaseConfig) {
    console.log('🔵 Using Supabase as backup database');
    selectedProvider = 'supabase';
  }
  else {
    console.log('🍃 Using MongoDB as fallback database');
    selectedProvider = 'mongodb';
  }

  // 緩存結果
  databaseProviderCache = {
    provider: selectedProvider,
    timestamp: Date.now()
  };

  console.log('💾 Database provider cached:', selectedProvider);

  if (selectedProvider === 'localStorage') {
    console.log('📱 Using localStorage as fallback');
  }

  return selectedProvider;
};

// localStorage 操作函數
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('❌ Error saving to localStorage:', error);
  }
};

const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('❌ Error reading from localStorage:', error);
    return defaultValue;
  }
};

// 統一的數據庫操作接口

// 便便相關操作
export const savePoopToCloud = async (poop: Poop): Promise<string> => {
  const provider = await getDatabaseProvider();
  
  console.log('💾 Saving poop using provider:', provider);
  
  try {
    switch (provider) {
      case 'convex':
        console.log('🚀 Saving to Convex...');
        const convexId = await savePoopToConvex(poop);
        console.log('✅ Poop saved to Convex:', convexId);
        return convexId;
      case 'mongodb':
        console.log('🍃 Saving to MongoDB...');
        const mongoId = await savePoopToMongoDB(poop);
        console.log('✅ Poop saved to MongoDB:', mongoId);
        return mongoId;
      case 'supabase':
        console.log('🔵 Saving to Supabase...');
        return await savePoopToSupabase(poop);
      case 'firebase':
        console.log('🟠 Saving to Firebase...');
        return await savePoopToFirebase(poop);
      case 'localStorage':
      default:
        console.log('📱 Saving to localStorage...');
        // 保存到 localStorage
        const userPoops = getFromLocalStorage(`poops_${poop.userId}`, []);
        userPoops.push(poop);
        saveToLocalStorage(`poops_${poop.userId}`, userPoops);
        console.log('📱 Poop saved to localStorage');
        return poop.id;
    }
  } catch (error) {
    console.error('❌ Error saving poop, falling back to localStorage:', error);
    // 錯誤時回退到 localStorage
    const userPoops = getFromLocalStorage(`poops_${poop.userId}`, []);
    userPoops.push(poop);
    saveToLocalStorage(`poops_${poop.userId}`, userPoops);
    console.log('📱 Poop saved to localStorage (fallback)');
    return poop.id;
  }
};

export const getUserPoops = async (userEmail: string): Promise<Poop[]> => {
  const provider = await getDatabaseProvider();
  
  console.log('📖 Getting user poops using provider:', provider);
  
  try {
    switch (provider) {
      case 'convex':
        console.log('🚀 Getting from Convex...');
        const convexPoops = await getUserPoopsFromConvex(userEmail);
        console.log(`✅ Got ${convexPoops.length} poops from Convex`);
        return convexPoops;
      case 'mongodb':
        console.log('🍃 Getting from MongoDB...');
        const mongoPoops = await getUserPoopsFromMongoDB(userEmail);
        console.log(`✅ Got ${mongoPoops.length} poops from MongoDB`);
        return mongoPoops;
      case 'supabase':
        console.log('🔵 Getting from Supabase...');
        return await getUserPoopsFromSupabase(userEmail);
      case 'firebase':
        console.log('🟠 Getting from Firebase...');
        return await getUserPoopsFromFirebase(userEmail);
      case 'localStorage':
      default:
        console.log('📱 Getting from localStorage...');
        const localPoops = getFromLocalStorage(`poops_${userEmail}`, []);
        console.log(`📱 Got ${localPoops.length} poops from localStorage`);
        return localPoops;
    }
  } catch (error) {
    console.error('❌ Error getting user poops, falling back to localStorage:', error);
    const fallbackPoops = getFromLocalStorage(`poops_${userEmail}`, []);
    console.log(`📱 Fallback: Got ${fallbackPoops.length} poops from localStorage`);
    return fallbackPoops;
  }
};

export const getFriendsPoops = async (friendEmails: string[]): Promise<Poop[]> => {
  const provider = await getDatabaseProvider();
  
  try {
    switch (provider) {
      case 'convex':
        console.log('🚀 Getting friends poops from Convex');
        const convexFriendsPoops = await getFriendsPoopsFromConvex(friendEmails);
        console.log(`✅ Got ${convexFriendsPoops.length} friends poops from Convex`);
        return convexFriendsPoops;
      case 'mongodb':
        return await getFriendsPoopsFromMongoDB(friendEmails);
      case 'supabase':
        return await getFriendsPoopsFromSupabase(friendEmails);
      case 'firebase':
        return await getFriendsPoopsFromFirebase(friendEmails);
      case 'localStorage':
      default:
        // 從 localStorage 獲取好友的便便
        let allPoops: Poop[] = [];
        friendEmails.forEach(email => {
          const friendPoops = getFromLocalStorage(`poops_${email}`, []);
          const visiblePoops = friendPoops.filter((poop: Poop) => 
            poop.privacy === 'public' || poop.privacy === 'friends'
          );
          allPoops = [...allPoops, ...visiblePoops];
        });
        return allPoops.sort((a, b) => b.timestamp - a.timestamp);
    }
  } catch (error) {
    console.error('❌ Error getting friends poops, falling back to localStorage:', error);
    let allPoops: Poop[] = [];
    friendEmails.forEach(email => {
      const friendPoops = getFromLocalStorage(`poops_${email}`, []);
      const visiblePoops = friendPoops.filter((poop: Poop) => 
        poop.privacy === 'public' || poop.privacy === 'friends'
      );
      allPoops = [...allPoops, ...visiblePoops];
    });
    return allPoops.sort((a, b) => b.timestamp - a.timestamp);
  }
};

export const getPublicPoops = async (): Promise<Poop[]> => {
  const provider = await getDatabaseProvider();
  
  try {
    switch (provider) {
      case 'convex':
        console.log('🚀 Getting public poops from Convex');
        const convexPublicPoops = await getPublicPoopsFromConvex();
        console.log(`✅ Got ${convexPublicPoops.length} public poops from Convex`);
        return convexPublicPoops;
      case 'mongodb':
        return await getPublicPoopsFromMongoDB();
      case 'supabase':
        return await getPublicPoopsFromSupabase();
      case 'firebase':
        return await getPublicPoopsFromFirebase();
      case 'localStorage':
      default:
        // 從 localStorage 獲取所有公開便便（這在實際應用中不太實用）
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('poops_'));
        let publicPoops: Poop[] = [];
        allKeys.forEach(key => {
          const userPoops = getFromLocalStorage(key, []);
          const userPublicPoops = userPoops.filter((poop: Poop) => poop.privacy === 'public');
          publicPoops = [...publicPoops, ...userPublicPoops];
        });
        return publicPoops.sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);
    }
  } catch (error) {
    console.error('❌ Error getting public poops, falling back to localStorage:', error);
    return [];
  }
};

// 公開便便即時訂閱
export const subscribeToPublicPoops = (callback: (poops: Poop[]) => void) => {
  getDatabaseProvider().then(provider => {
    switch (provider) {
      case 'mongodb':
        console.log('⚡ Setting up MongoDB real-time subscription for public poops');
        import('./mongoBackendAPI').then(({ subscribeToPublicPoopsInBackend }) => {
          return subscribeToPublicPoopsInBackend(callback);
        });
        break;
      case 'supabase':
        // Supabase 已有即時訂閱
        console.log('⚡ Supabase real-time subscription for public poops');
        break;
      case 'firebase':
        // Firebase 已有即時訂閱
        console.log('⚡ Firebase real-time subscription for public poops');
        break;
      case 'localStorage':
      default:
        console.log('📱 localStorage does not support real-time subscriptions for public poops');
        return () => {};
    }
  });
  
  return () => {};
};

// 好友相關操作
export const saveFriendToCloud = async (userEmail: string, friend: Friend): Promise<void> => {
  const provider = await getDatabaseProvider();
  
  try {
    switch (provider) {
      case 'convex':
        console.log('🚀 Saving friend to Convex');
        await saveFriendToConvex(userEmail, friend);
        break;
      case 'mongodb':
        await saveFriendToMongoDB(userEmail, friend);
        break;
      case 'supabase':
        await saveFriendToSupabase(userEmail, friend);
        break;
      case 'firebase':
        await saveFriendToFirebase(userEmail, friend);
        break;
      case 'localStorage':
      default:
        const userFriends = getFromLocalStorage(`friends_${userEmail}`, []);
        const existingIndex = userFriends.findIndex((f: Friend) => f.email === friend.email);
        if (existingIndex >= 0) {
          userFriends[existingIndex] = friend;
        } else {
          userFriends.push(friend);
        }
        saveToLocalStorage(`friends_${userEmail}`, userFriends);
        console.log('📱 Friend saved to localStorage');
    }
  } catch (error) {
    console.error('❌ Error saving friend, falling back to localStorage:', error);
    const userFriends = getFromLocalStorage(`friends_${userEmail}`, []);
    const existingIndex = userFriends.findIndex((f: Friend) => f.email === friend.email);
    if (existingIndex >= 0) {
      userFriends[existingIndex] = friend;
    } else {
      userFriends.push(friend);
    }
    saveToLocalStorage(`friends_${userEmail}`, userFriends);
  }
};

export const getUserFriends = async (userEmail: string): Promise<Friend[]> => {
  const provider = await getDatabaseProvider();
  
  try {
    switch (provider) {
      case 'convex':
        console.log('🚀 Getting friends from Convex');
        return await getUserFriendsFromConvex(userEmail);
      case 'mongodb':
        return await getUserFriendsFromMongoDB(userEmail);
      case 'supabase':
        return await getUserFriendsFromSupabase(userEmail);
      case 'firebase':
        return await getUserFriendsFromFirebase(userEmail);
      case 'localStorage':
      default:
        return getFromLocalStorage(`friends_${userEmail}`, []);
    }
  } catch (error) {
    console.error('❌ Error getting user friends, falling back to localStorage:', error);
    return getFromLocalStorage(`friends_${userEmail}`, []);
  }
};

// 解除好友功能 (雙向解除)
export const removeFriend = async (userEmail: string, friendEmail: string): Promise<void> => {
  const provider = await getDatabaseProvider();
  
  console.log(`🗑️ Removing mutual friendship between ${userEmail} and ${friendEmail} using provider:`, provider);
  
  try {
    switch (provider) {
      case 'convex':
        console.log('🚀 Removing mutual friendship from Convex...');
        // 移除雙方的好友關係
        await removeFriendFromConvex(userEmail, friendEmail);
        await removeFriendFromConvex(friendEmail, userEmail);
        break;
      case 'mongodb':
        console.log('🍃 Removing mutual friendship from MongoDB...');
        const { removeFriendFromBackend } = await import('./mongoBackendAPI');
        await removeFriendFromBackend(userEmail, friendEmail);
        await removeFriendFromBackend(friendEmail, userEmail);
        break;
      case 'supabase':
        console.log('🔵 Removing mutual friendship from Supabase...');
        const { removeFriendFromSupabase } = await import('./supabaseDatabase');
        await removeFriendFromSupabase(userEmail, friendEmail);
        await removeFriendFromSupabase(friendEmail, userEmail);
        break;
      case 'firebase':
        console.log('🟠 Removing mutual friendship from Firebase...');
        // TODO: 實現 Firebase 解除好友功能
        throw new Error('Firebase remove friend not implemented yet');
      case 'localStorage':
      default:
        console.log('📱 Removing mutual friendship from localStorage...');
        // 移除用戶 A 的好友列表中的用戶 B
        const userFriends = getFromLocalStorage(`friends_${userEmail}`, []);
        const updatedUserFriends = userFriends.filter((f: Friend) => f.email !== friendEmail);
        saveToLocalStorage(`friends_${userEmail}`, updatedUserFriends);
        
        // 移除用戶 B 的好友列表中的用戶 A
        const friendFriends = getFromLocalStorage(`friends_${friendEmail}`, []);
        const updatedFriendFriends = friendFriends.filter((f: Friend) => f.email !== userEmail);
        saveToLocalStorage(`friends_${friendEmail}`, updatedFriendFriends);
        
        console.log('📱 Mutual friendship removed from localStorage');
    }
    
    console.log(`✅ Mutual friendship between ${userEmail} and ${friendEmail} successfully removed`);
  } catch (error) {
    console.error('❌ Error removing mutual friendship, falling back to localStorage:', error);
    // 錯誤時回退到 localStorage
    const userFriends = getFromLocalStorage(`friends_${userEmail}`, []);
    const updatedUserFriends = userFriends.filter((f: Friend) => f.email !== friendEmail);
    saveToLocalStorage(`friends_${userEmail}`, updatedUserFriends);
    
    const friendFriends = getFromLocalStorage(`friends_${friendEmail}`, []);
    const updatedFriendFriends = friendFriends.filter((f: Friend) => f.email !== userEmail);
    saveToLocalStorage(`friends_${friendEmail}`, updatedFriendFriends);
    
    console.log('📱 Mutual friendship removed from localStorage (fallback)');
    throw error;
  }
};

// 好友請求相關操作
export const sendFriendRequest = async (request: FriendRequest): Promise<string> => {
  const provider = await getDatabaseProvider();
  
  try {
    switch (provider) {
      case 'convex':
        console.log('🚀 Sending friend request to Convex');
        return await sendFriendRequestToConvex(request);
      case 'mongodb':
        return await sendFriendRequestToMongoDB(request);
      case 'supabase':
        return await sendFriendRequestToSupabase(request);
      case 'firebase':
        return await sendFriendRequestToFirebase(request);
      case 'localStorage':
      default:
        // 保存到目標用戶的請求列表
        const targetRequests = getFromLocalStorage(`friendRequests_${request.toUserEmail}`, []);
        targetRequests.push(request);
        saveToLocalStorage(`friendRequests_${request.toUserEmail}`, targetRequests);
        console.log('📱 Friend request saved to localStorage');
        return request.id;
    }
  } catch (error) {
    console.error('❌ Error sending friend request, falling back to localStorage:', error);
    const targetRequests = getFromLocalStorage(`friendRequests_${request.toUserEmail}`, []);
    targetRequests.push(request);
    saveToLocalStorage(`friendRequests_${request.toUserEmail}`, targetRequests);
    return request.id;
  }
};

export const getUserFriendRequests = async (userEmail: string): Promise<FriendRequest[]> => {
  const provider = await getDatabaseProvider();
  
  try {
    switch (provider) {
      case 'convex':
        console.log('🚀 Getting friend requests from Convex');
        return await getUserFriendRequestsFromConvex(userEmail);
      case 'mongodb':
        return await getUserFriendRequestsFromMongoDB(userEmail);
      case 'supabase':
        return await getUserFriendRequestsFromSupabase(userEmail);
      case 'firebase':
        return await getUserFriendRequestsFromFirebase(userEmail);
      case 'localStorage':
      default:
        return getFromLocalStorage(`friendRequests_${userEmail}`, []);
    }
  } catch (error) {
    console.error('❌ Error getting friend requests, falling back to localStorage:', error);
    return getFromLocalStorage(`friendRequests_${userEmail}`, []);
  }
};

export const updateFriendRequestStatus = async (requestId: string, status: 'accepted' | 'rejected'): Promise<void> => {
  const provider = await getDatabaseProvider();
  
  try {
    switch (provider) {
      case 'convex':
        console.log('🚀 Updating friend request status in Convex');
        await updateFriendRequestStatusInConvex(requestId, status);
        break;
      case 'mongodb':
        await updateFriendRequestStatusInMongoDB(requestId, status);
        break;
      case 'supabase':
        await updateFriendRequestStatusInSupabase(requestId, status);
        break;
      case 'firebase':
        await updateFriendRequestStatusInFirebase(requestId, status);
        break;
      case 'localStorage':
      default:
        // 在 localStorage 中更新請求狀態（這需要遍歷所有用戶的請求）
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('friendRequests_'));
        allKeys.forEach(key => {
          const requests = getFromLocalStorage(key, []);
          const requestIndex = requests.findIndex((r: FriendRequest) => r.id === requestId);
          if (requestIndex >= 0) {
            requests[requestIndex].status = status;
            saveToLocalStorage(key, requests);
          }
        });
        console.log('📱 Friend request status updated in localStorage');
    }
  } catch (error) {
    console.error('❌ Error updating friend request status, falling back to localStorage:', error);
    // localStorage 備選邏輯已在上面實現
  }
};

// 實時訂閱功能
export const subscribeToUserPoops = (userEmail: string, callback: (poops: Poop[]) => void) => {
  getDatabaseProvider().then(provider => {
    switch (provider) {
      case 'mongodb':
        return subscribeToUserPoopsInMongoDB(userEmail, callback);
      case 'supabase':
        return subscribeToUserPoopsInSupabase(userEmail, callback);
      case 'firebase':
        return subscribeToUserPoopsInFirebase(userEmail, callback);
      case 'localStorage':
      default:
        // localStorage 不支持實時訂閱，返回空的清理函數
        console.log('📱 localStorage does not support real-time subscriptions');
        return () => {};
    }
  });
  
  // 返回默認的清理函數
  return () => {};
};

export const subscribeToFriendRequests = (userEmail: string, callback: (requests: FriendRequest[]) => void) => {
  getDatabaseProvider().then(provider => {
    switch (provider) {
      case 'mongodb':
        return subscribeToFriendRequestsInMongoDB(userEmail, callback);
      case 'supabase':
        return subscribeToFriendRequestsInSupabase(userEmail, callback);
      case 'firebase':
        return subscribeToFriendRequestsInFirebase(userEmail, callback);
      case 'localStorage':
      default:
        // localStorage 不支持實時訂閱，返回空的清理函數
        console.log('📱 localStorage does not support real-time subscriptions');
        return () => {};
    }
  });
  
  // 返回默認的清理函數
  return () => {};
};

// 獲取當前使用的數據庫提供者（用於 UI 顯示）
export const getCurrentDatabaseProvider = async (): Promise<DatabaseProvider> => {
  return await getDatabaseProvider();
};
// 留言和按讚功能
export const addPoopComment = async (poopId: string, userId: string, userEmail: string, userName: string, content: string, userPicture?: string): Promise<string> => {
  const provider = await getDatabaseProvider();
  
  switch (provider) {
    case 'convex':
      console.log('💬 Adding comment to Convex');
      return await addCommentToConvex(poopId, userId, userEmail, userName, content, userPicture);
    case 'mongodb':
    default:
      console.log('💬 Adding comment to MongoDB');
      const { addCommentToBackend } = await import('./mongoBackendAPI');
      return await addCommentToBackend(poopId, userId, userEmail, userName, content, userPicture);
  }
};

export const getPoopComments = async (poopId: string) => {
  const provider = await getDatabaseProvider();
  
  switch (provider) {
    case 'convex':
      console.log('📖 Getting comments from Convex');
      return await getCommentsFromConvex(poopId);
    case 'mongodb':
    default:
      console.log('📖 Getting comments from MongoDB');
      const { getCommentsFromBackend } = await import('./mongoBackendAPI');
      return await getCommentsFromBackend(poopId);
  }
};

export const deletePoopComment = async (commentId: string): Promise<void> => {
  const provider = await getDatabaseProvider();
  
  switch (provider) {
    case 'convex':
      console.log('🗑️ Deleting comment from Convex');
      return await deleteCommentFromConvex(commentId);
    case 'mongodb':
    default:
      console.log('🗑️ Deleting comment from MongoDB');
      const { deleteCommentFromBackend } = await import('./mongoBackendAPI');
      return await deleteCommentFromBackend(commentId);
  }
};

export const addPoopLike = async (poopId: string, userId: string, userEmail: string, userName: string, userPicture?: string): Promise<string> => {
  const provider = await getDatabaseProvider();
  
  switch (provider) {
    case 'convex':
      console.log('👍 Adding like to Convex');
      return await addLikeToConvex(poopId, userId, userEmail, userName, userPicture);
    case 'mongodb':
    default:
      console.log('👍 Adding like to MongoDB');
      const { addLikeToBackend } = await import('./mongoBackendAPI');
      return await addLikeToBackend(poopId, userId, userEmail, userName, userPicture);
  }
};

export const removePoopLike = async (poopId: string, userId: string): Promise<void> => {
  const provider = await getDatabaseProvider();
  
  switch (provider) {
    case 'convex':
      console.log('👎 Removing like from Convex');
      return await removeLikeFromConvex(poopId, userId);
    case 'mongodb':
    default:
      console.log('👎 Removing like from MongoDB');
      const { removeLikeFromBackend } = await import('./mongoBackendAPI');
      return await removeLikeFromBackend(poopId, userId);
  }
};

export const subscribeToPoopInteractions = (poopId: string, callback: (data: { likes: any[], comments: any[] }) => void) => {
  getDatabaseProvider().then(provider => {
    switch (provider) {
      case 'convex':
        console.log('🚀 Setting up Convex interactions subscription for poop:', poopId);
        return subscribeToPoopInteractionsInConvex(poopId, callback);
      case 'mongodb':
        console.log('🔄 Setting up MongoDB interactions subscription for poop:', poopId);
        import('./mongoBackendAPI').then(({ subscribeToPoopInteractionsInBackend }) => {
          return subscribeToPoopInteractionsInBackend(poopId, callback);
        });
        break;
      default:
        console.log('📱 No real-time subscription available for this provider');
        return () => {};
    }
  });
  
  return () => {
    console.log('🔄 Unsubscribing from interactions for poop:', poopId);
  };
};