# Playwright Lab

時間：35 分鐘。你會為既有保單入口建立一條新的自動化 journey，執行穩定性驗證，並從 HTML Report／Trace 判讀一個預期失敗。

## Lab 目標

在 `tests/workshop-lab.spec.ts` 完成以下接受條件：

1. 開啟保單搜尋頁並等待初始結果。
2. 組合篩選 Product = `Home`、Status = `Pending`。
3. 確認唯一結果為 `POL-100245`。
4. 開啟保單明細，驗證 coverage 為 `$310000.00`、effective date 為 `2025-09-01`。
5. 關閉明細 modal。

## 0–3 分鐘｜Baseline 與 starter

```bash
cd playwright-lab
npm run test:smoke
npm run test:lab
```

`test:smoke` 應為 green。第一次 `test:lab` 會因 `TODO(workshop)` **預期失敗**；請讀錯誤位置，不要先增加 timeout。

## 3–15 分鐘｜建立自動化測試

可使用的穩健定位線索：

- `product-filter`、`status-filter`、`results-count`。
- 以 `getByRole('row', { name: /POL-100245/ })` 找到目標 row。
- 在 row 內尋找 `View details` button。
- Modal 提供 `modal-policy-number`、`modal-coverage`、`modal-effective-date`。

完成接受條件後，移除 starter 中的 TODO error。

## 15–20 分鐘｜執行與修正

```bash
npm run test:lab
```

成功標準：`1 passed`。若卡住，可比較參考解答：

```bash
npm run test:lab:solution
```

參考檔案：`tests/solutions/workshop-lab-solution.spec.ts`。

## 20–24 分鐘｜穩定性與平行安全

```bash
npm run test:lab:repeat
```

此 script 使用 2 workers、`repeat-each=3`、`retries=0`。成功標準：`3 passed`，不能靠 retry 轉綠。

## 24–32 分鐘｜Report 與 Trace

先檢視剛才的 green report：

```bash
npm run test:report
```

確認 steps、duration 與 project 後按 `Ctrl+C` 關閉 report server，再執行預期失敗：

```bash
npm run test:failure-demo
npm run test:report
```

`test:failure-demo` 的 exit code 1 是預期結果。請在 Report／Trace 回答：

1. 最後成功操作是什麼？
2. Expected `$732.00` 與 received `$695.40` 從何而來？
3. API 是否成功回應？DOM 實際顯示什麼？
4. Root cause 是 application defect，還是 test assumption？

檢視完成後按 `Ctrl+C` 關閉 report server。請使用 npm scripts；直接指定 gated spec 會被預設 `testIgnore` 排除。

## 32–35 分鐘｜完成證據

- [ ] 新增 Home + Pending 核心 journey。
- [ ] 單次執行 1/1 green。
- [ ] 2 workers 重複三次仍為 3/3 green。
- [ ] 已檢視自己的 HTML Report。
- [ ] 能用 Trace 說明 deterministic failure 的 root cause。
