import { test, expect } from '@playwright/test';

/**
 * SOLUTION — tests/workshop-exercise.spec.ts 的可靠重寫版。
 * ---------------------------------------------------------------
 * 與工作廧練習相同的兩個情境，但改用：
 *  - 限定於特定列的語意化 locator（getByRole / getByTestId），
 *    而非 CSS 結構性（nth-child）選擇器；以及
 *  - 真實的就緒信號（waitForResponse / 內建輪詢的 web-first
 *    斷言），而非任意的 waitForTimeout。
 *
 * 這兩項變更讓測試對重新排序、新增欄位及時機變異
 * （緩慢的 CI 執行器、網路抖動等）具有韌性。
 */
test.describe('workshop solution: reliable patterns', () => {
  test('reads a premium value using a semantic row locator', async ({ page }) => {
    await page.goto('/search.html');

    const row = page.getByRole('row', { name: /Brian Osei/ });
    await expect(row.getByTestId('policy-premium')).toHaveText('$112.75');
  });

  test('waits for the real search response instead of a fixed timeout', async ({ page }) => {
    await page.goto('/search.html');
    await expect(page.getByTestId('results-count')).toHaveText(/policies found/);

    const searchResponse = page.waitForResponse(
      (response) => response.url().includes('/api/policies') && response.url().includes('q=Elena'),
    );
    await page.getByTestId('search-input').fill('Elena');
    await searchResponse;

    // Web-first 斷言：Playwright 會自動重試直到符合（或逾時），
    // 因此即使 DOM 更新比網路回應晚一拍，也不需手動 sleep。
    await expect(page.getByTestId('results-count')).toHaveText('1 policy found');
    await expect(page.getByRole('row', { name: /Elena Petrova/ })).toBeVisible();
  });
});
