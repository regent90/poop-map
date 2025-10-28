# 💩 Poop Map - 便便地圖

一個類似 PoopMap.net 的多語言便便追蹤應用程式，支援 Google 登入和 Google Maps 整合。

## 功能特色

- 🌍 **多語言支援**: 支援英文、繁體中文、簡體中文、日文、韓文、西班牙文、法文、德文
- 🔐 **Google 登入**: 安全的 Google OAuth 認證
- 🗺️ **Google Maps 整合**: 使用 Google Maps API 顯示互動式地圖
- 📍 **位置追蹤**: 自動獲取用戶當前位置
- 💩 **便便標記**: 在地圖上標記和查看便便位置
- 📱 **響應式設計**: 支援桌面和行動裝置
- 💾 **本地儲存**: 資料儲存在瀏覽器本地儲存中

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