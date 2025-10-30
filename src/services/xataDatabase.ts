import { xata, XataPoop, XataFriend, XataFriendRequest, XataComment, XataLike } from '../xata';
import { Poop, Friend, FriendRequest } from '../types';

// 類型轉換函數
const convertXataPoopToPoop = (xataPoop: any): Poop => ({
  id: xataPoop.id,
  userId: xataPoop.userId,
  lat: xataPoop.lat,
  lng: xataPoop.lng,
  timestamp: xataPoop.timestamp,
  rating: xataPoop.rating,
  notes: xataPoop.notes,
  photo: xataPoop.photo,
  privacy: xataPoop.privacy,
  placeName: xataPoop.placeName,
  customLocation: xataPoop.customLocation,
  address: xataPoop.address
});

const convertPoopToXataPoop = (poop: Poop): Omit<XataPoop, 'createdAt' | 'updatedAt'> => ({
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

const convertXataFriendToFriend = (xataFriend: any): Friend => ({
  id: xataFriend.friendEmail,
  name: xataFriend.friendName,
  email: xataFriend.friendEmail,
  picture: xataFriend.friendPicture,
  status: xataFriend.status as 'pending' | 'accepted' | 'blocked',
  addedAt: xataFriend.addedAt
});

const convertXataFriendRequestToFriendRequest = (xataRequest: any): FriendRequest => ({
  id: xataRequest.id,
  fromUserId: xataRequest.fromUserId,
  fromUserName: xataRequest.fromUserName,
  fromUserEmail: xataRequest.fromUserEmail,
  fromUserPicture: xataRequest.fromUserPicture,
  toUserEmail: xataRequest.toUserEmail,
  status: xataRequest.status,
  timestamp: xataRequest.timestamp
});

// 便便相關操作
export const savePoopToXata = async (poop: Poop): Promise<string> => {
  try {
    const xataPoop = convertPoopToXataPoop(poop);
    
    const result = await xata.db.poops.create({
      ...xataPoop,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Poop saved to Xata:', result.id);
    return result.id;
  } catch (error) {
    console.error('❌ Failed to save poop to Xata:', error);
    throw error;
  }
};

export const getUserPoopsFromXata = async (userEmail: string): Promise<Poop[]> => {
  try {
    const records = await xata.db.poops
      .filter({ userId: userEmail })
      .sort('timestamp', 'desc')
      .getMany();

    const poops = records.map(convertXataPoopToPoop);
    console.log(`✅ Fetched ${poops.length} poops for user ${userEmail} from Xata`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch user poops from Xata:', error);
    throw error;
  }
};

export const getFriendsPoopsFromXata = async (friendEmails: string[]): Promise<Poop[]> => {
  if (friendEmails.length === 0) return [];

  try {
    const records = await xata.db.poops
      .filter({
        $any: [
          { userId: { $is: friendEmails[0] } },
          ...friendEmails.slice(1).map(email => ({ userId: { $is: email } }))
        ],
        privacy: { $any: ['friends', 'public'] }
      })
      .sort('timestamp', 'desc')
      .getMany();

    const poops = records.map(convertXataPoopToPoop);
    console.log(`✅ Fetched ${poops.length} friends poops from Xata`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch friends poops from Xata:', error);
    throw error;
  }
};

export const getPublicPoopsFromXata = async (): Promise<Poop[]> => {
  try {
    const records = await xata.db.poops
      .filter({ privacy: 'public' })
      .sort('timestamp', 'desc')
      .getPaginated({ pagination: { size: 50 } });

    const poops = records.records.map(convertXataPoopToPoop);
    console.log(`✅ Fetched ${poops.length} public poops from Xata`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch public poops from Xata:', error);
    throw error;
  }
};

// 好友相關操作
export const saveFriendToXata = async (userEmail: string, friend: Friend): Promise<string> => {
  try {
    const xataFriend = {
      id: `${userEmail}_${friend.email}`,
      userId: userEmail,
      friendEmail: friend.email,
      friendName: friend.name,
      friendPicture: friend.picture,
      status: friend.status as 'pending' | 'accepted' | 'rejected',
      addedAt: friend.addedAt,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await xata.db.friends.createOrUpdate(xataFriend.id, xataFriend);
    console.log('✅ Friend saved to Xata:', result.id);
    return result.id;
  } catch (error) {
    console.error('❌ Failed to save friend to Xata:', error);
    throw error;
  }
};

export const getUserFriendsFromXata = async (userEmail: string): Promise<Friend[]> => {
  try {
    const records = await xata.db.friends
      .filter({ 
        userId: userEmail,
        status: 'accepted'
      })
      .getMany();

    const friends = records.map(convertXataFriendToFriend);
    console.log(`✅ Fetched ${friends.length} friends for user ${userEmail} from Xata`);
    return friends;
  } catch (error) {
    console.error('❌ Failed to fetch user friends from Xata:', error);
    throw error;
  }
};

// 解除好友功能
export const removeFriendFromXata = async (userEmail: string, friendEmail: string): Promise<void> => {
  try {
    const friendId = `${userEmail}_${friendEmail}`;
    await xata.db.friends.delete(friendId);
    console.log(`✅ Friend ${friendEmail} removed from ${userEmail}'s friend list in Xata`);
  } catch (error) {
    console.error('❌ Failed to remove friend from Xata:', error);
    throw error;
  }
};

// 好友請求相關操作
export const sendFriendRequestToXata = async (request: FriendRequest): Promise<string> => {
  try {
    const xataRequest = {
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

    const result = await xata.db.friendRequests.create(xataRequest);
    console.log('✅ Friend request sent to Xata:', result.id);
    return result.id;
  } catch (error) {
    console.error('❌ Failed to send friend request to Xata:', error);
    throw error;
  }
};

export const getUserFriendRequestsFromXata = async (userEmail: string): Promise<FriendRequest[]> => {
  try {
    const records = await xata.db.friendRequests
      .filter({
        toUserEmail: userEmail,
        status: 'pending'
      })
      .sort('timestamp', 'desc')
      .getMany();

    const requests = records.map(convertXataFriendRequestToFriendRequest);
    console.log(`✅ Fetched ${requests.length} friend requests for user ${userEmail} from Xata`);
    return requests;
  } catch (error) {
    console.error('❌ Failed to fetch friend requests from Xata:', error);
    throw error;
  }
};

export const updateFriendRequestStatusInXata = async (requestId: string, status: 'accepted' | 'rejected'): Promise<void> => {
  try {
    await xata.db.friendRequests.update(requestId, {
      status,
      updatedAt: new Date()
    });

    console.log(`✅ Friend request ${requestId} status updated to ${status} in Xata`);
  } catch (error) {
    console.error('❌ Failed to update friend request status in Xata:', error);
    throw error;
  }
};

// 留言相關操作
export const addCommentToXata = async (poopId: string, userId: string, userEmail: string, userName: string, content: string, userPicture?: string): Promise<string> => {
  try {
    const comment = {
      poopId,
      userId,
      userEmail,
      userName,
      userPicture,
      content,
      timestamp: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await xata.db.comments.create(comment);
    console.log('✅ Comment added to Xata:', result.id);
    return result.id;
  } catch (error) {
    console.error('❌ Failed to add comment to Xata:', error);
    throw error;
  }
};

export const getCommentsFromXata = async (poopId: string): Promise<any[]> => {
  try {
    const records = await xata.db.comments
      .filter({ poopId })
      .sort('timestamp', 'asc')
      .getMany();

    console.log(`✅ Fetched ${records.length} comments for poop ${poopId} from Xata`);
    return records;
  } catch (error) {
    console.error('❌ Failed to fetch comments from Xata:', error);
    throw error;
  }
};

export const deleteCommentFromXata = async (commentId: string): Promise<void> => {
  try {
    await xata.db.comments.delete(commentId);
    console.log('✅ Comment deleted from Xata:', commentId);
  } catch (error) {
    console.error('❌ Failed to delete comment from Xata:', error);
    throw error;
  }
};

// 按讚相關操作
export const addLikeToXata = async (poopId: string, userId: string, userEmail: string, userName: string, userPicture?: string): Promise<string> => {
  try {
    // 檢查是否已經按過讚
    const existingLike = await xata.db.likes
      .filter({ poopId, userId })
      .getFirst();

    if (existingLike) {
      throw new Error('ALREADY_LIKED');
    }

    const like = {
      poopId,
      userId,
      userEmail,
      userName,
      userPicture,
      timestamp: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await xata.db.likes.create(like);
    console.log('✅ Like added to Xata:', result.id);
    return result.id;
  } catch (error: any) {
    if (error.message === 'ALREADY_LIKED') {
      throw new Error('已經按過讚了');
    }
    console.error('❌ Failed to add like to Xata:', error);
    throw error;
  }
};

export const getLikesFromXata = async (poopId: string): Promise<any[]> => {
  try {
    const records = await xata.db.likes
      .filter({ poopId })
      .sort('timestamp', 'desc')
      .getMany();

    console.log(`✅ Fetched ${records.length} likes for poop ${poopId} from Xata`);
    return records;
  } catch (error) {
    console.error('❌ Failed to fetch likes from Xata:', error);
    throw error;
  }
};

export const removeLikeFromXata = async (poopId: string, userId: string): Promise<void> => {
  try {
    const existingLike = await xata.db.likes
      .filter({ poopId, userId })
      .getFirst();

    if (existingLike) {
      await xata.db.likes.delete(existingLike.id);
      console.log('✅ Like removed from Xata:', { poopId, userId });
    }
  } catch (error) {
    console.error('❌ Failed to remove like from Xata:', error);
    throw error;
  }
};

// 實時訂閱功能 (Xata 支持 WebSocket 訂閱)
export const subscribeToUserPoopsInXata = (userEmail: string, callback: (poops: Poop[]) => void) => {
  console.log(`🔄 Setting up Xata real-time subscription for user poops: ${userEmail}`);
  
  // Xata 的實時訂閱
  const subscription = xata.db.poops
    .filter({ userId: userEmail })
    .watch((records) => {
      const poops = records.map(convertXataPoopToPoop);
      callback(poops);
    });

  return () => {
    console.log(`🔄 Unsubscribing from Xata user poops: ${userEmail}`);
    subscription.unsubscribe();
  };
};

export const subscribeToFriendRequestsInXata = (userEmail: string, callback: (requests: FriendRequest[]) => void) => {
  console.log(`🔄 Setting up Xata real-time subscription for friend requests: ${userEmail}`);
  
  const subscription = xata.db.friendRequests
    .filter({ toUserEmail: userEmail, status: 'pending' })
    .watch((records) => {
      const requests = records.map(convertXataFriendRequestToFriendRequest);
      callback(requests);
    });

  return () => {
    console.log(`🔄 Unsubscribing from Xata friend requests: ${userEmail}`);
    subscription.unsubscribe();
  };
};

export const subscribeToPoopInteractionsInXata = (poopId: string, callback: (data: { likes: any[], comments: any[] }) => void) => {
  console.log(`🔄 Setting up Xata real-time subscription for poop interactions: ${poopId}`);
  
  const likesSubscription = xata.db.likes
    .filter({ poopId })
    .watch(() => {
      // 當按讚變化時，重新獲取數據
      Promise.all([
        getLikesFromXata(poopId),
        getCommentsFromXata(poopId)
      ]).then(([likes, comments]) => {
        callback({ likes, comments });
      });
    });

  const commentsSubscription = xata.db.comments
    .filter({ poopId })
    .watch(() => {
      // 當留言變化時，重新獲取數據
      Promise.all([
        getLikesFromXata(poopId),
        getCommentsFromXata(poopId)
      ]).then(([likes, comments]) => {
        callback({ likes, comments });
      });
    });

  return () => {
    console.log(`🔄 Unsubscribing from Xata poop interactions: ${poopId}`);
    likesSubscription.unsubscribe();
    commentsSubscription.unsubscribe();
  };
};