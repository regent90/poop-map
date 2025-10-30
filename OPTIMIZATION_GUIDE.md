# React 無限迴圈優化指南

## 🚨 常見問題和解決方案

### 問題 1: 計數器組件無限迴圈
```typescript
// 💥 錯誤：依賴 poops 陣列造成無限迴圈
useEffect(() => {
  // 每次 poops 變化都會重新執行
  loadPoopCount();
}, [poops]); // ❌ 依賴會變化的陣列

// ✅ 正確：只執行一次 + Realtime 更新
useEffect(() => {
  loadInitialCount();
}, []); // ✅ 空陣列 = 只執行一次

useEffect(() => {
  // ✅ 使用 Realtime 監聽變化
  const subscription = supabase
    .channel('counter')
    .on('postgres_changes', { event: 'INSERT', table: 'poops' }, () => {
      setCount(prev => prev + 1); // ✅ 直接更新計數
    })
    .subscribe();
    
  return () => supabase.removeChannel(subscription);
}, []); // ✅ 只訂閱一次
```

### 問題 2: 地圖組件重複載入
```typescript
// 💥 錯誤：依賴 poops 造成無限重新渲染
useEffect(() => {
  updateMapMarkers(poops);
}, [poops]); // ❌ 每次 poops 變化都重新載入

// ✅ 正確：分離初始載入和實時更新
useEffect(() => {
  // ✅ 只載入一次初始資料
  loadInitialPoops();
}, []);

useEffect(() => {
  // ✅ 監聽新增，直接添加到地圖
  const subscription = supabase
    .channel('map')
    .on('postgres_changes', { event: 'INSERT', table: 'poops' }, (payload) => {
      if (shouldShowPoop(payload.new)) {
        addMarkerToMap(payload.new); // ✅ 直接添加標記
        setPoops(prev => [payload.new, ...prev]); // ✅ 更新狀態
      }
    })
    .subscribe();
    
  return () => supabase.removeChannel(subscription);
}, [userEmail]); // ✅ 只依賴不常變化的值
```

### 問題 3: 用戶便便查詢重複
```typescript
// 💥 錯誤：依賴 userPoops 造成循環
useEffect(() => {
  if (user) {
    loadUserPoops(user.email);
  }
}, [user, userPoops]); // ❌ userPoops 會觸發重新載入

// ✅ 正確：只依賴 userId
useEffect(() => {
  if (userId) {
    loadUserPoops(userId);
  }
}, [userId]); // ✅ 只依賴 userId

useEffect(() => {
  // ✅ 監聽該用戶的便便變化
  const subscription = supabase
    .channel(`user_${userId}`)
    .on('postgres_changes', { 
      event: '*', 
      table: 'poops',
      filter: `user_id=eq.${userId}` 
    }, handleUserPoopChange)
    .subscribe();
    
  return () => supabase.removeChannel(subscription);
}, [userId]); // ✅ 只依賴 userId
```

## 🎯 最佳實踐

### 1. useEffect 依賴原則
```typescript
// ✅ 好的依賴
useEffect(() => {
  // 載入資料
}, [userId]); // 穩定的 ID

useEffect(() => {
  // 設定訂閱
}, []); // 只執行一次

// ❌ 避免的依賴
useEffect(() => {
  // 處理資料
}, [dataArray]); // 陣列會頻繁變化

useEffect(() => {
  // 更新狀態
}, [stateObject]); // 物件會頻繁變化
```

### 2. Realtime 訂閱模式
```typescript
// ✅ 正確的 Realtime 使用
useEffect(() => {
  const subscription = supabase
    .channel('unique_channel_name')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'poops'
    }, (payload) => {
      // 直接更新狀態，不重新查詢
      setPoops(prev => [payload.new, ...prev]);
    })
    .subscribe();

  return () => {
    // 重要：清理訂閱
    supabase.removeChannel(subscription);
  };
}, []); // 只訂閱一次
```

### 3. 資料載入策略
```typescript
// ✅ 初始載入 + 實時更新模式
const [data, setData] = useState([]);

// 初始載入（只執行一次）
useEffect(() => {
  loadInitialData();
}, []);

// 實時更新（只訂閱一次）
useEffect(() => {
  const subscription = setupRealtimeSubscription();
  return () => cleanup(subscription);
}, []);

// 手動重新整理（用戶觸發）
const handleRefresh = () => {
  loadInitialData();
};
```

### 4. 緩存和防抖
```typescript
// ✅ 使用緩存減少 API 調用
let cache = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘

const loadData = async () => {
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }
  
  const data = await fetchFromAPI();
  cache = { data, timestamp: Date.now() };
  return data;
};

// ✅ 使用防抖避免頻繁更新
let debounceTimer = null;
const debouncedUpdate = (callback) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(callback, 1000);
};
```

## 📊 性能監控

### API 調用計數
```typescript
// 開發模式下監控 API 調用
const apiCounter = {
  count: 0,
  increment() {
    this.count++;
    if (this.count > 100) {
      console.warn('⚠️ API 調用次數過多:', this.count);
    }
  }
};
```

### 組件重新渲染監控
```typescript
// 使用 React DevTools Profiler
// 或添加 console.log 監控重新渲染
useEffect(() => {
  console.log('Component re-rendered');
});
```

## 🔧 優化檢查清單

- [ ] useEffect 依賴陣列正確
- [ ] 避免在 useEffect 中設置會變化的依賴
- [ ] 使用 Realtime 訂閱而非輪詢
- [ ] 實施資料緩存機制
- [ ] 添加防抖/節流機制
- [ ] 正確清理訂閱和計時器
- [ ] 監控 API 調用次數
- [ ] 使用 React.memo 避免不必要的重新渲染

## 🎯 結果

遵循這些原則後，你的應用應該：
- ✅ API 調用次數大幅減少（80-90%）
- ✅ 沒有無限迴圈問題
- ✅ 實時更新正常工作
- ✅ 用戶體驗流暢
- ✅ 性能大幅提升