# 講師手冊（Instructor Runbook）

## 課前 48 小時

- [ ] 發送 `setup.md`，收集環境通過截圖。
- [ ] 確認學員主要角色；Playwright 建議兩人一組。
- [ ] 15–20 位 hands-on 學員至少安排一位助教。
- [ ] 測試場地 Wi-Fi、proxy、WebSocket 與 Azure login。
- [ ] 準備一筆成功的 Azure Pipeline run，確認 Tests 與 artifacts 可開啟。
- [ ] 使用 demo tenant；關閉通知並清理 terminal/browser history。

## 課前驗證

```bash
cd playwright-lab
npm run typecheck
npm test

cd ../app-modernization-demo
./scripts/reset-baseline.sh
mvn test

xdg-open ../slides/workshop.html
```

## Playwright 軌

### 13:35–13:55｜自動化測試概覽

- 假設客戶已使用 Playwright，不做 API 入門導覽。
- 以提早風險回饋、可重複證據與節省人工回歸說明價值。
- 區分適合自動化的高價值／可重複／可判定情境，以及應保留人工的探索情境。
- 以商業風險、測試層級、run profile、測試資料與證據形成整體策略。

### 13:55–14:35｜建立可靠的自動化測試

- 從 policy search 與 quote 兩條核心 journey 說明可觀察的商業結果。
- 用 happy、negative、boundary 與高風險 matrix 建立涵蓋地圖。
- 以 `tests/workshop-exercise.spec.ts` 對照 brittle locator／fixed wait 與可靠 pattern。
- 分類 passed、failed、flaky、skipped、slow；說明 retry 後通過才是 Playwright flaky。
- 現場走一次 Report → Trace → DOM/network/console → root cause。
- 14:30 前切到 Lab briefing，不壓縮 hands-on 時間。

### 14:35–15:10｜Playwright Lab

- 0–3 分鐘：smoke baseline、閱讀接受條件；starter 的 TODO failure 是預期結果。
- 3–15 分鐘：建立 Home + Pending 組合篩選與保單明細測試。
- 15–20 分鐘：執行、閱讀錯誤、修正至 1/1 green。
- 20–24 分鐘：2 workers、`repeat-each=3`、`retries=0`，確認 3/3 green。
- 24–32 分鐘：檢視 HTML Report；再用 deterministic failure 練習 Trace 診斷。
- 32–35 分鐘：debrief／緩衝。

**Cut line**：落後時使用 `npm run test:lab:solution`；diagnostics 改由講師開預先產生的 report／trace。

### 15:10–15:30｜Azure DevOps → Playwright Workspaces

1. 開啟預先完成的 Azure Pipeline run，說明 `azure-pipelines.yml` 如何在
   Microsoft-hosted agent 執行相同的 `npm test`。
2. 展示 run summary 的 Tests 頁籤、JUnit 結果與 `playwright-report` artifact；
   強調此 baseline 尚未使用 Azure cloud browser。
3. 對照 hosted-agent Chromium 與 Playwright Workspace 的 execution boundary。
4. 啟動 cloud run：

   ```bash
   npm run test:cloud -- --repeat-each=5 --workers=20
   ```

5. 執行期間對照 client workers / managed browsers，觀察 duration、client resource 與 target load。
6. 直接開啟預先完成的 Azure Portal test run。

Cloud config 使用明確 allowlist，只包含 17 個可靠 tests；`--repeat-each=5` 形成 85 個 test instances。`--workers=20` 是 client-side worker 上限，不代表固定實際併發或效能倍數。正式 Workshop 前應先量測 duration、client capacity、target load、quota 與 test-minute 用量。

**備案順序**：已完成 portal run → 錄影 → screenshots。不要在台上排查 MFA、quota 或 firewall。

### 15:30–15:35｜硬性停損

收斂五項原則：風險導向、核心 journey、可觀察結果、證據診斷、量測後再規模化。

## App Modernization 軌

### 15:45–16:10｜概覽

- Modernization 不等於 big-bang rewrite。
- 每階段都要有 artifact 與 human gate。
- 說明適合 Copilot 的 bounded work，以及不可代替的 business/security decisions。

### 16:10–16:45｜Demo

執行 `app-modernization-demo.md` 的 5/5/12/8/5 分鐘腳本。

**12 分鐘 Apply 超時規則**：

```bash
./scripts/apply-modernized.sh
mvn test
```

切換 verified checkpoint 後繼續說明，不等待 agent 長時間運行。

### 16:45–17:00｜Q&A

引導客戶選出：

- 1–3 個 Playwright PoC flows。
- 1 個 App Modernization candidate application。
- 該 application 的 owner、build/test readiness 與 source access boundary。

## Demo 失敗處理對照表

| 問題 | 處理方式 |
|---|---|
| 學員無法安裝 browser | 與同組操作；使用講師畫面完成 Trace 部分 |
| Portal port 4321 被占用 | 結束已知 process 或修改 `PORT` 與 config；不要使用廣泛 process kill |
| Azure Pipeline 無法啟動 | 使用預先完成的 run 截圖／錄影；不現場處理 agent permission |
| Cloud run 無法連線 | 切換預先完成 portal run / 錄影 |
| Azure login 要求 MFA | 不現場排查，使用備案 |
| Copilot modification 超時 | 套用 modernized checkpoint |
| Maven dependency 無法下載 | 使用課前已下載完成的環境或講師機 |
| AppMod tests 失敗 | 解讀一次 error；未在 3 分鐘內修復即 reset/apply verified checkpoint |

## 課後保留成果

- Lab green run、Azure Pipeline test result 與 failure trace。
- 客戶候選 Playwright flows。
- App Modernization open questions 與 PoC candidate。
