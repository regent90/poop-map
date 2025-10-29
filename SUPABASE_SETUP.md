# Supabase 設置指南

## 🚀 快速開始

### 1. 創建 Supabase 項目
1. 前往 [Supabase](https://supabase.com)
2. 註冊並創建新項目
3. 等待項目初始化完成

### 2. 獲取項目配置
1. 在項目儀表板中，點擊左側的 "Settings" → "API"
2. 複製以下信息：
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon public key**: `eyJ...` (公開匿名密鑰)

### 3. 更新環境變量
在 `.env.local` 文件中更新以下變量：

```env
# Supabase Configuration (主要數據庫)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key
```

### 4. 創建數據庫表
1. 在 Supabase 儀表板中，點擊左側的 "SQL Editor"
2. 複製 `supabase-schema.sql` 文件的內容
3. 貼上並執行 SQL 語句

### 5. 配置認證 (可選)
如果需要用戶認證功能：
1. 點擊左側的 "Authentication" → "Settings"
2. 配置 Google OAuth (使用現有的 Google Client ID)
3. 在 "Site URL" 中添加你的域名

## 📊 數據庫表結構

### users (用戶表)
- `id`: UUID 主鍵
- `email`: 用戶郵箱 (唯一)
- `name`: 用戶姓名
- `picture`: 頭像 URL
- `created_at`, `updated_at`: 時間戳

### poops (便便記錄表)
- `id`: 字符串主鍵
- `user_id`: 用戶郵箱
- `lat`, `lng`: 經緯度
- `timestamp`: 時間戳
- `rating`: 評分 (1-5)
- `notes`: 備註
- `photo`: 照片 URL
- `privacy`: 隱私設置 ('private', 'friends', 'public')
- `place_name`: 地點名稱
- `custom_location`: 自定義位置
- `address`: 地址

### friends (好友關係表)
- `id`: 字符串主鍵
- `user_id`: 用戶郵箱
- `friend_email`: 好友郵箱
- `friend_name`: 好友姓名
- `friend_picture`: 好友頭像
- `status`: 狀態 ('pending', 'accepted', 'rejected', 'blocked')
- `added_at`: 添加時間

### friend_requests (好友請求表)
- `id`: 字符串主鍵
- `from_user_id`: 發送者 ID
- `from_user_name`: 發送者姓名
- `from_user_email`: 發送者郵箱
- `from_user_picture`: 發送者頭像
- `to_user_email`: 接收者郵箱
- `status`: 狀態 ('pending', 'accepted', 'rejected')
- `timestamp`: 時間戳

## 🔒 安全性配置

### Row Level Security (RLS)
所有表都啟用了行級安全性，確保：
- 用戶只能查看和修改自己的數據
- 好友可以查看彼此的 'friends' 隱私便便
- 所有人都可以查看 'public' 隱私便便

### 實時訂閱
啟用了以下表的實時訂閱：
- `poops`: 便便記錄變化
- `friend_requests`: 好友請求變化
- `friends`: 好友關係變化

## 🔄 數據遷移

### 從 Firebase 遷移 (可選)
如果你有現有的 Firebase 數據，可以：
1. 導出 Firebase 數據
2. 轉換數據格式
3. 導入到 Supabase

### 從 localStorage 遷移
應用會自動處理 localStorage 數據，無需手動遷移。

## 🛠️ 開發和測試

### 本地開發
1. 確保環境變量正確配置
2. 運行 `npm run dev`
3. 應用會自動檢測並使用 Supabase

### 測試連接
應用啟動時會在控制台顯示：
```
✅ Supabase connection successful
📊 Current database provider: supabase
```

### 備選方案
如果 Supabase 不可用，應用會自動回退到：
1. Firebase (如果配置)
2. localStorage (離線模式)

## 📈 監控和維護

### 查看使用情況
在 Supabase 儀表板中：
1. "Settings" → "Usage" 查看 API 使用量
2. "Database" → "Tables" 查看數據
3. "Logs" 查看錯誤日誌

### 性能優化
- 已創建必要的數據庫索引
- 使用 RLS 確保查詢效率
- 限制公開便便查詢數量 (100 條)

## 🚨 故障排除

### 常見問題
1. **連接失敗**: 檢查 URL 和 API 密鑰是否正確
2. **權限錯誤**: 確保 RLS 政策正確配置
3. **實時訂閱不工作**: 檢查表是否添加到 realtime publication

### 調試技巧
- 打開瀏覽器開發者工具查看控制台日誌
- 在 Supabase 儀表板查看 API 日誌
- 使用 Supabase 的 SQL 編輯器測試查詢

## 🎯 下一步

設置完成後，你的應用將：
- ✅ 使用 Supabase 作為主要數據庫
- ✅ 支持實時數據同步
- ✅ 自動備選到 Firebase 或 localStorage
- ✅ 提供更好的性能和擴展性

享受使用 Supabase 的便便地圖應用吧！💩🗺️