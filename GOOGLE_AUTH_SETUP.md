# 🔐 Google 登入修復指南

## 問題描述
在 Capacitor 原生應用中，`@react-oauth/google` 無法正常工作，因為它依賴於 Web 環境。

## 解決方案
使用 `@southdevs/capacitor-google-auth` 插件來處理原生平台的 Google 登入。

## 🛠️ 已完成的配置

### 1. 安裝插件
```bash
npm install @southdevs/capacitor-google-auth
```

### 2. 創建 GoogleAuthService
- 位置: `src/services/googleAuthService.ts`
- 功能: 統一處理 Web 和原生平台的 Google 登入

### 3. 更新 LoginScreen 組件
- 自動檢測平台（Web vs 原生）
- 原生平台使用 Capacitor Google Auth
- Web 平台使用原有的 @react-oauth/google

### 4. Capacitor 配置
- 更新 `capacitor.config.ts` 添加 GoogleAuth 配置
- 配置 Android `strings.xml` 添加 server_client_id

### 5. 環境變數
- 使用現有的 `VITE_GOOGLE_CLIENT_ID`
- 無需額外配置

## 🧪 測試步驟

### 1. 在手機上測試
```bash
npm run cap:run:android
```

### 2. 檢查登入流程
1. 打開應用
2. 點擊「使用 Google 登入」按鈕
3. 應該會彈出 Google 登入界面
4. 完成登入後應該進入主應用

### 3. 檢查日誌
- 在 Android Studio 的 Logcat 中查看日誌
- 查找 "Google Auth" 相關的日誌信息

## 🔍 故障排除

### 如果登入仍然無反應：

1. **檢查 Google Client ID**
   - 確保 `.env.local` 中的 `VITE_GOOGLE_CLIENT_ID` 正確
   - 確保 Google Cloud Console 中已配置正確的 OAuth 2.0 客戶端

2. **檢查 Android 配置**
   - 確保 `android/app/src/main/res/values/strings.xml` 中的 `server_client_id` 正確

3. **檢查權限**
   - 確保應用有網路權限
   - 檢查 Google Play Services 是否已安裝

4. **重新構建**
   ```bash
   npm run cap:build
   npx cap sync android
   ```

### 常見錯誤：

1. **"GoogleAuth not initialized"**
   - 解決: 確保在使用前調用了 `GoogleAuth.initialize()`

2. **"Invalid client ID"**
   - 解決: 檢查 Google Cloud Console 中的 OAuth 2.0 配置

3. **"Network error"**
   - 解決: 檢查網路連接和防火牆設置

## 📱 平台差異

### Web 平台
- 使用 `@react-oauth/google`
- 在瀏覽器中彈出 Google 登入窗口

### Android 平台
- 使用 `@southdevs/capacitor-google-auth`
- 使用原生 Google Sign-In SDK
- 更好的用戶體驗和安全性

### iOS 平台
- 同樣使用 `@southdevs/capacitor-google-auth`
- 需要額外的 iOS 配置（如果測試 iOS）

## 🎯 下一步

1. **測試登入功能**
2. **測試登出功能**
3. **測試用戶信息獲取**
4. **測試 token 刷新**

## 📝 注意事項

- 開發模式下會顯示當前平台信息
- 原生平台會顯示「原生應用模式」
- Web 平台會顯示「Web 應用模式」
- 登入按鈕會顯示載入狀態
- 錯誤信息會顯示在按鈕下方