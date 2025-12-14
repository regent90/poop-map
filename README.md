# Poop Map Clone - 趣味便便社交地圖

這是一個基於現代 Web 技術構建的趣味社交應用程式，讓用戶能夠記錄、追蹤並與朋友分享他們的「便便」時刻。本專案結合了精美的 3D Clay 風格 UI、即時地圖互動以及豐富的遊戲化元素（成就、挑戰、排行榜），旨在將日常生理需求轉化為有趣的社交體驗。

## 主要功能

### 互動地圖系統
- **即時定位**：使用 Google Maps integration 顯示用戶當前位置。
- **3D 地圖標記**：根據隱私設定（我的、朋友、公開）顯示不同顏色的 3D 圖釘標記。
- **過濾功能**：可切換顯示全部、僅自己、僅朋友或公開的紀錄。
- **詳細資訊**：點擊標記可查看評分、時間、地點及照片。

### 遊戲化與社交
- **成就系統**：達成特定條件解鎖 3D 獎章（銅牌至鑽石級）。
- **挑戰任務**：參與每日/每週挑戰（如：便便數量、地點多樣性），贏取獎勵。
- **全球排行榜**：與全球玩家或好友比拼數量與積分。
- **好友系統**：發送/接受好友邀請，查看好友動態。
- **互動攻擊**：使用「便便炸彈」等道具對朋友進行惡作劇，支援短影片攻擊特效。

### 極致的 UI/UX 體驗
- **全 3D 圖標設計**：介面全面採用可愛的 3D Clay（黏土風）圖標，取代傳統 Emoji。
- **流暢動畫**：包含介面轉場與攻擊特效動畫。
- **RWD 響應式設計**：完美支援桌面與行動裝置操作。
- **多語言支援**：完整支援繁體中文、簡體中文、英文、日文、韓文、法文、西班牙文、德文。

## 技術棧 (Tech Stack)

本專案採用現代化的全端開發流程：

- **Frontend (前端)**:
  - [React](https://reactjs.org/) (v18) - 用戶介面庫
  - [TypeScript](https://www.typescriptlang.org/) - 強型別語言
  - [Vite](https://vitejs.dev/) - 極速構建工具
  - [Tailwind CSS](https://tailwindcss.com/) - 原子化 CSS 框架
- **Backend & Database (後端與資料庫)**:
  - [Convex](https://www.convex.dev/) - 即時後端即服務 (Real-time Backend-as-a-Service)
- **Maps (地圖服務)**:
  - [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
  - [React Google Maps](https://visgl.github.io/react-google-maps/)

## 快速開始

### 前置需求
- Node.js (v18 或更高版本)
- npm 或 yarn
- Google Maps API Key
- Convex 帳號

### 安裝步驟

1. **複製專案 (Clone)**
   ```bash
   git clone https://github.com/regent90/poop-map-clone.git
   cd poop-map-clone
   ```

2. **安裝依賴 (Install Dependencies)**
   ```bash
   npm install
   ```

3. **環境變數設定 (.env.local)**
   在專案根目錄建立 `.env.local` 檔案，並填入以下內容：
   ```env
   # Google Maps API Key
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   
   # Convex Deployment URL (由 npx convex dev 自動生成，或手動填入)
   VITE_CONVEX_URL=your_convex_url_here
   ```

4. **啟動 Convex 後端**
   開啟一個終端機視窗運行：
   ```bash
   npx convex dev
   ```

5. **啟動前端開發伺服器**
   開啟另一個終端機視窗運行：
   ```bash
   npm run dev
   ```

6. **開始體驗**
   打開瀏覽器訪問 `http://localhost:5173`。

## 專案結構

```
src/
├── components/      # UI 組件 (Header, Map, Modals...)
│   ├── PoopIcons.tsx      # SVG/Image 圖標組件
│   ├── PoopMap.tsx        # 地圖核心組件
│   └── ...
├── config/          # 設定檔 (道具定義、成就定義)
├── convex/          # 後端邏輯 (Database schemas, API functions)
├── utils/           # 工具函數 (地圖圖標生成, 日期處理)
└── types.ts         # TypeScript 類型定義
public/
└── images/
    ├── icon/        # 3D UI 圖標 (Achievements, Social, UI elements)
    └── ui/          # 地圖標記與其他資源
```

## 貢獻指南

歡迎提交 Pull Request 或 Issue 來協助改進這個專案！目前的開發重點在於優化 3D 視覺一致性以及擴展更多有趣的社交道具。

## 📄 授權

MIT License
