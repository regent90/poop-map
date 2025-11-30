# 💩 Poop Map - 便便地圖

一個類似 PoopMap.net 的多語言便便追蹤應用程式，支援 Google 登入和 Google Maps 整合。

## 📱 立即下載

### Android APK
- **最新版本**: v1.0.0 (2025-11-03)
- **下載鏈接**: [poop-map-v1.0.0-debug.apk](releases/poop-map-v1.0.0-debug.apk) (9.93 MB)
- **最低要求**: Android 7.0+
- **詳細說明**: [發布說明](releases/README.md)

### 其他平台
- 🍎 **iOS**: 開發中
- 🌐 **Web 版**: [https://poop-map.vercel.app](https://poop-map.vercel.app)

## ✨ 功能特色

### 🌍 核心功能
- **8 種語言支持**: 英語、繁中、簡中、日語、韓語、西班牙語、法語、德語
- **Google 登入**: 原生 Android 和 Web OAuth 認證
- **Google Maps**: 互動式地圖顯示和位置追蹤
- **便便記錄**: 記錄、查看和分享便便位置
- **隱私控制**: 公開、好友、私人三種隱私設定

### 👥 社交功能
- **好友系統**: 添加好友、查看好友動態
- **通知中心**: 實時通知和消息提醒
- **挑戰系統**: 創建和參與便便挑戰
- **動態牆**: 查看好友和公開動態
- **成就系統**: 解鎖成就和收集徽章
- **排行榜**: 查看全球和好友排名

### 🎒 道具系統
- **便便道具**: 收集和使用各種便便道具
- **道具效果**: 特殊效果和遊戲化元素
- **庫存管理**: 查看和管理道具庫存

### 📱 原生功能
- **相機拍照**: 記錄便便照片
- **分享功能**: 分享到社交媒體
- **觸覺反饋**: 震動反饋增強體驗
- **離線支持**: 基本功能離線可用

## 📚 文檔

- 📱 [Capacitor 開發指南](docs/CAPACITOR_GUIDE.md)
- 🔐 [Google Auth 配置](docs/GOOGLE_AUTH_SETUP.md)
- 🧪 [移動端測試清單](docs/MOBILE_TESTING_CHECKLIST.md)
- ⚡ [性能優化指南](docs/OPTIMIZATION_GUIDE.md)
- 📖 [完整文檔索引](docs/README.md)

## 設定步驟

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

在 `.env.local` 檔案中設定以下變數：

```env
VITE_GOOGLE_MAPS_API_KEY=你的_Google_Maps_API_金鑰
VITE_GOOGLE_CLIENT_ID=你的_Google_OAuth_客戶端_ID
```

### 3. Google API 設定

#### Google Maps API
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Maps JavaScript API
4. 建立 API 金鑰並設定限制

#### Google OAuth 2.0
1. 在 Google Cloud Console 中前往「憑證」頁面
2. 建立 OAuth 2.0 客戶端 ID
3. 設定授權的 JavaScript 來源和重新導向 URI

### 4. 執行應用程式

```bash
npm run dev
```

## 使用方法

1. **登入**: 使用 Google 帳號登入
2. **允許位置權限**: 應用程式會要求存取您的位置
3. **標記便便**: 點擊「拉一坨」按鈕在當前位置標記
4. **查看標記**: 點擊地圖上的便便圖標查看詳細資訊
5. **切換語言**: 使用右上角的語言切換器

## 技術架構

- **前端框架**: React 19 + TypeScript
- **地圖服務**: Google Maps JavaScript API
- **認證**: Google OAuth 2.0
- **樣式**: Tailwind CSS
- **建置工具**: Vite
- **狀態管理**: React Hooks + localStorage

## 支援的語言

- 🇺🇸 English
- 🇹🇼 繁體中文
- 🇨🇳 简体中文
- 🇯🇵 日本語
- 🇰🇷 한국어
- 🇪🇸 Español
- 🇫🇷 Français
- 🇩🇪 Deutsch

## 部署

### Vercel 部署 (推薦)

1. **推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用戶名/poop-map.git
   git push -u origin main
   ```

2. **連接 Vercel**
   - 前往 [vercel.com](https://vercel.com)
   - 連接 GitHub 倉庫
   - 選擇你的 poop-map 專案

3. **設定環境變數**
   在 Vercel 專案設定中添加：
   - `VITE_GOOGLE_MAPS_API_KEY`: 你的 Google Maps API Key
   - `VITE_GOOGLE_CLIENT_ID`: 你的 Google OAuth Client ID

4. **部署**
   - Vercel 會自動建置和部署
   - 獲得 `https://你的專案名.vercel.app` 網址

### Zeabur 部署

1. **推送到 GitHub** (同上)

2. **連接 Zeabur**
   - 前往 [zeabur.com](https://zeabur.com)
   - 創建新專案並連接 GitHub

3. **設定環境變數** (同 Vercel)

4. **部署完成**

### 本地建置

```bash
npm run build
```

建置完成的檔案會在 `dist` 資料夾中。

## 注意事項

- 需要 HTTPS 才能使用地理位置 API
- Google Maps API 有使用配額限制
- 資料僅儲存在本地瀏覽器中

## 授權

MIT License