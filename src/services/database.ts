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
import { Poop, Friend, FriendRequest } from '../types';

// Collections
const POOPS_COLLECTION = 'poops';
const FRIENDS_COLLECTION = 'friends';
const FRIEND_REQUESTS_COLLECTION = 'friendRequests';
const USERS_COLLECTION = 'users';

// Poop operations
export const savePoopToCloud = async (poop: Poop): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, POOPS_COLLECTION), {
      ...poop,
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
    await addDoc(collection(db, FRIENDS_COLLECTION), {
      userId,
      friendId: friend.id,
      friendEmail: friend.email,
      friendName: friend.name,
      friendPicture: friend.picture,
      status: friend.status,
      addedAt: Timestamp.now()
    });
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
export const sendFriendRequest = async (request: FriendRequest): Promise<void> => {
  try {
    await addDoc(collection(db, FRIEND_REQUESTS_COLLECTION), {
      ...request,
      createdAt: Timestamp.now()
    });
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
    const requestRef = doc(db, FRIEND_REQUESTS_COLLECTION, requestId);
    await updateDoc(requestRef, {
      status,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating friend request:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToUserPoops = (userId: string, callback: (poops: Poop[]) => void) => {
  const q = query(
    collection(db, POOPS_COLLECTION),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const poops = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Poop));
    callback(poops);
  });
};

export const subscribeToFriendRequests = (userEmail: string, callback: (requests: FriendRequest[]) => void) => {
  const q = query(
    collection(db, FRIEND_REQUESTS_COLLECTION),
    where('toUserEmail', '==', userEmail),
    where('status', '==', 'pending')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const requests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FriendRequest));
    callback(requests);
  });
};