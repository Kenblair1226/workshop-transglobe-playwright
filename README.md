# Playwright & App Modernization Workshop

13:30–17:00 半日 Workshop package，包含兩個彼此獨立的主題：

1. **Playwright**：可靠的 E2E 測試、問題診斷、Hands-on Lab、Azure Pipelines 與 Playwright Workspaces。
2. **GitHub Copilot App Modernization**：Java / Spring Boot 的 Assess → Plan → Apply → Verify Demo。

## 目錄

```text
.
├── azure-pipelines.yml      # Azure DevOps hosted-agent Playwright CI
├── playwright-lab/          # Node.js 保險入口網站與 Playwright Lab
├── app-modernization-demo/ # Java 17 / Spring Boot 保單 API
├── docs/                    # Agenda、學員指南、講師手冊
└── slides/workshop.html    # 32 張 HTML 簡報
```

## 快速開始

### 開啟簡報

```bash
xdg-open slides/workshop.html
```

使用方向鍵、Space、Page Up / Page Down、滑鼠滾輪或觸控滑動換頁。

### Playwright Lab

```bash
cd playwright-lab
npm install
npx playwright install chromium
npm test
```

### Azure DevOps CI

將 repository 放入 Azure Repos 或 GitHub 後，在 Azure DevOps 建立 pipeline，並選擇根目錄的
`azure-pipelines.yml`。Pipeline 會在 Microsoft-hosted Ubuntu agent 上執行同一套
Playwright tests，將 JUnit 結果顯示在 **Tests** 頁籤並保留 HTML report。接著
`AzureCLI@2` 會使用 WIF service connection 將可靠測試跑在 Playwright Workspace；
Azure reporter 會自動上傳 cloud report，供 Azure Portal 集中查看。

### App Modernization Demo

```bash
cd app-modernization-demo
mvn test
./scripts/apply-modernized.sh
mvn test
./scripts/reset-baseline.sh
```

## 文件入口

- [Workshop Agenda](docs/agenda.md)
- [環境準備](docs/setup.md)
- [Playwright 學員 Lab](docs/participant-lab.md)
- [App Modernization Demo Guide](docs/app-modernization-demo.md)
- [講師手冊](docs/instructor-runbook.md)

## 建議使用方式

- 課前 48 小時完成 `docs/setup.md` 的環境檢查。
- Playwright Lab 只安裝 Chromium，避免現場大量下載；Azure Pipeline 也使用相同 browser profile。
- 先用 Azure Pipeline 建立可追溯的 CI baseline，再切換 Playwright Workspaces 展示雲端 browser 規模化。
- App Modernization 現場只做一個 bounded change；完整結果使用 checkpoint 展示。
- Playwright Workspaces 與 App Modernization Demo 都準備預錄或完成版備案。
