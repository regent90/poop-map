# MongoDB Atlas 設置指南

## 🍃 快速開始

### 1. 創建 MongoDB Atlas 帳戶
1. 前往 [MongoDB Atlas](https://www.mongodb.com/atlas)
2. 點擊 "Try Free" 註冊免費帳戶
3. 選擇 "Build a Database"

### 2. 創建免費集群
1. 選擇 **M0 Sandbox** (免費方案)
2. 選擇雲端提供商：**AWS**
3. 選擇區域：**Singapore (ap-southeast-1)** 或最近的區域
4. 集群名稱：`poop-map-cluster`
5. 點擊 "Create Cluster"

### 3. 設置數據庫訪問
1. 在左側菜單點擊 **"Database Access"**
2. 點擊 **"Add New Database User"**
3. 選擇 **"Password"** 認證方式
4. 用戶名：`poopmap-user`
5. 密碼：生成強密碼並記住
6. 權限：選擇 **"Read and write to any database"**
7. 點擊 "Add User"

### 4. 設置網絡訪問
1. 在左側菜單點擊 **"Network Access"**
2. 點擊 **"Add IP Address"**
3. 選擇 **"Allow Access from Anywhere"** (0.0.0.0/0)
   - 注意：生產環境建議限制特定 IP
4. 點擊 "Confirm"

### 5. 獲取連接字符串
1. 回到 **"Database"** 頁面
2. 點擊集群的 **"Connect"** 按鈕
3. 選擇 **"Connect your application"**
4. 選擇 **Driver: Node.js** 和 **Version: 4.1 or later**
5. 複製連接字符串，格式如下：
   ```
   mongodb+srv://poopmap-user:<password>@poop-map-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. 更新環境變量
在 `.env.local` 文件中更新：

```env
# MongoDB Atlas Configuration (主要數據庫)
VITE_MONGODB_URI=mongodb+srv://poopmap-user:your_password@poop-map-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
VITE_MONGODB_DB_NAME=poopmap
```

**重要**：將 `<password>` 替換為你設置的實際密碼！

## 📊 數據庫結構

### Collections (集合)
- `users` - 用戶資料
- `poops` - 便便記錄
- `friends` - 好友關係
- `friend_requests` - 好友請求

### 索引優化
應用會自動創建以下索引：

#### poops 集合
- `{ userId: 1 }` - 用戶便便查詢
- `{ privacy: 1 }` - 隱私篩選
- `{ timestamp: -1 }` - 時間排序
- `{ userId: 1, privacy: 1 }` - 複合查詢
- `{ lat: 1, lng: 1 }` - 地理位置

#### friends 集合
- `{ userId: 1 }` - 用戶好友查詢
- `{ status: 1 }` - 狀態篩選
- `{ userId: 1, status: 1 }` - 複合查詢
- `{ userId: 1, friendEmail: 1 }` - 唯一約束

#### friend_requests 集合
- `{ toUserEmail: 1 }` - 接收者查詢
- `{ status: 1 }` - 狀態篩選
- `{ toUserEmail: 1, status: 1 }` - 複合查詢

## 🚀 使用方式

### 1. 設置數據庫
```bash
# 啟動應用
npm run dev

# 打開調試器
# 點擊右下角 🔍 按鈕
# 點擊 "MongoDB" 按鈕
# 點擊 "設置 MongoDB"
```

### 2. 遷移數據
```bash
# 在調試器中點擊 "遷移數據"
# 會將 localStorage 中的數據遷移到 MongoDB
```

### 3. 驗證連接
應用啟動時會在控制台顯示：
```
🍃 Connecting to MongoDB Atlas...
✅ MongoDB Atlas connected successfully
🔍 Creating MongoDB indexes...
✅ MongoDB indexes created successfully
📊 Current database provider: mongodb
```

## 🔄 數據庫優先級

新的數據庫選擇順序：
1. **MongoDB Atlas** (主要) - 如果配置且可連接
2. **Supabase** (備選) - 如果 MongoDB 不可用
3. **Firebase** (備選) - 如果前兩者都不可用
4. **localStorage** (離線) - 最後備選

## 📈 MongoDB Atlas 優勢

### 免費方案限制
- **存儲空間**: 512 MB
- **連接數**: 500 個並發連接
- **網絡傳輸**: 無限制
- **備份**: 無自動備份

### 技術優勢
- **文檔數據庫**: 適合 JSON 數據結構
- **水平擴展**: 支持分片和副本集
- **豐富查詢**: 支持複雜查詢和聚合
- **地理空間**: 內建地理位置查詢支持
- **全文搜索**: 支持文本搜索功能

### 性能優勢
- **全球部署**: 多區域數據中心
- **自動索引**: 智能索引建議
- **實時監控**: 詳細的性能指標
- **自動擴展**: 根據負載自動調整

## 🔧 故障排除

### 常見問題

#### 1. 連接失敗
```
❌ MongoDB connection failed: MongoNetworkError
```
**解決方案**：
- 檢查網絡訪問設置 (允許 0.0.0.0/0)
- 確認用戶名和密碼正確
- 檢查連接字符串格式

#### 2. 認證失敗
```
❌ MongoDB connection failed: MongoServerError: Authentication failed
```
**解決方案**：
- 確認數據庫用戶已創建
- 檢查密碼是否正確
- 確認用戶權限設置

#### 3. 數據庫不存在
```
❌ MongoDB connection failed: Database not found
```
**解決方案**：
- MongoDB 會自動創建數據庫
- 確認 `VITE_MONGODB_DB_NAME` 設置正確

### 調試技巧
1. 打開瀏覽器開發者工具查看控制台日誌
2. 使用 MongoDB Atlas 的 "Metrics" 查看連接狀態
3. 檢查 "Network Access" 中的 IP 白名單

## 💡 最佳實踐

### 安全性
- 生產環境限制 IP 訪問範圍
- 使用強密碼
- 定期輪換密碼
- 啟用雙因素認證

### 性能
- 合理使用索引
- 限制查詢結果數量
- 使用投影減少數據傳輸
- 監控慢查詢

### 成本控制
- 監控存儲使用量
- 優化查詢效率
- 清理不必要的數據
- 考慮數據歸檔策略

---

**MongoDB Atlas 設置完成後，你的便便地圖應用將擁有更強大、更可靠的數據庫支持！** 🍃✨