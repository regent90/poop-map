import { COLLECTIONS, MongoPoop, MongoFriend, MongoFriendRequest } from '../mongodb';
import { Poop, Friend, FriendRequest } from '../types';
import { 
  savePoopToBackend,
  getUserPoopsFromBackend,
  getFriendsPoopsFromBackend,
  getPublicPoopsFromBackend,
  saveFriendToBackend,
  getUserFriendsFromBackend,
  sendFriendRequestToBackend,
  getUserFriendRequestsFromBackend,
  updateFriendRequestStatusInBackend,
  subscribeToUserPoopsInBackend,
  subscribeToFriendRequestsInBackend
} from './mongoBackendAPI';

// MongoDB 數據庫服務 - 使用 Data API 實現

// 便便相關操作 - 使用後端 API
export const savePoopToMongoDB = savePoopToBackend;
export const getUserPoopsFromMongoDB = getUserPoopsFromBackend;
export const getFriendsPoopsFromMongoDB = getFriendsPoopsFromBackend;
export const getPublicPoopsFromMongoDB = getPublicPoopsFromBackend;

// 好友相關操作 - 使用後端 API
export const saveFriendToMongoDB = saveFriendToBackend;
export const getUserFriendsFromMongoDB = getUserFriendsFromBackend;

// 好友請求相關操作 - 使用後端 API
export const sendFriendRequestToMongoDB = sendFriendRequestToBackend;
export const getUserFriendRequestsFromMongoDB = getUserFriendRequestsFromBackend;
export const updateFriendRequestStatusInMongoDB = updateFriendRequestStatusInBackend;

// 訂閱相關操作 - 使用後端 API
export const subscribeToUserPoopsInMongoDB = subscribeToUserPoopsInBackend;
export const subscribeToFriendRequestsInMongoDB = subscribeToFriendRequestsInBackend;