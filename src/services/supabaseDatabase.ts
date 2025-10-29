import { supabase, TABLES, SupabasePoop, SupabaseFriend, SupabaseFriendRequest } from '../supabase';
import { Poop, Friend, FriendRequest } from '../types';

// 類型轉換函數
const convertSupabasePoopToPoop = (supabasePoop: SupabasePoop): Poop => ({
  id: supabasePoop.id,
  userId: supabasePoop.user_id,
  lat: supabasePoop.lat,
  lng: supabasePoop.lng,
  timestamp: supabasePoop.timestamp,
  rating: supabasePoop.rating,
  notes: supabasePoop.notes,
  photo: supabasePoop.photo,
  privacy: supabasePoop.privacy,
  placeName: supabasePoop.place_name,
  customLocation: supabasePoop.custom_location,
  address: supabasePoop.address
});

const convertPoopToSupabasePoop = (poop: Poop): Omit<SupabasePoop, 'created_at' | 'updated_at'> => ({
  id: poop.id,
  user_id: poop.userId,
  lat: poop.lat,
  lng: poop.lng,
  timestamp: poop.timestamp,
  rating: poop.rating,
  notes: poop.notes,
  photo: poop.photo,
  privacy: poop.privacy,
  place_name: poop.placeName,
  custom_location: poop.customLocation,
  address: poop.address
});

const convertSupabaseFriendToFriend = (supabaseFriend: SupabaseFriend): Friend => ({
  id: supabaseFriend.friend_email,
  name: supabaseFriend.friend_name,
  email: supabaseFriend.friend_email,
  picture: supabaseFriend.friend_picture,
  status: supabaseFriend.status as 'pending' | 'accepted' | 'blocked',
  addedAt: supabaseFriend.added_at
});

const convertSupabaseFriendRequestToFriendRequest = (supabaseRequest: SupabaseFriendRequest): FriendRequest => ({
  id: supabaseRequest.id,
  fromUserId: supabaseRequest.from_user_id,
  fromUserName: supabaseRequest.from_user_name,
  fromUserEmail: supabaseRequest.from_user_email,
  fromUserPicture: supabaseRequest.from_user_picture,
  toUserEmail: supabaseRequest.to_user_email,
  status: supabaseRequest.status,
  timestamp: supabaseRequest.timestamp
});

// 便便相關操作
export const savePoopToSupabase = async (poop: Poop): Promise<string> => {
  try {
    const supabasePoop = convertPoopToSupabasePoop(poop);
    
    const { data, error } = await supabase
      .from(TABLES.POOPS)
      .insert([supabasePoop])
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving poop to Supabase:', error);
      throw error;
    }

    console.log('✅ Poop saved to Supabase:', data.id);
    return data.id;
  } catch (error) {
    console.error('❌ Failed to save poop to Supabase:', error);
    throw error;
  }
};

export const getUserPoopsFromSupabase = async (userEmail: string): Promise<Poop[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.POOPS)
      .select('*')
      .eq('user_id', userEmail)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('❌ Error fetching user poops from Supabase:', error);
      throw error;
    }

    const poops = data.map(convertSupabasePoopToPoop);
    console.log(`✅ Fetched ${poops.length} poops for user ${userEmail} from Supabase`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch user poops from Supabase:', error);
    throw error;
  }
};

export const getFriendsPoopsFromSupabase = async (friendEmails: string[]): Promise<Poop[]> => {
  if (friendEmails.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from(TABLES.POOPS)
      .select('*')
      .in('user_id', friendEmails)
      .in('privacy', ['friends', 'public'])
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('❌ Error fetching friends poops from Supabase:', error);
      throw error;
    }

    const poops = data.map(convertSupabasePoopToPoop);
    console.log(`✅ Fetched ${poops.length} friends poops from Supabase`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch friends poops from Supabase:', error);
    throw error;
  }
};

export const getPublicPoopsFromSupabase = async (): Promise<Poop[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.POOPS)
      .select('*')
      .eq('privacy', 'public')
      .order('timestamp', { ascending: false })
      .limit(100); // 限制公開便便數量

    if (error) {
      console.error('❌ Error fetching public poops from Supabase:', error);
      throw error;
    }

    const poops = data.map(convertSupabasePoopToPoop);
    console.log(`✅ Fetched ${poops.length} public poops from Supabase`);
    return poops;
  } catch (error) {
    console.error('❌ Failed to fetch public poops from Supabase:', error);
    throw error;
  }
};

// 好友相關操作
export const saveFriendToSupabase = async (userEmail: string, friend: Friend): Promise<string> => {
  try {
    const supabaseFriend: Omit<SupabaseFriend, 'created_at' | 'updated_at'> = {
      id: `${userEmail}_${friend.email}`,
      user_id: userEmail,
      friend_email: friend.email,
      friend_name: friend.name,
      friend_picture: friend.picture,
      status: friend.status as 'pending' | 'accepted' | 'rejected',
      added_at: friend.addedAt
    };

    const { data, error } = await supabase
      .from(TABLES.FRIENDS)
      .upsert([supabaseFriend])
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving friend to Supabase:', error);
      throw error;
    }

    console.log('✅ Friend saved to Supabase:', data.id);
    return data.id;
  } catch (error) {
    console.error('❌ Failed to save friend to Supabase:', error);
    throw error;
  }
};

export const getUserFriendsFromSupabase = async (userEmail: string): Promise<Friend[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.FRIENDS)
      .select('*')
      .eq('user_id', userEmail)
      .eq('status', 'accepted');

    if (error) {
      console.error('❌ Error fetching user friends from Supabase:', error);
      throw error;
    }

    const friends = data.map(convertSupabaseFriendToFriend);
    console.log(`✅ Fetched ${friends.length} friends for user ${userEmail} from Supabase`);
    return friends;
  } catch (error) {
    console.error('❌ Failed to fetch user friends from Supabase:', error);
    throw error;
  }
};

// 好友請求相關操作
export const sendFriendRequestToSupabase = async (request: FriendRequest): Promise<string> => {
  try {
    const supabaseRequest: Omit<SupabaseFriendRequest, 'created_at' | 'updated_at'> = {
      id: request.id,
      from_user_id: request.fromUserId,
      from_user_name: request.fromUserName,
      from_user_email: request.fromUserEmail,
      from_user_picture: request.fromUserPicture,
      to_user_email: request.toUserEmail,
      status: request.status,
      timestamp: request.timestamp
    };

    const { data, error } = await supabase
      .from(TABLES.FRIEND_REQUESTS)
      .insert([supabaseRequest])
      .select()
      .single();

    if (error) {
      console.error('❌ Error sending friend request to Supabase:', error);
      throw error;
    }

    console.log('✅ Friend request sent to Supabase:', data.id);
    return data.id;
  } catch (error) {
    console.error('❌ Failed to send friend request to Supabase:', error);
    throw error;
  }
};

export const getUserFriendRequestsFromSupabase = async (userEmail: string): Promise<FriendRequest[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.FRIEND_REQUESTS)
      .select('*')
      .eq('to_user_email', userEmail)
      .eq('status', 'pending')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('❌ Error fetching friend requests from Supabase:', error);
      throw error;
    }

    const requests = data.map(convertSupabaseFriendRequestToFriendRequest);
    console.log(`✅ Fetched ${requests.length} friend requests for user ${userEmail} from Supabase`);
    return requests;
  } catch (error) {
    console.error('❌ Failed to fetch friend requests from Supabase:', error);
    throw error;
  }
};

export const updateFriendRequestStatusInSupabase = async (requestId: string, status: 'accepted' | 'rejected'): Promise<void> => {
  try {
    const { error } = await supabase
      .from(TABLES.FRIEND_REQUESTS)
      .update({ status })
      .eq('id', requestId);

    if (error) {
      console.error('❌ Error updating friend request status in Supabase:', error);
      throw error;
    }

    console.log(`✅ Friend request ${requestId} status updated to ${status} in Supabase`);
  } catch (error) {
    console.error('❌ Failed to update friend request status in Supabase:', error);
    throw error;
  }
};

// 實時訂閱功能
export const subscribeToUserPoopsInSupabase = (userEmail: string, callback: (poops: Poop[]) => void) => {
  console.log(`🔄 Setting up real-time subscription for user poops: ${userEmail}`);
  
  const subscription = supabase
    .channel(`user_poops_${userEmail}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.POOPS,
        filter: `user_id=eq.${userEmail}`
      },
      async () => {
        // 當有變化時重新獲取數據
        try {
          const poops = await getUserPoopsFromSupabase(userEmail);
          callback(poops);
        } catch (error) {
          console.error('❌ Error in real-time poops callback:', error);
        }
      }
    )
    .subscribe();

  return () => {
    console.log(`🔄 Unsubscribing from user poops: ${userEmail}`);
    supabase.removeChannel(subscription);
  };
};

export const subscribeToFriendRequestsInSupabase = (userEmail: string, callback: (requests: FriendRequest[]) => void) => {
  console.log(`🔄 Setting up real-time subscription for friend requests: ${userEmail}`);
  
  const subscription = supabase
    .channel(`friend_requests_${userEmail}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.FRIEND_REQUESTS,
        filter: `to_user_email=eq.${userEmail}`
      },
      async () => {
        // 當有變化時重新獲取數據
        try {
          const requests = await getUserFriendRequestsFromSupabase(userEmail);
          callback(requests);
        } catch (error) {
          console.error('❌ Error in real-time friend requests callback:', error);
        }
      }
    )
    .subscribe();

  return () => {
    console.log(`🔄 Unsubscribing from friend requests: ${userEmail}`);
    supabase.removeChannel(subscription);
  };
};