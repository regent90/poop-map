# 🚀 部署檢查清單

## 部署前準備

### ✅ Google APIs 設定
- [ ] Google Maps JavaScript API 已啟用
- [ ] Google OAuth 2.0 客戶端 ID 已建立
- [ ] API 金鑰已設定網域限制
- [ ] OAuth 客戶端已設定授權網域

### ✅ 環境變數
- [ ] `VITE_GOOGLE_MAPS_API_KEY` - 你的 Google Maps API Key
- [ ] `VITE_GOOGLE_CLIENT_ID` - 你的 Google OAuth Client ID

## 快速部署到 Vercel

### 方法 1: GitHub 連接 (推薦)

1. **推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "🎉 Initial Poop Map deployment"
   git branch -M main
   git remote add origin https://github.com/你的用戶名/poop-map.git
   git push -u origin main
   ```

2. **Vercel 部署**
   - 前往 [vercel.com/new](https://vercel.com/new)
   - 選擇 "Import Git Repository"
   - 選擇你的 poop-map 倉庫
   - 框架會自動偵測為 "Vite"

3. **設定環境變數**
   - 在部署頁面點擊 "Environment Variables"
   - 添加：
     ```
     VITE_GOOGLE_MAPS_API_KEY = AIzaSyAXX7GnfPOy6GO0HNzIw9mzDKYQnwMrcLg
     VITE_GOOGLE_CLIENT_ID = 你的_Google_Client_ID
     ```

4. **部署**
   - 點擊 "Deploy"
   - 等待建置完成
   - 獲得網址：`https://poop-map-xxx.vercel.app`

### 方法 2: Vercel CLI

1. **安裝 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登入並部署**
   ```bash
   vercel login
   vercel --prod
   ```

## 部署後設定

### 🔧 Google Cloud Console 更新

1. **更新 OAuth 設定**
   - 前往 [Google Cloud Console](https://console.cloud.google.com/)
   - API 和服務 → 憑證
   - 編輯你的 OAuth 2.0 客戶端 ID
   - 在「授權的 JavaScript 來源」添加：
     ```
     https://你的網域.vercel.app
     ```
   - 在「授權的重新導向 URI」添加：
     ```
     https://你的網域.vercel.app
     ```

2. **更新 Maps API 限制**
   - 編輯你的 API 金鑰
   - 在「網站限制」添加：
     ```
     https://你的網域.vercel.app/*
     ```

### 🧪 測試功能

部署完成後測試以下功能：

- [ ] Google 登入正常
- [ ] 地圖載入正常
- [ ] 位置權限請求
- [ ] 便便標記功能
- [ ] 照片上傳
- [ ] 好友系統
- [ ] 邀請連結分享
- [ ] 多語言切換
- [ ] 用戶切換器（測試用）

## 常見問題

### Q: 地圖無法載入
A: 檢查 Google Maps API 金鑰是否正確，並確認網域已加入限制清單

### Q: Google 登入失敗
A: 檢查 OAuth 客戶端 ID 和授權網域設定

### Q: 位置權限被拒絕
A: 確保使用 HTTPS（Vercel 自動提供）

### Q: 邀請連結無效
A: 確認網域設定正確，連結格式為 `https://你的網域.vercel.app?invite=...`

## 🎯 生產環境優化

部署後可以考慮的優化：

1. **自訂網域** - 在 Vercel 設定自訂網域
2. **分析工具** - 添加 Google Analytics
3. **錯誤監控** - 整合 Sentry
4. **效能監控** - 使用 Vercel Analytics
5. **SEO 優化** - 添加 meta tags 和 sitemap

---

🎉 **準備好了嗎？開始部署你的 Poop Map！**