# 🔍 Google Auth 配置檢查清單

## 📋 當前配置狀態

### ✅ 已完成的配置

1. **Web 客戶端 ID**: `960272040462-l9ok0pdikok8c4fied49j6kbee4ruurg.apps.googleusercontent.com`
   - 用途: 服務器端驗證 (serverClientId)
   - 位置: `.env.local`, `capacitor.config.ts`, `android/strings.xml`

2. **Android 客戶端 ID**: `960272040462-fqq49udtvv5ndege5tgdqml3dg8f04pt.apps.googleusercontent.com`
   - 用途: Android 應用識別
   - 位置: `.env.local`, `android/strings.xml`

### 🔧 配置文件檢查

#### `.env.local`
```
VITE_GOOGLE_CLIENT_ID=960272040462-l9ok0pdikok8c4fied49j6kbee4ruurg.apps.googleusercontent.com (Web)
VITE_GOOGLE_ANDROID_CLIENT_ID=960272040462-fqq49udtvv5ndege5tgdqml3dg8f04pt.apps.googleusercontent.com (Android)
```

#### `capacitor.config.ts`
```typescript
GoogleAuth: {
  scopes: ['profile', 'email'],
  serverClientId: '960272040462-l9ok0pdikok8c4fied49j6kbee4ruurg.apps.googleusercontent.com', // Web ID
  forceCodeForRefreshToken: true,
}
```

#### `android/app/src/main/res/values/strings.xml`
```xml
<string name="server_client_id">960272040462-l9ok0pdikok8c4fied49j6kbee4ruurg.apps.googleusercontent.com</string> <!-- Web ID -->
<string name="android_client_id">960272040462-fqq49udtvv5ndege5tgdqml3dg8f04pt.apps.googleusercontent.com</string> <!-- Android ID -->
```

## 🎯 Google Cloud Console 檢查清單

### 必須完成的配置

#### 1. Android 客戶端 ID 配置
- [ ] 應用程式類型: Android
- [ ] 套件名稱: `com.regent.poopmap`
- [ ] SHA-1 憑證指紋: 已正確配置

#### 2. Web 客戶端 ID 配置
- [ ] 應用程式類型: 網頁應用程式
- [ ] 已授權的 JavaScript 來源: 包含你的域名
- [ ] 已授權的重新導向 URI: 包含你的域名

#### 3. API 啟用狀態
- [ ] Google+ API 已啟用
- [ ] People API 已啟用
- [ ] Google Sign-In API 已啟用

#### 4. OAuth 同意畫面
- [ ] 已配置應用程式名稱
- [ ] 已添加測試用戶（如果是測試模式）
- [ ] 範圍包含 `profile` 和 `email`

## 🔍 SHA-1 指紋獲取方法

### 方法 1: Android Studio
1. 打開 Android Studio
2. 右側 Gradle 面板
3. 展開 `app` > `Tasks` > `android`
4. 雙擊 `signingReport`
5. 複製 SHA1 指紋

### 方法 2: 命令行
```bash
# Windows
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android

# macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

## 🧪 測試步驟

### 1. 重新構建應用
```bash
npm run cap:build
npx cap sync android
```

### 2. 安裝到手機
```bash
npm run cap:run:android
```

### 3. 測試登入流程
1. 點擊「使用 Google 登入」
2. 選擇 Google 帳戶
3. 檢查是否成功登入

### 4. 檢查日誌
在 Android Studio Logcat 中搜索：
- `GoogleAuth`
- `OAuth`
- `SignIn`

## 🚨 常見問題

### 問題 1: "invalid_client" 錯誤
**原因**: 客戶端 ID 配置錯誤
**解決**: 檢查 Google Cloud Console 中的客戶端 ID 是否正確

### 問題 2: "unauthorized_client" 錯誤
**原因**: SHA-1 指紋不匹配
**解決**: 重新獲取 SHA-1 指紋並更新 Google Cloud Console

### 問題 3: "access_denied" 錯誤
**原因**: OAuth 同意畫面配置問題
**解決**: 檢查測試用戶設定和應用程式狀態

### 問題 4: 網路連接錯誤
**原因**: API 未啟用或配額問題
**解決**: 檢查 Google+ API 和 People API 是否已啟用

## 📝 下一步行動

1. **確認 SHA-1 指紋**: 獲取並在 Google Cloud Console 中配置
2. **檢查 API 狀態**: 確保所有必要的 API 都已啟用
3. **測試登入**: 重新構建並測試應用
4. **查看日誌**: 如果仍有問題，檢查詳細的錯誤日誌

## 🎉 成功指標

登入成功後，你應該看到：
- 應用進入主界面
- 用戶頭像或名稱顯示在右上角
- 不再顯示登入畫面
- Android Studio Logcat 中有成功的日誌信息