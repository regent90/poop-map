# 💩 Poop Map - 便便地圖

一個有趣的社交地圖應用，讓你記錄和分享你的便便體驗！🗺️✨

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://poop-map.vercel.app)
[![Version](https://img.shields.io/badge/Version-2.0-blue)](https://github.com/regent90/poop-map)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 🌟 功能特色

### 📍 地圖功能
- **互動式地圖** - 基於 Google Maps 的流暢地圖體驗
- **便便標記** - 在地圖上標記你的便便位置
- **地點搜尋** - 搜尋特定地點並添加便便記錄
- **自動定位** - 使用 GPS 自動獲取當前位置

### 👥 社交系統
- **好友系統** - 添加好友並查看他們的便便記錄
- **好友請求** - 發送和接受好友邀請
- **雙向好友關係** - 解除好友時雙方關係都會移除
- **隱私控制** - 設定便便記錄為公開或私人

### 📸 多媒體支援
- **圖片上傳** - 為便便記錄添加照片
- **智能壓縮** - 自動壓縮圖片以符合儲存限制
- **圖片預覽** - 在地圖和列表中預覽圖片

### ⭐ 評分系統
- **便便評分** - 為每次便便體驗評分 (1-5 星)
- **詳細記錄** - 添加文字備註和自定義地點名稱
- **統計資訊** - 查看個人便便統計

### 🔐 認證系統
- **Google 登入** - 使用 Google 帳號快速登入
- **多語言支援** - 支援繁體中文和英文
- **用戶資料** - 顯示用戶頭像和基本資訊

### 💾 多資料庫支援
- **Convex** - 主要雲端資料庫 (即時同步)
- **MongoDB** - 備選資料庫選項
- **Supabase** - 另一個雲端選項
- **localStorage** - 離線備份儲存

## 🚀 技術架構

### 前端技術
- **React 18** - 現代化 React 框架
- **TypeScript** - 型別安全的開發體驗
- **Vite** - 快速的建置工具
- **Google Maps API** - 地圖服務
- **React OAuth Google** - Google 認證

### 後端服務
- **Convex** - 即時資料庫和 API
- **MongoDB Atlas** - NoSQL 資料庫
- **Supabase** - 開源 Firebase 替代方案
- **Vercel** - 部署和託管平台

### 核心功能
- **統一資料庫介面** - 抽象化多個資料庫提供商
- **即時同步** - 資料即時更新
- **離線支援** - 本地儲存備份
- **圖片壓縮** - 自動優化圖片大小
- **響應式設計** - 支援各種裝置尺寸

## 📱 使用方式

### 1. 註冊登入
- 使用 Google 帳號登入
- 選擇語言偏好 (中文/英文)

### 2. 記錄便便
- 點擊地圖上的位置
- 填寫便便詳情 (評分、備註、照片)
- 選擇隱私設定 (公開/私人)

### 3. 社交互動
- 搜尋並添加好友
- 查看好友的便便記錄
- 接受或拒絕好友請求

### 4. 瀏覽記錄
- 在地圖上查看所有便便標記
- 使用列表模式瀏覽記錄
- 查看詳細統計資訊

## 🛠️ 本地開發

### 環境需求
- Node.js 18+
- npm 或 yarn
- Google Maps API Key
- Convex 帳號 (或其他資料庫)

### 安裝步驟

1. **克隆專案**
```bash
git clone https://github.com/regent90/poop-map.git
cd poop-map
```

2. **安裝依賴**
```bash
npm install
```

3. **設定環境變數**
```bash
cp .env.example .env.local
```

編輯 `.env.local` 並填入你的 API 金鑰：
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_CONVEX_URL=your_convex_deployment_url
```

4. **啟動開發伺服器**
```bash
npm run dev
```

5. **建置生產版本**
```bash
npm run build
```

## 🔧 配置說明

### Google Maps API
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 啟用 Maps JavaScript API
3. 創建 API 金鑰並設定網域限制

### Google OAuth
1. 在 Google Cloud Console 設定 OAuth 2.0
2. 添加授權的重定向 URI
3. 獲取客戶端 ID

### Convex 設定
1. 註冊 [Convex](https://convex.dev/) 帳號
2. 創建新專案
3. 部署 schema 和函數：
```bash
npx convex dev
```

## 📊 專案結構

```
poop-map/
├── src/
│   ├── components/          # React 組件
│   ├── services/           # 資料庫服務
│   ├── types/              # TypeScript 型別定義
│   ├── config/             # 配置檔案
│   └── App.tsx             # 主應用程式
├── convex/                 # Convex 後端函數
├── api/                    # API 路由 (Vercel)
├── public/                 # 靜態資源
└── docs/                   # 文件
```

## 🌐 部署

### Vercel 部署 (推薦)
1. Fork 這個專案到你的 GitHub
2. 連接到 [Vercel](https://vercel.com/)
3. 設定環境變數
4. 自動部署完成！

### 其他平台
- **Netlify** - 支援靜態網站部署
- **Firebase Hosting** - Google 的託管服務
- **GitHub Pages** - 免費靜態網站託管

## 🤝 貢獻指南

歡迎貢獻！請遵循以下步驟：

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📝 更新日誌

### v2.0.0 (2024-10-31)
- ✨ 完整的社交好友系統
- 📸 智能圖片壓縮功能
- 🔄 雙向好友關係管理
- 💾 統一多資料庫支援
- 🌐 多語言介面支援
- 📱 響應式設計優化

### v1.0.0 (2024-10-30)
- 🗺️ 基礎地圖功能
- 💩 便便記錄系統
- 🔐 Google 認證登入
- 📊 基本統計功能

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🙏 致謝

- [Google Maps API](https://developers.google.com/maps) - 地圖服務
- [Convex](https://convex.dev/) - 即時資料庫
- [React](https://reactjs.org/) - UI 框架
- [Vercel](https://vercel.com/) - 部署平台

## 📞 聯絡方式

- **作者**: Regent
- **Email**: regent0504@gmail.com
- **GitHub**: [@regent90](https://github.com/regent90)
- **專案連結**: [https://github.com/regent90/poop-map](https://github.com/regent90/poop-map)

---

**免責聲明**: 本專案僅供娛樂和學習目的，請理性使用！💩✨