import { test, expect } from '@playwright/test';
import { fillQuoteForm, sampleQuoteRequest } from '../utils/fixtures';

/**
 * DIAGNOSTICS / FAILURE DEMO — 刻意失敗的測試。
 * ---------------------------------------------------------------
 * 此 spec 在 `playwright.config.ts` 中透過
 * `testIgnore: ['**\/diagnostics/**']`（除非 `RUN_FAILURE_DEMO=1`）排除，
 * 並且在執行時也會防禦性地 skip，因此 `npm test` 永遠保持綠燈。
 *
 * 刻意執行它，以看看真正、具確定性的 UI／商業邏輯失敗
 * 在 Playwright 的 trace viewer 與 HTML 報告中的樣貌：
 *
 *   npm run test:failure-demo
 *   npx playwright show-report
 *
 * 下方的失敗不是隨機或不穩定的：它按設計永遠失敗，
 * 因為它斷言的是天真（未折扣）的年繳保費，而非報價引擎
 * 實際回傳的 5% 折扣後數字。這提供了穩定、可重現的產物集
 * （trace.zip、截圖、影片），用來教導如何閱讀 Playwright 失敗。
 */
test.describe('diagnostics: failure demo', () => {
  test.skip(process.env.RUN_FAILURE_DEMO !== '1', 'Set RUN_FAILURE_DEMO=1 to run this diagnostic demo.');

  test('quote annual premium matches a naive (undiscounted) expectation', async ({ page }) => {
    await page.goto('/quote.html');
    await fillQuoteForm(page, sampleQuoteRequest);
    await page.getByTestId('get-quote-btn').click();

    await expect(page.getByTestId('quote-result')).toBeVisible();

    const monthlyText = await page.getByTestId('quote-monthly').textContent();
    const monthly = Number((monthlyText ?? '').replace('$', ''));
    const naiveAnnual = `$${(monthly * 12).toFixed(2)}`;

    // 這裡刻意忽略 server/quote.js 套用的 5% 年繳折扣，
    // 因此會永遠失敗（61 * 12 = $732.00 vs. 實際折扣後的
    // $695.40）。這個不一致正是重點。
    await expect(page.getByTestId('quote-annual')).toHaveText(naiveAnnual);
  });
});
