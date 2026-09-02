# 環境準備

建議於 Workshop 前 48 小時完成。

## 共通

- Git 或可解壓縮 workshop package 的工具。
- 可使用 Chromium 的桌面環境。
- 建議解析度 1280×720 以上。

## Playwright Lab

需求：

- Node.js 20 或更新版本。
- npm。

```bash
cd playwright-lab
node --version
npm --version
npm install
npx playwright install chromium
npm run typecheck
npm run test:smoke
```

成功標準：typecheck 通過，smoke tests 全部 passed。

若 Linux 缺少 browser system dependencies：

```bash
npm run install:browsers
```

## Azure DevOps Pipeline

需求：

- Workshop package 已放入 Azure Repos 或 GitHub repository。
- 可在 Azure DevOps project 建立及執行 pipeline。
- Azure Resource Manager service connection `sc-playwright-workspace-wif`
  使用 workload identity federation。
- Pipeline variable `PLAYWRIGHT_WORKSPACE_RESOURCE_ID` 指向目標 Playwright
  Workspace resource ID。

建立 pipeline 時選擇 **Existing Azure Pipelines YAML file**，路徑使用
`/azure-pipelines.yml`。第一次執行後確認：

1. `Type-check Playwright tests` 與 `Run Playwright tests` 都通過。
2. Run summary 的 **Tests** 頁籤有 Playwright JUnit 結果。
3. Artifacts 中可下載 `playwright-report`。
4. `Run tests and upload report to Playwright Workspace` 通過，且 Azure Portal
   中可開啟 cloud report。

第一個 baseline task 的 Chromium 直接執行在 Microsoft-hosted agent；第二個 task
才使用 WIF service connection 與 Playwright Workspace。Pipeline identity 至少需要
subscription `Reader`、Workspace scope 的 `Playwright Workspace Contributor`，以及
linked storage account 的 `Storage Blob Data Contributor`。若 repository 使用 Azure
Repos，PR validation 請在目標 branch 的 Build validation policy 綁定此 pipeline。

## App Modernization Demo

需求：

- JDK 17。
- Maven 3.6.3 或更新版本。

```bash
cd app-modernization-demo
java -version
mvn -version
mvn test
```

成功標準：`BUILD SUCCESS`，11 tests、0 failures。

## Azure App Testing / Playwright Workspaces（僅講師）

1. 建立 Azure App Testing 中的 Playwright Workspace。
2. 完成 storage/reporting 與必要 RBAC。
3. 使用 Microsoft Entra ID 登入：

```bash
az login --tenant <tenant-id>
export PLAYWRIGHT_SERVICE_URL="wss://<workspace-endpoint>"
cd playwright-lab
npm run test:cloud -- --repeat-each=5 --workers=20
```

不要將 workspace URL、token、tenant 或 subscription 資訊寫入 repository。
Cloud config 只允許 17 個可靠 tests；`--repeat-each=5` 形成 85 個 test instances，讓最多 20 個 client workers 有足夠工作量。刻意脆弱案例、Lab starter／solution 與 diagnostics 均不進入 cloud run。

`azure-pipelines.yml` 已使用具 workload identity federation 的 Azure Resource
Manager service connection，在 `AzureCLI@2` task 內解析 Workspace endpoint 並執行
`npm run test:cloud`。Endpoint 與 access token 都不會寫入 repository；一般 CI
baseline 仍不使用這組 Azure 權限。

## 簡報

```bash
xdg-open slides/workshop.html
```

簡報不需要 build；離線時會改用 fallback fonts。
