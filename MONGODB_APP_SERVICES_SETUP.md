# MongoDB Atlas App Services 配置指南

## 🎯 什麼是 App Services？

MongoDB Atlas App Services 是 Data API 的替代方案，提供：
- GraphQL API
- REST API  
- 實時同步
- 用戶認證
- 無服務器函數

## 📋 配置步驟

### 1. 創建 App Services 應用

1. 登入 [MongoDB Atlas](https://cloud.mongodb.com/)
2. 選擇你的項目
3. 點擊 **"App Services"** 標籤
4. 點擊 **"Create a New App"**
5. 選擇：
   - **App Name**: `poop-map-app`
   - **Data Source**: 選擇你的 Cluster0
   - **Template**: 選擇 "Build your own App"
6. 點擊 **"Create App"**

### 2. 配置 GraphQL API

1. 在 App Services 控制台中，點擊 **"GraphQL"**
2. 點擊 **"Enable GraphQL"**
3. 配置 Schema：
   - 點擊 **"Generate Schema"**
   - 選擇你的數據庫和集合
   - 點擊 **"Generate Schema"**

### 3. 配置 HTTPS Endpoints

1. 點擊 **"HTTPS Endpoints"**
2. 點擊 **"Add an Endpoint"**
3. 配置：
   - **Route**: `/api/poops`
   - **HTTP Method**: `POST`
   - **Function**: 創建新函數處理請求

### 4. 配置認證

1. 點擊 **"Authentication"**
2. 啟用 **"Anonymous Authentication"**（用於公開數據）
3. 或配置 **"Email/Password"** 認證

### 5. 部署應用

1. 點擊 **"Deploy"** 按鈕
2. 等待部署完成

## 🔧 環境變數配置

```bash
# MongoDB App Services Configuration
VITE_MONGODB_APP_ID=your-app-id
VITE_MONGODB_GRAPHQL_URL=https://realm.mongodb.com/api/client/v2.0/app/your-app-id/graphql
VITE_MONGODB_BASE_URL=https://realm.mongodb.com/api/client/v2.0/app/your-app-id
```

## 📝 使用範例

```typescript
// GraphQL 查詢範例
const GET_POOPS = `
  query GetPoops($userId: String!) {
    poops(query: { userId: $userId }) {
      _id
      userId
      lat
      lng
      timestamp
      privacy
    }
  }
`;

// 發送請求
const response = await fetch(GRAPHQL_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    query: GET_POOPS,
    variables: { userId: 'user@example.com' }
  })
});
```