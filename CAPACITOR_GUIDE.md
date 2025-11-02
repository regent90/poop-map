# 便便地圖 Capacitor 移動應用指南

## 📱 概述
便便地圖現在已經完全配置為使用 Capacitor 的跨平台移動應用，支持 iOS、Android 和 PWA。

## 🛠️ 開發環境要求

### Android 開發
- **Android Studio** (最新版本)
- **Java Development Kit (JDK)** 17 或更高版本
- **Android SDK** (API Level 33 或更高)
- **Gradle** (通過 Android Studio 安裝)

### iOS 開發 (僅限 macOS)
- **Xcode** 14 或更高版本
- **iOS SDK** 16.0 或更高版本
- **CocoaPods** (`sudo gem install cocoapods`)

## 🚀 快速開始

### 1. 安裝依賴
```bash
npm install
```

### 2. 構建 Web 應用
```bash
npm run build
```

### 3. 同步到原生平台
```bash
npm run cap:sync
```

## 📱 平台特定命令

### Android
```bash
# 構建並打開 Android Studio
npm run cap:android

# 直接在設備上運行
npm run cap:run:android

# 僅同步 Android
npx cap sync android
```

### iOS
```bash
# 構建並打開 Xcode
npm run cap:ios

# 直接在設備上運行
npm run cap:run:ios

# 僅同步 iOS
npx cap sync ios
```

## 🔧 配置詳情

### Capacitor 配置 (`capacitor.config.ts`)
- **App ID**: `com.regent.poopmap`
- **App Name**: `便便地圖`
- **Web Directory**: `dist`
- **Android Scheme**: `https`

### 已安裝的插件
- `@capacitor/geolocation` - 地理位置服務
- `@capacitor/camera` - 相機功能
- `@capacitor/push-notifications` - 推送通知
- `@capacitor/splash-screen` - 啟動畫面
- `@capacitor/status-bar` - 狀態欄控制
- `@capacitor/keyboard` - 鍵盤控制
- `@capacitor/share` - 分享功能
- `@capacitor/haptics` - 觸覺反饋

## 🎨 資源文件

### 應用圖標
- **源文件**: `resources/icon.svg`
- **生成位置**: 
  - Android: `android/app/src/main/res/mipmap-*/`
  - iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
  - PWA: `public/icons/`

### 啟動畫面
- **源文件**: `resources/splash.svg`
- **生成位置**:
  - Android: `android/app/src/main/res/drawable-*/`
  - iOS: `ios/App/App/Assets.xcassets/Splash.imageset/`

### 重新生成資源
```bash
npx capacitor-assets generate
```

## 🔐 權限配置

### Android 權限 (`android/app/src/main/AndroidManifest.xml`)
- `INTERNET` - 網絡訪問
- `ACCESS_FINE_LOCATION` - 精確位置
- `ACCESS_COARSE_LOCATION` - 大概位置
- `CAMERA` - 相機訪問
- `READ_EXTERNAL_STORAGE` - 讀取存儲
- `WRITE_EXTERNAL_STORAGE` - 寫入存儲
- `VIBRATE` - 震動反饋

### iOS 權限 (`ios/App/App/Info.plist`)
- `NSLocationWhenInUseUsageDescription` - 位置權限
- `NSCameraUsageDescription` - 相機權限
- `NSPhotoLibraryUsageDescription` - 相冊訪問
- `NSPhotoLibraryAddUsageDescription` - 相冊寫入

## 🌐 PWA 支持

### Manifest 文件 (`public/manifest.json`)
- 支持安裝到主屏幕
- 離線功能準備
- 主題色配置
- 多尺寸圖標

### 服務工作者 (Service Worker)
可以添加 `public/sw.js` 來實現離線功能和緩存策略。

## 🔄 開發工作流程

### 1. 日常開發
```bash
# Web 開發
npm run dev

# 測試移動端功能
npm run cap:build
npm run cap:android  # 或 cap:ios
```

### 2. 代碼更改後
```bash
# 重新構建並同步
npm run cap:build
```

### 3. 添加新插件後
```bash
# 安裝插件
npm install @capacitor/new-plugin

# 同步到原生平台
npm run cap:sync
```

## 📦 構建發布版本

### Android APK/AAB
1. 在 Android Studio 中打開項目
2. 選擇 `Build > Generate Signed Bundle/APK`
3. 選擇 APK 或 Android App Bundle
4. 配置簽名密鑰
5. 選擇 `release` 構建類型

### iOS App Store
1. 在 Xcode 中打開項目
2. 選擇 `Product > Archive`
3. 使用 Organizer 上傳到 App Store Connect
4. 通過 App Store Connect 提交審核

## 🧪 測試

### Android 測試
```bash
# 運行單元測試
cd android && ./gradlew test

# 運行儀器測試（需要連接設備或模擬器）
cd android && ./gradlew connectedAndroidTest
```

### iOS 測試
```bash
# 在 Xcode 中運行測試
# Product > Test (Cmd+U)
```

### Web 測試
```bash
# 如果有配置 Jest 或其他測試框架
npm test
```

## 🐛 常見問題

### 1. Android 構建失敗
- 確保 JAVA_HOME 環境變量正確設置
- 檢查 Android SDK 路徑
- 清理並重新構建: `cd android && ./gradlew clean`

### 2. Android 測試失敗
- 確保測試文件的包名與應用包名一致
- 檢查 `android/app/src/androidTest/java/com/regent/poopmap/` 目錄結構
- 運行測試前確保設備/模擬器已連接

### 2. iOS 構建失敗
- 運行 `cd ios/App && pod install`
- 檢查 Xcode 版本兼容性
- 確保開發者證書正確配置

### 3. 插件不工作
- 檢查權限配置
- 確保在真實設備上測試（某些功能在模擬器上不可用）
- 查看原生日誌輸出

## 📊 性能優化

### 1. 包大小優化
- 使用動態導入分割代碼
- 移除未使用的依賴
- 優化圖片資源

### 2. 啟動時間優化
- 延遲加載非關鍵功能
- 優化啟動畫面顯示時間
- 預加載關鍵資源

## 🔗 有用鏈接
- [Capacitor 官方文檔](https://capacitorjs.com/docs)
- [Android 開發者指南](https://developer.android.com/)
- [iOS 開發者指南](https://developer.apple.com/documentation/)
- [PWA 最佳實踐](https://web.dev/progressive-web-apps/)

## 📝 版本信息
- **Capacitor**: ^7.0.0
- **Android Target SDK**: 34
- **iOS Deployment Target**: 13.0
- **Node.js**: >=18.0.0

---

🎉 恭喜！你的便便地圖現在是一個完整的跨平台移動應用！