// API 調用限制配置

export const API_LIMITS = {
  // 緩存持續時間 (毫秒)
  CONNECTION_CHECK_CACHE: 5 * 60 * 1000, // 5 分鐘
  DATABASE_PROVIDER_CACHE: 10 * 60 * 1000, // 10 分鐘
  PUBLIC_POOPS_CACHE: 5 * 60 * 1000, // 5 分鐘
  USER_POOPS_CACHE: 2 * 60 * 1000, // 2 分鐘
  FRIENDS_CACHE: 5 * 60 * 1000, // 5 分鐘
  
  // 防抖延遲 (毫秒)
  REALTIME_DEBOUNCE: 1000, // 1 秒
  SEARCH_DEBOUNCE: 500, // 0.5 秒
  
  // 查詢限制
  PUBLIC_POOPS_LIMIT: 50, // 減少公開便便查詢數量
  FRIENDS_POOPS_LIMIT: 100, // 好友便便查詢數量
  
  // 重試配置
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 秒
  
  // 開發模式設置
  DEVELOPMENT_MODE: import.meta.env.DEV,
  ENABLE_VERBOSE_LOGGING: import.meta.env.DEV,
};

// 開發模式下的額外限制
if (API_LIMITS.DEVELOPMENT_MODE) {
  console.log('🔧 Development mode: API limits enabled');
  
  // 開發模式下更嚴格的限制
  API_LIMITS.CONNECTION_CHECK_CACHE = 10 * 60 * 1000; // 10 分鐘
  API_LIMITS.PUBLIC_POOPS_LIMIT = 20; // 更少的公開便便
}

// API 調用計數器 (僅開發模式)
export const apiCallCounter = {
  supabase: 0,
  firebase: 0,
  total: 0,
  
  increment(provider: 'supabase' | 'firebase') {
    this[provider]++;
    this.total++;
    
    if (API_LIMITS.ENABLE_VERBOSE_LOGGING) {
      console.log(`📊 API Calls - Supabase: ${this.supabase}, Firebase: ${this.firebase}, Total: ${this.total}`);
    }
  },
  
  reset() {
    this.supabase = 0;
    this.firebase = 0;
    this.total = 0;
    console.log('🔄 API call counter reset');
  },
  
  getStats() {
    return {
      supabase: this.supabase,
      firebase: this.firebase,
      total: this.total
    };
  }
};

// 每小時重置計數器
if (API_LIMITS.DEVELOPMENT_MODE) {
  setInterval(() => {
    apiCallCounter.reset();
  }, 60 * 60 * 1000); // 1 小時
}