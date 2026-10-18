# 會考小老師 — 國中會考練習 App

每天 5 題會考練習、答錯自動收進錯題本、AI 錯題小老師一步步引導、多鄰國式連勝，
全校前三名上傳證明可免費使用。iOS、Android 共用同一套程式。

> 這份專案是可以上架的第一版（MVP）：國中國文、英語（含聽力）、數學、自然、社會五科（七上～九下 86 個單元、2,580 題，每單元 30 題，聽力以外每單元至少 8 題困難題），
> 以及國小五、六年級國語、數學（五上～六下 28 個單元、420 題，簡單／中等／困難三種難度）的自編練習題，
> 含會考模擬考（計時、交卷看弱點單元、成績進步曲線、家長可看）、教科書版本章節對照、訂閱收費（RevenueCat）、獎勵式廣告（AdMob）、忘記密碼、每日提醒、當機回報（Sentry）、
> 管理後台網頁、App 圖示與商店上架素材。
> 其他四科題庫、會考歷屆題建檔列在最後的「下一步」。

---

## 1. 功能與架構

| 功能 | 說明 | 程式位置 |
| --- | --- | --- |
| 註冊登入 | Email＋密碼；學生需勾選家長同意；家長帳號 | `app/src/app/(auth)/login.tsx` |
| 忘記密碼 | Email 收 6 位數驗證碼，App 內設定新密碼 | `app/src/app/(auth)/forgot.tsx` |
| 訂閱收費 | 月／年自動續訂、學期方案、恢復購買；伺服器向 RevenueCat 查證 | `app/src/app/paywall.tsx`、`app/src/lib/purchases.ts`、`supabase/functions/sync-subscription`、`revenuecat-webhook` |
| 獎勵式廣告 | 免費版小老師用完時，可選擇看一支廣告多 1 次（每天最多 2 次）；非個人化、普遍級 | `app/src/lib/ads.native.ts`、`app/src/app/tutor.tsx` |
| 當機回報 | 閃退與錯誤自動回報，不送個資 | `app/src/lib/sentry.ts` |
| 每日提醒 | 手機本地通知，可選 17:00／19:30／21:00；今天已完成 5 題就不提醒 | `app/src/lib/reminders.ts` |
| 管理後台 | 總覽數字、審核前三名（看照片、通過／退回、自動刪照片）、處理題目回報 | `admin/index.html` |
| 首次設定 | 年級、課本版本、小老師角色 | `app/src/app/onboarding.tsx` |
| 首頁 | 連勝天數、本週打卡、保護卡、每日任務 | `app/src/app/(tabs)/index.tsx` |
| 學期複習 | 七上～九下單元關卡、熟練度、組段考複習卷 | `app/src/app/(tabs)/learn.tsx` |
| 做題 | 選答、檢查、答對答錯回饋、連對次數、題目回報 | `app/src/app/quiz.tsx` |
| 錯題本 | 待講解／學習中／已畢業，到期複習 | `app/src/app/(tabs)/mistakes.tsx` |
| 錯題小老師 | AI 追問式講解、3 層提示、換個方式講、相似題驗收 | `app/src/app/tutor.tsx`、`supabase/functions/tutor` |
| 前三名申請 | 拍照上傳證明、審核後免費到學期結束 | `app/src/app/top-three.tsx` |
| 家長端 | 用邀請碼綁定孩子，看 7 天練習、各科答對率、弱點單元 | `app/src/components/parent-home.tsx` |
| 我的 | 暱稱、年級、小老師、邀請碼、登出、刪除帳號 | `app/src/app/(tabs)/me.tsx` |

```
手機 App（Expo / React Native）
   │  登入、讀寫資料（只能呼叫伺服器函式，看不到答案）
   ▼
Supabase（台灣使用者建議選 Tokyo 或 Singapore 區域）
   ├─ PostgreSQL：題庫、作答紀錄、錯題本、連勝、前三名申請（權限規則 RLS 保護）
   ├─ Storage：成績證明照片（私有，只有本人可讀）
   └─ Edge Functions：tutor（呼叫 Claude API）、delete-account、
                      sync-subscription、revenuecat-webhook（向 RevenueCat 查證訂閱）
RevenueCat（處理 App Store／Google Play 訂閱）・AdMob（廣告）・Sentry（當機回報）
```

**重要設計**：對錯判斷、XP、連勝、錯題狀態全部在伺服器端計算（`submit_answer` 函式），
App 端拿不到答案，也無法直接改分數或付費狀態。

### 規則一覽（都可以在資料表 `app_config` 調整，不用改程式）

| 項目 | 預設 |
| --- | --- |
| 每日連勝門檻 | 答 5 題（對錯都算） |
| 免費版每日題數 | 30 題 |
| 免費版每日小老師 | 3 次（完整版 50 次，防濫用） |
| 保護卡 | 註冊送 2 張；每連勝 7 天送 1 張，最多 5 張；漏掉的天數自動使用 |
| 錯題畢業 | 相似題驗收答對 → 1 天後 → 3 天後 → 7 天後各答對一次；任一次答錯退回待講解 |
| XP | 答對 +10；錯題畢業 +30 |
| 前三名 | 審核通過免費到學期結束（上學期到 1/31，下學期到 7/31） |
| 完整版 | 前三名審核通過，或訂閱有效（兩者取較晚的到期日） |
| 看廣告換小老師 | 免費版每天最多 2 次（`ad_bonus_daily_max`）；`ads_enabled` 設成 `false` 可全面關閉廣告 |
| 學期方案 | 購買日起 183 天（不自動續訂） |

---

## 2. 資料夾

```
cap-app/
├─ app/                      手機 App（Expo SDK 57）
│  ├─ src/app/               每個檔案就是一個畫面
│  ├─ src/components/        共用元件
│  ├─ src/lib/               Supabase 連線、API、登入狀態、配色
│  ├─ app.json               App 名稱、圖示、套件 ID、權限說明
│  ├─ eas.json               雲端打包設定
│  └─ .env.example           環境變數範本
├─ supabase/
│  ├─ migrations/            資料庫結構與伺服器函式
│  ├─ seed.sql               題庫（由腳本產生）
│  ├─ seed/questions_math.json
│  └─ functions/             tutor、delete-account
├─ scripts/
│  ├─ questions_math.py      題庫原稿（在這裡新增或修改題目）
│  └─ build_seed.py          驗證題庫並產生 seed.sql
├─ admin/index.html          管理後台（用瀏覽器直接打開）
├─ store/                    商店截圖、主題圖片、上架文案 listing.md
├─ tests/                    資料庫、小老師、訂閱邏輯、畫面流程、管理後台測試
│  └─ integration/           整合測試：真實 PostgreSQL＋Edge Functions＋App 畫面
└─ docs/                     隱私權政策、服務條款草稿、畫面截圖
```

---

## 3. 已經做過的測試

| 測試 | 結果 | 怎麼重跑 |
| --- | --- | --- |
| 題庫驗證：格式、答案在選項內、每個錯誤選項都有原因、觀念題數、題幹不重複、1,078 題驗算式 | 3,000 題全部通過 | `python scripts/build_seed.py` |
| 題庫盲測：另一組 AI 看不到答案重新作答，比對答案鍵 | 前幾批 946 道新題 944 題一致（2 題經裁定為作答方錯誤）；第三批補題中國文、英語、自然、社會 870 題全部一致（數學 92 題以驗算式驗證） | `python scripts/blind_review.py`（見檔案說明） |
| 資料庫：在真實 PostgreSQL（PGlite，已模擬 Supabase 預設權限）執行 migration＋題庫，測 27 個情境 | 27 項通過 | `cd tests && npm install && node db.test.mjs` |
| 資料庫（收費與廣告）：只有伺服器能寫訂閱、過期恢復免費、廣告次數上限與間隔 | 含在 23 項中 | 同上 |
| 資料庫（管理員）：一般使用者被擋、管理員審核／下架／刪照片 | 含在 23 項中 | 同上 |
| 管理後台畫面：登入→總覽→審核（退回需填說明）→刪照片→下架題目→標記已處理 | 4 項通過 | `node tests/admin_web_mock.mjs` |
| 小老師邏輯：提示層級、防洩漏答案、情緒危機偵測、回覆解析 | 8 項通過 | `node tests/tutor_logic.test.mjs` |
| 訂閱邏輯：到期日計算、學期方案、webhook 使用者辨識、密鑰比對 | 7 項通過 | `node tests/subscription.test.mjs` |
| 原生設定：iOS／Android prebuild（AdMob、相機權限、Sentry） | 通過 | `npx expo prebuild --no-install` |
| App：TypeScript 型別檢查、ESLint、Android 打包 | 全部通過 | `cd app && npm run typecheck && npx eslint src` |
| 畫面流程：網頁版＋模擬後端，走首頁→練習→答錯→小老師→驗收→錯題本→我的→前三名→升級頁→小老師次數用完→家長端→忘記密碼 | 無頁面錯誤 | 見 `tests/e2e_web_mock.mjs` 開頭說明 |
| **整合測試（API）**：App 用的 supabase-js → 真實 PostgreSQL 16（RLS、RPC、儲存空間權限）→ 真實 Edge Functions（Deno 執行）| 17 項通過（含 20 個請求同時送出的防並發測試） | 見下方「整合測試」 |
| **整合測試（畫面）**：App 網頁版連真實後端，註冊→練習→小老師→連勝→複習卷→前三名上傳→管理後台審核→家長綁定→忘記密碼→次數用完 | 14 項通過、無頁面錯誤 | 見下方「整合測試」 |

**整合測試中找到並修好的問題**
1. 小老師防洩漏：模型說出「錯誤的」選項代號（例如正解是 D、卻說「答案是 C」）時沒被攔下 → 已修正，任何「答案是 X」都會改寫。
2. 本機開發：App 和管理後台只接受 `https://`，接不上 Supabase 本機環境（`http://127.0.0.1:54321`）→ 已改成 http／https 都可以。

**上線前檢查（第 2 輪）找到並修好的問題**
3. **嚴重**：Supabase 預設會把新的資料庫函式開放給所有登入者，學生可以自己呼叫「審核前三名」讓自己變完整版 → 改成白名單，只開放 App 需要的函式。
4. 小老師次數可被繞過：同時送很多請求、或開始後一直回覆都不會扣次數 → 每一則 AI 回覆都在資料庫原子扣次，另有全站每日上限（`global_daily_tutor_calls`）當費用保險絲；AI 失敗會退回次數。
5. 家長邀請碼只有 6 碼、可無限猜 → 改 8 碼、每天輸錯 10 次鎖住；學生可在「我的」查看、解除家長綁定、換新代碼。
6. 付款成功但同步失敗時，App 會說「沒有扣款」→ 改成「付款成功，正在開通」並自動重試。
7. 沒網路時整個 App 卡在轉圈圈 → 保留舊資料，第一次就失敗時顯示「再試一次／登出」。
8. 連點「檢查答案」「購買」「送出」會重複送出；Android 鍵盤擋住輸入框；實體返回鍵跳過確認 → 已修。
9. 使用 AI 小老師前加上資料使用同意畫面（Apple 5.1.2(i)），回報按鈕新增「內容不恰當」（Google Play AI 政策）。
10. AdMob 改為兒童導向設定（Google Play 家庭政策）；成績證明照片限制 5 MB、只收圖片；題目回報防灌；補資料庫索引；iOS 隱私清單。

**整合測試怎麼跑**（工程師用；需要 PostgreSQL 16、Node 22、Deno）

```bash
# 1. 重建測試資料庫（stub → migrations → 題庫）
DATABASE_URL=postgres://postgres@127.0.0.1:55432/capapp bash tests/integration/reset_db.sh
# 2. API 整合測試（會自動啟動：Supabase API 模擬器、真實 Edge Functions、Claude／RevenueCat 模擬服務）
cd tests/integration
DATABASE_URL=... DENO_BIN=deno node api.test.mjs
# 3. 畫面整合測試：先打包網頁版再跑
cd ../../app && EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_integration_test EXPO_PUBLIC_SUPPORT_EMAIL=help@example.com \
  npx expo export --platform web --clear --output-dir /tmp/exp-int
cd ../tests/integration && DATABASE_URL=... DENO_BIN=deno node ui.test.mjs
```

有 Docker 的話，也可以直接用官方的 `npx supabase start` 在本機跑完整 Supabase 來測。

**還沒測到的（需要你的帳號或實機才能測）**：真的呼叫 Claude API（測試中用模擬回覆）、
在 iPhone／Android 實機上拍照上傳與每日提醒通知、真實的沙盒購買與廣告播放。照第 4 節做完就能自己試。

---

## 4. 上線步驟（Windows 電腦）

### 步驟 0：申請帳號（先做，有些要等審核）

| 帳號 | 用途 | 費用 |
| --- | --- | --- |
| [Supabase](https://supabase.com) | 資料庫與伺服器 | 免費版可開始（見第 6 節） |
| [Anthropic Console](https://console.anthropic.com) | 小老師用的 Claude API 金鑰 | 依用量計費 |
| [Expo](https://expo.dev) | 雲端打包 App | 免費方案可開始 |
| [Apple Developer Program](https://developer.apple.com/programs/) | 上架 App Store | 每年 US$99 |
| [Google Play Console](https://play.google.com/console) | 上架 Google Play | 一次 US$25 |
| [Resend](https://resend.com)（或其他寄信服務） | 寄註冊確認信、重設密碼驗證碼 | 小量免費 |
| [RevenueCat](https://www.revenuecat.com) | 管理訂閱收費 | 每月營收 US$2,500 以下免費，超過收 1% |
| [Google AdMob](https://admob.google.com) | 廣告 | 免費（Google 分潤） |
| [Sentry](https://sentry.io) | 當機回報 | 免費方案可開始 |

> Google Play 注意：2023/11/13 之後建立的**個人**開發者帳號，要先做「封閉測試」：
> **至少 12 位測試者連續參加 14 天**，才能申請正式上架。可以先找親友、同事的小孩測試，
> 也可以改用公司／組織帳號（需要鄧白氏編號 D-U-N-S）避開這個規定。

### 步驟 1：安裝工具

1. 安裝 [Node.js LTS](https://nodejs.org)（一路按下一步）。
2. 安裝 [Git](https://git-scm.com/download/win)。
3. 把 `cap-app` 資料夾解壓縮到例如 `C:\Projects\cap-app`。
4. 開啟「命令提示字元」或 PowerShell，後面的指令都在這裡輸入。

### 步驟 2：建立資料庫

1. Supabase 後台 → **New project**，區域選 **Northeast Asia (Tokyo)** 或 **Southeast Asia (Singapore)**，設定一組資料庫密碼並記下來。
2. 左側 **SQL Editor** → 依照檔名順序，一次開一個 New query，把 `supabase/migrations/` 裡的 12 個檔案**整份**貼上 → **Run**：
   1. `20260926000001_init.sql`（主要資料表）
   2. `20260926000002_monetization.sql`（收費與廣告）
   3. `20260926000003_admin.sql`（管理後台）
   4. `20260926000004_hardening.sql`（安全強化，**一定要跑**）
   5. `20260927000005_subjects.sql`（多科目）
   6. `20260927000006_textbook_versions.sql`（教科書版本）
   7. `20261003000007_prelaunch.sql`（每日出題、條款紀錄、升年級提醒）
   8. `20261003000008_mock_listening.sql`（模擬考成績紀錄、英語聽力）
   9. `20261004000009_parent_unlink.sql`（家長可自己解除綁定）
   10. `20261007000010_exam_stages.sql`（段考分階段、難度選擇、完整詳解）
   11. `20261008000011_elementary.sql`（國小五、六年級：國語、數學）
   12. `20261018000012_social_exam_parts.sql`（社會科每次段考都含地理、歷史、公民）
3. **12 個都跑完後**，再匯入題庫 `supabase/seed.sql`（國中五科 2,580 題（含英語聽力 90 題）＋國小國語、數學 420 題＋版本章節對照，約 3.2 MB）。檔案較大，建議用指令匯入：
   Supabase 後台 **Connect** → 複製「Session pooler」連線字串，然後執行
   `psql "連線字串" -f supabase/seed.sql`（沒有 psql 也可以貼到 SQL Editor 執行，只是要等比較久）。
   以後題目有修改，只要重新匯入 seed.sql（同樣題號會更新、不會重複；管理後台下架的題目會維持下架）。
4. 左側 **Authentication** 的登入方式設定：Email 保持開啟。
   - **重要**：Supabase 內建寄信只會寄給專案成員、每小時 2 封，學生根本收不到信。
     正式上線前一定要設定自訂寄信（見下方「自訂寄信」）。自己測試時可以先把「Confirm email」關掉。
5. **Authentication → Email Templates → Reset Password**：把信件內容改成顯示驗證碼，例如：
   `<p>你的重設密碼驗證碼：<strong>{{ .Token }}</strong>（1 小時內有效）</p>`
   App 的「忘記密碼」是輸入這 6 位數驗證碼，不用點連結。

**自訂寄信（Resend 為例）**：Resend 註冊 → 驗證你的網域（例如 `mail.你的網域`）→ 取得 SMTP 帳密 →
Supabase **Authentication → SMTP Settings** 開啟 Custom SMTP，填入主機 `smtp.resend.com`、Port `465`、
使用者 `resend`、密碼（API key）、寄件人例如 `no-reply@你的網域`。沒有網域的話要先買一個（一年數百元）。
6. **Authentication → URL Configuration**：Site URL 先填你的網站或 `capapp://`。
7. **Project Settings → API Keys**：記下 **Project URL** 和 **Publishable key**（不要把 secret／service_role key 放進 App）。

### 步驟 3：部署錯題小老師

在命令列進入專案資料夾：

```bash
cd C:\Projects\cap-app
npx supabase login
npx supabase init            # 問題都按 Enter（已存在的 supabase 資料夾會保留）
npx supabase link --project-ref 你的專案代碼   # 在 Project URL 裡 https://這一段.supabase.co
npx supabase functions deploy tutor
npx supabase functions deploy delete-account
npx supabase functions deploy sync-subscription
npx supabase functions deploy revenuecat-webhook --no-verify-jwt
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-你的金鑰
```

收費功能設定好（步驟 5-2）之後再補：

```bash
npx supabase secrets set REVENUECAT_SECRET_KEY=sk_你的RevenueCat密鑰
npx supabase secrets set REVENUECAT_WEBHOOK_AUTH=自己想一組很長的亂碼
```

選填：`npx supabase secrets set ANTHROPIC_MODEL=claude-haiku-4-5-20251001`（預設就是這個，便宜、速度快；
想要講解品質更好可改成 `claude-sonnet-5`，費用較高）。

Sentry 設定（有用的話）：到 Sentry 專案 **Settings → Security & Privacy** 打開「Prevent Storing of IP Addresses」，隱私權政策寫的「不收集 IP」才會成立。

測試用（正式環境不用設）：`ANTHROPIC_BASE_URL`、`REVENUECAT_API_URL` 可以把 Edge Functions 指到模擬服務，
整合測試就是這樣做的。

### 步驟 4：在自己手機上試用

```bash
cd C:\Projects\cap-app\app
npm install
copy .env.example .env
```

用記事本打開 `app\.env`，填入步驟 2 記下的 URL 和 Publishable key，然後：

```bash
npx expo start
```

手機安裝 **Expo Go**（App Store／Google Play 都有），掃畫面上的 QR code 就能在手機上使用。
Expo Go 裡**購買會是模擬模式、不會顯示廣告**，每日提醒也建議用開發版測試，其他功能都能測。要測真正的購買和廣告，請用步驟 6 的「開發版」。
建議測試：註冊學生帳號 → 做 5 題 → 故意答錯 → 找小老師 → 驗收 → 隔天再看連勝；
再註冊一個家長帳號，輸入學生「我的」頁面上的邀請碼。

### 步驟 5：改成你自己的 App

編輯 `app/app.json`：

- `name`：App 顯示名稱（目前是「會考小老師」，上架前先查商標與同名 App）。
- `ios.bundleIdentifier`、`android.package`：改成你自己的，例如 `tw.susan.capapp`，**上架後就不能改**。
- 圖示：已經做好一組原創圖示（對話框＋打勾）。想換成自己的設計，替換 `app/assets/images/` 裡的
  `icon.png`（1024×1024，不能透明）、`android-icon-*.png`、`splash-icon.png`，或修改 `scripts/make_icons.mjs` 重新產生。
- `ios.supportsTablet` 設為 `false`：只支援 iPhone，就不需要準備 iPad 截圖（iPad 仍可用相容模式執行）。

隱私權政策和服務條款：把 `docs/` 裡的草稿修改後放到網站（Google Sites、Notion 公開頁都可以），
網址填進 `.env` 的 `EXPO_PUBLIC_PRIVACY_URL`、`EXPO_PUBLIC_TERMS_URL`。**上架前請律師看過。**

### 步驟 5-2：設定收費（RevenueCat）

1. **商店建立商品**
   - App Store Connect → 你的 App → 訂閱項目：建立訂閱群組「完整版」，新增 `premium_monthly`（1 個月）、`premium_yearly`（1 年）；
     App 內購買項目 → 新增「非續訂型訂閱」`premium_semester`。
   - Google Play Console → 營利 → 訂閱：新增 `premium_monthly`、`premium_yearly`；應用程式內產品：新增 `premium_semester`。
   - 價格可參考功能說明文件：月 NT$199、學期 NT$890、年 NT$1,690。
   - 兩邊都要先完成「付費應用程式協議」、銀行帳戶、稅務資料，商品才能賣。
2. **RevenueCat 後台**
   - 建立專案，分別加入 iOS App（填 App Store Connect 的 In-App Purchase Key）和 Android App（上傳 Google 服務帳戶金鑰）。
   - Entitlements 新增一個，識別碼一定要是 **`premium`**，把三個商品都掛上去。
   - Offerings 的 `default` 裡新增 Packages：Monthly、Annual，以及自訂的 Semester。
   - API keys：把 iOS 和 Android 的 **Public** key 填到 `EXPO_PUBLIC_REVENUECAT_IOS_KEY`／`EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`；
     **Secret** key（v1）填到步驟 3 的 `REVENUECAT_SECRET_KEY`。
   - Integrations → Webhooks：網址填 `https://你的專案代碼.supabase.co/functions/v1/revenuecat-webhook`，
     Authorization header 填步驟 3 的 `REVENUECAT_WEBHOOK_AUTH`，按 Send test 確認。
3. **測試購買**：iOS 用 App Store Connect 的沙盒測試帳號、Android 用 Play Console 的授權測試人員，不會真的扣款。

### 步驟 5-3：設定廣告（AdMob）

1. AdMob 建立兩個應用程式（iOS、Android），各建立一個「**獎勵式**」廣告單元。
2. 把 **應用程式 ID**（`ca-app-pub-…~…`）填進 `app/app.json` 的 `react-native-google-mobile-ads` 設定，取代目前的 Google 測試 ID。
3. 把 **廣告單元 ID**（`ca-app-pub-…/…`）填到 `EXPO_PUBLIC_ADMOB_REWARDED_IOS`／`EXPO_PUBLIC_ADMOB_REWARDED_ANDROID`。
   沒填的話正式版不會出現廣告按鈕；開發版會播 Google 測試廣告。
4. AdMob → 封鎖控制：廣告內容分級選 **G（普遍級）**，封鎖敏感類別（約會、賭博、酒類等）。程式也已強制只要求普遍級、非個人化廣告。
5. 在你的網站根目錄放 `app-ads.txt`（AdMob 會提供內容），並在商店頁填上網站網址。
6. Play Console「廣告」聲明選「含有廣告」；Apple 隱私權表單勾「第三方廣告：裝置識別碼」（非追蹤用途）。

### 步驟 5-4：設定當機回報（Sentry，可選）

Sentry 建立 React Native 專案，把 DSN 填到 `EXPO_PUBLIC_SENTRY_DSN`。
想看到易讀的錯誤位置，再到 `eas.json` 把 `SENTRY_DISABLE_AUTO_UPLOAD` 拿掉，並用
`eas env:set --name SENTRY_AUTH_TOKEN …（--visibility secret）` 設定 Sentry 的 auth token、
在 `app.json` 的 `@sentry/react-native` 加上 `organization` 和 `project`。

### 步驟 6：雲端打包

**最快的方式（Android 測試版）**：填好 `app\.env` 後，在檔案總管裡雙擊 `app\build-android-test.bat`。
它會檢查設定、登入 Expo、把 `.env` 上傳成 preview 環境變數，再雲端打包出 APK，完成後掃 QR code 就能裝到手機。
要打包正式上架版，照下面的指令手動執行（環境改成 `production`）。

```bash
cd C:\Projects\cap-app\app
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest env:set --name EXPO_PUBLIC_SUPABASE_URL --value https://你的專案代碼.supabase.co --environment production --visibility plaintext
npx eas-cli@latest env:set --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value 你的publishable-key --environment production --visibility plaintext
npx eas-cli@latest env:set --name EXPO_PUBLIC_PRIVACY_URL --value https://你的網站/privacy --environment production --visibility plaintext
npx eas-cli@latest env:set --name EXPO_PUBLIC_TERMS_URL --value https://你的網站/terms --environment production --visibility plaintext
# 收費、廣告、當機回報（有設定才需要，名稱同 .env.example）
npx eas-cli@latest env:set --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value appl_… --environment production --visibility plaintext
npx eas-cli@latest env:set --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value goog_… --environment production --visibility plaintext
npx eas-cli@latest env:set --name EXPO_PUBLIC_ADMOB_REWARDED_IOS --value ca-app-pub-… --environment production --visibility plaintext
npx eas-cli@latest env:set --name EXPO_PUBLIC_ADMOB_REWARDED_ANDROID --value ca-app-pub-… --environment production --visibility plaintext
npx eas-cli@latest env:set --name EXPO_PUBLIC_SENTRY_DSN --value https://… --environment production --visibility plaintext
npx eas-cli@latest env:set --name EXPO_PUBLIC_SUPPORT_EMAIL --value 你的客服信箱 --environment production --visibility plaintext
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest build --platform ios --profile production
```

- `.env` 檔不會上傳到雲端打包，所以上面要用 `env:set` 再設定一次（`preview` 環境也可以照樣設定）。
- iOS 打包時會要求登入 Apple 開發者帳號，EAS 會自動建立憑證，**不需要 Mac**。
- 想先給測試者裝：用 `--profile preview` 打包 Android APK 直接傳檔案安裝。
- **開發版**（測試購買、廣告用）：`npx eas-cli@latest build --platform android --profile development`，
  裝到手機後執行 `npx expo start`，開發版會自動連上。`development` 環境的變數也要用 `env:set --environment development` 設定。

### 步驟 7：送審上架

```bash
npx eas-cli@latest submit --platform ios --latest
npx eas-cli@latest submit --platform android --latest
```

送審前在商店後台要準備：

- [ ] App 名稱、簡介、關鍵字：直接使用 `store/listing.md`
- [ ] 截圖：`store/ios/`（1290×2796）、`store/android/`（1080×1920）、`store/android/feature-graphic.png`
- [ ] 客服網址（App Store 必填）
- [ ] 隱私權政策網址
- [ ] **審核用測試帳號**：Apple 審核一定要能登入，請建立一個學生帳號並在「App 審核資訊」填上帳密
- [ ] 訂閱商品已送審（第一次送審時要跟 App 一起送）；購買頁有價格、期間、自動續訂說明、條款與隱私權連結、恢復購買（已做好）
- [ ] 年齡分級問卷；App 主要對象是 13～15 歲國中生，**不要選「兒童類別」**（兒童類別限制很多）
- [ ] Apple「App 隱私權」與 Google「資料安全性」表單：收集 Email、暱稱、學習紀錄、成績證明照片（選擇性）、購買紀錄；
      廣告 SDK 會使用裝置識別碼（非個人化、不做跨 App 追蹤）；當機資料；可刪除帳號
- [ ] Google Play 的「目標對象與內容」：若選到 13 歲以下，會適用家庭政策，要求更嚴格
- [ ] AI 生成內容：App 內已有「講錯了」回報按鈕，送審說明可以提到
- [ ] Google Play 個人帳號：先完成 12 人 × 14 天封閉測試

---

## 5. 日常營運

### 管理後台（建議）

1. 先在 App 註冊一個帳號（或用 Supabase 後台 Authentication → Add user 建立），然後在 **SQL Editor** 執行一次：

```sql
insert into public.admins (user_id) select id from auth.users where email = '你的Email';
```

2. 用 Chrome／Edge 直接打開 `admin/index.html`（雙擊檔案即可），第一次輸入 Project URL 和 Publishable key，再用上面的帳號登入。
3. 功能：
   - **總覽**：學生數、今天和 7 天內有練習的人數、作答題數、訂閱人數、待處理事項。
   - **前三名審核**：看成績證明照片 → 通過（自動開通到學期結束）或不通過（必填說明）→ 照片自動刪除。
   - **題目回報**：看學生回報與題目答案、解析 → 先下架／重新上架 → 標記已處理。
4. 想讓其他老師幫忙審核，就把他們的帳號也加進 `admins`。

> 後台網頁只用 Publishable key，所有權限由資料庫檢查「是不是管理員」，網頁檔案外流也拿不到資料。

### 用 SQL 審核（備用）

1. Supabase → **Storage → proofs**，打開學生上傳的照片確認內容。
2. **SQL Editor** 執行：

```sql
-- 看待審核的申請
select id, school, grade, exam, school_rank, proof_path, created_at
from top_three_applications where status = 'pending' order by created_at;

-- 通過（自動開通完整版到學期結束）
select review_top_three('申請的 id', true, '已確認，恭喜！');

-- 不通過
select review_top_three('申請的 id', false, '照片看不清楚排名，請重新上傳');
```

3. 審核完到 Storage 刪除那張照片（隱私權政策承諾審核後刪除）。

### 處理題目回報

```sql
select r.created_at, r.kind, r.note, q.id, q.stem
from question_reports r join questions q on q.id = r.question_id
order by r.created_at desc;

-- 有問題的題目先下架
update questions set active = false where id = 'M-8A-2-03';
```

### 新增或修改題目

1. 題庫在 `scripts/`：數學 `questions_math.py`＋`questions_math_x1～x4.py`、國文 `questions_chinese.py`、英語 `questions_english.py`、
   自然 `questions_science_a/b.py`、社會 `questions_social_a/b.py`。出題規範在 `scripts/QUESTION_GUIDE.md`。
   照現有格式新增（`Q(...)`），**新題加在檔案最後面，不要刪除或調換既有題目**（題號依順序產生，學生的作答紀錄會對不上）。要停用題目請用管理後台「下架」。
   **教科書版本對照**在 `scripts/versions/<科目>.json`（康軒、南一、翰林各單元的學期與章節）。人工核對用的表格在 `docs/textbook-versions.csv`（Excel 可直接開），
   「可信度：低」的列請優先找學校的教學進度表或課本目錄核對；改好 JSON 後重跑 build_seed.py 並重新匯入 seed.sql。
2. 單一檔案先檢查：`python scripts/check_bank.py questions_english`；全部檢查並產生匯入檔：`python scripts/build_seed.py`。
3. 把新的 `supabase/seed.sql` 貼到 SQL Editor 執行（同樣 id 會更新，不會重複）。

### 調整免費額度

```sql
update app_config set value = '40' where key = 'free_daily_questions';
update app_config set value = '5'  where key = 'free_daily_tutor';
```

---

## 6. 費用估算

| 項目 | 費用 |
| --- | --- |
| Apple Developer Program | 每年 US$99 |
| Google Play Console | 一次 US$25 |
| Supabase | 免費版：資料庫 500 MB、每月 5 萬活躍使用者、50 萬次 Edge Function、1 GB 檔案；**一週沒人使用會暫停**，正式上線建議 Pro（US$25／月起） |
| Claude API（小老師） | 依字數計費；Haiku 模型每次講解大約新台幣 1 元以內（依對話長短），實際請看 Anthropic Console 的用量 |
| EAS 打包 | 免費方案每月有打包次數上限，初期夠用 |
| 商店抽成 | Apple 小型企業方案 15%；Google Play 依地區與方案 15% 起 |
| RevenueCat | 每月營收 US$2,500 以下免費，超過收 1% |
| 寄信服務 | Resend 等小量免費；需要自己的網域 |

價格以各官網公告為準；上面資料查詢於 2026 年 9 月。

---

## 7. 下一步（還沒做的）

1. **廣告伺服器端驗證（SSV）**：目前看廣告的獎勵由 App 回報、伺服器限制每天 2 次，濫用影響很小；
   使用者多了可以改用 AdMob 的伺服器端驗證回呼（App 已經帶上使用者 id）。
2. **英語聽力（已做基本版）**：用手機語音朗讀（expo-speech），男女聲以音調區分。若想要真人錄音，可在 questions 加音檔網址欄位、存到 Supabase Storage。目前不含需要看圖的「辨識句意」題型。
3. **會考歷屆題建檔**：依授權查核結果，題目本身可使用，但試題說明、答對率、英聽音檔需先向心測中心確認。
4. **題庫老師審閱**：3,000 題是 AI 自編原創題，數學與自然計算題有程式驗算、全部新題有盲測交叉驗證；上架前仍建議請各科老師抽查，特別是國文字音、書信用語與社會科年代。
5. **家長 LINE 週報**（LINE Messaging API）。
6. **題目管理介面**：目前改題目要編輯 `questions_math.py`；題庫變大後可以在後台加上新增／修改題目的功能。

---

## 8. 安全與隱私重點

- 學生看不到答案與解析，直到作答後由伺服器回傳。
- 小老師有三層防護：提示詞規則、伺服器端偵測洩漏答案、每日次數限制。
- 學生訊息出現情緒危機或霸凌字詞時，停止講解並顯示 1925 安心專線、1995 生命線、1980 張老師。
- 小老師不會詢問個資；暱稱建議不用真名。
- App 內可刪除帳號（Apple 規定），會一併刪除所有紀錄與照片。
- `service_role` 金鑰、RevenueCat Secret key 只存在 Supabase 伺服器端，**絕對不要放進 App 或上傳 GitHub**。
- 訂閱狀態由伺服器向 RevenueCat 查證後寫入，App 無法自己開通完整版。
- 廣告只要求非個人化、普遍級內容，並標記使用者可能未成年；只有學生主動按下才播放，完整版沒有廣告。
