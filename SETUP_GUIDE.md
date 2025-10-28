# 🚀 Poop Map 設定指南

## 快速開始

你的 Poop Map 應用程式已經基本完成！現在需要設定 Google API 來啟用完整功能。

## 🔧 必要設定

### 1. Google Cloud Console 設定

#### 步驟 1: 建立 Google Cloud 專案
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 點擊「建立專案」或選擇現有專案
3. 記下你的專案 ID

#### 步驟 2: 啟用必要的 API
1. 在左側選單中，前往「API 和服務」→「程式庫」
2. 搜尋並啟用以下 API：
   - **Maps JavaScript API**
   - **Google OAuth2 API** (用於獲取用戶資訊)
   
   注意：不需要啟用已停用的 Google+ API，我們使用的是 Google OAuth2 API 的 userinfo 端點。

#### 步驟 3: 建立 API 金鑰 (Google Maps)
1. 前往「API 和服務」→「憑證」
2. 點擊「建立憑證」→「API 金鑰」
3. 複製產生的 API 金鑰
4. 點擊「限制金鑰」來設定安全限制：
   - **應用程式限制**: HTTP 參照網址
   - **網站限制**: 新增 `http://localhost:5173/*` 和你的網域
   - **API 限制**: 選擇「Maps JavaScript API」

#### 步驟 4: 建立 OAuth 2.0 客戶端 ID
1. 在「憑證」頁面，點擊「建立憑證」→「OAuth 客戶端 ID」
2. 如果是第一次建立，需要先設定「OAuth 同意畫面」：
   - 選擇「外部」用戶類型
   - 填寫應用程式名稱：「Poop Map」
   - 填寫用戶支援電子郵件
   - 在「範圍」中添加：`../auth/userinfo.email` 和 `../auth/userinfo.profile`
3. 回到「憑證」頁面，選擇「網路應用程式」
4. 設定：
   - **名稱**: Poop Map
   - **授權的 JavaScript 來源**: 
     - `http://localhost:5173`
     - 你的正式網域 (如果有)
   - **授權的重新導向 URI**: 
     - `http://localhost:5173`
     - `http://localhost:5173/callback` (可選)
5. 複製「客戶端 ID」

### 2. 更新環境變數

在你的 `.env.local` 檔案中更新：

```env
VITE_GOOGLE_MAPS_API_KEY=你的_Google_Maps_API_金鑰
VITE_GOOGLE_CLIENT_ID=你的_Google_OAuth_客戶端_ID
```

### 3. 重新啟動應用程式

```bash
npm run dev
```

## 🎯 功能測試

1. **開啟瀏覽器**: 前往 http://localhost:5173
2. **測試登入**: 點擊「Login with Google」
3. **允許位置權限**: 瀏覽器會要求位置權限
4. **測試標記**: 點擊「拉一坨」按鈕
5. **測試語言切換**: 使用右上角的語言選擇器

## 🌍 多語言功能

應用程式支援以下語言：
- 🇺🇸 English
- 🇹🇼 繁體中文  
- 🇨🇳 简体中文
- 🇯🇵 日本語
- 🇰🇷 한국어
- 🇪🇸 Español
- 🇫🇷 Français
- 🇩🇪 Deutsch

語言會根據瀏覽器設定自動偵測，用戶也可以手動切換。

## 🚀 部署到生產環境

### Vercel 部署
1. 推送程式碼到 GitHub
2. 連接 Vercel 到你的 GitHub 倉庫
3. 在 Vercel 設定環境變數
4. 更新 Google Cloud Console 的授權網域

### Netlify 部署
1. 建置專案: `npm run build`
2. 上傳 `dist` 資料夾到 Netlify
3. 設定環境變數
4. 更新 Google Cloud Console 的授權網域

## � 安OAuth 同意畫面詳細設定

### 必填欄位：
- **應用程式名稱**: Poop Map
- **用戶支援電子郵件**: 你的 Gmail 地址
- **應用程式首頁**: http://localhost:5173 (開發) 或你的網域
- **應用程式隱私權政策連結**: (可選，但建議提供)
- **應用程式服務條款連結**: (可選)

### 範圍設定：
添加以下 OAuth 範圍：
- `../auth/userinfo.email` - 讀取用戶電子郵件
- `../auth/userinfo.profile` - 讀取用戶基本資料

### 測試用戶：
在開發階段，可以添加測試用戶的 Gmail 地址來測試登入功能。

## 🔒 安全注意事項

1. **API 金鑰限制**: 務必設定 HTTP 參照網址限制
2. **OAuth 網域**: 只授權你信任的網域
3. **HTTPS**: 生產環境必須使用 HTTPS
4. **配額監控**: 定期檢查 Google Cloud 的 API 使用量
5. **OAuth 範圍**: 只請求必要的權限範圍

## 🐛 常見問題

### Q: 地圖無法載入
A: 檢查 Google Maps API 金鑰是否正確設定，並確認已啟用 Maps JavaScript API

### Q: 無法登入 Google
A: 檢查以下項目：
- OAuth 客戶端 ID 是否正確設定
- 網域已加入「授權的 JavaScript 來源」清單
- OAuth 同意畫面已正確設定
- 確認使用的是 Google Identity Services API，不是已停用的 Google+ API

### Q: 無法獲取位置
A: 確保使用 HTTPS (生產環境) 或 localhost，並允許瀏覽器位置權限

### Q: 標記沒有儲存
A: 檢查瀏覽器的 localStorage 是否被禁用

## ℹ️ 重要說明

### 關於 Google+ API
Google+ API 已於 2019 年 3 月停用，但我們的應用程式**不使用** Google+ API。我們使用的是：
- **Google OAuth 2.0** 進行身份驗證
- **Google OAuth2 API 的 userinfo 端點** 獲取用戶基本資訊

這些 API 仍然完全可用且受支援。

### API 端點說明
我們的應用程式使用以下端點：
- 身份驗證：Google Identity Services (gsi.google.com)
- 用戶資訊：`https://www.googleapis.com/oauth2/v2/userinfo`
- 地圖服務：Google Maps JavaScript API

## 📞 支援

如果遇到問題，請檢查：
1. 瀏覽器開發者工具的 Console 錯誤訊息
2. Google Cloud Console 的 API 配額和錯誤日誌
3. 網路連線和防火牆設定
4. 確認使用的是正確的 API（不是 Google+ API）

---

🎉 **恭喜！你的 Poop Map 應用程式已經準備就緒！**