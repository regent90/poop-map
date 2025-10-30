# MongoDB 後端 API 設置指南

## 🎯 為什麼需要後端？

由於瀏覽器安全限制，我們需要一個中間層來連接 MongoDB。

## 🚀 快速設置（使用 Vercel Functions）

### 1. 創建 API 目錄結構

```
api/
├── poops/
│   ├── index.js          # 獲取便便列表
│   └── create.js         # 創建新便便
├── friends/
│   ├── index.js          # 獲取好友列表
│   └── add.js            # 添加好友
└── _lib/
    └── mongodb.js        # MongoDB 連接工具
```

### 2. 安裝依賴

在項目根目錄創建 `package.json`（如果還沒有）：

```json
{
  "dependencies": {
    "mongodb": "^6.20.0"
  }
}
```

### 3. 創建 MongoDB 連接工具

創建 `api/_lib/mongodb.js`：

```javascript
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
```

### 4. 創建 API 端點

創建 `api/poops/index.js`：

```javascript
import clientPromise from '../_lib/mongodb.js';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('poopmap');
    
    if (req.method === 'GET') {
      const { userId, privacy } = req.query;
      
      let filter = {};
      if (userId) filter.userId = userId;
      if (privacy) filter.privacy = privacy;
      
      const poops = await db.collection('poops')
        .find(filter)
        .sort({ timestamp: -1 })
        .limit(100)
        .toArray();
      
      res.json({ success: true, data: poops });
    } 
    else if (req.method === 'POST') {
      const poopData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection('poops').insertOne(poopData);
      res.json({ success: true, insertedId: result.insertedId });
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### 5. 環境變數配置

在 `.env.local` 中添加：

```bash
# MongoDB Connection (用於後端 API)
MONGODB_URI=mongodb+srv://regent0504:regent90@cluster0.37k8lnn.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=poopmap

# API Base URL
VITE_API_BASE_URL=https://your-app.vercel.app/api
```

### 6. 前端服務更新

創建 `src/services/mongoBackendAPI.ts`：

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const savePoopToBackend = async (poop: Poop): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/poops`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(poop)
  });
  
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  
  return result.insertedId;
};

export const getUserPoopsFromBackend = async (userEmail: string): Promise<Poop[]> => {
  const response = await fetch(`${API_BASE_URL}/poops?userId=${userEmail}`);
  const result = await response.json();
  
  if (!result.success) throw new Error(result.error);
  return result.data;
};
```

## 🚀 部署到 Vercel

1. 確保所有 API 文件在 `api/` 目錄中
2. 在 Vercel 中設置環境變數：
   - `MONGODB_URI`
   - `MONGODB_DB_NAME`
3. 部署應用

## ✅ 優勢

- 完全控制 API 邏輯
- 可以添加認證和授權
- 支持複雜查詢
- 更好的錯誤處理
- 可以添加緩存和優化