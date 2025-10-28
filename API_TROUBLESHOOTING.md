# Google API 故障排除指南

## 當前錯誤
```
Geocoding Service: This API project is not authorized to use this API
Error: Geocoding failed REQUEST_DENIED
```

## 解決步驟

### 1. 檢查 API 金鑰設定
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇你的專案
3. 前往「API 和服務」>「憑證」
4. 點擊你的 API 金鑰：`AIzaSyAXX7GnfPOy6GO0HNzIw9mzDKYQnwMrcLg`

### 2. 檢查 API 限制
在 API 金鑰設定頁面，確保「API 限制」部分包含：
- ✅ Maps JavaScript API
- ✅ Geocoding API  ← **重要：確保這個已勾選**
- ✅ Places API (如果使用)

### 3. 檢查應用程式限制
在「應用程式限制」部分，選擇「HTTP referrer」並添加：
- `localhost:*`
- `127.0.0.1:*`
- `*.vercel.app`
- `poop-map.vercel.app`
- `https://poop-map.vercel.app/*`

### 4. 如果問題持續
1. 嘗試建立新的 API 金鑰
2. 確保專案有正確的計費帳戶
3. 檢查 API 配額是否已用完

## 測試方法
使用應用程式中的「🗺️ 測試 Google API」按鈕來驗證修復。