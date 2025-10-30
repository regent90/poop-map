# MongoDB Data API 配置指南

## 🎯 為什麼需要 Data API？

由於瀏覽器安全限制，我們無法直接使用 MongoDB 驅動程式。MongoDB Data API 提供了 HTTP 接口，讓我們可以在瀏覽器中安全地操作數據庫。

## 📋 配置步驟

### 1. 登入 MongoDB Atlas
- 前往 [MongoDB Atlas](https://cloud.mongodb.com/)
- 登入你的帳戶

### 2. 啟用 Data API
1. 在 Atlas 控制台中，選擇你的項目
2. 點擊左側選單的 **"Data API"**
3. 點擊 **"Enable Data API"** 按鈕
4. 選擇你的數據源（通常是 Cluster0）
5. 點擊 **"Enable"**

### 3. 創建 API Key
1. 在 Data API 頁面中，點擊 **"Create API Key"**
2. 輸入 API Key 名稱（例如：poop-map-api）
3. 選擇權限：**"Read and write to all resources"**
4. 點擊 **"Generate API Key"**
5. **重要：複製並保存 API Key，它只會顯示一次！**

### 4. 獲取 Data API URL
在 Data API 頁面中，你會看到類似這樣的 URL：
```
https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1
```

## 🔧 環境變數配置

將以下變數添加到你的 `.env.local` 文件中：

```bash
# MongoDB Data API Configuration
VITE_MONGODB_DATA_API_URL=https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1
VITE_MONGODB_API_KEY=你的_API_KEY
VITE_MONGODB_DB_NAME=poopmap
```

## 🚀 Vercel 部署配置

在 Vercel 控制台中添加以下環境變數：

1. 前往你的 Vercel 項目設置
2. 點擊 **"Environment Variables"**
3. 添加以下變數：

| Name | Value |
|------|-------|
| `VITE_MONGODB_DATA_API_URL` | `https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1` |
| `VITE_MONGODB_API_KEY` | `你的_API_KEY` |
| `VITE_MONGODB_DB_NAME` | `poopmap` |

## 📝 完整的環境變數範例

```bash
# Google Services
VITE_GOOGLE_MAPS_API_KEY=你的_Google_Maps_API_Key
VITE_GOOGLE_CLIENT_ID=你的_Google_Client_ID

# MongoDB Data API (主要數據庫)
VITE_MONGODB_DATA_API_URL=https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1
VITE_MONGODB_API_KEY=你的_MongoDB_API_Key
VITE_MONGODB_DB_NAME=poopmap

# Supabase (備選數據庫)
VITE_SUPABASE_URL=你的_Supabase_URL
VITE_SUPABASE_ANON_KEY=你的_Supabase_Anon_Key

# Firebase (備選數據庫)
VITE_FIREBASE_API_KEY=你的_Firebase_API_Key
VITE_FIREBASE_PROJECT_ID=你的_Firebase_Project_ID
# ... 其他 Firebase 配置
```

## ⚠️ 重要注意事項

1. **API Key 安全性**：
   - 不要將 API Key 提交到 Git
   - 在生產環境中使用環境變數
   - 定期輪換 API Key

2. **權限設置**：
   - 確保 API Key 有讀寫權限
   - 考慮為不同環境使用不同的 API Key

3. **數據庫名稱**：
   - 確保 `VITE_MONGODB_DB_NAME` 與你的實際數據庫名稱一致

## 🔍 測試配置

配置完成後，你可以：

1. 重新部署應用
2. 在 MongoDB 遷移工具中點擊 **"設置 MongoDB"**
3. 如果看到 "✅ MongoDB Data API 連接成功！"，表示配置正確

## 🆘 常見問題

**Q: 找不到 Data API 選項？**
A: 確保你的 MongoDB Atlas 項目是付費計劃，免費計劃可能不支持 Data API。

**Q: API Key 不工作？**
A: 檢查 API Key 權限，確保有讀寫權限。

**Q: URL 格式錯誤？**
A: 確保 URL 包含完整路徑，以 `/endpoint/data/v1` 結尾。