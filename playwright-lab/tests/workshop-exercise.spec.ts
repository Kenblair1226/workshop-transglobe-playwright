import { test, expect } from '@playwright/test';

/**
 * WORKSHOP EXERCISE — 脆弱（但目前會通過）的寫法。
 * ---------------------------------------------------------------
 * 這些測試刻意使用兩種常見的 Playwright 反模式。
 * 它們今天針對這個特定版本的應用程式會通過，但很脆弱：
 * 對 UI 或時機做出微小、完全合理的變更，就會在功能並未
 * 真正損壞的情況下讓它們失敗。
 *
 * 你的任務
 * 1. 閱讀每個測試與解釋為何該模式危險的 "BRITTLE" 註解。
 * 2. 使用更可靠的 locator／等待策略重寫測試。
 * 3. 將你的重寫與 tests/solutions/solution.spec.ts 比較，
 *    後者以建議模式（data-testid / getByRole locator 與
 *    web-first 斷言，而非任意的 timeout）涵蓋相同的兩個情境。
 *
 * 只執行本檔：npm run test:lab
 */
test.describe('workshop exercise: brittle patterns', () => {
  test('reads a premium value using a fragile structural CSS locator', async ({ page }) => {
    await page.goto('/search.html');
    await expect(page.locator('#policy-table-body tr')).toHaveCount(12);

    // BRITTLE：這個 locator 完全依賴該列是 <tbody> 的第 2 個子
    // 元素、且保費是第 5 個 <td>。重新排序資料集、插入欄位
    // 或新增明細列，都會在應用程式並無真正退化的情況下
    // 静默地損壞它。
    // TODO(workshop)：改用語意化 locator，例如
    //   page.getByRole('row', { name: /Brian Osei/ }).getByTestId('policy-premium')
    const premiumCell = page.locator('#policy-table-body tr:nth-child(2) td:nth-child(5)');
    await expect(premiumCell).toHaveText('$112.75');
  });

  test('waits a fixed amount of time instead of the real search response', async ({ page }) => {
    await page.goto('/search.html');
    await expect(page.getByTestId('results-count')).toHaveText(/policies found/);

    await page.getByTestId('search-input').fill('Elena');

    // BRITTLE：這個魔術數字假設 300ms 的 debounce 加上模擬的
    // 200ms 網路延遲總能在 700ms 內完成。在 CI 負載下、較慢的
    // 機器上，或未來 debounce／延遲數值變更時，這就會成為
    // 不穩定（或永久損壞）的測試 — 而且即使 UI 已提早就緒，
    // 也總是至少浪費 700ms。
    // TODO(workshop)：改用 `await page.waitForResponse(...)`
    // 或 web-first 斷言，例如
    //   `await expect(page.getByTestId('results-count')).toHaveText('1 policy found')`
    await page.waitForTimeout(700);

    const resultsText = await page.getByTestId('results-count').textContent();
    expect(resultsText).toBe('1 policy found');
  });
});
