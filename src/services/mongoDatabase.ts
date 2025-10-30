import { COLLECTIONS, MongoPoop, MongoFriend, MongoFriendRequest } from '../mongodb';
import { Poop, Friend, FriendRequest } from '../types';
import { 
  savePoopToMongoDataAPI,
  getUserPoopsFromMongoDataAPI,
  getFriendsPoopsFromMongoDataAPI,
  getPublicPoopsFromMongoDataAPI,
  saveFriendToMongoDataAPI,
  getUserFriendsFromMongoDataAPI,
  sendFriendRequestToMongoDataAPI,
  getUserFriendRequestsFromMongoDataAPI,
  updateFriendRequestStatusInMongoDataAPI,
  subscribeToUserPoopsInMongoDataAPI,
  subscribeToFriendRequestsInMongoDataAPI
} from './mongoDataAPI';

// MongoDB 數據庫服務 - 使用 Data API 實現

// 便便相關操作 - 直接使用 Data API 函數
export const savePoopToMongoDB = savePoopToMongoDataAPI;
export const getUserPoopsFromMongoDB = getUserPoopsFromMongoDataAPI;
export const getFriendsPoopsFromMongoDB = getFriendsPoopsFromMongoDataAPI;
export const getPublicPoopsFromMongoDB = getPublicPoopsFromMongoDataAPI;

// 好友相關操作 - 直接使用 Data API 函數
export const saveFriendToMongoDB = saveFriendToMongoDataAPI;
export const getUserFriendsFromMongoDB = getUserFriendsFromMongoDataAPI;

// 好友請求相關操作 - 直接使用 Data API 函數
export const sendFriendRequestToMongoDB = sendFriendRequestToMongoDataAPI;
export const getUserFriendRequestsFromMongoDB = getUserFriendRequestsFromMongoDataAPI;
export const updateFriendRequestStatusInMongoDB = updateFriendRequestStatusInMongoDataAPI;

// 訂閱相關操作 - 直接使用 Data API 函數
export const subscribeToUserPoopsInMongoDB = subscribeToUserPoopsInMongoDataAPI;
export const subscribeToFriendRequestsInMongoDB = subscribeToFriendRequestsInMongoDataAPI;