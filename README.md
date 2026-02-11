# Hus BookList 📚

![Status](https://img.shields.io/badge/Status-Development-yellow)
![Stack](https://img.shields.io/badge/Stack-Next.js_15-black)
![License](https://img.shields.io/badge/License-MIT-blue)

**Hus BookList** 是一個以「版本導向」為核心的個人書單管理系統。不同於一般書單，它專注於紀錄特定出版社、年份與 ISBN 的精確版本資訊。結合自動化填寫、閱讀生命週期追蹤與社群交流功能，為愛書人打造最理想的數位書架。

## 設計核心 (Core Principles)
* **精準自動化 (Precision Automation)**： 透過 Open Library API 實現「搜尋-選擇版本-自動填入」的流暢體驗，減少手動輸入負擔。
* **版本導向 (Edition-Centric)**： 專為愛書人設計，支持紀錄特定出版社、年份與 ISBN 的精確版本。
* **閱讀生命週期 (Reading Lifecycle)**： 紀錄「閱讀中、已完讀、重讀」的動態循環，而非靜態書單。
* **使用者帳號邊界 (User Boundary)**： 建立嚴格的帳號隔離，確保個人書單的私密性與安全性。
* **AI 協作友好 (Vibe-First)**： 模組化設計，讓 Antigravity 的 Agents 能高效分工並保持邏輯一致性。

## 主要功能 (Features)

### 1. 核心功能 (Core)
* **使用者帳號系統**： 支持 Email/密碼或 Magic Link 登入，登入後方可建立個人書架。
* **魔術搜尋框 (Magic Search)**： 呼叫 Open Library API 進行全庫檢索，不需登入即可試用搜尋。
* **版本選擇器 (Edition Picker)**： 搜尋結果後彈出介面，列出作品的所有版本供使用者挑選。
* **個人書單創建**： 登入用戶可將選定版本加入帳號，並標記「未讀、閱讀中、已完讀」。

### 2. 附加功能 (Additional)
* **新增自定義標籤 (Custom Tags)**： 使用者可為書籍添加多個自定義標籤，方便分類與檢索。
* **資料匯出 (Data Export)**： 支援將個人書單匯出為 CSV、JSON、BibTeX 或 Notion 格式。
* **重讀日誌 (Re-read Tracking)**： 針對已完讀書籍開啟「再次閱讀」模式，系統透過 JSONB 紀錄多次閱讀的時間日誌。
* **Markdown 讀後感**： 每本書提供獨立的個人筆記空間，支援基礎 Markdown 渲染。
* **動態儀表板**： 視覺化呈現目前正在閱讀的進度與最新加入的書籍。
* **公開書單分享 (Public Shelf)**： 允許使用者將特定書單設為公開，並生成可分享的連結（交流功能）。

### 3. 未來追加功能 (Future)
* **閱讀數據分析**： 生成年度統計圖表（閱讀類型、出版社分佈）。
* **社群動態 (Social Feed)**： 追蹤其他閱讀愛好者，查看他們的閱讀動態與書評。
* **AI 讀書摘要**： 串接 LLM 根據筆記內容自動生成書籍精華。

## 資料結構設計 (Data Schema) 🗄️

### 1. profiles (使用者資料)
* `id`: `uuid` (PK, 關聯至 `auth.users`)
* `username`: `text`
* `avatar_url`: `text`

### 2. books (全域書籍快取)
* `id`: `uuid` (PK)
* `ol_edition_key`: `text` (Unique, Open Library 的版本標識)
* `title`, `author`, `publisher`, `published_year`, `isbn_13`, `cover_url`

### 3. user_books (個人書單紀錄)
* `id`: `uuid` (PK)
* `user_id`: `uuid` (FK to `profiles.id`)
* `book_id`: `uuid` (FK to `books.id`)
* `status`: `enum` ('unread', 'reading', 'completed')
* `finished_at`: `timestamp`
* `re_read_logs`: `jsonb` (結構: `[{ "start": "...", "end": "..." }]`)
* `personal_notes`: `text`
* `tags`: `text[]` (自定義標籤陣列)

## 後端架構 (Backend) 🛠️
* **供應商**： Supabase (PostgreSQL)。
* **身份驗證**： Supabase Auth。
* **安全控制**： Row Level Security (RLS) 確保使用者資料隔離。
* **外部 API**： Open Library Search & Works API。

## 前端架構 (Frontend) 🎨
* **框架**： Next.js 15 (App Router) + TypeScript。
* **樣式**： Tailwind CSS。
* **組件庫**： shadcn/ui (Command, Drawer, Card, Badge, Dialog)。
* **數據獲取**： TanStack Query (React Query)。

## 實行步驟 (Implementation Roadmap) 🚀

### 第一階段：基礎建設與安全初始化 (Infrastructure & Security)
- [ ] **環境設定**： 初始化 Next.js 專案，配置 Supabase 環境變數（`.env.local`）。
- [ ] **資料表建立**： 執行 SQL 腳本建立表結構與 auth 觸發器（自動建立 profiles）。
- [ ] **🔒 資安風險檢查 1**：
  - [ ] 檢查 `.env` 是否已列入 `.gitignore`。
  - [ ] 確保資料庫 `books` 與 `user_books` 尚未開啟未受限的寫入權限。

### 第二階段：前端視覺與設計系統 (UI/UX Design)
- [ ] **設計導入**： 使用 v0.dev 或 Stitch 生成前端佈局並交付 Antigravity 進行組件拆解。
- [ ] **組件庫安裝**： 部署 shadcn/ui 並設定全域主題（顏色與字型）。
- [ ] **Layout 實作**： 建立響應式側邊欄、導覽列及空狀態 (Empty State) 預覽。

### 第三階段：認證與 API 邏輯實作 (Auth & API Logic)
- [ ] **認證流實作**： 建立登入/註冊頁面，實作 Next.js Middleware 保護受限路由（Dashboard）。
- [ ] **API 對接**： 撰寫 Open Library API 的異步請求邏輯，處理搜尋與版本過濾。
- [ ] **選擇器互動**： 實作 `EditionPicker` 組件，讓使用者確認版本後才進行 DB 寫入。
- [ ] **🔒 資安檢查 2**： 驗證 Session 是否在 Server 端被正確校驗，防止透過前端代碼繞過登入限制。

### 第四階段：數據持久化與 RLS 配置 (Data & RLS)
- [ ] **CRUD 邏輯**： 實作書籍加入、狀態更新及重讀日誌的 JSONB 操作。
- [ ] **安全原則設定**： 在 Supabase 開啟 RLS。設定 `user_books` 僅限擁有者讀寫（`auth.uid() = user_id`）。
- [ ] **🔒 資安檢查 3**：
  - [ ] 模擬跨帳號請求，確保使用者 A 無法讀取使用者 B 的書單（水平越權檢查）。
  - [ ] 防止大量重複請求 (Debounce) 對 OL API 的影響。

### 第五階段：網站部署與持續整合 (Deployment)
- [ ] **本地 Build 檢查**： 執行 `npm run build` 確認 TypeScript 型別無誤。
- [ ] **部署至 Vercel**： 連結 GitHub 儲存庫，配置 Production 環境變數。
- [ ] **自動化測試**： 驗證生產環境下的 API 請求與登入流程是否正常運作。
