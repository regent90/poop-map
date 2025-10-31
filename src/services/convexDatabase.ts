import { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Poop, Friend, FriendRequest, UserInventory, PoopItem, PoopAttack } from '../types';
import { Id } from "../../convex/_generated/dataModel";

// 創建 Convex 客戶端
const convexUrl = import.meta.env.VITE_CONVEX_URL!;
export const convex = new ConvexReactClient(convexUrl);

// 檢查 Convex 連接
export const checkConvexConnection = async (): Promise<boolean> => {
  try {
    await convex.query(api.poops.getPublicPoops);
    console.log('✅ Convex connection successful');
    return true;
  } catch (error) {
    console.warn('🔴 Convex connection failed:', error);
    return false;
  }
};

// 類型轉換函數
const convertConvexPoopToPoop = (convexPoop: any): Poop => ({
  id: convexPoop._id,
  userId: convexPoop.userId,
  lat: convexPoop.lat,
  lng: convexPoop.lng,
  timestamp: convexPoop.timestamp,
  rating: convexPoop.rating,
  notes: convexPoop.notes,
  photo: convexPoop.photo,
  privacy: convexPoop.privacy,
  placeName: convexPoop.placeName,
  customLocation: convexPoop.customLocation,
  address: convexPoop.address
});

const convertPoopToConvexPoop = (poop: Poop) => ({
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

const convertConvexFriendToFriend = (convexFriend: any): Friend => ({
  id: convexFriend.friendEmail,
  name: convexFriend.friendName,
  email: convexFriend.friendEmail,
  picture: convexFriend.friendPicture,
  status: convexFriend.status as 'pending' | 'accepted' | 'blocked',
  addedAt: convexFriend.addedAt
});

const convertConvexFriendRequestToFriendRequest = (convexRequest: any): FriendRequest => ({
  id: convexRequest._id,
  fromUserId: convexRequest.fromUserId,
  fromUserName: convexRequest.fromUserName,
  fromUserEmail: convexRequest.fromUserEmail,
  fromUserPicture: convexRequest.fromUserPicture,
  toUserEmail: convexRequest.toUserEmail,
  status: convexRequest.status,
  timestamp: convexRequest.timestamp
});

// 便便相關操作
export const savePoopToConvex = async (poop: Poop): Promise<string> => {
  try {
    const convexPoop = convertPoopToConvexPoop(poop);
    const poopId = await convex.mutation(api.poops.createPoop, convexPoop);
    console.log('✅ Poop saved to Convex:', poopId);
    return poopId;
  } catch (error) {
    console.error('❌ Failed to save poop to Convex:', error);
    throw error;
  }
};

export const getUserPoopsFromConvex = async (userEmail: string): Promise<Poop[]> => {
  try {
    const convexPoops = await convex.query(api.poops.getUserPoops, { userId: userEmail });
    const poops = convexPoops.map(convertConvexPoopToPoop);
    console.log(`✅ Fetched ${poops.length} poops for user ${userEmail} from Convex`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch user poops from Convex:', error);
    throw error;
  }
};

export const getFriendsPoopsFromConvex = async (friendEmails: string[]): Promise<Poop[]> => {
  if (friendEmails.length === 0) return [];

  try {
    const convexPoops = await convex.query(api.poops.getFriendsPoops, { friendEmails });
    const poops = convexPoops.map(convertConvexPoopToPoop);
    console.log(`✅ Fetched ${poops.length} friends poops from Convex`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch friends poops from Convex:', error);
    throw error;
  }
};

export const getPublicPoopsFromConvex = async (): Promise<Poop[]> => {
  try {
    const convexPoops = await convex.query(api.poops.getPublicPoops);
    const poops = convexPoops.map(convertConvexPoopToPoop);
    console.log(`✅ Fetched ${poops.length} public poops from Convex`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch public poops from Convex:', error);
    throw error;
  }
};

// 好友相關操作
export const saveFriendToConvex = async (userEmail: string, friend: Friend): Promise<string> => {
  try {
    const friendId = await convex.mutation(api.friends.addFriend, {
      userId: userEmail,
      friendEmail: friend.email,
      friendName: friend.name,
      friendPicture: friend.picture,
      status: friend.status as 'pending' | 'accepted' | 'rejected',
      addedAt: friend.addedAt
    });
    console.log('✅ Friend saved to Convex:', friendId);
    return friendId;
  } catch (error) {
    console.error('❌ Failed to save friend to Convex:', error);
    throw error;
  }
};

export const getUserFriendsFromConvex = async (userEmail: string): Promise<Friend[]> => {
  try {
    const convexFriends = await convex.query(api.friends.getUserFriends, { userId: userEmail });
    const friends = convexFriends.map(convertConvexFriendToFriend);
    console.log(`✅ Fetched ${friends.length} friends for user ${userEmail} from Convex`);
    return friends;
  } catch (error) {
    console.error('❌ Failed to fetch user friends from Convex:', error);
    throw error;
  }
};

// 解除好友功能
export const removeFriendFromConvex = async (userEmail: string, friendEmail: string): Promise<void> => {
  try {
    await convex.mutation(api.friends.removeFriend, { userId: userEmail, friendEmail });
    console.log(`✅ Friend ${friendEmail} removed from ${userEmail}'s friend list in Convex`);
  } catch (error) {
    console.error('❌ Failed to remove friend from Convex:', error);
    throw error;
  }
};

// 好友請求相關操作
export const sendFriendRequestToConvex = async (request: FriendRequest): Promise<string> => {
  try {
    const requestId = await convex.mutation(api.friends.sendFriendRequest, {
      fromUserId: request.fromUserId,
      fromUserName: request.fromUserName,
      fromUserEmail: request.fromUserEmail,
      fromUserPicture: request.fromUserPicture,
      toUserEmail: request.toUserEmail,
      timestamp: request.timestamp
    });
    console.log('✅ Friend request sent to Convex:', requestId);
    return requestId;
  } catch (error) {
    console.error('❌ Failed to send friend request to Convex:', error);
    throw error;
  }
};

export const getUserFriendRequestsFromConvex = async (userEmail: string): Promise<FriendRequest[]> => {
  try {
    const convexRequests = await convex.query(api.friends.getUserFriendRequests, { userEmail });
    const requests = convexRequests.map(convertConvexFriendRequestToFriendRequest);
    console.log(`✅ Fetched ${requests.length} friend requests for user ${userEmail} from Convex`);
    return requests;
  } catch (error) {
    console.error('❌ Failed to fetch friend requests from Convex:', error);
    throw error;
  }
};

export const updateFriendRequestStatusInConvex = async (requestId: string, status: 'accepted' | 'rejected'): Promise<void> => {
  try {
    await convex.mutation(api.friends.updateFriendRequestStatus, { 
      requestId: requestId as Id<"friendRequests">, 
      status 
    });
    console.log(`✅ Friend request ${requestId} status updated to ${status} in Convex`);
  } catch (error) {
    console.error('❌ Failed to update friend request status in Convex:', error);
    throw error;
  }
};

// 留言相關操作
export const addCommentToConvex = async (poopId: string, userId: string, userEmail: string, userName: string, content: string, userPicture?: string): Promise<string> => {
  try {
    const commentId = await convex.mutation(api.interactions.addComment, {
      poopId: poopId as Id<"poops">,
      userId,
      userEmail,
      userName,
      userPicture,
      content,
      timestamp: Date.now()
    });
    console.log('✅ Comment added to Convex:', commentId);
    return commentId;
  } catch (error) {
    console.error('❌ Failed to add comment to Convex:', error);
    throw error;
  }
};

export const getCommentsFromConvex = async (poopId: string): Promise<any[]> => {
  try {
    const comments = await convex.query(api.interactions.getComments, { 
      poopId: poopId as Id<"poops"> 
    });
    console.log(`✅ Fetched ${comments.length} comments for poop ${poopId} from Convex`);
    return comments;
  } catch (error) {
    console.error('❌ Failed to fetch comments from Convex:', error);
    throw error;
  }
};

export const deleteCommentFromConvex = async (commentId: string): Promise<void> => {
  try {
    await convex.mutation(api.interactions.deleteComment, { 
      commentId: commentId as Id<"comments"> 
    });
    console.log('✅ Comment deleted from Convex:', commentId);
  } catch (error) {
    console.error('❌ Failed to delete comment from Convex:', error);
    throw error;
  }
};

// 按讚相關操作
export const addLikeToConvex = async (poopId: string, userId: string, userEmail: string, userName: string, userPicture?: string): Promise<string> => {
  try {
    const likeId = await convex.mutation(api.interactions.addLike, {
      poopId: poopId as Id<"poops">,
      userId,
      userEmail,
      userName,
      userPicture,
      timestamp: Date.now()
    });
    console.log('✅ Like added to Convex:', likeId);
    return likeId;
  } catch (error: any) {
    if (error.message && error.message.includes('ALREADY_LIKED')) {
      throw new Error('已經按過讚了');
    }
    console.error('❌ Failed to add like to Convex:', error);
    throw error;
  }
};

export const getLikesFromConvex = async (poopId: string): Promise<any[]> => {
  try {
    const likes = await convex.query(api.interactions.getLikes, { 
      poopId: poopId as Id<"poops"> 
    });
    console.log(`✅ Fetched ${likes.length} likes for poop ${poopId} from Convex`);
    return likes;
  } catch (error) {
    console.error('❌ Failed to fetch likes from Convex:', error);
    throw error;
  }
};

export const removeLikeFromConvex = async (poopId: string, userId: string): Promise<void> => {
  try {
    await convex.mutation(api.interactions.removeLike, {
      poopId: poopId as Id<"poops">,
      userId
    });
    console.log('✅ Like removed from Convex:', { poopId, userId });
  } catch (error) {
    console.error('❌ Failed to remove like from Convex:', error);
    throw error;
  }
};

// 實時訂閱功能 (使用 Convex 的 useQuery hook)
export const subscribeToUserPoopsInConvex = (userEmail: string, callback: (poops: Poop[]) => void) => {
  console.log(`🔄 Convex real-time subscription for user poops: ${userEmail}`);
  // 這個函數在 React 組件中使用 useQuery hook 實現
  // 這裡返回一個空的清理函數
  return () => {
    console.log(`🔄 Unsubscribing from Convex user poops: ${userEmail}`);
  };
};

export const subscribeToFriendRequestsInConvex = (userEmail: string, callback: (requests: FriendRequest[]) => void) => {
  console.log(`🔄 Convex real-time subscription for friend requests: ${userEmail}`);
  // 這個函數在 React 組件中使用 useQuery hook 實現
  return () => {
    console.log(`🔄 Unsubscribing from Convex friend requests: ${userEmail}`);
  };
};

export const subscribeToPoopInteractionsInConvex = (poopId: string, callback: (data: { likes: any[], comments: any[] }) => void) => {
  console.log(`🔄 Convex real-time subscription for poop interactions: ${poopId}`);
  // 這個函數在 React 組件中使用 useQuery hook 實現
  return () => {
    console.log(`🔄 Unsubscribing from Convex poop interactions: ${poopId}`);
  };
};
// 
道具系統相關操作
export const getUserInventoryFromConvex = async (userId: string): Promise<UserInventory> => {
  try {
    const inventory = await convex.query(api.poopItems.getUserInventory, { userId });
    console.log(`✅ Fetched inventory from Convex for user ${userId}: ${inventory.items.length} items`);
    return inventory;
  } catch (error) {
    console.error('❌ Failed to get inventory from Convex:', error);
    throw error;
  }
};

export const addItemToInventoryInConvex = async (userId: string, item: PoopItem): Promise<string> => {
  try {
    const inventoryId = await convex.mutation(api.poopItems.addItemToInventory, { userId, item });
    console.log(`✅ Added item ${item.name} to Convex inventory for user ${userId}`);
    return inventoryId;
  } catch (error) {
    console.error('❌ Failed to add item to Convex inventory:', error);
    throw error;
  }
};

export const useItemFromConvex = async (userId: string, itemId: string): Promise<PoopItem> => {
  try {
    const item = await convex.mutation(api.poopItems.useItem, { userId, itemId });
    console.log(`✅ Used item ${item.name} from Convex inventory for user ${userId}`);
    return item;
  } catch (error) {
    console.error('❌ Failed to use item from Convex inventory:', error);
    throw error;
  }
};

export const createAttackInConvex = async (attack: Omit<PoopAttack, 'id' | 'viewed'>): Promise<string> => {
  try {
    const attackId = await convex.mutation(api.poopItems.createAttack, {
      fromUserId: attack.fromUserId,
      fromUserName: attack.fromUserName,
      fromUserEmail: attack.fromUserEmail,
      fromUserPicture: attack.fromUserPicture,
      toUserId: attack.toUserId,
      toUserEmail: attack.toUserEmail,
      itemUsed: attack.itemUsed,
      message: attack.message,
      timestamp: attack.timestamp,
    });
    console.log(`✅ Created attack in Convex from ${attack.fromUserEmail} to ${attack.toUserEmail}`);
    return attackId;
  } catch (error) {
    console.error('❌ Failed to create attack in Convex:', error);
    throw error;
  }
};

export const getUserAttacksFromConvex = async (userId: string): Promise<PoopAttack[]> => {
  try {
    const attacks = await convex.query(api.poopItems.getUserAttacks, { userId });
    console.log(`✅ Fetched ${attacks.length} attacks from Convex for user ${userId}`);
    return attacks.map(attack => ({
      id: attack._id,
      fromUserId: attack.fromUserId,
      fromUserName: attack.fromUserName,
      fromUserEmail: attack.fromUserEmail,
      fromUserPicture: attack.fromUserPicture,
      toUserId: attack.toUserId,
      toUserEmail: attack.toUserEmail,
      itemUsed: attack.itemUsed,
      message: attack.message,
      timestamp: attack.timestamp,
      viewed: attack.viewed,
    }));
  } catch (error) {
    console.error('❌ Failed to get attacks from Convex:', error);
    throw error;
  }
};

export const getUnviewedAttacksFromConvex = async (userId: string): Promise<PoopAttack[]> => {
  try {
    const attacks = await convex.query(api.poopItems.getUnviewedAttacks, { userId });
    console.log(`✅ Fetched ${attacks.length} unviewed attacks from Convex for user ${userId}`);
    return attacks.map(attack => ({
      id: attack._id,
      fromUserId: attack.fromUserId,
      fromUserName: attack.fromUserName,
      fromUserEmail: attack.fromUserEmail,
      fromUserPicture: attack.fromUserPicture,
      toUserId: attack.toUserId,
      toUserEmail: attack.toUserEmail,
      itemUsed: attack.itemUsed,
      message: attack.message,
      timestamp: attack.timestamp,
      viewed: attack.viewed,
    }));
  } catch (error) {
    console.error('❌ Failed to get unviewed attacks from Convex:', error);
    throw error;
  }
};

export const markAttackAsViewedInConvex = async (attackId: string): Promise<void> => {
  try {
    await convex.mutation(api.poopItems.markAttackAsViewed, { attackId: attackId as any });
    console.log(`✅ Marked attack ${attackId} as viewed in Convex`);
  } catch (error) {
    console.error('❌ Failed to mark attack as viewed in Convex:', error);
    throw error;
  }
};

export const cleanupOldAttacksInConvex = async (userId: string): Promise<number> => {
  try {
    const cleanedCount = await convex.mutation(api.poopItems.cleanupOldAttacks, { userId });
    console.log(`✅ Cleaned up ${cleanedCount} old attacks in Convex for user ${userId}`);
    return cleanedCount;
  } catch (error) {
    console.error('❌ Failed to cleanup old attacks in Convex:', error);
    throw error;
  }
};