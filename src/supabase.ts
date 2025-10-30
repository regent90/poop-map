import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 創建 Supabase 客戶端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 檢查 Supabase 連接 (優化版本，減少 API 調用)
let connectionCheckCache: { result: boolean; timestamp: number } | null = null;
const CONNECTION_CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘緩存

export const checkSupabaseConnection = async (): Promise<boolean> => {
  // 使用緩存結果，避免頻繁檢查
  if (connectionCheckCache && 
      Date.now() - connectionCheckCache.timestamp < CONNECTION_CACHE_DURATION) {
    console.log('✅ Using cached Supabase connection status:', connectionCheckCache.result);
    return connectionCheckCache.result;
  }

  try {
    // 使用更輕量的查詢，只檢查表是否存在
    const { error } = await supabase.from('poops').select('id').limit(1).single();
    
    const isConnected = !error || error.code !== 'PGRST116'; // PGRST116 = no rows returned
    
    // 緩存結果
    connectionCheckCache = {
      result: isConnected,
      timestamp: Date.now()
    };
    
    if (isConnected) {
      console.log('✅ Supabase connection successful (cached for 5min)');
    } else {
      console.warn('🔴 Supabase connection test failed:', error?.message);
    }
    
    return isConnected;
  } catch (error) {
    console.warn('🔴 Supabase connection error:', error);
    connectionCheckCache = {
      result: false,
      timestamp: Date.now()
    };
    return false;
  }
};

// 獲取 Supabase 連接狀態
export const getSupabaseConnectionStatus = async (): Promise<'connected' | 'disconnected' | 'error'> => {
  try {
    const isConnected = await checkSupabaseConnection();
    return isConnected ? 'connected' : 'disconnected';
  } catch (error) {
    console.error('Supabase connection status check failed:', error);
    return 'error';
  }
};

// 數據庫表結構定義
export interface SupabaseUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  created_at: string;
  updated_at: string;
}

export interface SupabasePoop {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  timestamp: number;
  rating?: number;
  notes?: string;
  photo?: string;
  privacy: 'private' | 'friends' | 'public';
  place_name?: string;
  custom_location?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseFriend {
  id: string;
  user_id: string;
  friend_email: string;
  friend_name: string;
  friend_picture?: string;
  status: 'accepted' | 'pending' | 'rejected';
  added_at: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseFriendRequest {
  id: string;
  from_user_id: string;
  from_user_name: string;
  from_user_email: string;
  from_user_picture?: string;
  to_user_email: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
  created_at: string;
  updated_at: string;
}

// 數據庫表名常量
export const TABLES = {
  USERS: 'users',
  POOPS: 'poops',
  FRIENDS: 'friends',
  FRIEND_REQUESTS: 'friend_requests'
} as const;