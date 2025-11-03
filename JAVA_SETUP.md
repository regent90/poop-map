# ☕ Java 環境設置指南

## 問題描述
Android 構建需要 JAVA_HOME 環境變數，但每次新的 PowerShell 會話都會丟失設置。

## 🔧 永久解決方案

### 方法 1: 系統環境變數（推薦）
1. 按 `Win + R`，輸入 `sysdm.cpl`
2. 點擊「環境變數」
3. 在「系統變數」中點擊「新增」
4. 變數名稱: `JAVA_HOME`
5. 變數值: `C:\Program Files\Android\Android Studio\jbr`
6. 點擊「確定」
7. 重新啟動 PowerShell

### 方法 2: PowerShell Profile（臨時）
```powershell
# 每次 PowerShell 啟動時自動設置
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
```

### 方法 3: 批次檔案
創建 `setup-java.bat`:
```batch
@echo off
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%
echo JAVA_HOME set to %JAVA_HOME%
```

## 🧪 驗證設置
```powershell
# 檢查 JAVA_HOME
echo $env:JAVA_HOME

# 檢查 Java 版本
java -version

# 應該顯示類似：
# openjdk version "21.0.8" 2025-07-15
```

## 🚀 運行 Android 應用
設置完成後：
```bash
npm run cap:run:android
```

## 📱 替代方案
如果 JAVA_HOME 問題持續存在，可以：
1. 直接在 Android Studio 中打開項目
2. 使用 Android Studio 的內建構建系統
3. 在 Android Studio 中運行和調試應用

### Android Studio 路徑
```
C:\Users\regent\Downloads\poop-map-clone\android
```

## 🔍 故障排除

### 問題 1: 找不到 Android Studio JDK
檢查路徑是否正確：
```
C:\Program Files\Android\Android Studio\jbr
```

### 問題 2: 權限問題
以管理員身份運行 PowerShell

### 問題 3: 路徑包含空格
確保路徑用引號包圍：
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
```

## ✅ 成功指標
- `java -version` 顯示 OpenJDK 版本
- `echo $env:JAVA_HOME` 顯示正確路徑
- Android 構建不再出現 JAVA_HOME 錯誤