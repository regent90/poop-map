# 🔐 Google OAuth 2.0 配置指南

## 問題描述
Google 登入界面可以彈出，但選擇用戶後出現錯誤。這通常是 Google Cloud Console 中的 OAuth 2.0 配置問題。

## 🛠️ 解決步驟

### 1. 訪問 Google Cloud Console
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇你的專案或創建新專案

### 2. 啟用 Google+ API
1. 在左側菜單中，點擊「API 和服務」> 「庫」
2. 搜索「Google+ API」或「People API」
3. 點擊並啟用這些 API

### 3. 配置 OAuth 2.0 客戶端 ID

#### 3.1 創建 Android 客戶端 ID
1. 前往「API 和服務」> 「憑證」
2. 點擊「+ 創建憑證」> 「OAuth 2.0 客戶端 ID」
3. 選擇應用程式類型：「Android」
4. 填寫以下信息：
   - **名稱**: `便便地圖 Android`
   - **套件名稱**: `com.regent.poopmap`
   - **SHA-1 憑證指紋**: 需要獲取（見下方步驟）

#### 3.2 獲取 SHA-1 憑證指紋

**方法 1: 使用 Android Studio**
1. 打開 Android Studio
2. 在右側點擊「Gradle」
3. 展開 `app` > `Tasks` > `android`
4. 雙擊 `signingReport`
5. 在輸出中找到 SHA1 指紋

**方法 2: 使用命令行**
```bash
# Windows (在 Android Studio 安裝目錄)
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android

# 查找 SHA1 指紋
```

#### 3.3 創建 Web 客戶端 ID（如果還沒有）
1. 點擊「+ 創建憑證」> 「OAuth 2.0 客戶端 ID」
2. 選擇應用程式類型：「網頁應用程式」
3. 填寫以下信息：
   - **名稱**: `便便地圖 Web`
   - **已授權的 JavaScript 來源**: 
     - `http://localhost:5173`
     - `https://poop-map.vercel.app`
   - **已授權的重新導向 URI**:
     - `http://localhost:5173`
     - `https://poop-map.vercel.app`

### 4. 更新應用配置

#### 4.1 更新 Android strings.xml
確保 `android/app/src/main/res/values/strings.xml` 包含正確的客戶端 ID：

```xml
<string name="server_client_id">你的_WEB_客戶端_ID</string>
```

**重要**: 這裡要使用 **Web 客戶端 ID**，不是 Android 客戶端 ID！

#### 4.2 檢查 capacitor.config.ts
確保配置正確：

```typescript
GoogleAuth: {
  scopes: ['profile', 'email'],
  serverClientId: '你的_WEB_客戶端_ID',
  forceCodeForRefreshToken: true,
}
```

### 5. 測試配置

#### 5.1 重新構建應用
```bash
npm run cap:build
npx cap sync android
```

#### 5.2 在手機上測試
```bash
npm run cap:run:android
```

## 🔍 故障排除

### 常見錯誤和解決方案

#### 1. "invalid_client" 錯誤
- **原因**: 客戶端 ID 不正確或未正確配置
- **解決**: 檢查 Google Cloud Console 中的客戶端 ID 是否正確複製

#### 2. "unauthorized_client" 錯誤
- **原因**: SHA-1 指紋不匹配或套件名稱不正確
- **解決**: 重新獲取 SHA-1 指紋並更新 Google Cloud Console

#### 3. "access_denied" 錯誤
- **原因**: 用戶拒絕授權或應用未經過驗證
- **解決**: 檢查 OAuth 同意畫面配置

#### 4. 網路錯誤
- **原因**: API 未啟用或配額已用完
- **解決**: 檢查 Google+ API 或 People API 是否已啟用

### 檢查清單

- [ ] Google+ API 或 People API 已啟用
- [ ] 已創建 Android OAuth 2.0 客戶端 ID
- [ ] 已創建 Web OAuth 2.0 客戶端 ID
- [ ] SHA-1 指紋正確配置
- [ ] 套件名稱為 `com.regent.poopmap`
- [ ] strings.xml 中使用 Web 客戶端 ID
- [ ] capacitor.config.ts 中使用 Web 客戶端 ID

## 📱 調試技巧

### 1. 查看 Android 日誌
在 Android Studio 中打開 Logcat，搜索：
- `GoogleAuth`
- `OAuth`
- `SignIn`

### 2. 檢查網路請求
查看是否有 HTTP 錯誤代碼：
- `400`: 請求錯誤
- `401`: 未授權
- `403`: 禁止訪問

### 3. 測試不同帳戶
嘗試使用不同的 Google 帳戶登入，看是否是特定帳戶的問題。

## 🎯 下一步

完成配置後：
1. 重新構建並安裝應用
2. 測試 Google 登入功能
3. 檢查用戶信息是否正確獲取
4. 測試登出功能

如果問題仍然存在，請提供 Android Studio Logcat 中的詳細錯誤信息。