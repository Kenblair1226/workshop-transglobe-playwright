import { test, expect } from '@playwright/test';

/**
 * WORKSHOP LAB — 為結合保單篩選的旅程建立測試覆蓋。
 *
 * 驗收條件：
 * 1. 開啟保單查詢頁並等待初始結果。
 * 2. 篩選狀態為 Pending 的 Home 保單。
 * 3. 驗證 POL-100245 是唯一的結果。
 * 4. 開啟其明細並驗證保額 $310000.00 與生效日期 2025-09-01。
 * 5. 關閉明細對話框。
 */
test('finds the pending Home policy and verifies its coverage details', async ({ page }) => {
  await page.goto('/search.html');
  await expect(page.getByTestId('results-count')).toHaveText(/policies found/);

  // TODO(workshop)：依上方驗收條件實作，然後移除此錯誤。
  throw new Error('TODO(workshop)：實作 pending Home 保單的旅程');
});