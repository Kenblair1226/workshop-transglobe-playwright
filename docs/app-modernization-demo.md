# Java App Modernization Demo 指南

案例：Java 17 / Spring Boot 3.2.4 的保單 REST API。Demo 是 bounded modernization，不是完整 production migration。

## Demo 目標

展示四階段與其可審查產出：

| 階段 | 產出 |
|---|---|
| Assess | `workshop/assessment.md` |
| Plan | `workshop/plan.md` |
| Apply | baseline / modernized source checkpoint |
| Verify | `mvn test`、diff、human gates |

## Demo 前重設

```bash
cd app-modernization-demo
./scripts/reset-baseline.sh
mvn test
```

## 0–5 分鐘｜Assess

開啟 `workshop/assessment.md`，搭配 baseline source 說明：

- Field injection。
- Hard-coded pricing configuration。
- `Map<String, Object>` response。
- Manual validation。
- 分散且弱型別的 error handling。

強調 baseline 可正常建置；Modernization 並非只能從 broken application 開始。

## 5–10 分鐘｜Plan

開啟 `workshop/plan.md`：

- Scope 與 non-goals。
- 受影響 files。
- 每一步的驗證方法。
- Open questions / human gates。
- 約束：不修改 `pom.xml`、不新增外部系統。

## 10–22 分鐘｜Apply

可使用 `workshop/prompts.md` 中的 prompts，在 Copilot 中現場處理一個 bounded task。建議選擇：

1. Externalize pricing configuration；或
2. Field injection 改 constructor injection。

不要現場完成全部六個步驟。

需要快速切換到完成版時：

```bash
./scripts/apply-modernized.sh
```

## 22–30 分鐘｜Verify

```bash
mvn test
```

檢查：

- 11 tests 是否通過。
- Premium formula 是否維持。
- Validation/error response 是否符合 plan。
- 是否出現未規劃的 dependency 或 behavior change。

如果 live modification 失敗，先解讀實際 compiler/test error；時間不足即套用 verified checkpoint，不在台上進行無限修復。

## 30–35 分鐘｜Review 與 Rollback

使用 IDE compare 或：

```bash
diff -ru workshop/checkpoints/baseline/src workshop/checkpoints/modernized/src
```

說明 merge 前仍需：

- API consumer compatibility confirmation。
- Pricing source-of-truth owner approval。
- API error standard review。
- Security / compliance review。

最後展示 rollback：

```bash
./scripts/reset-baseline.sh
mvn test
```

## 安全界線

- 不使用客戶 production code、data 或 secrets。
- 不直接修改 `main` 或自動 merge。
- Copilot 的完成訊息不是驗證證據。
- 未回答重大 open question 時停在 Plan。

